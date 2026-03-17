import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { reverseSearchPlans } from '../utils/calculator';
import { CROPS } from '../utils/constants';
import { CropCard } from '../components/CropCard';
import { Clock, Info } from 'lucide-react';

/**
 * 倒推页面
 */
export const Reverse: React.FC = () => {
  const { settings } = useStore();
  const { landType, useFertilizer } = settings;

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
    return reverseSearchPlans(CROPS, targetTime, landType, useFertilizer);
  }, [targetTime, landType, useFertilizer]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hours, minutes, 0, 0);
    // 如果选择的时间已经过了，设置为明天
    if (newDate < new Date()) {
      newDate.setDate(newDate.getDate() + 1);
    }
    setTargetTime(newDate);
  };

  const timeValue = `${targetTime.getHours().toString().padStart(2, '0')}:${targetTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">倒推规划</h1>
        <div className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
          目标反推
        </div>
      </header>

      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 font-bold">
          <Clock size={18} className="text-green-600" />
          <span>设置目标收获时间</span>
        </div>
        
        <div className="relative">
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-xl font-bold text-gray-800 focus:ring-2 focus:ring-green-500 transition-shadow appearance-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            {targetTime.getDate() === new Date().getDate() ? '今天' : '明天'}
          </div>
        </div>

        <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg text-blue-700">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <p className="text-[11px] leading-relaxed">
            设置你想要收获的时间，系统将为你计算：现在种什么菜、在什么时间种，才能在目标时间准时收获。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-700">可行种植方案</h2>
          <span className="text-xs text-gray-400">共 {plans.length} 个建议</span>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan, index) => (
              <CropCard key={`reverse-${plan.crop.id}-${index}`} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
            <Info size={48} className="opacity-20" />
            <p className="text-sm">没有找到合适的种植方案</p>
            <p className="text-xs">尝试延长目标收获时间</p>
          </div>
        )}
      </section>
    </div>
  );
};
