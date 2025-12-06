import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, IconMapping, SyncStatus } from '../types';
import { exportToCsv, exportToPdf } from '../utils/export';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  iconMapping: IconMapping;
  onUpdateIcon: (type: TransactionType, icon: string) => void;
  apiKey: string | null;
  clientId: string | null;
  webhookUrl: string | null;
  onSaveCredentials: (apiKey: string, clientId: string, webhookUrl: string) => void;
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
  transactions: Transaction[];
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

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, iconMapping, onUpdateIcon,
  apiKey: initialApiKey, clientId: initialClientId, webhookUrl: initialWebhookUrl,
  onSaveCredentials, syncStatus, onSignIn, onSignOut, transactions
}) => {
  const [activeTab, setActiveTab] = useState('icons');
  const [activeCategory, setActiveCategory] = useState<TransactionType>('tea');

  // State for Google Sync tab
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [clientId, setClientId] = useState(initialClientId || '');
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl || '');
  const SPREADSHEET_ID = '12L__j0lwySdW4bleW4rIbnCvRdcARxfZ94v4NElAJsI';

  // State for Export tab
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    setApiKey(initialApiKey || '');
    setClientId(initialClientId || '');
    setWebhookUrl(initialWebhookUrl || '');
  }, [initialApiKey, initialClientId, initialWebhookUrl]);

  const handleSaveCredentials = () => {
    if(apiKey && clientId && webhookUrl) {
      onSaveCredentials(apiKey, clientId, webhookUrl);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    setExportMessage('Exporting...');
    try {
      let filteredTransactions = transactions;
      if (startDate && endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + 86400000; // include the whole end day
        filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date).getTime();
            return txDate >= start && txDate <= end;
        });
      }

      if (filteredTransactions.length === 0) {
        setExportMessage('No data for selected range.');
        setTimeout(() => setExportMessage(''), 3000);
        return;
      }
      
      if (format === 'csv') {
        exportToCsv(filteredTransactions);
      } else {
        exportToPdf(filteredTransactions);
      }
      setExportMessage(`Exported to ${format.toUpperCase()} successfully!`);

    } catch (error) {
       setExportMessage('Export failed.');
    } finally {
        setTimeout(() => setExportMessage(''), 3000);
    }
  };


  const modalClasses = `fixed inset-0 bg-theme-surface z-50 transition-transform duration-300 p-6 flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;

  return (
    <div className={modalClasses}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-theme-main">Settings</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-theme-body text-theme-main flex items-center justify-center transition-colors hover:bg-black/5"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="border-b border-black/10 mb-6">
        <nav className="flex gap-6 -mb-px">
          <button onClick={() => setActiveTab('icons')} className={`py-3 border-b-2 font-semibold ${activeTab === 'icons' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted'}`}>Customize</button>
          <button onClick={() => setActiveTab('sync')} className={`py-3 border-b-2 font-semibold ${activeTab === 'sync' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted'}`}>Google Sync</button>
          <button onClick={() => setActiveTab('export')} className={`py-3 border-b-2 font-semibold ${activeTab === 'export' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted'}`}>Export</button>
        </nav>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'icons' && (
          <div>
            {/* Category Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border-2 whitespace-nowrap ${
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
            <h3 className="text-xs font-bold uppercase text-theme-muted tracking-widest mb-4">Select Icon for {CATEGORIES.find(c => c.id === activeCategory)?.label}</h3>
            <div className="grid grid-cols-9 gap-1">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => onUpdateIcon(activeCategory, icon)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-all ${
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
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-theme-main">Google Sheets Sync</h3>
              <p className="text-sm text-theme-muted">Automatically sync your data using a secure Google Apps Script webhook.</p>
            </div>
            
            <div className="bg-theme-body p-4 rounded-xl space-y-4">
               <div>
                <label className="text-sm font-bold text-theme-muted block mb-2">Google Spreadsheet ID</label>
                <input type="text" value={SPREADSHEET_ID} className="w-full bg-theme-surface border-2 border-transparent rounded-lg p-2 text-sm text-theme-muted outline-none" readOnly />
              </div>
              <div>
                <label className="text-sm font-bold text-theme-muted block mb-2">Google Apps Script Webhook URL</label>
                <input type="password" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full bg-theme-surface border-2 border-transparent rounded-lg p-2 text-sm text-theme-main outline-none focus:border-theme-primary" placeholder="Paste your deployed script URL"/>
              </div>
               <div>
                <label className="text-sm font-bold text-theme-muted block mb-2">Google API Key (for reading)</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full bg-theme-surface border-2 border-transparent rounded-lg p-2 text-sm text-theme-main outline-none focus:border-theme-primary" />
              </div>
               <div>
                <label className="text-sm font-bold text-theme-muted block mb-2">Google Client ID (for reading)</label>
                <input type="password" value={clientId} onChange={e => setClientId(e.target.value)} className="w-full bg-theme-surface border-2 border-transparent rounded-lg p-2 text-sm text-theme-main outline-none focus:border-theme-primary" />
              </div>
              <button onClick={handleSaveCredentials} className="w-full bg-theme-primary-gradient text-white font-semibold py-2 rounded-lg transition-transform active:scale-95">Save Credentials</button>
            </div>

            <div className="text-center">
              {syncStatus !== 'connected' && initialApiKey && <button onClick={onSignIn} className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg">Sign in with Google</button>}
              {syncStatus === 'connecting' && <p className="text-amber-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i>Connecting...</p>}
              {syncStatus === 'connected' && <button onClick={onSignOut} className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg">Disconnect</button>}
              {syncStatus === 'error' && <p className="text-red-500">Connection Error. Check credentials and sign in again.</p>}
            </div>
             <p className="text-xs text-theme-muted text-center">Your credentials and URL are saved only in your browser's local storage.</p>
          </div>
        )}

        {activeTab === 'export' && (
           <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-theme-main">Export Data</h3>
              <p className="text-sm text-theme-muted">Download your transaction data as a CSV or PDF file.</p>
            </div>

            <div className="bg-theme-body p-4 rounded-xl space-y-4">
              <h4 className="text-sm font-bold text-theme-main">Filter by Date Range (Optional)</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="text-xs font-semibold text-theme-muted block mb-1">Start Date</label>
                  <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-theme-surface rounded-lg p-2 text-sm text-theme-main outline-none focus:ring-2 ring-theme-primary" />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="text-xs font-semibold text-theme-muted block mb-1">End Date</label>
                  <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-theme-surface rounded-lg p-2 text-sm text-theme-main outline-none focus:ring-2 ring-theme-primary" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => handleExport('csv')} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all active:scale-95 shadow-md">
                    <i className="fa-solid fa-file-csv"></i>
                    <span>Export to CSV</span>
                </button>
                <button onClick={() => handleExport('pdf')} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all active:scale-95 shadow-md">
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>Export to PDF</span>
                </button>
            </div>
            {exportMessage && <p className="text-center text-sm font-semibold text-theme-main mt-4">{exportMessage}</p>}
           </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;