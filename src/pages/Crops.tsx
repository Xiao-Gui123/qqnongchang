import React, { useMemo, useState } from 'react';
import plantsData from '../data/plants.json';
import { Plant, calculateRealGrowTime, calculateYield } from '../utils/farmCore';
import { Clock, Layers, TrendingUp, Search, Filter, Coins } from 'lucide-react';
import { clsx } from 'clsx';
import { useFarmStore } from '../store/useFarmStore';

/**
 * 作物图鉴页面
 */
export const Crops: React.FC = () => {
  const { lands } = useFarmStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'rare' | 'multi'>('all');
  
  // 默认使用普通土地计算基础数据展示
  const defaultLandLevel = 1;

  const plants = plantsData as Plant[];

  const filteredPlants = useMemo(() => {
    let result = plants;

    // 1. 关键词过滤
    if (searchTerm) {
      result = result.filter(p => p.name.includes(searchTerm));
    }

    // 2. 类型过滤
    if (filterType === 'rare') {
      result = result.filter(p => p._rarity >= 2);
    } else if (filterType === 'multi') {
      result = result.filter(p => p.seasons > 1);
    }

    // 3. 默认按等级排序
    return result.sort((a, b) => a._seed_level - b._seed_level);
  }, [searchTerm, filterType]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}小时${m > 0 ? `${m}分` : ''}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">作物图鉴</h1>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          收录 {plants.length} 种
        </div>
      </header>

      {/* 搜索与筛选栏 */}
      <section className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="搜索作物名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border",
              filterType === 'all' 
                ? "bg-green-500 text-white border-green-500" 
                : "bg-white text-gray-600 border-gray-200"
            )}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('rare')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border flex items-center",
              filterType === 'rare' 
                ? "bg-purple-500 text-white border-purple-500" 
                : "bg-white text-gray-600 border-gray-200"
            )}
          >
            <Filter size={12} className="mr-1" />
            稀有/珍品
          </button>
          <button
            onClick={() => setFilterType('multi')}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border flex items-center",
              filterType === 'multi' 
                ? "bg-blue-500 text-white border-blue-500" 
                : "bg-white text-gray-600 border-gray-200"
            )}
          >
            <Layers size={12} className="mr-1" />
            多季作物
          </button>
        </div>
      </section>

      {/* 作物列表 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPlants.map((plant) => {
          const times = calculateRealGrowTime(plant, defaultLandLevel);
          const yields = calculateYield(plant, defaultLandLevel);
          
          return (
            <div key={plant.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3 relative overflow-hidden">
              {/* 背景装饰字 */}
              <div className="absolute -right-4 -top-4 text-[100px] font-black text-gray-50 opacity-20 pointer-events-none select-none">
                {plant.name[0]}
              </div>

              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden relative">
                  <img 
                    src={`/qqnongchang/images/plants/${plant._thumb}`} 
                    alt={plant.name}
                    className="w-10 h-10 object-contain drop-shadow-sm"
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-gray-700">${plant.name.substring(0, 1)}</span>`;
                    }}
                  />
                  <span className="absolute bottom-1 text-[9px] font-bold text-gray-400 bg-white/80 px-1 rounded-sm">Lv.{plant._seed_level}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{plant.name}</h3>
                    {plant._rarity >= 2 && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                        {plant._rarity === 2 ? '稀有' : plant._rarity === 3 ? '珍品' : '天工'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center bg-gray-50 px-2 py-0.5 rounded">
                      <Clock size={10} className="mr-1" />
                      {formatTime(times.totalSeconds)}
                    </span>
                    <span className={clsx(
                      "flex items-center px-2 py-0.5 rounded",
                      plant.seasons > 1 ? "bg-blue-50 text-blue-600" : "bg-gray-50"
                    )}>
                      <Layers size={10} className="mr-1" />
                      {plant.seasons}季
                    </span>
                  </div>
                </div>
              </div>

              {/* 详细数据网格 */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 relative z-10">
                <div className="flex flex-col items-center p-2 bg-blue-50/50 rounded-xl">
                  <TrendingUp size={14} className="text-blue-400 mb-1" />
                  <span className="text-[10px] text-gray-400">总经验</span>
                  <span className="text-xs font-bold text-blue-700">{yields.totalExp}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-yellow-50/50 rounded-xl">
                  <Coins size={14} className="text-yellow-400 mb-1" />
                  <span className="text-[10px] text-gray-400">净利润</span>
                  <span className="text-xs font-bold text-yellow-700">{yields.totalCoin}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-green-50/50 rounded-xl">
                  <Layers size={14} className="text-green-400 mb-1" />
                  <span className="text-[10px] text-gray-400">阶段数</span>
                  <span className="text-xs font-bold text-green-700">{plant._phases.length - 1}</span>
                </div>
              </div>
              
              {/* 多季作物额外提示 */}
              {plant.seasons > 1 && (
                <div className="text-[10px] text-gray-400 bg-gray-50 px-3 py-2 rounded-lg flex justify-between">
                  <span>首季: {formatTime(times.firstSeasonSeconds)}</span>
                  <span>后续: {formatTime(times.subsequentSeasonSeconds)}/季</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
