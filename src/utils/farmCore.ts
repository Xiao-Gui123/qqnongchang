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
  .filter((item: any) => item._category_id === '07' && !item.name.includes('有机')) // 暂只考虑普通化肥，有机化肥用于高级作物
  .map((item: any) => {
    let effect_time = 0;
    // 根据描述解析真实减少的时间
    if (item.name.includes('1小时')) effect_time = 3600;
    else if (item.name.includes('4小时')) effect_time = 4 * 3600;
    else if (item.name.includes('8小时')) effect_time = 8 * 3600;
    else if (item.name.includes('12小时')) effect_time = 12 * 3600;

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
  lastPhaseSeconds: number;
  subsequentLastPhaseSeconds: number;
} {
  const land = lands.find(l => l.level === landLevel) || lands[0];
  const reductionRatio = land.time_reduction / 100;

  // 第一季总时间
  const baseFirstSeason = plant._phases.reduce((sum, phase) => sum + phase.seconds, 0);
  const firstSeasonSeconds = Math.round(baseFirstSeason * (1 - reductionRatio));

  // 获取最后一个有效生长阶段（排除秒数为0的“成熟”阶段）
  let baseLastPhase = 0;
  for (let i = plant._phases.length - 1; i >= 0; i--) {
    if (plant._phases[i].seconds > 0) {
      baseLastPhase = plant._phases[i].seconds;
      break;
    }
  }
  const lastPhaseSeconds = Math.round(baseLastPhase * (1 - reductionRatio));

  // 第二季及以后的时间
  let baseSubsequent = 0;
  let baseSubsequentLastPhase = 0;
  
  if (plant.seasons > 1) {
    const phasesCount = plant._phases.length;
    // 取最后两个带时间的阶段作为后续季的生长时间（例如：开花+成熟，或大叶子+成熟）
    const phase1 = plant._phases[phasesCount - 2]?.seconds || 0;
    const phase2 = plant._phases[phasesCount - 3]?.seconds || 0;
    baseSubsequent = phase1 + phase2;
    // 后续季的最后一个阶段时间（通常是 phase1）
    baseSubsequentLastPhase = phase1;
    
    // 如果计算出来是 0，给个保底值（第一季时间的一半）
    if (baseSubsequent === 0) {
      baseSubsequent = baseFirstSeason * 0.5;
      baseSubsequentLastPhase = baseLastPhase;
    }
  }
  const subsequentSeasonSeconds = Math.round(baseSubsequent * (1 - reductionRatio));
  const subsequentLastPhaseSeconds = Math.round(baseSubsequentLastPhase * (1 - reductionRatio));

  const totalSeconds = firstSeasonSeconds + subsequentSeasonSeconds * (plant.seasons - 1);

  return { firstSeasonSeconds, subsequentSeasonSeconds, totalSeconds, lastPhaseSeconds, subsequentLastPhaseSeconds };
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
 * 核心推荐算法
 */
export interface RecommendOptions {
  userLevel: number;
  landLevel: number;
  strategy: 'exp' | 'coin';
  limit?: number;
}

export function recommendPlants(options: RecommendOptions) {
  const { userLevel, landLevel, strategy, limit = 10 } = options;
  const now = new Date();

  const results = plants
    .filter(p => p._seed_level <= userLevel) // 过滤等级
    .filter(p => p.land_level_need <= landLevel) // 过滤土地要求
    .map(plant => {
      const times = calculateRealGrowTime(plant, landLevel);
      
      const matureTime = new Date(now.getTime() + times.firstSeasonSeconds * 1000);
      
      // 计算到达最后一个阶段的时间（也就是什么时候该打化肥了）
      const firstSeasonFertilizerTime = new Date(now.getTime() + (times.firstSeasonSeconds - times.lastPhaseSeconds) * 1000);
      
      // 计算所有季数的收获时间点和施肥时间点
      const allMatureTimes: Date[] = [matureTime];
      const allFertilizerTimes: Date[] = [firstSeasonFertilizerTime];
      
      // 如果使用化肥跳过最后一阶段，后续的时间推算（用于给高阶玩家参考的极速路线）
      const allFastMatureTimes: Date[] = [firstSeasonFertilizerTime];

      if (plant.seasons > 1) {
        for (let i = 1; i < plant.seasons; i++) {
          // 正常收获路线的下一季
          const nextMatureTime = new Date(
            allMatureTimes[i - 1].getTime() + times.subsequentSeasonSeconds * 1000
          );
          allMatureTimes.push(nextMatureTime);
          
          // 正常收获路线下，下一季该施肥的时间点
          const nextFertilizerTime = new Date(
            nextMatureTime.getTime() - times.subsequentLastPhaseSeconds * 1000
          );
          allFertilizerTimes.push(nextFertilizerTime);
          
          // 极速化肥路线的下一季收获时间（每一季都在施肥点收掉）
          const nextFastMatureTime = new Date(
            allFastMatureTimes[i - 1].getTime() + (times.subsequentSeasonSeconds - times.subsequentLastPhaseSeconds) * 1000
          );
          allFastMatureTimes.push(nextFastMatureTime);
        }
      }

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
        allFertilizerTimes,
        allFastMatureTimes,
        yields,
        expPerHour,
        coinPerHour
      };
    });

  // 排序逻辑
  results.sort((a, b) => {
    // 根据策略排序
    if (strategy === 'exp') {
      return b.expPerHour - a.expPerHour;
    } else {
      return b.coinPerHour - a.coinPerHour;
    }
  });

  // 优化：相同时间档位（误差在30分钟内视为同一档）只推荐收益最高的一个
  const groupedResults: typeof results = [];
  for (const item of results) {
    const similarItemExists = groupedResults.some(g => 
      Math.abs(g.times.firstSeasonSeconds - item.times.firstSeasonSeconds) <= 1800 // 30分钟(1800秒)内的视为同时间档
    );
    
    if (!similarItemExists) {
      groupedResults.push(item);
    }
    
    if (groupedResults.length >= limit) break;
  }

  return groupedResults;
}

/**
 * 计算跨越阶段所需的化肥（即：如果直接秒掉前几个阶段，需要多少化肥，剩余多少时间）
 * 游戏规则：一个阶段不管多长，如果有极速化肥或者多包化肥可以直接秒掉这个阶段。
 * 但为了简化并提供最实用的建议，我们计算：要缩短 targetSeconds，最少需要打什么化肥。
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

  // 如果还有剩余时间（且大于10分钟），用最小的化肥补齐
  if (remaining > 600 && fertilizers.length > 0) {
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

/**
 * 倒推算法：根据目标收获时间，反推当前该种什么作物，以及需要多少化肥
 */
export function reversePlanPlants(targetTime: Date, userLevel: number, landLevel: number) {
  const now = new Date();
  const targetSeconds = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

  if (targetSeconds <= 0) return []; // 目标时间已过

  const results = plants
    .filter(p => p._seed_level <= userLevel)
    .filter(p => p.land_level_need <= landLevel)
    .map(plant => {
      const times = calculateRealGrowTime(plant, landLevel);
      const diffSeconds = times.firstSeasonSeconds - targetSeconds;

      let status: 'perfect' | 'need_fertilizer' | 'too_late' | 'too_early' = 'perfect';
      let fertilizerCombo: { fertilizer: Fertilizer, count: number }[] = [];
      let delaySecondsToPlant = 0;

      // 允许误差 5 分钟 (300秒) 算 perfect
      if (Math.abs(diffSeconds) <= 300) {
        status = 'perfect';
      } else if (diffSeconds > 300) {
        // 作物生长时间 > 剩余时间，说明来不及了，需要打化肥
        fertilizerCombo = calculateBestFertilizerCombo(diffSeconds);
        // 如果打了所有能打的化肥还是不够（这里暂不设上限，只是计算需要多少）
        status = 'need_fertilizer';
      } else {
        // 作物生长时间 < 剩余时间，说明种早了，需要等一会再种
        status = 'too_early';
        delaySecondsToPlant = Math.abs(diffSeconds);
      }

      return {
        plant,
        times,
        status,
        fertilizerCombo,
        delaySecondsToPlant,
        diffSeconds
      };
    });

  // 排序逻辑：
  // 1. 完美的排最前面
  // 2. 需要化肥的次之（按需要的化肥成本/数量从小到大）
  // 3. 需要等待的排最后（因为需要定闹钟稍后再种，比较麻烦）
  results.sort((a, b) => {
    const statusWeight = { perfect: 0, need_fertilizer: 1, too_early: 2, too_late: 3 };
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    
    if (a.status === 'need_fertilizer') {
      return a.diffSeconds - b.diffSeconds; // 需要补的时间越少越好
    }
    if (a.status === 'too_early') {
      return a.delaySecondsToPlant - b.delaySecondsToPlant; // 等待时间越短越好
    }
    
    return 0;
  });

  return results.slice(0, 20); // 只取前20个方案
}
