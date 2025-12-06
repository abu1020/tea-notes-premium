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
    <div className="px-4 sm:px-6 md:px-0 mb-8">
      <div className="relative w-full rounded-[2rem] p-6 md:p-8 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-theme-primary-gradient group">
        
        {/* Abstract Background Shapes */}
        <div className="absolute -top-[20%] -right-[20%] w-[250px] h-[250px] bg-white/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent opacity-60"></div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
              <i className="fa-solid fa-wallet text-xl"></i>
            </div>
            <p className="text-white/80 text-xs font-bold uppercase tracking-[0.15em] mb-1">Total Outstanding</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-sm">
              <span className="text-3xl align-top opacity-70 mr-1">₹</span>
              {balance.toFixed(2)}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/5 transition-colors hover:bg-black/25">
              <div className="flex items-center gap-2 mb-1 text-white/70">
                <i className="fa-solid fa-arrow-trend-down text-[10px]"></i>
                <p className="text-[10px] font-bold uppercase tracking-wider">Total Spent</p>
              </div>
              <p className="font-bold text-xl md:text-2xl">₹{totalSpent.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10 transition-colors hover:bg-white/25 text-white">
              <div className="flex items-center gap-2 mb-1 text-white/80">
                <i className="fa-solid fa-hand-holding-dollar text-[10px]"></i>
                <p className="text-[10px] font-bold uppercase tracking-wider">Total Paid</p>
              </div>
              <p className="font-bold text-xl md:text-2xl">₹{totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;