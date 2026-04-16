export type CareerStage = 'Aspiring Actor' | 'Rising Star' | 'Established Star' | 'Legend';

export interface PlayerSkills {
  acting: number;
  voice: number;
  movement: number;
  improvisation: number;
  networking: number;
}

export interface PlayerStats {
  fame: number;
  looks: number;
  money: number;
  stress: number;
  happiness: number;
  day: number;
  careerStage: CareerStage;
}

export interface Relationship {
  id: string;
  name: string;
  type: 'Friend' | 'Romantic' | 'Family' | 'Rival';
  level: number; // 0-100
  notoriety: number; // How famous they are
  isPublic: boolean;
}

export interface ProductionHouse {
  id: string;
  name: string;
  type: 'Streamer' | 'Major Studio' | 'Indie Label';
  logo: string; // keyword for picsum
  reputation: number; // 0-100
}

export interface ActorNPC {
  id: string;
  name: string;
  fame: number;
  careerStage: CareerStage;
  image: string; // seed for picsum
}

export interface Agent {
  id: string;
  name: string;
  negotiationSkill: number; // 0-100
  commissionRate: number; // e.g., 0.10 for 10%
  image: string;
  costToHire: number;
}

export interface MovieProject {
  id: string;
  title: string;
  genre: string;
  productionHouseId: string;
  budget: 'Indie' | 'Commercial' | 'Blockbuster' | 'Prestige';
  role: string;
  pay: number;
  requirements: {
    skills?: Partial<PlayerSkills>;
    fame?: number;
    stage?: CareerStage;
  };
  duration: number; // in days
  fameReward: number;
}

export interface GameEvent {
  id: string;
  type: 'career' | 'life' | 'random' | 'social';
  title: string;
  description: string;
  day: number;
  impact?: Partial<PlayerStats & { skills: Partial<PlayerSkills> }>;
}

export interface Award {
  id: string;
  title: string;
  category: string;
  projectTitle: string;
  day: number;
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  image: string;
  theme: 'gold' | 'red' | 'blue' | 'gray';
}

export type GameView = 'dashboard' | 'audition' | 'training' | 'social' | 'store' | 'management' | 'industry' | 'agency' | 'awards' | 'ending';
