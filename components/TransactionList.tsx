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

const getColor = (type: TransactionType) => {
  switch(type) {
    case 'tea': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    case 'coffee': return 'text-amber-700 bg-amber-100 border-amber-200';
    case 'snacks': return 'text-pink-600 bg-pink-100 border-pink-200';
    case 'payment': return 'text-blue-600 bg-blue-100 border-blue-200';
    default: return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  totalTransactions,
  onDelete,
  onClearAll,
  searchQuery,
  onSearchChange,
  iconMapping,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderEmptyState = () => {
    if (totalTransactions === 0) {
      return (
        <div className="text-center py-20 text-theme-muted">
          <i className="fa-solid fa-mug-hot text-5xl mb-4 opacity-50"></i>
          <p className="font-semibold">No transactions yet.</p>
          <p className="text-sm">Click the '+' button to add your first entry.</p>
        </div>
      );
    }
    if (transactions.length === 0 && searchQuery) {
      return (
        <div className="text-center py-20 text-theme-muted">
          <i className="fa-solid fa-magnifying-glass text-5xl mb-4 opacity-50"></i>
          <p className="font-semibold">No results found.</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-theme-surface rounded-3xl p-4 sm:p-6 shadow-sm border border-black/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-theme-main">Recent History</h3>
        <div className="flex items-center gap-2">
           <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)} 
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-body text-theme-main hover:bg-black/5 transition-colors"
              aria-label="Toggle Search"
            >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          {totalTransactions > 0 && (
             <button onClick={onClearAll} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
              Clear All
            </button>
          )}
        </div>
      </div>

      {isSearchVisible && (
         <div className="relative mb-4">
            <i className="fa-solid fa-search text-theme-muted absolute left-4 top-1/2 -translate-y-1/2"></i>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by note, user, or amount..."
              className="w-full bg-theme-body border-2 border-transparent rounded-xl py-3 pl-10 pr-4 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all"
            />
         </div>
      )}

      <div className="space-y-3">
        {transactions.length > 0 
          ? transactions.map(t => (
            <div key={t.id} className="bg-theme-body p-3 rounded-2xl flex items-center gap-4 transition-transform active:scale-[0.99]">
              <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-lg border-2 ${getColor(t.type)}`}>
                  <i className={`fa-solid ${iconMapping[t.type]}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                      <p className="font-bold capitalize text-sm text-theme-main truncate">{t.user || t.type}</p>
                      <span className={`font-bold text-base ${t.type === 'payment' ? 'text-green-500' : 'text-theme-main'}`}>
                          {t.type === 'payment' ? '+' : '−'}₹{t.amount.toFixed(2)}
                      </span>
                  </div>
                  <p className="text-xs text-theme-muted truncate" title={t.note}>{t.note || formatFullDate(t.date)}</p>
                  {t.type !== 'payment' && (
                      <p className="text-[10px] text-theme-muted">{t.quantity} &times; ₹{t.price.toFixed(2)}</p>
                  )}
              </div>
              <button 
                onClick={() => onDelete(t.id)} 
                className="text-xs text-red-400 opacity-50 hover:opacity-100 font-semibold self-start mt-1"
                aria-label={`Delete transaction ${t.id}`}
              >
                DELETE
              </button>
            </div>
          ))
          : renderEmptyState()
        }
      </div>
    </div>
  );
};

export default TransactionList;
