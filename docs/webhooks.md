---
sidebar_position: 3
title: Webhooks
---

# Webhooks

Os webhooks notificam sua integração sobre cobranças, pagamentos, assinaturas, acessos e carrinhos abandonados. Cada evento possui um identificador em `Event` e um conteúdo próprio dentro de `Data`.

Os eventos são enviados via **HTTP `POST`**, com corpo JSON. Consulte as [regras de envio HTTP e validação do token](./regras.md#envio-http) para ver os headers e o uso de `x-lastlink-token`.

## Por onde começar

1. Veja a [Jornada dos eventos](./jornada-dos-eventos.md) para entender a ordem em que os webhooks acontecem.
2. Consulte [Gatilhos dos eventos](./gatilhos-dos-eventos.md) para escolher a notificação adequada à sua automação.
3. Abra o artigo do evento para conferir os campos, as condições e os exemplos completos.
4. Use o [Catálogo de variáveis](./catalogo-de-variaveis.md) para localizar um campo e os eventos em que ele foi documentado.
5. Implemente o recebimento conforme as [Regras](./regras.md), considerando o token, o timeout e as retentativas.

## Formatos de payload

Os formatos abaixo orientam a leitura. A obrigatoriedade e a presença de cada campo dependem do evento e das condições descritas no respectivo artigo.

| Grupo | Formato de referência dentro de `Data` | Finalidade |
| --- | --- | --- |
| Compra, pagamento e assinatura | `Products`, `Buyer`, `Seller`, `Purchase`, `Subscriptions` e `Offer`, com os demais blocos conforme o evento. | Acompanhar cobrança, pagamento ou status da assinatura. |
| Início e fim do acesso | `Product`, `Member`, `AccessType` e campos de data do acesso; `SubscriptionId` conforme o tipo. | Acompanhar o vínculo de acesso do membro com o produto. |
| Liberação e remoção de acesso | `Action`, `Product`, `Buyer`, `Seller` e `Subscription`, no singular. | Comunicar `Add` ou `Remove` em acesso pago vinculado à assinatura. |
| Carrinho abandonado | `Products`, `Buyer`, `Offer` e rastreamento quando enviado. | Identificar o contato e a oferta do checkout abandonado. |

### Escolha a notificação pelo que precisa acompanhar

Para uma cobrança criada, consulte Fatura Criada; para o primeiro pagamento confirmado, Compra Completa; para os pagamentos seguintes de uma assinatura, Pagamento de Renovação Efetuado. Para sincronizar acesso, acompanhe os eventos específicos de início ou fim, ou o formato com `Action` para acesso pago.

O pedido de reembolso e a conclusão do reembolso também são notificações diferentes. A leitura do evento deve considerar o fato comunicado, além dos objetos que ele contém.

## Dados do comprador no checkout

Esta regra vale para **todos os webhooks**: o **e-mail é o dado mínimo e obrigatório** do comprador no checkout.

Os demais dados de formulário em `Buyer` dependem dos campos habilitados pelo produtor e preenchidos pelo usuário. Se um desses dados estiver ausente, ele não foi informado no checkout.

Os campos de endereço só são enviados quando estiverem habilitados pelo produtor no formulário de checkout e tiverem sido preenchidos pelo usuário. Não considere nome, telefone, CPF ou endereço como dados sempre presentes.

## Eventos

As [Regras](./regras.md) reúnem as condições gerais de envio dos campos, incluindo a presença condicional do objeto `SmartInstallment`.

Consulte [Gatilhos dos eventos](./gatilhos-dos-eventos.md) para ver o que dispara cada evento, as diferenças por meio de pagamento e os horários das rotinas.

Consulte o [Catálogo de variáveis](./catalogo-de-variaveis.md) para localizar um campo, seus valores e os eventos em que aparece. Campos ainda sem definição são identificados como **a confirmar**.

| Evento | Identificador no payload | Documentação |
| --- | --- | --- |
| Carrinho Abandonado | `Abandoned_Cart` | [Consultar evento](./eventos/carrinho-abandonado.md) |
| Fatura Criada | `Purchase_Request_Confirmed` | [Consultar evento](./eventos/fatura-gerada.mdx) |
| Compra Completa | `Purchase_Order_Confirmed` | [Consultar evento](./eventos/compra-aprovada.mdx) |
| Pagamento Estornado | `Payment_Chargeback` | [Consultar evento](./eventos/pagamento-estornado.mdx) |
| Reembolso solicitado | `Refund_Requested` | [Consultar evento](./eventos/reembolso-solicitado.mdx) |
| Pagamento Reembolsado | `Payment_Refund` | [Consultar evento](./eventos/pagamento-reembolsado.mdx) |
| Pedido de Compra Cancelado | `Purchase_Request_Canceled` | [Consultar evento](./eventos/compra-cancelada.mdx) |
| Pedido de Compra Expirada | `Purchase_Request_Expired` | [Consultar evento](./eventos/pedido-de-compra-expirado.mdx) |
| Pagamento de Renovação Efetuado | `Recurrent_Payment` | [Consultar evento](./eventos/pagamento-de-renovacao-efetuado.mdx) |
| Periodo de Reembolso Terminado | `Refund_Period_Over` | [Consultar evento](./eventos/periodo-de-reembolso-terminado.mdx) |
| Assinatura Cancelada | `Subscription_Canceled` | [Consultar evento](./eventos/assinatura-cancelada.mdx) |
| Assinatura Expirada | `Subscription_Expired` | [Consultar evento](./eventos/assinatura-expirada.mdx) |
| Liberação e remoção de acesso | `Subscription_Product_Access` | [Consultar evento](./eventos/liberacao-e-remocao-de-acesso.mdx) |
| Assinatura Pendente de Renovação | `Subscription_Renewal_Pending` | [Consultar evento](./eventos/assinatura-pendente-de-renovacao.mdx) |
| Início liberação de acesso | `Product_Access_Started` | [Consultar evento](./eventos/inicio-liberacao-de-acesso.mdx) |
| Fim liberação de acesso | `Product_Access_Ended` | [Consultar evento](./eventos/fim-liberacao-de-acesso.md) |
| Notificar Membro Ativo | `Notify_Active_Member` | [Sem disparador em produção](./gatilhos-dos-eventos.md#notificar-membro-ativo) |
