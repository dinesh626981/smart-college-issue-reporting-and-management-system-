import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaSave, FaIdCard } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Profile details state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [updatingDetails, setUpdatingDetails] = useState(false);

  // Password details state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name) {
      toast.error('Name field cannot be left blank!');
      return;
    }

    setUpdatingDetails(true);
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone
      });
      toast.success('Profile details updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update details.';
      toast.error(msg);
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All fields are required to update password!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must contain at least 8 characters!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match. Please verify.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateProfile({
        current_password: currentPassword,
        new_password: newPassword
      });
      toast.success('Your account password was updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed. Double-check current password.';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ACCOUNT SUMMARY ROW */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-3xl bg-primary-600 text-white flex items-center justify-center font-bold text-2xl shadow-glow">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="font-outfit font-bold text-xl text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-400 font-semibold">{user?.email}</p>
          </div>
        </div>
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-100">
          Account Role: {user?.role}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* EDIT DETAILS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
            <FaIdCard className="text-primary-600" />
            <h3 className="font-outfit font-bold text-slate-800 text-lg">Modify Personal Details</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-400 bg-slate-50 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {user?.role === 'staff' && user?.department_name && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Department</label>
                <input
                  type="text"
                  value={user?.department_name}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={updatingDetails}
              className="w-full py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer"
            >
              <FaSave className="h-3.5 w-3.5" />
              <span>{updatingDetails ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
            <FaLock className="text-primary-600" />
            <h3 className="font-outfit font-bold text-slate-800 text-lg">Change Security Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password (Min 8 Chars)</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer"
            >
              <FaLock className="h-3.5 w-3.5" />
              <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
