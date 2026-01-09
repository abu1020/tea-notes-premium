
import React, { useMemo } from 'react';
import { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = React.memo(({ transactions }) => {
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
    <div className="px-4 sm:px-6 md:px-0 mb-6">
      <div className="relative w-full rounded-[2rem] p-5 text-white shadow-xl shadow-theme-primary/20 overflow-hidden transition-all duration-300 hover:shadow-2xl bg-theme-primary-gradient group">
        
        {/* Modern Abstract Background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col items-center text-center">
             <div className="mb-2 p-2 bg-white/15 rounded-xl backdrop-blur-md shadow-lg border border-white/20">
                <i className="fa-solid fa-coins text-lg text-white"></i>
             </div>
            <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Net Balance</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter drop-shadow-sm flex items-start justify-center">
              <span className="text-2xl mt-1 opacity-70 mr-1">₹</span>
              {balance.toFixed(2)}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-900/20 rounded-2xl p-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-[1.02] group/item">
              <div className="flex items-center gap-2 mb-1 text-red-100/90">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <i className="fa-solid fa-arrow-trend-down text-[8px]"></i>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider">Spent</p>
              </div>
              <p className="font-bold text-lg tracking-tight text-white group-hover/item:text-red-50 transition-colors">₹{totalSpent.toFixed(2)}</p>
            </div>
            
            <div className="bg-emerald-900/20 rounded-2xl p-3 backdrop-blur-md border border-white/10 transition-transform hover:scale-[1.02] group/item">
              <div className="flex items-center gap-2 mb-1 text-emerald-100/90">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                     <i className="fa-solid fa-arrow-trend-up text-[8px]"></i>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider">Paid</p>
              </div>
              <p className="font-bold text-lg tracking-tight text-white group-hover/item:text-emerald-50 transition-colors">₹{totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
