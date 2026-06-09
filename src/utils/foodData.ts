import { Food } from '@/types/game';

export const DEFAULT_FOODS: Food[] = [
  {
    id: 'grass',
    name: '青草',
    icon: '🌿',
    hungerRestore: 15,
    moodBoost: 5,
    goldReward: 2,
    unlockCost: 0,
  },
  {
    id: 'carrot',
    name: '胡萝卜',
    icon: '🥕',
    hungerRestore: 25,
    moodBoost: 10,
    goldReward: 5,
    unlockCost: 50,
  },
  {
    id: 'watermelon',
    name: '西瓜',
    icon: '🍉',
    hungerRestore: 40,
    moodBoost: 20,
    goldReward: 10,
    unlockCost: 150,
  },
  {
    id: 'apple',
    name: '苹果',
    icon: '🍎',
    hungerRestore: 20,
    moodBoost: 15,
    goldReward: 8,
    unlockCost: 100,
  },
  {
    id: 'cake',
    name: '草莓蛋糕',
    icon: '🍰',
    hungerRestore: 50,
    moodBoost: 30,
    goldReward: 20,
    unlockCost: 300,
  },
];

export const getFoodById = (id: string): Food | undefined => {
  return DEFAULT_FOODS.find((food) => food.id === id);
};
