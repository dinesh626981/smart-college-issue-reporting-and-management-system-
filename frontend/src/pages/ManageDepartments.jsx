import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBuilding, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [deptName, setDeptName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await adminService.getDepartments();
      setDepartments(res);
    } catch (err) {
      toast.error('Failed to load departments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName || !deptName.trim()) {
      toast.error('Please enter a valid department name.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createDepartment(deptName);
      toast.success('Department created successfully!');
      setDeptName('');
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create department.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? Any associated staff assignments will be cleared.')) {
      return;
    }

    try {
      await adminService.deleteDepartment(id);
      toast.success('Department deleted successfully.');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to delete department.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* DEPARTMENT LIST */}
      <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex justify-between items-center mb-6">
          <h3 className="font-outfit font-bold text-lg text-slate-800 flex items-center space-x-2">
            <FaBuilding className="text-primary-600" />
            <span>Campus Departments</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
            {departments.length} Total
          </span>
        </div>

        {loading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No departments defined in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">Dept ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Department Name</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-700">#{d.id}</td>
                    <td className="py-4 font-semibold text-slate-800">{d.department_name}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <FaTrashAlt className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE DEPARTMENT FORM */}
      <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 h-fit space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
          <FaPlusCircle className="text-primary-600" />
          <h3 className="font-outfit font-bold text-slate-800 text-lg">Create Department</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Name *</label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 text-slate-800"
              placeholder="e.g. Electrical Department"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow disabled:opacity-50 text-xs transition-colors cursor-pointer"
          >
            <span>{submitting ? 'Creating...' : 'Create Department'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageDepartments;
