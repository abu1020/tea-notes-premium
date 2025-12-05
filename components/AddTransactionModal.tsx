import React, { useState, useEffect, useMemo } from 'react';
import { TransactionType, Transaction, IconMapping } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  iconMapping: IconMapping;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, iconMapping }) => {
  const [type, setType] = useState<TransactionType>('tea');
  const [note, setNote] = useState('');
  const [user, setUser] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [shouldRender, setShouldRender] = useState(false);

  const isPayment = type === 'payment';

  useEffect(() => {
    if (isPayment) {
      setQuantity('1');
    }
  }, [type]);


  // Handle animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300); // Wait for animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const totalAmount = useMemo(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
        return q * p;
    }
    return 0;
  }, [quantity, price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseFloat(quantity);
    const p = parseFloat(price);

    if (!user || isNaN(q) || isNaN(p) || q <= 0 || p <= 0) {
      // Basic validation
      return;
    }
    
    onAdd({
      type,
      amount: totalAmount,
      note,
      user,
      quantity: q,
      price: p,
    });
    
    // Reset form
    setType('tea');
    setNote('');
    setUser('');
    setQuantity('');
    setPrice('');
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
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-theme-surface rounded-2xl p-6 shadow-2xl z-[60] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-theme-body flex items-center justify-center text-theme-muted hover:bg-black/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <h2 className="text-xl font-bold mb-6 text-center text-theme-main">New Entry</h2>
        
        <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    <div className={`flex flex-col items-center gap-1 p-3 rounded-2xl bg-theme-body transition-all text-theme-main peer-checked:${config.activeClass} peer-checked:text-white`}>
                        <i className={`fa-solid ${iconMapping[itemKey]}`}></i>
                        <span className="text-[10px] font-bold">{config.label}</span>
                    </div>
                    </label>
                );
                })}
            </div>

            <input 
                type="text" 
                placeholder={isPayment ? "Paid by" : "Who passed the entry"}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-theme-body border-2 border-transparent rounded-2xl p-4 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all placeholder:text-gray-400" 
                required
            />

            <div className="flex gap-3">
                <input 
                type="number" 
                step="0.01" 
                placeholder="Qty" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isPayment}
                className="w-1/2 bg-theme-body border-2 border-transparent rounded-2xl p-4 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all placeholder:text-gray-400 disabled:opacity-50"
                required 
                />
                <input 
                type="number" 
                step="0.01" 
                placeholder={isPayment ? "Amount Paid" : "Price per item"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-1/2 bg-theme-body border-2 border-transparent rounded-2xl p-4 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all placeholder:text-gray-400" 
                required
                />
            </div>

            <input 
                type="text" 
                placeholder="Description (optional)" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-theme-body border-2 border-transparent rounded-2xl p-4 text-theme-main outline-none focus:bg-theme-surface focus:border-theme-primary transition-all placeholder:text-gray-400" 
            />
            
            <div className="text-center my-2">
                <span className="text-theme-muted">Total Amount: </span>
                <span className="font-bold text-2xl text-theme-main">₹{totalAmount.toFixed(2)}</span>
            </div>

            <button type="submit" className="w-full bg-theme-primary-gradient text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
                Save
            </button>
            </form>
        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;