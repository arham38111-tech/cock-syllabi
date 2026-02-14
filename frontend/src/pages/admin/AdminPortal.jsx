import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminRequests from './AdminRequests';
import AdminPendingCourses from './AdminPendingCourses';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminBank from './AdminBank';
import AdminRegister from './AdminRegister';

const AdminPortal = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/requests" element={<AdminRequests />} />
      <Route path="/pending-courses" element={<AdminPendingCourses />} />
      <Route path="/products" element={<AdminProducts />} />
      <Route path="/orders" element={<AdminOrders />} />
      <Route path="/bank-account" element={<AdminBank />} />
    </Routes>
  );
};

export default AdminPortal;
