import React, { useMemo } from 'react';
import { TimeDisplay } from '../components/TimeDisplay';
import { CropCard } from '../components/CropCard';
import { useStore } from '../store/useStore';
import { getAllPlantingPlans } from '../utils/calculator';
import { CROPS } from '../utils/constants';

/**
 * 推荐页面
 */
export const Home: React.FC = () => {
  const { settings } = useStore();
  const { landType, useFertilizer } = settings;

  // 实时获取推荐方案
  const plans = useMemo(() => {
    return getAllPlantingPlans(CROPS, new Date(), landType, useFertilizer);
  }, [landType, useFertilizer]);

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
          {plans.map((plan, index) => (
            <CropCard key={`${plan.crop.id}-${plan.isSecondSeason}-${index}`} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
};
