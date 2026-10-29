# Plantas Riviera Martim de Sá

[Abrir o site](https://triinkaz.github.io/riviera-plantas/)

Consulte as plantas dos apartamentos comuns pelos finais **1 a 6**. Digite o final, escolha as camadas que deseja ver e toque em paredes, pisos ou pontos para abrir detalhes, plantas originais e serviços relacionados. Quatro botões dão acesso direto a arquitetura, móveis planejados, design de interiores e engenharia em qualquer final; há também um acesso para ART. Há uma vista 3D ilustrativa. O tema claro é o padrão; o botão no topo permite ativar o tema escuro e salva a preferência neste navegador. Duplex e coberturas não fazem parte desta versão.

O desenho interativo facilita a consulta, mas as posições e áreas exibidas são aproximadas. Ele não fornece medidas para obra, não indica locais liberados para furar e não substitui as plantas originais, a conferência no imóvel ou a avaliação do profissional responsável. Consulte também o Manual do Proprietário e as regras de reforma do condomínio.

**Divergência de materiais (28/10/2026):** Rafael informou que, em todos os finais comuns e torres, apenas os trechos encostados nas paredes junto à churrasqueira e à área de serviço são drywall. A divisória central da área de serviço é alvenaria. As folhas originais ainda identificam esses e outros trechos azuis como drywall. A pedido de Rafael, o site usa a legenda **alvenaria (não estrutural)** em laranja escuro para esses trechos, com aviso de que essa classificação foi informada pelo proprietário e diverge da planta original. Não há comprovação técnica independente da função dessas paredes; não usar o desenho para liberar demolição, rasgos ou novos vãos. A alvenaria estrutural indicada nos documentos aparece em dourado, com alerta vermelho ao clicar.

O botão **Área do ar** destaca uma região ilustrativa da sala em 2D e 3D. O manual prevê split de 9.000 BTU/h na sala; o quadro elétrico indica 815 W no circuito de ar, sem identificar o consumo de um modelo específico. A faixa geral de 10 a 15 m² sem sol direto segue orientação da Daikin e não garante cobertura do espaço aberto da unidade. A seleção do equipamento exige avaliação da carga térmica e conferência da instalação real.

A camada **Medidas** exibe as cotas de suíte e dormitório nas vistas 2D e 3D. Nas duas vistas, linhas de cota apontam as paredes identificadas da sala e cozinha e uma parede ou borda da varanda; o painel descreve também outras paredes e passagens, com link para as folhas recebidas. Para os finais 2 e 6, a consulta usa respectivamente a tipologia compartilhada com os finais 5 e 3. As medidas não são levantamento no imóvel nem cotas de cada parede. Veja [MEDIDAS_COTADAS.md](MEDIDAS_COTADAS.md) para fontes e limites.

No celular, a planta abre primeiro. **Camadas** e **Detalhes** ficam em gavetas acionadas pelas setas laterais; os acessos a profissionais e ART e os botões de zoom ocupam faixas reservadas abaixo do desenho. A vista 2D também aceita gesto de pinça para aproximar e afastar.

## Cotação coletiva

O acesso **Cote junto com seus vizinhos** aparece fora do desenho para preservar a consulta da planta. A página reúne 16 opções agrupadas de serviços pedidos nas conversas fornecidas, sem inferir quantos moradores distintos querem contratar. Ar-condicionado e a avaliação de envidraçamento da varanda aparecem em destaque; box e pisos continuam visíveis, e os demais serviços ficam em uma lista recolhível. Alguns serviços também têm acesso contextual ao tocar na planta; box aparece nos serviços dos banheiros da vista 3D.

Cada botão abre um Google Formulários publicado para participantes com link, com serviço e final pré-selecionados. O formulário é privado para o responsável pelo site; pede serviço principal, final e contato para retorno, nome e outros interesses opcionais, e autorização explícita de contato. O site não coleta esses dados nem os envia ao Analytics. A página não mostra contadores, descontos ou ofertas até que existam dados e propostas verificadas. Manifestar interesse não é contratação. Envidraçar a varanda sem confinar a condensadora é uma **questão a ser estudada**, não solução aprovada: o manual exige troca de ar exterior e regras específicas de envidraçamento, além de preservar ventilação de gás e exaustão da churrasqueira. A conferência no imóvel, os documentos técnicos e as regras da obra continuam necessários.

Os documentos de origem estão em `assets/docs/`. Há até três posições em destaque por serviço: anunciantes do pacote principal têm prioridade e profissionais independentes do plano MAIS podem ocupar vagas livres sem cobrança adicional. O botão **Mais** abre a lista de independentes daquele serviço. Anúncios pagos aparecem identificados como **PUBLICIDADE**; a presença de um serviço ou profissional não significa indicação técnica nem que uma intervenção esteja autorizada.

## Executar localmente

Na pasta do projeto, rode `python -m http.server 4173` e abra `http://localhost:4173/`.

## Publicação

O site é estático. O GitHub Pages publica a branch `main` a partir da raiz do repositório. O arquivo `.nojekyll` faz parte do projeto.
