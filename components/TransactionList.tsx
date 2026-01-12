
import React, { useState } from 'react';
import { Transaction, TransactionType, IconMapping } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  totalTransactions: number;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  onBulkDelete: (ids: number[]) => void;
  onBulkCategorize: (ids: number[], newType: TransactionType) => void;
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
  onBulkDelete,
  onBulkCategorize,
  searchQuery,
  onSearchChange,
  iconMapping,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isCategorizeMenuOpen, setIsCategorizeMenuOpen] = useState(false);

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const startSelection = () => {
    setIsSelectionMode(true);
    setSelectedIds([]);
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
    setIsCategorizeMenuOpen(false);
  };

  const handleBulkDeleteAction = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} items?`)) {
      onBulkDelete(selectedIds);
      cancelSelection();
    }
  };

  const handleBulkCategorizeAction = (type: TransactionType) => {
    onBulkCategorize(selectedIds, type);
    cancelSelection();
  };

  const renderEmptyState = () => {
    if (totalTransactions === 0) {
      return (
        <div className="text-center py-20 text-theme-muted">
          <i className="fa-solid fa-mug-hot text-5xl mb-4 opacity-50"></i>
          <p className="font-semibold">No transactions yet.</p>
        </div>
      );
    }
    if (transactions.length === 0 && searchQuery) {
      return (
        <div className="text-center py-20 text-theme-muted">
          <i className="fa-solid fa-magnifying-glass text-5xl mb-4 opacity-50"></i>
          <p className="font-semibold">No results found.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-theme-surface rounded-3xl p-4 sm:p-6 shadow-sm border border-black/5 relative min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-theme-main">
          {isSelectionMode ? `${selectedIds.length} Selected` : 'Recent History'}
        </h3>
        <div className="flex items-center gap-2">
          {!isSelectionMode ? (
            <>
              <button 
                onClick={() => setIsSearchVisible(!isSearchVisible)} 
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-theme-body text-theme-main hover:bg-black/5 transition-colors"
                aria-label="Toggle Search"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
              {totalTransactions > 0 && (
                <button onClick={startSelection} className="text-xs font-semibold text-theme-primary px-2 py-1 bg-theme-primary/10 rounded-lg">
                  Select
                </button>
              )}
              {totalTransactions > 0 && (
                <button onClick={onClearAll} className="text-xs font-semibold text-red-500 px-2 py-1">
                  Clear All
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={toggleAll} className="text-xs font-semibold text-theme-primary">
                {selectedIds.length === transactions.length ? 'Deselect All' : 'Select All'}
              </button>
              <button onClick={cancelSelection} className="text-xs font-semibold text-theme-muted">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {isSearchVisible && !isSelectionMode && (
         <div className="relative mb-4">
            <i className="fa-solid fa-search text-theme-muted absolute left-4 top-1/2 -translate-y-1/2"></i>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full bg-theme-body border-2 border-transparent rounded-xl py-3 pl-10 pr-4 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all"
            />
         </div>
      )}

      <div className="space-y-3 pb-20">
        {transactions.length > 0 
          ? transactions.map(t => (
            <div 
              key={t.id} 
              onClick={() => isSelectionMode && toggleSelection(t.id)}
              className={`bg-theme-body p-3 rounded-2xl flex items-center gap-4 transition-all cursor-pointer ${
                isSelectionMode && selectedIds.includes(t.id) ? 'ring-2 ring-theme-primary bg-theme-primary/5' : ''
              }`}
            >
              {isSelectionMode && (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedIds.includes(t.id) ? 'bg-theme-primary border-theme-primary text-white' : 'border-black/10'
                }`}>
                  {selectedIds.includes(t.id) && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
              )}
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
                  <p className="text-xs text-theme-muted truncate">{t.note || formatFullDate(t.date)}</p>
                  {t.type !== 'payment' && (
                      <p className="text-[10px] text-theme-muted">{t.quantity} &times; ₹{t.price.toFixed(2)}</p>
                  )}
              </div>
              {!isSelectionMode && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
                  className="text-xs text-red-400 opacity-50 hover:opacity-100 font-semibold"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              )}
            </div>
          ))
          : renderEmptyState()
        }
      </div>

      {/* Bulk Action Bar */}
      {isSelectionMode && selectedIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-theme-surface border border-black/10 shadow-2xl rounded-2xl p-3 flex items-center justify-between z-20 animate-in slide-in-from-bottom duration-300">
          <div className="flex gap-2">
            <button 
              onClick={handleBulkDeleteAction}
              className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
              title="Bulk Delete"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsCategorizeMenuOpen(!isCategorizeMenuOpen)}
                className="w-12 h-12 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center hover:bg-theme-primary/20 transition-colors"
                title="Change Category"
              >
                <i className="fa-solid fa-folder-tree"></i>
              </button>
              
              {isCategorizeMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-theme-surface shadow-2xl rounded-xl p-2 border border-black/5 min-w-[120px] flex flex-col gap-1">
                  {(['tea', 'coffee', 'snacks'] as TransactionType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => handleBulkCategorizeAction(type)}
                      className="text-left px-3 py-2 rounded-lg text-sm font-semibold text-theme-main hover:bg-theme-body capitalize flex items-center gap-2"
                    >
                      <i className={`fa-solid ${iconMapping[type]} w-4`}></i>
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-theme-muted px-4">
            {selectedIds.length} Items
          </span>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
