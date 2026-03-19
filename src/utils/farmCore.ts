import plantsData from '../data/plants.json';
import landsData from '../data/lands.json';
import itemsData from '../data/items.json';

// --- Types ---
export interface PlantPhase {
  name: string;
  seconds: number;
}

export interface Plant {
  id: number;
  name: string;
  _rarity: number;
  _seed_level: number;
  exp: number;
  seasons: number;
  _phases: PlantPhase[];
  fruit?: { count: number, id: number };
  land_level_need: number;
  mutant?: string;
  seed_id?: number;
  _thumb?: string;
}

export interface Land {
  id: number;
  name: string;
  level: number;
  yield_bonus: number;
  time_reduction: number;
  exp_bonus: number;
}

export interface Fertilizer {
  id: number;
  name: string;
  effect_time: number; // in seconds
  price: number;
}

// --- Parse Data ---
const plants = plantsData as Plant[];
const lands = landsData as Land[];

// 提取化肥数据
// items.json 中 _category_id: "07" 是化肥
export const fertilizers: Fertilizer[] = itemsData
  .filter((item: any) => item._category_id === '07')
  .map((item: any) => {
    // 简单解析：普通化肥减20分钟(1200秒)，高速1小时(3600秒)，极速2.5小时(9000秒)
    let effect_time = 0;
    if (item.name.includes('普通化肥')) effect_time = 1200;
    else if (item.name.includes('高速化肥')) effect_time = 3600;
    else if (item.name.includes('极速化肥')) effect_time = 9000;
    else if (item.name.includes('飞速化肥')) effect_time = 5.5 * 3600; // 假设
    
    return {
      id: item.id,
      name: item.name,
      effect_time,
      price: item.price || 0
    };
  }).filter(f => f.effect_time > 0)
  .sort((a, b) => b.effect_time - a.effect_time); // 从大到小排序，贪心算法用

/**
 * 计算作物在特定土地上的真实生长总时长（秒），包括多季作物
 * @param plant 作物数据
 * @param landLevel 土地等级
 */
export function calculateRealGrowTime(plant: Plant, landLevel: number): {
  firstSeasonSeconds: number;
  subsequentSeasonSeconds: number;
  totalSeconds: number;
} {
  const land = lands.find(l => l.level === landLevel) || lands[0];
  const reductionRatio = land.time_reduction / 100;

  // 第一季总时间
  const baseFirstSeason = plant._phases.reduce((sum, phase) => sum + phase.seconds, 0);
  const firstSeasonSeconds = Math.round(baseFirstSeason * (1 - reductionRatio));

  // 第二季及以后的时间：通常是除去“种子”和“发芽”等前期阶段，从“开花”或“初熟”开始算
  // 这里做一个简化逻辑：假设后续季数的时间大约是第一季最后两个阶段的时间总和（可以根据真实游戏设定调整）
  let baseSubsequent = 0;
  if (plant.seasons > 1) {
    const phasesCount = plant._phases.length;
    // 取最后两个带时间的阶段作为后续季的生长时间（例如：开花+成熟，或大叶子+成熟）
    const phase1 = plant._phases[phasesCount - 2]?.seconds || 0;
    const phase2 = plant._phases[phasesCount - 3]?.seconds || 0;
    baseSubsequent = phase1 + phase2;
    // 如果计算出来是 0，给个保底值（第一季时间的一半）
    if (baseSubsequent === 0) baseSubsequent = baseFirstSeason * 0.5;
  }
  const subsequentSeasonSeconds = Math.round(baseSubsequent * (1 - reductionRatio));

  const totalSeconds = firstSeasonSeconds + subsequentSeasonSeconds * (plant.seasons - 1);

  return { firstSeasonSeconds, subsequentSeasonSeconds, totalSeconds };
}

/**
 * 计算作物在特定土地上的多季总收益（经验与金币）
 * @param plant
 * @param landLevel
 */
export function calculateYield(plant: Plant, landLevel: number) {
  const land = lands.find(l => l.level === landLevel) || lands[0];

  // 经验 = 基础经验 + 土地经验加成
  const expBonusRatio = land.exp_bonus / 100;
  // 多季作物的总经验 = 单季经验 * 季数 （假设每季经验相同）
  const singleExp = Math.round(plant.exp * (1 + expBonusRatio));
  const totalExp = singleExp * plant.seasons;

  // 产量 = 基础产量 + 土地产量加成
  const yieldBonusRatio = land.yield_bonus / 100;
  const baseFruitCount = plant.fruit?.count || 0;
  const singleFruitCount = Math.round(baseFruitCount * (1 + yieldBonusRatio));
  const totalFruitCount = singleFruitCount * plant.seasons;

  // 从 items 里查找果实售价
  const seedItem = itemsData.find((i: any) => i.id === plant.seed_id);
  const fruitPrice = seedItem ? (seedItem as any)._fruit_sell_price : 10;       

  const seedPrice = seedItem ? (seedItem as any).price : 0;

  // 净利润 = (总果实数量 * 单个售价) - 种子成本 (多季作物只需买一次种子)
  const totalCoin = (totalFruitCount * fruitPrice) - seedPrice;

  return { totalExp, totalFruitCount, totalCoin };
}

/**
 * 判断给定时间范围是否与玩家的睡眠时间有重叠（成熟点在睡眠期）
 * @param matureTime 预计成熟的 Date 对象
 * @param sleepStart 睡眠开始时间 "23:00"
 * @param sleepEnd 睡眠结束时间 "08:00"
 */
export function isMatureInSleepTime(matureTime: Date, sleepStart: string, sleepEnd: string): boolean {
  if (!sleepStart || !sleepEnd) return false;
  
  const mHours = matureTime.getHours();
  const mMins = matureTime.getMinutes();
  const mTimeVal = mHours + mMins / 60;

  const [sHours, sMins] = sleepStart.split(':').map(Number);
  const startVal = sHours + sMins / 60;

  const [eHours, eMins] = sleepEnd.split(':').map(Number);
  const endVal = eHours + eMins / 60;

  if (startVal > endVal) {
    // 跨天，如 23:00 - 08:00
    return mTimeVal >= startVal || mTimeVal <= endVal;
  } else {
    // 不跨天，如 01:00 - 08:00
    return mTimeVal >= startVal && mTimeVal <= endVal;
  }
}

/**
 * 核心推荐算法
 */
export interface RecommendOptions {
  userLevel: number;
  landLevel: number;
  strategy: 'exp' | 'coin';
  sleepStart?: string;
  sleepEnd?: string;
  limit?: number;
}

export function recommendPlants(options: RecommendOptions) {
  const { userLevel, landLevel, strategy, sleepStart, sleepEnd, limit = 10 } = options;
  const now = new Date();

  const results = plants
    .filter(p => p._seed_level <= userLevel) // 过滤等级
    .filter(p => p.land_level_need <= landLevel) // 过滤土地要求
    .map(plant => {
      const times = calculateRealGrowTime(plant, landLevel);
      
      // 睡眠冲突检测：检查第一季的成熟时间
      const matureTime = new Date(now.getTime() + times.firstSeasonSeconds * 1000);

      // 计算所有季数的收获时间点
      const allMatureTimes: Date[] = [matureTime];
      if (plant.seasons > 1) {
        for (let i = 1; i < plant.seasons; i++) {
          const nextMatureTime = new Date(
            allMatureTimes[i - 1].getTime() + times.subsequentSeasonSeconds * 1000
          );
          allMatureTimes.push(nextMatureTime);
        }
      }

      // 检查是否有任何一季的成熟时间在睡眠期内
      const isSleepConflict = (sleepStart && sleepEnd) 
        ? allMatureTimes.some(t => isMatureInSleepTime(t, sleepStart, sleepEnd))
        : false;

      const yields = calculateYield(plant, landLevel);

      // 计算性价比：每小时经验 / 每小时金币 (基于所有季数的总时间)
      const hours = times.totalSeconds / 3600;
      const expPerHour = yields.totalExp / (hours || 1);
      const coinPerHour = yields.totalCoin / (hours || 1);

      return {
        plant,
        times,
        matureTime,
        allMatureTimes,
        isSleepConflict,
        yields,
        expPerHour,
        coinPerHour
      };
    });

  // 排序逻辑
  results.sort((a, b) => {
    // 1. 睡眠冲突的排到最后
    if (a.isSleepConflict && !b.isSleepConflict) return 1;
    if (!a.isSleepConflict && b.isSleepConflict) return -1;
    
    // 2. 根据策略排序
    if (strategy === 'exp') {
      return b.expPerHour - a.expPerHour;
    } else {
      return b.coinPerHour - a.coinPerHour;
    }
  });

  return results.slice(0, limit);
}

/**
 * 贪心算法：计算化肥最优解
 * @param targetSeconds 目标还需要缩短的秒数
 */
export function calculateBestFertilizerCombo(targetSeconds: number) {
  let remaining = targetSeconds;
  const combo: { fertilizer: Fertilizer, count: number }[] = [];
  
  for (const fert of fertilizers) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / fert.effect_time);
    if (count > 0) {
      combo.push({ fertilizer: fert, count });
      remaining -= count * fert.effect_time;
    }
  }
  
  // 如果还有剩余，用最小的化肥补齐
  if (remaining > 0 && fertilizers.length > 0) {
    const smallest = fertilizers[fertilizers.length - 1];
    const existing = combo.find(c => c.fertilizer.id === smallest.id);
    if (existing) {
      existing.count += 1;
    } else {
      combo.push({ fertilizer: smallest, count: 1 });
    }
  }

  return combo;
}
