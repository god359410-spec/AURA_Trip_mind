import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, DollarSign, Plus, Trash2, SplitSquareHorizontal } from 'lucide-react';
import { useTripStore } from '../stores/tripStore';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/currencyUtils';

export default function BudgetPage() {
  const { currentTrip } = useTripStore();
  const { expenses, addExpense, removeExpense, totalAmount, calculateSplits } = useExpenses([]);

  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [paidBy, setPaidBy] = useState(currentTrip?.groupMembers[0]?.id || '');

  if (!currentTrip) return null;

  const splits = calculateSplits();
  const budget = currentTrip.totalBudget;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amt || !paidBy) return;
    addExpense({
      tripId: currentTrip.id,
      description: desc,
      amount: parseFloat(amt),
      currency: currentTrip.currency,
      category: 'other',
      paidBy,
      splitBetween: currentTrip.groupMembers.map(m => m.id),
    });
    setDesc('');
    setAmt('');
  };

  const getMemberName = (id: string) => currentTrip.groupMembers.find(m => m.id === id)?.name || 'Unknown';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
      
      <div>
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-light tracking-[0.02em] text-primary mb-4">Ledger & Logistics</h2>
          <p className="font-sans text-sm font-light text-primary/40">Track group expenses and synchronize settlements elegantly.</p>
        </div>
        
        {/* Add Expense Form */}
        <form onSubmit={handleAdd} className="bg-surface/30 border border-darkBorder p-8 mb-12 flex flex-col md:flex-row gap-6 md:items-end">
          <div className="flex flex-col gap-3 flex-[2]">
            <label className="text-[0.6rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Description</label>
            <input type="text" className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Omakase Dinner" required />
          </div>
          <div className="flex flex-col gap-3 flex-[1]">
            <label className="text-[0.6rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Amount ({currentTrip.currency})</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40" />
              <input type="number" step="0.01" className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 pl-10 pr-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors placeholder:text-primary/20" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0.00" required />
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-[1.5]">
            <label className="text-[0.6rem] font-sans text-primary/50 uppercase tracking-[0.2em]">Paid By</label>
            <select className="w-full bg-surface/50 border border-darkBorder rounded-none py-3.5 px-4 text-sm text-primary focus:outline-none focus:border-gold/50 transition-colors [&>option]:text-background" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
              {currentTrip.groupMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <button type="submit" className="flex items-center justify-center gap-2 bg-primary hover:bg-gold text-background px-6 py-3.5 text-[0.65rem] font-sans uppercase tracking-[0.25em] transition-all hover:-translate-y-px h-[46px]">
            <Plus size={14} /> Add
          </button>
        </form>

        {/* Expense List */}
        <div>
          <h3 className="font-display text-2xl font-light tracking-[0.02em] text-primary mb-6">Recent Ledger Entries</h3>
          {expenses.length === 0 ? (
            <div className="text-center py-16 font-sans text-sm font-light text-primary/40 uppercase tracking-[0.2em] border border-darkBorder bg-surface/10">No expenses recorded yet.</div>
          ) : (
            <div className="flex flex-col">
              {expenses.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`flex justify-between items-center py-6 ${i !== expenses.length - 1 ? 'border-b border-darkBorder/50' : ''}`}>
                  <div>
                    <div className="font-sans text-sm text-primary font-medium tracking-wide mb-1">{e.description}</div>
                    <div className="font-sans text-[0.65rem] uppercase tracking-[0.1em] text-primary/40">Disbursed by <span className="text-gold/80">{getMemberName(e.paidBy)}</span></div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="font-display text-xl text-primary">{formatCurrency(e.amount, e.currency)}</div>
                    <button onClick={() => removeExpense(e.id)} className="text-primary/20 hover:text-danger transition-colors p-2"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="sticky top-[160px] flex flex-col gap-8">
        {/* Budget Progress */}
        <div className="bg-surface/30 border border-darkBorder p-8">
          <h3 className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-goldLight mb-8">Capital Allocation</h3>
          <div className="flex justify-between mb-4">
            <span className="font-sans text-xs font-light text-primary/50">Expended: <span className="font-medium text-primary ml-1">{formatCurrency(totalAmount, currentTrip.currency)}</span></span>
            <span className="font-sans text-xs font-light text-primary/30">Total: {formatCurrency(budget, currentTrip.currency)}</span>
          </div>
          <div className="h-[2px] bg-darkBorder w-full relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-full ${totalAmount > budget ? 'bg-danger' : 'bg-gold'}`} style={{ width: `${Math.min((totalAmount / budget) * 100, 100)}%` }} />
          </div>
          {totalAmount > budget && <div className="text-danger text-[0.65rem] font-sans uppercase tracking-[0.15em] mt-4 font-medium">Budget exceeded</div>}
        </div>

        {/* Settle Up */}
        <div className="bg-surface/30 border border-darkBorder p-8">
          <h3 className="font-sans text-[0.65rem] tracking-[0.3em] uppercase text-goldLight mb-8 flex items-center gap-3">
            <SplitSquareHorizontal size={14} /> Settlement Structure
          </h3>
          {splits.length === 0 ? (
            <div className="font-sans text-xs font-light text-primary/40 italic">Input expenses to calculate mutual settlements.</div>
          ) : (
            <div className="flex flex-col gap-8">
              {splits.map(split => (
                <div key={split.member}>
                  <div className="font-display text-lg text-primary mb-2">{getMemberName(split.member)}</div>
                  {split.netBalance === 0 && <div className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-success/80">Account balanced</div>}
                  {split.owes.map((o, i) => (
                    <div key={i} className="font-sans text-[0.65rem] uppercase tracking-[0.1em] text-primary/60 mt-1">
                      Liable to {getMemberName(o.to)}: <span className="text-gold font-medium ml-1">{formatCurrency(o.amount, currentTrip.currency)}</span>
                    </div>
                  ))}
                  {split.isOwed.map((o, i) => (
                    <div key={i} className="font-sans text-[0.65rem] uppercase tracking-[0.1em] text-primary/60 mt-1">
                      Receives from {getMemberName(o.from)}: <span className="text-gold font-medium ml-1">{formatCurrency(o.amount, currentTrip.currency)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
