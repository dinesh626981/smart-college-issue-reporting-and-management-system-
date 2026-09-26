import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIChatbot from '../components/AIChatbot';
import { 
  FaClipboardList, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPlusCircle, 
  FaBell, 
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res);
      } catch (err) {
        toast.error('Failed to load student dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, pending: 0, resolved: 0, closed: 0 };
  const recent = data?.recent_complaints || [];
  const notifications = data?.notifications || [];

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
    <div className="space-y-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-glow">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
          <FaClipboardList className="w-80 h-80" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl">Hello, {data?.name || 'Student'}!</h2>
          <p className="text-sm text-primary-100 leading-relaxed">
            Report any campus electrical, plumbing, furniture, hostel, or laboratory issues instantly. Our Naive Bayes predictive AI is active to speed up categorization.
          </p>
          <div className="pt-2">
            <Link
              to="/student/raise-complaint"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-primary-600 hover:bg-slate-50 font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              <FaPlusCircle className="h-4 w-4" />
              <span>File a New Complaint</span>
            </Link>
          </div>
        </div>
      </div>

      {/* COUNTER CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Complaints', count: stats.total, color: 'border-slate-100', icon: FaClipboardList, iconColor: 'bg-slate-100 text-slate-600' },
          { label: 'Pending / Active', count: stats.pending, color: 'border-amber-100', icon: FaHourglassHalf, iconColor: 'bg-amber-50 text-amber-600' },
          { label: 'Resolved Issues', count: stats.resolved, color: 'border-emerald-100', icon: FaCheckCircle, iconColor: 'bg-emerald-50 text-emerald-600' },
          { label: 'Closed Tickets', count: stats.closed, color: 'border-slate-100', icon: FaTimesCircle, iconColor: 'bg-slate-50 text-slate-400' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`bg-white p-6 rounded-3xl border ${card.color} shadow-premium flex items-center justify-between`}>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-800">{card.count}</p>
              </div>
              <div className={`p-3 rounded-2xl ${card.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RECENT COMPLAINTS TABLE */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-outfit font-bold text-lg text-slate-800">My Recent Filings</h3>
            <Link to="/student/complaints" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1">
              <span>View All History</span>
              <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm space-y-2">
              <FaClipboardList className="h-10 w-10 mx-auto text-slate-300" />
              <p>No complaints raised yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                    <th className="pb-3 text-xs uppercase tracking-wider">Complaint ID</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Issue Title</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Category</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-700">#{c.id}</td>
                      <td className="py-4">
                        <div className="font-semibold text-slate-800">{c.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <FaMapMarkerAlt className="shrink-0" />
                          <span>{c.location}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500 font-medium">{c.category}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <Link 
                          to={`/student/complaints/${c.id}`}
                          className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 font-semibold text-xs transition-colors"
                        >
                          Track Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS BOX */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-premium border border-slate-100 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-outfit font-bold text-lg text-slate-800 flex items-center space-x-2">
                <FaBell className="h-5 w-5 text-primary-600 animate-bounce" />
                <span>Recent Updates</span>
              </h3>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {notifications.map((n, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                    <span className="text-[9px] text-slate-400 flex items-center space-x-1 font-semibold">
                      <FaCalendarAlt />
                      <span>
                        {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : 'Just now'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <AIChatbot />
    </div>
  );
};

export default StudentDashboard;
