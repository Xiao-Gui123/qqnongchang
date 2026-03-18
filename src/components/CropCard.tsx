import React from 'react';
import { PlantingPlan } from '../types';
import { Calendar, Clock, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface CropCardProps {
  plan: PlantingPlan;
}

function getDayLabel(target: Date, now: Date) {
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(current);
  next.setDate(current.getDate() + 1);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  if (targetDay.getTime() === current.getTime()) return '今天';
  if (targetDay.getTime() === next.getTime()) return '明天';
  return `${target.getMonth() + 1}/${target.getDate()}`;
}

/**
 * 作物卡片组件
 */
export const CropCard: React.FC<CropCardProps> = ({ plan }) => {
  const { crop, isSecondSeason, landType, useFertilizer } = plan;

  const formatTime = (date: Date) => {
    const now = new Date();
    const prefix = getDayLabel(date, now);
    
    return `${prefix} ${date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
  };

  const landColors = {
    normal: 'bg-amber-100 text-amber-800',
    black: 'bg-zinc-800 text-zinc-100',
    gold: 'bg-yellow-400 text-yellow-900',
  };

  const landLabels = {
    normal: '普通土地',
    black: '黑土地(-10%)',
    gold: '金土地(-20%)',
  };

  const actionText = isSecondSeason ? '收获并进入下一季' : '种植';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col space-y-3 active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl bg-green-50 w-12 h-12 flex items-center justify-center rounded-lg">
            {crop.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center">
              {crop.name}
              {isSecondSeason && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">
                  第二季
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">基础时长: {crop.baseDuration}小时</p>
          </div>
        </div>
        <div className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", landColors[landType])}>
          {landLabels[landType]}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-50">
        <div className="flex items-center space-x-2">
          <Calendar size={14} className="text-blue-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">建议{actionText}</span>
            <span className="text-xs font-bold text-gray-700">{formatTime(plan.plantTime)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={14} className="text-green-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">预计收获时间</span>
            <span className="text-xs font-bold text-gray-700">{formatTime(plan.harvestTime)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <Zap size={14} className={clsx(useFertilizer ? "text-amber-500" : "text-gray-300")} />
          <span className={clsx("text-[10px] font-bold", useFertilizer ? "text-amber-600" : "text-gray-400")}>
            {useFertilizer ? "化肥催熟(-1段)" : "未使用化肥"}
          </span>
        </div>
        
        {plan.plantTime > new Date() ? (
          <div className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded border border-green-100">
            等待 {Math.ceil((plan.plantTime.getTime() - new Date().getTime()) / (1000 * 60))} 分钟后{actionText}
          </div>
        ) : (
          <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded border border-blue-100">
            建议立即{actionText}
          </div>
        )}
      </div>
    </div>
  );
};
