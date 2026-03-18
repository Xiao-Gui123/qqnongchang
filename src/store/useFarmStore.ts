import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 土地网格状态接口
export interface LandGrid {
  id: string; // 地块编号，例如 "land_0"
  landLevel: number; // 1:普通, 2:红土地, 3:黑土地, 4:金土地
  plantedPlantId?: number | null; // 正在种植的作物ID
  plantTime?: number | null; // 种植的时间戳(ms)
}

interface FarmState {
  // 玩家配置
  userLevel: number;
  sleepStart: string; // "23:00"
  sleepEnd: string;   // "08:00"
  strategy: 'exp' | 'coin'; // 偏好策略
  
  // 农场土地状态 (假设初始有 24 块地)
  lands: LandGrid[];

  // Actions
  setUserLevel: (level: number) => void;
  setSleepTime: (start: string, end: string) => void;
  setStrategy: (strategy: 'exp' | 'coin') => void;
  
  // 土地管理 Actions
  updateLandLevel: (id: string, level: number) => void;
  plantOnLand: (id: string, plantId: number) => void;
  harvestLand: (id: string) => void;
  batchUpdateLands: (level: number) => void; // 一键全升红土地等
}

// 初始化 24 块普通土地
const initialLands: LandGrid[] = Array.from({ length: 24 }, (_, i) => ({
  id: `land_${i}`,
  landLevel: 1,
  plantedPlantId: null,
  plantTime: null,
}));

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      userLevel: 30, // 默认等级
      sleepStart: '23:00',
      sleepEnd: '08:00',
      strategy: 'exp',
      lands: initialLands,

      setUserLevel: (level) => set({ userLevel: level }),
      setSleepTime: (start, end) => set({ sleepStart: start, sleepEnd: end }),
      setStrategy: (strategy) => set({ strategy }),

      updateLandLevel: (id, level) =>
        set((state) => ({
          lands: state.lands.map((land) =>
            land.id === id ? { ...land, landLevel: level } : land
          ),
        })),

      plantOnLand: (id, plantId) =>
        set((state) => ({
          lands: state.lands.map((land) =>
            land.id === id
              ? { ...land, plantedPlantId: plantId, plantTime: Date.now() }
              : land
          ),
        })),

      harvestLand: (id) =>
        set((state) => ({
          lands: state.lands.map((land) =>
            land.id === id
              ? { ...land, plantedPlantId: null, plantTime: null }
              : land
          ),
        })),
        
      batchUpdateLands: (level) => 
        set((state) => ({
          lands: state.lands.map(land => ({ ...land, landLevel: level }))
        })),
    }),
    {
      name: 'qqfarm-storage', // 存在 localStorage 里的 key
    }
  )
);
