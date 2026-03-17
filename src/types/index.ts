/**
 * 土地类型枚举
 */
export type LandType = 'normal' | 'black' | 'gold';

/**
 * 作物信息接口
 */
export interface Crop {
  id: string;
  name: string;
  icon: string;
  /** 基础成熟时间（小时） */
  baseDuration: number;
  /** 季数：1 或 2 */
  seasons: 1 | 2;
  /** 成熟阶段数（一季5段，二季收获后剩余2段） */
  stages: number;
  /** 收益（可选） */
  value?: number;
}

/**
 * 种植计划接口
 */
export interface PlantingPlan {
  crop: Crop;
  /** 种植时间 */
  plantTime: Date;
  /** 预计收获时间 */
  harvestTime: Date;
  /** 是否是第二季（仅对两季作物有效） */
  isSecondSeason: boolean;
  /** 使用的土地类型 */
  landType: LandType;
  /** 是否使用了化肥 */
  useFertilizer: boolean;
}

/**
 * 用户设置接口
 */
export interface UserSettings {
  landType: LandType;
  useFertilizer: boolean;
  favoriteCrops: string[];
}
