import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

const AdminBank = () => {
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', routingNumber: '', country: '', currency: 'USD' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get('/users/me/bank-account');
        setBank(res.data.bankAccount || {});
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
      alert('Saved');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Admin Bank Account</h2>
        <form onSubmit={save} className="space-y-4">
          <input value={bank.bankName || ''} onChange={e => setBank({...bank, bankName: e.target.value})} placeholder="Bank name" className="w-full px-3 py-2 border rounded" />
          <input value={bank.accountNumber || ''} onChange={e => setBank({...bank, accountNumber: e.target.value})} placeholder="Account number" className="w-full px-3 py-2 border rounded" />
          <input value={bank.routingNumber || ''} onChange={e => setBank({...bank, routingNumber: e.target.value})} placeholder="Routing number" className="w-full px-3 py-2 border rounded" />
          <input value={bank.country || ''} onChange={e => setBank({...bank, country: e.target.value})} placeholder="Country" className="w-full px-3 py-2 border rounded" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </form>
      </div>
    </main>
  );
};

export default AdminBank;
