import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', price: 0, stock: 0 });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/products', form);
      setProducts(prev => [res.data.product, ...prev]);
      setForm({ title: '', description: '', price: 0, stock: 0 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add');
    }
  };

  return (
    <main className="pt-24 pb-20 bg-white min-h-screen">
      <div className="container-main">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Products</h1>
        </div>

        <form onSubmit={handleAdd} className="mb-6 grid sm:grid-cols-4 gap-3">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="px-3 py-2 border rounded" required />
          <input value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} placeholder="Price" type="number" className="px-3 py-2 border rounded" required />
          <input value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} placeholder="Stock" type="number" className="px-3 py-2 border rounded" required />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Add Product</button>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="col-span-4 px-3 py-2 border rounded" />
        </form>

        {loading ? <p>Loading...</p> : (
          <div className="grid md:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p._id} className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
                <p className="mt-2 text-green-600 font-bold">${p.price} • Stock: {p.stock}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminProducts;
