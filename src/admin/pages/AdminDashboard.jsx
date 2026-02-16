import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Users, FileText, Phone, LayoutDashboard } from 'lucide-react';
import { OfficersManager } from '../components/OfficersManager';
import { WeeklyReportsManager } from '../components/WeeklyReportsManager';
import { ContactManager } from '../components/ContactManager';
import { getOfficers, getWeeklyReports } from '../../utils/storage';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    officers: 0,
    reports: 0
  });

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      navigate('/admin');
    }

    // Load stats
    setStats({
      officers: getOfficers().length,
      reports: getWeeklyReports().length
    });
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'officers', label: 'Officers', icon: Users },
    { id: 'reports', label: 'Weekly Reports', icon: FileText },
    { id: 'contact', label: 'Contact Info', icon: Phone }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-red-700 font-bold text-xl">BFP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-red-100">BFP Station 1 Cogon Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-white hover:text-red-100 text-sm"
              >
                View Public Site →
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-800 hover:bg-red-900 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Officers</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.officers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Weekly Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.reports}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Station Status</p>
                    <p className="text-lg font-bold text-green-600">Active</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('officers')}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <Users className="text-blue-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Manage Officers</p>
                    <p className="text-sm text-gray-600">Add, edit, or remove officers</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                >
                  <FileText className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Manage Reports</p>
                    <p className="text-sm text-gray-600">Add weekly updates and reports</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('contact')}
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                >
                  <Phone className="text-purple-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">Update Contact Info</p>
                    <p className="text-sm text-gray-600">Edit contact information</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'officers' && <OfficersManager />}
        {activeTab === 'reports' && <WeeklyReportsManager />}
        {activeTab === 'contact' && <ContactManager />}
      </main>
    </div>
  );
}
