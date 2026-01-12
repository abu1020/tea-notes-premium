
import React, { useState, useEffect, useMemo } from 'react';
import { TransactionType, Transaction, IconMapping } from '../types';

interface BillItem {
  id: string;
  type: TransactionType;
  note: string;
  quantity: number;
  price: number;
  amount: number;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (txs: Omit<Transaction, 'id' | 'date'>[]) => void;
  iconMapping: IconMapping;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, iconMapping }) => {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [currentUser, setCurrentUser] = useState('');
  
  // Current Item Input State
  const [type, setType] = useState<TransactionType>('tea');
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  
  const [shouldRender, setShouldRender] = useState(false);

  const isPayment = type === 'payment';

  useEffect(() => {
    if (isPayment) {
      setQuantity('1');
    }
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        setBillItems([]);
        setCurrentUser('');
        resetItemForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const resetItemForm = () => {
    setType('tea');
    setNote('');
    setQuantity('');
    setPrice('');
  };

  const currentItemTotal = useMemo(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    return !isNaN(q) && !isNaN(p) && q > 0 && p > 0 ? q * p : 0;
  }, [quantity, price]);

  const billTotalAmount = useMemo(() => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  }, [billItems]);

  const handleAddItemToBill = () => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);

    if (isNaN(q) || isNaN(p) || q <= 0 || p <= 0) return;

    const newItem: BillItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type,
      note,
      quantity: q,
      price: p,
      amount: currentItemTotal,
    };

    setBillItems([...billItems, newItem]);
    resetItemForm();
  };

  const handleRemoveItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const handleSubmitBill = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there are no items in bill, maybe add current one if valid
    let finalItems = [...billItems];
    if (finalItems.length === 0) {
      const q = parseFloat(quantity);
      const p = parseFloat(price);
      if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
        finalItems.push({
          id: Date.now().toString(),
          type,
          note,
          quantity: q,
          price: p,
          amount: currentItemTotal,
        });
      }
    }

    if (!currentUser || finalItems.length === 0) return;
    
    const transactionsToAdd: Omit<Transaction, 'id' | 'date'>[] = finalItems.map(item => ({
      type: item.type,
      amount: item.amount,
      note: item.note,
      user: currentUser,
      quantity: item.quantity,
      price: item.price,
    }));

    onAdd(transactionsToAdd);
  };

  const getOptionConfig = (optionType: string) => {
    switch(optionType) {
        case 'tea': return { label: 'Tea', activeClass: 'bg-theme-primary' };
        case 'coffee': return { label: 'Coffee', activeClass: 'bg-theme-primary' };
        case 'snacks': return { label: 'Snack', activeClass: 'bg-theme-primary' };
        case 'payment': return { label: 'Pay', activeClass: 'bg-green-600' };
        default: return { label: optionType, activeClass: 'bg-theme-primary' };
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-[4px] z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-lg bg-theme-surface rounded-2xl p-6 shadow-2xl z-[60] transition-all duration-300 flex flex-col max-h-[90vh] ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-theme-body flex items-center justify-center text-theme-muted hover:bg-black/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-center text-theme-main">Add Bill</h2>
        
        <div className="flex-1 overflow-y-auto pr-1 -mr-1">
            <div className="space-y-4">
                {/* User Input */}
                <div className="mb-2">
                    <label className="text-[10px] font-bold uppercase text-theme-muted mb-1 block">Bill Payer / Who passed entry</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Rahul, Office Admin"
                        value={currentUser}
                        onChange={(e) => setCurrentUser(e.target.value)}
                        className="w-full bg-theme-body border-2 border-transparent rounded-2xl p-3 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all" 
                        required
                    />
                </div>

                {/* Add Item Form */}
                <div className="bg-theme-body/50 border border-black/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-bold uppercase text-theme-muted">Item Details</p>
                        {currentItemTotal > 0 && <span className="text-sm font-bold text-theme-primary">Item Total: ₹{currentItemTotal.toFixed(2)}</span>}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {(['tea', 'coffee', 'snacks', 'payment'] as TransactionType[]).map((itemKey) => {
                        const config = getOptionConfig(itemKey);
                        return (
                            <label key={itemKey} className="cursor-pointer">
                            <input 
                                type="radio" 
                                name="type" 
                                value={itemKey} 
                                checked={type === itemKey} 
                                onChange={(e) => setType(e.target.value as TransactionType)}
                                className="peer hidden" 
                            />
                            <div className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-theme-body border-2 border-transparent transition-all text-theme-main peer-checked:${config.activeClass} peer-checked:text-white`}>
                                <i className={`fa-solid ${iconMapping[itemKey]} text-xs`}></i>
                                <span className="text-[10px] font-bold">{config.label}</span>
                            </div>
                            </label>
                        );
                        })}
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="Qty" 
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            disabled={isPayment}
                            className="w-1/4 bg-theme-surface rounded-xl p-3 text-sm text-theme-main outline-none disabled:opacity-50"
                        />
                        <input 
                            type="number" 
                            step="0.01" 
                            placeholder={isPayment ? "Amount" : "Price/Item"}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-3/4 bg-theme-surface rounded-xl p-3 text-sm text-theme-main outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Note (Optional)" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="flex-1 bg-theme-surface rounded-xl p-3 text-sm text-theme-main outline-none" 
                        />
                        <button 
                            type="button"
                            onClick={handleAddItemToBill}
                            className="bg-theme-primary text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-theme-primary/90 transition-colors"
                        >
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase text-theme-muted mb-2 px-1">Items in this bill ({billItems.length})</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {billItems.length > 0 ? billItems.map((item) => (
                            <div key={item.id} className="bg-theme-body p-3 rounded-xl flex items-center justify-between group animate-in slide-in-from-left duration-200">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${item.type === 'payment' ? 'bg-blue-100 text-blue-600' : 'bg-theme-primary/10 text-theme-primary'}`}>
                                        <i className={`fa-solid ${iconMapping[item.type]}`}></i>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold capitalize truncate">
                                            {item.type} {item.note && <span className="text-theme-muted font-normal text-[10px] ml-1">({item.note})</span>}
                                        </p>
                                        <p className="text-[10px] text-theme-muted">{item.quantity} &times; ₹{item.price.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-bold text-xs">₹{item.amount.toFixed(2)}</span>
                                    <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500"
                                    >
                                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-6 bg-theme-body/30 rounded-xl border-2 border-dashed border-black/5">
                                <p className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">No items added yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/5">
            <div className="flex justify-between items-center mb-4 px-2">
                <span className="text-sm font-bold text-theme-muted">Total Bill</span>
                <span className="font-black text-2xl text-theme-main">₹{billTotalAmount.toFixed(2)}</span>
            </div>
            <button 
                onClick={handleSubmitBill}
                disabled={!currentUser || (billItems.length === 0 && currentItemTotal === 0)}
                className="w-full bg-theme-primary-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
            >
                Save {billItems.length > 1 ? 'All Items' : 'Entry'}
            </button>
        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;
