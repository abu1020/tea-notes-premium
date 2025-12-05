import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ThemeType, ConfirmationModalState, IconMapping } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import AnalyticsModal from './components/AnalyticsModal';
import ConfirmationModal from './components/ConfirmationModal';
import CalculatorModal from './components/CalculatorModal';
import SettingsModal from './components/SettingsModal';

const DEFAULT_ICON_MAPPING: IconMapping = {
  tea: 'fa-mug-hot',
  coffee: 'fa-coffee',
  snacks: 'fa-cookie-bite',
  payment: 'fa-wallet',
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setTheme] = useState<ThemeType>('matcha');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [iconMapping, setIconMapping] = useState<IconMapping>(DEFAULT_ICON_MAPPING);

  const [confirmationState, setConfirmationState] = useState<ConfirmationModalState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  // Load data and theme on mount
  useEffect(() => {
    const savedData = localStorage.getItem('teaNotesDataV3');
    if (savedData) {
      try {
        setTransactions(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }

    const savedTheme = localStorage.getItem('teaTheme') as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedIcons = localStorage.getItem('teaNotesIcons');
    if (savedIcons) {
      try {
        setIconMapping(JSON.parse(savedIcons));
      } catch (e) {
        console.error("Failed to parse icon mapping", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('teaNotesDataV3', JSON.stringify(transactions));
  }, [transactions]);
  
  // Save icons on change
  useEffect(() => {
    localStorage.setItem('teaNotesIcons', JSON.stringify(iconMapping));
  }, [iconMapping]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('teaTheme', theme);
  }, [theme]);
  
  const handleUpdateIcon = (type: keyof IconMapping, icon: string) => {
    setIconMapping(prev => ({ ...prev, [type]: icon }));
  };

  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
    setIsAddModalOpen(false);
  };

  const confirmDelete = (id: number) => {
    setConfirmationState({
      isOpen: true,
      message: 'Are you sure you want to delete this record?',
      onConfirm: () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
        closeConfirmation();
      },
    });
  };

  const confirmClearAll = () => {
    setConfirmationState({
      isOpen: true,
      message: 'This will delete ALL transaction data. Are you sure?',
      onConfirm: () => {
        setTransactions([]);
        setSearchQuery(''); // Clear search on clear all
        closeConfirmation();
      },
    });
  };

  const closeConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const noteMatch = tx.note.toLowerCase().includes(query);
      const amountMatch = tx.amount.toString().includes(query);
      const userMatch = tx.user.toLowerCase().includes(query);

      return noteMatch || amountMatch || userMatch;
    });
  }, [transactions, searchQuery]);

  return (
    <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <Header 
        onToggleChart={() => setIsChartModalOpen(true)} 
        currentTheme={theme}
        onSetTheme={setTheme}
        onToggleCalculator={() => setIsCalculatorModalOpen(true)}
        onToggleSettings={() => setIsSettingsModalOpen(true)}
      />

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8">
          {/* Left Column */}
          <aside className="md:col-span-1">
            <Dashboard transactions={transactions} />
          </aside>

          {/* Right Column */}
          <section className="md:col-span-2 mt-8 md:mt-0">
            <TransactionList 
              transactions={filteredTransactions}
              totalTransactions={transactions.length}
              onDelete={confirmDelete} 
              onClearAll={confirmClearAll}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              iconMapping={iconMapping}
            />
          </section>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 w-16 h-16 bg-theme-primary-gradient rounded-full flex items-center justify-center text-white text-2xl shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] z-40 transition-transform active:scale-90 hover:scale-105"
        aria-label="Add new transaction"
      >
        <i className="fa-solid fa-plus"></i>
      </button>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addTransaction} 
        iconMapping={iconMapping}
      />

      <AnalyticsModal 
        isOpen={isChartModalOpen} 
        onClose={() => setIsChartModalOpen(false)} 
        transactions={transactions} 
      />

      <ConfirmationModal 
        isOpen={confirmationState.isOpen}
        message={confirmationState.message}
        onConfirm={confirmationState.onConfirm}
        onCancel={closeConfirmation}
      />

      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        iconMapping={iconMapping}
        onUpdateIcon={handleUpdateIcon}
      />
    </div>
  );
};

export default App;