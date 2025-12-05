import React, { useState } from 'react';
import { TransactionType, IconMapping } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  iconMapping: IconMapping;
  onUpdateIcon: (type: TransactionType, icon: string) => void;
}

const AVAILABLE_ICONS = [
  'fa-mug-hot', 'fa-coffee', 'fa-glass-water', 'fa-wine-glass', 'fa-martini-glass',
  'fa-beer-mug-empty', 'fa-flask', 'fa-bottle-water', 'fa-cookie-bite',
  'fa-cookie', 'fa-burger', 'fa-pizza-slice', 'fa-ice-cream',
  'fa-bowl-food', 'fa-apple-whole', 'fa-carrot', 'fa-leaf',
  'fa-utensils', 'fa-check', 'fa-wallet', 'fa-credit-card',
  'fa-money-bill', 'fa-coins', 'fa-piggy-bank', 'fa-sack-dollar',
  'fa-cart-shopping', 'fa-basket-shopping', 'fa-bag-shopping', 'fa-tag',
  'fa-gift', 'fa-star', 'fa-heart', 'fa-bell', 'fa-fire', 'fa-snowflake'
];

const CATEGORIES: { id: TransactionType; label: string; colorClass: string }[] = [
  { id: 'tea', label: 'Tea', colorClass: 'bg-green-100 text-green-600' },
  { id: 'coffee', label: 'Coffee', colorClass: 'bg-amber-100 text-amber-600' },
  { id: 'snacks', label: 'Snack', colorClass: 'bg-pink-100 text-pink-600' },
  { id: 'payment', label: 'Pay', colorClass: 'bg-blue-100 text-blue-600' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, iconMapping, onUpdateIcon }) => {
  const [activeCategory, setActiveCategory] = useState<TransactionType>('tea');

  const modalClasses = `fixed inset-0 bg-theme-surface z-50 transition-transform duration-300 p-6 flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;

  return (
    <div className={modalClasses}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-theme-main">Customize Icons</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-theme-body text-theme-main flex items-center justify-center transition-colors hover:bg-black/5"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border-2 ${
              activeCategory === cat.id 
                ? `border-theme-primary bg-theme-body` 
                : 'border-transparent bg-theme-body opacity-60'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.colorClass}`}>
              <i className={`fa-solid ${iconMapping[cat.id]}`}></i>
            </div>
            <span className="font-bold text-sm text-theme-main">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <h3 className="text-xs font-bold uppercase text-theme-muted tracking-widest mb-4">Select Icon for {CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => onUpdateIcon(activeCategory, icon)}
              className={`aspect-square rounded-xl flex items-center justify-center text-base transition-all ${
                iconMapping[activeCategory] === icon
                  ? 'bg-theme-primary text-white shadow-md scale-105'
                  : 'bg-theme-body text-theme-main hover:bg-black/5'
              }`}
            >
              <i className={`fa-solid ${icon}`}></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;