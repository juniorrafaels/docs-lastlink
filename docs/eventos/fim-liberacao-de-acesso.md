---
sidebar_position: 16
title: Fim liberação de acesso
description: Regras de disparo, campos e exemplo do webhook Product_Access_Ended da Lastlink.
---

# Fim liberação de acesso

O evento `Product_Access_Ended` é disparado quando o acesso de um membro a um produto é encerrado.

## Quando é disparado

O evento é disparado quando o **acesso é efetivamente removido**, por expiração, reembolso, estorno, cancelamento ou término do convite.

`Data.AccessEndedAt` informa quando o acesso acabou. Um cancelamento da assinatura que preserve o acesso ao ciclo já pago não equivale à remoção imediata desse acesso.

### Meios de pagamento e condições

Aplica-se a todos os meios de pagamento e também ao término do acesso gratuito de convidados.

Consulte também o [resumo dos gatilhos](../gatilhos-dos-eventos.md#fim-liberação-de-acesso) e as [regras de distribuição e entrega](../regras.md#distribuição-dos-eventos).

## Tipos de acesso

Os valores de `Data.AccessType` são `Guest` e `Paid`, com inicial maiúscula.

| Valor | Significado | Assinatura |
| --- | --- | --- |
| `Paid` | Membro que realizou uma compra. | `Data.SubscriptionId` identifica a assinatura. |
| `Guest` | Membro convidado com acesso gratuito. | Não possui assinatura; `Data.SubscriptionId` não é enviado. |

Consulte também as [regras de fim do acesso ao produto](../regras.md#fim-do-acesso-ao-produto) e o evento [Início liberação de acesso](./inicio-liberacao-de-acesso.mdx).

## Como interpretar este evento

Use `Data.Member.Id` e `Data.Product.Id` para localizar o vínculo de acesso encerrado. Para `Paid`, `Data.SubscriptionId` permite relacioná-lo à assinatura; para `Guest`, esse campo não é enviado.

`Data.AccessEndedAt` informa quando o acesso efetivamente acabou, enquanto `CreatedAt` informa quando o webhook foi criado. Para distinguir um reembolso de um chargeback, acompanhe também os respectivos eventos financeiros: o encerramento de acesso, isoladamente, não identifica qual das causas listadas ocorreu.

## Estrutura do payload

Os nomes dos campos correspondem às chaves do JSON, incluindo letras maiúsculas e minúsculas. O campo condicional `SubscriptionId` deve ser lido considerando sua presença no evento recebido.

### Campos principais

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Id` | `string` | Identificador do webhook. |
| `IsTest` | `boolean` | Indica se é um evento de teste: `true` para teste e `false` para um evento real. |
| `Event` | `string` | Nome do evento. Nesta página, o valor é `Product_Access_Ended`. |
| `CreatedAt` | `string` | Data e hora em que o evento foi criado. |
| `Data` | `object` | Agrupa os dados do produto, do membro e do acesso encerrado. |

### Produto — `Data.Product`

Neste evento, `Product` é um objeto singular.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Data.Product` | `object` | Produto cujo acesso foi encerrado. |
| `Data.Product.Id` | `string` | Identificador do produto. |
| `Data.Product.Name` | `string` | Nome do produto. |
| `Data.Product.Quantity` | `number` | Quantidade do produto na operação, útil para casos como ingressos. |

### Membro — `Data.Member`

`Member` representa o usuário associado ao acesso. É o mesmo usuário representado por `Buyer` nos eventos que utilizam esse objeto; neste evento, a chave enviada é `Member`.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Data.Member` | `object` | Dados do membro associado ao acesso. |
| `Data.Member.Id` | `string` | Identificador do membro. |
| `Data.Member.Email` | `string` | E-mail do membro, enviado como texto simples. |

### Acesso

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Data.AccessType` | `string` | Tipo de acesso: `Paid` para quem realizou uma compra; `Guest` para convidados com acesso gratuito. |
| `Data.SubscriptionId` | `string` | Identificador da assinatura, enviado somente para `Paid`. Membros `Guest` não possuem assinatura e não recebem esse campo. |
| `Data.AccessEndedAt` | `string` | Data e hora em que o acesso ao produto acabou. |

## Exemplo de payload

Exemplo de teste (`IsTest: true`) para um membro com acesso `Paid`.

```json
{
  "Id": "c3358c70-5b4e-4230-b1f4-f9e35914f56f",
  "IsTest": true,
  "Event": "Product_Access_Ended",
  "CreatedAt": "2026-10-22T18:05:00",
  "Data": {
    "Product": {
      "Id": "a19d6d30-7f0c-4ea6-ab05-c4d3fc495cbb",
      "Name": "Meu Produto Lastlink",
      "Quantity": 1
    },
    "Member": {
      "Id": "2ed2a1d0-4a81-4fd1-ba35-734c988850f7",
      "Email": "contato@lastlink.com"
    },
    "AccessType": "Paid",
    "SubscriptionId": "c03452b7-9777-4f69-8b00-0234f10401ea",
    "AccessEndedAt": "2026-10-22T18:05:00.5622189Z"
  }
}
```
