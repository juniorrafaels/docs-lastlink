---
sidebar_position: 3
title: Reembolso
---

# Reembolso

Você pode devolver uma cobrança PIX paga. A devolução é sempre total.

:::info Versão
Disponível a partir da v1.1.
:::

## Dois modos

Quem chama a API é o próprio creator, devolvendo ao cliente dele. Por isso existem dois caminhos, escolhidos por um campo do corpo:

| `autoApprove` | O que acontece |
| --- | --- |
| `true` | Você aprova no ato e a devolução segue direto para execução. |
| ausente ou `false` | Abre uma solicitação, que passa pela avaliação padrão da Lastlink, o mesmo fluxo de um reembolso pedido pelo comprador. |

## Devolver agora

```bash
curl -X POST https://api.lastlink.com/v1/charges/9f3b1c7a-2d64-4f81-a0b5-6e2c8d4a7f13/refund \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "autoApprove": true }'
```

Resposta:

```json
{
  "refundId": "0ffcb776-c343-4fcf-99f9-c50b31ddb037",
  "chargeId": "9f3b1c7a-2d64-4f81-a0b5-6e2c8d4a7f13",
  "status": "PROCESSING",
  "amount": 1500,
  "createdAt": "2026-09-14T23:53:23Z",
  "refundedAt": null
}
```

## Consultar devoluções

```bash
curl https://api.lastlink.com/v1/charges/9f3b1c7a-2d64-4f81-a0b5-6e2c8d4a7f13/refunds \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## A devolução nunca é imediata

Mesmo aprovada, ela depende do saldo na carteira e da resposta do provedor. Por isso o status nunca nasce `COMPLETED`:

| Status | Significa |
| --- | --- |
| `UNDER_REVIEW` | Aguardando a avaliação da Lastlink. |
| `PROCESSING` | Aprovada, a caminho do provedor. |
| `COMPLETED` | O dinheiro voltou ao pagador (`refundedAt` preenchido). |
| `REJECTED` | Recusada na avaliação. |
| `FAILED` | Recusada pelo provedor (prazo, saldo, regra do PSP). |
| `CANCELLED` | Cancelada antes de executar. |

Não anuncie a devolução ao seu cliente antes de ver `COMPLETED`. Acompanhe pelo `GET /refunds` ou pelo webhook.

## Regras

- Só a carteira dona da cobrança pode devolver; qualquer outra recebe `404`, igual a uma cobrança inexistente.
- A cobrança precisa estar `PAID`.
- Devolução parcial não é suportada. O campo `amount` só é aceito quando igual ao total da cobrança, para quem prefere ser explícito; o normal é omiti-lo. Um valor positivo diferente do total retorna `400 partial_refund_not_supported`; zero ou negativo retorna `400 invalid_amount`.
- Repetir o request é seguro: a mesma devolução volta com `200` em vez de `201`, sem criar outra. Use isso depois de um timeout de rede, em vez de checar antes se já existe.
- A conclusão da devolução também gera um webhook.
