import React, { useState } from 'react';

interface GoogleSheetSetupProps {
  onSave: (id: string) => void;
  onLogout: () => void;
}

const GoogleSheetSetup: React.FC<GoogleSheetSetupProps> = ({ onSave, onLogout }) => {
  const [sheetId, setSheetId] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!sheetId.trim() || sheetId.trim().length < 20) { // Basic validation for ID length
      setError('Please enter a valid Google Spreadsheet ID.');
      return;
    }
    setError('');
    onSave(sheetId.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-body p-4 text-theme-main">
      <div className="w-full max-w-lg mx-auto bg-theme-surface rounded-2xl shadow-2xl p-8">
        <div className="text-center">
            <i className="fa-solid fa-sheet-plastic text-4xl text-green-500 mb-4"></i>
            <h1 className="text-2xl font-bold">Connect to Google Sheets</h1>
            <p className="text-theme-muted mt-2">
                This app uses a Google Sheet as its database. Please set it up to continue.
            </p>
        </div>

        <div className="text-sm bg-theme-body p-4 rounded-lg my-6 space-y-2">
            <h2 className="font-bold">Setup Instructions:</h2>
            <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">sheets.new</a> to create a new spreadsheet.</li>
                <li>Name the first tab (at the bottom) exactly: <code className="bg-black/10 px-1 rounded">Transactions</code></li>
                <li>In the first row, set these exact headers in columns A through H:
                    <div className="text-xs font-mono bg-black/10 p-2 rounded mt-1">
                        id | type | amount | note | date | user | quantity | price
                    </div>
                </li>
                <li>Copy the Spreadsheet ID from your sheet's URL. It's the long string of characters between <code className="bg-black/10 px-1 rounded">/d/</code> and <code className="bg-black/10 px-1 rounded">/edit</code>.</li>
                <li>Paste the ID below and click Save.</li>
            </ol>
        </div>

        <div>
            <label htmlFor="sheetIdInput" className="text-sm font-bold text-theme-muted block mb-2">Spreadsheet ID</label>
            <input
              id="sheetIdInput"
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              className="w-full bg-theme-body border-2 border-transparent rounded-xl p-3 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all"
              placeholder="Enter your Spreadsheet ID here"
            />
        </div>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              className="w-full flex-1 bg-theme-primary-gradient text-white py-3 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
            >
              Save and Continue
            </button>
            <button
                onClick={onLogout}
                className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold bg-theme-body hover:bg-black/5 transition-colors"
            >
                Logout
            </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetSetup;
