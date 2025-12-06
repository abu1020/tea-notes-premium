import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, ThemeType, ConfirmationModalState, IconMapping, SyncStatus } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import AnalyticsModal from './components/AnalyticsModal';
import ConfirmationModal from './components/ConfirmationModal';
import CalculatorModal from './components/CalculatorModal';
import SettingsModal from './components/SettingsModal';
import { getTransactions } from './utils/googleSheetsApi';
import { syncChangeToWebhook } from './utils/webhook';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

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

const SPREADSHEET_ID = '12L__j0lwySdW4bleW4rIbnCvRdcARxfZ94v4NElAJsI';

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

  // --- State for Google Integration ---
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  // --- Initialization: Load all settings and local data ---
  useEffect(() => {
    setIsLoading(true);
    const savedTheme = localStorage.getItem('officeBuAppTheme') as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    const savedIcons = localStorage.getItem('officeBuAppIcons');
    if (savedIcons) setIconMapping(JSON.parse(savedIcons));
    
    const savedTransactions = localStorage.getItem('officeBuAppTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    const savedApiKey = localStorage.getItem('officeBuAppApiKey');
    const savedClientId = localStorage.getItem('officeBuAppClientId');
    const savedWebhookUrl = localStorage.getItem('officeBuAppWebhookUrl');
    if (savedApiKey && savedClientId) {
      setApiKey(savedApiKey);
      setClientId(savedClientId);
    }
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
    
    setIsLoading(false);
  }, []);

  // --- Google API Initialization (for reading data) ---
  const initializeGapiClient = useCallback(async (key: string) => {
    try {
      await window.gapi.client.init({
        apiKey: key,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      });
      setGapiReady(true);
    } catch (err) {
      setError("Invalid Google API Key. Please check it in Settings.");
      setSyncStatus('error');
    }
  }, []);
  
  const initializeGisClient = useCallback((id: string) => {
    try {
      window.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: id,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error) {
            if (tokenResponse.error !== 'popup_closed_by_user') {
                 setError(`Auth failed: ${tokenResponse.error}`);
                 setSyncStatus('error');
            }
            return;
          }
          setIsSignedIn(true);
        },
      });
      setGisReady(true);
    } catch (err) {
      setError("Invalid Google Client ID. Please check it in Settings.");
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    if (apiKey && clientId && !gapiReady && !gisReady) {
      setSyncStatus('connecting');
      const gapiScriptId = 'gapi-script';
      if (!document.getElementById(gapiScriptId)) {
        const gapiScript = document.createElement('script');
        gapiScript.id = gapiScriptId;
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => window.gapi.load('client', () => initializeGapiClient(apiKey));
        document.body.appendChild(gapiScript);
      }

      const gisScriptId = 'gis-script';
      if (!document.getElementById(gisScriptId)) {
        const gisScript = document.createElement('script');
        gisScript.id = gisScriptId;
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        gisScript.onload = () => initializeGisClient(clientId);
        document.body.appendChild(gisScript);
      }
    }
  }, [apiKey, clientId, gapiReady, gisReady, initializeGapiClient, initializeGisClient]);

  // --- Data Fetching Logic (Source of Truth) ---
  const fetchDataFromSheet = useCallback(async () => {
    if (!isSignedIn) return;

    setSyncStatus('syncing');
    setError(null);
    try {
      const sheetTransactions = await getTransactions(SPREADSHEET_ID);
      setTransactions(sheetTransactions);
      localStorage.setItem('officeBuAppTransactions', JSON.stringify(sheetTransactions));
      setSyncStatus('connected');
      showSuccessToast('Data successfully fetched from Google Sheet.');
    } catch (err: any) {
      setError(`Failed to fetch from sheet: ${err.message}`);
      setSyncStatus('error');
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      fetchDataFromSheet();
    } else {
      setSyncStatus('offline');
    }
  }, [isSignedIn, fetchDataFromSheet]);

  // --- Auth & Setup Handlers ---
  const handleSaveCredentials = (key: string, id: string, url: string) => {
    localStorage.setItem('officeBuAppApiKey', key);
    localStorage.setItem('officeBuAppClientId', id);
    localStorage.setItem('officeBuAppWebhookUrl', url);
    setApiKey(key);
    setClientId(id);
    setWebhookUrl(url);
    setGapiReady(false); 
    setGisReady(false);
  };
  
  const handleAuthClick = () => {
    if (gapiReady && gisReady && window.tokenClient) {
      window.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      setError("Google services are not ready. Check your API credentials in Settings.");
    }
  };

  const handleSignoutClick = () => {
    const token = window.gapi?.client.getToken();
    if (token !== null) {
      window.google?.accounts.oauth2.revoke(token.access_token, () => {});
      window.gapi.client.setToken(null);
    }
    setIsSignedIn(false);
    setSyncStatus('offline');
  };

  // --- CRUD Operations (Local-First with Webhook Sync) ---
  const addTransaction = (tx: Omit<Transaction, 'id' | 'date'>) => {
    const newTx: Transaction = { ...tx, id: Date.now(), date: new Date().toISOString() };
    
    // 1. Update state and localStorage immediately
    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('officeBuAppTransactions', JSON.stringify(updatedTransactions));
    setIsAddModalOpen(false);

    // 2. Sync to Google Sheets via webhook
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'add', newTx)
        .then(() => {
          setSyncStatus('connected');
          showSuccessToast('Transaction saved and synced!');
        })
        .catch(err => {
          setError(`Saved locally, but failed to sync: ${err.message}`);
          setSyncStatus('error');
        });
    }
  };

  const deleteTransaction = (id: number) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;
    
    // 1. Update state and localStorage immediately
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem('officeBuAppTransactions', JSON.stringify(updatedTransactions));
     
    // 2. Sync deletion to Google Sheets via webhook
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'delete', txToDelete)
        .then(() => {
          setSyncStatus('connected');
          showSuccessToast('Transaction deleted and synced!');
        })
        .catch(err => {
          setError(`Deleted locally, but failed to sync deletion: ${err.message}`);
          setSyncStatus('error');
        });
    }
  };
  
  const clearAllTransactions = () => {
    // 1. Clear local state
    setTransactions([]);
    localStorage.removeItem('officeBuAppTransactions');

    // 2. Sync clear action to webhook
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'clear')
        .then(() => {
          setSyncStatus('connected');
          showSuccessToast('All transactions cleared and synced!');
        })
        .catch(err => {
          setError(`Cleared locally, but failed to clear sheet: ${err.message}`);
          setSyncStatus('error');
        });
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

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const confirmDelete = (id: number) => {
    setConfirmationState({
      isOpen: true,
      message: 'Are you sure you want to delete this record?',
      onConfirm: () => {
        deleteTransaction(id);
        closeConfirmation();
      },
    });
  };

  const confirmClearAll = () => {
     setConfirmationState({
        isOpen: true,
        message: 'This will delete ALL transactions locally and in Google Sheets. This cannot be undone. Are you sure?',
        onConfirm: () => {
            clearAllTransactions();
            closeConfirmation();
        }
     })
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
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-theme-body text-theme-main"><i className="fa-solid fa-spinner fa-spin text-3xl"></i></div>;
  }

  return (
    <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-[100] max-w-sm animate-pulse">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2 text-white/80 hover:text-white">&times;</button>
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[100] max-w-sm animate-pulse">
          <p className="font-bold">Success</p>
          <p className="text-sm">{successMessage}</p>
        </div>
      )}
      
      <Header 
        onToggleChart={() => setIsChartModalOpen(true)} 
        currentTheme={theme}
        onSetTheme={setTheme}
        onToggleCalculator={() => setIsCalculatorModalOpen(true)}
        onToggleSettings={() => setIsSettingsModalOpen(true)}
        syncStatus={syncStatus}
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
      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addTransaction} iconMapping={iconMapping} />
      <AnalyticsModal isOpen={isChartModalOpen} onClose={() => setIsChartModalOpen(false)} transactions={transactions} />
      <ConfirmationModal isOpen={confirmationState.isOpen} message={confirmationState.message} onConfirm={confirmationState.onConfirm} onCancel={closeConfirmation} />
      <CalculatorModal isOpen={isCalculatorModalOpen} onClose={() => setIsCalculatorModalOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        iconMapping={iconMapping} 
        onUpdateIcon={handleUpdateIcon}
        apiKey={apiKey}
        clientId={clientId}
        webhookUrl={webhookUrl}
        onSaveCredentials={handleSaveCredentials}
        syncStatus={syncStatus}
        onSignIn={handleAuthClick}
        onSignOut={handleSignoutClick}
        transactions={transactions}
      />
    </div>
  );
};

export default App;