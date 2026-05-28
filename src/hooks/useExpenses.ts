import { useState, useCallback } from 'react';
import { Expense, SplitResult } from '../types/trip.types';

export function useExpenses(initialExpenses: Expense[] = []) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const calculateSplits = useCallback((): SplitResult[] => {
    const balances: Record<string, number> = {};

    for (const expense of expenses) {
      const splitCount = expense.splitBetween.length;
      if (splitCount === 0) continue;
      const perPerson = expense.amount / splitCount;

      if (!balances[expense.paidBy]) balances[expense.paidBy] = 0;
      balances[expense.paidBy] += expense.amount;

      for (const member of expense.splitBetween) {
        if (!balances[member]) balances[member] = 0;
        balances[member] -= perPerson;
      }
    }

    return Object.entries(balances).map(([member, balance]) => ({
      member,
      netBalance: balance,
      owes: balance < 0 ? [{ to: Object.entries(balances).find(([, b]) => b > 0)?.[0] || '', amount: Math.abs(balance) }] : [],
      isOwed: balance > 0 ? [{ from: Object.entries(balances).find(([, b]) => b < 0)?.[0] || '', amount: balance }] : [],
    }));
  }, [expenses]);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return { expenses, addExpense, removeExpense, totalAmount, calculateSplits, byCategory };
}
