import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, ThemeType, ConfirmationModalState, IconMapping } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import AnalyticsModal from './components/AnalyticsModal';
import ConfirmationModal from './components/ConfirmationModal';
import CalculatorModal from './components/CalculatorModal';
import SettingsModal from './components/SettingsModal';
import LoginPage from './components/LoginPage';
import GoogleSheetSetup from './components/GoogleSheetSetup';
import { getTransactions, appendTransaction, deleteTransactionRow } from './utils/googleSheetsApi';

// --- Google API Configuration ---
// IMPORTANT: You must create a project in the Google Cloud Console, enable the Google Sheets API,
// and create an OAuth 2.0 Client ID and an API Key.
// Replace the placeholder values below with your actual credentials.
const API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your API Key
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your OAuth 2.0 Client ID
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
  }
}

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

  // --- New state for Google Integration ---
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // --- Initialization ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('officeBuAppTheme') as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    const savedIcons = localStorage.getItem('officeBuAppIcons');
    if (savedIcons) setIconMapping(JSON.parse(savedIcons));

    const savedSheetId = localStorage.getItem('officeBuAppSheetId');
    if (savedSheetId) setSpreadsheetId(savedSheetId);

    // Load Google scripts
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => window.gapi.load('client', initializeGapiClient);
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = initializeGisClient;
    document.body.appendChild(gisScript);
  }, []);

  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    setGapiReady(true);
  };

  const initializeGisClient = () => {
    window.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          setError(tokenResponse.error);
          return;
        }
        setIsSignedIn(true);
      },
    });
    setGisReady(true);
  };
  
  useEffect(() => {
    if (gapiReady && gisReady) {
        setIsLoading(false);
    }
  }, [gapiReady, gisReady]);

  // --- Data Fetching ---
  const loadTransactions = useCallback(async () => {
    if (!spreadsheetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const loadedTransactions = await getTransactions(spreadsheetId);
      setTransactions(loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      console.error("Error loading transactions:", err);
      setError(`Failed to load data. Check sheet ID and permissions. Error: ${err.message || 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  }, [spreadsheetId]);

  useEffect(() => {
    if (isSignedIn && spreadsheetId) {
      loadTransactions();
    }
  }, [isSignedIn, spreadsheetId, loadTransactions]);


  // --- Auth Handlers ---
  const handleAuthClick = () => {
    if (window.gapi.client.getToken() === null) {
      window.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      window.tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  const handleSignoutClick = () => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {});
      window.gapi.client.setToken(null);
      setIsSignedIn(false);
      setTransactions([]);
    }
  };

  const handleSaveSpreadsheetId = (id: string) => {
    localStorage.setItem('officeBuAppSheetId', id);
    setSpreadsheetId(id);
  };

  // --- CRUD Operations ---
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'date'>) => {
    if (!spreadsheetId) return;
    const newTx: Transaction = {
      ...tx,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    
    setIsLoading(true);
    try {
        await appendTransaction(spreadsheetId, newTx);
        setTransactions(prev => [newTx, ...prev]);
        setIsAddModalOpen(false);
    } catch (err: any) {
        console.error("Error adding transaction:", err);
        setError(`Failed to save transaction. Error: ${err.message || 'Unknown'}`);
    } finally {
        setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: number) => {
     if (!spreadsheetId) return;
     setIsLoading(true);
     try {
        await deleteTransactionRow(spreadsheetId, id);
        setTransactions(prev => prev.filter(t => t.id !== id));
     } catch(err: any) {
        console.error("Error deleting transaction:", err);
        setError(`Failed to delete transaction. Error: ${err.message || 'Unknown'}`);
     } finally {
        setIsLoading(false);
     }
  };


  // --- Local Settings Persistence ---
  useEffect(() => {
    localStorage.setItem('officeBuAppIcons', JSON.stringify(iconMapping));
  }, [iconMapping]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('officeBuAppTheme', theme);
  }, [theme]);
  
  
  // --- UI Handlers ---
  const handleUpdateIcon = (type: keyof IconMapping, icon: string) => {
    setIconMapping(prev => ({ ...prev, [type]: icon }));
  };

  const confirmDelete = (id: number) => {
    setConfirmationState({
      isOpen: true,
      message: 'Are you sure you want to delete this record from your Google Sheet?',
      onConfirm: () => {
        deleteTransaction(id);
        closeConfirmation();
      },
    });
  };

  const confirmClearAll = () => {
     setError("Clearing all transactions directly from the app is disabled when connected to Google Sheets. Please manage bulk deletions directly in your Google Sheet for safety.");
     setTimeout(() => setError(null), 5000);
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


  // --- Render Logic ---
  if (isLoading && (!gapiReady || !gisReady)) {
    return <div className="min-h-screen flex items-center justify-center bg-theme-body text-theme-main"><i className="fa-solid fa-spinner fa-spin text-3xl"></i></div>;
  }

  if (!isSignedIn) {
    return <LoginPage 
        handleAuthClick={handleAuthClick} 
        onSetTheme={setTheme} 
        currentTheme={theme}
      />;
  }

  if (!spreadsheetId) {
      return <GoogleSheetSetup onSave={handleSaveSpreadsheetId} onLogout={handleSignoutClick} />
  }

  return (
    <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-[100]">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white/80 hover:text-white">&times;</button>
        </div>
      )}
      {isLoading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] flex items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Syncing with Google Sheets...</span>
        </div>
      )}

      <Header 
        onToggleChart={() => setIsChartModalOpen(true)} 
        currentTheme={theme}
        onSetTheme={setTheme}
        onToggleCalculator={() => setIsCalculatorModalOpen(true)}
        onToggleSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleSignoutClick}
      />

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8">
          <aside className="md:col-span-1">
            <Dashboard transactions={transactions} />
          </aside>

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
