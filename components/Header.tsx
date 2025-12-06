import React from 'react';
import { ThemeType, SyncStatus } from '../types';
import ThemeSelector from './ThemeSelector';

interface HeaderProps {
  onToggleChart: () => void;
  currentTheme: ThemeType;
  onSetTheme: (theme: ThemeType) => void;
  onToggleCalculator: () => void;
  onToggleSettings: () => void;
  syncStatus: SyncStatus;
}

const SyncIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return { icon: 'fa-solid fa-cloud-check', color: 'text-green-500', title: 'Connected' };
      case 'syncing':
        return { icon: 'fa-solid fa-cloud-arrow-up fa-spin', color: 'text-blue-500', title: 'Syncing...' };
      case 'connecting':
        return { icon: 'fa-solid fa-spinner fa-spin', color: 'text-amber-500', title: 'Connecting...' };
      case 'error':
        return { icon: 'fa-solid fa-cloud-xmark', color: 'text-red-500', title: 'Sync Error' };
      case 'offline':
      default:
        return { icon: 'fa-solid fa-cloud', color: 'text-theme-muted', title: 'Offline Mode' };
    }
  };
  const { icon, color, title } = getStatusIcon();
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-theme-surface/50 backdrop-blur-sm border border-black/5 shadow-sm ${color}`} title={title}>
      <i className={icon}></i>
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ onToggleChart, currentTheme, onSetTheme, onToggleCalculator, onToggleSettings, syncStatus }) => {
  return (
    <header className="sticky top-0 z-30 pt-4 pb-2 px-4 sm:px-6 md:pt-8 md:pb-6 flex justify-between items-center bg-theme-body/90 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-1 text-theme-main transition-opacity hover:opacity-100">Overview</p>
        <h1 className="text-xl md:text-3xl font-extrabold text-theme-main tracking-tight leading-none">Office BU</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <SyncIndicator status={syncStatus} />
        
        <div className="h-6 w-px bg-theme-main/10 mx-1"></div>

        <button 
          onClick={onToggleCalculator}
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-theme-surface hover:bg-white text-theme-primary shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 group"
          aria-label="Calculator"
        >
          <i className="fa-solid fa-calculator text-lg group-hover:scale-110 transition-transform"></i>
        </button>
        <button 
          onClick={onToggleSettings}
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-theme-surface hover:bg-white text-theme-primary shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 group"
          aria-label="Settings"
        >
          <i className="fa-solid fa-gear text-lg group-hover:rotate-45 transition-transform duration-500"></i>
        </button>
        <button 
          onClick={onToggleChart}
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-theme-surface hover:bg-white text-theme-primary shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 group"
          aria-label="Analytics"
        >
          <i className="fa-solid fa-chart-pie text-lg group-hover:scale-110 transition-transform"></i>
        </button>
        <ThemeSelector currentTheme={currentTheme} onSetTheme={onSetTheme} />
      </div>
    </header>
  );
};

export default Header;