---
sidebar_position: 2
title: Paginação & filtros
---

# Paginação & filtros

`GET /v1/charges` retorna suas cobranças de forma paginada e filtrável, o que é útil para reconciliação.

## Filtros

| Parâmetro | Descrição |
| --- | --- |
| `status` | `PENDING` · `PAID` · `EXPIRED` · `CANCELLED` |
| `createdFrom` / `createdTo` | Intervalo de criação (ISO 8601) |
| `externalReference` | Seu identificador do pedido |
| `limit` | Itens por página (padrão 20, máximo 100) |
| `cursor` | Cursor da próxima página |

## Exemplo

```bash
curl "https://api.lastlink.com/v1/charges?status=PAID&limit=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "data": [ { "chargeId": "9f3b1c7a-2d64-4f81-a0b5-6e2c8d4a7f13", "status": "PAID", "externalReference": "pedido-1" } ],
  "nextCursor": "eyJpZCI6..."
}
```

Para a próxima página, repita a chamada com `cursor=eyJpZCI6...`. Quando `nextCursor` for `null`, não há mais páginas. Toda listagem é escopada à sua carteira.
