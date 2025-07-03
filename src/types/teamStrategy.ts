// src/types/teamStrategy.ts
export type TeamStrategyType = 
  | 'balanced'
  | 'mono_type'
  | 'offensive'
  | 'defensive'
  | 'speed'
  | 'weather'
  | 'dual_core'
  | 'stall';

export interface TeamStrategy {
  type: TeamStrategyType;
  name: string;
  description: string;
  icon: string;
  preferences: StrategyPreferences;
  warnings: string[];
  tips: string[];
}

export interface StrategyPreferences {
  typeDistribution?: {
    preferred: string[];
    avoided: string[];
    maxSameType?: number;
  };
  statPriorities: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  roleDistribution: {
    sweeper: number;
    tank: number;
    support: number;
    wallbreaker: number;
  };
  synergyWeights: {
    typeBalance: number;
    statComplement: number;
    moveCoverage: number;
    defensiveCoverage: number;
    offensiveSynergy: number;
  };
}

export interface MonoTypeStrategy extends TeamStrategy {
  type: 'mono_type';
  selectedType: string;
}

export const TEAM_STRATEGIES: Record<TeamStrategyType, TeamStrategy> = {
  balanced: {
    type: 'balanced',
    name: 'Balanceada',
    description: 'Uma equipe equilibrada com boa cobertura de tipos e roles variados',
    icon: 'balance-scale',
    preferences: {
      statPriorities: {
        hp: 1.0,
        attack: 1.0,
        defense: 1.0,
        specialAttack: 1.0,
        specialDefense: 1.0,
        speed: 1.0
      },
      roleDistribution: {
        sweeper: 2,
        tank: 2,
        support: 1,
        wallbreaker: 1
      },
      synergyWeights: {
        typeBalance: 0.3,
        statComplement: 0.25,
        moveCoverage: 0.25,
        defensiveCoverage: 0.15,
        offensiveSynergy: 0.05
      }
    },
    warnings: [
      'Pode ser previsível contra estratégias especializadas',
      'Requer boa coordenação entre diferentes roles'
    ],
    tips: [
      'Mantenha pelo menos 2 tipos ofensivos diferentes',
      'Inclua tanto sweepers físicos quanto especiais',
      'Tenha pelo menos um tank defensivo'
    ]
  },

  mono_type: {
    type: 'mono_type',
    name: 'Mono Tipo',
    description: 'Equipe focada em um único tipo Pokémon',
    icon: 'filter',
    preferences: {
      typeDistribution: {
        preferred: [], // Será definido dinamicamente
        avoided: [],
        maxSameType: 6
      },
      statPriorities: {
        hp: 1.2,
        attack: 1.1,
        defense: 1.1,
        specialAttack: 1.1,
        specialDefense: 1.1,
        speed: 1.0
      },
      roleDistribution: {
        sweeper: 3,
        tank: 2,
        support: 1,
        wallbreaker: 0
      },
      synergyWeights: {
        typeBalance: 0.1,
        statComplement: 0.4,
        moveCoverage: 0.2,
        defensiveCoverage: 0.2,
        offensiveSynergy: 0.1
      }
    },
    warnings: [
      'Extremamente vulnerável aos tipos que são efetivos contra o seu tipo escolhido',
      'Pode ter dificuldades contra certos oponentes',
      'Estratégia de alto risco e alta recompensa'
    ],
    tips: [
      'Varie as estatísticas para diferentes situações',
      'Considere Pokémon com tipos secundários que ajudem defensivamente',
      'Tenha sempre um plano para cobrir as fraquezas do tipo'
    ]
  },

  offensive: {
    type: 'offensive',
    name: 'Ofensiva',
    description: 'Equipe focada em alto dano e velocidade',
    icon: 'flash',
    preferences: {
      statPriorities: {
        hp: 0.6,
        attack: 1.5,
        defense: 0.7,
        specialAttack: 1.5,
        specialDefense: 0.7,
        speed: 1.4
      },
      roleDistribution: {
        sweeper: 4,
        tank: 0,
        support: 1,
        wallbreaker: 1
      },
      synergyWeights: {
        typeBalance: 0.2,
        statComplement: 0.2,
        moveCoverage: 0.3,
        defensiveCoverage: 0.1,
        offensiveSynergy: 0.2
      }
    },
    warnings: [
      'Muito frágil contra estratégias defensivas',
      'Dependente de conseguir KOs rápidos',
      'Vulnerável a moves de prioridade'
    ],
    tips: [
      'Priorize Pokémon com alta velocidade',
      'Inclua tanto atacantes físicos quanto especiais',
      'Tenha moves de cobertura variados'
    ]
  },

  defensive: {
    type: 'defensive',
    name: 'Defensiva',
    description: 'Equipe focada em resistência e controle',
    icon: 'shield',
    preferences: {
      statPriorities: {
        hp: 1.5,
        attack: 0.6,
        defense: 1.4,
        specialAttack: 0.6,
        specialDefense: 1.4,
        speed: 0.8
      },
      roleDistribution: {
        sweeper: 1,
        tank: 4,
        support: 1,
        wallbreaker: 0
      },
      synergyWeights: {
        typeBalance: 0.15,
        statComplement: 0.25,
        moveCoverage: 0.15,
        defensiveCoverage: 0.35,
        offensiveSynergy: 0.1
      }
    },
    warnings: [
      'Pode ter dificuldade em finalizar batalhas',
      'Vulnerável a strategies de setup',
      'Jogos podem ser muito longos'
    ],
    tips: [
      'Inclua moves de recovery e status',
      'Tenha boa cobertura de resistências',
      'Mantenha pelo menos um win condition'
    ]
  },

  speed: {
    type: 'speed',
    name: 'Velocidade',
    description: 'Equipe focada em controle de velocidade e primeiro turno',
    icon: 'speedometer',
    preferences: {
      statPriorities: {
        hp: 0.8,
        attack: 1.2,
        defense: 0.8,
        specialAttack: 1.2,
        specialDefense: 0.8,
        speed: 1.6
      },
      roleDistribution: {
        sweeper: 5,
        tank: 0,
        support: 1,
        wallbreaker: 0
      },
      synergyWeights: {
        typeBalance: 0.2,
        statComplement: 0.3,
        moveCoverage: 0.25,
        defensiveCoverage: 0.05,
        offensiveSynergy: 0.2
      }
    },
    warnings: [
      'Extremamente frágil se perder o controle de velocidade',
      'Dependente de moves de prioridade em emergências',
      'Pode ter problemas contra walls muito tanky'
    ],
    tips: [
      'Todos os Pokémon devem ter Speed alta',
      'Considere moves de priority como backup',
      'Foque em KOs em um hit sempre que possível'
    ]
  },

  weather: {
    type: 'weather',
    name: 'Clima',
    description: 'Equipe focada em aproveitamento de condições climáticas',
    icon: 'partly-sunny',
    preferences: {
      statPriorities: {
        hp: 1.0,
        attack: 1.2,
        defense: 1.0,
        specialAttack: 1.2,
        specialDefense: 1.0,
        speed: 1.1
      },
      roleDistribution: {
        sweeper: 3,
        tank: 1,
        support: 2,
        wallbreaker: 0
      },
      synergyWeights: {
        typeBalance: 0.15,
        statComplement: 0.2,
        moveCoverage: 0.2,
        defensiveCoverage: 0.15,
        offensiveSynergy: 0.3
      }
    },
    warnings: [
      'Muito dependente de manter a condição climática',
      'Vulnerável a mudanças de clima do oponente',
      'Pode ser ineficaz se o clima for removido'
    ],
    tips: [
      'Inclua múltiplos setters da mesma condição climática',
      'Escolha Pokémon que se beneficiem do clima escolhido',
      'Tenha backup plans para quando o clima acabar'
    ]
  },

  dual_core: {
    type: 'dual_core',
    name: 'Núcleo Duplo',
    description: 'Equipe construída ao redor de dois Pokémon principais',
    icon: 'people',
    preferences: {
      statPriorities: {
        hp: 1.1,
        attack: 1.2,
        defense: 1.0,
        specialAttack: 1.2,
        specialDefense: 1.0,
        speed: 1.1
      },
      roleDistribution: {
        sweeper: 2,
        tank: 2,
        support: 2,
        wallbreaker: 0
      },
      synergyWeights: {
        typeBalance: 0.25,
        statComplement: 0.35,
        moveCoverage: 0.2,
        defensiveCoverage: 0.15,
        offensiveSynergy: 0.05
      }
    },
    warnings: [
      'Muito dependente dos dois Pokémon principais',
      'Se um do núcleo cair, a estratégia pode falhar',
      'Requer proteção extra para os cores'
    ],
    tips: [
      'Escolha dois Pokémon que se complementem perfeitamente',
      'Construa o resto da equipe para proteger o núcleo',
      'Tenha redundância nas funções importantes'
    ]
  },

  stall: {
    type: 'stall',
    name: 'Stall',
    description: 'Equipe focada em outlast o oponente através de recovery',
    icon: 'hourglass',
    preferences: {
      statPriorities: {
        hp: 1.6,
        attack: 0.4,
        defense: 1.5,
        specialAttack: 0.4,
        specialDefense: 1.5,
        speed: 0.7
      },
      roleDistribution: {
        sweeper: 0,
        tank: 5,
        support: 1,
        wallbreaker: 0
      },
      synergyWeights: {
        typeBalance: 0.1,
        statComplement: 0.2,
        moveCoverage: 0.1,
        defensiveCoverage: 0.5,
        offensiveSynergy: 0.1
      }
    },
    warnings: [
      'Jogos extremamente longos',
      'Pode ser chato para alguns jogadores',
      'Vulnerável a setup sweepers poderosos'
    ],
    tips: [
      'Inclua múltiplas formas de recovery',
      'Tenha moves de status para debilitar oponentes',
      'Mantenha pelo menos uma win condition confiável'
    ]
  }
};