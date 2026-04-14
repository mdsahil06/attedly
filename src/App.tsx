/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  FileText, 
  LogOut,
  Menu,
  X,
  UserCircle,
  Coffee
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceScanner from './components/AttendanceScanner';
import AttendanceReports from './components/AttendanceReports';
import JavaSource from './components/JavaSource';
import Login from './components/Login';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Simple session check (could be improved with real JWT)
  useEffect(() => {
    const auth = localStorage.getItem('attendly_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('attendly_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('attendly_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'scanner', label: 'Scan QR', icon: QrCode },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'java', label: 'Java Source', icon: Coffee },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <QrCode className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl text-gray-900 tracking-tight">Attendly</span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                activeTab === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">Admin Teacher</p>
              <p className="text-xs text-gray-500">Computer Science Dept.</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
              <UserCircle className="text-gray-400 w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'students' && <StudentManagement />}
              {activeTab === 'scanner' && <AttendanceScanner />}
              {activeTab === 'reports' && <AttendanceReports />}
              {activeTab === 'java' && <JavaSource />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


