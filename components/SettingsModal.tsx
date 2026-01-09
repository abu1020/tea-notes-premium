
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, TransactionType, IconMapping, SyncStatus, ThemeType, BackupData } from '../types';
import { exportToCsv, exportToPdf } from '../utils/export';
import { createBackupData, downloadBackupFile, parseBackupFile } from '../utils/backup';

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
  currentTheme: ThemeType;
  onRestore: (data: BackupData) => void;
}

// Expanded list of icons
const AVAILABLE_ICONS = [
  // Food & Drink
  'fa-mug-hot', 'fa-coffee', 'fa-glass-water', 'fa-wine-glass', 'fa-martini-glass',
  'fa-beer-mug-empty', 'fa-flask', 'fa-bottle-water', 'fa-cookie-bite',
  'fa-cookie', 'fa-burger', 'fa-pizza-slice', 'fa-ice-cream',
  'fa-bowl-food', 'fa-apple-whole', 'fa-carrot', 'fa-leaf', 'fa-utensils',
  'fa-bread-slice', 'fa-candy-cane', 'fa-lemon', 'fa-pepper-hot',
  
  // Office & Business
  'fa-briefcase', 'fa-building', 'fa-clipboard', 'fa-clipboard-check', 
  'fa-folder', 'fa-folder-open', 'fa-envelope', 'fa-envelope-open',
  'fa-paperclip', 'fa-stapler', 'fa-print', 'fa-fax',
  'fa-laptop', 'fa-desktop', 'fa-mobile-screen', 'fa-phone',
  'fa-calendar', 'fa-calendar-check', 'fa-calendar-days',
  'fa-chart-pie', 'fa-chart-line', 'fa-chart-bar',
  'fa-pen', 'fa-pen-nib', 'fa-marker', 'fa-highlighter',
  'fa-trash', 'fa-trash-can', 'fa-box-archive', 'fa-file',
  'fa-file-invoice', 'fa-file-lines', 'fa-id-card', 'fa-id-badge',
  'fa-user-tie', 'fa-users', 'fa-handshake', 'fa-globe',

  // Money & Shopping
  'fa-check', 'fa-wallet', 'fa-credit-card', 'fa-money-bill', 
  'fa-coins', 'fa-piggy-bank', 'fa-sack-dollar', 'fa-receipt',
  'fa-cart-shopping', 'fa-basket-shopping', 'fa-bag-shopping', 
  'fa-tag', 'fa-tags', 'fa-gift', 'fa-percent',

  // Transport & Travel
  'fa-car', 'fa-bus', 'fa-train', 'fa-plane', 'fa-bicycle',
  'fa-gas-pump', 'fa-road', 'fa-map-location-dot', 'fa-hotel',
  'fa-ticket', 'fa-suitcase',
  
  // UI & Misc
  'fa-star', 'fa-heart', 'fa-bell', 'fa-fire', 'fa-snowflake',
  'fa-bolt', 'fa-cloud', 'fa-droplet', 'fa-umbrella',
  'fa-house', 'fa-key', 'fa-lock', 'fa-gear', 'fa-wrench',
  'fa-circle-check', 'fa-circle-xmark', 'fa-circle-exclamation',
  'fa-thumbs-up', 'fa-thumbs-down', 'fa-lightbulb'
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
  onSaveCredentials, syncStatus, onSignIn, onSignOut, transactions, currentTheme, onRestore
}) => {
  const [activeTab, setActiveTab] = useState('icons');
  
  // Icon Picker State
  const [pickerCategory, setPickerCategory] = useState<TransactionType | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  // State for Google Sync tab
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [clientId, setClientId] = useState(initialClientId || '');
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl || '');
  const SPREADSHEET_ID = '12L__j0lwySdW4bleW4rIbnCvRdcARxfZ94v4NElAJsI';

  // State for Export tab
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportMessage, setExportMessage] = useState('');

  // State for Backup tab
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setApiKey(initialApiKey || '');
    setClientId(initialClientId || '');
    setWebhookUrl(initialWebhookUrl || '');
  }, [initialApiKey, initialClientId, initialWebhookUrl]);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!iconSearchQuery) return AVAILABLE_ICONS;
    const lowerQuery = iconSearchQuery.toLowerCase();
    return AVAILABLE_ICONS.filter(icon => 
        icon.replace('fa-', '').includes(lowerQuery)
    );
  }, [iconSearchQuery]);

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

  const handleBackupDownload = () => {
    try {
      const data = createBackupData(transactions, iconMapping, currentTheme);
      downloadBackupFile(data);
      setBackupMessage({ text: 'Backup file downloaded successfully!', type: 'success' });
    } catch (err) {
      setBackupMessage({ text: 'Failed to create backup.', type: 'error' });
    }
    setTimeout(() => setBackupMessage({ text: '', type: '' }), 3000);
  };

  const handleBackupUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBackupMessage({ text: 'Restoring data...', type: 'info' });
      const data = await parseBackupFile(file);
      onRestore(data);
      setBackupMessage({ text: 'Data restored successfully!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setBackupMessage({ text: err.message || 'Invalid backup file.', type: 'error' });
    }
    
    // Clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setBackupMessage({ text: '', type: '' }), 3000);
  };

  const handleClose = () => {
    setPickerCategory(null);
    setIconSearchQuery('');
    onClose();
  };


  const modalClasses = `fixed inset-0 bg-theme-surface z-50 transition-transform duration-300 p-6 flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;

  return (
    <div className={modalClasses}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-theme-main tracking-tight">Settings</h2>
        <button 
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-theme-body text-theme-main flex items-center justify-center transition-colors hover:bg-black/5"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="border-b border-black/5 mb-6">
        <nav className="flex gap-4 sm:gap-8 -mb-px overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('icons')} className={`py-3 border-b-2 font-bold text-sm tracking-wide whitespace-nowrap ${activeTab === 'icons' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted'}`}>ICONS</button>
          <button onClick={() => setActiveTab('export')} className={`py-3 border-b-2 font-bold text-sm tracking-wide whitespace-nowrap ${activeTab === 'export' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted'}`}>EXPORT</button>
          <button onClick={() => setActiveTab('backup')} className={`py-3 border-b-2 font-bold text-sm tracking-wide whitespace-nowrap ${activeTab === 'backup' ? 'border-theme-primary text-theme-primary' : 'border-transparent text-theme-muted'}`}>BACKUP</button>
        </nav>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'icons' && (
          <div className="h-full flex flex-col">
            {!pickerCategory ? (
                /* Category List View */
                <div className="space-y-3">
                    <p className="text-sm text-theme-muted mb-2">Select a category to change its icon.</p>
                    {CATEGORIES.map((cat) => (
                        <button 
                            key={cat.id}
                            onClick={() => setPickerCategory(cat.id)}
                            className="w-full flex items-center justify-between p-4 bg-theme-body rounded-2xl border border-transparent hover:border-black/5 hover:bg-black/5 transition-all group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${cat.colorClass}`}>
                                    <i className={`fa-solid ${iconMapping[cat.id]}`}></i>
                                </div>
                                <span className="font-bold text-lg text-theme-main">{cat.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-theme-muted text-sm font-medium group-hover:text-theme-primary transition-colors">
                                <span>Change</span>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <i className="fa-solid fa-chevron-right text-xs"></i>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                /* Icon Picker View */
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <button 
                            onClick={() => { setPickerCategory(null); setIconSearchQuery(''); }}
                            className="w-9 h-9 rounded-full bg-theme-body flex items-center justify-center text-theme-main hover:bg-black/10 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-theme-muted tracking-wider">Selecting icon for</p>
                            <h3 className="font-bold text-xl text-theme-main">{CATEGORIES.find(c => c.id === pickerCategory)?.label}</h3>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted text-sm"></i>
                        <input 
                            type="text" 
                            placeholder="Search icons (e.g., 'car', 'user', 'food')..." 
                            value={iconSearchQuery}
                            onChange={(e) => setIconSearchQuery(e.target.value)}
                            className="w-full bg-theme-body rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none border border-transparent focus:border-theme-primary/30 focus:bg-white transition-all"
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pb-4">
                            {filteredIcons.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => {
                                        if (pickerCategory) {
                                            onUpdateIcon(pickerCategory, icon);
                                            setPickerCategory(null);
                                            setIconSearchQuery('');
                                        }
                                    }}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm transition-all duration-200 ${
                                        iconMapping[pickerCategory] === icon
                                        ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/30 scale-105 ring-2 ring-offset-2 ring-theme-primary'
                                        : 'bg-theme-body text-theme-muted hover:bg-black/10 hover:text-theme-main hover:scale-105'
                                    }`}
                                    title={icon.replace('fa-', '')}
                                >
                                    <i className={`fa-solid ${icon}`}></i>
                                </button>
                            ))}
                        </div>
                        {filteredIcons.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <i className="fa-solid fa-icons text-3xl mb-2"></i>
                                <p className="text-sm">No icons found matching "{iconSearchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
           <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-theme-main">Export Reports</h3>
              <p className="text-sm text-theme-muted mt-1">Generate PDF or CSV reports for record-keeping.</p>
            </div>

            <div className="bg-theme-body p-6 rounded-[1.5rem] space-y-4 border border-black/5">
              <h4 className="text-sm font-bold text-theme-main mb-2">Filter by Date Range (Optional)</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="text-xs font-bold text-theme-muted uppercase tracking-wider block mb-1">Start Date</label>
                  <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-modern w-full rounded-xl p-3 text-sm text-theme-main outline-none" />
                </div>
                <div className="flex-1">
                  <label htmlFor="endDate" className="text-xs font-bold text-theme-muted uppercase tracking-wider block mb-1">End Date</label>
                  <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-modern w-full rounded-xl p-3 text-sm text-theme-main outline-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => handleExport('csv')} className="flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5">
                    <i className="fa-solid fa-file-csv text-xl"></i>
                    <span>Export to CSV</span>
                </button>
                <button onClick={() => handleExport('pdf')} className="flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-500/20 hover:-translate-y-0.5">
                    <i className="fa-solid fa-file-pdf text-xl"></i>
                    <span>Export to PDF</span>
                </button>
            </div>
            {exportMessage && <p className="text-center text-sm font-bold text-theme-primary mt-4 animate-pulse">{exportMessage}</p>}
           </div>
        )}

        {activeTab === 'backup' && (
           <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-theme-main">Backup & Restore</h3>
              <p className="text-sm text-theme-muted mt-1">Save your data to a file or restore from a previous backup.</p>
            </div>

            {/* Backup Section */}
            <div className="bg-theme-body p-6 rounded-[1.5rem] border border-black/5 hover:border-theme-primary/20 transition-colors">
               <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-xl bg-theme-surface flex items-center justify-center text-theme-primary shadow-sm">
                       <i className="fa-solid fa-download text-xl"></i>
                   </div>
                   <div>
                       <h4 className="font-bold text-theme-main">Backup Data</h4>
                       <p className="text-xs text-theme-muted">Download your data as a JSON file to save to Google Drive.</p>
                   </div>
               </div>
               <button 
                onClick={handleBackupDownload}
                className="w-full bg-theme-primary-gradient text-white font-bold py-3 rounded-xl shadow-lg shadow-theme-primary/20 transition-all hover:-translate-y-0.5 active:scale-95"
               >
                   Download Backup File
               </button>
            </div>

            {/* Restore Section */}
            <div className="bg-theme-body p-6 rounded-[1.5rem] border border-black/5 hover:border-theme-primary/20 transition-colors">
               <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-xl bg-theme-surface flex items-center justify-center text-amber-500 shadow-sm">
                       <i className="fa-solid fa-upload text-xl"></i>
                   </div>
                   <div>
                       <h4 className="font-bold text-theme-main">Restore Data</h4>
                       <p className="text-xs text-theme-muted">Import a .json backup file to restore your transactions.</p>
                   </div>
               </div>
               
               <input 
                 type="file" 
                 accept=".json" 
                 ref={fileInputRef} 
                 onChange={handleBackupUpload}
                 className="hidden" 
               />
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white border-2 border-dashed border-theme-muted/30 text-theme-muted font-bold py-3 rounded-xl transition-all hover:border-theme-primary hover:text-theme-primary active:scale-95 active:bg-theme-body"
               >
                   Select Backup File
               </button>
            </div>
            
             {/* Feedback Message */}
             {backupMessage.text && (
                 <div className={`p-4 rounded-xl text-center font-bold text-sm animate-fade-in ${backupMessage.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                     {backupMessage.text}
                 </div>
             )}
           </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
