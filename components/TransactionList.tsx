import React, { useState } from 'react';
import { Transaction, TransactionType, IconMapping } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  totalTransactions: number;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  iconMapping: IconMapping;
}

const getColor = (type: string) => {
  switch(type) {
    case 'tea': return 'text-green-600 bg-green-100';
    case 'coffee': return 'text-amber-600 bg-amber-100';
    case 'snacks': return 'text-pink-600 bg-pink-100';
    case 'payment': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, totalTransactions, onDelete, onClearAll, searchQuery, onSearchChange, iconMapping }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const showClearAll = totalTransactions > 0 && !searchQuery;

  return (
    <div className="px-6 md:px-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-theme-main">Recent History</h3>
        <div className="flex items-center gap-4">
          {!isSearchVisible && totalTransactions > 0 && (
            <button 
              onClick={() => setIsSearchVisible(true)} 
              className="text-theme-muted text-lg hover:text-theme-main transition-colors"
              aria-label="Open search"
            >
              <i className="fa-solid fa-search"></i>
            </button>
          )}
          {showClearAll && (
            <button onClick={onClearAll} className="text-xs font-semibold text-red-500 hover:text-red-600">
              Clear All
            </button>
          )}
        </div>
      </div>

      {isSearchVisible && totalTransactions > 0 && (
        <div className="relative mb-4">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none"></i>
          <input
            type="text"
            placeholder="Search by note, user, or amount..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-theme-body border-2 border-transparent rounded-2xl p-3 pl-10 pr-10 text-sm text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all placeholder:text-theme-muted"
            autoFocus
          />
          <button
            onClick={() => {
              setIsSearchVisible(false);
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-theme-muted hover:bg-black/10 transition-colors"
            aria-label="Close search"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      
      <div className="pb-2">
        {totalTransactions === 0 ? (
          <div className="text-center py-12 opacity-40 text-theme-main">
            <i className="fa-solid fa-mug-hot text-4xl mb-3"></i>
            <p>No tea notes yet.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 opacity-60 text-theme-main">
            <i className="fa-solid fa-magnifying-glass text-4xl mb-3"></i>
            <p className="font-semibold">No Results Found</p>
            <p className="text-sm">Try a different search term.</p>
          </div>
        ) : (
          transactions.map(t => {
            const colorClass = getColor(t.type);
            const iconClass = iconMapping[t.type] || 'fa-question';
            const isPayment = t.type === 'payment';

            const formattedDate = new Date(t.date).toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <div key={t.id} className="bg-theme-surface rounded-[20px] p-4 mb-3 flex items-center justify-between shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] transition-transform active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center text-lg`}>
                    <i className={`fa-solid ${iconClass}`}></i>
                  </div>
                  <div>
                    <p className="font-bold capitalize text-sm text-theme-main">{t.note || t.type}</p>
                    <p className="text-xs text-theme-muted mt-1">
                      {t.user} &bull; {formattedDate}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${isPayment ? 'text-green-500' : 'text-theme-main'}`}>
                    {isPayment ? '+' : '-'}₹{t.amount.toFixed(2)}
                  </span>
                  {t.type !== 'payment' && (
                    <p className="text-xs text-theme-muted mt-1">{t.quantity} &times; ₹{t.price.toFixed(2)}</p>
                  )}
                  <button 
                    onClick={() => onDelete(t.id)} 
                    className="text-[10px] text-red-400 mt-1 hover:text-red-500 font-medium"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionList;