import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';

const CATEGORIES = [
  'Electrical',
  'Water Supply',
  'Furniture',
  'Laboratory',
  'Hostel',
  'Transport',
  'Internet',
  'Cleaning',
  'Security',
  'Other'
];

const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      
      const res = await complaintsService.getComplaints(params);
      setComplaints(res);
    } catch (err) {
      toast.error('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [status, category]); // Trigger immediately when dropdowns change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
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

      {/* FILTER PANEL */}
      <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Title, Location, Student, ID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <FaSearch className="h-4 w-4" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 bg-white transition-colors text-slate-600"
            >
              <option value="">-- All Statuses --</option>
              {STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary-500 bg-white transition-colors text-slate-600"
            >
              <option value="">-- All Categories --</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Search Action Button */}
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

      {/* COMPLAINTS HISTORY LOG LISTING */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100">
        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-3">
            <FaFileAlt className="h-12 w-12 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-500">No issues found matching parameters.</p>
            <p className="text-xs text-slate-400">Try modifying search inputs or category dropdown selections.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Complaint Info</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Priority</th>
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
                        <span className="flex items-center space-x-1"><FaMapMarkerAlt className="shrink-0" /> <span className="truncate max-w-[120px]">{c.location}</span></span>
                        <span className="flex items-center space-x-1"><FaCalendarAlt className="shrink-0" /> <span>{new Date(c.created_at).toLocaleDateString()}</span></span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-semibold">{c.category}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.priority === 'High' 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : c.priority === 'Medium' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link 
                        to={`/student/complaints/${c.id}`}
                        className="px-3.5 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 font-bold text-xs transition-colors"
                      >
                        Track
                      </Link>
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

export default ComplaintHistory;
