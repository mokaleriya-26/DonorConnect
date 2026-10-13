import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoSwitcher } from '../common/DemoSwitcher';

export const DashboardLayout = ({ title = 'Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Demo Switcher Banner */}
      <DemoSwitcher />

      <div className="dashboard-shell">
        {/* Persistent Purple Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main View Area */}
        <div className="dashboard-main">
          <Topbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            title={title}
          />
          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
