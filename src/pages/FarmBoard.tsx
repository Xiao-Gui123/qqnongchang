import React, { useEffect, useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { ShieldAlert, Pickaxe } from 'lucide-react';
import { clsx } from 'clsx';
import plantsData from '../data/plants.json';
import { Plant, calculateRealGrowTime } from '../utils/farmCore';

/**
 * 农场看板页面
 */
export const FarmBoard: React.FC = () => {
  const { lands, updateLandLevel, harvestLand } = useFarmStore();
  const [now, setNow] = useState(Date.now());

  // 1秒更新一次倒计时
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLandColor = (level: number) => {
    switch(level) {
      case 4: return 'bg-yellow-400 border-yellow-500';
      case 3: return 'bg-zinc-800 border-zinc-900';
      case 2: return 'bg-red-400 border-red-500';
      default: return 'bg-amber-200 border-amber-300';
    }
  };

  const getLandName = (level: number) => {
    switch(level) {
      case 4: return '金';
      case 3: return '黑';
      case 2: return '红';
      default: return '普';
    }
  };

  const renderLandState = (land: any) => {
    if (!land.plantedPlantId || !land.plantTime) {
      return <div className="text-white/50 text-[10px] font-bold">空闲</div>;
    }

    const plant = plantsData.find(p => p.id === land.plantedPlantId) as unknown as Plant;
    if (!plant) return null;

    const totalSeconds = calculateRealGrowTime(plant, land.landLevel).totalSeconds;
    const elapsedSeconds = Math.floor((now - (land.plantTime || 0)) / 1000);
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      return (
        <button 
          onClick={() => harvestLand(land.id)}
          className="animate-bounce bg-green-500 text-white rounded-full p-1 shadow-lg"
        >
          <Pickaxe size={16} />
        </button>
      );
    }

    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;

    return (
      <div className="flex flex-col items-center">
        <span className="text-white font-bold text-xs bg-black/30 px-1 rounded truncate w-full text-center">
          {plant.name.substring(0,2)}
        </span>
        <span className="text-white/90 text-[10px] font-mono mt-0.5">
          {h}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </span>
        {remainingSeconds < 300 && (
          <ShieldAlert size={12} className="text-red-400 absolute top-1 right-1 animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">我的农场</h1>
        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
          模拟看板
        </div>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <p className="text-xs text-gray-500">
          点击地块右上角的按钮可以升级土地。在“智能推荐”页面点击“应用到农场”即可开始模拟种植倒计时。
        </p>
        
        {/* 农场网格 4x6 */}
        <div className="grid grid-cols-4 gap-2 bg-[#8B5A2B] p-3 rounded-xl border-4 border-[#6b4226]">
          {lands.map((land) => (
            <div 
              key={land.id}
              className={clsx(
                "relative aspect-square rounded-lg border-b-4 flex items-center justify-center transition-colors",
                getLandColor(land.landLevel)
              )}
            >
              {/* 升级土地小按钮 */}
              <button
                onClick={() => {
                  const nextLevel = land.landLevel >= 4 ? 1 : land.landLevel + 1;
                  updateLandLevel(land.id, nextLevel);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow border border-gray-200 text-[8px] font-bold flex items-center justify-center text-gray-600 z-10"
              >
                {getLandName(land.landLevel)}
              </button>

              {renderLandState(land)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
