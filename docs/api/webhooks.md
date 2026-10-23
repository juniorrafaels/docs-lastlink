---
sidebar_position: 1
title: Webhooks
---

# Webhooks

O pagamento PIX é confirmado de forma assíncrona. A criação devolve o QR na hora (status `PENDING`); quando o pagador paga, entregamos um webhook para a URL que você registrou.

## Eventos

| Evento | Quando dispara |
| --- | --- |
| `pix.paid` | O pagador pagou a cobrança. |
| `pix.refunded` | A devolução foi concluída: o dinheiro voltou ao pagador. |

Não aceitamos assinatura para eventos que ainda não emitimos. Se você enviar um evento fora desta tabela, o cadastro é recusado com `400 invalid_events`. Preferimos a recusa a aceitar um cadastro que nunca entregaria nada.

## Registrar uma assinatura

```bash
curl https://api.lastlink.com/v1/webhooks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "url": "https://seu-sistema.com/webhooks/lastlink", "events": ["pix.paid", "pix.refunded"] }'
```

A resposta inclui um `secret` (exibido uma única vez) usado para assinar as entregas.

## Verificar a assinatura

Cada entrega traz três headers:

| Header | Conteúdo |
| --- | --- |
| `X-Lastlink-Signature` | `t=<timestamp>,v1=<hmac_hex>` |
| `X-Lastlink-Timestamp` | O mesmo timestamp (Unix, em segundos). |
| `X-Lastlink-Event` | O tipo do evento, para rotear sem abrir o corpo. |

O HMAC-SHA256 é calculado sobre `<timestamp>.<corpo exato>`, com o ponto no meio, e sobre os bytes recebidos, não sobre um JSON reserializado. Compare em tempo constante:

```python
import hmac, hashlib
def valido(corpo: bytes, header: str, secret: str) -> bool:
    partes = dict(p.split("=", 1) for p in header.split(","))
    assinado = f"{partes['t']}.".encode() + corpo
    esperado = hmac.new(secret.encode(), assinado, hashlib.sha256).hexdigest()
    return hmac.compare_digest(esperado, partes["v1"])
```

Rejeite entregas cujo `t` esteja muito distante do seu relógio (sugerimos 5 minutos). É o que impede o *replay* de uma entrega antiga legitimamente assinada.

## Formato da entrega

Todo evento chega no mesmo envelope; o que muda é o `data`.

### pix.paid

```json
{
  "id": "3f2a91c47e5b4d08a1c6f0d29b7e4a15",
  "type": "pix.paid",
  "createdAt": "2026-08-19T12:20:00Z",
  "data": {
    "chargeId": "0b51e91a-2552-4128-8e7f-f8b5410d8746",
    "status": "PAID",
    "paidAt": "2026-08-19T12:20:00Z",
    "gatewayTransactionId": "...",
    "externalReference": "pedido-8842"
  }
}
```

O `id` é determinístico por (cobrança, evento) e tem 32 caracteres hexadecimais: uma reentrega do mesmo fato chega com o mesmo `id`, e eventos diferentes da mesma cobrança têm `id` diferente. Use-o para deduplicar, pois a entrega é *at-least-once*.

### pix.refunded

```json
{
  "id": "b8c41d0f7a2e4c93b5d6e8f1a0c3b729",
  "type": "pix.refunded",
  "createdAt": "2026-09-15T18:47:28Z",
  "data": {
    "chargeId": "0b51e91a-2552-4128-8e7f-f8b5410d8746",
    "refundId": "ade60595-a56e-4b3d-9dda-524591415b7f",
    "refundedAt": "2026-09-15T18:47:27Z",
    "amountCents": 1500,
    "gatewayTransactionId": "...",
    "externalReference": "pedido-8842"
  }
}
```

O `refundId` é o mesmo devolvido pelo `POST /v1/charges/{id}/refund`. Este evento é o único momento em que a devolução pode ser anunciada ao seu cliente: o `POST` responde `PROCESSING` porque ali nada saiu ainda (veja [Reembolso](./reembolso.md)).

O `data` do `pix.refunded` não repete o status da cobrança. O contrato tem quatro estados (`PENDING`, `PAID`, `EXPIRED`, `CANCELLED`) e nenhum deles é "devolvido"; quem afirma o que aconteceu é o `type` do evento.

## Convivência com os webhooks Lastlink existentes

Se você (ou o creator) já usa os webhooks da plataforma Lastlink (cadastrados no dashboard, com eventos como `Purchase_Order_Confirmed`), eles continuam funcionando normalmente. Um pagamento criado por esta API é um pagamento real na plataforma e dispara os mesmos eventos de sempre. Nada muda para integrações existentes.

Consequência prática: quem mantém os dois cadastros recebe duas notificações para o mesmo pagamento. São o evento da plataforma (semântica de pedido/compra) e o `pix.paid` desta API (semântica de cobrança, assinado com HMAC). Para evitar dupla contabilização, concilie por um único canal. Recomendamos o `pix.paid` + `externalReference` para integrações *server-to-server* desta API. Se você não cadastrar nenhuma assinatura aqui, segue recebendo apenas os webhooks da plataforma, como hoje.

## Entrega e retries

- Entrega assinada (HMAC) e com *retry* em caso de falha.
- Responda `2xx` rapidamente e processe de forma assíncrona do seu lado.
- Só HTTPS é aceito no cadastro da URL (proteção contra SSRF).
