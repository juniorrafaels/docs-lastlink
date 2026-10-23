---
title: Retentativas
description: Timeout, critério de sucesso e intervalos de reenvio dos webhooks da Lastlink.
---

# Retentativas

Quando a entrega de um webhook falha, a Lastlink tenta enviá-lo novamente. Esta página descreve o que conta como sucesso, o que conta como falha e em que intervalos os reenvios acontecem.

## O que conta como sucesso ou falha

O timeout de cada envio HTTP é de **10 segundos**.

| Resposta do seu servidor | Resultado |
| --- | --- |
| `2xx` dentro de 10 segundos | Entrega confirmada. |
| Qualquer resposta fora de `2xx` (incluindo `401`, `404` e `410`) | Falha de entrega. |
| Timeout ou falha de conexão | Falha de entrega. |

## Intervalos entre as tentativas

Após uma falha, os intervalos entre as tentativas são:

| Tentativa de reenvio | Espera após a falha anterior |
| --- | --- |
| 1ª | 1 minuto |
| 2ª | 5 minutos |
| 3ª | 10 minutos |
| 4ª | 30 minutos |
| 5ª | 60 minutos |
| 6ª | 120 minutos |
| 7ª em diante | 240 minutos |

Depois da sequência, o intervalo permanece em **240 minutos** até o fim do prazo de retenção configurado no ambiente. Esses intervalos não estabelecem um número fixo de tentativas nem uma duração universal de 24 ou 28 horas.

## Preparação do payload não é retentativa

Em `Purchase_Request_Confirmed` com Pix ou boleto, a plataforma aguarda o QR Code ou a linha digitável por até **10 tentativas** antes do envio. Sem esses dados ao final das tentativas, o evento é descartado.

Essa espera acontece **antes** do envio HTTP e é diferente de reenviar um `POST` que falhou: as dez tentativas não são o limite de retentativas de entrega.

## Como se preparar

1. Responda `2xx` assim que registrar a entrega de forma confiável, sem esperar a regra de negócio terminar.
2. Para operações demoradas, processe de forma assíncrona: o limite é de 10 segundos.
3. Trate a possibilidade de **receber o mesmo evento mais de uma vez** e evite executar a mesma ação duas vezes.
4. Valide o [token da integração](./autenticacao.md) antes de processar. Uma resposta de falha aciona novas tentativas, inclusive para chamadas rejeitadas por token inválido.
5. Se o seu servidor ficar fora do ar, os eventos continuam sendo reenviados nos intervalos acima enquanto durar o prazo de retenção.

## Próximos passos

- [Autenticação](./autenticacao.md): validação do token da integração.
- [Regras](./regras.md): distribuição dos eventos e processamento no recebimento.
