import test from 'node:test';
import assert from 'node:assert/strict';
import {collectVariables, includePendingFields, renderCatalog, resolveEventDefinitions} from './generate-variable-catalog.mjs';

function article(title, event, payload, table = '') {
  return {
    file: title + '.mdx',
    text: `---\ntitle: ${title}\n---\n\n${table}\n\n\`\`\`json\n${JSON.stringify({Event: event, ...payload})}\n\`\`\`\n`,
  };
}

test('unknown fields inside arrays and new root fields stay visible as pending', () => {
  const catalog = collectVariables([article('Novo evento', 'New_Event', {
    ExtraRoot: 'new', Data: {Items: [{Untranslated: 42}]},
  })]);
  assert.ok(catalog.fields.get('ExtraRoot')[0].pending);
  assert.ok(catalog.fields.get('Data.Items[].Untranslated')[0].pending);
  const page = renderCatalog(catalog, {'Data.Items[].Untranslated': {description: 'Override cannot hide missing event documentation.'}});
  assert.match(page, /\| `Data.Items\[\]\.Untranslated` \| Observado: `number` \| \*\*a confirmar\*\*/);
  assert.match(page, /\[Novo evento\]\(\.\/eventos\/Novo evento\.mdx\)/);
});

test('a known field in one event remains pending in another until described there', () => {
  const table = '| Campo | Tipo | Descrição |\n| --- | --- | --- |\n| `Data.Reference` | `string` | Referência confirmada. |';
  const documented = article('Evento A', 'Event_A', {Data: {Reference: 'abc'}}, table);
  const missing = article('Evento B', 'Event_B', {Data: {Reference: 'def'}});
  const catalog = collectVariables([documented, missing]);
  assert.deepEqual(catalog.fields.get('Data.Reference').map(entry => entry.pending), [false, true]);
  assert.match(renderCatalog(catalog), /\*\*a confirmar\*\* em: \[Evento B\]/);
  const resolved = collectVariables([documented, {...missing, text: missing.text + '\n' + table}]);
  assert.ok(resolved.fields.get('Data.Reference').every(entry => !entry.pending));
});

test('field tables with extra columns and union types exclude enum rows', () => {
  const table = '| Campo | Tipo | Parâmetro | Descrição |\n| --- | --- | --- | --- |\n| `Data.Utm.UtmSource` | `string` | `utm_source` | Origem confirmada. |\n| `ExtraRoot` | `string | null` | — | Campo confirmado. |\n\n| Valor | Descrição |\n| --- | --- |\n| `MARKETPLACE` | Lastlink. |';
  const catalog = collectVariables([article('Evento', 'Event', {Data: {Utm: {UtmSource: 'blog'}}, ExtraRoot: null}, table)]);
  assert.equal(catalog.fields.get('Data.Utm.UtmSource')[0].description, 'Origem confirmada.');
  assert.equal(catalog.fields.get('ExtraRoot')[0].type, '`string | null`');
  assert.equal(catalog.fields.get('ExtraRoot')[0].pending, false);
  assert.equal(catalog.fields.has('MARKETPLACE'), false);
  assert.match(renderCatalog(catalog), /Exemplo observado: `"blog"`\. Não define uma lista fechada/);
});

test('invalid JSON reports the source document instead of silently omitting fields', () => {
  assert.throws(() => collectVariables([{file: 'broken.mdx', text: '```json\n{"Event":}\n```'}]), /broken\.mdx: JSON inválido/);
});

test('pending fields can be recorded before an event article exists', () => {
  const catalog = includePendingFields({fields: new Map(), events: []}, [{
    code: 'Pending_Event', title: 'Evento pendente',
    fields: [{field: 'Data.NewDate', observedType: 'string', reason: 'a confirmar — significado da data.'}],
  }]);
  assert.equal(catalog.events.length, 1);
  assert.equal(catalog.fields.get('Data.NewDate')[0].pending, true);
  const page = renderCatalog(catalog);
  assert.match(page, /Evento pendente \(em preparação\)/);
  assert.match(page, /a confirmar — significado da data/);
  assert.ok(!page.includes('eventos/null'));
});

test('confirmed external definitions resolve only the explicitly documented event and field', () => {
  const catalog = collectVariables([
    article('Evento A', 'Event_A', {Data: {TestDate: 'example', Unknown: 1}}),
    article('Evento B', 'Event_B', {Data: {TestDate: 'example'}}),
  ]);
  resolveEventDefinitions(catalog, {
    'Data.TestDate': {eventDefinitions: {
      Event_A: {type: '`string`', description: 'Exclusivo do exemplo de teste.', source: 'docs/debitos-tecnicos.md#bug-001'},
    }},
  });
  assert.deepEqual(catalog.fields.get('Data.TestDate').map(entry => entry.pending), [false, true]);
  assert.equal(catalog.fields.get('Data.Unknown')[0].pending, true);
});
