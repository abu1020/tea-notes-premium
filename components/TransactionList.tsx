import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, IconMapping } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  totalTransactions: number;
  onDelete: (id: number) => void;
  onEdit: (tx: Transaction) => void;
  onClearAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  iconMapping: IconMapping;
}

const getColor = (type: TransactionType) => {
  switch(type) {
    case 'tea': return 'text-emerald-600 bg-emerald-100/50 border-emerald-100';
    case 'coffee': return 'text-amber-700 bg-amber-100/50 border-amber-100';
    case 'snacks': return 'text-pink-600 bg-pink-100/50 border-pink-100';
    case 'payment': return 'text-blue-600 bg-blue-100/50 border-blue-100';
    default: return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const TransactionList: React.FC<TransactionListProps> = React.memo(({
  transactions,
  totalTransactions,
  onDelete,
  onEdit,
  onClearAll,
  searchQuery,
  onSearchChange,
  iconMapping,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [visibleCount, setVisibleCount] = useState(20);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  // Handle external search query changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Reset visible count on search or transactions change
  useEffect(() => {
    setVisibleCount(20);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [transactions]);

  // Simple Virtualization / Load More on Scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (visibleCount < transactions.length) {
        setVisibleCount(prev => Math.min(prev + 20, transactions.length));
      }
    }
  };

  const visibleTransactions = transactions.slice(0, visibleCount);

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderEmptyState = () => {
    if (totalTransactions === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-theme-muted bg-theme-body rounded-3xl border border-dashed border-black/5" role="status">
          <div className="w-16 h-16 bg-theme-surface rounded-full flex items-center justify-center shadow-sm mb-4">
             <i className="fa-solid fa-mug-hot text-2xl opacity-40" aria-hidden="true"></i>
          </div>
          <p className="font-bold text-lg mb-1">No transactions yet</p>
          <p className="text-sm opacity-70">Add your first entry to get started</p>
        </div>
      );
    }
    if (transactions.length === 0 && searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-theme-muted" role="status">
           <div className="w-16 h-16 bg-theme-body rounded-full flex items-center justify-center mb-4">
             <i className="fa-solid fa-magnifying-glass text-2xl opacity-40" aria-hidden="true"></i>
           </div>
          <p className="font-bold">No results found</p>
          <p className="text-sm opacity-70">Try a different search term</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-theme-surface rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-black/5 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="font-extrabold text-xl text-theme-main tracking-tight">Recent History</h3>
        <div className="flex items-center gap-2">
           <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)} 
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isSearchVisible ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/30' : 'bg-theme-body text-theme-main hover:bg-black/5'}`}
              aria-label={isSearchVisible ? "Close search" : "Open search"}
              aria-expanded={isSearchVisible}
            >
            <i className={`fa-solid ${isSearchVisible ? 'fa-xmark' : 'fa-magnifying-glass'}`} aria-hidden="true"></i>
          </button>
          {totalTransactions > 0 && (
             <button 
               onClick={onClearAll} 
               className="px-4 h-10 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors uppercase tracking-wide"
               aria-label="Clear all transactions"
             >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${isSearchVisible ? 'max-h-20 mb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
         <div className="relative">
            <i className="fa-solid fa-search text-theme-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true"></i>
            <input 
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search notes, users..."
              aria-label="Search transactions"
              className="w-full bg-theme-body border-none rounded-2xl py-3 pl-11 pr-4 text-theme-main placeholder:text-theme-muted/50 focus:ring-2 focus:ring-theme-primary/20 transition-all font-medium"
              autoFocus={isSearchVisible}
            />
         </div>
      </div>

      <div 
        ref={listRef}
        className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-hide"
        onScroll={handleScroll}
        role="list"
        aria-label="Transaction history"
      >
        {visibleTransactions.length > 0 
          ? visibleTransactions.map(t => (
            <div 
              key={t.id} 
              className="group bg-theme-body hover:bg-white border border-transparent hover:border-black/5 p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transform-gpu"
              role="listitem"
            >
              <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-xl border ${getColor(t.type)} shadow-sm`}>
                  <i className={`fa-solid ${iconMapping[t.type]}`} aria-hidden="true"></i>
              </div>
              
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-theme-main truncate text-base">{t.user || 'Unknown User'}</p>
                      <span className={`font-extrabold text-base tracking-tight ${t.type === 'payment' ? 'text-green-600' : 'text-theme-main'}`}>
                          {t.type === 'payment' ? '+' : '−'}₹{t.amount.toFixed(2)}
                      </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <p className="text-xs font-medium text-theme-muted capitalize mb-0.5">{t.type} • {t.note || 'No note'}</p>
                        <p className="text-[10px] text-theme-muted/70 font-bold uppercase tracking-wider">{formatFullDate(t.date)}</p>
                      </div>
                      
                      {t.type !== 'payment' && (
                         <div className="bg-theme-surface px-2 py-1 rounded-lg border border-black/5">
                             <p className="text-[10px] font-bold text-theme-muted">{t.quantity} &times; ₹{t.price.toFixed(2)}</p>
                         </div>
                      )}
                  </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(t); }} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-primary-light transition-colors"
                  aria-label={`Edit transaction from ${t.user}`}
                  title="Edit"
                >
                  <i className="fa-solid fa-pen" aria-hidden="true"></i>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-theme-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Delete transaction from ${t.user}`}
                  title="Delete"
                >
                  <i className="fa-solid fa-trash-can" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          ))
          : renderEmptyState()
        }
        {visibleCount < transactions.length && (
            <div className="py-4 text-center text-xs text-theme-muted animate-pulse" role="status">
                Loading more...
            </div>
        )}
      </div>
    </div>
  );
});

export default TransactionList;