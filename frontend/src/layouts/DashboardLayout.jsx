import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { FaGraduationCap, FaUserCircle } from 'react-icons/fa';

const DashboardLayout = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine current page header title based on path
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/raise-complaint')) return 'Raise A Campus Issue';
    if (path.includes('/complaints/')) return 'Issue Tracking Details';
    if (path.includes('/complaints')) return 'Manage & Search Issues';
    if (path.includes('/students')) return 'Students Registry';
    if (path.includes('/staff')) return 'Department Staff Registry';
    if (path.includes('/departments')) return 'Departments Management';
    if (path.includes('/reports')) return 'Reports & Analytics';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/profile')) return 'Account Profile';
    if (path.includes('/notifications')) return 'System Notifications';
    return 'College Issue Board';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Content wrapper shifted right to clear sidebar */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-2">
            <h1 className="font-outfit font-bold text-lg text-slate-800 tracking-tight">
              {getHeaderTitle()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User role badge */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              user?.role === 'admin' 
                ? 'bg-red-50 text-red-700 border border-red-100' 
                : user?.role === 'staff' 
                  ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                  : 'bg-primary-50 text-primary-700 border border-primary-100'
            }`}>
              {user?.role}
            </span>
            
            {/* Minimal User Profile Button */}
            <div className="flex items-center space-x-2 text-slate-700">
              <FaUserCircle className="h-6 w-6 text-slate-400" />
              <span className="text-sm font-medium hidden sm:inline-block">{user?.name}</span>
            </div>
          </div>
        </header>
        
        {/* Main Section */}
        <main className="flex-1 p-8 animate-fade-in relative">
          <Outlet />
          
          {/* AI Chatbot for everyone except maybe Admin? Spec says "accessible from student dashboard" but it's fine globally */}
          <Chatbot />
        </main>
        
      </div>
    </div>
  );
};

export default DashboardLayout;
