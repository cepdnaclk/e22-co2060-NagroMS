import { useLanguage } from '../../../i18n/LanguageContext';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { auth, db } from '../../../utils/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ManagementSection() {
  const { t } = useLanguage();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const [expensePeriod, setExpensePeriod] = useState('Last 1 Week');
  const [incomePeriod, setIncomePeriod] = useState('Last 1 Week');
  const [profitPeriod, setProfitPeriod] = useState('Last 1 Month');

  const [expenseForm, setExpenseForm] = useState({ title: '', category: 'Seeds', amount: '', date: '', description: '' });
  const [incomeForm, setIncomeForm] = useState({ title: '', source: 'Product Sale', amount: '', date: '', description: '' });

  useEffect(() => {
    let unsubscribeExpenses = null;
    let unsubscribeIncomes = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const qExp = query(collection(db, 'expenses'), where('farmerId', '==', user.uid));
        unsubscribeExpenses = onSnapshot(qExp, (snapshot) => {
          const arr = [];
          snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
          arr.sort((a,b) => new Date(b.date) - new Date(a.date));
          setExpenses(arr);
        });

        const qInc = query(collection(db, 'income'), where('farmerId', '==', user.uid));
        unsubscribeIncomes = onSnapshot(qInc, (snapshot) => {
          const arr = [];
          snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
          arr.sort((a,b) => new Date(b.date) - new Date(a.date));
          setIncomes(arr);
        });
      } else {
        setExpenses([]);
        setIncomes([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeExpenses) unsubscribeExpenses();
      if (unsubscribeIncomes) unsubscribeIncomes();
    };
  }, []);

  const getStartDate = (period) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); 
    if (period === 'Last 1 Week') date.setDate(date.getDate() - 7);
    else if (period === 'Last 1 Month') date.setMonth(date.getMonth() - 1);
    else if (period === 'Last 3 Months') date.setMonth(date.getMonth() - 3);
    return date;
  };

  const getFilteredData = (data, period) => {
    const startDate = getStartDate(period);
    return data.filter(item => {
      if (!item.date) return false;
      return new Date(item.date) >= startDate;
    });
  };

  const filteredExpenses = getFilteredData(expenses, expensePeriod);
  const filteredIncomes = getFilteredData(incomes, incomePeriod);

  const profitExpenses = getFilteredData(expenses, profitPeriod);
  const profitIncomes = getFilteredData(incomes, profitPeriod);

  const totalExpense = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalIncome = filteredIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const profitTotalExpense = profitExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const profitTotalIncome = profitIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netProfit = profitTotalIncome - profitTotalExpense;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch('http://localhost:5000/api/farmer/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...expenseForm,
          amount: Number(expenseForm.amount)
        })
      });
      setShowExpenseModal(false);
      setExpenseForm({ title: '', category: 'Seeds', amount: '', date: '', description: '' });
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch('http://localhost:5000/api/farmer/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...incomeForm,
          amount: Number(incomeForm.amount)
        })
      });
      setShowIncomeModal(false);
      setIncomeForm({ title: '', source: 'Product Sale', amount: '', date: '', description: '' });
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const getChartData = (records) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayTotals = {
      'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0
    };

    records.forEach(r => {
      if (r.date) {
        const d = new Date(r.date);
        const dayName = days[d.getDay()];
        dayTotals[dayName] += Number(r.amount || 0);
      }
    });

    return [
      { name: t('farmer.management.monday').substring(0,3), amount: dayTotals['Monday'] },
      { name: t('farmer.management.tuesday').substring(0,3), amount: dayTotals['Tuesday'] },
      { name: t('farmer.management.wednesday').substring(0,3), amount: dayTotals['Wednesday'] },
      { name: t('farmer.management.thursday').substring(0,3), amount: dayTotals['Thursday'] },
      { name: t('farmer.management.friday').substring(0,3), amount: dayTotals['Friday'] },
      { name: t('farmer.management.saturday').substring(0,3), amount: dayTotals['Saturday'] },
      { name: t('farmer.management.sunday').substring(0,3), amount: dayTotals['Sunday'] },
    ];
  };

  const expenseChartData = getChartData(filteredExpenses);
  const incomeChartData = getChartData(filteredIncomes);

  return (
    <div className="nagro-section-content" style={{ paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>{t('farmer.management.title')}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Expenses Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#dc2626' }}>{t('farmer.management.totalExpenses')}</h3>
              {expenses.length > 0 && (
                <>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '8px 0' }}>Rs {totalExpense.toLocaleString()}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{expensePeriod}</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowExpenseModal(true)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t('farmer.management.addExpense')}</button>
              <select value={expensePeriod} onChange={e => setExpensePeriod(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none' }}>
                <option value="Last 1 Week">{t('farmer.management.lastWeek')}</option>
                <option value="Last 1 Month">{t('farmer.management.lastMonth')}</option>
                <option value="Last 3 Months">{t('farmer.management.lastThreeMonths')}</option>
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '16px', overflow: 'hidden' }}>
            <div style={{ height: '180px', width: '100%', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Line type="monotone" dataKey="amount" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
              {expenses.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>{t('farmer.management.noExpenses')}</p>
              ) : filteredExpenses.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>{t('farmer.management.noExpenses')}</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredExpenses.map(exp => (
                    <li key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div>
                        <p style={{ fontWeight: 500, color: '#374151', margin: 0 }}>{exp.title}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{exp.date} • {exp.category}</p>
                        {exp.description && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>{exp.description}</p>}
                      </div>
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>Rs {exp.amount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#22c55e' }}>{t('farmer.management.totalIncome')}</h3>
              {incomes.length > 0 && (
                <>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#111827', margin: '8px 0' }}>Rs {totalIncome.toLocaleString()}</p>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{incomePeriod}</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowIncomeModal(true)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{t('farmer.management.addIncome')}</button>
              <select value={incomePeriod} onChange={e => setIncomePeriod(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px', outline: 'none' }}>
                <option value="Last 1 Week">{t('farmer.management.lastWeek')}</option>
                <option value="Last 1 Month">{t('farmer.management.lastMonth')}</option>
                <option value="Last 3 Months">{t('farmer.management.lastThreeMonths')}</option>
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '16px', overflow: 'hidden' }}>
            <div style={{ height: '180px', width: '100%', marginBottom: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
              {incomes.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>{t('farmer.management.noIncome')}</p>
              ) : filteredIncomes.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>{t('farmer.management.noIncome')}</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {filteredIncomes.map(inc => (
                    <li key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div>
                        <p style={{ fontWeight: 500, color: '#374151', margin: 0 }}>{inc.title}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{inc.date} • {inc.source}</p>
                        {inc.description && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0 0' }}>{inc.description}</p>}
                      </div>
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>Rs {inc.amount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Profit Section */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>{t('farmer.management.profitSummary')}</h3>
          <select value={profitPeriod} onChange={e => setProfitPeriod(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}>
            <option value="Last 1 Week">{t('farmer.management.lastWeek')}</option>
            <option value="Last 1 Month">{t('farmer.management.lastMonth')}</option>
            <option value="Last 3 Months">{t('farmer.management.lastThreeMonths')}</option>
          </select>
        </div>

        <div>
          {(expenses.length === 0 && incomes.length === 0) ? (
            <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{t('farmer.management.noProfitData')}</p>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>{t('farmer.management.totalIncome')}</p>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: '#22c55e', margin: 0 }}>Rs {profitTotalIncome.toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>{t('farmer.management.totalExpenses')}</p>
                  <p style={{ fontSize: '24px', fontWeight: 600, color: '#dc2626', margin: 0 }}>Rs {profitTotalExpense.toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>{t('farmer.management.netProfit')}</p>
                  <p style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: netProfit > 0 ? '#22c55e' : netProfit < 0 ? '#dc2626' : '#374151' }}>
                    {netProfit < 0 ? '-' : ''}Rs {Math.abs(netProfit).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '16px', borderRadius: '8px', backgroundColor: netProfit > 0 ? '#dcfce7' : netProfit < 0 ? '#fee2e2' : '#f3f4f6' }}>
                <p style={{ fontWeight: 600, margin: 0, fontSize: '16px', color: netProfit > 0 ? '#16a34a' : netProfit < 0 ? '#dc2626' : '#4b5563' }}>
                  {netProfit > 0 ? t('farmer.management.makingProfit') : netProfit < 0 ? t('farmer.management.atLoss') : t('farmer.management.noProfitLoss')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>{t('farmer.management.addExpense')}</h2>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.expenseTitle')}</label>
                <input required type="text" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.category')}</label>
                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="Seeds">{t('farmer.management.category')}</option>
                  <option value="Fertilizer">{t('management.fertilizer') || 'Fertilizer'}</option>
                  <option value="Transport">{t('management.transport') || 'Transport'}</option>
                  <option value="Labor">{t('management.labor') || 'Labor'}</option>
                  <option value="Pesticide">{t('management.pesticide') || 'Pesticide'}</option>
                  <option value="Equipment">{t('management.equipment') || 'Equipment'}</option>
                  <option value="Water/Electricity">{t('management.waterElec') || 'Water/Electricity'}</option>
                  <option value="Packaging">{t('management.packaging') || 'Packaging'}</option>
                  <option value="Other">{t('management.other') || 'Other'}</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.amount')}</label>
                  <input required type="number" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.date')}</label>
                  <input required type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.description')}</label>
                <textarea rows="2" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t('farmer.common.cancel')}</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t('farmer.management.addExpense')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>{t('farmer.management.addIncome')}</h2>
            <form onSubmit={handleAddIncome} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.incomeTitle')}</label>
                <input required type="text" value={incomeForm.title} onChange={e => setIncomeForm({...incomeForm, title: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.source')}</label>
                <select value={incomeForm.source} onChange={e => setIncomeForm({...incomeForm, source: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="Product Sale">{t('farmer.management.source')}</option>
                  <option value="Direct Customer Sale">{t('management.directCustomer') || 'Direct Customer Sale'}</option>
                  <option value="Wholesale Sale">{t('management.wholesale') || 'Wholesale Sale'}</option>
                  <option value="Delivery Income">{t('management.deliveryIncome') || 'Delivery Income'}</option>
                  <option value="Farming Service">{t('management.farmingService') || 'Farming Service'}</option>
                  <option value="Government Support">{t('management.govSupport') || 'Government Support'}</option>
                  <option value="Other">{t('management.other') || 'Other'}</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.amount')}</label>
                  <input required type="number" min="0" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.date')}</label>
                  <input required type="date" value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{t('farmer.management.description')}</label>
                <textarea rows="2" value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowIncomeModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t('farmer.common.cancel')}</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{t('farmer.management.addIncome')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
