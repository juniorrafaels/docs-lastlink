---
sidebar_position: 3
title: Ofertas e planos
---

# Ofertas e planos

`POST /v1/charges` pede `offerId` e `planId`, os dois em GUID. Esta página explica como descobrir esses valores e por que não fixá-los no código.

:::info
A API cobra o seu catálogo; ela não o cria. Produto, oferta e plano nascem no painel da Lastlink. A API lê esse catálogo e cobra em cima dele.
:::

## O modelo

```text
Produto  →  Oferta  →  Plano  →  Carteira
```

| Conceito | O que é | Onde aparece na API |
| --- | --- | --- |
| Produto | O que você vende (a comunidade, o curso, a mentoria) | Não é recurso da API |
| Oferta | Uma forma de vender esse produto: código, vigência, formas de pagamento | `offerId`, `code` |
| Plano | O preço dentro da oferta: valor, adesão, recorrência | `planId`, `amount` |
| Carteira | Quem recebe o dinheiro | Resolvida no servidor, nunca trafega |

Uma oferta tem um ou mais planos. Por isso `POST /v1/charges` precisa dos dois ids: a oferta diz o que está sendo vendido; o plano diz por quanto.

## Antes da primeira chamada

Você precisa ter, na sua conta Lastlink:

- um produto com pelo menos uma oferta publicada;
- pelo menos um plano ativo nessa oferta;
- uma carteira de recebimento vinculada e aprovada.

## Listar o que você pode cobrar

```bash
curl https://api.lastlink.com/v1/offers \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

A resposta traz as ofertas da credencial que chamou. Você não envia creator nem carteira; eles vêm do token.

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
      "validFrom": null,
      "validUntil": null,
      "activePlanCount": 1,
      "plans": [
        {
          "planId": "b2c1f8a4-77de-4c93-b0a6-5e1d9f23ac80",
          "amount": 19900,
          "membershipFee": 0,
          "billingType": "SUBSCRIPTION",
          "recurrenceMonths": 12
        }
      ],
      "updatedAt": "2026-09-02T14:31:07Z"
    }
  ],
  "nextCursor": null
}
```

Para filtrar por código (o mesmo que aparece na URL de checkout):

```bash
curl "https://api.lastlink.com/v1/offers?code=mentoria-pro" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

O escopo exigido é `charges:write`, o mesmo de cobrar: consultar o catálogo é o passo anterior de quem vai criar a cobrança.

## Os campos que decidem

| Campo | Por que importa |
| --- | --- |
| `sellable` | Cobre apenas ofertas com `true`. Significa que a oferta aceita novas vendas, está dentro da vigência e tem ao menos um plano ativo, as mesmas condições que a criação da cobrança verifica. |
| `plans` | Só os planos ativos, ordenados por valor. Plano desativado não aparece. |
| `activePlanCount` | Quantos planos ativos existem. Não assuma `plans[0]`: cerca de 10% das ofertas em produção têm dois ou mais, e escolher entre eles é decisão de configuração sua, não da API. |
| `validFrom` / `validUntil` | Janela de vigência. `null` nos dois significa sem limite. |
| `amount` | Valor em centavos: `19900` é R$ 199,00. Mesma convenção do `amount` da devolução. |
| `membershipFee` | Taxa de adesão, em centavos, cobrada junto no primeiro pagamento. |
| `recurrenceMonths` | Periodicidade em meses (`1`, `3`, `6`, `12`). `null` em cobrança única. |
| `billingType` | `ONE_TIME` ou `SUBSCRIPTION`. |

## O planId não é estável

Esta é a parte que mais quebra integração em produção:

> Editar o preço de uma oferta cria um plano novo e desativa o anterior.

O `planId` que funcionou hoje passa a devolver `404 offer_not_found` assim que o creator mexer no preço. Do seu lado, isso aparece como "a API parou de funcionar", sem nada ter mudado no seu código.

Resolva o plano ativo antes de cobrar, em vez de guardar o id:

```bash
# resolve o plano ativo e falha alto se houver mais de um; escolher é decisão sua
PLAN=$(curl -s "https://api.lastlink.com/v1/offers?code=mentoria-pro" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | jq -er '[.data[] | select(.sellable == true) | .plans[]] as $ativos
    | if ($ativos | length) == 1 then $ativos[0].planId
      else error("esperava 1 plano ativo, achei \($ativos | length)") end')
```

Se você precisa de cache, guarde por minutos e trate o `404` como sinal de "reconsulte o catálogo", nunca como erro permanente.

## Quando a cobrança é recusada pela oferta

São dois status diferentes, e a distinção importa no seu tratamento de erro.

**`403 offer_not_owned`:** a oferta existe, mas não é da sua conta. A mensagem é "A oferta informada não pertence à sua conta.". É o que você recebe quando o creator da credencial não é dono nem da comunidade nem da carteira vinculada à oferta.

**`404 offer_not_found`:** a oferta ou o plano não chegaram a ser resolvidos. Três causas:

- o `offerId` ou o `planId` não existem;
- o plano foi desativado, em geral porque o preço mudou (veja acima);
- o produto ainda não está ativo: sem oferta publicada ou sem carteira aprovada.

O primeiro passo do diagnóstico é o mesmo nos dois casos: chame `GET /v1/offers` e veja o que a sua credencial realmente enxerga.

## Próximos passos

- [Quickstart](./quickstart.md): do token à primeira cobrança.
