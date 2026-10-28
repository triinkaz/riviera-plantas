// Catálogo editorial de serviços. A presença de uma categoria não autoriza obra.
const SERVICE_CATALOG = {
  pintura: {name:"Pintura", detail:"Pintura e preparação superficial, conforme o estado real da base."},
  acabamento: {name:"Acabamento de parede", detail:"Texturas e revestimentos decorativos compatíveis com a superfície."},
  drywall: {name:"Montagem e reparo de drywall", detail:"Reparo, acabamento e instalação de divisórias após conferência do projeto."},
  alterar_drywall: {name:"Avaliar remoção ou mudança do drywall", detail:"Estudo de eventual remoção ou mudança de divisória; depende de análise e procedimento de reforma.", conditional:true},
  piso: {name:"Pisos e revestimentos", detail:"Escolha e instalação de acabamento após medir e verificar a base."},
  rodape: {name:"Rodapés", detail:"Instalação e acabamento de rodapés conforme o piso e as paredes."},
  rejunte: {name:"Rejunte e vedação", detail:"Manutenção de juntas e vedações aparentes, sem presumir intervenção na impermeabilização."},
  impermeabilizacao: {name:"Avaliar impermeabilização", detail:"Diagnóstico e projeto de reparo; intervenções em áreas impermeabilizadas exigem análise.", conditional:true},
  arquitetura: {name:"Arquitetura", detail:"Projeto e acompanhamento da reforma do apartamento, respeitando as plantas e as regras do condomínio."},
  marcenaria: {name:"Móveis planejados", detail:"Projeto e execução de móveis sob medida após levantamento no imóvel e verificação das fixações."},
  interiores: {name:"Design de interiores", detail:"Planejamento dos ambientes, mobiliário, iluminação e acabamentos conforme as condições reais do apartamento."},
  engenharia: {name:"Engenharia", detail:"Avaliação técnica, projetos e acompanhamento de serviços que exigem profissional habilitado e documentação aplicável."},
  eletrica: {name:"Instalações elétricas", detail:"Avaliação, manutenção ou adequação por profissional habilitado, conferindo circuitos e tensão."},
  iluminacao: {name:"Iluminação", detail:"Luminárias e projeto de luz compatíveis com os pontos e circuitos existentes."},
  hidraulica: {name:"Instalações hidráulicas", detail:"Avaliação e manutenção dos pontos existentes, sem presumir trajetos ocultos."},
  loucas: {name:"Louças e metais", detail:"Instalação ou troca compatível com os pontos hidráulicos e o espaço real."},
  ar: {name:"Ar-condicionado", detail:"Instalação e manutenção respeitando dreno, ventilação e acesso da condensadora."},
  exaustao: {name:"Exaustão e ventilação", detail:"Avaliação e manutenção do exaustor existente, preservando a ventilação prevista e as instalações reais."},
  gas: {name:"Instalação de gás", detail:"Inspeção e manutenção por profissional qualificado, preservando ventilação e segurança."},
  drenos: {name:"Drenos", detail:"Inspeção e manutenção do ponto existente após consulta às vistas originais."},
  vistoria: {name:"Vistoria técnica", detail:"Levantamento no local e orientação por profissional habilitado para o escopo."},
  envidracamento: {name:"Avaliar envidraçamento", detail:"Somente após conferir padrão, regras e autorizações aplicáveis ao condomínio.", conditional:true},
  limpeza: {name:"Limpeza pós-obra", detail:"Limpeza especializada após serviços e acabamentos concluídos."}
};

const SURFACE_CATALOG = {
  structural: {
    title:"Parede estrutural", description:"Atenção: esta parede é estrutural. Sua posição no desenho é aproximada; confira a planta original e o imóvel.",
    check:"Não remova ou modifique esta parede. São proibidos novos vãos, nichos e rasgos para instalações.",
    services:["pintura","acabamento","vistoria"]
  },
  masonry: {
    title:"Alvenaria (não estrutural)",
    description:"Classificação informada pelo proprietário. A planta original marca este trecho como drywall; confirme no imóvel antes de planejar mudanças.",
    check:"A indicação de não estrutural não autoriza remover, abrir vãos ou fazer rasgos. Consulte um profissional e siga as regras de reforma.",
    services:["pintura","acabamento","vistoria"]
  },
  drywall: {
    title:"Parede de drywall", description:"Confira a parede no apartamento antes de planejar mudanças.",
    check:"Remover ou mudar a divisória exige análise técnica e o procedimento de reforma do condomínio.",
    services:["pintura","drywall","acabamento","alterar_drywall"]
  },
  dry_floor: {
    title:"Piso de ambiente seco", description:"Confira o piso e as medidas no apartamento.",
    check:"Verifique a base entregue antes de comprar ou instalar revestimentos.",
    services:["piso","rodape","limpeza"]
  },
  wet_floor: {
    title:"Piso de área molhada", description:"Banheiro, cozinha ou serviço; as camadas sob o piso não aparecem aqui.",
    check:"Não quebre nem perfure a impermeabilização sem avaliação técnica.",
    services:["rejunte","impermeabilizacao","piso","vistoria"]
  },
  balcony_floor: {
    title:"Piso da varanda", description:"Confira ralos, caimento e guarda-corpo no apartamento.",
    check:"Preserve drenagem e ventilação. Envidraçamento e mudanças de acabamento dependem das regras do condomínio.",
    services:["piso","rejunte","impermeabilizacao","envidracamento"]
  },
  shaft: {
    title:"Shaft de instalações", description:"Área com instalações e acesso para manutenção.",
    check:"Não obstrua, perfure ou altere o shaft. Consulte um profissional para qualquer manutenção.",
    services:["vistoria","hidraulica","drenos"]
  }
};

const SERVICE_CONTEXTS = {
  room_dry:["pintura","piso","marcenaria","iluminacao"],
  room_wet:["hidraulica","loucas","rejunte","impermeabilizacao"],
  room_mixed:["pintura","piso","marcenaria","eletrica","hidraulica"],
  electric_light:["iluminacao","eletrica"],
  electric_outlet:["eletrica","vistoria"],
  electric_shower:["eletrica","hidraulica","loucas"],
  electric_panel:["eletrica","vistoria"],
  electric_exhaust:["exaustao","eletrica","vistoria"],
  hydraulic:["hidraulica","loucas","vistoria"],
  ac:["ar","eletrica","drenos"],
  gas:["gas","vistoria"],
  stack:["vistoria","hidraulica","drenos"],
  drain:["drenos","hidraulica","vistoria"]
};

// Cadastre somente contatos reais, com autorização para publicar os dados.
// Formato: {id, name, services:["pintura"], whatsapp:"55...", active:true}.
const SPONSORS = [];
// Profissionais do plano MAIS, com vigência acordada. O destaque ocupa apenas
// vagas não contratadas entre as três primeiras posições, sem cobrança adicional.
// Cada cadastro é publicidade, inclusive quando aparece na lista inferior.
const INDEPENDENT_PROVIDERS = [];
const MAX_SPONSORS_PER_SERVICE = 3;
