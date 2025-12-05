export type TransactionType = 'tea' | 'coffee' | 'snacks' | 'payment';

export type ThemeType = 'matcha' | 'dark' | 'hibiscus' | 'chai' | 'ocean';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number; // This will be quantity * price
  note: string;
  date: string; // ISO string
  user: string; // Who passed the entry
  quantity: number;
  price: number;
}

export interface ConfirmationModalState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

export type IconMapping = {
  [key in TransactionType]: string;
};

export type SyncStatus = 'offline' | 'connecting' | 'connected' | 'syncing' | 'error';