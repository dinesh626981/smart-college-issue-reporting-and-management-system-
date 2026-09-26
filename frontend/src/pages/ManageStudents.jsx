import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUsers, FaUserShield, FaCalendarAlt, FaEnvelope, FaPhone, FaUserPlus } from 'react-icons/fa';

const ManageStudents = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'admins'
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const res = await adminService.getStudents();
        setStudents(res);
      } else {
        const res = await adminService.getAdmins();
        setAdmins(res);
      }
    } catch (err) {
      toast.error(`Failed to retrieve ${activeTab} records.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const currentList = activeTab === 'students' ? students : admins;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100">
        {/* Header Tabs & Actions */}
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FaUsers className="h-3.5 w-3.5" />
              <span>Students Registry</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-50 text-primary-700">
                {students.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'admins'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FaUserShield className="h-3.5 w-3.5" />
              <span>Administrators Registry</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-indigo-700">
                {admins.length}
              </span>
            </button>
          </div>

          {activeTab === 'admins' && (
            <Link
              to="/register?role=admin"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
            >
              <FaUserPlus className="h-3 w-3" />
              <span>Register New Admin</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No {activeTab} are currently registered in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">User ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Name</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Email</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Phone</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-700">#{user.id}</td>
                    <td className="py-4 font-semibold text-slate-800">{user.name}</td>
                    <td className="py-4 text-slate-500 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <FaEnvelope className="text-slate-300" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <FaPhone className="text-slate-300" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-primary-50 text-primary-700 border border-primary-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-right text-slate-400 text-xs font-semibold">
                      <div className="flex items-center justify-end space-x-1.5">
                        <FaCalendarAlt />
                        <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
