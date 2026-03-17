import React from 'react';
import { useStore } from '../store/useStore';
import { LandType } from '../types';
import { Shield, Zap, Map } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * 设置页面
 */
export const Settings: React.FC = () => {
  const { settings, setLandType, setUseFertilizer } = useStore();

  const landTypes: { id: LandType; name: string; desc: string; color: string }[] = [
    { id: 'normal', name: '普通土地', desc: '无时间缩短', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'black', name: '黑土地', desc: '时间缩短 10%', color: 'bg-zinc-800 text-zinc-100 border-zinc-700' },
    { id: 'gold', name: '金土地', desc: '时间缩短 20%', color: 'bg-yellow-400 text-yellow-900 border-yellow-300' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-green-800">偏好设置</h1>
        <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
          系统配置
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 font-bold px-1">
          <Map size={18} className="text-green-600" />
          <span>土地等级</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {landTypes.map((land) => (
            <button
              key={land.id}
              onClick={() => setLandType(land.id)}
              className={clsx(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98]",
                settings.landType === land.id
                  ? "border-green-500 bg-green-50/50 shadow-md"
                  : "border-transparent bg-white shadow-sm"
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
              {settings.landType === land.id && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                  <Shield size={14} fill="currentColor" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-700 font-bold px-1">
          <Zap size={18} className="text-amber-500" />
          <span>自动化肥</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <div className="font-bold text-gray-800">默认使用化肥</div>
              <div className="text-xs text-gray-400">计算时自动省去 1 个生长阶段</div>
            </div>
          </div>
          <button
            onClick={() => setUseFertilizer(!settings.useFertilizer)}
            className={clsx(
              "w-14 h-8 rounded-full relative transition-colors p-1",
              settings.useFertilizer ? "bg-green-500" : "bg-gray-200"
            )}
          >
            <div className={clsx(
              "w-6 h-6 bg-white rounded-full shadow-sm transition-transform",
              settings.useFertilizer ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>
      </section>

      <div className="pt-8 text-center text-[10px] text-gray-300">
        <p>QQ农场种菜推荐工具 v1.0.0</p>
        <p>© 2026 农场助手团队</p>
      </div>
    </div>
  );
};
