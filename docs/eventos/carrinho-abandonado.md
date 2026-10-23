---
sidebar_position: 1
title: Carrinho Abandonado
description: Regras de disparo, campos e exemplo do webhook Abandoned_Cart da Lastlink.
---

# Carrinho Abandonado

O evento `Abandoned_Cart` informa o abandono de um checkout com e-mail preenchido, sujeito à janela de inatividade e às condições da oferta descritas abaixo.

## Quando é disparado

O evento é disparado para quem deixou o **e-mail no checkout** e ficou **de 30 minutos a 6 horas sem atualizar o checkout**, desde que não tenha assinatura ativa ou pendente de renovação naquela oferta.

A rotina executa a cada **2 minutos**. O limite é de **um evento por combinação de e-mail, oferta e dia**.

### Meios de pagamento e condições

Não há filtro por meio de pagamento. Quem gerou Pix ou boleto e não pagou pode receber o evento; quem teve o cartão recusado também pode. Uma compra com cartão aprovado não atende ao cenário de abandono descrito.

Consulte também o [resumo dos gatilhos](../gatilhos-dos-eventos.md#carrinho-abandonado) e as [regras de distribuição e entrega](../regras.md#distribuição-dos-eventos).

:::important Dados disponíveis neste evento
O payload não inclui preço nem método de pagamento selecionado. Nome e telefone dependem do preenchimento no checkout.
:::

## Como usar os dados do evento

Use `Data.Buyer.Email` para identificar o contato e `Data.Offer.Id` para identificar a oferta abandonada. `Data.Offer.Url` fornece o link da oferta para uma eventual ação de recuperação. Prepare a mensagem para funcionar sem nome ou telefone, pois esses dados dependem do preenchimento no checkout.

Para acompanhar uma compra posterior, uma integração pode correlacionar o e-mail e a oferta com os dados de [Compra Completa](./compra-aprovada.mdx). Essa correlação é uma estratégia da integração; o recebimento de um abandono não comprova pagamento.

## Estrutura do payload

Os nomes dos campos abaixo correspondem às chaves do JSON, incluindo letras maiúsculas e minúsculas.

### Campos principais

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Id` | `string` | Identificador do webhook. |
| `IsTest` | `boolean` | Indica se é um evento de teste: `true` para teste e `false` para um evento real. |
| `Event` | `string` | Nome do evento. Para carrinho abandonado, o valor é `Abandoned_Cart`. |
| `CreatedAt` | `string` | Data e hora em que o evento foi criado. Exemplo: `2026-10-22T13:04:56`. |
| `Data` | `object` | Agrupa os produtos, os dados do usuário, a oferta e os parâmetros de rastreamento relacionados ao abandono. |

### Produtos — `Data.Products`

`Products` é uma lista com os produtos envolvidos na operação. Neste evento, representa os produtos do checkout abandonado.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Data.Products` | `array<object>` | Lista de produtos envolvidos na operação. |
| `Data.Products[].Id` | `string` | Identificador do produto. |
| `Data.Products[].Name` | `string` | Nome do produto. |
| `Data.Products[].Quantity` | `number` | Quantidade do produto no checkout abandonado. É útil, por exemplo, para produtos que permitem selecionar vários ingressos. |

### Usuário — `Data.Buyer`

Apesar do nome `Buyer`, neste evento o objeto contém os dados do usuário que iniciou o checkout e abandonou a compra. Sua presença não indica uma compra concluída.

:::info Preenchimento dos dados de Buyer
Em todos os webhooks, o **e-mail é o dado mínimo e obrigatório**. Os demais dados de formulário dependem dos campos habilitados pelo produtor e preenchidos pelo usuário; se um desses dados não estiver em `Buyer`, ele não foi informado no checkout.

Os campos de endereço só são enviados se estiverem habilitados no formulário de checkout e tiverem sido preenchidos. O exemplo deste evento apresenta e-mail, nome e telefone. Consulte também as [regras gerais de dados do comprador](../webhooks.md#dados-do-comprador-no-checkout).
:::

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Data.Buyer` | `object` | Dados do usuário que abandonou o checkout. |
| `Data.Buyer.Email` | `string` | E-mail preenchido pelo usuário. O preenchimento do e-mail é uma condição para o disparo do evento. |
| `Data.Buyer.Name` | `string` | Nome do usuário, enviado caso tenha sido preenchido. |
| `Data.Buyer.PhoneNumber` | `string` | Telefone do usuário, enviado caso tenha sido preenchido. |

### Oferta — `Data.Offer`

Contém a oferta associada ao checkout abandonado.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `Data.Offer` | `object` | Dados da oferta acessada pelo usuário. |
| `Data.Offer.Id` | `string` | Identificador da oferta. |
| `Data.Offer.Name` | `string` | Nome da oferta. |
| `Data.Offer.Url` | `string` | Link da oferta ou do checkout. |

### Rastreamento — `Data.Utm`

O objeto `Utm` reúne os parâmetros de rastreamento presentes na URL da oferta no momento do carrinho abandonado.

| Campo | Tipo | Parâmetro na URL | Descrição |
| --- | --- | --- | --- |
| `Data.Utm` | `object` | — | Agrupa os parâmetros de rastreamento. |
| `Data.Utm.UtmSource` | `string` | `utm_source` | Origem do tráfego informada na URL. |
| `Data.Utm.UtmMedium` | `string` | `utm_medium` | Meio de divulgação informado na URL. |
| `Data.Utm.UtmCampaign` | `string` | `utm_campaign` | Campanha informada na URL. |
| `Data.Utm.UtmTerm` | `string` | `utm_term` | Termo de rastreamento informado na URL. |
| `Data.Utm.UtmContent` | `string` | `utm_content` | Conteúdo ou variação de divulgação informado na URL. |
| `Data.Utm.Src` | `string` | `src` | Valor do parâmetro adicional de rastreamento `src`. No exemplo, `blog`. |
| `Data.Utm.Sck` | `string` | `sck` | Valor do parâmetro adicional de rastreamento `sck`. No exemplo, `form_button`. |
| `Data.Utm.Vtid` | `string` | `vtid` | Parâmetro de rastreamento da VTurb. |

## Exemplo de payload

O exemplo abaixo representa um **evento de teste**, pois `IsTest` está definido como `true`.

```json
{
  "Id": "541cf610-8bcb-450f-84b6-ce591874f8ce",
  "IsTest": true,
  "Event": "Abandoned_Cart",
  "CreatedAt": "2026-10-22T13:04:56",
  "Data": {
    "Products": [
      {
        "Id": "a19d6d30-7f0c-4ea6-ab05-c4d3fc495cbb",
        "Name": "Meu Produto Lastlink",
        "Quantity": 1
      }
    ],
    "Buyer": {
      "Email": "test.email@mail.com",
      "Name": "João da Silva",
      "PhoneNumber": "+5500987645312"
    },
    "Offer": {
      "Id": "a19d6d30-7f0c-4ea6-ab05-c4d3fc495cbb",
      "Name": "Minha oferta",
      "Url": "https://lastlink.com/p/ABC123AB"
    },
    "Utm": {
      "UtmSource": "utm_source",
      "UtmMedium": "utm_medium",
      "UtmCampaign": "utm_campaign",
      "UtmTerm": "utm_term",
      "UtmContent": "utm_content",
      "Src": "blog",
      "Sck": "form_button",
      "Vtid": "00001-000002-000102"
    }
  }
}
```
