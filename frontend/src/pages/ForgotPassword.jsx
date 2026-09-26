import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGraduationCap, FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your registered email address!');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.success('Temporary password generated and sent!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to request password reset. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 relative overflow-hidden animate-fade-in">
        {/* Glow styling */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-600/10 rounded-full filter blur-xl"></div>

        {/* Branding header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="p-2.5 bg-primary-600 text-white rounded-xl shadow-glow">
              <FaGraduationCap className="h-6 w-6" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-slate-800">
              Smart<span className="text-primary-600">College</span>
            </span>
          </Link>
          <h2 className="font-outfit font-extrabold text-2xl text-slate-900">
            Reset your Password
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            Enter your email and we'll send a temporary password.
          </p>
        </div>

        {success ? (
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
              <FaKey className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Request Sent Successfully</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                If the email is registered, we have sent a temporary password. Check your console logs if running locally.
              </p>
            </div>
            <Link
              to="/login"
              className="mt-4 w-full py-3.5 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FaArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Email or Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <FaEnvelope className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-all text-slate-800"
                  placeholder="e.g. staff@college.com or 9876543212"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow flex items-center justify-center space-x-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{loading ? 'Requesting...' : 'Request Temporary Password'}</span>
            </button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors">
                <FaArrowLeft className="h-3 w-3" />
                <span>Return to Login screen</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
