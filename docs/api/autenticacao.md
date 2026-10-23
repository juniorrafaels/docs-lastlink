---
sidebar_position: 4
title: Autenticação
---

# Autenticação

A API usa OAuth2 *client-credentials*. Você troca suas credenciais de cliente (`client_id` / `client_secret`) por um `access_token` de curta duração e o envia em cada requisição no header `Authorization: Bearer {access_token}`.

## 1. Obtenha o token

```bash
curl -X POST https://api.lastlink.com/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

Resposta:

```json
{ "access_token": "eyJhbGciOi...", "expires_in": 300, "token_type": "Bearer" }
```

## 2. Use o token

```bash
curl https://api.lastlink.com/v1/charges \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Idempotency-Key: pedido-8842" \
  -H "Content-Type: application/json" \
  -d '{ "type": "pix", "planId": "...", "offerId": "...", "buyer": { "email": "ana@ex.com", "document": "12345678909" } }'
```

## No Postman, o token é automático

A collection e o environment já resolvem o token sozinhos: você não precisa chamar `/oauth/token` à mão nem colar o `access_token` em lugar nenhum.

1. Importe os dois arquivos no Postman (collection e environment) e selecione o environment.
2. Preencha só `clientId` e `clientSecret`. O `client_secret` aparece uma única vez, na criação da credencial.
3. Dispare qualquer request.

Antes de cada requisição, um script da collection olha o `accessToken` guardado no environment e, se ele estiver vazio ou a menos de 30 segundos de expirar, busca um novo em `{{tokenUrl}}` e grava `accessToken` e `tokenExpiresAt` no environment. A autenticação da collection é `Bearer {{accessToken}}`, então todo request já sai autenticado.

Se preferir ver o token, o request **Z. Referencia por recurso → 0. Auth → 0. Auth - get token (client_credentials)** faz a mesma troca de forma explícita e salva as mesmas variáveis.

Faltando `clientId` ou `clientSecret`, o script falha com uma mensagem dizendo qual variável falta, em vez de deixar a requisição sair sem token e devolver `401`.

## Tenant por construção

O token carrega o vínculo com a sua carteira. Toda cobrança, listagem e consulta é automaticamente escopada a ela. Você não informa `creatorId`/`walletId`, e qualquer tentativa de enviá-los no corpo é ignorada.

## Como obter suas credenciais

**Primeira credencial, pelo painel.** No painel do creator, vá em **Minha conta → API → Gestão de credenciais** e clique em **Criar credencial**. Dê um nome que identifique onde ela será usada (por exemplo, "Integração ERP") e confirme. O `client_id` e o `client_secret` aparecem na hora. O `client_secret` é exibido apenas uma vez; copie e guarde em local seguro.

**Credenciais adicionais, pela API.** Com uma credencial ativa, o dono da carteira pode criar e revogar outras pelo *management plane*: `POST /v1/clients` e `DELETE /v1/clients/{id}`. Essas rotas exigem o escopo `clients:admin` (privilégio do dono da carteira), diferente do `charges:write`, usado nas cobranças.

**Troca planejada (periódica).** Crie uma credencial nova, passe a usá-la e só então revogue a antiga. Assim a integração não fica fora do ar na troca.

**Suspeita de vazamento.** Revogue a credencial antiga imediatamente, mesmo que a integração pare, e só depois crie a nova. Manter um secret vazado ativo durante a migração deixa a carteira exposta.
