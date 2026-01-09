
import React, { useState, useEffect, useMemo } from 'react';
import { TransactionType, Transaction, IconMapping } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onUpdate: (tx: Transaction) => void;
  editTransaction: Transaction | null;
  iconMapping: IconMapping;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, onUpdate, editTransaction, iconMapping }) => {
  const [type, setType] = useState<TransactionType>('tea');
  const [note, setNote] = useState('');
  const [user, setUser] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [shouldRender, setShouldRender] = useState(false);

  const isPayment = type === 'payment';
  const isEditing = !!editTransaction;

  // Handle Populate for Edit
  useEffect(() => {
    if (isOpen && editTransaction) {
        setType(editTransaction.type);
        setNote(editTransaction.note);
        setUser(editTransaction.user);
        setQuantity(editTransaction.quantity.toString());
        setPrice(editTransaction.price.toString());
        // Extract YYYY-MM-DD from ISO string
        if (editTransaction.date) {
            setDate(editTransaction.date.split('T')[0]);
        }
    } else if (isOpen && !editTransaction) {
         // Reset for add mode
         setType('tea');
         setNote('');
         setUser('');
         setQuantity('');
         setPrice('');
         
         const now = new Date();
         const offset = now.getTimezoneOffset() * 60000;
         const localISODate = (new Date(now.getTime() - offset)).toISOString().split('T')[0];
         setDate(localISODate);
    }
  }, [isOpen, editTransaction]);

  useEffect(() => {
    if (isPayment && !isEditing) {
      setQuantity('1');
    }
  }, [type, isPayment, isEditing]);


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

    if (!user || isNaN(q) || isNaN(p) || q <= 0 || p <= 0 || !date) {
      // Basic validation
      return;
    }
    
    // Construct transaction object
    // For date, we append T00:00:00.000Z or similar to keep ISO format valid but without time significance
    const dateObj = new Date(date);
    const isoDate = dateObj.toISOString();

    if (isEditing && editTransaction) {
        onUpdate({
            ...editTransaction,
            type,
            amount: totalAmount,
            note,
            user,
            quantity: q,
            price: p,
            date: isoDate
        });
    } else {
        onAdd({
            type,
            amount: totalAmount,
            note,
            user,
            quantity: q,
            price: p,
            date: isoDate,
        });
    }
  };

  const getOptionConfig = (optionType: string) => {
    switch(optionType) {
        case 'tea': return { label: 'Tea', activeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        case 'coffee': return { label: 'Coffee', activeClass: 'bg-amber-100 text-amber-700 border-amber-200' };
        case 'snacks': return { label: 'Snack', activeClass: 'bg-pink-100 text-pink-700 border-pink-200' };
        case 'payment': return { label: 'Pay', activeClass: 'bg-blue-100 text-blue-700 border-blue-200' };
        default: return { label: optionType, activeClass: 'bg-gray-100' };
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-theme-surface rounded-[2.5rem] p-0 shadow-2xl z-[60] transition-all duration-300 overflow-hidden ${isOpen ? 'scale-100 opacity-100 translate-y-[-50%]' : 'scale-95 opacity-0 translate-y-[-45%] pointer-events-none'}`}
      >
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-theme-main tracking-tight">{isEditing ? 'Edit Entry' : 'New Entry'}</h2>
                <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-theme-body text-theme-muted hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Type Selector */}
                <div className="grid grid-cols-4 gap-2">
                    {(['tea', 'coffee', 'snacks', 'payment'] as TransactionType[]).map((itemKey) => {
                    const config = getOptionConfig(itemKey);
                    const isSelected = type === itemKey;
                    return (
                        <label key={itemKey} className="cursor-pointer">
                        <input 
                            type="radio" 
                            name="type" 
                            value={itemKey} 
                            checked={isSelected} 
                            onChange={(e) => setType(e.target.value as TransactionType)}
                            className="peer hidden" 
                        />
                        <div className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 ${isSelected ? `${config.activeClass} shadow-md scale-105` : 'bg-theme-body text-theme-muted hover:bg-black/5'}`}>
                            <i className={`fa-solid ${iconMapping[itemKey]} text-lg`}></i>
                            <span className="text-[10px] font-bold uppercase">{config.label}</span>
                        </div>
                        </label>
                    );
                    })}
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                    <div className="flex gap-3">
                      <input 
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="flex-1 bg-theme-body rounded-2xl px-4 py-3 font-medium text-theme-main placeholder:text-gray-400 outline-none border-2 border-transparent focus:border-theme-primary/20 focus:bg-theme-surface transition-all text-sm"
                          required
                      />
                    </div>

                    <input 
                        type="text" 
                        placeholder={isPayment ? "Paid by..." : "Who passed the entry..."}
                        value={user}
                        onChange={(e) => setUser(e.target.value)}
                        className="w-full bg-theme-body rounded-2xl px-4 py-3 font-medium text-theme-main placeholder:text-gray-400 outline-none border-2 border-transparent focus:border-theme-primary/20 focus:bg-theme-surface transition-all" 
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
                            className="w-1/3 bg-theme-body rounded-2xl px-4 py-3 font-bold text-center text-theme-main outline-none border-2 border-transparent focus:border-theme-primary/20 focus:bg-theme-surface transition-all disabled:opacity-50"
                            required 
                        />
                        <input 
                            type="number" 
                            step="0.01" 
                            placeholder="Price" 
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="flex-1 bg-theme-body rounded-2xl px-4 py-3 font-bold text-lg text-theme-main outline-none border-2 border-transparent focus:border-theme-primary/20 focus:bg-theme-surface transition-all" 
                            required
                        />
                    </div>

                    <input 
                        type="text" 
                        placeholder="Add a note (optional)" 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-theme-body rounded-2xl px-4 py-3 font-medium text-theme-main placeholder:text-gray-400 outline-none border-2 border-transparent focus:border-theme-primary/20 focus:bg-theme-surface transition-all" 
                    />
                </div>
                
                <div className="text-center py-2">
                    <p className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-3xl font-extrabold text-theme-main tracking-tight">₹{totalAmount.toFixed(2)}</p>
                </div>

                <button type="submit" className="w-full bg-theme-main text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-theme-main/20 active:scale-95 transition-all hover:-translate-y-1">
                    {isEditing ? 'Update' : 'Save'}
                </button>
            </form>
        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;
