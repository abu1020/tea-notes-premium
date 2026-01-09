
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Transaction, ThemeType, ConfirmationModalState, IconMapping, SyncStatus, User, AuthPage, BackupData } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';

// Lazy load modals to optimize initial load
const AddTransactionModal = lazy(() => import('./components/AddTransactionModal'));
const AnalyticsModal = lazy(() => import('./components/AnalyticsModal'));
const ConfirmationModal = lazy(() => import('./components/ConfirmationModal'));
const CalculatorModal = lazy(() => import('./components/CalculatorModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const AboutModal = lazy(() => import('./components/AboutModal'));

const DEFAULT_ICON_MAPPING: IconMapping = {
  tea: 'fa-mug-hot',
  coffee: 'fa-coffee',
  snacks: 'fa-cookie-bite',
  payment: 'fa-wallet',
};

const App: React.FC = () => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('login');

  // --- App State ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setTheme] = useState<ThemeType>('matcha');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  
  const [iconMapping, setIconMapping] = useState<IconMapping>(DEFAULT_ICON_MAPPING);

  const [confirmationState, setConfirmationState] = useState<ConfirmationModalState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  // App Loading State
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // --- 1. Check for Session on Mount ---
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('officeBuApp_currentUser');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
    setIsAppLoading(false);
  }, []);

  // --- 2. Load User Data when User Changes ---
  useEffect(() => {
    if (!currentUser) return;

    // Helper to get namespaced key
    const getKey = (key: string) => `officeBuApp_${currentUser.id}_${key}`;

    const savedTheme = localStorage.getItem(getKey('theme')) as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    const savedIcons = localStorage.getItem(getKey('icons'));
    if (savedIcons) setIconMapping(JSON.parse(savedIcons));
    else setIconMapping(DEFAULT_ICON_MAPPING);
    
    const savedTransactions = localStorage.getItem(getKey('transactions'));
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions([]);
    }
  }, [currentUser]);


  // --- Auth Handlers ---
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('officeBuApp_currentUser', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('officeBuApp_currentUser');
    setCurrentAuthPage('login');
    setTransactions([]);
  }, []);

  // --- CRUD Operations ---
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    if (!currentUser) return;
    
    // Check if date is provided, otherwise default to now
    const txDate = tx.date || new Date().toISOString();

    const newTx: Transaction = { ...tx, id: Date.now(), date: txDate };
    
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem(`officeBuApp_${currentUser.id}_transactions`, JSON.stringify(updated));
      return updated;
    });
    
    closeAddModal();
  }, [currentUser]);

  const updateTransaction = useCallback((updatedTx: Transaction) => {
    if (!currentUser) return;

    setTransactions(prev => {
      const updated = prev.map(t => t.id === updatedTx.id ? updatedTx : t);
      localStorage.setItem(`officeBuApp_${currentUser.id}_transactions`, JSON.stringify(updated));
      return updated;
    });
    
    closeAddModal();
  }, [currentUser]);

  const deleteTransaction = useCallback((id: number) => {
    if (!currentUser) return;
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem(`officeBuApp_${currentUser.id}_transactions`, JSON.stringify(updated));
      return updated;
    });
  }, [currentUser]);
  
  const clearAllTransactions = useCallback(() => {
    if (!currentUser) return;
    setTransactions([]);
    localStorage.removeItem(`officeBuApp_${currentUser.id}_transactions`);
  }, [currentUser]);

  // --- Restore Data Handler ---
  const handleRestore = useCallback((data: BackupData) => {
    if (!currentUser) return;

    // Update State
    setTransactions(data.transactions);
    setIconMapping(data.iconMapping);
    if (data.theme) setTheme(data.theme);

    // Save to LocalStorage
    const getKey = (key: string) => `officeBuApp_${currentUser.id}_${key}`;
    localStorage.setItem(getKey('transactions'), JSON.stringify(data.transactions));
    localStorage.setItem(getKey('icons'), JSON.stringify(data.iconMapping));
    if (data.theme) localStorage.setItem(getKey('theme'), data.theme);
  }, [currentUser]);


  // --- Local Settings Persistence ---
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(`officeBuApp_${currentUser.id}_icons`, JSON.stringify(iconMapping));
  }, [iconMapping, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(`officeBuApp_${currentUser.id}_theme`, theme);
  }, [theme, currentUser]);
  
  // --- UI Handlers ---
  const handleUpdateIcon = useCallback((type: keyof IconMapping, icon: string) => {
    setIconMapping(prev => ({ ...prev, [type]: icon }));
  }, []);

  const openAddModal = useCallback(() => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirmDelete = useCallback((id: number) => {
    setConfirmationState({
      isOpen: true,
      message: 'Are you sure you want to delete this record?',
      onConfirm: () => {
        deleteTransaction(id);
        closeConfirmation();
      },
    });
  }, [deleteTransaction, closeConfirmation]);

  const confirmClearAll = useCallback(() => {
     setConfirmationState({
        isOpen: true,
        message: 'This will delete ALL transactions locally. This cannot be undone. Are you sure?',
        onConfirm: () => {
            clearAllTransactions();
            closeConfirmation();
        }
     })
  }, [clearAllTransactions, closeConfirmation]);

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


  // --- Render Views ---

  if (isAppLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400"><i className="fa-solid fa-spinner fa-spin text-3xl"></i></div>;
  }

  // Not Logged In
  if (!currentUser) {
    if (currentAuthPage === 'register') {
      return <RegistrationPage onRegister={handleLogin} onSwitchToLogin={() => setCurrentAuthPage('login')} />;
    }
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setCurrentAuthPage('register')} />;
  }

  // Main App
  return (
    <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 font-sans">
      
      <Header 
        onToggleChart={useCallback(() => setIsChartModalOpen(true), [])} 
        currentTheme={theme}
        onSetTheme={setTheme}
        onToggleCalculator={useCallback(() => setIsCalculatorModalOpen(true), [])}
        onToggleSettings={useCallback(() => setIsSettingsModalOpen(true), [])}
        onToggleAbout={useCallback(() => setIsAboutModalOpen(true), [])}
        syncStatus={'offline'}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <main className="animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8 gap-6">
          <aside className="md:col-span-1">
            <Dashboard transactions={transactions} />
          </aside>

          <section className="md:col-span-2 md:h-[calc(100vh-140px)]">
            <TransactionList 
              transactions={filteredTransactions}
              totalTransactions={transactions.length}
              onDelete={confirmDelete}
              onEdit={openEditModal}
              onClearAll={confirmClearAll}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              iconMapping={iconMapping}
            />
          </section>
        </div>
      </main>

      <button 
        onClick={openAddModal}
        className="fixed bottom-8 right-6 w-16 h-16 bg-theme-primary-gradient rounded-full flex items-center justify-center text-white text-2xl shadow-2xl shadow-theme-primary/40 z-40 transition-all duration-300 active:scale-90 hover:scale-110 hover:-translate-y-2 hover:shadow-theme-primary/50 group"
        aria-label="Add new bill"
      >
        <i className="fa-solid fa-receipt group-hover:rotate-12 transition-transform duration-300"></i>
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
      </button>

      {/* Modals with Suspense for lazy loading */}
      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-theme-primary"></i></div>}>
        {isAddModalOpen && (
          <AddTransactionModal 
            isOpen={isAddModalOpen} 
            onClose={closeAddModal} 
            onAdd={addTransaction} 
            onUpdate={updateTransaction}
            editTransaction={editingTransaction}
            iconMapping={iconMapping} 
          />
        )}
        {isChartModalOpen && <AnalyticsModal isOpen={isChartModalOpen} onClose={() => setIsChartModalOpen(false)} transactions={transactions} />}
        {confirmationState.isOpen && <ConfirmationModal isOpen={confirmationState.isOpen} message={confirmationState.message} onConfirm={confirmationState.onConfirm} onCancel={closeConfirmation} />}
        {isCalculatorModalOpen && <CalculatorModal isOpen={isCalculatorModalOpen} onClose={() => setIsCalculatorModalOpen(false)} />}
        {isAboutModalOpen && <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />}
        {isSettingsModalOpen && (
          <SettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setIsSettingsModalOpen(false)} 
            iconMapping={iconMapping} 
            onUpdateIcon={handleUpdateIcon}
            apiKey={null}
            clientId={null}
            webhookUrl={null}
            onSaveCredentials={() => {}}
            syncStatus={'offline'}
            onSignIn={() => {}}
            onSignOut={() => {}}
            transactions={transactions}
            currentTheme={theme}
            onRestore={handleRestore}
          />
        )}
      </Suspense>
    </div>
  );
};

export default App;
