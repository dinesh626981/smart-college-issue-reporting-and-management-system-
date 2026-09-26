import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaGraduationCap, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaUserPlus, 
  FaUserShield, 
  FaKey,
  FaInfoCircle
} from 'react-icons/fa';

const Register = ({ defaultRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read role from query param (?role=admin) or prop
  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'admin' || defaultRole === 'admin' ? 'admin' : 'student';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = new URLSearchParams(location.search).get('role');
    if (roleParam === 'admin' || defaultRole === 'admin') {
      setRole('admin');
    }
  }, [location.search, defaultRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, adminCode } = formData;

    // Field Validations
    if (!name || !email || !password || !confirmPassword) {
      toast.error('All asterisked fields are required.');
      return;
    }

    if (role === 'admin' && !adminCode) {
      toast.error('Admin Security Key is required for administrator registration.');
      return;
    }

    const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please supply a valid email address.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name, email, password, phone, role, adminCode);
      toast.success(
        role === 'admin' 
          ? 'Administrator account created successfully! Redirecting to login...' 
          : 'Registration successful! Redirecting to login...'
      );
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      let msg = 'Registration failed. Please try again.';
      
      if (!error.response) {
        msg = 'Unable to connect to the server. Please ensure the backend is running.';
      } else {
        msg = error.response?.data?.message || 
              error.response?.data?.error?.message || 
              `Registration failed with status ${error.response.status}`;
      }
      
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden animate-fade-in">
        {/* Glowing backgrounds */}
        <div className={`absolute -top-10 -right-10 w-28 h-28 ${role === 'admin' ? 'bg-indigo-500/15' : 'bg-primary-600/10'} rounded-full filter blur-xl transition-all`}></div>

        {/* Header logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className={`p-2.5 ${role === 'admin' ? 'bg-indigo-600' : 'bg-primary-600'} text-white rounded-xl shadow-glow transition-colors`}>
              {role === 'admin' ? <FaUserShield className="h-6 w-6" /> : <FaGraduationCap className="h-6 w-6" />}
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-slate-800">
              Smart<span className={role === 'admin' ? 'text-indigo-600' : 'text-primary-600'}>College</span>
            </span>
          </Link>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900">
            {role === 'admin' ? 'Administrator Registration' : 'Student Registration'}
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            {role === 'admin' 
              ? 'Create an admin account to oversee complaints, manage staff and departments.'
              : 'Create an account to report and track campus issues.'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              role === 'student'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaGraduationCap className="h-3.5 w-3.5" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FaUserShield className="h-3.5 w-3.5" />
            <span>Administrator</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Admin Security Key (Only shown for Admin role) */}
          {role === 'admin' && (
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Admin Security Key *
                </label>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <FaInfoCircle className="h-2.5 w-2.5 mr-1" />
                  Default: admin123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-500">
                  <FaKey className="h-3.5 w-3.5" />
                </div>
                <input
                  type="password"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  required={role === 'admin'}
                  className="block w-full pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="Enter security key (admin123)"
                />
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FaUser className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-800"
                placeholder={role === 'admin' ? "e.g. Dr. Rajesh Kumar" : "e.g. Rahul Sharma"}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FaEnvelope className="h-3.5 w-3.5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-800"
                placeholder={role === 'admin' ? "e.g. admin.rajesh@college.com" : "e.g. rahul@student.college.com"}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FaPhone className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-800"
                placeholder="e.g. +91 9876543210"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FaLock className="h-3.5 w-3.5" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-800"
                  placeholder="Min 8 chars"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FaLock className="h-3.5 w-3.5" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white shadow-glow flex items-center justify-center space-x-2 disabled:opacity-50 transition-all cursor-pointer ${
              role === 'admin' 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25' 
                : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/25'
            }`}
          >
            {role === 'admin' ? <FaUserShield className="h-4 w-4" /> : <FaUserPlus className="h-4 w-4" />}
            <span>
              {loading 
                ? 'Creating Account...' 
                : role === 'admin' 
                  ? 'Register as Administrator' 
                  : 'Register Student Account'}
            </span>
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center text-sm text-slate-500 mt-4">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
