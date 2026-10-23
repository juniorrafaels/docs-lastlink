---
title: Percepções do cliente
description: Sugestões de melhoria da documentação pública de webhooks a partir de um relatório externo.
slug: /percepcoes-do-cliente
---

# Percepções do cliente

Esta página reúne contribuições de relatórios e levantamentos técnicos recebidos em **22/10/2026** que podem melhorar a documentação pública dos webhooks. Foram selecionados pontos sobre clareza, contratos, exemplos e comportamento de entrega.

As observações sobre produção são **relatos a validar**, com o contexto da amostra analisada. Não representam garantias de presença ou ausência de campos em todos os ambientes. As propostas ficam registradas aqui para revisão; as definições atuais continuam nos artigos, em [Regras](./regras.md) e no [Catálogo de variáveis](./catalogo-de-variaveis.md).

## Definições confirmadas após a revisão

Em 22/10/2026, o usuário esclareceu três pontos dos materiais recebidos:

| Campo | Definição adotada |
| --- | --- |
| `Data.Purchase.PaymentDate` | Data e hora do pagamento, inclusive a referência ao pagamento original em reembolso, chargeback e término da garantia. |
| `Data.Purchase.Price.Value` | Valor final da compra, considerando descontos e incluindo juros quando aplicáveis. |
| `Data.Subscriptions[].Cycle` | Ciclo da assinatura, usado para acompanhar suas renovações. |

Essas definições foram incorporadas aos artigos, às [Regras](./regras.md) e ao catálogo. Permanecem em investigação as diferenças dos valores recebidos, o momento de preenchimento dos juros e os detalhes da contagem inicial e do incremento de `Cycle`. A confirmação não valida a hipótese de que o acesso só poderia começar depois da quitação integral de todas as parcelas.

## Gatilhos definidos após o levantamento

Em 22/10/2026, o usuário forneceu os gatilhos e as restrições por meio de pagamento. Essas definições passaram a constar em [Gatilhos dos eventos](./gatilhos-dos-eventos.md), nos artigos e nas [Regras](./regras.md). Os horários das rotinas foram confirmados como horário de Brasília; o prazo do produto pode ser de 7, 15 ou 30 dias.

Essa confirmação substitui as pendências anteriores desta página sobre seleção por webhook ativo, evento e produto; timeout de 10 segundos; sequência de retentativas até a retenção configurada; gatilhos de cancelamento e expiração; solicitação de reembolso somente em avaliação manual; e correspondência dos eventos de acesso pago. O identificador de Notificar Membro Ativo foi definido como `Notify_Active_Member`, sem disparador de produção. Não foi fornecido um payload desse identificador.

Os relatos sobre notificação antecipada da garantia e cancelamento sem evento no reembolso Yuno foram centralizados em [Débitos técnicos](./debitos-tecnicos.md). A possibilidade de duplicidade entre os dois disparadores de carrinho é uma hipótese por código, sem medição em produção. Os registros históricos abaixo devem ser lidos considerando essas definições posteriores.

## Contribuições prioritárias para a documentação pública

| Tema | Contribuição útil | Situação nesta documentação |
| --- | --- | --- |
| Identificadores exatos | Manter uma referência única de eventos e campos, respeitando grafia e caixa. | Os identificadores já estão separados por evento; vale manter essa consistência em guias, tabelas e exemplos. |
| Escolha dos eventos de acesso | Explicar a relação entre o evento com `Action` e os eventos separados de início e fim do acesso. | Correspondência confirmada para acessos pagos; convidados geram somente o formato específico de acesso. Artigos e regras atualizados. |
| Entrega e reenvio | Documentar tentativas, intervalos, falhas, timeout e respostas HTTP esperadas. | Timeout de 10 segundos e sequência de retentativas documentados. O prazo de retenção depende da configuração do ambiente. |
| Duplicidade e idempotência | Explicar como reconhecer a mesma notificação e a mesma operação de negócio. | A política ainda precisa ser confirmada. |
| Token | Explicar validação, escopo e eventual troca do token. | O uso de `x-lastlink-token` já está descrito; escopo e ciclo de vida ainda precisam de confirmação. |
| Campos opcionais | Separar campos obrigatórios, condicionais, ausentes, nulos e objetos vazios por evento. | Há regras e pendências registradas; o relatório sugere ampliar a matriz por evento e cenário. |
| Datas | Definir fuso, precisão e significado das datas. | **A confirmar**, com diferenças já observadas entre testes e produção. |
| Cobertura do catálogo | Incluir campos reais com significado, tipo, valores e condições confirmados. | Há campos em confirmação e dois nomes adicionais citados no relatório sem payload de apoio. |
| Notificar Membro Ativo | Publicar identificador, gatilho, estrutura e exemplo. | Identificador confirmado: `Notify_Active_Member`, sem disparador em produção. Não foi fornecido um payload para catalogar seus campos. |

## Identificadores, nomes e exemplos consistentes

A documentação pública deve permitir copiar os nomes técnicos diretamente para uma integração. Os rótulos exibidos na interface e os valores enviados em `Event` devem aparecer em colunas distintas.

| Evento ou campo | Referência técnica já adotada |
| --- | --- |
| Liberação e remoção de acesso | `Subscription_Product_Access`, com `Data.Action` igual a `Add` ou `Remove`. |
| Início liberação de acesso | `Product_Access_Started`. |
| Fim liberação de acesso | `Product_Access_Ended`. |
| Compra Completa | `Purchase_Order_Confirmed`. |
| URLs da compra | `InvoiceUrl` e `OriginUrl`. |
| Parâmetros adicionais de rastreamento | `Src` e `Sck`. |
| Objetos e datas de acesso | `Commissions`, `DeviceInfo`, `AccessType`, `AccessStartedAt` e `AccessEndedAt`. |
| IP | A chave atual é `ip`, em minúsculas. |

O relatório aponta grafias alternativas em materiais anteriores, como `Subscription_Product_Acess`, `Product_access_started` e `Product_access_ended`. A contribuição para os guias é manter tabela, descrição e exemplo com a mesma referência técnica.

O nome `Payment_Completed`, citado no relatório como exemplo de outra página, não está no inventário atual desta documentação. Os exemplos de compra paga podem utilizar o identificador já catalogado `Purchase_Order_Confirmed`. A ausência em uma amostra não comprova, isoladamente, a inexistência de um evento em toda a plataforma.

A sugestão de transformar `ip` em `Ip` deve ser tratada como uma possível mudança de contrato, com avaliação de compatibilidade. Para descrever o comportamento atual, vale a chave enviada no JSON.

## Relação entre os três eventos de acesso

O cliente relata correspondências frequentes entre `Subscription_Product_Access` e os eventos separados `Product_Access_Started` ou `Product_Access_Ended`, correlacionando assinatura, produto e horário.

Esse achado é útil para preparar um guia de escolha dos eventos. Receber duas representações do mesmo acesso pode levar uma integração a executar duas vezes uma ação de liberação ou remoção.

Antes de publicar uma regra de equivalência, é necessário confirmar:

- Quais opções de configuração habilitam cada evento.
- Em quais situações o evento com `Action` e o evento separado são emitidos para o mesmo acesso.
- Quais diferenças de contexto, campos e cobertura existem entre eles, inclusive para convidados.
- Se há alguma garantia de ordem de entrega ou de correspondência entre as notificações.
- Como correlacionar as representações e evitar repetir uma ação de negócio quando ambas forem utilizadas.

A correspondência relatada não estabelece que os eventos sejam intercambiáveis em todos os cenários, nem que exista uma ordem garantida de entrega.

Referências atuais: [Liberação e remoção de acesso](./eventos/liberacao-e-remocao-de-acesso.mdx), [Início liberação de acesso](./eventos/inicio-liberacao-de-acesso.mdx) e [Fim liberação de acesso](./eventos/fim-liberacao-de-acesso.md).

## Entrega, reenvio e segurança

### Política de entrega e duplicidade

O relatório identifica lacunas que fazem sentido em um guia público de recebimento:

| Informação a definir | Pergunta que a documentação deve responder |
| --- | --- |
| Confirmação de recebimento | Quais respostas HTTP indicam sucesso e quais levam a novas tentativas? |
| Timeout | Quanto tempo a Lastlink aguarda a resposta do destino? |
| Reenvio | Quais falhas são elegíveis, quantas tentativas existem e quais são os intervalos? |
| Identidade da notificação | O `Id` permanece igual em uma nova tentativa de entrega? |
| Identidade da operação | Uma mesma operação pode gerar eventos com IDs diferentes? Quais cenários são previstos? |
| Ordenação | Há garantia de ordem entre eventos relacionados à mesma compra ou assinatura? |
| Tratamento de repetição | Qual critério de idempotência é compatível com a política de emissão confirmada? |

O relatório informa que não encontrou IDs repetidos na base analisada. Isso não comprova entrega única nem elimina a possibilidade de duas notificações com IDs diferentes para a mesma operação. A recomendação de descartar repetidos apenas por `Id` depende da definição da identidade e do reenvio.

As regras de entrega em produção permanecem **a confirmar**. O levantamento técnico abaixo acrescenta informações sobre o código, mas ainda não define uma garantia de produção. Identidade, idempotência e ordenação também continuam pendentes de confirmação.

### Subsídios técnicos para as regras de reenvio

Foi recebido um levantamento sobre o código de processamento de webhooks. Os arquivos do processador não fazem parte deste projeto de documentação; as informações abaixo são atribuídas ao levantamento recebido, sem validação independente da implementação ou da configuração efetiva de produção.

O conteúdo é útil para preparar um guia público de recebimento e reenvio, após a confirmação dos parâmetros e do comportamento em produção.

| Tema | Comportamento descrito no levantamento | O que validar para publicar como regra |
| --- | --- | --- |
| Primeira entrega | A primeira tentativa ocorre imediatamente após a distribuição do evento. | O significado de “imediata”, considerando filas e disponibilidade; não há prazo máximo de entrega confirmado. |
| Resposta de sucesso | Uma resposta HTTP na faixa `2xx` encerra o fluxo de falha descrito. | Confirmar quais códigos e condições encerram a entrega em produção. |
| Resposta de falha | Respostas fora de `2xx` são consideradas falha, inclusive `401`, `404` e `410`. | Confirmar se há exceções ou regras específicas para falhas permanentes. |
| Falha de transporte | Timeout de `10 segundos` e erro de conexão contam como falha. | Confirmar o timeout efetivo e a abrangência desse limite. |
| Redirecionamento | O cliente HTTP segue até `4` redirecionamentos. | Confirmar a configuração efetiva antes de recomendar URLs que redirecionem. |
| Intervalos de reenvio | Esperas sucessivas de `1`, `5`, `10`, `30`, `60`, `120` e `240` minutos; depois, `240` minutos entre tentativas. | Confirmar a sequência em produção e distinguir espera programada de tempo real de entrega. |
| Encerramento dos reenvios | Após uma falha, a idade da entrega é comparada ao período de retenção; se ainda estiver dentro do período, outra tentativa é agendada. | Confirmar o período efetivo e em quais momentos o prazo é verificado. |
| Configuração do webhook | O trecho analisado não desativa automaticamente a configuração do webhook ao encerrar uma entrega com falha. | Confirmar se outros componentes ou políticas podem desativá-la. |

O critério de status HTTP deve ser descrito junto do comportamento de redirecionamento: uma resposta intermediária de redirecionamento pode ser seguida antes de se obter o resultado final da requisição.

### Quantidade de tentativas e prazo são condicionais

O levantamento cita `MessageRetentionPeriod = 1` no arquivo de configuração analisado. O valor efetivo de produção não foi confirmado. O calendário abaixo é uma **simulação com retenção de um dia**, primeira tentativa no instante da criação e falhas contínuas, sem acrescentar duração das requisições nem atrasos de fila ou agendamento.

| Tentativa total | Espera desde a anterior | Tempo acumulado desde a criação |
| --- | --- | --- |
| 1 | Primeira tentativa | `0` |
| 2 | `1 min` | `1 min` |
| 3 | `5 min` | `6 min` |
| 4 | `10 min` | `16 min` |
| 5 | `30 min` | `46 min` |
| 6 | `60 min` | `1h46` |
| 7 | `120 min` | `3h46` |
| 8 | `240 min` | `7h46` |
| 9 | `240 min` | `11h46` |
| 10 | `240 min` | `15h46` |
| 11 | `240 min` | `19h46` |
| 12 | `240 min` | `23h46` |
| 13 | `240 min` | `27h46` |

Nesse cenário, a falha da 12ª tentativa ocorre antes de 24 horas e pode agendar a 13ª para depois desse prazo. A checagem descrita ocorre **após a falha**, permitindo que uma tentativa já agendada ultrapasse a janela usada para decidir novos agendamentos. Se a 13ª também falhar, sua idade já estará acima do período considerado.

São **13 tentativas totais**, incluindo a primeira entrega: **12 reenvios**, nesse calendário. Não se trata de 13 reenvios adicionais.

A 12ª tentativa fica a 14 minutos do corte de 24 horas na simulação. Um atraso acumulado suficiente pode fazer com que ela falhe já fora da janela e encerre o fluxo nessa tentativa. Outros atrasos e mecanismos de recuperação também podem afetar o calendário; a amostra de código não estabelece uma garantia de exatamente 12 ou 13 tentativas, nem um prazo máximo universal de 28 horas.

Para uma regra pública, é mais útil definir o critério de prazo e a sequência de intervalos do que prometer uma quantidade fixa que depende do tempo decorrido. Também falta confirmar o comportamento de uma tentativa já agendada caso ela tenha sucesso depois do período usado para novos agendamentos.

### Reenvio manual e histórico

O levantamento menciona uma possibilidade de reenvio manual e a limpeza do histórico de entregas após `90 dias`. Antes de incluir essas informações em um guia público, é necessário confirmar:

- Se o reenvio manual está disponível ao usuário, onde é acionado e quais permissões exige.
- Se o reenvio preserva o `Id` do evento e como se relaciona com a política de idempotência.
- Qual histórico pode ser consultado e qual período de consulta é efetivamente disponibilizado.
- O alcance da limpeza de 90 dias e sua relação com entregas pendentes ou encerradas.

A retenção do histórico e a janela de reenvio automático são conceitos distintos. O período de 90 dias citado não deve ser interpretado como prazo de novas tentativas automáticas.

### Confirmações necessárias antes de atualizar Regras

- [ ] Confirmar a configuração efetiva de retenção em produção e o marco usado para contar a idade da entrega.
- [ ] Confirmar timeout, redirecionamentos, códigos de sucesso e falha e sequência de intervalos.
- [ ] Validar tentativas e tempos observados em produção, incluindo atrasos e recuperação de entregas interrompidas.
- [ ] Confirmar quando uma entrega é encerrada e se a configuração do webhook permanece ativa.
- [ ] Definir a identidade do evento em reenvios automáticos e manuais.
- [ ] Confirmar disponibilidade pública do reenvio manual e retenção do histórico.

Os detalhes internos de implementação do agendamento e da infraestrutura não compõem uma promessa pública de entrega. Para o guia, interessa o comportamento confirmado que a integração pode esperar.

### Escopo e ciclo de vida do token

O envio por `POST`, o corpo JSON, o header `x-lastlink-token`, sua disponibilidade na tela de integração e a comparação com um secret já estão descritos em [Regras de envio HTTP](./regras.md#envio-http).

Como complemento público, falta confirmar:

- Se o token é definido por conta, integração ou outro escopo.
- Se existe troca ou regeneração e onde essa ação é realizada.
- O efeito de uma troca nas configurações e nas entregas já pendentes.
- Se existe período de transição ou revogação imediata do valor anterior.

## Presença de campos e cobertura dos cenários

A principal contribuição do levantamento de campos é orientar uma **matriz de presença por evento e cenário**. Ela deve distinguir campo obrigatório, campo condicional, chave ausente, valor `null`, objeto vazio e lista vazia.

| Observação relatada | Conteúdo que pode ser útil ao público após validação |
| --- | --- |
| `Commissions` não foi recebido em `Subscription_Canceled`, `Subscription_Expired`, `Subscription_Renewal_Pending`, `Purchase_Request_Confirmed`, `Purchase_Request_Expired` e `Purchase_Request_Canceled`. | Confirmar se comissões são aplicáveis nesses eventos e ajustar a matriz e os exemplos ao contrato. |
| `Commissions[].Details` veio vazio na operação observada. | Explicar as condições de preenchimento e o comportamento de lista vazia. A ausência nessa operação não demonstra que o detalhamento nunca exista. |
| `Buyer.Document`, `Buyer.Address`, `Address.Complement` e `DeviceInfo` variaram entre eventos. | Explicar as condições de coleta, a fonte dos dados e a disponibilidade por evento, além da regra geral do formulário. |
| `Offer.Url` foi observado apenas em `Abandoned_Cart`. | Confirmar em quais eventos a URL é enviada; não prometer o campo a partir de um exemplo completo. |
| `Products[].Price` não foi observado no carrinho, e `Product.Price` não foi observado nos eventos de acesso. | Manter a separação entre os contratos de carrinho, compra e acesso. Não copiar campos de preço entre objetos e eventos. |
| `Purchase.Pix` não foi observado em `Subscription_Expired`; `Purchase.Affiliate` não foi observado em alguns eventos de pagamento e reembolso. | Confirmar as condições por evento e método, sem inferir presença apenas porque os objetos aparecem em outros exemplos. |
| `Subscriptions[].ExpiredDate` não foi observado em `Purchase_Request_Expired`. | Distinguir a expiração da fatura da expiração da assinatura e definir a condição do campo. |
| `ChargebackDate` apareceu apenas no evento de chargeback, enquanto `RefundDate` apareceu nos reembolsos. | Manter as datas com significados separados e confirmar o contrato dos eventos reais e de teste. |
| `SubscriptionId` foi observado em todos os inícios de acesso da amostra do cliente. | Incluir exemplos por tipo de acesso. A regra atual continua sendo presença para `Paid` e ausência para `Guest`; a amostra não autoriza tornar o campo universalmente obrigatório. |

A regra sobre `Commissions[].Details` precisa contemplar também operações que tenham detalhamento preenchido. Já existem exemplos reais desse preenchimento no material analisado para esta documentação; uma observação de lista sempre vazia em outra operação não os invalida.

Parte desses temas já possui investigação em [Débitos técnicos](./debitos-tecnicos.md). Esta página registra a contribuição do relatório, sem substituir a validação dos casos e seus contextos.

### Campos adicionais citados no relatório

Dois caminhos ainda não possuem, no material fornecido para esta página, um payload que permita confirmar estrutura e significado:

| Caminho citado | Estado | O que falta para documentar o contrato |
| --- | --- | --- |
| `Data.Utm.UtmId` | **a confirmar** — citado no relatório. | Exemplo anonimizado, tipo, significado, condição de envio e eventos em que aparece. |
| `Data.Subscriptions[].PlanUpgradeUrl` | **a confirmar** — citado no relatório. | Exemplo anonimizado, tipo, finalidade, condição de envio e eventos em que aparece. |

Os demais campos destacados pelo relatório — como `Seller`, `Buyer.Id`, `Product`, `Quantity`, subcampos de endereço e os objetos de preço com `Value` — já têm cobertura nesta documentação. Campos de produção ainda sem definição continuam identificados como **a confirmar** no catálogo.

### Notificar Membro Ativo

O relatório menciona o identificador `Active_Member_Notification` e a falta de um exemplo público. A contribuição é reservar a documentação desse evento para quando forem confirmados o identificador, a condição de disparo, os objetos enviados e um payload anonimizado.

A menção no relatório não define o contrato nem comprova em quais configurações ou situações ele é emitido.

## Datas e fuso horário

O relatório reforça a necessidade de documentar:

- O fuso de `CreatedAt`, `PaymentDate`, `CanceledDate`, `ExpiredDate`, `AccessStartedAt`, `AccessEndedAt` e demais datas aplicáveis.
- A presença ou ausência de offset ou sufixo `Z`.
- A precisão das frações de segundo e quais variações de formato podem ocorrer.
- A diferença entre a data de criação do evento e a data da operação representada.

A afirmação de que as datas estariam em UTC foi inferida pelo autor do relatório a partir de horários observados. Ela deve permanecer **a confirmar**; a comparação de relógios de uma operação não estabelece o fuso de todos os campos da plataforma.

Uma futura orientação de leitura das datas deve se basear no fuso confirmado. Os exemplos de teste com `Z` e os relatos de produção sem indicação de fuso precisam ser conciliados antes de publicar uma interpretação única.

## Proposta de guia de recuperação de carrinho

Foi recebido um texto de guia para `Abandoned_Cart`, com explicações dos campos e sugestões de automação. Há material útil para um guia prático complementar ao [artigo de Carrinho Abandonado](./eventos/carrinho-abandonado.md), após os ajustes abaixo.

### Ideias aproveitáveis

| Ideia | Como aproveitar na documentação pública |
| --- | --- |
| Explicar o uso de cada identificador | Mostrar como `Products[].Id` e `Offer.Id` ajudam a selecionar o contexto da recuperação, mantendo a distinção entre produto e oferta. |
| Distinguir abandono de pagamento | Explicar que o abandono não informa preço nem método de pagamento e não confirma uma compra. |
| Preparar mensagens para dados incompletos | Usar saudação neutra quando não houver nome e tratar telefone como dado condicional. O e-mail é o dado mínimo confirmado para o disparo. |
| Acompanhar a evolução da operação | Apresentar a correlação com `Purchase_Request_Confirmed` e `Purchase_Order_Confirmed` como uma estratégia da integração. |
| Evitar contatos repetidos | Recomendar controle da automação ativa por contato e contexto da oferta, além do tratamento de notificações repetidas. |
| Separar testes da operação real | Usar `IsTest` para impedir que exemplos de teste acionem contatos reais. O tratamento de teste pode continuar separado para diagnóstico. |
| Interpretar o payload pelo evento | Ler `Event` antes de acessar os objetos específicos, já que o contrato de abandono difere dos eventos de compra. |
| Processar de forma assíncrona | Validar a chamada e registrar ou enfileirar o evento com sucesso antes de confirmar o recebimento; executar a automação depois. |
| Aceitar campos adicionais não utilizados | Preparar o leitor para novas propriedades, mantendo a validação dos campos necessários ao processamento. |
| Facilitar suporte | Orientar a informar o `Id`, o `Event` e o caminho do campo ao investigar uma notificação. |

Se uma mensagem precisar de preço, o guia pode orientar a consulta a uma fonte comercial atualizada para a oferta. O payload de abandono não fornece esse valor, e o cadastro do produto, isoladamente, não comprova o preço final de uma oferta com condições próprias.

### Ajustes de conteúdo antes de aproveitar o guia

| Trecho ou ideia recebida | Ajuste necessário |
| --- | --- |
| Descrição inicial sem o prazo do disparo | Incluir a regra já confirmada: checkout acessado, ao menos o e-mail preenchido e compra não concluída em até **30 minutos**. |
| “Se voltar e abandonar novamente, um novo evento é enviado” | Preservar o limite de **um disparo por dia para cada usuário**. Uma nova visita no mesmo dia pode aumentar o relatório de visitas sem gerar outro evento. Não apresentar frequência por oferta ou por visita como regra da Lastlink. |
| “Todo reenvio conserva o mesmo Id” e “Id diferente é um novo abandono” | **A confirmar.** A identidade em reenvios e a possibilidade de múltiplas emissões para uma operação ainda precisam de validação. O guia não deve prometer essas equivalências. |
| `Buyer.Id` só passaria a existir depois da criação de uma compra | O campo não aparece nos exemplos de abandono catalogados. Isso não comprova quando o usuário passa a existir na plataforma, nem autoriza uma explicação sobre a criação do cadastro. |
| `Offer.Url` sempre recomeçaria o checkout sem restaurar dados | **A confirmar.** O contrato atual define o link da oferta ou checkout; não define restauração de sessão, persistência de formulário ou carrinho salvo. |
| Rastreamento capturado na chegada ao checkout | Manter a definição confirmada no artigo: parâmetros presentes na URL da oferta **no momento do abandono**. Não trocar o momento de captura sem confirmação. |
| `Vtid` como identificador de teste A/B da página | Manter a definição confirmada de **parâmetro de rastreamento da VTurb**. A finalidade não deve ser restringida a teste A/B sem validação. |
| `UtmId` como identificador de campanha | É uma definição proposta no guia e continua **a confirmar**; o exemplo completo fornecido não contém o campo. Confirmar payload, tipo, significado e eventos aplicáveis. |
| `Src` e `Sck` como parâmetros livres da Lastlink | A documentação atual os descreve como parâmetros adicionais de rastreamento. Validar antes de prometer uso livre ou uma finalidade específica. |
| Campos opcionais nunca seriam `null`, vazios ou objetos vazios | **A confirmar por campo e evento.** Uma orientação geral de leitura deve distinguir chave ausente, valor `null`, texto vazio, objeto vazio e lista vazia. |
| “Não existe evento de carrinho recuperado” | O inventário atual não inclui um evento específico com essa finalidade. Isso permite propor uma estratégia de correlação, mas não comprova inexistência universal na plataforma. |
| Frequências de presença de nome, telefone e UTMs | O texto não apresenta a base dessas frequências. Publicar as condições confirmadas e o tratamento de ausência, sem transformar estimativas de uma operação em regra universal. |
| Falta de UTMs como sinal de tráfego direto ou orgânico | Ausência de rastreamento não comprova a origem do tráfego. A classificação depende dos dados efetivamente disponíveis. |

O guia pode ensinar a tratar `Utm` e suas chaves com verificação de presença. Isso é uma prática de leitura robusta; as condições exatas de envio de cada chave continuam dependendo do contrato confirmado.

`CreatedAt` informa a criação do evento. Uma política de atraso para a primeira mensagem é uma decisão da automação; não deve ser confundida com os 30 minutos usados para disparar o webhook. Também depende da definição do fuso horário, que continua pendente.

### Fluxo sugerido para uma automação

Este fluxo é uma **proposta de uso pela integração**, não uma regra de envio nem uma funcionalidade de recuperação automática garantida pela Lastlink:

1. Receber `Abandoned_Cart`, identificar `IsTest` e registrar o evento para processamento.
2. Localizar a automação ativa para o e-mail e a oferta, aplicando a política de contato e de repetição definida pela integração.
3. Antes de enviar uma mensagem, verificar se já foi recebida uma fatura criada ou uma compra completa correspondente, considerando e-mail, oferta ou produto e o contexto temporal.
4. Ao receber `Purchase_Request_Confirmed`, a integração pode pausar a régua de abandono e iniciar um acompanhamento da fatura pendente. Isso ainda não indica pagamento aprovado.
5. Ao receber `Purchase_Order_Confirmed`, encerrar a régua correspondente à compra identificada.

A correlação por `Buyer.Email` e `Offer.Id` ou `Products[].Id` precisa de uma política explícita para múltiplas ofertas, produtos e compras do mesmo contato. Um produto em comum não torna duas operações automaticamente equivalentes. A implementação também deve considerar a ausência de garantia de ordem de entrega.

No acompanhamento de Pix ou boleto, só utilizar QR Code, linha digitável e links que estejam efetivamente presentes. Já foi observado `BankSlip: {}` em uma fatura real; o guia não deve garantir que toda fatura criada contenha uma linha digitável pronta para envio.

### Qualidade do exemplo de payload

O exemplo recebido contém comentários com `//`. Esses comentários devem ficar fora do bloco apresentado como JSON, para que o payload publicado seja válido e possa ser copiado e interpretado diretamente.

Uma futura versão do guia pode apresentar um exemplo completo e outro mínimo, ambos com dados fictícios e com a finalidade de `IsTest` explicada. As observações sobre campos ausentes devem ficar nas tabelas e no texto, sem inserir propriedades que não pertencem ao evento.

## Proposta de referência para Recurrent_Payment

Foi recebido um levantamento de `Recurrent_Payment`, apurado em **18/08/2026** em uma janela de 24 horas, com comparação entre produção e disparos de teste. Seu principal valor para a documentação pública é distinguir periodicidade, cobrança, ciclo e parcela, além de representar melhor campos condicionais.

Os percentuais e as contagens descrevem a amostra do levantamento. “Presente em todos os casos observados” não equivale a campo obrigatório no contrato; “não observado” não equivale a campo exclusivo de teste ou proibido em produção.

### Separar os quatro conceitos de contagem

| Campo | Definição ou interpretação | Estado para a documentação pública |
| --- | --- | --- |
| `Data.Purchase.Recurrency` | Periodicidade do plano, com os valores de assinatura `1`, `3`, `6` e `12`. | Já confirmado e descrito no [artigo de renovação](./eventos/pagamento-de-renovacao-efetuado.mdx). Não representa a posição da cobrança. |
| `Data.Purchase.RecurrenceNumber` | O levantamento propõe um contador de cobranças aprovadas, com comportamento próprio no parcelamento inteligente. | **a confirmar** — definição, início da contagem, incremento e relação com as demais parcelas. |
| `Data.Subscriptions[].Cycle` | O levantamento propõe um contador de ciclos quitados e relata divergência em relação a `RecurrenceNumber` no parcelamento inteligente. | Definição posterior confirmada: ciclo da assinatura, usado para acompanhar suas renovações. Contagem inicial e regras detalhadas de incremento continuam pendentes. |
| `Data.Purchase.SmartInstallment.CurrentInstallment` | Parcela atual do parcelamento inteligente relacionada ao pagamento. | Definição já confirmada. Não implica igualdade com um contador de cobranças ou ciclos. |

A proposta de explicar esses campos em conjunto é aproveitável. As fórmulas de incremento e a regra de concessão de acesso, porém, não devem ser deduzidas de coincidências entre contadores.

A orientação recebida de liberar acesso apenas por `Cycle` ainda precisa de confirmação da regra de negócio. Um guia deve relacionar o fluxo aos eventos de acesso já catalogados e confirmar como tratar pagamentos parciais, ciclos, revogações e mudanças de plano. Também não está confirmada a afirmação de que `Recurrency` fica constante para sempre.

A duração do plano é expressa em meses na definição de periodicidade. Os intervalos em dias observados na amostra não devem virar uma promessa de quantidade fixa de dias para todos os meses ou anos.

### Campos que o levantamento sugere validar na renovação

| Campo ou conjunto | Contribuição do levantamento | Confirmação necessária |
| --- | --- | --- |
| `Products[].Price` | Número simples, diferente do objeto `Purchase.Price`. | Presença, significado e condições especificamente em `Recurrent_Payment`. |
| `Purchase.IsRenewal` | O valor relatado para a renovação foi `true`. | Confirmar significado e se é uma constante garantida nesse evento. |
| `Purchase.RecurrenceNumber` e `Subscriptions[].Cycle` | Campos relatados em produção, ausentes dos testes analisados. | Definir os contadores e representá-los em exemplos coerentes de um mesmo fluxo. |
| `Purchase.Payment.InterestRateAmount` | Campo numérico relatado em produção. | Definir juros, unidade e momento de cálculo/preenchimento. |
| `Utm.UtmId` | Nome adicional de rastreamento citado em produção. | Confirmar payload de apoio, significado, tipo e condições. |
| `Purchase.Coupon` e `Purchase.CouponAmount` | O levantamento relata cupom sem a chave do valor de desconto em parte dos casos. | Confirmar se os campos são independentes e como representar essa situação. |
| `Purchase.Affiliate`, `Purchase.Pix`, `Purchase.BankSlip` e `Offer.Url` | Relatados nos testes e não observados nessa amostra de renovação. | Confirmar aplicabilidade por evento, método e contexto; não removê-los universalmente com base na janela analisada. |
| `Utm`, suas chaves e `DeviceInfo` | Presença variável no levantamento. | Confirmar condições de envio e origem dos dados usados na renovação. |
| `Buyer.Address.Complement` e `Utm.Vtid` | Presentes nos testes e não observados nessa janela. | Não concluir que sejam exclusivos de teste ou que não possam ocorrer em outras operações. |

Os caminhos da tabela são relativos a `Data`. As definições propostas continuam em validação; essa lista não acrescenta campos ao contrato confirmado do evento.

O texto atribui a ausência de rastreamento a renovações que não passam por um novo checkout e descreve as UTMs como herdadas da venda original. A origem desses dados precisa ser confirmada, inclusive sua relação com o pagamento de renovação, antes de substituir a descrição atual.

### Melhorias aproveitáveis na leitura do payload

**Representações monetárias.** É útil mostrar que `Purchase.Price` e `Purchase.OriginalPrice` são objetos com a propriedade `Value`, enquanto os outros caminhos citados no levantamento, como `Products[].Price`, `Commissions[].Value`, `CouponAmount` e `InterestRateAmount`, são valores numéricos. Os campos de produção ainda sem definição exigem confirmação de significado e unidade; a forma numérica não estabelece uma regra de cálculo.

**Comissões por destinatário.** Um guia pode orientar a localizar entradas pelo campo `Source`, sem depender da posição no array. A quantidade fixa de quatro entradas e sua ordem são observações da amostra, não garantias confirmadas. A presença de `AFFILIATE` ou `COPRODUCER` não basta, isoladamente, para comprovar participação; valor e contexto precisam ser considerados. A presença e o preenchimento de `Details` também devem ser descritos separadamente.

**Identidade da assinatura.** É útil distinguir `Subscriptions[].Id`, que identifica a assinatura, de `Buyer.Id`, que identifica o usuário. Uma mesma pessoa não deve ser confundida com uma assinatura específica ao correlacionar eventos e produtos.

**Opcionais independentes.** O texto reforça a utilidade de verificar cada chave antes de acessá-la, inclusive dentro de `Buyer`, `Address`, `Utm` e `SmartInstallment`. A ausência de chave e o valor `null` são estados distintos; as formas permitidas precisam ser definidas por campo, sem generalizar que nenhum evento possa conter valores nulos ou objetos vazios.

**Nome exato de `ip`.** A chave minúscula já está documentada. O leitor deve preservar esse nome; a necessidade de mapeamento explícito depende da biblioteca e da configuração utilizadas, não apenas da linguagem.

**Cobertura dos exemplos.** A revisão deve contemplar cenários com e sem dados opcionais e casos reais anonimizados validados, além dos exemplos de teste. A ausência de um campo em alguns disparos de teste não comprova, por si só, qual caminho de código gerou cada evento.

### SmartInstallment.Type e limites da amostra

O levantamento relata `SmartInstallment` apenas com a flag `IsSmartInstallment` ativa, o que é compatível com a regra já confirmada. Também relata o objeto presente sem a chave interna `Type` em parte dos casos.

A possível ausência de `Type` é uma contribuição relevante para investigar a opcionalidade dos campos internos. Confirmar sua condição de envio antes de definir um caso implícito para a ausência.

Não observar `direct` em 24 horas não invalida esse valor, já confirmado para o parcelamento inteligente. Uma chave `Type` ausente não deve ser convertida automaticamente em `direct`, nem em `recovery`.

Mesmo ao usar a flag como indicação de parcelamento inteligente, a integração deve considerar a presença do objeto e das propriedades que utiliza. A relação observada na amostra não transforma todos os campos filhos em obrigatórios.

### Contradições e lacunas a resolver no levantamento

| Ponto | Por que requer revisão |
| --- | --- |
| `Recurrency: 0` em `Recurrent_Payment` | Conflita com a regra confirmada de evento exclusivo de assinaturas e de que compra única não o dispara. Pedir payloads completos e contexto antes de mudar a periodicidade aceita ou atribuir um significado novo ao zero. |
| Datas internas de `Purchase` descritas com `Z` e precisão fixa | Outros materiais recebidos e os payloads reais de outubro apresentam datas sem fuso. A janela, o evento e a origem podem ser diferentes; é necessário conciliar os exemplos, sem adotar um formato universal por inferência. |
| Totais de casos com e sem parcelamento inteligente | A soma informada supera o total declarado da amostra. Confirmar denominadores e filtros antes de publicar a relação como determinística. |
| Tabela de periodicidade e dias até a próxima cobrança | As linhas não cobrem o total declarado. Como a tabela usa a moda do intervalo, pode existir um recorte adicional; explicar o critério antes de tratá-la como distribuição completa. |
| Quantidade de campos divergentes | A tabela lista mais campos que o total anunciado no texto. Revisar a contagem e a unidade de comparação. |
| Garantia de repetição do `Id` em reentregas | Continua dependente da confirmação da política de emissão e reenvio. |
| Documento descrito como CPF/CNPJ e telefone como E.164 | São restrições ou ampliações de formato que ainda precisam ser confirmadas para o contrato; a descrição atual fornecida para `Document` é CPF. |

### Qualidade do exemplo proposto

O exemplo foi reescrito a partir de um payload de teste e, portanto, não deve ser apresentado como captura bruta de produção. Ele ainda contém comentários `//` e identificadores truncados com `...`; os comentários impedem a leitura como JSON e os identificadores não servem como exemplos válidos de UUID.

Uma futura referência pública deve usar JSON válido, identificadores fictícios completos e cenários consistentes entre periodicidade, cobrança, ciclo e parcela. Percentuais de uma operação, identificadores internos de chamados e nomes de tabelas de armazenamento não são necessários para explicar esse contrato.

Os pontos acima ficam registrados como propostas e definições **a confirmar**. O artigo atual de renovação, seus exemplos e as regras confirmadas foram preservados.

### Avaliação do guia narrativo de renovação

Foi recebida também uma versão em formato de guia de integração para `Recurrent_Payment`. Ela melhora a organização por objeto, explica o uso dos identificadores e apresenta IDs fictícios completos. A principal contribuição é de clareza e orientação prática; as definições ainda pendentes não se tornam confirmadas por aparecerem nessa nova redação.

São aproveitáveis para uma futura revisão pública:

- Explicar a renovação aprovada logo na abertura e apresentar todos os caminhos de negócio como filhos de `Data`.
- Mostrar a relação entre `Products[].Id` e `Subscriptions[].ProductId`, distinguindo usuário, produto, pagamento e assinatura.
- Separar periodicidade, cobrança, ciclo e parcela em uma seção conjunta, mantendo em confirmação as regras dos contadores ainda não definidos.
- Explicar os formatos distintos de valores numéricos e dos objetos de preço com `Value`.
- Descrever `Source`, `Value` e `Details` sem confundir a existência de uma entrada de comissão com participação comprovada na operação.
- Orientar o tratamento separado de testes, processamento assíncrono e leitura de propriedades opcionais, preservando a validação e o registro da entrega antes de confirmar o recebimento.
- Apresentar exemplos com dados fictícios completos e um canal de diagnóstico baseado no `Id` e no evento recebido.

### Ajustes específicos desta versão

| Trecho ou proposta | Ajuste necessário antes de publicar |
| --- | --- |
| `Data` conteria dez blocos | A lista apresentada contém **nove**: `Products`, `Buyer`, `Seller`, `Commissions`, `Purchase`, `Subscriptions`, `Offer`, `Utm` e `DeviceInfo`. A estrutura do guia não define obrigatoriedade desses blocos. |
| `Products[].Price` descrito como opcional | O levantamento anterior o descrevia como sempre presente na amostra. A nova redação não traz confirmação do contrato de presença; registrar a condição como **a confirmar**. |
| `Buyer.Id` e `Email` chegariam sempre | O e-mail mínimo já foi confirmado. A obrigatoriedade de `Buyer.Id` em toda renovação exige definição de contrato, além da observação de uma amostra. |
| `Details` existiria apenas quando há mais de um destinatário no mesmo papel | A definição confirmada trata do detalhamento de coprodutores, e já há exemplo real com apenas um destinatário no detalhamento. Não exigir múltiplos destinatários nem estender o objeto a qualquer `Source` sem validação. |
| `NumberOfInstallments` seria apenas o número de parcelas no cartão | A definição atual é número de parcelas do pagamento, de 1 a 12; os exemplos de Pix e boleto usam `1`. Não restringir o campo ao cartão. |
| `Type: recovery` indicaria o tipo da cobrança atual e a ausência significaria fluxo normal | A definição confirmada de `Type` descreve a origem da contratação do parcelamento inteligente, com `direct` e `recovery`. Não atribuir significado à ausência nem eliminar `direct` sem confirmação. |
| `IsUpsell` descreveria necessariamente a venda original | A definição atual indica origem em venda de upsell. Confirmar como essa informação é propagada para renovações antes de restringi-la à venda original. |
| `RecurrenceNumber` avançaria a cada cobrança e `Cycle` somente ao quitar a última parcela | As regras de incremento continuam **a confirmar**, inclusive em recuperação, pagamentos parciais e mudanças de plano. |
| Liberar acesso exclusivamente por `Cycle`, apenas quando a terceira parcela fechar um trimestre | Essa orientação pode modificar o direito de acesso. Confirmar a regra de negócio e sua relação com os eventos de acesso; não presumir que todo acesso de um plano parcelado aguarde a quitação de todas as parcelas. |
| `Recurrency` seria constante durante toda a assinatura | O campo descreve periodicidade. Permanência ao longo de mudanças de plano não foi confirmada. |
| `Utm` e `DeviceInfo` seriam sempre herdados da venda original | Confirmar a origem e o momento de captura de cada bloco em uma renovação. A ausência de um novo checkout também não foi estabelecida como regra universal. |
| `Vtid` como identificador de teste A/B | Manter rastreamento da VTurb como definição confirmada. |
| Documento sempre com pontuação e admitindo CPF ou CNPJ | A definição atual fornecida é CPF, e já há exemplos reais sem pontuação. Confirmar formatos e documentos aceitos antes de ampliar ou restringir a descrição. |

As afirmações sobre `IsRenewal: true`, significado de `UtmId`, uso livre de `Src`/`Sck`, repetição do `Id` nos reenvios e campos opcionais nunca nulos continuam com as ressalvas já registradas nesta página. A nova versão não apresenta evidência suficiente para encerrar essas pendências.

O exemplo desta versão preenche `Affiliate`, `Offer.Url` e `Address.Complement`, embora o levantamento anterior não os tenha observado em sua amostra de produção. Um exemplo fictício pode ilustrar campos condicionais, mas deve indicar quais condições foram confirmadas; preenchê-los não comprova sua disponibilidade.

### Preparação de exemplos públicos de renovação

O JSON desta versão ainda contém comentários `//`, que precisam ser movidos para o texto explicativo. O link de fatura com `...` deve ser identificado como ilustrativo ou substituído por um endereço fictício completo.

Para a futura documentação, é útil preparar exemplos separados de renovação sem parcelamento inteligente, com contratação `direct` e com recuperação `recovery`. Um exemplo com `Type` ausente depende da confirmação dessa condição. Os valores de cobrança, ciclo e parcela devem refletir uma regra validada, não uma fórmula presumida a partir dos números escolhidos.

As melhorias de redação ficam registradas para revisão. Nenhum exemplo ou contrato confirmado foi substituído por essa proposta.

## Proposta de manual de fundamentos e perguntas frequentes

O manual recebido reúne os eventos por etapa da jornada e propõe explicar entrega, distribuição, formatos e dúvidas frequentes antes dos exemplos. Essa organização é útil para uma referência pública. O texto afirma ter sido baseado em código e observações de produção de agosto, mas não acompanha os trechos de código nem os payloads completos necessários para confirmar suas novas regras.

### Contribuições que merecem aprofundamento

| Tema | Conteúdo aproveitável | Confirmação necessária |
| --- | --- | --- |
| Distribuição por configuração | Explicar a combinação de webhook ativo, evento selecionado e produtos envolvidos. | Validar os filtros efetivos, quais IDs são considerados e quais dados do pedido são entregues em compras com vários produtos. |
| Várias entregas de uma operação | Mostrar por que um evento pode alcançar mais de uma integração, inclusive em pedidos com order bump. | Confirmar o escopo do `Id` entre destinos e a regra de seleção por produto; não presumir que toda integração recebe o pedido completo. |
| Teste do painel | Diferenciar teste de conectividade, simulação de payload e distribuição de um evento real. | O manual afirma que o teste ignora os filtros e alcança webhooks desativados. Validar antes de publicar esse comportamento. |
| Identificadores e correlação | Relacionar fatura criada, compra completa e reembolso por `PaymentId`, preservando cada etapa. | Separar identificação da entidade, deduplicação da entrega e repetição legítima de transições. |
| Resposta HTTP | Explicar o que caracteriza recebimento bem-sucedido e se o conteúdo da resposta é utilizado. | O registro do corpo da resposta e sua não interpretação são afirmações novas, ainda **a confirmar**. |
| Valores ausentes e vazios | Distinguir chave ausente, `null`, objeto `{}`, lista `[]` e texto `""`. | Validar por campo e evento. O relato de nomes e motivos vazios não permite concluir que todo opcional é omitido. |
| Valores monetários | Explicitar unidade, moeda, precisão e composição dos preços. | Inclusão de juros em `Price.Value` confirmada posteriormente. Moeda, arredondamento e detalhes de cálculo continuam pendentes. |
| Perguntas frequentes | Explicar diferenças entre fatura e pagamento, reembolso solicitado e concluído, assinatura e acesso. | Preservar os gatilhos e as condições já confirmados, sem transformar sequências ilustrativas em ordem de entrega garantida. |

### Correlação não substitui deduplicação

As chaves propostas pelo manual são úteis para localizar entidades, mas não bastam como bloqueio permanente de processamento:

- O mesmo `PaymentId` pode aparecer na criação da fatura, na confirmação e no reembolso. Descartar tudo após o primeiro recebimento eliminaria mudanças legítimas.
- A mesma assinatura pode passar por várias renovações e transições. Usar apenas `Subscriptions[].Id` impediria acompanhar seu histórico.
- A combinação membro, produto e tipo de acesso identifica um vínculo; esse vínculo pode terminar e começar novamente. Mesmo `Subscription.Id + Action` pode reaparecer em outra ocorrência válida.

A política deve distinguir a entrega repetida da nova ocorrência de negócio, considerando o evento, a ação quando aplicável e a identidade da ocorrência. A estabilidade do `Id` nas retentativas continua **a confirmar**; não definir uma chave alternativa universal a partir desse manual.

### Novas hipóteses para regras de transição

O texto oferece candidatos para investigar as pendências já registradas: pedido cancelado por solicitação do membro antes do primeiro pagamento; pedido expirado por expiração da cobrança ou manutenção de assinaturas sem pagamento inicial; assinatura expirada após o fim do acesso sem renovação. Esses gatilhos devem ser conferidos com os responsáveis e com evidências antes de resolver as pendências de cancelamento e expiração em [Débitos técnicos](./debitos-tecnicos.md).

Também propõe que `Refund_Requested` ocorra somente quando o pedido entra em avaliação manual, sendo omitido na aprovação automática. Essa limitação não foi confirmada: a definição atual é a solicitação feita pelo membro. Horários e frequências de rotinas, limites de tentativas, cancelamento automático após chargeback e notificação única por pagamento também permanecem **a confirmar**.

### Divergências que impedem incorporar o manual diretamente

| Afirmação do manual | Confronto com a documentação e as evidências recebidas |
| --- | --- |
| Renovação pendente somente depois do vencimento | Conflita com Pix e boleto dez dias antes, e cartão no vencimento. O desfecho também não deve ser limitado à expiração: cancelamento foi informado como possibilidade. |
| `PaymentDate` passaria a significar criação da fatura nos eventos de reembolso, chargeback e fim de garantia | Hipótese não adotada: o usuário confirmou que o campo representa a data do pagamento. Investigar a divergência dos valores recebidos sem mudar essa definição. |
| `Price.Value` não incluiria juros | Contraria a confirmação posterior de inclusão dos juros no valor final. No exemplo real, `95 + 26,4 = 121,4`. O preenchimento de `InterestRateAmount` nas etapas anteriores à aprovação continua em investigação. |
| UTC obrigatório para toda data sem marcador | O fuso continua sem confirmação. Não orientar a conversão forçada para UTC com base apenas na afirmação do manual. |
| Retentativas por dias ou indefinidamente | O próprio manual menciona um período de retenção finito. Preservar a distinção entre intervalos, retenção configurada e configuração de produção ainda desconhecida. |
| Responder `2xx` a qualquer payload recebido | A orientação precisa preservar validação do token e registro confiável da entrega antes da confirmação. Uma resposta de sucesso sem recebimento durável pode perder eventos. |
| Toda parcela seguinte geraria `Recurrent_Payment` | Confirmar o tratamento do parcelamento inteligente e sua relação com a modalidade da oferta. Não contrariar a regra de que compra única não dispara renovação. |
| `Cycle` seria o ciclo atual e avançaria em cada renovação | O usuário confirmou posteriormente o significado de ciclo da assinatura, usado para acompanhar renovações. A numeração inicial e o momento exato de atualização continuam pendentes; não adotar a hipótese de ciclos totalmente quitados nem uma fórmula por parcela. |
| Produto principal sempre na posição zero; bundle sempre com preço zero | Não usar posição ou preço como classificador sem contrato confirmado. A quantidade de itens e a correspondência com assinaturas também precisam de validação. |
| `Subscriptions` teria sempre um item | Os exemplos com um item não estabelecem limite para pedidos com vários produtos. Não converter a lista em objeto único. |
| `CanceledDate` e `ExpiredDate` exclusivos dos eventos de assinatura | Há exemplos já recebidos desses campos em pedido cancelado, pedido expirado e remoção de acesso. Separar o comportamento de teste do real e manter o contexto de cada ocorrência. |
| `Subscription_Product_Access` nunca traria datas | O exemplo confirmado de `Remove` contém `Data.Subscription.ExpiredDate`. Não remover essa possibilidade. |
| Pix e boleto exclusivos de fatura criada | Outra seção do próprio manual inclui renovação pendente. Confirmar presença por evento, estado da cobrança e método, sem extrapolar a amostra. |
| `BankSlip: {}` provaria que o boleto ainda não foi gravado | O objeto vazio foi observado; a causa temporal proposta não foi demonstrada. `InvoiceUrl` também não é universalmente garantido nem um endpoint de consulta documentado. |
| `CouponAmount` sempre acompanharia `Coupon` | O levantamento anterior relata frequências diferentes de presença. A dependência entre as duas chaves precisa ser confirmada. |
| Rastreamento sempre da primeira visita ao checkout | Não substituir o momento de captura confirmado para carrinho abandonado nem a descrição de UTMs do pagamento. Origem e persistência em renovação precisam de definição própria. |
| Campos nulos nunca seriam enviados | Há regra confirmada de `NextBilling: null` para compra única, com ausência observada no real. Não publicar uma convenção universal que apague essa divergência. |

O manual também chama `Abandoned_Cart` de único evento sem `Purchase`, embora os eventos de acesso que ele próprio descreve não tenham esse objeto. Em outro trecho restringe documento e endereço a pagamentos confirmados, mas sua própria seção de reembolso solicitado os inclui. Esses pontos reforçam a necessidade de uma matriz de campos por evento, em vez de generalizações entre blocos.

### Acesso, garantia e alcance das observações

A separação entre cancelamento da assinatura e encerramento do acesso é útil e está alinhada à possibilidade já confirmada de manter a compra aprovada com assinatura cancelada. Não vincular toda ação de cancelamento à remoção imediata: os eventos de acesso devem refletir a mudança efetiva do acesso.

A afirmação de que o evento financeiro sempre chega antes do evento de acesso não é sustentada pelos exemplos recebidos: há encerramento de acesso com `CreatedAt` anterior ao `Payment_Refund`. A ordem de chegada não foi comprovada. A correlação não deve exigir essa sequência nem atribuir uma causa definitiva apenas pela proximidade temporal.

O manual não lista `AccessEndedAt` no início de acesso de convidado, campo já presente no exemplo confirmado de `Guest`. Também propõe gatilhos de inclusão e remoção manual e equivalência obrigatória entre os três eventos de acesso. Esses acréscimos precisam de validação, sem alterar `Paid`, `Guest`, a condição de `SubscriptionId` ou os exemplos atuais.

Não observar `Refund_Period_Over` em uma janela não demonstra rotina inativa ou indisponibilidade. Seu significado deve preservar a condição já confirmada: pagamento aprovado ao término da garantia; se reembolsado antes desse término, o evento não é disparado. O evento também não deve ser apresentado como garantia absoluta de irreversibilidade financeira.

### Notificar Membro Ativo: identificador divergente

Este manual usa `Notify_Active_Member`, enquanto o relatório anterior citava `Active_Member_Notification`. Nenhum payload completo desse evento foi fornecido. O nome técnico, os blocos `Buyer` e `Product`, o envio direto, a ausência de teste no painel e a classificação como legado continuam **a confirmar**. A falta de ocorrências em uma amostra não resolve nenhuma dessas definições.

As propostas úteis ficam registradas para revisão. Não foram alterados os artigos dos eventos, as regras, os exemplos, o catálogo nem os registros de débitos técnicos a partir deste manual. Volumes operacionais, nomes de clientes e detalhes internos de serviços foram excluídos desta seleção.

## Análise da base de eventos recebidos pelo cliente

Foi recebida em **22/10/2026** uma referência não oficial construída a partir de eventos armazenados pelo cliente. A contribuição principal é comparar o ciclo completo de uma operação, em vez de analisar apenas payloads isolados. Os períodos variam por evento e predominam registros de agosto a outubro de 2026; solicitações de reembolso e pedidos cancelados usam exemplos históricos com pouca ou nenhuma cobertura no período atual.

O levantamento informa duas formas de conferência, percentis e janelas de correlação, mas não apresenta as quantidades de eventos nem as consultas para reprodução. Não houve acesso à base do cliente nesta revisão. Os resultados são evidência observacional dessa integração, sujeitos a configuração, cobertura e versão dos emissores.

### Contribuições para os guias públicos

| Tema | O que o levantamento acrescenta | Como aproveitar |
| --- | --- | --- |
| Estado da assinatura e estado do acesso | Relata remoções de acesso anteriores à notificação de assinatura expirada. | Reforçar a diferença entre os estados e orientar o acompanhamento da mudança efetiva pelos eventos de acesso, sem publicar um atraso fixo entre eles. |
| Acesso restabelecido | Relata pagamentos atrasados seguidos de novo `Add` e `Product_Access_Started`. | Preparar um cenário de remoção e posterior restabelecimento. Validar o gatilho antes de ampliar a regra atual de que uma renovação com acesso contínuo não cria outro início. |
| Identificadores | Mostra o uso conjunto de pagamento, assinatura, produto e pessoa, com os caminhos distintos da assinatura em cada formato. | Acrescentar exemplos de correlação por finalidade; não confundir a identidade da entidade com a identidade de uma ocorrência. |
| Repetição com novo `Id` | Relata várias emissões do mesmo tipo para um pagamento, incluindo diferenças no conteúdo. | Distinguir nova emissão de retentativa HTTP, e deduplicação da entrega de atualização do estado de negócio. |
| Vencimento | Relata `NextBilling` frequentemente à meia-noite e sugere tratá-lo como data de calendário. | Confirmar separadamente a semântica desse campo, inclusive no parcelamento inteligente, antes de orientar conversão de fuso ou remoção do horário. |
| Rastreamento opcional | Relata `Vtid` e `UtmId` raros e ausência de `Src` nos links usados pelo cliente. | Reforçar que uma chave não observada não é necessariamente exclusiva de teste ou indisponível. `Vtid` mantém a definição confirmada de rastreamento da VTurb. |
| Exemplos por cenário | Separa primeira compra, renovação, parcela, reembolso, estorno e convidado. | Melhorar a navegação e preparar exemplos de jornadas com IDs correlacionáveis, preservando as condições de cada evento. |
| Cobertura das medições | Usa janelas completas e considera o tempo necessário para observar um desfecho. | Explicar em análises futuras que uma operação recente pode ainda não ter seu evento posterior; falta de correspondência não comprova falha de envio. |

### Prazos medidos não são prazos contratuais

O relatório propõe um padrão de remoção por inadimplência no quinto dia após o vencimento e de `Subscription_Expired` no décimo nono dia, com intervalo de aproximadamente duas semanas entre os dois eventos. Isso é útil para investigar a separação entre fim do acesso e expiração formal da assinatura, mas não define a carência de todos os produtos, gateways ou meios de pagamento.

As regras confirmadas descrevem carência configurada por meio de pagamento, além de fluxos próprios para pagamento único e Parcelamento Inteligente. Antes de incorporar os números observados, é necessário identificar qual configuração gerou cada grupo e qual marco inicia a contagem: vencimento da assinatura, parcela ou término efetivo do acesso.

O mesmo cuidado vale para os atrasos medidos entre fatura e pagamento, os minutos entre estorno e remoção, o início e o fim de convidados e os horários de cobrança. Mediana e percentis descrevem a amostra; não são limites de processamento ou garantias de recebimento. Reembolso, cancelamento e remoção também não precisam ocorrer sempre juntos, como demonstram as próprias exceções do relatório e os fluxos distintos já documentados.

### Datas, fuso e calendário

O material afirma que as datas sem `Z` são UTC, mas propõe uma exceção para `Data.Purchase.NextBilling`: a data escrita representaria o vencimento no calendário de Brasília e não deveria ser convertida. São duas definições diferentes, que precisam ser confirmadas campo a campo.

O horário de Brasília foi confirmado para as **rotinas** documentadas, não para toda string de data recebida. Não adotar uma conversão universal para UTC, uma subtração fixa de três horas ou a leitura de `NextBilling` como data sem horário apenas pela frequência de valores à meia-noite. O levantamento também registra valores desse campo com horário diferente de zero.

No Parcelamento Inteligente, o cliente associa `NextBilling` à próxima parcela e relata situações em que o aviso de pendência já aponta para uma parcela futura. Confirmar se o campo identifica o vencimento pendente, a próxima parcela ou a próxima cobrança de ciclo em cada evento antes de usá-lo para vincular pagamentos automaticamente.

Para a garantia, o relatório descreve notificações no sétimo ou oitavo dia local em função de uma suposta seleção pela data UTC. Essa é uma hipótese para investigar o limite do prazo já registrado em [Débitos técnicos](./debitos-tecnicos.md), não uma nova definição do evento. Os produtos podem ter garantia de **7, 15 ou 30 dias**; os sete dias dessa operação não substituem essa configuração.

### Como usar as informações de repetição

A recomendação de descartar tudo com a mesma chave `Event + PaymentId` não pode ser aplicada indistintamente:

- O próprio relatório mostra `Subscription_Canceled` repetido para um pagamento com **assinaturas diferentes** no conteúdo. Descartar pelo pagamento pode eliminar uma mudança de outra assinatura.
- Nos eventos de acesso, `Add`, `Remove` e um posterior novo `Add` podem ser ocorrências legítimas do mesmo vínculo. A chave precisa considerar a transição e sua ocorrência, além da assinatura ou do membro e produto.
- O relatório descreve repetições de estorno e reembolso com alteração de `ChargebackDate` ou `RefundDate`. Definir como registrar essas diferenças antes de descartá-las como cópias idênticas.
- Avisos de renovação em momentos diferentes podem representar novas notificações do ciclo; não presumir duplicidade apenas pelo pagamento compartilhado.

Para eventos financeiros, `Event + PaymentId` pode ser uma candidata a chave de negócio em operações específicas, após confirmar a cardinalidade e as transições permitidas. Ela não substitui o registro das entregas nem resolve todos os eventos de assinatura.

Encontrar IDs únicos na base também não demonstra que uma retentativa HTTP sempre recebe um novo `Id`, nem que o identificador nunca possa ser usado para reconhecer a mesma entrega. A análise não contém headers, respostas do endpoint ou tentativas que não chegaram. Para concluir sobre reentrega, conferir logs de recebimento, controles de unicidade da base, possíveis filtros e configurações de múltiplos destinos. Nenhuma dessas causas foi comprovada nesta revisão.

### Ordem de geração e ordem de recebimento

O documento apresenta diferenças em segundos entre eventos como se fossem ordem de chegada. Na metodologia fornecida, não fica demonstrado qual timestamp independente de recebimento foi usado para essa ordenação. `CreatedAt` e as datas internas do payload, isoladamente, não comprovam latência de transporte nem ordem de chegada ao endpoint.

Uma referência pública deve separar momento do fato, criação do webhook e recebimento pela integração. Eventos com o mesmo segundo de `CreatedAt` podem ser processados em outra ordem. A janela escolhida para localizar um par também não constitui uma garantia de correspondência ou de tempo máximo entre emissões.

### Generalizações que devem ser evitadas

| Afirmação ou interpretação do relatório | Limite a preservar |
| --- | --- |
| Cada compra tem um produto e uma assinatura | É uma característica da amostra. As estruturas continuam sendo listas; order bump e bundle fazem parte dos fluxos confirmados. |
| Parcelamento Inteligente só existe no cartão porque não apareceu em Pix | Ausência no recorte não define exclusividade por método. Não restringir o contrato com esse argumento. |
| `direct` não apareceu, apenas `recovery` ou valor vazio | `direct` continua confirmado. Distinguir chave ausente, `null` e texto vazio antes de definir a condição de `Type`. |
| Todo reembolso vem com cancelamento e remoção no mesmo segundo | O próprio relatório apresenta casos sem esses pares. O levantamento de gatilhos também descreve diferenças por gateway; a amostra não identifica a causa de cada ausência. |
| Toda assinatura cancelada deixa de gerar outros eventos | Não observar uma transição no período não prova uma proibição universal, especialmente diante de reativação, pagamento atrasado e diferenças de configuração. |
| Ausência de `Refund_Requested` significa opção desligada | O gatilho depende de solicitação do membro encaminhada à avaliação manual; ausência na base não informa a configuração do painel. |
| Ausência de início de acesso `Guest` significa que o evento não existe | O cenário de convidado está confirmado; a amostra tem baixa cobertura para esse fluxo. |
| Apenas três causas de cancelamento foram vistas | Não substituem os gatilhos confirmados de produtor, equipe, Parcelamento Inteligente, Pix Automático e demais fluxos descritos. |
| Um e-mail sempre equivale a um único ID de pessoa | A relação observada não define uma garantia sobre alteração de e-mail, consolidação de contas ou histórico completo da plataforma. |
| Um campo presente em todos os eventos da janela é obrigatório | Presença medida não estabelece contrato; ausência também exige considerar contexto e integridade do registro. |

### Campos, exemplos e método de validação

Os **16 exemplos ilustrativos** do anexo foram comparados aos caminhos do catálogo atual: não acrescentam caminhos de campo ainda ausentes do catálogo. As descrições de frequência também citam `Data.Utm.UtmId` e `Data.Subscriptions[].PlanUpgradeUrl`, já mencionados em materiais anteriores; esses nomes, por si só, não esclarecem sua semântica ou condição de envio.

Os exemplos são fictícios e usam o formato mais comum observado por evento. Por isso não representam capturas brutas para diagnosticar ocorrências específicas nem um inventário de todas as propriedades opcionais. Não substituíram os exemplos existentes da documentação.

Para validar os achados, solicitar quantidades e denominadores por cenário, período exato, configuração dos produtos, método/gateway, tratamento de duplicidade na coleta, timestamp de recebimento e consultas reproduzíveis com dados pessoais removidos. É útil manter separadas as análises por assinatura e por pagamento, incluindo casos que não encontraram correspondência.

A seleção pública exclui taxas comerciais de conversão, mix de planos do cliente, nomes de produtos e pessoas, nomes de coleções e detalhes particulares da operação. Nesta revisão, somente esta página recebeu os novos apontamentos; os artigos, gatilhos, regras, exemplos, catálogo e débitos técnicos foram preservados.

## Revisão das fichas históricas por evento

O usuário forneceu uma análise própria com fichas de 17 identificadores, baseada em código e amostras de **17/08/2026**, com janelas distintas por evento. O material foi comparado às definições e aos gatilhos confirmados posteriormente. Por ser histórico, não substitui automaticamente o comportamento mais recente.

### Melhorias incorporadas

| Contribuição | Aplicação na documentação |
| --- | --- |
| Diferenciar envelope e dados da operação | Acrescentada às Regras uma orientação de leitura com os caminhos completos dentro de `Data`. |
| Distinguir listas de objetos únicos | Reforçados `Products` e `Subscriptions` como listas, e `Product` e `Subscription` como objetos únicos nos formatos que os utilizam. |
| Separar identificação da entrega, pagamento, assinatura, pessoa e produto | Acrescentada tabela de correlação nas Regras, sem transformar a chave de uma entidade em bloqueio de todas as suas transições futuras. |
| Ler o papel da comissão em `Source` | Orientação para usar o valor do campo, sem depender de uma posição fixa do array. |
| Explicar dados de pagamento na interface | Fatura Criada ganhou orientação prática para QR Code, copia e cola, linha digitável e código de barras, preservando os valores como texto. |
| Receber eventos sem executar toda a operação na resposta HTTP | Acrescentadas orientações sobre validação do token, separação de testes, registro confiável, roteamento e processamento assíncrono. |
| Diferenciar pendência e cancelamento de remoção efetiva | Reforçada a orientação de acompanhar os eventos de acesso para a mudança do vínculo. |

### Divergências e decisões adotadas

| Ficha antiga | Referência atual ou decisão |
| --- | --- |
| `Data.Purchase.PaymentDate` seria criação da fatura em reembolso, estorno e fim da garantia | Mantida a definição já confirmada pelo usuário: data do pagamento original relacionado ao evento. |
| `Data.Purchase.Price.Value` excluiria juros | Mantido o preço final com descontos e juros aplicáveis, já confirmado a partir do exemplo real. |
| `NextBilling` nunca seria enviado em Fatura Criada e Renovação Pendente | Por orientação do usuário, adotada a referência mais recente: próxima cobrança, quando houver. Artigos, regras e catálogo atualizados; a confirmação final ficou em [Débitos técnicos](./debitos-tecnicos.md#dt-017). |
| Renovação pendente somente após vencer, com execução a cada 30 minutos | Mantidos os gatilhos atuais: Pix e boleto cerca de dez dias antes; cartão no vencimento antes de cobrar; regras próprias do Pix Automático e execução diária já definida. |
| `Subscription_Expired` indicaria o momento de geração do evento | Mantido `Data.Subscriptions[].ExpiredDate` como o momento em que a assinatura passou para expirada; `CreatedAt` identifica a criação do webhook. |
| `Subscription_Product_Access` não traria nenhuma data | Preservado `Data.Subscription.ExpiredDate`, já confirmado quando enviado. O envelope também tem `CreatedAt`; não substituir uma data de negócio por ele. |
| `Refund_Period_Over` exigiria ausência de pedido de reembolso | A condição confirmada é pagamento aprovado. Um pedido ainda em avaliação pode coexistir com esse status. |
| `Notify_Active_Member` seria um fluxo legado de entrega direta utilizável | Mantida a definição mais recente: sem disparador em produção, com uso informado em console de teste. O modelo histórico não foi promovido a contrato de produção. |
| Quantidade sempre igual a um e carrinho sempre com um produto | As amostras não restringem a quantidade adquirida, inclusive em ingressos, nem convertem listas em objetos únicos. |
| `Offer.Url`, dados fiscais, Pix e boleto seriam exclusivos de certos eventos | Mantidos os campos e exemplos existentes. As exclusividades e ausências da janela histórica não são garantias universais. |

A particularidade interna de seleção de preço citada nessa ficha foi encaminhada, por decisão do usuário, **somente a Débitos técnicos**, sem integrar o contrato público ou os exemplos dos eventos.

O horário histórico de **12h UTC** para a rotina de garantia é compatível com as **09h de Brasília** já confirmadas. Isso não confirma o fuso das strings de data dos payloads, nem transforma a frequência medida em garantia de envio no mesmo minuto.

### Pontos úteis que ainda dependem de verificação

O material descreve significados e presença de `IsRenewal`, `RecurrenceNumber`, preço por produto, juros e campos de assinatura em vários eventos. As pendências contextuais já existentes continuam no catálogo. Não adotar automaticamente regras de incremento, valores monetários, origem do dado ou obrigatoriedade com base na taxa de presença.

Em particular:

- A posição zero de `Products` como produto principal e o preço zero como marcador de bundle ainda não foram definidos como contrato de classificação.
- A descrição de `InterestRateAmount` na renovação pendente como juros do último pagamento precisa ser conciliada com a regra de preço e com o preenchimento em cada etapa.
- `CancellationReason` vazio não permite atribuir com certeza a origem do cancelamento; a condição exata de preenchimento precisa ser validada.
- Os dados de comissões em um reembolso não devem ser tratados automaticamente como lançamentos contábeis negativos ou como prova de liquidação de cada destinatário. A ficha não define um protocolo contábil.
- A afirmação de que somente dois eventos trazem detalhamento de coprodução não cobre os exemplos já recebidos de reembolso e estorno. Preservar as tabelas de cada evento.
- A exclusão mútua de reembolso e chargeback ao longo de todo o histórico de um pagamento não foi demonstrada apenas pela ausência de uma das datas no payload do outro evento.
- Os blocos do modelo histórico de `Notify_Active_Member`, incluindo possíveis `Seller` e `Subscription`, não acompanham um payload completo nem um gatilho atual de produção. Não acrescentar campos supostos aos artigos existentes.

### Cuidados com amostras e exemplos

O material alterna amostras de uma hora, seis horas, doze horas e um dia. Algumas linhas usam denominadores diferentes do total anunciado na ficha, como a presença rara de `NextBilling` em fatura expirada. É necessário esclarecer esses recortes antes de publicar comparações numéricas.

As expressões “100%” e “nunca” descrevem a presença da chave na amostra. Não definem tamanho fixo de listas, formato único de documentos, disponibilidade por gateway ou obrigação de envio. Isso é especialmente importante em Pedido de Compra Cancelado, com apenas duas ocorrências, e nos eventos sem tráfego real observado naquela janela.

Os trechos chamados de exemplo real não são envelopes completos: trazem apenas partes dos dados, identificadores truncados e valores de pessoas. Eles não foram copiados para os artigos. Os **44 exemplos completos já documentados** foram preservados.

## Revisão do guia geral de integração

Foi recebido outro guia que organiza os 16 eventos de produção por formato, descreve blocos compartilhados e propõe uma explicação conjunta dos contadores. Foram aproveitadas melhorias de navegação e leitura, preservando os gatilhos, campos e exemplos já confirmados.

### Contribuições incorporadas

- A página inicial de Webhooks passou a explicar a finalidade das notificações e a indicar um percurso por gatilhos, artigos, catálogo e regras.
- Foi incluída uma tabela dos formatos de referência: eventos de compra, pagamento e assinatura; início e fim do acesso; acesso com `Action`; e carrinho abandonado. Essa tabela não garante presença obrigatória de todos os blocos.
- As Regras passaram a explicar os dois formatos monetários: objetos de preço com `Value` e campos numéricos diretos, como comissão e desconto de cupom.
- O artigo de término da garantia passou a distinguir a notificação do encerramento do prazo de uma confirmação de reembolso, remoção de acesso ou impossibilidade de eventos financeiros posteriores.
- O usuário confirmou que `Data.Purchase.Pix.QrCode` deve continuar sendo documentado como **URL da imagem**. As tabelas e o catálogo foram alinhados; o exemplo do guia com imagem base64 não foi adotado.

A nova descrição de `CancellationReason` como texto livre com opções sugeridas foi encaminhada, por orientação do usuário, a [Débitos técnicos](./debitos-tecnicos.md#dt-018) para confirmação futura. Os dois contextos, assinatura cancelada e pedido de compra cancelado, permanecem separados.

### Divergências preservadas para revisão

| Trecho do guia | Tratamento adotado |
| --- | --- |
| Fatura Criada e Pedido Expirado limitados a Pix e boleto | Mantidos todos os meios de pagamento, incluindo cartão e os demais gatilhos já confirmados. |
| Reembolso solicitado por qualquer pedido do comprador | Mantida a condição de solicitação do membro encaminhada à avaliação manual. |
| Chargeback descrito como simples abertura de contestação no cartão | Mantido o estorno confirmado e as restrições por gateway, incluindo o fluxo de disputa Pix. |
| `Cycle` seria exclusivamente a quantidade de períodos totalmente quitados | Mantida a definição confirmada de ciclo da assinatura, usado para acompanhar renovações. Não foi adotada a regra de incremento apenas na última parcela. |
| Liberação de acesso deveria ser calculada exclusivamente por `Cycle` | Mantida a orientação de acompanhar a mudança efetiva pelos eventos de acesso, sem criar uma fórmula de direito de acesso a partir dos contadores. |
| `Cycle` seria substituído por `CanceledDate` ou `ExpiredDate` | Não foi definida substituição universal entre esses campos. Preservar as propriedades de cada evento e validar sua presença nos contextos correspondentes. |
| `Recurrency` permaneceria constante durante toda a assinatura | O campo indica periodicidade. O comportamento em troca de plano e a permanência do valor ao longo do histórico continuam sem essa garantia. |
| `NextBilling` sempre viria em renovação e seria omitido em compra única | Preservada sua condição de envio e a regra atual de `null` para compra única, com as verificações já registradas em Débitos técnicos. |
| `SmartInstallment.Type` ausente indicaria fluxo normal | Não atribuir significado implícito à ausência. Manter `direct` e `recovery` conforme as definições confirmadas. |
| Todo campo opcional ausente nunca viria como `null` ou texto vazio | Mantida a distinção entre chave ausente, `null`, string vazia e estruturas vazias. |
| `Details` exigiria mais de um destinatário | Há exemplo real de detalhamento com um coprodutor. A lista não exige múltiplos destinatários. |
| Documento seria sempre CPF/CNPJ pontuado e telefone teria formato estrito | Não ampliar documentos aceitos nem impor uma máscara a partir do guia. Preservadas as definições e evidências já registradas. |
| `Vtid` seria um identificador genérico de teste A/B | Mantida a definição confirmada de parâmetro de rastreamento da VTurb. |
| Reentrega sempre repetiria o mesmo `Id` | A política de identidade nas retentativas não foi comprovada por esse guia. Mantida a distinção entre entrega, entidade e ocorrência de negócio. |

Os significados de `Products[].Price`, `IsRenewal`, `RecurrenceNumber`, `InterestRateAmount` e `UtmId` propostos nesse material continuam sujeitos às pendências contextuais existentes; não foram publicados novos contratos por suposição.

### Uso dos exemplos fornecidos

O guia mistura exemplos completos e recortes, contém comentários `//`, identificadores truncados e uma imagem de QR Code embutida no texto. Esses exemplos não foram copiados para os artigos nem tratados como capturas reais de produção. O campo `BankSlip.BarCode`, omitido da tabela resumida do guia, também foi preservado na documentação existente.

Os 16 eventos de produção continuam separados de `Notify_Active_Member`, que não possui disparador em produção. Campos, exemplos completos e nomes aprovados dos eventos foram mantidos, com as descrições e orientações complementares acima.

## Sugestões editoriais para revisão futura

As propostas abaixo fazem sentido como revisão de redação, separada dos identificadores técnicos. Dependem da padronização dos nomes de interface e dos títulos da documentação.

| Forma atual ou citada | Sugestão recebida |
| --- | --- |
| Periodo de Reembolso Terminado | Período de Reembolso Terminado. |
| Pedido de Compra Expirada | Pedido de Compra Expirado. |
| Início liberação de acesso | Início da liberação de acesso. |
| Fim liberação de acesso | Fim da liberação de acesso. |
| `application/JSON`, em material citado | `application/json`. |
| “Email” e “E-mail”, em material citado | Padronizar “e-mail” nos textos explicativos. |

Também é útil revisar vírgulas nas listas de objetos, exemplos truncados, concordância verbal e a descrição de `IsUpsell`. Nesta documentação, `IsUpsell` já identifica a origem em uma venda de upsell.

### Recomendações do relatório que exigem cautela

- O relatório identifica `Paid` e `Guest` como valores recebidos, mas em outra seção sugere substituir `subscription` por `Subscription`. Essa proposta é inconsistente com o próprio inventário e com os valores já confirmados aqui. `Subscription` não deve ser acrescentado ao contrato por uma correção de caixa.
- Uma frase sobre o fim da garantia não deve estabelecer sete dias para todo produto sem confirmar a regra aplicável. A documentação atual vincula o evento ao período de garantia e ao pagamento aprovado.
- A entrada em pendente de renovação deve preservar as regras por método: Pix e boleto, dez dias antes do vencimento; cartão, no vencimento. A redação genérica sobre o “início do ciclo” não deve substituir essa definição.
- Ausência de um campo na operação observada não deve ser publicada como proibição universal. Para cada campo, a revisão deve confirmar as condições e os cenários cobertos.
