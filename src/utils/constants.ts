import { Crop, LandType } from '../types';

/**
 * 土地时间缩短倍数
 */
export const LAND_REDUCTION: Record<LandType, number> = {
  normal: 0,
  black: 0.1, // 缩短 10%
  gold: 0.2, // 缩短 20%
};

/**
 * 默认作物列表
 */
export const CROPS: Crop[] = [
  { id: '4h-1', name: '牧草', icon: '🌱', baseDuration: 4, seasons: 1, stages: 5 },
  { id: '4h-2', name: '白萝卜', icon: '🥬', baseDuration: 4, seasons: 1, stages: 5 },
  { id: '8h-1', name: '胡萝卜', icon: '🥕', baseDuration: 8, seasons: 1, stages: 5 },
  { id: '12h-1', name: '玉米', icon: '🌽', baseDuration: 12, seasons: 2, stages: 5 },
  { id: '12h-2', name: '土豆', icon: '🥔', baseDuration: 12, seasons: 1, stages: 5 },
  { id: '24h-1', name: '小麦', icon: '🌾', baseDuration: 24, seasons: 2, stages: 5 },
  { id: '24h-2', name: '西瓜', icon: '🍉', baseDuration: 24, seasons: 1, stages: 5 },
];

/**
 * 本地存储键
 */
export const STORAGE_KEYS = {
  SETTINGS: 'qq_farm_settings',
};
