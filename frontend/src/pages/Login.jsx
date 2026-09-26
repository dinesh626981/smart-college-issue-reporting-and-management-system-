import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaGraduationCap, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaLock, 
  FaSignInAlt, 
  FaUserShield, 
  FaUserTie, 
  FaBolt,
  FaCheckCircle
} from 'react-icons/fa';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [activeDemoRole, setActiveDemoRole] = useState(null);
  const [selectedRoleTab, setSelectedRoleTab] = useState('all'); // 'all', 'staff', 'student', 'admin'
  const [staffFillMode, setStaffFillMode] = useState('email'); // 'email' or 'mobile'
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'admin',
      label: 'Admin',
      email: 'admin@college.com',
      mobile: '9876543210',
      password: 'admin123',
      icon: FaUserShield,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      activeColor: 'bg-indigo-600 text-white border-indigo-600 shadow-md'
    },
    {
      role: 'student',
      label: 'Student',
      email: 'student@college.com',
      mobile: '9876543211',
      password: 'student123',
      icon: FaGraduationCap,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      activeColor: 'bg-blue-600 text-white border-blue-600 shadow-md'
    },
    {
      role: 'staff',
      label: 'Staff',
      email: 'staff@college.com',
      mobile: '9876543212',
      password: 'staff123',
      icon: FaUserTie,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
      activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-md'
    }
  ];

  const handleFillDemo = (acc, preferMode = null) => {
    let chosenVal = acc.email;
    if (acc.role === 'staff') {
      const mode = preferMode || (identifier === acc.email ? 'mobile' : 'email');
      setStaffFillMode(mode);
      chosenVal = mode === 'mobile' ? acc.mobile : acc.email;
      toast.info(`Filled Staff credentials using ${mode === 'mobile' ? 'Mobile Number (9876543212)' : 'Email (staff@college.com)'}`);
    } else {
      toast.info(`Filled ${acc.label} credentials: ${chosenVal}`);
    }

    setIdentifier(chosenVal);
    setPassword(acc.password);
    setActiveDemoRole(acc.role);
    if (acc.role === 'staff' && selectedRoleTab === 'all') {
      setSelectedRoleTab('staff');
    }
  };

  // Redirection URL from router history
  const from = location.state?.from?.pathname || '';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      // Standard dashboards routing
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    }
  }, [isAuthenticated, user, navigate, from]);

  // Check if routed due to expired token session
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      toast.warning('Your session has expired. Please log in again.');
    }
    // Check if role is pre-selected in URL
    const roleParam = searchParams.get('role');
    if (roleParam && ['staff', 'student', 'admin'].includes(roleParam)) {
      setSelectedRoleTab(roleParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      toast.error('Please enter both your email or mobile number, and password!');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters!');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${loggedUser.name}!`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Determine which icon to display based on input
  const isPhoneNumber = /^[0-9+\s-]{3,}$/.test(identifier.trim());

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden animate-fade-in">
        {/* Decorative corner colors */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-600/10 rounded-full filter blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full filter blur-xl"></div>

        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="p-2.5 bg-primary-600 text-white rounded-xl shadow-glow">
              <FaGraduationCap className="h-6 w-6" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-slate-800">
              Smart<span className="text-primary-600">College</span>
            </span>
          </Link>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900">
            {selectedRoleTab === 'staff' ? 'Staff Portal Login' : 'Log In to your Account'}
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            {selectedRoleTab === 'staff' 
              ? 'Department staff sign in with Email or Mobile Number.' 
              : 'Access issue boards, raise tickets and check statuses.'}
          </p>
        </div>

        {/* Role Portal Selector Tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'staff', label: 'Staff Portal', icon: FaUserTie, badge: 'Staff' },
            { id: 'student', label: 'Student', icon: FaGraduationCap },
            { id: 'admin', label: 'Admin', icon: FaUserShield }
          ].map((tab) => {
            const isActive = selectedRoleTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRoleTab(tab.id)}
                className={`flex-1 py-2 px-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  isActive 
                    ? tab.id === 'staff'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.icon && <tab.icon className="h-3 w-3" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Staff Specific Notice if Staff Portal is Selected */}
        {selectedRoleTab === 'staff' && (
          <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-start space-x-2.5 animate-fade-in">
            <FaUserTie className="text-emerald-600 h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-emerald-900 leading-snug">
              <span className="font-bold">Staff Login Enabled:</span> You can sign in using your official <span className="underline font-semibold">Email ID</span> or registered <span className="underline font-semibold">Mobile Number</span>.
            </div>
          </div>
        )}

        {/* Quick 1-Click Auto-Fill Demo Accounts */}
        <div className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <FaBolt className="text-amber-500 h-3.5 w-3.5" />
              <span>1-Click Auto-Fill Demo:</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              Demo Access
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isSelected = activeDemoRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleFillDemo(acc)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition-all cursor-pointer ${
                    isSelected ? acc.activeColor : acc.color
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{acc.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Staff Mode Toggle if Staff Demo Selected */}
          {activeDemoRole === 'staff' && (
            <div className="pt-1 flex items-center justify-center space-x-1.5 text-[11px]">
              <span className="text-slate-500 font-medium">Staff Login as:</span>
              <button
                type="button"
                onClick={() => handleFillDemo(demoAccounts.find(a => a.role === 'staff'), 'email')}
                className={`px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                  identifier === 'staff@college.com'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Email (staff@college.com)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo(demoAccounts.find(a => a.role === 'staff'), 'mobile')}
                className={`px-2 py-0.5 rounded-lg border font-semibold transition-all ${
                  identifier === '9876543212'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Mobile (9876543212)
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-500 text-center font-mono bg-white py-1 px-2 rounded-lg border border-slate-200/50">
            {activeDemoRole === 'admin' && 'admin@college.com • admin123'}
            {activeDemoRole === 'student' && 'student@college.com • student123'}
            {activeDemoRole === 'staff' && (identifier === '9876543212' ? 'Mobile: 9876543212 • staff123' : 'Email: staff@college.com • staff123')}
            {!activeDemoRole && 'Click any button above to auto-fill credentials'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-4">
            
            {/* Email or Mobile Number Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedRoleTab === 'staff' ? 'Staff Email or Mobile Number' : 'Email or Mobile Number'}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {isPhoneNumber ? 'Mobile Number entered' : 'Email or 10-digit Mobile'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  {isPhoneNumber ? (
                    <FaPhoneAlt className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <FaEnvelope className="h-4 w-4" />
                  )}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800"
                  placeholder={
                    selectedRoleTab === 'staff'
                      ? 'e.g. staff@college.com or 9876543212'
                      : 'e.g. name@college.com or 9876543210'
                  }
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your registered college email or 10-digit mobile number.
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-glow flex items-center justify-center space-x-2 disabled:opacity-50 transition-all cursor-pointer ${
              selectedRoleTab === 'staff'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            <FaSignInAlt className="h-4 w-4" />
            <span>
              {loading 
                ? 'Authenticating...' 
                : selectedRoleTab === 'staff' 
                  ? 'Sign In to Staff Portal' 
                  : 'Sign In'}
            </span>
          </button>
        </form>

        {/* Footer Details */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
          <div className="text-sm text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Register as Student
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <span className="h-px w-16 bg-slate-200"></span>
            <span className="px-2 text-xs font-medium text-slate-400">OR</span>
            <span className="h-px w-16 bg-slate-200"></span>
          </div>
          <div>
            <Link 
              to="/register?role=admin" 
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all shadow-sm"
            >
              <FaUserShield className="h-4 w-4 text-indigo-600" />
              <span>Register as Administrator</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
