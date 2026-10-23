---
sidebar_position: 1
title: Erros
---

# Erros

A API usa códigos HTTP convencionais e devolve erros no formato RFC 7807 (`application/problem+json`).

## Códigos comuns

| HTTP | Significado | Quando |
| --- | --- | --- |
| `200` / `201` | Sucesso | Operação concluída. |
| `400` | Requisição inválida | JSON malformado; `invalid_events` (evento de webhook fora dos emitidos; veja [Webhooks](./webhooks.md)); `partial_refund_not_supported` (reembolso com valor diferente do total da cobrança; veja [Reembolso](./reembolso.md)); `invalid_amount` (reembolso com valor zero ou negativo). |
| `401` | Não autenticado | Token ausente, expirado ou inválido. |
| `403` | Sem permissão | Escopo insuficiente, recurso de outra carteira, ou `offer_not_owned`: a oferta existe, mas não é da sua conta. |
| `404` | Não encontrado | Cobrança inexistente na sua carteira, ou `offer_not_found`: a oferta ou o plano não existe, o plano foi desativado (o preço mudou), ou o produto ainda não está ativo (sem oferta ou sem carteira aprovada). Confira em `GET /v1/offers`; veja [Ofertas e planos](./ofertas-e-planos.md). |
| `409` | Conflito | Cancelar uma cobrança já paga; `idempotency_key_reuse` (`Idempotency-Key` já usada com outro corpo; veja [Idempotência](./idempotencia.md)). |
| `422` | Entidade não processável | `type` ausente (`type_required`) ou método de pagamento não suportado (`unsupported_payment_type`). |
| `429` | Rate limit | Excedeu o limite de requisições. |
| `503` | Serviço indisponível | A integração necessária não está disponível neste ambiente: o motor de cobrança não configurado (`engine_unavailable`) ou inalcançável (`engine_unreachable`) e, no caso de devolução, a integração de refund ainda não existe. Não é erro da sua requisição; repita depois. |

## Formato

```json
{
  "type": "https://api.lastlink.com/errors/validation",
  "title": "unsupported_payment_type",
  "status": 422,
  "code": "unsupported_payment_type",
  "detail": "Apenas PIX é suportado no momento.",
  "traceId": "00-abc..."
}
```

## Boas práticas

- Trate `429` com *backoff* exponencial.
- Repita requisições de criação com o mesmo `Idempotency-Key` (nunca gera duplicidade). Veja [Idempotência](./idempotencia.md).
- Use o `traceId` ao abrir chamado de suporte.
