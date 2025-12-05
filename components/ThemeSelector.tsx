import React, { useState, useEffect, useRef } from 'react';
import { ThemeType } from '../types';

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onSetTheme: (theme: ThemeType) => void;
}

const themes: { id: ThemeType; label: string; colorClass: string }[] = [
    { id: 'matcha', label: 'Matcha', colorClass: 'bg-emerald-500' },
    { id: 'dark', label: 'Dark Roast', colorClass: 'bg-gray-800' },
    { id: 'hibiscus', label: 'Hibiscus', colorClass: 'bg-rose-500' },
    { id: 'chai', label: 'Chai', colorClass: 'bg-orange-500' },
    { id: 'ocean', label: 'Ocean', colorClass: 'bg-blue-600' },
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSetTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
        <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-theme-surface shadow-sm flex items-center justify-center text-theme-primary transition-transform active:scale-95"
            aria-label="Select Theme"
        >
            <i className="fa-solid fa-palette"></i>
        </button>

        {/* Theme Popup Menu */}
        {isMenuOpen && (
            <div className={`absolute right-0 top-full mt-2 w-48 bg-theme-surface rounded-2xl shadow-2xl p-2 z-20 border border-black/5 transition-all duration-200 ease-out origin-top-right ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <ul className="space-y-1">
                    {themes.map((theme) => (
                        <li key={theme.id}>
                            <button
                                onClick={() => {
                                    onSetTheme(theme.id);
                                    setIsMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                    currentTheme === theme.id 
                                    ? 'bg-theme-body font-bold' 
                                    : 'hover:bg-theme-body'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full ${theme.colorClass}`}></div>
                                <span className="text-sm text-theme-main">{theme.label}</span>
                                {currentTheme === theme.id && (
                                    <i className="fa-solid fa-check text-theme-primary ml-auto text-xs"></i>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};

export default ThemeSelector;
