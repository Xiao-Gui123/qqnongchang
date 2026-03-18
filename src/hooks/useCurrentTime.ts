import { useState, useEffect } from 'react';

/**
 * 获取当前时间的 Hook，每分钟更新一次
 */
export function useCurrentTime(intervalMs: number = 60000) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
