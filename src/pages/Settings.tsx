import React from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { Shield, Zap, Map, Clock, Target, TrendingUp, Coins } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * 设置页面
 * 包含玩家等级、作息时间、偏好策略以及全局土地一键设置
 */
export const Settings: React.FC = () => {
  const { 
    userLevel, 
    setUserLevel, 
    strategy, 
    setStrategy,
    batchUpdateLands 
  } = useFarmStore();

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 200) {
      setUserLevel(val);
    }
  };

  const landTypes = [
    { id: 1, name: '普通土地', desc: '无加成', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 2, name: '红土地', desc: '产量+100%', color: 'bg-red-100 text-red-700 border-red-200' },
    { id: 3, name: '黑土地', desc: '产量+200% 时间-10%', color: 'bg-zinc-800 text-zinc-100 border-zinc-700' },
    { id: 4, name: '金土地', desc: '产量+300% 时间-20%', color: 'bg-yellow-400 text-yellow-900 border-yellow-300' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">偏好设置</h1>    
        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
          系统配置
        </div>
      </header>

      {/* 玩家基础信息 */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 font-bold px-1">
          <Target size={18} className="text-blue-500" />
          <span>玩家等级 (用于过滤未解锁种子)</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <span className="text-gray-600 font-medium">当前农场等级</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Lv.</span>
            <input 
              type="number" 
              value={userLevel} 
              onChange={handleLevelChange}
              className="w-16 text-center bg-gray-50 border border-gray-200 rounded-lg py-1 px-2 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              min={1}
              max={200}
            />
          </div>
        </div>
      </section>

      {/* 收益策略偏好 */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 font-bold px-1">
          <Zap size={18} className="text-amber-500" />
          <span>推荐策略偏好</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setStrategy('exp')}
            className={clsx(
              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
              strategy === 'exp'
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-transparent bg-white shadow-sm"
            )}
          >
            <TrendingUp size={24} className={strategy === 'exp' ? 'text-blue-600' : 'text-gray-400'} />
            <span className={clsx("mt-2 font-bold", strategy === 'exp' ? 'text-blue-700' : 'text-gray-600')}>经验优先</span>
            <span className="text-[10px] text-gray-400 mt-1">快速冲级</span>
          </button>

          <button
            onClick={() => setStrategy('coin')}
            className={clsx(
              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
              strategy === 'coin'
                ? "border-yellow-500 bg-yellow-50 shadow-md"
                : "border-transparent bg-white shadow-sm"
            )}
          >
            <Coins size={24} className={strategy === 'coin' ? 'text-yellow-600' : 'text-gray-400'} />
            <span className={clsx("mt-2 font-bold", strategy === 'coin' ? 'text-yellow-700' : 'text-gray-600')}>金币优先</span>
            <span className="text-[10px] text-gray-400 mt-1">财富最大化</span>
          </button>
        </div>
      </section>

      {/* 全局土地快速设置 */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 font-bold px-1">
          <Map size={18} className="text-green-600" />
          <span>一键全局土地设置</span>
        </div>
        <p className="text-xs text-gray-500 px-1">
          （高级玩家可前往“农场看板”进行单块土地精细配置）
        </p>

        <div className="grid grid-cols-1 gap-3">
          {landTypes.map((land) => (
            <button
              key={land.id}
              onClick={() => batchUpdateLands(land.id)}
              className={clsx(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98] border-transparent bg-white shadow-sm hover:border-green-300"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg", land.color)}>
                  {land.name[0]}
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800">{land.name}</div>    
                  <div className="text-xs text-gray-400">{land.desc}</div>      
                </div>
              </div>
              <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                应用全部
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="pt-8 text-center text-[10px] text-gray-300">
        <p>QQ农场高阶辅助引擎 v2.0.0</p>
      </div>
    </div>
  );
};
