---
sidebar_position: 5
title: Ambientes
---

# Ambientes

:::info Sem sandbox por enquanto
A API está disponível apenas em produção. Um ambiente de sandbox poderá ser adicionado futuramente.
:::

| Ambiente | Base URL da API | Endpoint de token |
| --- | --- | --- |
| Produção | `https://api.lastlink.com` | `https://api.lastlink.com/oauth/token` |

:::warning Atenção
Produção cria cobranças PIX reais.
:::

## Credenciais

As credenciais de cliente (`client_id`/`client_secret`) são geradas na tela **Developers** e trocadas por um `access_token` no endpoint de token acima. Veja [Autenticação](./autenticacao.md).
