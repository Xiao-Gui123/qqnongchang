import React from 'react';
import { CROPS } from '../utils/constants';
import { Clock, Layers, TrendingUp } from 'lucide-react';

/**
 * 作物列表页面
 */
export const Crops: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">作物百科</h1>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          全部作物
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {CROPS.map((crop) => (
          <div key={crop.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center space-x-4">
              <div className="text-3xl bg-gray-50 w-14 h-14 flex items-center justify-center rounded-xl">
                {crop.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{crop.name}</h3>
                <div className="flex space-x-2 mt-1">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase">
                    {crop.baseDuration}小时
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">
                    {crop.seasons}季
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                <Clock size={14} className="text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-400 uppercase">基础时长</span>
                <span className="text-xs font-bold text-gray-700">{crop.baseDuration}h</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                <Layers size={14} className="text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-400 uppercase">生长阶段</span>
                <span className="text-xs font-bold text-gray-700">{crop.stages}段</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                <TrendingUp size={14} className="text-gray-400 mb-1" />
                <span className="text-[10px] text-gray-400 uppercase">作物季数</span>
                <span className="text-xs font-bold text-gray-700">{crop.seasons}季</span>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-400 italic text-center">
              注：两季作物在第一次收获后，第二次成熟仅需基础时长的 40% (2/5)。
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
