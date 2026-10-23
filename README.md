# Documentação da API Lastlink

Projeto criado com Docusaurus e TypeScript, configurado em português do Brasil.

## Requisitos

- Node.js 20 ou superior.
- npm.

## Instalar dependências

```powershell
npm install
```

## Executar localmente

```powershell
npm start
```

Acesse http://localhost:3000. As alterações na documentação são atualizadas automaticamente.

## Editar a documentação

- `docs/`: páginas Markdown e MDX, incluindo introdução, endpoints e webhooks.
- `sidebars.ts`: navegação lateral gerada a partir da pasta `docs/`.
- `docusaurus.config.ts`: título, idioma, navegação e domínio de publicação.
- `src/css/custom.css`: estilos do site.

A documentação é servida diretamente na raiz `/`. A introdução e a página de endpoints estão reservadas para preenchimento posterior. Os eventos de webhooks ficam em `docs/eventos/`.

## Catálogo de variáveis

`docs/catalogo-de-variaveis.md` reúne os campos descritos nas tabelas dos eventos e os campos encontrados nos exemplos JSON completos. Variáveis sem descrição no evento correspondente aparecem como **a confirmar**.

O catálogo é gerado automaticamente antes de iniciar o site ou fazer o build. Para atualizá-lo durante uma sessão de desenvolvimento aberta, execute:

```powershell
npm run docs:catalog
```

Edite as definições nas tabelas dos artigos em `docs/eventos/` e os valores permitidos e condições confirmados em `scripts/catalog-rules.json`. Não edite diretamente o catálogo gerado. Exemplos de valores não são tratados como listas fechadas de valores permitidos.

As definições confirmadas de campos exclusivos de exemplos de teste podem ser registradas em `eventDefinitions`, por evento, com a referência `source` ao registro em Débitos técnicos. Os artigos dos eventos permanecem sem avisos de bugs.

Para validar a detecção de variáveis pendentes:

```powershell
npm run docs:catalog:test
```

## Validar e gerar a versão de produção

```powershell
npm run typecheck
npm run build
npm run serve
```

O build é gerado na pasta `build/`. Antes de publicar, ajuste `url` e, se necessário, `baseUrl` em `docusaurus.config.ts`.

`npm run build` usa `.docusaurus-build/` para os arquivos intermediários de produção. O servidor de desenvolvimento usa `.docusaurus/`, permitindo validar o build enquanto o site local está aberto.

Se o servidor local apresentar erro de template ou cache, encerre o processo desse servidor antes de executar `npm run clear` e iniciar novamente com `npm start`.

O projeto utiliza Webpack. O uso de Rspack foi desativado após a falha de template registrada no [BUG-002](docs/debitos-tecnicos.md#bug-002).
