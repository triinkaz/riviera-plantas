# Plantas Riviera Martim de Sá

[Abrir o site](https://triinkaz.github.io/riviera-plantas/)

Consulte as plantas dos apartamentos comuns pelos finais **2, 3, 4, 5 e 6**. Digite o final, escolha as camadas que deseja ver e toque em paredes, pisos ou pontos para abrir detalhes, plantas originais e serviços relacionados. Há uma vista 3D ilustrativa. O tema claro é o padrão; o botão no topo permite ativar o tema escuro e salva a preferência neste navegador. Para o final 1, há apenas a planta cotada de arquitetura e uma consulta parcial. Duplex e coberturas não fazem parte desta versão.

O desenho interativo facilita a consulta, mas as posições e áreas exibidas são aproximadas. Ele não fornece medidas para obra, não indica locais liberados para furar e não substitui as plantas originais, a conferência no imóvel ou a avaliação do profissional responsável. Consulte também o Manual do Proprietário e as regras de reforma do condomínio.

O botão **Área do ar** destaca uma região ilustrativa da sala em 2D e 3D. O manual prevê split de 9.000 BTU/h na sala; o quadro elétrico indica 815 W no circuito de ar, sem identificar o consumo de um modelo específico. A faixa geral de 10 a 15 m² sem sol direto segue orientação da Daikin e não garante cobertura do espaço aberto da unidade. A seleção do equipamento exige avaliação da carga térmica e conferência da instalação real.

A camada **Medidas** exibe as cotas de suíte e dormitório nas vistas 2D e 3D, alguns trechos adicionais na vista 2D e a lista completa dos trechos identificados no painel, com link para as folhas recebidas. Para os finais 2 e 6, a consulta usa respectivamente a tipologia compartilhada com os finais 5 e 3. As medidas não são levantamento no imóvel nem cotas de cada parede. Veja [MEDIDAS_COTADAS.md](MEDIDAS_COTADAS.md) para fontes e limites.

No celular, a planta abre primeiro. **Camadas** e **Detalhes** ficam em gavetas acionadas pelas setas laterais; os botões de zoom ocupam uma faixa separada do desenho. A vista 2D também aceita gesto de pinça para aproximar e afastar.

Os documentos de origem estão em `assets/docs/`. Nenhum morador, unidade ou prestador foi cadastrado. Há até três posições em destaque por serviço: anunciantes do pacote principal têm prioridade e profissionais independentes do plano MAIS podem ocupar vagas livres sem cobrança adicional. O botão **Mais** abre a lista de independentes daquele serviço. Anúncios pagos aparecem identificados como **PUBLICIDADE**; a presença de um serviço ou profissional não significa indicação técnica nem que uma intervenção esteja autorizada.

## Executar localmente

Na pasta do projeto, rode `python -m http.server 4173` e abra `http://localhost:4173/`.

## Publicação

O site é estático. O GitHub Pages publica a branch `main` a partir da raiz do repositório. O arquivo `.nojekyll` faz parte do projeto.
