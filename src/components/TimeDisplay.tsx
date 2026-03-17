import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * 时间显示组件
 */
export const TimeDisplay: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100">
      <div className="flex items-center space-x-2 text-green-600 mb-2">
        <Clock size={20} />
        <span className="text-sm font-medium">当前农场时间</span>
      </div>
      <div className="text-4xl font-bold text-gray-800 tracking-wider">
        {formatTime(time)}
      </div>
      <div className="text-sm text-gray-500 mt-2">
        {formatDate(time)}
      </div>
    </div>
  );
};
