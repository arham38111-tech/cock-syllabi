import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const TeacherBank = () => {
  const { user } = useAuth();
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', routingNumber: '', country: '', currency: 'USD' });
  const [autoPayout, setAutoPayout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get('/users/me/bank-account');
        setBank(res.data.bankAccount || {});
        setAutoPayout(res.data.autoPayoutToAdmin || false);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/users/me/bank-account', bank);
      await apiClient.post('/users/me/payout-rule', { autoPayoutToAdmin: autoPayout });
      alert('Saved');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Bank Account & Payout</h2>
        <form onSubmit={save} className="space-y-4">
          <input value={bank.bankName || ''} onChange={e => setBank({...bank, bankName: e.target.value})} placeholder="Bank name" className="w-full px-3 py-2 border rounded" />
          <input value={bank.accountNumber || ''} onChange={e => setBank({...bank, accountNumber: e.target.value})} placeholder="Account number" className="w-full px-3 py-2 border rounded" />
          <input value={bank.routingNumber || ''} onChange={e => setBank({...bank, routingNumber: e.target.value})} placeholder="Routing number" className="w-full px-3 py-2 border rounded" />
          <input value={bank.country || ''} onChange={e => setBank({...bank, country: e.target.value})} placeholder="Country" className="w-full px-3 py-2 border rounded" />
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={autoPayout} onChange={e => setAutoPayout(e.target.checked)} />
            <label>Automatically send payouts to admin</label>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </form>
      </div>
    </main>
  );
};

export default TeacherBank;
