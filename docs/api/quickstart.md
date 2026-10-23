---
sidebar_position: 2
title: Quickstart
---

# Quickstart

Este guia leva você do zero à primeira cobrança PIX confirmada.

:::info Pré-requisito
Você precisa de um produto com oferta, ao menos um plano ativo e uma carteira de recebimento aprovada. A API cobra o seu catálogo; ela não o cria.
:::

## 1. Obtenha um token

Detalhes em [Autenticação](./autenticacao.md).

```bash
curl -X POST https://api.lastlink.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CLIENT_ID" -d "client_secret=$CLIENT_SECRET"
```

## 2. Descubra a oferta e o plano

`POST /v1/charges` pede `offerId` e `planId` em GUID. Você os obtém aqui:

```bash
curl https://api.lastlink.com/v1/offers \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Resposta `200`:

```json
{
  "data": [
    {
      "offerId": "7a9e4c11-3b8d-4f02-9a15-0c6e2d7b8f31",
      "code": "mentoria-pro",
      "title": "Mentoria Pro",
      "checkoutUrl": "https://lastlink.com/p/mentoria-pro",
      "billingType": "SUBSCRIPTION",
      "sellable": true,
      "activePlanCount": 1,
      "plans": [
        {
          "planId": "b2c1f8a4-77de-4c93-b0a6-5e1d9f23ac80",
          "amount": 19900,
          "membershipFee": 0,
          "billingType": "SUBSCRIPTION",
          "recurrenceMonths": 12
        }
      ]
    }
  ],
  "nextCursor": null
}
```

Filtre por código com `?code=mentoria-pro`. Cobre apenas ofertas com `sellable: true` e não assuma `plans[0]` quando `activePlanCount` for maior que 1. Detalhes em [Ofertas e planos](./ofertas-e-planos.md).

## 3. Crie uma cobrança

Use os dois ids da resposta anterior:

```bash
curl https://api.lastlink.com/v1/charges \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Idempotency-Key: pedido-8842" \
  -H "Content-Type: application/json" \
  -d '{ "type": "pix",
        "offerId": "7a9e4c11-3b8d-4f02-9a15-0c6e2d7b8f31",
        "planId": "b2c1f8a4-77de-4c93-b0a6-5e1d9f23ac80",
        "buyer": { "email": "ana@ex.com", "document": "12345678909" },
        "externalReference": "pedido-8842" }'
```

Resposta `201`:

```json
{
  "chargeId": "42ad3ea5-048a-409b-ab0b-7aab298c85a9",
  "status": "PENDING",
  "type": "pix",
  "externalReference": "pedido-8842",
  "pix": {
    "qrCode": "https://api.lastlink.com/v1/pix/eyJjIjoiNDJhZ...png",
    "emv": "00020101021226790014br.gov.bcb.pix...6304B0C7",
    "expiresAt": "2026-10-15T21:46:55Z"
  }
}
```

O `emv` é o copia-e-cola. O `qrCode` é um link assinado para a imagem PNG, que você pode exibir direto ao pagador.

:::warning Não fixe o planId no código
Editar o preço da oferta cria um plano novo e desativa o anterior. O id que funcionou hoje devolve `404` depois que o creator mexer no preço. Resolva o plano ativo via `GET /v1/offers` antes de cobrar.
:::

## 4. Receba a confirmação

Registre um webhook e aguarde o evento `pix.paid` quando o pagador pagar. Veja [Webhooks](./webhooks.md).

## Próximos passos

- [Ofertas e planos](./ofertas-e-planos.md)
