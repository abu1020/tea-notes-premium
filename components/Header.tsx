import React from 'react';
import { ThemeType } from '../types';
import ThemeSelector from './ThemeSelector';

interface HeaderProps {
  onToggleChart: () => void;
  currentTheme: ThemeType;
  onSetTheme: (theme: ThemeType) => void;
  onToggleCalculator: () => void;
  onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleChart, currentTheme, onSetTheme, onToggleCalculator, onToggleSettings }) => {
  return (
    <header className="pt-8 px-6 flex justify-between items-center mb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 text-theme-main">My Dashboard</p>
        <h1 className="text-2xl font-bold text-theme-main">Tea Notes</h1>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleCalculator}
          className="w-10 h-10 rounded-full bg-theme-surface text-theme-primary shadow-sm flex items-center justify-center transition-transform active:scale-95"
          aria-label="Calculator"
        >
          <i className="fa-solid fa-calculator"></i>
        </button>
        <button 
          onClick={onToggleSettings}
          className="w-10 h-10 rounded-full bg-theme-surface text-theme-primary shadow-sm flex items-center justify-center transition-transform active:scale-95"
          aria-label="Settings"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
        <button 
          onClick={onToggleChart}
          className="w-10 h-10 rounded-full bg-theme-surface text-theme-primary shadow-sm flex items-center justify-center transition-transform active:scale-95"
          aria-label="Analytics"
        >
          <i className="fa-solid fa-chart-pie"></i>
        </button>
        <ThemeSelector currentTheme={currentTheme} onSetTheme={onSetTheme} />
      </div>
    </header>
  );
};

export default Header;