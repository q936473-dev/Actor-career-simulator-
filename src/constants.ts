import { MovieProject, PlayerStats, PlayerSkills, CareerStage, ProductionHouse, Agent } from "./types";

export const AVAILABLE_AGENTS: Agent[] = [
  { id: 'a1', name: 'Barry "The Shark" Gold', negotiationSkill: 20, commissionRate: 0.15, image: 'shark', costToHire: 0 },
  { id: 'a2', name: 'Linda Sterling', negotiationSkill: 45, commissionRate: 0.20, image: 'sterling', costToHire: 2000 },
  { id: 'a3', name: 'Ari Emanuel-esque', negotiationSkill: 80, commissionRate: 0.10, image: 'ari', costToHire: 50000 },
  { id: 'a4', name: 'Grace O\'Malley', negotiationSkill: 60, commissionRate: 0.12, image: 'grace', costToHire: 15000 },
];

export const INITIAL_SKILLS: PlayerSkills = {
  acting: 10,
  voice: 5,
  movement: 5,
  improvisation: 5,
  networking: 5,
};

export const INITIAL_STATS: PlayerStats = {
  fame: 5,
  looks: 20,
  money: 500,
  stress: 0,
  happiness: 80,
  day: 1,
  careerStage: 'Aspiring Actor',
};

export const CAREER_STAGES: CareerStage[] = ['Aspiring Actor', 'Rising Star', 'Established Star', 'Legend'];

export const PRODUCTION_HOUSES: ProductionHouse[] = [
  { id: 'ph1', name: 'Netflix', type: 'Streamer', logo: 'tech', reputation: 85 },
  { id: 'ph2', name: 'A24', type: 'Indie Label', logo: 'art', reputation: 95 },
  { id: 'ph3', name: 'Warner Bros.', type: 'Major Studio', logo: 'city', reputation: 90 },
  { id: 'ph4', name: 'Disney+', type: 'Streamer', logo: 'castle', reputation: 88 },
  { id: 'ph5', name: 'Paramount', type: 'Major Studio', logo: 'mountain', reputation: 80 },
  { id: 'ph6', name: 'Amazon MGM', type: 'Streamer', logo: 'river', reputation: 82 },
  { id: 'ph7', name: 'Neon', type: 'Indie Label', logo: 'neon', reputation: 92 },
  { id: 'ph8', name: 'Universal', type: 'Major Studio', logo: 'globe', reputation: 87 },
];

export const SAMPLE_PROJECTS: MovieProject[] = [
  {
    id: '1',
    title: 'The Local Grocery Commercial',
    genre: 'Commercial',
    productionHouseId: 'ph1',
    budget: 'Indie',
    role: 'Smiling Shopper',
    pay: 150,
    requirements: { skills: { acting: 5 } },
    duration: 1,
    fameReward: 2,
  },
  {
    id: '2',
    title: 'Stray Dogs of Neon City',
    genre: 'Drama',
    productionHouseId: 'ph7',
    budget: 'Indie',
    role: 'Background Thug',
    pay: 300,
    requirements: { skills: { acting: 15, movement: 10 } },
    duration: 3,
    fameReward: 8,
  },
  {
    id: '3',
    title: 'Love in the Time of WiFi',
    genre: 'RomCom',
    productionHouseId: 'ph1',
    budget: 'Commercial',
    role: 'Supportive Best Friend',
    pay: 1200,
    requirements: { fame: 10, skills: { acting: 30, voice: 15 } },
    duration: 5,
    fameReward: 25,
  },
  {
    id: '4',
    title: 'Galactic Horizon',
    genre: 'Sci-Fi',
    productionHouseId: 'ph8',
    budget: 'Blockbuster',
    role: 'Pilot Commander',
    pay: 50000,
    requirements: { fame: 40, stage: 'Rising Star', skills: { acting: 50, voice: 40, improvisation: 30 } },
    duration: 15,
    fameReward: 150,
  },
  {
    id: '5',
    title: 'The Last Emperor',
    genre: 'Historical Drama',
    productionHouseId: 'ph3',
    budget: 'Prestige',
    role: 'The Lead',
    pay: 1000000,
    requirements: { fame: 80, stage: 'Established Star', skills: { acting: 90, voice: 80, movement: 70, improvisation: 80 } },
    duration: 30,
    fameReward: 500,
  },
];

export const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Nancy", "Daniel", "Margaret", "Matthew", "Lisa", "Anthony", "Betty", "Mark", "Dorothy", "Donald", "Sandra", "Steven", "Ashley", "Paul", "Kimberly", "Andrew", "Donna", "Joshua", "Emily"];
export const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"];

export const TRAINING_OPTIONS = [
  { id: 'acting', name: 'Method Acting', cost: 150, stats: { skills: { acting: 5 }, stress: 10 }, icon: 'Drama' },
  { id: 'voice', name: 'Vocal Coaching', cost: 100, stats: { skills: { voice: 5 }, stress: 5 }, icon: 'Music' },
  { id: 'movement', name: 'Dance & Stage Combat', cost: 120, stats: { skills: { movement: 5 }, stress: 15 }, icon: 'Wind' },
  { id: 'improv', name: 'Improv Workshop', cost: 80, stats: { skills: { improvisation: 5 }, happiness: 10 }, icon: 'Mic2' },
  { id: 'gym', name: 'Elite Performance Gym', cost: 50, stats: { looks: 3, happiness: 5 }, icon: 'Dumbbell' },
  { id: 'mixer', name: 'Hollywood Mixer', cost: 200, stats: { skills: { networking: 8 }, stress: 15 }, icon: 'GlassWater' },
];

export const NAMES = ["Sarah", "James", "Elena", "Marcus", "Chloe", "David", "Aria", "Julian", "Mila", "Oliver"];

export const AWARD_CATEGORIES = [
  "Best Actor in a Leading Role",
  "Best Supporting Actor",
  "Best Newcomer",
  "Best Performance in a Streaming Movie",
  "Lifetime Achievement Award",
  "Cannes Breakthrough Award",
  "Golden Globe for Comedy",
  "BAFTA for Best Performance"
];

export const CEREMONY_FREQUENCY = 30; // Ceremony every 30 days

export const ENDING_SCENARIOS = [
  {
    id: 'legend',
    title: 'The Immortal Legend',
    description: 'You have transcended the industry. Your face is on every billboard, and your name is synonymous with the Golden Age of Cinema. You retire not a star, but an icon.',
    image: 'legend-end',
    theme: 'gold'
  },
  {
    id: 'happy-recluse',
    title: 'The Happy Recluse',
    description: 'You found what most actors never do: peace. You walked away at your peak to live a quiet life with those who truly know you. Hollywood still whispers your name, but you are too busy living to listen.',
    image: 'home-end',
    theme: 'blue'
  },
  {
    id: 'tragic-star',
    title: 'The Cautionary Tale',
    description: 'The lights were too bright, and the shadow was too long. You leave behind a body of work that will be studied for decades, but a heart that was consumed by the very flame that gave you life.',
    image: 'storm-end',
    theme: 'red'
  },
  {
    id: 'the-professional',
    title: 'The Industry Powerhouse',
    description: 'You mastered the game. From acting to producing, you became the person who decides who the next star will be. You don\'t need the spotlight anymore—you own it.',
    image: 'office-end',
    theme: 'gray'
  },
  {
    id: 'forgotten',
    title: 'Back to Obscurity',
    description: 'Hollywood is a fickle beast. The roles stopped coming, and the phone stopped ringing. You move back home with a box of scripts and a heart full of stories that no one wanted to hear.',
    image: 'rain-end',
    theme: 'gray'
  }
];
