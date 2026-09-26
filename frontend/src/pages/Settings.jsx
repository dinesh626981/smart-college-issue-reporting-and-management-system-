import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCog, FaLock, FaBell, FaDatabase, FaShieldAlt } from 'react-icons/fa';

const Settings = () => {
  const handleSave = () => {
    toast.success('System configurations saved successfully.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
          <FaCog className="text-primary-600 animate-spin" />
          <h3 className="font-outfit font-bold text-slate-800 text-lg">System Administration Settings</h3>
        </div>

        <div className="space-y-6">
          {/* General Security Config */}
          <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl mt-0.5">
              <FaShieldAlt className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Security & Access Thresholds</h4>
              <p className="text-xs text-slate-500">Configure JWT token durations, invalid password attempt lockouts, and active session boundaries.</p>
              <div className="pt-2 flex items-center space-x-2">
                <input type="checkbox" defaultChecked id="enable_lockout" className="rounded border-slate-300" />
                <label htmlFor="enable_lockout" className="text-[11px] font-semibold text-slate-600 select-none">Enable 5-attempt Account Lockout</label>
              </div>
            </div>
          </div>

          {/* Database parameters */}
          <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
              <FaDatabase className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Database & Upload Storage</h4>
              <p className="text-xs text-slate-500">Manage local uploads cache directories, MySQL connections indexes, and clear expired files.</p>
              <button 
                type="button"
                onClick={() => toast.info('Cache files cleared successfully.')}
                className="mt-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg text-[10px] hover:bg-slate-50 cursor-pointer"
              >
                Clear File System Upload Cache
              </button>
            </div>
          </div>

          {/* Notification parameters */}
          <div className="flex items-start space-x-4 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl mt-0.5">
              <FaBell className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">Notification Dispatches</h4>
              <p className="text-xs text-slate-500">Toggle system email alert services and dynamic app push reminders.</p>
              <div className="pt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <input type="checkbox" defaultChecked id="alert_emails" className="rounded" />
                  <label htmlFor="alert_emails" className="text-[11px] font-semibold text-slate-600 select-none">Ticket Assignment Emails</label>
                </div>
                <div className="flex items-center space-x-1">
                  <input type="checkbox" defaultChecked id="resolve_emails" className="rounded" />
                  <label htmlFor="resolve_emails" className="text-[11px] font-semibold text-slate-600 select-none">Resolution Completion Emails</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Save Settings Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
