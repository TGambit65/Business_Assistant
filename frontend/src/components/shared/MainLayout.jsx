import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

const MainLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default MainLayout; 