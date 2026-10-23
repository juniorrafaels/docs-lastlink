# Instruções do projeto

Leia este arquivo antes de iniciar qualquer tarefa neste projeto. Estas instruções se aplicam à documentação da API e dos webhooks da Lastlink em toda esta pasta.

## Esclarecer dúvidas antes de prosseguir

Antes de criar ou alterar a documentação, compare o material recebido com os artigos existentes e com as definições já confirmadas pelo usuário.

Quando a lista de explicações enviada for genérica e incluir campos que não são utilizados nem aparecem nos payloads do evento, ignore esses campos no artigo. Não copie campos de outros eventos para o contrato do evento atual. Campos presentes nos payloads e ainda sem definição continuam sujeitos ao esclarecimento abaixo.

**Pergunte ao usuário e aguarde a resposta antes de prosseguir com a documentação solicitada** quando:

- Houver um campo que o usuário não explicou ou não "traduziu", inclusive em objetos aninhados e listas.
- Você não souber o significado de um campo, valor, código, condição de envio ou regra de negócio.
- Uma explicação, exemplo, nome de campo, tipo ou valor estiver incoerente com o material recebido ou com o que foi documentado ou confirmado anteriormente.
- Houver divergência entre exemplos e explicações, ou entre exemplos do mesmo evento.

Não deduza o significado apenas pelo nome do campo, não invente definições e não corrija ou normalize exemplos silenciosamente. Uma observação de dúvida no artigo não substitui a confirmação do usuário.

Ao perguntar, identifique o evento, o caminho completo do campo (por exemplo, `Data.Purchase.Payment.PaymentMethod`) e a dúvida ou divergência concreta. Agrupe as dúvidas identificadas para facilitar a resposta.

Após a confirmação, aplique a definição informada à documentação e atualize os artigos anteriores afetados, mantendo consistência entre os eventos.

## Regras gerais dos webhooks

- Mantenha as regras gerais confirmadas em `docs/regras.md`, com exemplos quando ajudarem a explicar o comportamento.
- Ao alterar uma regra geral, mantenha os artigos afetados e o catálogo de variáveis consistentes com a definição confirmada.
- `Data.Purchase.SmartInstallment` é condicional: só é enviado quando `Data.Purchase.IsSmartInstallment` é `true`. Com `false`, o objeto não é enviado. Os campos internos devem ser acessados considerando que o objeto pode estar ausente.

## Catálogo de variáveis

Mantenha a página `docs/catalogo-de-variaveis.md` atualizada em toda inclusão ou alteração de eventos, payloads, campos ou valores possíveis.

- A página é gerada pelas tabelas de campos e pelos exemplos JSON completos em `docs/eventos/`, usando `npm run docs:catalog`. Não edite o arquivo gerado diretamente.
- Execute o comando após alterar os artigos, inclusive durante uma sessão de desenvolvimento aberta. Ele também roda automaticamente antes de `npm start` e `npm run build`.
- Todo campo, inclusive objetos, listas e campos aninhados, deve constar no catálogo com seu caminho completo, tipo, significado, valores ou condições conhecidos e os eventos correspondentes.
- Se uma variável não estiver documentada, registre-a como **a confirmar** no catálogo. A geração detecta automaticamente campos presentes nos exemplos completos que não têm descrição na tabela do respectivo evento.
- Ao encontrar uma variável nova ainda sem definição, registre-a no material do evento com a descrição **a confirmar** e regenere o catálogo antes de pedir os esclarecimentos. Isso é uma exceção limitada à regra de aguardar: apenas o registro da pendência pode ser feito antes da resposta; não publique definições por suposição.
- Se o artigo do evento ainda não puder ser criado por depender de esclarecimentos, registre apenas os campos pendentes e o contexto em `scripts/catalog-pending.json`. O catálogo os exibirá com o evento em preparação, sem exigir um artigo incompleto. Remova esse registro após incorporar as definições confirmadas ao artigo.
- Uma definição existente em outro evento não resolve automaticamente uma pendência no evento novo. Mantenha o contexto e os eventos de ocorrência explícitos.
- Registre enums, limites e condições confirmados em `scripts/catalog-rules.json`, além dos artigos afetados. Um valor encontrado em um exemplo não deve ser tratado como uma enumeração completa de valores permitidos.
- Após o esclarecimento do usuário, atualize a tabela do evento e as regras aplicáveis, regenere o catálogo e confirme que a pendência foi resolvida.

## Registro de bugs e débitos técnicos

- Centralize os bugs confirmados em `docs/debitos-tecnicos.md`, usando identificadores sequenciais e permanentes (`BUG-001`, `BUG-002` etc.).
- Registre o evento e o campo afetados, o comportamento atual e esperado, o escopo confirmado (teste ou real), as evidências, os critérios de validação e o status da correção.
- Não trate o registro de um bug como uma correção implementada. Mantenha o status **Aberto** até existir evidência da correção.
- Mantenha os detalhes, avisos e identificadores de bugs somente na página de Débitos técnicos. Os artigos dos eventos devem seguir o padrão técnico, sem avisos de bugs. Preserve os exemplos recebidos e registre as evidências e os links dos eventos na página de Débitos técnicos.
- Quando o usuário confirmar a causa de uma pendência como bug, documente o comportamento confirmado e retire a pendência de definição do catálogo. O bug deve continuar visível como aberto em Débitos técnicos.
- Campos exclusivos dos exemplos de teste, sem função no evento real, podem ter a definição confirmada registrada em `scripts/catalog-rules.json`, em `eventDefinitions` por evento, com tipo, descrição e `source` apontando ao registro de Débitos técnicos. Isso permite mantê-los no catálogo sem transformá-los em campos do contrato real ou deixar uma pendência já esclarecida.

## Validação e servidor local

- Use `npm run build` para validar a produção. O script separa os arquivos intermediários em `.docusaurus-build/`; o servidor de desenvolvimento utiliza `.docusaurus/`.
- Não execute `docusaurus build` diretamente enquanto o servidor local estiver ativo, pois os dois processos podem sobrescrever os mesmos arquivos gerados.
- Antes de limpar caches com `npm run clear`, encerre somente o servidor de desenvolvimento deste projeto. Reinicie-o e confira que a URL local retorna o HTML do site, além de validar os arquivos JavaScript carregados.
