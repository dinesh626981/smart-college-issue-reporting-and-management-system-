import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsService, adminService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaClipboardList, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaEdit, 
  FaTrashAlt,
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaUserTie,
  FaSearch,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

const CATEGORIES = ['Electrical', 'Water Supply', 'Furniture', 'Laboratory', 'Hostel', 'Transport', 'Internet', 'Cleaning', 'Security', 'Other'];
const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal / Assign State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignStaff, setAssignStaff] = useState('');
  const [updateCategory, setUpdateCategory] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchStaticData = async () => {
    try {
      const depts = await adminService.getDepartments();
      setDepartments(depts);
      const staffList = await adminService.getStaff();
      setAllStaff(staffList);
    } catch (err) {
      console.error("Failed to load static datasets:", err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await complaintsService.getComplaints(params);
      setComplaints(res);
    } catch (err) {
      toast.error('Failed to load complaints registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaticData();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openAssignModal = (c) => {
    setSelectedComplaint(c);
    setAssignDept(c.department_id ? c.department_id.toString() : '');
    setAssignStaff(c.assigned_staff ? c.assigned_staff.toString() : '');
    setUpdateCategory(c.category);
    setUpdatePriority(c.priority);
    setUpdateStatus(c.status);
  };

  const closeAssignModal = () => {
    setSelectedComplaint(null);
  };

  // Filter staff options based on selected department in modal
  const getFilteredStaffOptions = () => {
    if (!assignDept) return [];
    return allStaff.filter(s => s.department_id === parseInt(assignDept));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAssign(true);

    try {
      await complaintsService.updateComplaint(selectedComplaint.id, {
        department_id: assignDept ? parseInt(assignDept) : null,
        assigned_staff: assignStaff ? parseInt(assignStaff) : null,
        category: updateCategory,
        priority: updatePriority,
        status: updateStatus
      });
      toast.success('Complaint assignments and metadata updated!');
      closeAssignModal();
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update complaint configurations.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint ticket from system archives?')) {
      return;
    }

    try {
      await complaintsService.deleteComplaint(id);
      toast.success('Complaint deleted successfully.');
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to delete complaint.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Closed':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* FILTER CONTROLS */}
      <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Title, Student Name, Location..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FaSearch className="h-4 w-4" />
            </div>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 bg-white text-slate-600"
            >
              <option value="">-- All Statuses --</option>
              {STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 bg-white text-slate-600"
            >
              <option value="">-- All Categories --</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl flex items-center justify-center font-bold shadow-sm transition-colors cursor-pointer"
            >
              <FaSearch className="h-4 w-4" />
            </button>
          </div>

        </form>
      </div>

      {/* COMPLAINTS LOG TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100">
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No complaints registered in databases.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Issue Title</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Student Info</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Allocated Staff</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 font-bold text-slate-700">#{c.id}</td>
                    <td className="py-4">
                      <div className="font-semibold text-slate-800">{c.title}</div>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center space-x-1"><FaMapMarkerAlt /> <span>{c.location}</span></span>
                        <span className="flex items-center space-x-1"><FaCalendarAlt /> <span>{new Date(c.created_at).toLocaleDateString()}</span></span>
                      </div>
                    </td>
                    <td className="py-4 font-medium text-slate-600">{c.student_name}</td>
                    <td className="py-4 text-slate-500 font-semibold">{c.category}</td>
                    <td className="py-4 text-slate-500 font-semibold">
                      <div className="flex items-center space-x-1">
                        <FaUserTie className="text-slate-300" />
                        <span>{c.assigned_staff_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2 shrink-0">
                      <Link 
                        to={`/student/complaints/${c.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                      >
                        Track
                      </Link>
                      <button 
                        onClick={() => openAssignModal(c)}
                        className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 font-bold text-xs cursor-pointer"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs cursor-pointer"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN / REASSIGN MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-premium border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-xs font-bold text-slate-400">Configure Complaint #{selectedComplaint.id}</span>
                <h4 className="font-outfit font-bold text-slate-800 truncate max-w-[280px]">{selectedComplaint.title}</h4>
              </div>
              <button onClick={closeAssignModal} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-5">
              
              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={updateCategory}
                    onChange={(e) => setUpdateCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-xl bg-white focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</label>
                  <select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 text-xs rounded-xl bg-white focus:outline-none"
                  >
                    {PRIORITIES.map(pr => (
                      <option key={pr} value={pr}>{pr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ticket Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 text-xs rounded-xl bg-white focus:outline-none"
                >
                  {STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Department Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Department</label>
                <select
                  value={assignDept}
                  onChange={(e) => { setAssignDept(e.target.value); setAssignStaff(''); }}
                  className="w-full px-3 py-2.5 border border-slate-200 text-xs rounded-xl bg-white focus:outline-none"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              {/* Staff Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Department Staff</label>
                <select
                  value={assignStaff}
                  onChange={(e) => setAssignStaff(e.target.value)}
                  disabled={!assignDept}
                  className="w-full px-3 py-2.5 border border-slate-200 text-xs rounded-xl bg-white focus:outline-none disabled:opacity-50"
                >
                  <option value="">-- Choose Technician --</option>
                  {getFilteredStaffOptions().map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
                {!assignDept && (
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Select a department first to load corresponding staff options.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="px-5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="px-5 py-2 bg-primary-600 text-white hover:bg-primary-700 font-bold rounded-xl text-xs disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageComplaints;
