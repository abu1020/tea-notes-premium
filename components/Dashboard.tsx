import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const { totalSpent, totalPaid, balance } = useMemo(() => {
    let spent = 0;
    let paid = 0;
    
    transactions.forEach(t => {
      if (t.type === 'payment') {
        paid += t.amount;
      } else {
        spent += t.amount;
      }
    });

    return {
      totalSpent: spent,
      totalPaid: paid,
      balance: spent - paid
    };
  }, [transactions]);

  return (
    <div className="px-6 mb-8">
      <div className="relative rounded-[28px] p-6 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)] overflow-hidden transition-transform active:scale-[0.98] bg-theme-primary-gradient">
        {/* Abstract shape */}
        <div className="absolute -top-[20%] -right-[20%] w-[200px] h-[200px] bg-white/15 rounded-full blur-[40px] pointer-events-none"></div>

        <div className="flex flex-row-reverse justify-between items-start mb-8 relative z-10">
          {/* Icon Block */}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
            <i className="fa-solid fa-leaf"></i>
          </div>
          {/* Text Block */}
          <div className="text-right"> 
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2">Total Outstanding</p>
            <h2 className="text-4xl font-bold tracking-tight">₹{balance.toFixed(2)}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase text-white/70 mb-1">Spent</p>
            <p className="font-semibold">₹{totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase text-white/70 mb-1">Paid</p>
            <p className="font-semibold">₹{totalPaid.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;