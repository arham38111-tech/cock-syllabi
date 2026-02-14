import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert('Failed to update');
    }
  };

  return (
    <main className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-main">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o._id} className="p-4 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order #{o._id}</p>
                  <p className="text-sm text-gray-600">User: {o.user?.name || o.user?.email}</p>
                  <p className="text-sm text-gray-600">Total: ${o.total}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} className="px-2 py-1 border rounded">
                    <option value="pending">pending</option>
                    <option value="paid">paid</option>
                    <option value="shipped">shipped</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminOrders;
