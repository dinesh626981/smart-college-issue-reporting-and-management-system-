import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserTie, FaEnvelope, FaBuilding, FaPlusCircle, FaPhone } from 'react-icons/fa';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New staff form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffAndDepts = async () => {
    try {
      const staffRes = await adminService.getStaff();
      setStaff(staffRes);
      
      const deptsRes = await adminService.getDepartments();
      setDepartments(deptsRes);
    } catch (err) {
      toast.error('Failed to load staff/departments records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndDepts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, department_id } = formData;

    if (!name || !email || !password || !department_id) {
      toast.error('Please enter all required fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createStaff(formData);
      toast.success('Department staff registered successfully!');
      setFormData({ name: '', email: '', password: '', phone: '', department_id: '' });
      fetchStaffAndDepts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create staff member.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* STAFF DIRECTORY TABLE */}
      <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex justify-between items-center mb-6">
          <h3 className="font-outfit font-bold text-lg text-slate-800 flex items-center space-x-2">
            <FaUserTie className="text-primary-600" />
            <span>Staff Directory</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
            {staff.length} Active Staff
          </span>
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : staff.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No department staff accounts registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">Staff ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Name</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Department</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Login Credentials (Email / Mobile)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-700">#{s.id}</td>
                    <td className="py-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-4 font-medium text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <FaBuilding className="text-slate-300" />
                        <span>{s.department_name || 'Unallocated'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600 font-medium">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <FaEnvelope className="text-slate-400 text-[10px]" />
                          <span>{s.email}</span>
                        </div>
                        {s.phone && (
                          <div className="flex items-center space-x-1.5 text-emerald-700 font-mono text-[11px]">
                            <FaPhone className="text-emerald-500 text-[10px]" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE STAFF ACCOUNT FORM */}
      <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 h-fit space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
          <FaPlusCircle className="text-primary-600" />
          <h3 className="font-outfit font-bold text-slate-800 text-lg">Add New Staff</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 text-slate-800"
              placeholder="e.g. Ramesh Chandra"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 text-slate-800"
              placeholder="e.g. ramesh@college.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password * (Min 8 Chars)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Phone / Mobile Number <span className="text-[10px] font-normal text-emerald-600">(For Mobile Login)</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 text-slate-800"
              placeholder="e.g. 9876543212"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Department *</label>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 text-slate-800 bg-white"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow disabled:opacity-50 text-xs transition-colors cursor-pointer"
          >
            <span>{submitting ? 'Registering...' : 'Register Staff Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageStaff;
