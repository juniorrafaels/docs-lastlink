---
title: Autenticação
description: Como validar que um webhook foi enviado pela Lastlink usando o token da integração.
---

# Autenticação

Cada webhook enviado pela Lastlink carrega o **token da sua integração** no header `x-lastlink-token`. Use esse token para confirmar que a chamada recebida foi enviada pela Lastlink antes de processar o evento.

## Onde encontrar o token

O token é disponibilizado na **tela de integração** da plataforma. Guarde-o em local seguro no seu servidor, como uma variável de ambiente ou um cofre de segredos, e não o exponha em código-fonte, front-end ou repositórios.

## Como a Lastlink envia o token

O token vai no header `x-lastlink-token` de toda requisição `POST` de webhook:

```http
POST /
accept: application/json
content-type: application/json; charset=utf-8
x-lastlink-token: SEU_TOKEN_DA_INTEGRACAO
```

Substitua `SEU_TOKEN_DA_INTEGRACAO` pelo token disponibilizado na plataforma. O caminho `/` é só ilustrativo: o webhook chega na rota correspondente à URL configurada para a integração.

## Como validar

1. Armazene no servidor o token disponibilizado pela Lastlink para a integração.
2. Leia o valor do header `x-lastlink-token` da requisição recebida.
3. Compare o valor recebido com o token armazenado **antes** de processar o evento.
4. Se o token estiver ausente ou for diferente, rejeite a chamada e não processe o corpo.

```js
app.post('/webhooks/lastlink', (req, res) => {
  const recebido = req.get('x-lastlink-token');

  if (!recebido || recebido !== process.env.LASTLINK_WEBHOOK_TOKEN) {
    return res.sendStatus(401);
  }

  // Registre a entrega de forma confiável e responda 2xx.
  res.sendStatus(200);
});
```

:::tip Boas práticas
- Valide o token antes de qualquer outra etapa.
- Use uma comparação em tempo constante (por exemplo, `crypto.timingSafeEqual`) quando a sua linguagem oferecer.
- Não registre o token em logs.
:::

## O que acontece quando a validação falha

Uma resposta fora de `2xx` é tratada pela Lastlink como falha de entrega e aciona as [retentativas](./retentativas.md). Rejeitar chamadas com token inválido é o comportamento esperado para requisições que não vieram da Lastlink; para chamadas legítimas, confira se o token configurado no seu servidor é o mesmo da tela de integração.

## Próximos passos

- [Retentativas](./retentativas.md): timeout e intervalos de reenvio.
- [Regras](./regras.md): envio HTTP, distribuição dos eventos e processamento no recebimento.
