import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaChartPie, 
  FaPlusCircle, 
  FaHistory, 
  FaUser, 
  FaBell, 
  FaBuilding, 
  FaUsers, 
  FaUserTie, 
  FaFileAlt, 
  FaCog, 
  FaSignOutAlt,
  FaClipboardList,
  FaEnvelopeOpenText
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getLinksByRole = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: FaChartPie },
          { name: 'Raise Complaint', path: '/student/raise-complaint', icon: FaPlusCircle },
          { name: 'Complaint History', path: '/student/complaints', icon: FaHistory },
          { name: 'Notifications', path: '/student/notifications', icon: FaBell },
          { name: 'Profile Settings', path: '/student/profile', icon: FaUser },
        ];
      case 'staff':
        return [
          { name: 'Dashboard', path: '/staff/dashboard', icon: FaChartPie },
          { name: 'Assigned Complaints', path: '/staff/complaints', icon: FaClipboardList },
          { name: 'Notifications', path: '/staff/notifications', icon: FaBell },
          { name: 'Profile Settings', path: '/staff/profile', icon: FaUser },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: FaChartPie },
          { name: 'Manage Complaints', path: '/admin/complaints', icon: FaClipboardList },
          { name: 'Manage Students', path: '/admin/students', icon: FaUsers },
          { name: 'Manage Staff', path: '/admin/staff', icon: FaUserTie },
          { name: 'Manage Departments', path: '/admin/departments', icon: FaBuilding },
          { name: 'Reports & Export', path: '/admin/reports', icon: FaFileAlt },
          { name: 'Notifications', path: '/admin/notifications', icon: FaBell },
          { name: 'System Settings', path: '/admin/settings', icon: FaCog },
        ];
      default:
        return [];
    }
  };

  const links = getLinksByRole();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed top-0 left-0 z-40 border-r border-slate-800">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
        <div className="p-1.5 bg-primary-600 text-white rounded-lg">
          <FaClipboardList className="h-5 w-5" />
        </div>
        <span className="font-outfit font-bold text-lg tracking-tight text-white">
          Smart<span className="text-primary-500">College</span>
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(link.path)
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Information Profile Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <FaSignOutAlt className="h-3.5 w-3.5" />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
