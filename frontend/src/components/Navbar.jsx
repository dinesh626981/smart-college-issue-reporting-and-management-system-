import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'admin' 
      ? '/admin/dashboard' 
      : user.role === 'staff' 
        ? '/staff/dashboard' 
        : '/student/dashboard';
  };

  const isLandingPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact';

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-premium py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary-600 text-white rounded-xl shadow-glow transform group-hover:scale-105 transition-transform">
              <FaGraduationCap className="h-6 w-6" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-slate-800">
              Smart<span className="text-primary-600">College</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isLandingPage && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`font-medium hover:text-primary-600 transition-colors ${location.pathname === '/' ? 'text-primary-600' : 'text-slate-600'}`}>Home</Link>
              <Link to="/about" className={`font-medium hover:text-primary-600 transition-colors ${location.pathname === '/about' ? 'text-primary-600' : 'text-slate-600'}`}>About</Link>
              <Link to="/contact" className={`font-medium hover:text-primary-600 transition-colors ${location.pathname === '/contact' ? 'text-primary-600' : 'text-slate-600'}`}>Contact</Link>
            </div>
          )}

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-glow transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-6 shadow-premium transition-all">
          {isLandingPage && (
            <div className="flex flex-col space-y-4 mb-4">
              <Link to="/" className="text-slate-700 font-medium hover:text-primary-600">Home</Link>
              <Link to="/about" className="text-slate-700 font-medium hover:text-primary-600">About</Link>
              <Link to="/contact" className="text-slate-700 font-medium hover:text-primary-600">Contact</Link>
            </div>
          )}
          <div className="flex flex-col space-y-3 pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-semibold text-sm"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm shadow-glow hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
