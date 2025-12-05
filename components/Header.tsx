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
        return { icon: 'fa-solid fa-cloud-check', color: 'text-green-500', title: 'Connected to Google Sheets' };
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
    <div className="flex items-center" title={title}>
      <i className={`${icon} ${color}`}></i>
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ onToggleChart, currentTheme, onSetTheme, onToggleCalculator, onToggleSettings, syncStatus }) => {
  return (
    <header className="pt-8 px-6 flex justify-between items-center mb-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1 text-theme-main">Overview</p>
        <h1 className="text-2xl font-bold text-theme-main">Office BU App</h1>
      </div>
      <div className="flex items-center gap-4">
        <SyncIndicator status={syncStatus} />
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