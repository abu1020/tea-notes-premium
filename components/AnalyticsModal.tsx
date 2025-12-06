import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, transactions }) => {
  const data = useMemo(() => {
    const totals = { tea: 0, coffee: 0, snacks: 0 };
    transactions.forEach(t => {
      if (t.type !== 'payment') {
        totals[t.type as keyof typeof totals] += t.amount;
      }
    });
    return [
      { name: 'Tea', value: totals.tea, color: '#10b981' }, // emerald-500
      { name: 'Coffee', value: totals.coffee, color: '#f59e0b' }, // amber-500
      { name: 'Snacks', value: totals.snacks, color: '#ec4899' }, // pink-500
    ].filter(d => d.value > 0);
  }, [transactions]);

  const totalQuantity = useMemo(() => {
    return transactions.reduce((total, t) => {
      if (t.type !== 'payment') {
        return total + t.quantity;
      }
      return total;
    }, 0);
  }, [transactions]);

  // Handle render only when needed or just use CSS transform
  // For simplicity with the Recharts responsive container size, we render but hide
  const modalClasses = `fixed inset-0 bg-theme-surface z-50 transition-transform duration-300 p-6 flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`;

  return (
    <div className={modalClasses}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-theme-main">Analytics</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-theme-body text-theme-main flex items-center justify-center transition-colors hover:bg-black/5"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {data.length > 0 ? (
          <>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `₹${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 text-center bg-theme-body p-4 rounded-2xl w-full max-w-xs mx-auto flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-boxes-stacked text-theme-muted text-xl"></i>
                    <p className="text-sm font-bold uppercase text-theme-muted tracking-wider">Total Items Purchased</p>
                </div>
                <p className="text-4xl font-black text-theme-main">{totalQuantity}</p>
            </div>
          </>
        ) : (
          <div className="text-theme-muted flex flex-col items-center">
             <i className="fa-solid fa-chart-pie text-4xl mb-4 opacity-50"></i>
             <p>No expense data to display yet.</p>
          </div>
        )}
        
        {data.length > 0 && (
          <div className="flex gap-4 mt-8 flex-wrap justify-center">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                 <span className="text-sm font-medium text-theme-main">{d.name} (₹{d.value.toFixed(2)})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-center mt-6">
           <p className="text-sm text-theme-muted">Spending Breakdown</p>
      </div>
    </div>
  );
};

export default AnalyticsModal;