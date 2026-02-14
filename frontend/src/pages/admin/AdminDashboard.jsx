import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../utils/api';
import { motion } from 'framer-motion';
import SmallChart from '../../components/SmallChart';


const AdminDashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState(null);
  const [topTeacher, setTopTeacher] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [orders, setOrders] = useState([]);
  const [policies, setPolicies] = useState({});
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [policyContent, setPolicyContent] = useState({});
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/admin/stats');
        setStats(response.data.stats);
        // attempt to fetch extra endpoints; handle gracefully if missing
        try {
          const salesRes = await apiClient.get('/admin/sales');
          setSales(salesRes.data.sales || null);
        } catch (e) {
          setSales(null);
        }

        try {
          const topRes = await apiClient.get('/admin/top-teacher');
          setTopTeacher(topRes.data.teacher || null);
        } catch (e) {
          setTopTeacher(null);
        }

        try {
          const ratingsRes = await apiClient.get('/admin/ratings');
          setRatings(ratingsRes.data || null);
        } catch (e) {
          setRatings(null);
        }

        try {
          const usersRes = await apiClient.get('/admin/users/recent');
          setRecentUsers(usersRes.data.users || []);
        } catch (e) {
          setRecentUsers([]);
        }

        try {
          const annRes = await apiClient.get('/admin/announcements');
          setAnnouncements(annRes.data.announcements || []);
        } catch (e) {
          setAnnouncements([]);
        }

        try {
          const ordersRes = await apiClient.get('/api/orders');
          setOrders(ordersRes.data.orders || []);
        } catch (e) {
          setOrders([]);
        }

        // Fetch policies
        try {
          const policiesRes = await apiClient.get('/api/policies');
          const policiesData = {};
          if (policiesRes.data.policies) {
            policiesRes.data.policies.forEach(policy => {
              policiesData[policy.policyType] = policy;
            });
          }
          setPolicies(policiesData);
        } catch (e) {
          console.error('Failed to fetch policies:', e);
          setPolicies({});
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleEditPolicy = (policyType) => {
    setEditingPolicy(policyType);
    const policy = policies[policyType];
    setPolicyContent({
      text: policy?.content || ''
    });
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    
    try {
      setSavingPolicy(true);
      const response = await apiClient.put(`/api/policies/${editingPolicy}`, {
        content: policyContent.text,
        title: policies[editingPolicy]?.title
      });
      
      if (response.data.success) {
        setPolicies(prev => ({
          ...prev,
          [editingPolicy]: response.data.policy
        }));
        setEditingPolicy(null);
        setPolicyContent({});
      }
    } catch (error) {
      console.error('Failed to save policy:', error);
      alert('Failed to save policy. Please try again.');
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setPolicyContent({});
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container-main">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-6"
          >
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Total Teachers', value: stats.totalTeachers },
              { label: 'Total Students', value: stats.totalStudents }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-premium">
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Sales + Top widgets */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-premium col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sales (last 30 days)</h3>
                <p className="text-sm text-gray-500">Revenue and course sales trend</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-green-600">{sales?.totalRevenue ? `$${sales.totalRevenue}` : '—'}</p>
              </div>
            </div>
            <div className="w-full">
              <SmallChart data={sales?.daily || [2,4,3,6,5,7,8,6,9,10,8]} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-premium">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Teacher</h3>
            {topTeacher ? (
              <div>
                <p className="font-semibold">{topTeacher.name}</p>
                <p className="text-sm text-gray-600">Sales: {topTeacher.sales}</p>
                <p className="text-sm text-gray-600">Rating: {topTeacher.rating || '—'}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No data available</p>
            )}
          </div>
        </div>

        {/* Announcements and ratings/users */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-premium md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
              <div className="text-sm text-gray-500">Post to all users</div>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newAnnouncement) return;
                try {
                  const res = await apiClient.post('/admin/announcements', { message: newAnnouncement });
                  // push returned announcement or local fallback
                  setAnnouncements(prev => [res.data.announcement || { message: newAnnouncement, _id: Date.now() }, ...prev]);
                  setNewAnnouncement('');
                } catch (err) {
                  setAnnouncements(prev => [{ message: newAnnouncement, _id: Date.now() }, ...prev]);
                  setNewAnnouncement('');
                }
              }}
            >
              <div className="flex gap-3">
                <input
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Write announcement..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Post</button>
              </div>
            </form>

            <div className="mt-6 space-y-4">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-600">No announcements yet.</p>
              ) : (
                announcements.map((a) => (
                  <div key={a._id} className="p-3 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-800">{a.message || a.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(a.createdAt || Date.now()).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-premium">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Ratings & Users</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-500">{ratings?.average ? ratings.average.toFixed(1) : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Recent Users</p>
              <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-gray-600">No recent users</p>
                ) : (
                  recentUsers.map(u => (
                    <div key={u._id || u.email} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{u.name || u.email}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Register User', path: 'register' },
            { label: 'Teacher Requests', path: 'requests' },
            { label: 'Pending Courses', path: 'pending-courses' },
            { label: 'Products', path: 'products' },
            { label: 'Orders', path: 'orders' },
            { label: 'Bank Account', path: 'bank-account' }
          ].map((item, index) => (
            <a
              key={index}
              href={`/admin/${item.path}`}
              className="p-6 bg-white rounded-xl shadow-premium hover:shadow-lift transition-shadow text-center"
            >
              <p className="font-semibold text-gray-900">{item.label}</p>
            </a>
          ))}
        </div>

        {/* Customer Order Tracking */}
        <div className="bg-white p-8 rounded-xl shadow-premium mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Order Tracking</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-600">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium">{(order._id || 'N/A').slice(-6)}</td>
                      <td className="py-4 px-4 text-sm">{order.customerName || order.email || '—'}</td>
                      <td className="py-4 px-4 text-sm">{order.productName || order.product || '—'}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-green-600">${order.amount || '0'}</td>
                      <td className="py-4 px-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms & Policies Section */}
        <div className="bg-white p-8 rounded-xl shadow-premium mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Terms & Policies</h2>
          </div>
          <div className="space-y-6">
            {[ 
              { key: 'terms', label: 'Terms of Service', title: 'Terms of Service' },
              { key: 'privacy', label: 'Privacy Policy', title: 'Privacy Policy' },
              { key: 'refund', label: 'Return & Refund Policy', title: 'Return & Refund Policy' }
            ].map(({ key, label, title }) => (
              <div key={key}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
                {editingPolicy === key ? (
                  <div className="space-y-3">
                    <textarea
                      value={policyContent.text}
                      onChange={(e) => setPolicyContent({ text: e.target.value })}
                      placeholder={`Enter ${label.toLowerCase()}...`}
                      className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring focus:ring-blue-500 min-h-48"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSavePolicy}
                        disabled={savingPolicy}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {savingPolicy ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingPolicy}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-24 max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {policies[key]?.content || `${label} content will appear here.`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditPolicy(key)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit {label}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
