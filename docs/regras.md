---
title: Regras
description: Regras gerais de envio e presença de campos nos webhooks Lastlink.
---

# Regras

Esta página reúne as regras gerais dos webhooks da Lastlink. Novas regras serão adicionadas conforme forem definidas.

## Envio HTTP

Os webhooks da Lastlink são enviados por requisições **HTTP `POST`**, com o payload do evento no corpo em **JSON**.

### Exemplo de requisição e headers

O trecho abaixo apresenta o método, o caminho e os headers do exemplo de recebimento. O token foi substituído pelo marcador `SEU_TOKEN_DA_INTEGRACAO`.

```http
POST /
accept: application/json
accept-encoding: gzip, br
content-length: 437
content-type: application/json; charset=utf-8
sentry-trace: 63ffad6d261917f008d33947dccd53cc-346ef3878777f45c-1
traceparent: 00-63ffad6d261917f008d33947dccd53cc-346ef3878777f45c-01
x-forwarded-for: 100.49.145.48
x-forwarded-proto: https
x-lastlink-token: SEU_TOKEN_DA_INTEGRACAO
```

`/` é o caminho apresentado no exemplo. O webhook deve ser recebido na rota correspondente à URL configurada para a integração.

Os valores acima ilustram uma requisição recebida. `content-length` indica o tamanho do corpo em bytes e varia conforme o payload; `437` não é um valor fixo. A lista observada não estabelece que todos os headers auxiliares estarão presentes em todos os disparos.

### Token da integração

O header **`x-lastlink-token`** contém o token que a plataforma disponibiliza na **tela de integração**. A Lastlink envia esse token no header dos webhooks.

A aplicação que recebe o webhook pode usar esse token como um **secret** para validar as chamadas:

1. Armazene no servidor o token disponibilizado pela Lastlink para a integração.
2. Leia o valor do header `x-lastlink-token` da requisição recebida.
3. Compare o valor recebido com o token armazenado antes de processar o evento. Ao adotar essa validação, rejeite chamadas com token ausente ou diferente.

No exemplo, substitua `SEU_TOKEN_DA_INTEGRACAO` pelo token disponibilizado na plataforma.

## Distribuição dos eventos

Um evento é distribuído para um webhook quando as três condições são atendidas:

1. O webhook está **ativo**.
2. A integração está **inscrita no evento**.
3. O webhook está ligado a **um dos produtos envolvidos no evento**.

Order bump e bundle também entram como produtos para essa seleção. Considere a lista `Data.Products` nos eventos que a utilizam e o objeto singular `Data.Product` nos eventos de acesso.

## Timeout e retentativas de entrega

O timeout de cada envio HTTP é de **10 segundos**. Uma resposta `2xx` confirma o recebimento; respostas fora de `2xx`, timeout ou falha de conexão caracterizam falha de entrega.

Após falhas, os intervalos entre as tentativas são **1, 5, 10, 30, 60, 120 e 240 minutos**. Depois, o intervalo permanece em **240 minutos**, até o término do prazo de retenção configurado no ambiente.

O prazo de retenção depende da configuração do cluster. Esses intervalos não estabelecem um número fixo de tentativas nem uma duração universal de 24 ou 28 horas.

### Preparação do payload e entrega HTTP

Em `Purchase_Request_Confirmed` com Pix ou boleto, a plataforma aguarda o QR Code ou a linha digitável por até **10 tentativas** antes do envio. Sem esses dados ao final das tentativas, o evento é descartado.

Essa preparação é diferente de reenviar um POST que falhou: as dez tentativas não são o limite de retentativas HTTP.

## Leitura do payload

O corpo do webhook contém o envelope `Id`, `IsTest`, `Event` e `CreatedAt`, além de `Data`, onde ficam os dados da operação. Os caminhos das tabelas dos artigos indicam a posição completa de cada campo; por exemplo, `Data.AccessType` está dentro de `Data`, enquanto `CreatedAt` está no envelope.

Use `Event` para selecionar o formato antes de ler os objetos. Os eventos de acesso não têm a mesma estrutura dos eventos de pagamento: `Data.Product` é um objeto único, enquanto `Data.Products` é uma lista. Da mesma forma, `Data.Subscription` é um objeto único e `Data.Subscriptions` é uma lista.

Percorra as listas e relacione os itens por identificador. Um exemplo com um único item não limita o tamanho da lista, e a posição de uma comissão não substitui o papel informado em `Data.Commissions[].Source`.

Verifique a presença dos campos condicionais antes de utilizá-los. Chave ausente, `null`, texto vazio, lista vazia e objeto vazio são representações diferentes; não transforme uma delas em outra sem considerar a definição do campo no evento. Campos adicionais podem ser preservados ou ignorados pelo leitor sem impedir o tratamento das propriedades conhecidas.

## Identificadores e correlação

| Identificador | O que identifica | Uso na integração |
| --- | --- | --- |
| `Id` | O webhook. | Registrar o evento recebido. Não confundir com o identificador do pagamento ou da assinatura. |
| `Data.Purchase.PaymentId` | O pagamento descrito no evento. | Relacionar as etapas da mesma cobrança quando esse campo estiver presente. |
| `Data.Subscriptions[].Id`, `Data.Subscription.Id` ou `Data.SubscriptionId` | A assinatura, conforme o formato do evento. | Acompanhar a assinatura entre eventos financeiros e de acesso. |
| `Data.Buyer.Id` ou `Data.Member.Id` | O usuário associado à compra ou ao acesso. | Relacionar a pessoa sem substituir a identificação de suas assinaturas. |
| `Data.Products[].Id` ou `Data.Product.Id` | O produto. | Relacionar o produto aos campos `ProductId` das assinaturas. |
| `Data.Buyer.Email` em `Abandoned_Cart` | O contato informado no checkout abandonado. | Correlacionar o contato considerando também a oferta ou o produto envolvido. |

Essas chaves identificam entidades. Um mesmo pagamento pode aparecer na fatura criada, na confirmação e no reembolso; uma mesma assinatura pode aparecer em várias renovações e mudanças de acesso. Não descarte uma transição diferente apenas porque o identificador da entidade já foi recebido.

Quando a integração recebe os dois formatos de acesso pago, a correspondência entre eles deve evitar executar duas vezes a mesma mudança. Também é necessário permitir um novo início de acesso caso o vínculo seja criado novamente, sem usar uma chave permanente de membro e produto como bloqueio de todos os eventos futuros.

## Processamento no recebimento

Ao receber um webhook:

1. Confira o token da integração, quando essa validação for adotada, antes de processar a chamada.
2. Leia `IsTest` para separar os dados de teste dos reais. Os exemplos de teste usam dados fictícios e não devem acionar automações destinadas a compras reais.
3. Registre a entrega de forma confiável antes de confirmar o recebimento com `2xx`.
4. Encaminhe o tratamento conforme `Event` e, em `Subscription_Product_Access`, também conforme `Data.Action`.
5. Para operações demoradas, processe a regra de negócio de forma assíncrona, considerando o timeout de 10 segundos e a possibilidade de eventos em lote.

Os eventos de acesso comunicam a mudança efetiva do vínculo. A pendência de renovação ou o cancelamento da assinatura, isoladamente, não deve ser usado como confirmação de remoção imediata de um acesso que ainda está válido.

## Horários das rotinas

Os horários de execução informados na [página de gatilhos](./gatilhos-dos-eventos.md) usam o **horário de Brasília**. Essa definição é sobre as rotinas; ela não define o fuso dos campos de data dos payloads.

## Datas e valores do pagamento

`Data.Purchase.PaymentDate` informa a **data e a hora do pagamento**. Nos eventos de reembolso, chargeback e término da garantia, a referência continua sendo o pagamento original relacionado ao evento.

`Data.Purchase.NextBilling` informa o **vencimento da próxima cobrança**, quando houver. Pode acompanhar os eventos de **Fatura Criada** e **Assinatura Pendente de Renovação**; sua presença não confirma que a cobrança foi paga. Para compra única (`Recurrency: 0`), mantém-se a regra de valor `null`.

`Data.Purchase.Price` é um objeto, e `Data.Purchase.Price.Value` contém o **valor final da compra, considerando descontos e incluindo juros quando aplicáveis**. Os juros já incluídos nesse total não devem ser somados novamente ao interpretar o valor final.

Por exemplo, uma compra com preço original de `100`, desconto de `5` e juros de `26.4` tem valor final de `121.4`. Essa composição ilustra a inclusão dos juros no total; não estabelece uma regra de cálculo de taxas.

### Formatos dos valores monetários

`Data.Purchase.Price` e `Data.Purchase.OriginalPrice` são **objetos**: o número está em seu campo `Value`. Outros campos, como `Data.Commissions[].Value` e `Data.Purchase.CouponAmount`, já trazem o **número diretamente**.

Leia o valor no caminho indicado na tabela de cada evento. Não trate todos os campos monetários como se fossem objetos com `Value`, nem transforme os objetos de preço em um número sem acessar esse campo.

## Ciclo da assinatura

`Data.Subscriptions[].Cycle` informa o **ciclo da assinatura**, usado para acompanhar suas renovações. Cada item da lista se refere à assinatura identificada em `Data.Subscriptions[].Id`.

Esse campo tem finalidade diferente de `Data.Purchase.Recurrency`, que descreve a periodicidade do plano em meses, e de `Data.Purchase.SmartInstallment.CurrentInstallment`, que identifica a parcela do parcelamento inteligente.

Consulte as tabelas dos eventos para os campos documentados em cada payload. A definição de `Cycle` não torna esse campo obrigatório em todos os webhooks nem define, por si só, uma regra de liberação de acesso.

## Renovação de assinaturas

Uma assinatura anteriormente ativa passa para **pendente de renovação** enquanto aguarda o pagamento do próximo ciclo. Essa mudança dispara o evento `Subscription_Renewal_Pending`.

| Método de pagamento | Quando entra em pendente de renovação |
| --- | --- |
| Pix (`pix`) | Cerca de 10 dias antes do vencimento, com QR Code. |
| Boleto (`bankslip`) | Cerca de 10 dias antes do vencimento, com linha digitável. |
| Cartão de crédito (`credit_card`) | No dia do vencimento, antes da cobrança, inclusive quando ela será aprovada. |
| Pix Automático | Com autorização ativa, não entra no fluxo normal de notificação; o evento é enviado se o débito falhar. |

Para Pix e boleto, a antecedência permite que o usuário pague antes do fim do ciclo. Nesses métodos, estar pendente de renovação não significa necessariamente que a assinatura já venceu.

O processamento diário ocorre entre **06h e 08h**, no horário de Brasília, com rotina legada às **00h10** para assinaturas antigas. Uma parcela vencida do Parcelamento Inteligente também pode gerar a pendência.

Se a renovação for paga, é disparado o evento `Recurrent_Payment`. Se não for paga, a assinatura passa para cancelada ou expirada, conforme as regras aplicáveis à situação.

Consulte [Assinatura Pendente de Renovação](./eventos/assinatura-pendente-de-renovacao.mdx) e [Pagamento de Renovação Efetuado](./eventos/pagamento-de-renovacao-efetuado.mdx) para os campos e exemplos desses eventos.

## Solicitação e conclusão de reembolso

`Refund_Requested` é enviado somente quando o pedido do **membro** segue para **avaliação manual**. Solicitações do produtor ou da equipe e reembolsos automáticos não geram esse evento.

No boleto, o pedido do membro sempre segue para avaliação manual. Em cartão e Pix, isso ocorre quando o produto não tem reembolso automático ou o pedido ultrapassa o prazo configurado para esse fluxo. Esse prazo pode ser de **7, 15 ou 30 dias**, conforme o produto.

`Payment_Refund` depende da **confirmação do gateway**. Marcar um reembolso como realizado fora da plataforma não gera esse evento.

## Período de garantia

A garantia configurada no produto pode ser de **7, 15 ou 30 dias**. A rotina de `Refund_Period_Over` executa diariamente às **09h, no horário de Brasília**, para pagamentos aprovados cuja garantia terminou, incluindo renovações.

Um pagamento já reembolsado não gera esse evento. Um pedido ainda em avaliação manual não é, por si só, um reembolso concluído.

## Liberação e remoção de acesso

O evento `Subscription_Product_Access` possui duas ações no campo `Data.Action`: `Add` para liberar o acesso e `Remove` para remover o acesso. Os valores seguem a grafia dos payloads, com inicial maiúscula.

O disparo ocorre no início ou no fim do período de acesso. O fim pode ocorrer ao chegar à data definida ou em casos de reembolso e chargeback.

Para acesso pago vinculado à assinatura, `Subscription_Product_Access` acompanha o evento específico de início ou fim, com `Add` ou `Remove`. Convidados não geram esse evento. Se a integração assinar os dois formatos, deve tratar a correspondência para não executar a mesma mudança duas vezes; essa correspondência não estabelece ordem de entrega.

Nesse evento, o produto e a assinatura são enviados nos objetos singulares `Data.Product` e `Data.Subscription`. `Data.Subscription.ExpiredDate` informa a data e a hora em que a assinatura expirou, quando enviado. Nos exemplos, está presente em `Remove` e ausente em `Add`.

Consulte [Liberação e remoção de acesso](./eventos/liberacao-e-remocao-de-acesso.mdx) para os campos e as duas variações do payload.

## Início do acesso ao produto

No evento `Product_Access_Started`, `Data.AccessType` aceita os valores `Paid` e `Guest`, com inicial maiúscula:

- `Paid`: acesso de um membro que realizou uma compra. `Data.SubscriptionId` identifica a assinatura.
- `Guest`: acesso gratuito de um membro convidado. Não possui assinatura; `Data.SubscriptionId` não é enviado.

`Data.AccessStartedAt` informa o início do acesso. `Data.AccessEndedAt` informa quando o acesso termina e é exclusivo de membros convidados (`Guest`).

A criação pode decorrer de pagamento confirmado, convite, order bump ou bundle. Cada produto tem seu próprio evento de acesso; a renovação não gera novamente o evento de criação.

Os dados do membro são enviados em `Data.Member`, e o produto é enviado no objeto singular `Data.Product`. Consulte [Início liberação de acesso](./eventos/inicio-liberacao-de-acesso.mdx) para os campos e exemplos.

## Fim do acesso ao produto

O evento `Product_Access_Ended` é disparado quando o acesso é removido por expiração, reembolso, estorno, cancelamento ou término do convite. `Data.AccessEndedAt` informa quando o acesso efetivamente acabou. O cancelamento de uma assinatura com ciclo atual pago não implica remoção imediata do acesso.

`Data.AccessType` aceita `Paid` e `Guest`, com inicial maiúscula. `Data.SubscriptionId` é enviado somente para `Paid`; membros `Guest` não possuem assinatura e não recebem esse campo.

No evento de início (`Product_Access_Started`), `AccessEndedAt` é exclusivo de convidados. No evento de fim (`Product_Access_Ended`), esse campo informa o encerramento do acesso, inclusive para `Paid`, conforme o exemplo.

Consulte [Fim liberação de acesso](./eventos/fim-liberacao-de-acesso.md) para os campos e o exemplo do evento.

## Parcelamento inteligente

O objeto **`Data.Purchase.SmartInstallment` só é enviado quando `Data.Purchase.IsSmartInstallment` é `true`**.

Quando `IsSmartInstallment` é `false`, o objeto `SmartInstallment` não é enviado. Por isso, ele pode estar presente em alguns webhooks e ausente em outros, de acordo com a operação.

Uma integração deve considerar esse objeto condicional e verificar sua presença antes de acessar `CurrentInstallment`, `TotalInstallments` ou `Type`.

### Exemplo com parcelamento inteligente

Trecho do objeto `Data.Purchase` com o detalhamento do parcelamento inteligente:

```json
{
  "IsSmartInstallment": true,
  "SmartInstallment": {
    "CurrentInstallment": 3,
    "TotalInstallments": 3,
    "Type": "direct"
  }
}
```

### Exemplo sem parcelamento inteligente

Trecho do objeto `Data.Purchase` em que o parcelamento inteligente não está ativo:

```json
{
  "IsSmartInstallment": false
}
```

### Campos do detalhamento

| Campo | Descrição |
| --- | --- |
| `CurrentInstallment` | Parcela atual do parcelamento inteligente relacionada à operação informada no evento. |
| `TotalInstallments` | Total de parcelas do parcelamento inteligente contratado. |
| `Type` | `direct`: escolhido como primeira opção de compra; `recovery`: utilizado para recuperar a operação após uma falha na cobrança. |

Consulte o [Catálogo de variáveis](./catalogo-de-variaveis.md) para ver os tipos, as condições e os eventos em que esses campos foram identificados.
