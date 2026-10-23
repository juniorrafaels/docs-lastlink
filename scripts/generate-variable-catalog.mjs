import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tick = '`';
const fieldPattern = /^[A-Za-z_][\w]*(?:\[\])?(?:\.[A-Za-z_][\w]*(?:\[\])?)*$/;
const pendingPattern = /a confirmar|em prepara[çc][ãa]o|n[ãa]o documentad[oa]/i;

function cells(line) {
  // Keep pipes inside inline code, such as `string | null`, in the same cell.
  const result = [];
  let cell = '';
  let code = false;
  for (let i = 1; i < line.length - 1; i++) {
    const char = line[i];
    if (char === tick) code = !code;
    if (char === '|' && !code && line[i - 1] !== '\\') {
      result.push(cell.trim());
      cell = '';
    } else cell += char;
  }
  result.push(cell.trim());
  return result;
}

function observedType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function collectVariables(documents) {
  const fields = new Map();
  const events = [];
  for (const {file, text} of documents) {
    const jsonBlocks = [...text.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
    const payloads = jsonBlocks.map((match, index) => {
      try { return JSON.parse(match[1]); }
      catch (error) { throw new Error(`${file}: JSON inválido no exemplo ${index + 1}: ${error.message}`); }
    }).filter(value => value && typeof value.Event === 'string');
    const codes = [...new Set(payloads.map(payload => payload.Event))];
    if (codes.length !== 1) throw new Error(`${file}: informe exemplos completos de um único evento por artigo.`);
    const event = {
      code: codes[0],
      title: text.match(/^title:\s*(.+)$/m)?.[1]?.trim() || codes[0],
      file,
    };
    events.push(event);
    const entries = new Map();
    function getEntry(field) {
      if (!entries.has(field)) entries.set(field, {field, event, types: new Set(), examples: new Set()});
      return entries.get(field);
    }
    const prose = text.replace(/```[\s\S]*?```/g, '');
    let fieldTable = false;
    for (const line of prose.split(/\r?\n/)) {
      if (!line.startsWith('|') || !line.trimEnd().endsWith('|')) {
        fieldTable = false;
        continue;
      }
      const row = cells(line.trimEnd());
      if (row[0] === 'Campo') fieldTable = row[1] === 'Tipo';
      if (!fieldTable) continue;
      const field = row[0]?.match(/^`([^`]+)`$/)?.[1];
      if (!field || !fieldPattern.test(field) || row.length < 3) continue;
      const entry = getEntry(field);
      entry.type = row[1];
      // The abandoned-cart UTM table also has a URL-parameter column.
      entry.description = row.at(-1);
    }
    function visit(value, field) {
      const entry = getEntry(field);
      entry.types.add(observedType(value));
      if (value === null || typeof value !== 'object') entry.examples.add(JSON.stringify(value));
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            for (const [key, child] of Object.entries(item)) visit(child, `${field}[].${key}`);
          }
        }
      } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) visit(child, `${field}.${key}`);
      }
    }
    for (const payload of payloads) for (const [key, value] of Object.entries(payload)) visit(value, key);
    for (const entry of entries.values()) {
      entry.pending = !entry.description || !entry.type || pendingPattern.test(`${entry.description} ${entry.type}`);
      if (!fields.has(entry.field)) fields.set(entry.field, []);
      fields.get(entry.field).push(entry);
    }
  }
  return {fields, events};
}

const groups = [
  ['Campos principais', field => !field.includes('.')],
  ['Produtos', field => field.startsWith('Data.Products')],
  ['Comprador e endereço', field => field.startsWith('Data.Buyer')],
  ['Vendedor', field => field.startsWith('Data.Seller')],
  ['Comissões', field => field.startsWith('Data.Commissions')],
  ['Compra e pagamento', field => field.startsWith('Data.Purchase')],
  ['Assinaturas', field => field.startsWith('Data.Subscriptions')],
  ['Oferta', field => field.startsWith('Data.Offer')],
  ['Rastreamento', field => field.startsWith('Data.Utm')],
  ['Dispositivo', field => field.startsWith('Data.DeviceInfo')],
  ['Outros campos', () => true],
];

const link = event => event.file ? `[${event.title}](./eventos/${event.file})` : `${event.title} (em preparação)`;
const unique = values => [...new Set(values)];
const safeCell = text => text.replace(/\|/g, '&#124;').replace(/\r?\n/g, ' ');

function valuesFor(field, entries, rules) {
  const pending = entries.filter(entry => entry.pending);
  if (pending.length === entries.length) return '**a confirmar**';
  let result = rules[field]?.values;
  if (!result && field === 'Event') result = entries.map(entry => `${tick}${entry.event.code}${tick} = ${entry.event.title}`).join('; ') + '.';
  if (!result && entries.some(entry => entry.type?.includes('boolean'))) result = '`true` ou `false`.';
  if (!result) {
    const examples = unique(entries.flatMap(entry => [...entry.examples])).slice(0, 1);
    result = examples.length
      ? `Exemplo observado: ${tick}${examples[0]}${tick}. Não define uma lista fechada de valores.`
      : entries.some(entry => /object|array/.test(entry.type || ''))
        ? 'Estrutura descrita pelos campos filhos; consulte as regras do evento.'
        : 'Valores ou limites não especificados na documentação.';
  }
  const inherited = ['Data.Buyer.Address', 'Data.Purchase.Pix', 'Data.Purchase.BankSlip', 'Data.Purchase.SmartInstallment']
    .find(parent => field.startsWith(parent + '.'));
  const condition = rules[field]?.conditions || (inherited && rules[inherited]?.conditions);
  if (condition) result += ' ' + condition;
  if (pending.length) result += ' **a confirmar** em: ' + pending.map(entry => link(entry.event)).join(', ') + '.';
  return result;
}

export function renderCatalog(catalog, rules = {}) {
  const {fields, events} = catalog;
  const pending = [...fields.values()].flat().filter(entry => entry.pending);
  let output = `---
title: Catálogo de variáveis
description: Campos dos webhooks Lastlink, tipos, valores, condições e eventos em que aparecem.
---

{/* Gerado por scripts/generate-variable-catalog.mjs. Edite os artigos dos eventos e scripts/catalog-rules.json. */}

# Catálogo de variáveis

Consulte os **${fields.size} campos do payload JSON** identificados nos **${events.length} eventos registrados**, incluindo objetos, listas e campos internos. Cada linha informa o caminho completo, o tipo, a descrição, os valores ou condições conhecidos e os eventos em que o campo foi identificado. Os headers de recebimento são apresentados na seção de requisição HTTP.

## Como consultar

- A notação ${tick}[]${tick} indica cada item de uma lista. Por exemplo, ${tick}Data.Products[].Id${tick} é o identificador de cada produto.
- Os nomes respeitam maiúsculas e minúsculas; ${tick}Data.DeviceInfo.ip${tick} usa ${tick}ip${tick} em minúsculas.
- Os eventos são identificados a partir das tabelas de campos e dos exemplos completos dos artigos. A lista representa o que já está documentado ou observado, sem definir a disponibilidade em eventos ainda não descritos.
- Valores enumerados e limites são apresentados quando já definidos. **Exemplos observados não constituem listas de valores permitidos.**
- Um campo sem descrição ou com definição pendente aparece como **a confirmar**, com o evento correspondente. Se faltar a definição em apenas um evento, a pendência também é indicada.
- Os dados de formulário em ${tick}Buyer${tick} seguem as [regras de preenchimento no checkout](./webhooks.md#dados-do-comprador-no-checkout). Listar um campo não o torna obrigatório.

## Eventos incluídos

| Evento | Valor de ${tick}Event${tick} |
| --- | --- |
${events.map(event => `| ${link(event)} | ${tick}${event.code}${tick} |`).join('\n')}

## Campos a confirmar

`;
  if (pending.length) {
    output += '| Campo | Evento | Pendência |\n| --- | --- | --- |\n';
    for (const entry of pending) output += `| ${tick}${entry.field}${tick} | ${link(entry.event)} | ${safeCell(entry.reason || '**a confirmar** — definição ausente ou incompleta no artigo.')} |\n`;
  } else output += 'Nenhum campo sem descrição foi identificado nas tabelas e nos exemplos atuais. Novas variáveis sem definição serão listadas aqui como **a confirmar**.\n';
  if (rules._http) {
    output += '\n## Requisição HTTP\n\n';
    output += 'Regra geral dos webhooks: método **' + safeCell(rules._http.method) + '**, com corpo **' + safeCell(rules._http.body) + '**. Consulte as [regras de envio HTTP e validação do token](./regras.md#envio-http).\n\n';
    output += 'Os headers abaixo correspondem ao exemplo de recebimento. Seus valores ilustrativos não são constantes; a lista não define obrigatoriedade para todos os headers auxiliares em todos os disparos. O token é disponibilizado na tela de integração e enviado em `x-lastlink-token`.\n\n';
    output += '| Header | Tipo | Exemplo | Descrição |\n| --- | --- | --- | --- |\n';
    for (const header of rules._http.headers) {
      output += '| ' + [tick + header.name + tick, tick + 'string' + tick, tick + header.example + tick, header.description].map(safeCell).join(' | ') + ' |\n';
    }
  }
  const remaining = new Map(fields);
  for (const [title, matches] of groups) {
    const rows = [...remaining].filter(([field]) => matches(field));
    if (!rows.length) continue;
    output += `\n## ${title}\n\n| Campo | Tipo | Descrição | Valores e condições | Eventos |\n| --- | --- | --- | --- | --- |\n`;
    for (const [field, entries] of rows) {
      remaining.delete(field);
      const defined = entries.filter(entry => !entry.pending);
      const types = unique(defined.map(entry => entry.type));
      const observedTypes = unique(entries.flatMap(entry => [...entry.types]));
      const type = types.join(' ou ') || (observedTypes.length ? 'Observado: ' + observedTypes.map(type => tick + type + tick).join(', ') : '**a confirmar**');
      const description = defined.length ? (rules[field]?.description || defined.at(-1).description) : '**a confirmar**';
      output += '| ' + [tick + field + tick, type, description, valuesFor(field, entries, rules), entries.map(entry => link(entry.event)).join(', ')].map(safeCell).join(' | ') + ' |\n';
    }
  }
  output += `
## Regras de interpretação

- ${tick}Purchase_Request_Confirmed${tick} informa a geração da fatura; ${tick}Purchase_Order_Confirmed${tick} informa a compra completa após o pagamento.
- Em Carrinho Abandonado, o payload atual não inclui preço nem método de pagamento.
- Em Compra Completa, ${tick}NextBilling${tick} é ${tick}null${tick} quando ${tick}Recurrency${tick} é ${tick}0${tick}.
- ${tick}Payment.NumberOfInstallments${tick} e ${tick}SmartInstallment.TotalInstallments${tick} descrevem parcelamentos distintos; consulte os artigos dos eventos.
- As UTMs se referem ao contexto do evento: abandono, geração da fatura ou pagamento aprovado.
- Os preços e as comissões dos exemplos de teste são fictícios.

`;
  return output;
}

function eventFiles(directory, prefix = '') {
  return fs.readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) return eventFiles(path.join(directory, entry.name), relative + '/');
    return /\.mdx?$/.test(entry.name) ? [relative] : [];
  });
}

export function includePendingFields(catalog, records) {
  for (const record of records) {
    const event = catalog.events.find(event => event.code === record.code) || {code: record.code, title: record.title, file: null};
    if (!catalog.events.includes(event)) catalog.events.push(event);
    for (const item of record.fields) {
      const pending = !item.description || !item.type || pendingPattern.test(`${item.description} ${item.type}`);
      const entry = {...item, event, pending, types: new Set(item.observedType ? [item.observedType] : []), examples: new Set((item.examples || []).map(value => JSON.stringify(value)))};
      if (!catalog.fields.has(item.field)) catalog.fields.set(item.field, []);
      const entries = catalog.fields.get(item.field);
      const previous = entries.findIndex(entry => entry.event.code === event.code);
      if (previous >= 0) entries[previous] = entry;
      else entries.push(entry);
    }
  }
  return catalog;
}

export function resolveEventDefinitions(catalog, rules) {
  for (const [field, entries] of catalog.fields) {
    for (const entry of entries) {
      const definition = rules[field]?.eventDefinitions?.[entry.event.code];
      if (!entry.pending || !definition?.source || !definition.type || !definition.description) continue;
      if (pendingPattern.test(`${definition.type} ${definition.description}`)) continue;
      entry.type = definition.type;
      entry.description = definition.description;
      entry.source = definition.source;
      entry.pending = false;
    }
  }
  return catalog;
}

export function generateCatalog(root = projectRoot) {
  const directory = path.join(root, 'docs/eventos');
  const documents = eventFiles(directory).map(file => ({file, text: fs.readFileSync(path.join(directory, file), 'utf8')}));
  const catalog = collectVariables(documents);
  const pendingFile = path.join(root, 'scripts/catalog-pending.json');
  if (fs.existsSync(pendingFile)) includePendingFields(catalog, JSON.parse(fs.readFileSync(pendingFile, 'utf8')));
  const rules = JSON.parse(fs.readFileSync(path.join(root, 'scripts/catalog-rules.json'), 'utf8'));
  resolveEventDefinitions(catalog, rules);
  const result = renderCatalog(catalog, rules);
  const target = path.join(root, 'docs/catalogo-de-variaveis.md');
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== result) fs.writeFileSync(target, result, 'utf8');
  const pendingCount = [...catalog.fields.values()].flat().filter(entry => entry.pending).length;
  console.log(`Catálogo: ${catalog.fields.size} campos, ${catalog.events.length} eventos, ${pendingCount} definições a confirmar.`);
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generateCatalog();
