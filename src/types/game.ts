// ===== 农场相关类型 =====

export type CropType = 'lettuce' | 'carrot' | 'tomato' | 'corn' | 'potato';
export type CropStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'withered';
export type CropAction = 'plant' | 'water' | 'fertilize' | 'harvest';

export interface CropPlot {
  id: string;
  gridPosition: [number, number]; // [row, col]
  worldPosition: [number, number, number]; // 3D position
  cropType: CropType | null;
  stage: CropStage;
  growthProgress: number; // 0-100
  waterLevel: number; // 0-100
  fertilized: boolean;
  plantedAt: number; // timestamp
  lastWateredAt: number; // timestamp;
}

export type FarmTool = 'hoe' | 'water' | 'fertilizer' | 'harvest' | null;

export interface SeedItem {
  id: string;
  cropType: CropType;
  name: string;
  icon: string;
  growTime: number; // seconds to fully grow
  cost: number; // cost to plant
  harvestReward: number; // coins on harvest
  foodId: string; // what food this produces
}

// ===== 原有类型 =====

export const CAPYBARA_ACCESSORIES = ['hat', 'glasses', 'scarf', 'bowtie', 'flower', 'crown', 'sunglasses'] as const;
export type CapybaraAccessory = typeof CAPYBARA_ACCESSORIES[number];

export const DEFAULT_FUR_COLORS = ['#8B5E3C', '#6B4226', '#A0784C', '#C4A67D', '#4A3020', '#D4B896'] as const;

export type CapybaraAnimation =
  | 'idle' | 'walking' | 'running' | 'eating' | 'drinking' | 'bathing'
  | 'playing' | 'happy' | 'angry' | 'sad' | 'sleepy' | 'sleeping'
  | 'resting' | 'yawn' | 'scratch' | 'ear_shake' | 'sick';

export type CapybaraGrowthStage = 'baby' | 'teen' | 'adult';

export type CapybaraHealth = 'healthy' | 'cold' | 'stomachache' | 'dirty_sick';

// ===== 天气系统 =====

export type WeatherType = 'sunny' | 'cloudy' | 'rainy';

export interface WeatherState {
  type: WeatherType;
  intensity: number; // 0-1 for rain
  duration: number; // remaining seconds
}

// ===== 玩具系统 =====

export type CommandType = 'sit' | 'shake' | 'spin' | 'roll';

export interface Toy {
  id: string;
  name: string;
  icon: string;
  type: 'ball' | 'frisbee' | 'plush' | 'water_gun';
  cost: number;
  durability: number; // 0-100
  owned: boolean;
  inUse: boolean;
}

export interface ToyInScene {
  id: string;
  toyId: string;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  isMoving: boolean;
}

export interface LearnedCommand {
  type: CommandType;
  level: number; // 1-3 mastery level
  timesPerformed: number;
}

export interface Capybara {
  id: string;
  name: string;
  growthStage: CapybaraGrowthStage;
  position: [number, number, number];

  // Core stats (0-100)
  hunger: number;
  thirst: number;
  mood: number;
  energy: number;
  cleanliness: number;
  health: CapybaraHealth;

  // Growth
  age: number; // in game hours
  experience: number;
  level: number;
  maxExp: number;

  // State
  currentAnimation: CapybaraAnimation;
  targetPosition?: [number, number, number];
  rotation?: number;

  // Timers
  wanderTimer?: number;
  restTimer?: number;
  sleepTimer?: number;
  lastActionTime?: number;

  // Customization
  furColor: string;
  accessories: string[];
  isCustom: boolean;

  // Personality (affects behavior)
  personality: 'active' | 'calm' | 'playful' | 'lazy';
  
  // Weather & Commands
  weatherReaction: 'none' | 'seeking_shelter' | 'hiding';
  learnedCommands: LearnedCommand[];
}

export interface Food {
  id: string;
  name: string;
  icon: string;
  hungerRestore: number;
  moodBoost: number;
  goldReward: number;
  unlockCost: number;
}

export interface FoodOnGround {
  id: string;
  foodId: string;
  position: [number, number, number];
  icon: string;
}

export type BackgroundType = 'default' | 'sunset' | 'night' | 'snow' | 'cherry_blossom';

export interface Decoration {
  id: string;
  name: string;
  icon: string;
  cost: number;
  category: 'structure' | 'plant' | 'lighting' | 'furniture';
  model: string;
  owned: boolean;
  position?: [number, number, number];
}

export interface GameState {
  gold: number;
  capybaras: Capybara[];
  unlockedFoods: string[];
  decorations: Decoration[];
  lastTick: number;
  foodOnGround: FoodOnGround[];
  currentBackground: BackgroundType;
  // 农场
  farmMode: boolean;
  farmPlots: CropPlot[];
  selectedTool: FarmTool;
  selectedSeed: CropType | null;
  selectedPlotId: string | null;
  // 游戏时间
  gameHour: number; // 0-24
  gameMinute: number; // 0-60
  
  // 天气与玩具
  weather: WeatherState;
  ownedToys: string[];
  toysInScene: ToyInScene[];
}

export interface AnimationState {
  type: CapybaraAnimation;
  progress: number;
  target?: [number, number, number];
}

export interface GameStore extends GameState {
  selectedCapybaraId: string | null;
  selectedFoodId: string | null;
  foods: Food[];
  shopOpen: boolean;

  feedCapybara: (capybaraId: string, foodId: string) => void;
  interactCapybara: (capybaraId: string, action: 'pet' | 'play' | 'photo') => void;
  updateCapybaraPosition: (capybaraId: string, position: [number, number, number]) => void;
  tickStats: () => void;
  buyFood: (foodId: string) => void;
  buyDecoration: (decorationId: string) => void;
  addGold: (amount: number) => void;
  selectCapybara: (id: string | null) => void;
  selectFood: (id: string | null) => void;
  toggleShop: () => void;
  placeFood: (position: [number, number, number]) => void;
  removeFood: (foodId: string) => void;
  updateCapybarasAI: (delta: number) => void;
  addCapybara: (name: string, furColor: string) => void;
  updateCapybaraName: (id: string, name: string) => void;
  updateCapybaraColor: (id: string, color: string) => void;
  toggleCapybaraAccessory: (id: string, accessory: string) => void;
  removeCapybara: (id: string) => void;
  setBackground: (bg: BackgroundType) => void;
  placeDecoration: (decorationId: string, position: [number, number, number]) => void;
  removeDecoration: (decorationId: string) => void;
  toggleDecorationPanel: () => void;
  decorationPanelOpen: boolean;
  selectedDecorationId: string | null;
  selectDecoration: (id: string | null) => void;
  // 农场
  toggleFarmMode: () => void;
  selectTool: (tool: FarmTool) => void;
  selectSeed: (seed: CropType | null) => void;
  plantSeed: (plotId: string, cropType: CropType) => void;
  waterCrop: (plotId: string) => void;
  fertilizeCrop: (plotId: string) => void;
  harvestCrop: (plotId: string) => void;
  tickFarm: () => void;
  selectPlot: (id: string | null) => void;
  // 新功能方法
  setCapybaraGrowthStage: (id: string, stage: CapybaraGrowthStage) => void;
  interactBodyPart: (capybaraId: string, part: 'head' | 'back' | 'belly') => void;
  batheCapybara: (capybaraId: string) => void;
  putToSleep: (capybaraId: string) => void;
  wakeUp: (capybaraId: string) => void;
  cureCapybara: (capybaraId: string) => void;
  tickAllStats: () => void;
  setGameHour: (hour: number) => void;
  advanceGameTime: (minutes: number) => void;
  addExperience: (capybaraId: string, exp: number) => void;
  // 天气、玩具、命令、疾病
  changeWeather: (type: WeatherType) => void;
  tickWeather: (delta: number) => void;
  buyToy: (toyId: string) => void;
  throwToy: (toyId: string, position: [number, number, number]) => void;
  useToyOnCapybara: (capybaraId: string, toyId: string) => void;
  teachCommand: (capybaraId: string, commandType: CommandType) => void;
  executeCommand: (capybaraId: string, commandType: CommandType) => void;
  giveMedicine: (capybaraId: string) => void;
}
