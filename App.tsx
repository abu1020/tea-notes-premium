
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, ThemeType, ConfirmationModalState, IconMapping, SyncStatus, TransactionType } from './types';
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

declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const SPREADSHEET_ID = '12L__j0lwySdW4bleW4rIbnCvRdcARxfZ94v4NElAJsI';

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

  // --- Initialization ---
  useEffect(() => {
    setIsLoading(true);
    const savedTheme = localStorage.getItem('officeBuAppTheme') as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    const savedIcons = localStorage.getItem('officeBuAppIcons');
    if (savedIcons) setIconMapping(JSON.parse(savedIcons));
    
    const savedTransactions = localStorage.getItem('officeBuAppTransactions');
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

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

  const initializeGapiClient = useCallback(async (key: string) => {
    try {
      await window.gapi.client.init({
        apiKey: key,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      });
      setGapiReady(true);
    } catch (err) {
      setError("Invalid Google API Key.");
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
      setError("Invalid Google Client ID.");
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

  const fetchDataFromSheet = useCallback(async () => {
    if (!isSignedIn) return;
    setSyncStatus('syncing');
    try {
      const sheetTransactions = await getTransactions(SPREADSHEET_ID);
      setTransactions(sheetTransactions);
      localStorage.setItem('officeBuAppTransactions', JSON.stringify(sheetTransactions));
      setSyncStatus('connected');
      showSuccessToast('Data fetched from Google Sheet.');
    } catch (err: any) {
      setError(`Fetch failed: ${err.message}`);
      setSyncStatus('error');
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) fetchDataFromSheet();
    else setSyncStatus('offline');
  }, [isSignedIn, fetchDataFromSheet]);

  const handleSaveCredentials = (key: string, id: string, url: string) => {
    localStorage.setItem('officeBuAppApiKey', key);
    localStorage.setItem('officeBuAppClientId', id);
    localStorage.setItem('officeBuAppWebhookUrl', url);
    setApiKey(key); setClientId(id); setWebhookUrl(url);
    setGapiReady(false); setGisReady(false);
  };
  
  const handleAuthClick = () => {
    if (window.tokenClient) window.tokenClient.requestAccessToken({ prompt: 'consent' });
    else setError("Google services not ready.");
  };

  const handleSignoutClick = () => {
    const token = window.gapi?.client.getToken();
    if (token !== null) {
      window.google?.accounts.oauth2.revoke(token.access_token, () => {});
      window.gapi.client.setToken(null);
    }
    setIsSignedIn(false); setSyncStatus('offline');
  };

  // --- CRUD & Bulk Actions ---
  const addTransactions = (newItems: Omit<Transaction, 'id' | 'date'>[]) => {
    const timestamp = Date.now();
    const newTxs: Transaction[] = newItems.map((item, index) => ({
      ...item,
      id: timestamp + index,
      date: new Date().toISOString()
    }));
    
    const updated = [...newTxs, ...transactions];
    setTransactions(updated);
    localStorage.setItem('officeBuAppTransactions', JSON.stringify(updated));
    setIsAddModalOpen(false);
    
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'bulk_add', newTxs)
        .then(() => setSyncStatus('connected'))
        .catch(err => { setError(`Sync failed: ${err.message}`); setSyncStatus('error'); });
    }
  };

  const deleteTransaction = (id: number) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (!txToDelete) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('officeBuAppTransactions', JSON.stringify(updated));
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'delete', txToDelete)
        .then(() => setSyncStatus('connected'))
        .catch(err => { setError(`Sync failed: ${err.message}`); setSyncStatus('error'); });
    }
  };

  const handleBulkDelete = (ids: number[]) => {
    const updated = transactions.filter(t => !ids.includes(t.id));
    setTransactions(updated);
    localStorage.setItem('officeBuAppTransactions', JSON.stringify(updated));
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'bulk_delete', ids)
        .then(() => { setSyncStatus('connected'); showSuccessToast('Bulk deletion synced!'); })
        .catch(err => { setError(`Bulk delete failed: ${err.message}`); setSyncStatus('error'); });
    }
  };

  const handleBulkCategorize = (ids: number[], newType: TransactionType) => {
    const updated = transactions.map(t => ids.includes(t.id) ? { ...t, type: newType } : t);
    setTransactions(updated);
    localStorage.setItem('officeBuAppTransactions', JSON.stringify(updated));
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'bulk_update', { ids, updates: { type: newType } })
        .then(() => { setSyncStatus('connected'); showSuccessToast('Bulk update synced!'); })
        .catch(err => { setError(`Bulk update failed: ${err.message}`); setSyncStatus('error'); });
    }
  };

  const clearAllTransactions = () => {
    setTransactions([]);
    localStorage.removeItem('officeBuAppTransactions');
    if (isSignedIn && webhookUrl) {
      setSyncStatus('syncing');
      syncChangeToWebhook(webhookUrl, 'clear')
        .then(() => setSyncStatus('connected'))
        .catch(err => { setError(`Sync failed: ${err.message}`); setSyncStatus('error'); });
    }
  };

  useEffect(() => {
    localStorage.setItem('officeBuAppIcons', JSON.stringify(iconMapping));
  }, [iconMapping]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('officeBuAppTheme', theme);
  }, [theme]);
  
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
      message: 'Delete this record?',
      onConfirm: () => { deleteTransaction(id); closeConfirmation(); },
    });
  };

  const confirmClearAll = () => {
     setConfirmationState({
        isOpen: true,
        message: 'Delete ALL transactions locally and in Google Sheets?',
        onConfirm: () => { clearAllTransactions(); closeConfirmation(); }
     })
  };

  const closeConfirmation = () => { setConfirmationState(prev => ({ ...prev, isOpen: false })); };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return tx.note.toLowerCase().includes(query) || tx.amount.toString().includes(query) || tx.user.toLowerCase().includes(query);
    });
  }, [transactions, searchQuery]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-theme-body text-theme-main"><i className="fa-solid fa-spinner fa-spin text-3xl"></i></div>;

  return (
    <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-[100] max-w-sm">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => setError(null)} className="absolute top-1 right-2">&times;</button>
        </div>
      )}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[100] max-w-sm">
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
              onBulkDelete={handleBulkDelete}
              onBulkCategorize={handleBulkCategorize}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              iconMapping={iconMapping}
            />
          </section>
        </div>
      </main>

      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 w-16 h-16 bg-theme-primary-gradient rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-40 transition-transform active:scale-90 hover:scale-105"
      >
        <i className="fa-solid fa-plus"></i>
      </button>

      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addTransactions} iconMapping={iconMapping} />
      <AnalyticsModal isOpen={isChartModalOpen} onClose={() => setIsChartModalOpen(false)} transactions={transactions} />
      <ConfirmationModal isOpen={confirmationState.isOpen} message={confirmationState.message} onConfirm={confirmationState.onConfirm} onCancel={closeConfirmation} />
      <CalculatorModal isOpen={isCalculatorModalOpen} onClose={() => setIsCalculatorModalOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} 
        iconMapping={iconMapping} onUpdateIcon={handleUpdateIcon}
        apiKey={apiKey} clientId={clientId} webhookUrl={webhookUrl}
        onSaveCredentials={handleSaveCredentials} syncStatus={syncStatus}
        onSignIn={handleAuthClick} onSignOut={handleSignoutClick}
      />
    </div>
  );
};

export default App;
