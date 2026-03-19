import React, { useState, useMemo } from 'react';
import { useFarmStore } from '../store/useFarmStore';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { reversePlanPlants } from '../utils/farmCore';
import { Clock, Info, ArrowRight, Zap, Pickaxe } from 'lucide-react';
import { clsx } from 'clsx';

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

/**
 * 倒推规划页面
 */
export const Reverse: React.FC = () => {
  const { userLevel, lands } = useFarmStore();
  const now = useCurrentTime();

  // 假设我们以农场里占比最多的土地类型作为基准来进行推荐
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

  // 默认目标收获时间：今天 18:00
  const defaultTargetTime = useMemo(() => {
    const time = new Date();
    time.setHours(18, 0, 0, 0);
    // 如果 18:00 已经过了，设置为明天 18:00
    if (time < new Date()) {
      time.setDate(time.getDate() + 1);
    }
    return time;
  }, []);

  const [targetTime, setTargetTime] = useState(defaultTargetTime);

  const plans = useMemo(() => {
    return reversePlanPlants(targetTime, userLevel, predominantLandLevel);      
  }, [targetTime, userLevel, predominantLandLevel, now.getMinutes()]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!/^\d{2}:\d{2}$/.test(value)) {
      return;
    }
    const [hours, minutes] = value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return;
    }
    const newDate = new Date();
    newDate.setHours(hours, minutes, 0, 0);
    // 如果选择的时间已经过了，设置为明天
    if (newDate < new Date()) {
      newDate.setDate(newDate.getDate() + 1);
    }
    setTargetTime(newDate);
  };

  const timeValue = `${targetTime.getHours().toString().padStart(2, '0')}:${targetTime.getMinutes().toString().padStart(2, '0')}`;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}小时${m > 0 ? `${m}分` : ''}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-green-800">倒推规划</h1>    
          <p className="text-xs text-gray-500 mt-1">根据期望的收获时间反推</p>
        </div>
        <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
          化肥计算
        </div>
      </header>

      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">   
          <div className="flex items-center space-x-2 text-gray-700 font-bold">
            <Clock size={18} className="text-green-600" />
            <span>我想要在这个时间收菜：</span>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="w-full h-14 px-4 bg-gray-50 border-2 border-green-100 rounded-xl text-2xl font-black text-gray-800 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-400 transition-all text-center"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-xs">
            {isSameDay(targetTime, new Date()) ? '今天' : '明天'}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-gray-700">可行种植方案</h2>   
          <span className="text-xs text-gray-400">共 {plans.length} 个建议</span>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.plant.id} 
                className={clsx(
                  "bg-white rounded-2xl p-4 shadow-sm border transition-all relative overflow-hidden",
                  plan.status === 'perfect' ? 'border-green-400 ring-2 ring-green-100' :
                  plan.status === 'need_fertilizer' ? 'border-amber-300' : 'border-gray-200 opacity-80'
                )}
              >
                {/* 状态徽章 */}
                <div className={clsx(
                  "absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl",
                  plan.status === 'perfect' ? 'bg-green-500 text-white' :
                  plan.status === 'need_fertilizer' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  {plan.status === 'perfect' ? '完美卡点' :
                   plan.status === 'need_fertilizer' ? '需用化肥' : '稍后种植'}
                </div>

                <div className="flex items-start space-x-3 mt-2">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                    <img 
                      src={`/qqnongchang/images/plants/${plan.plant._thumb}`} 
                      alt={plan.plant.name}
                      className="w-10 h-10 object-contain drop-shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold text-gray-700">${plan.plant.name.substring(0, 1)}</span>`;
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{plan.plant.name}</h3>
                    <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                      <span>生长时间:</span>
                      <span className="font-medium text-gray-700">{formatTime(plan.times.firstSeasonSeconds)}</span>
                    </div>
                  </div>
                </div>

                {/* 方案详情区 */}
                <div className="mt-4 pt-3 border-t border-gray-50">
                  {plan.status === 'perfect' && (
                    <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-2 rounded-lg text-xs font-medium">
                      <Pickaxe size={14} />
                      <span>现在立刻种植，完美赶在目标时间收获！</span>
                    </div>
                  )}

                  {plan.status === 'need_fertilizer' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-amber-700 text-xs font-medium px-1">
                        <Zap size={14} />
                        <span>现在种来不及了，需要打以下化肥：</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plan.fertilizerCombo.map((c, i) => (
                          <div key={i} className="flex items-center space-x-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded text-xs text-amber-800">
                            <span className="font-bold">{c.fertilizer.name.replace('化肥', '')}</span>
                            <span className="text-amber-400">×</span>
                            <span className="font-black">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.status === 'too_early' && (
                    <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-2 rounded-lg text-xs font-medium">
                      <Clock size={14} />
                      <span>种早了！建议等待 <span className="font-bold">{formatTime(plan.delaySecondsToPlant)}</span> 后再种植。</span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Info size={48} className="opacity-20" />
            <p className="text-sm">没有找到合适的种植方案</p>
            <p className="text-xs">目标时间可能已经过去</p>
          </div>
        )}
      </section>
    </div>
  );
};
