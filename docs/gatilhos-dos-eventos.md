---
title: Gatilhos dos eventos
description: Quando cada webhook Lastlink é disparado, diferenças por meio de pagamento e rotinas de execução.
---

# Gatilhos dos eventos

Esta página reúne os gatilhos dos **17 identificadores** informados. Há **16 eventos com disparadores de produção** e o identificador `Notify_Active_Member`, restrito ao uso em teste descrito abaixo. Os títulos dos artigos e os nomes técnicos do payload são apresentados separadamente.

Os horários de rotina indicados nesta página usam o **horário de Brasília**. O horário da rotina não garante o instante de recebimento: preparação do payload, processamento e retentativas de entrega são etapas distintas.

## Consulta rápida

| Evento | Identificador | Gatilho |
| --- | --- | --- |
| [Fatura Criada](#fatura-criada) | `Purchase_Request_Confirmed` | Cobrança pendente criada. |
| [Compra Completa](#compra-completa) | `Purchase_Order_Confirmed` | Primeiro pagamento confirmado. |
| [Pedido de Compra Expirada](#pedido-de-compra-expirada) | `Purchase_Request_Expired` | Prazo sem pagamento, substituição da compra pendente ou falha na reserva de ingresso. |
| [Pedido de Compra Cancelado](#pedido-de-compra-cancelado) | `Purchase_Request_Canceled` | Membro cancela antes do primeiro pagamento. |
| [Carrinho Abandonado](#carrinho-abandonado) | `Abandoned_Cart` | Checkout sem atualização entre 30 minutos e 6 horas, sujeito às condições da oferta. |
| [Pagamento de Renovação Efetuado](#pagamento-de-renovação-efetuado) | `Recurrent_Payment` | Pagamento confirmado do segundo em diante, em assinatura. |
| [Assinatura Pendente de Renovação](#assinatura-pendente-de-renovação) | `Subscription_Renewal_Pending` | Mudança para pendente de renovação. |
| [Assinatura Expirada](#assinatura-expirada) | `Subscription_Expired` | Fim do prazo e da carência sem pagamento, ou outras condições de expiração. |
| [Assinatura Cancelada](#assinatura-cancelada) | `Subscription_Canceled` | Cancelamento da assinatura pelos fluxos descritos. |
| [Reembolso solicitado](#reembolso-solicitado) | `Refund_Requested` | Pedido do membro encaminhado à avaliação manual. |
| [Pagamento Reembolsado](#pagamento-reembolsado) | `Payment_Refund` | Gateway confirma o reembolso. |
| [Pagamento Estornado](#pagamento-estornado) | `Payment_Chargeback` | Estorno ou disputa confirmada, conforme gateway e meio. |
| [Periodo de Reembolso Terminado](#periodo-de-reembolso-terminado) | `Refund_Period_Over` | Rotina para pagamento aprovado com garantia encerrada. |
| [Início liberação de acesso](#início-liberação-de-acesso) | `Product_Access_Started` | Acesso criado por pagamento, convite, order bump ou bundle. |
| [Fim liberação de acesso](#fim-liberação-de-acesso) | `Product_Access_Ended` | Acesso efetivamente removido. |
| [Liberação e remoção de acesso](#liberação-e-remoção-de-acesso) | `Subscription_Product_Access` | Add ou Remove para acesso pago vinculado à assinatura. |
| [Notificar Membro Ativo](#notificar-membro-ativo) | `Notify_Active_Member` | Sem disparador em produção. |

Consulte as [Regras](./regras.md) para distribuição, timeout e retentativas. Os artigos de cada evento detalham os campos e preservam os exemplos de payload.


## Fatura Criada

**Identificador:** `Purchase_Request_Confirmed`.

O evento é disparado quando uma **cobrança pendente é criada**, nos seguintes fluxos:

- Checkout.
- Upsell.
- Renovação de assinatura.
- Segunda parcela em diante do Parcelamento Inteligente.
- Renovação das assinaturas antigas processadas pela Iugu.

A primeira parcela do Parcelamento Inteligente criada no checkout não gera este evento.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento. No cartão, o evento é enviado antes da cobrança e pode ser recebido mesmo se ela for recusada.

Em Pix e boleto, a preparação do payload aguarda o QR Code ou a linha digitável por até **10 tentativas**. Se esses dados não estiverem disponíveis ao final das tentativas, o evento é descartado. Essa espera ocorre antes do envio HTTP e é diferente das retentativas de entrega do webhook.

[Campos e exemplos do evento](./eventos/fatura-gerada.mdx).


## Compra Completa

**Identificador:** `Purchase_Order_Confirmed`.

O evento é disparado quando o gateway confirma o **primeiro pagamento da assinatura**. A criação da fatura, isoladamente, não confirma esse pagamento.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento. A confirmação de boleto ocorre pela Iugu; o fluxo novo de pagamentos ainda não confirma boleto.

[Campos e exemplos do evento](./eventos/compra-aprovada.mdx).


## Pedido de Compra Expirada

**Identificador:** `Purchase_Request_Expired`.

O evento é disparado em três situações:

1. A primeira compra não é paga no prazo definido para o meio de pagamento. A rotina de verificação executa a cada **30 minutos**.
2. Uma nova compra do mesmo produto substitui a compra pendente.
3. A reserva de ingresso falha.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento, incluindo cartão recusado. Quando o prazo de expiração do cartão está configurado como **0**, a recusa no checkout gera a expiração imediatamente. Os demais prazos dependem da configuração por meio de pagamento.

[Campos e exemplos do evento](./eventos/pedido-de-compra-expirado.mdx).


## Pedido de Compra Cancelado

**Identificador:** `Purchase_Request_Canceled`.

O evento tem um único gatilho: o **membro cancela, na área de membros, uma assinatura cuja primeira cobrança ainda não foi paga**.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento.

[Campos e exemplos do evento](./eventos/compra-cancelada.mdx).


## Carrinho Abandonado

**Identificador:** `Abandoned_Cart`.

O evento é disparado para quem deixou o **e-mail no checkout** e ficou **de 30 minutos a 6 horas sem atualizar o checkout**, desde que não tenha assinatura ativa ou pendente de renovação naquela oferta.

A rotina executa a cada **2 minutos**. O limite é de **um evento por combinação de e-mail, oferta e dia**.

### Meios de pagamento e condições

Não há filtro por meio de pagamento. Quem gerou Pix ou boleto e não pagou pode receber o evento; quem teve o cartão recusado também pode. Uma compra com cartão aprovado não atende ao cenário de abandono descrito.

[Campos e exemplos do evento](./eventos/carrinho-abandonado.md).


## Pagamento de Renovação Efetuado

**Identificador:** `Recurrent_Payment`.

O evento é disparado quando um pagamento **do segundo em diante** é confirmado, incluindo:

- Renovação de assinatura.
- Segunda parcela em diante do Parcelamento Inteligente.
- Débito do Pix Automático.
- Cobrança de troca de plano.

O evento permanece exclusivo de ofertas do tipo assinatura. Compras únicas não o disparam.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento.

[Campos e exemplos do evento](./eventos/pagamento-de-renovacao-efetuado.mdx).


## Assinatura Pendente de Renovação

**Identificador:** `Subscription_Renewal_Pending`.

O evento é disparado quando a assinatura passa para **pendente de renovação**. O processamento diário ocorre entre **06h e 08h**, no horário de Brasília. Para assinaturas antigas, há também uma rotina legada às **00h10**, no mesmo fuso.

Uma parcela vencida do Parcelamento Inteligente também pode gerar essa mudança de status.

### Meios de pagamento e condições

- **Cartão:** no dia do vencimento, antes da cobrança. O evento ocorre em toda renovação, inclusive nas que serão aprovadas.
- **Pix e boleto:** cerca de **10 dias antes do vencimento**, com QR Code ou linha digitável para permitir o pagamento antecipado.
- **Pix Automático:** com autorização ativa, não gera o evento no fluxo normal; o evento é enviado se o débito falhar.

Quando o pagamento é confirmado, é enviado `Recurrent_Payment`. Sem pagamento, a assinatura pode passar para cancelada ou expirada, conforme as regras aplicáveis.

[Campos e exemplos do evento](./eventos/assinatura-pendente-de-renovacao.mdx).


## Assinatura Expirada

**Identificador:** `Subscription_Expired`.

O evento é disparado quando a assinatura vence e termina o **prazo de carência sem pagamento**. A rotina executa a cada **30 minutos**.

Também é disparado quando:

- Um plano de pagamento único chega ao fim de seu período de validade.
- Passam **5 dias após o vencimento da última parcela** do Parcelamento Inteligente, sem pagamento.

`Data.Subscriptions[].ExpiredDate` informa quando a assinatura passou para expirada.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento. A carência é configurada por meio de pagamento. No Pix Automático, a autorização também é revogada.

[Campos e exemplos do evento](./eventos/assinatura-expirada.mdx).


## Assinatura Cancelada

**Identificador:** `Subscription_Canceled`.

Os gatilhos de cancelamento contemplam:

- Cancelamento pelo membro.
- Cancelamento pelo produtor, individualmente ou pela opção de cancelar todos.
- Cancelamento pela equipe da Lastlink.
- Reembolso ou estorno processado pela Iugu.
- Cancelamento do Parcelamento Inteligente.
- Cancelamento pelo membro no aplicativo do banco, no Pix Automático.
- Falha na renovação após o número máximo de tentativas aplicável à situação.

Uma compra pode permanecer aprovada enquanto a assinatura está cancelada: o ciclo atual pode estar pago e não haverá cobrança do próximo ciclo.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento. O cancelamento no aplicativo do banco é exclusivo do Pix Automático.

[Campos e exemplos do evento](./eventos/assinatura-cancelada.mdx).


## Reembolso solicitado

**Identificador:** `Refund_Requested`.

O evento é disparado **somente quando o membro solicita um reembolso e o pedido segue para avaliação manual**.

Solicitações feitas pelo produtor ou pela equipe da Lastlink não geram esse evento. Reembolsos automáticos também não geram `Refund_Requested`. A conclusão do reembolso é informada por `Payment_Refund`.

### Meios de pagamento e condições

- **Boleto:** a solicitação do membro sempre segue para avaliação manual, pois o boleto não é reembolsado automaticamente.
- **Cartão e Pix:** o evento ocorre quando o produto não tem reembolso automático ou quando o pedido ultrapassa o prazo configurado no produto para esse fluxo.

O prazo pode ser de **7, 15 ou 30 dias**, conforme a configuração do produto. Não presumir um limite universal de 7 dias.

[Campos e exemplos do evento](./eventos/reembolso-solicitado.mdx).


## Pagamento Reembolsado

**Identificador:** `Payment_Refund`.

O evento é disparado quando o **gateway confirma o reembolso**. O pedido de reembolso, sozinho, não dispara esse evento.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento. O registro de **reembolso fora da plataforma**, feito pela equipe, não gera o evento. Esse é o caminho típico de reembolso de boleto.

[Campos e exemplos do evento](./eventos/pagamento-reembolsado.mdx).


## Pagamento Estornado

**Identificador:** `Payment_Chargeback`.

O evento contempla **contestação de cartão ou protesto na Iugu**, e **disputa de Pix pelo MED perdida na Yuno**.

`Data.Purchase.ChargebackDate` informa a data e a hora do estorno confirmado. O payload se refere aos dados do pagamento original.

### Meios de pagamento e condições

O envio depende do gateway e do fluxo. Na Yuno, somente a disputa de **Pix** perdida gera este evento; contestação de cartão na Yuno não o gera.

[Campos e exemplos do evento](./eventos/pagamento-estornado.mdx).


## Periodo de Reembolso Terminado

**Identificador:** `Refund_Period_Over`.

A rotina diária executa às **09h, no horário de Brasília**, para pagamentos aprovados cuja garantia configurada no produto, de **7, 15 ou 30 dias**, terminou.

O pagamento precisa continuar com status **aprovado**. Se já tiver sido reembolsado, o evento não é disparado. Um pedido de reembolso ainda em avaliação não significa que o pagamento já foi reembolsado.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento, inclusive a pagamentos de renovação.

[Campos e exemplos do evento](./eventos/periodo-de-reembolso-terminado.mdx).


## Início liberação de acesso

**Identificador:** `Product_Access_Started`.

O evento é disparado quando o **acesso à comunidade é criado**, por:

- Pagamento confirmado.
- Convite pela lista de convidados.
- Order bump ou bundle; cada produto gera seu próprio evento de acesso.

A renovação não gera novamente o evento de criação de acesso.

### Meios de pagamento e condições

Não há filtro por meio de pagamento. O acesso pago é criado na confirmação: cartão quando aprovado, Pix quando o pagamento é recebido e boleto quando compensado. O acesso por convite usa `AccessType: Guest`, sem assinatura.

[Campos e exemplos do evento](./eventos/inicio-liberacao-de-acesso.mdx).


## Fim liberação de acesso

**Identificador:** `Product_Access_Ended`.

O evento é disparado quando o **acesso é efetivamente removido**, por expiração, reembolso, estorno, cancelamento ou término do convite.

`Data.AccessEndedAt` informa quando o acesso acabou. Um cancelamento da assinatura que preserve o acesso ao ciclo já pago não equivale à remoção imediata desse acesso.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento e também ao término do acesso gratuito de convidados.

[Campos e exemplos do evento](./eventos/fim-liberacao-de-acesso.md).


## Liberação e remoção de acesso

**Identificador:** `Subscription_Product_Access`.

O evento é enviado junto com os eventos específicos de início ou fim do acesso, **somente para acessos pagos vinculados a uma assinatura**:

- `Add`: liberação, junto com `Product_Access_Started`.
- `Remove`: remoção, junto com `Product_Access_Ended`.

Convidados não geram `Subscription_Product_Access`. A correspondência entre os eventos descreve a mesma mudança de acesso; não estabelece ordem de entrega.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento dos acessos pagos.

[Campos e exemplos do evento](./eventos/liberacao-e-remocao-de-acesso.mdx).


## Notificar Membro Ativo

**Identificador:** `Notify_Active_Member`.

Este identificador **não possui disparador em produção**. O uso informado é restrito a um console de teste.

### Meios de pagamento e condições

Não há meio de pagamento aplicável nem gatilho de produção para configurar.
