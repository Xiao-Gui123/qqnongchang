import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, History, List, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 底部导航栏组件
 */
export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: '推荐' },
    { to: '/board', icon: LayoutGrid, label: '看板' },
    { to: '/reverse', icon: History, label: '倒推' },
    { to: '/crops', icon: List, label: '图鉴' },
    { to: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-green-600" : "text-gray-500"
                )
              )
            }
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
