import React, { useMemo, useState } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { recommendPlants } from '../utils/farmCore';
import { TrendingUp, Coins, Search, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useCurrentTime } from '../hooks/useCurrentTime';

/**
 * 智能推荐页面
 */
export const Home: React.FC = () => {
  const { userLevel, strategy, lands, setStrategy, plantOnLand } = useFarmStore();
  const now = useCurrentTime();
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const predominantLandLevel = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    lands.forEach(l => counts[l.landLevel]++);
    let maxLevel = 1;
    let maxCount = 0;
    for(let i=1; i<=4; i++) {
      if(counts[i] > maxCount) {
        maxCount = counts[i];
        maxLevel = i;
      }
    }
    return maxLevel;
  }, [lands]);

  const recommendations = useMemo(() => {
    let recs = recommendPlants({
      userLevel,
      landLevel: predominantLandLevel,
      strategy,
      limit: 20
    });

    if (searchTerm) {
      recs = recs.filter(r => r.plant.name.includes(searchTerm));
    }
    return recs;
  }, [userLevel, predominantLandLevel, strategy, now.getMinutes(), searchTerm]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}小时${m}分`;
  };

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-green-800">智能推荐</h1>
          <p className="text-xs text-gray-500 mt-1">基于 {formatClock(now)} 计算的最优解</p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            Lv.{userLevel}
          </div>
          <div className="text-[10px] text-gray-400">
            {strategy === 'exp' ? '经验优先' : '金币优先'}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-col space-y-3 px-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">Top 推荐方案</h2>
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setStrategy('exp')}
                className={clsx("text-xs px-2 py-1 rounded-md font-medium transition-colors", strategy === 'exp' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500')}
              >
                经验优先
              </button>
              <button 
                onClick={() => setStrategy('coin')}
                className={clsx("text-xs px-2 py-1 rounded-md font-medium transition-colors", strategy === 'coin' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-500')}
              >
                金币优先
              </button>
            </div>
          </div>
          
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
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.plant.id} 
              className={clsx(
                "bg-white rounded-2xl p-4 shadow-sm border transition-all hover:border-green-300",
                index === 0 ? "ring-2 ring-green-400 ring-offset-2" : ""
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex flex-col items-center justify-center text-green-600 font-bold border border-green-100 relative overflow-hidden">
                    <img 
                      src={`/qqnongchang/images/plants/${rec.plant._thumb}`} 
                      alt={rec.plant.name}
                      className="w-8 h-8 object-contain drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-lg">${rec.plant.name.substring(0, 1)}</span>`;
                      }}
                    />
                    {rec.plant.seasons > 1 && (
                      <span className="absolute -bottom-1 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded-t-md whitespace-nowrap opacity-90">
                        {rec.plant.seasons}季
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center">
                      {rec.plant.name}
                      {rec.plant._rarity >= 2 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded">
                          稀有
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      首季: <span className="font-medium text-gray-700">{formatTime(rec.times.firstSeasonSeconds)}</span>
                      {rec.plant.seasons > 1 && (
                        <> | 后续: <span className="font-medium text-gray-700">{formatTime(rec.times.subsequentSeasonSeconds)}</span></>
                      )}
                    </p>
                    {rec.plant.seasons > 1 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        总耗时: {formatTime(rec.times.totalSeconds)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right flex gap-4">
                  {/* 自然成熟时间列 */}
                  <div className="flex flex-col items-end border-r border-gray-100 pr-4">
                    <div className="text-[10px] text-gray-400 mb-1">自然成熟时间</div>
                    <div className="text-sm font-black text-green-600">
                      {rec.plant.seasons > 1 ? '第1季: ' : ''}{formatClock(rec.allMatureTimes[0])}
                    </div>
                    {rec.plant.seasons > 1 && (
                      <div className="text-[10px] text-green-700 mt-0.5 font-bold">
                        第2季: {formatClock(rec.allMatureTimes[1])}
                      </div>
                    )}
                    {rec.plant.seasons > 2 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        ...至 第{rec.plant.seasons}季: {formatClock(rec.allMatureTimes[rec.allMatureTimes.length - 1])}
                      </div>
                    )}
                  </div>

                  {/* 化肥时间列 */}
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] text-amber-500 mb-1 flex items-center">
                      <Zap size={10} className="mr-0.5" /> 施肥(秒收)时间
                    </div>
                    <div className="text-sm font-black text-amber-500">
                      {rec.plant.seasons > 1 ? '第1季: ' : ''}{formatClock(rec.allFertilizerTimes[0])}
                    </div>
                    {rec.plant.seasons > 1 && (
                      <div className="text-[10px] text-amber-600 mt-0.5 font-bold">
                        第2季: {formatClock(rec.allFastMatureTimes[1])}
                      </div>
                    )}
                    {rec.plant.seasons > 2 && (
                      <div className="text-[10px] text-amber-600/70 mt-0.5">
                        ...至 第{rec.plant.seasons}季: {formatClock(rec.allFastMatureTimes[rec.allFastMatureTimes.length - 1])}
                      </div>
                    )}
                    <div className="text-[9px] text-amber-500/70 mt-1 text-right">
                      (第一季跳过 {formatTime(rec.times.lastPhaseSeconds)})
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">经验: +{rec.yields.totalExp}</div>
                    <div className="text-xs font-bold text-blue-700">{rec.expPerHour.toFixed(1)} / 小时</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
                    <Coins size={14} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">利润: +{rec.yields.totalCoin}</div>
                    <div className="text-xs font-bold text-yellow-700">{rec.coinPerHour.toFixed(1)} / 小时</div>
                  </div>
                </div>
              </div>

              {/* 种植到农场按钮 */}
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => {
                    // 找到第一块空地种下
                    const emptyLand = lands.find(l => !l.plantedPlantId);
                    if (emptyLand) {
                      plantOnLand(emptyLand.id, rec.plant.id);
                      showToast(`已成功种植【${rec.plant.name}】`);
                    } else {
                      showToast('农场没有空地了，请先扩建或收获！');
                    }
                  }}
                  className="flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  一键种植
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 轻量提示框 */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 animate-fade-in-up">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
