---
sidebar_position: 1
title: Introdução
---

# Lastlink Public Payments API

A API pública da Lastlink permite que o seu backend crie cobranças PIX *server-to-server*, acompanhe o status, receba a confirmação por webhook e gerencie credenciais, com um contrato REST estável e versionado (`/v1`).

:::warning Produção
A API está disponível apenas em produção. As chamadas criam cobranças PIX reais.
:::

## Antes de começar

A API cobra o que já existe no seu catálogo Lastlink; ela não cria produtos. Antes da primeira chamada, você precisa ter na sua conta:

- um produto com uma oferta publicada;
- ao menos um plano ativo nessa oferta;
- uma carteira de recebimento vinculada e aprovada. Sem ela, o produto não é ativado e não vende.

## Comece em 4 passos

| Passo | O que fazer | Onde |
| --- | --- | --- |
| 1. Autenticar | Trocar `client_id`/`client_secret` por um `access_token` | [Autenticação](./autenticacao.md) |
| 2. Descobrir | `GET /v1/offers` para obter o `offerId` e o `planId` ativo | [Ofertas e planos](./ofertas-e-planos.md) |
| 3. Cobrar | `POST /v1/charges` retorna o QR Code e o status `PENDING` | [Quickstart](./quickstart.md) |
| 4. Confirmar | Receber o webhook `pix.paid` quando o pagador pagar | [Webhooks](./webhooks.md) |

## Ambientes

Veja a página [Ambientes](./ambientes.md).

| Ambiente | Base URL |
| --- | --- |
| Produção | `https://api.lastlink.com` |

## Por que é seguro por construção

- **Isolamento por tenant:** a cobrança nasce sob a carteira do seu token. Você não envia `creatorId` nem `walletId`; eles vêm da credencial. Ninguém cobra em nome de outro.
- **Idempotência:** `POST /v1/charges` exige o header `Idempotency-Key`. A mesma chave nunca duplica a cobrança. Veja [Idempotência](./idempotencia.md).
- **Valores no servidor:** preço, split e carteira são resolvidos a partir de `planId` + `offerId`. Você não envia valores; eles vêm da sua oferta. Veja [Ofertas e planos](./ofertas-e-planos.md).

## Recursos

- **Ofertas:** listar o catálogo cobrável e resolver o `planId` ativo.
- **Cobranças:** criar, consultar, listar (com filtros) e cancelar.
- **Webhooks:** registrar URLs de callback com assinatura HMAC.
- **Credenciais:** criar e revogar *clients* (management plane).
- **SDKs:** PHP, TypeScript/Node e Python, gerados a partir do OpenAPI.

Fonte oficial: [api.lastlink.com/docs/introducao](https://api.lastlink.com/docs/introducao).
