
import React from 'react';
import { ThemeType, SyncStatus, User } from '../types';
import ThemeSelector from './ThemeSelector';

interface HeaderProps {
  onToggleChart: () => void;
  currentTheme: ThemeType;
  onSetTheme: (theme: ThemeType) => void;
  onToggleCalculator: () => void;
  onToggleSettings: () => void;
  onToggleAbout: () => void;
  syncStatus: SyncStatus;
  onLogout: () => void;
  currentUser?: User;
}

const SyncIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return { icon: 'fa-solid fa-cloud-check', color: 'text-green-500 bg-green-500/10', title: 'Connected' };
      case 'syncing':
        return { icon: 'fa-solid fa-cloud-arrow-up fa-fade', color: 'text-blue-500 bg-blue-500/10', title: 'Syncing...' };
      case 'connecting':
        return { icon: 'fa-solid fa-circle-notch fa-spin', color: 'text-amber-500 bg-amber-500/10', title: 'Connecting...' };
      case 'error':
        return { icon: 'fa-solid fa-cloud-xmark', color: 'text-red-500 bg-red-500/10', title: 'Sync Error' };
      case 'offline':
      default:
        return { icon: 'fa-solid fa-cloud', color: 'text-theme-muted bg-theme-surface', title: 'Offline Mode' };
    }
  };
  const { icon, color, title } = getStatusIcon();
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-black/5 shadow-sm transition-all ${color}`} title={title}>
      <i className={icon}></i>
    </div>
  );
};


const Header: React.FC<HeaderProps> = React.memo(({ onToggleChart, currentTheme, onSetTheme, onToggleCalculator, onToggleSettings, onToggleAbout, syncStatus, onLogout, currentUser }) => {
  return (
    <header className="sticky top-0 z-30 pt-4 pb-4 px-4 sm:px-6 md:pt-6 md:pb-6 flex justify-between items-center bg-theme-body/80 backdrop-blur-xl transition-all duration-300">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-theme-primary"></div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-theme-muted">Office Portal</p>
             {currentUser?.isAdmin && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold tracking-wider">MASTER ADMIN</span>
             )}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-theme-main tracking-tight leading-none">Office BU</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* SyncIndicator removed as per previous local-first update, but keeping prop if needed later or cleaning up. 
            For now, focusing on the requested About Us button addition. */}
        
        <div className="flex gap-2">
            <button 
            onClick={onToggleCalculator}
            className="w-10 h-10 rounded-xl bg-theme-surface hover:bg-white text-theme-main shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 hover:-translate-y-0.5"
            aria-label="Calculator"
            title="Calculator"
            >
            <i className="fa-solid fa-calculator text-lg opacity-70"></i>
            </button>
            <button 
            onClick={onToggleSettings}
            className="w-10 h-10 rounded-xl bg-theme-surface hover:bg-white text-theme-main shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 hover:-translate-y-0.5"
            aria-label="Settings"
            title="Settings"
            >
            <i className="fa-solid fa-sliders text-lg opacity-70"></i>
            </button>
            <button 
            onClick={onToggleChart}
            className="w-10 h-10 rounded-xl bg-theme-surface hover:bg-white text-theme-main shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 hover:-translate-y-0.5"
            aria-label="Analytics"
            title="Analytics"
            >
            <i className="fa-solid fa-chart-pie text-lg opacity-70"></i>
            </button>
            <button 
            onClick={onToggleAbout}
            className="w-10 h-10 rounded-xl bg-theme-surface hover:bg-white text-theme-main shadow-sm hover:shadow-md border border-black/5 flex items-center justify-center transition-all active:scale-95 hover:-translate-y-0.5"
            aria-label="About Us"
            title="About Us"
            >
            <i className="fa-solid fa-circle-info text-lg opacity-70"></i>
            </button>
            <ThemeSelector currentTheme={currentTheme} onSetTheme={onSetTheme} />
        </div>
        
        <div className="h-8 w-px bg-theme-main/10 mx-1"></div>
        
        <button 
          onClick={onLogout}
          className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 shadow-sm flex items-center justify-center transition-all active:scale-95 hover:-translate-y-0.5"
          aria-label="Logout"
          title="Logout"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </header>
  );
});

export default Header;
