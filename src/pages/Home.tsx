import React, { useMemo } from 'react';
import { TimeDisplay } from '../components/TimeDisplay';
import { CropCard } from '../components/CropCard';
import { useStore } from '../store/useStore';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { calculateDuration, getAllPlantingPlans } from '../utils/calculator';
import { CROPS } from '../utils/constants';

/**
 * 推荐页面
 */
export const Home: React.FC = () => {
  const { settings } = useStore();
  const { landType, useFertilizer } = settings;
  const now = useCurrentTime();

  // 实时获取推荐方案并按时长升序排序（时间越短越优先）
  const plans = useMemo(() => {
    const rawPlans = getAllPlantingPlans(CROPS, now, landType, useFertilizer);
    
    // 计算每个方案的真实时长并排序
    return rawPlans.sort((a, b) => {
      const durationA = calculateDuration(a.crop, landType, useFertilizer, a.isSecondSeason);
      const durationB = calculateDuration(b.crop, landType, useFertilizer, b.isSecondSeason);
      
      return durationA - durationB; // 升序排序，时间短的在前
    });
  }, [now, landType, useFertilizer]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">农场助手</h1>
        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
          推荐方案
        </div>
      </header>

      <TimeDisplay />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-700">推荐种植</h2>
          <span className="text-xs text-gray-400">共 {plans.length} 个方案</span>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan) => (
            <CropCard key={`${plan.crop.id}-${plan.isSecondSeason}`} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
};
