---
sidebar_position: 1
title: Idempotência
---

# Idempotência

Criar uma cobrança é uma operação sensível: uma retentativa de rede não pode gerar duas cobranças. Por isso, `POST /v1/charges` exige o header `Idempotency-Key`.

## Como usar

Gere uma chave única por intenção de cobrança (por exemplo, o id do pedido no seu sistema) e reenvie a mesma chave em caso de retry:

```bash
curl https://api.lastlink.com/v1/charges \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Idempotency-Key: pedido-8842" \
  -H "Content-Type: application/json" \
  -d '{ "type": "pix", "planId": "...", "offerId": "...", "buyer": { "email": "ana@ex.com", "document": "12345678909" } }'
```

## Garantias

- **Mesma chave + mesmo corpo → mesma cobrança.** Uma segunda requisição com o mesmo `Idempotency-Key` e o mesmo corpo retorna a cobrança já criada (mesmo `chargeId` e QR), sem criar outra. Espaços e ordem dos campos não contam; o que conta são os valores.
- **Concorrência.** Duas requisições simultâneas com a mesma chave resultam em uma única cobrança.
- **Escopo.** A chave é validada dentro da sua carteira.
- **Corpo diferente, chave repetida.** Uma chave já usada com outro corpo nunca devolve a cobrança anterior: ou responde `409 idempotency_key_reuse`, ou cria uma cobrança nova. O que não acontece é você receber a cobrança antiga acreditando ter cobrado o novo valor.

Uma chave é uma intenção de cobrança: para cobrar outra coisa, gere uma chave nova em vez de reaproveitar a anterior.

:::warning externalReference
O `externalReference` também deduplica, em outro nível: uma cobrança pendente com a mesma referência externa pode ser reaproveitada em vez de criar outra. Use referências distintas para cobranças distintas. Repetir a referência de um pedido anterior pode devolver a cobrança dele, mesmo com um `Idempotency-Key` novo.
:::

## Boas práticas

- Use um identificador estável do seu domínio (id do pedido), não um valor aleatório por retry.
- Trate a resposta de uma repetição como sucesso: ela devolve o estado atual da cobrança.
