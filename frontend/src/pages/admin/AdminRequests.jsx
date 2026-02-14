import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import { motion } from 'framer-motion';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await apiClient.get('/teachers/requests');
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await apiClient.patch(`/teachers/requests/${requestId}/approve`);
      fetchRequests();
      alert('Request approved!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      await apiClient.patch(`/teachers/requests/${requestId}/reject`, { rejectionReason: reason });
      fetchRequests();
      alert('Request rejected!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  return (
    <main className="pt-24 pb-20 bg-white">
      <div className="container-main">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Teacher Requests</h2>

        {requests.length === 0 ? (
          <p className="text-gray-600">No requests</p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{req.teacherId?.name}</h3>
                    <p className="text-sm text-gray-600">{req.teacherId?.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{req.message}</p>
                {req.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(req._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminRequests;
