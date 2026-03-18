import { Crop, LandType, PlantingPlan } from '../types';
import { LAND_REDUCTION } from './constants';

/**
 * 计算作物在特定配置下的总生长时长（小时）
 * @param crop 作物信息
 * @param landType 土地类型
 * @param useFertilizer 是否使用化肥
 * @param isSecondSeason 是否是第二季
 * @returns 总生长时长（小时）
 */
export function calculateDuration(
  crop: Crop,
  landType: LandType,
  useFertilizer: boolean,
  isSecondSeason: boolean = false
): number {
  // 1. 基础时长（一季5段，二季收获后剩余2段，即 0.4 倍基础时长）
  const seasonRatio = isSecondSeason ? (2 / 5) : 1;
  let duration = crop.baseDuration * seasonRatio;

  // 2. 土地时间缩短
  duration *= (1 - LAND_REDUCTION[landType]);

  // 3. 化肥催熟（省去一段的时间）
  if (useFertilizer) {
    const currentStages = isSecondSeason ? 2 : crop.stages;
    if (currentStages > 0) {
      const stageDuration = duration / currentStages;
      duration -= stageDuration;
    }
  }

  return duration;
}

/**
 * 计算收获时间
 * @param crop 作物信息
 * @param plantTime 种植时间
 * @param landType 土地类型
 * @param useFertilizer 是否使用化肥
 * @param isSecondSeason 是否是第二季
 * @returns 收获时间
 */
export function calculateHarvestTime(
  crop: Crop,
  plantTime: Date,
  landType: LandType,
  useFertilizer: boolean,
  isSecondSeason: boolean = false
): Date {
  const duration = calculateDuration(crop, landType, useFertilizer, isSecondSeason);
  const harvestTime = new Date(plantTime);
  // duration 是小时，转换为毫秒
  harvestTime.setTime(harvestTime.getTime() + duration * 60 * 60 * 1000);
  
  return harvestTime;
}

/**
 * 获取所有作物的种植方案（推荐功能）
 */
export function getAllPlantingPlans(
  crops: Crop[],
  plantTime: Date,
  landType: LandType,
  useFertilizer: boolean
): PlantingPlan[] {
  const plans: PlantingPlan[] = [];

  crops.forEach(crop => {
    // 添加第一季方案
    plans.push({
      crop,
      plantTime,
      harvestTime: calculateHarvestTime(crop, plantTime, landType, useFertilizer, false),
      isSecondSeason: false,
      landType,
      useFertilizer
    });

    // 如果是两季作物，添加第二季方案（假设是收获第一季后立即种下第二季）
    if (crop.seasons === 2) {
      plans.push({
        crop,
        plantTime,
        harvestTime: calculateHarvestTime(crop, plantTime, landType, useFertilizer, true),
        isSecondSeason: true,
        landType,
        useFertilizer
      });
    }
  });

  return plans;
}

/**
 * 根据目标收获时间反推种植方案
 */
export function reverseSearchPlans(
  crops: Crop[],
  targetHarvestTime: Date,
  landType: LandType,
  useFertilizer: boolean
): PlantingPlan[] {
  const now = new Date();
  const plans: PlantingPlan[] = [];

  crops.forEach(crop => {
    [false, true].forEach(isSecond => {
      if (isSecond && crop.seasons < 2) return;

      // 计算在该配置下，该作物需要的总时长（小时）
      const duration = calculateDuration(crop, landType, useFertilizer, isSecond);

      // 计算反向种植时间
      const estimatedPlantTime = new Date(targetHarvestTime);
      estimatedPlantTime.setTime(estimatedPlantTime.getTime() - duration * 60 * 60 * 1000);

      // 如果反向种植时间在当前时间之后，则是一个可行的方案
      if (estimatedPlantTime >= now) {
        plans.push({
          crop,
          plantTime: estimatedPlantTime,
          harvestTime: targetHarvestTime,
          isSecondSeason: isSecond,
          landType,
          useFertilizer
        });
      }
    });
  });

  return plans.sort((a, b) => a.plantTime.getTime() - b.plantTime.getTime());
}
