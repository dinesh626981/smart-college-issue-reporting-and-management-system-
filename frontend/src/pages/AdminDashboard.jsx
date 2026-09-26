import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, adminService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  FaUsers, 
  FaUserTie, 
  FaClipboardList, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaArrowRight,
  FaMapMarkerAlt,
  FaBell
} from 'react-icons/fa';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dbData, setDbData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await dashboardService.getDashboardData();
        setDbData(dashboardRes);
        
        const reportsRes = await adminService.getReports();
        setStatsData(reportsRes);
      } catch (err) {
        toast.error('Failed to load admin dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = dbData?.stats || { total_students: 0, total_staff: 0, total_complaints: 0, pending: 0, resolved: 0 };
  const recent = dbData?.recent_complaints || [];

  // --- CHARTS CONFIGURATION ---

  // 1. Complaints by Category (Pie Chart)
  const categoryData = {
    labels: Object.keys(statsData?.category_summary || {}),
    datasets: [
      {
        data: Object.values(statsData?.category_summary || {}),
        backgroundColor: [
          '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
          '#F59E0B', '#10B981', '#14B8A6', '#64748B', '#06B6D4'
        ],
        borderWidth: 1,
      }
    ]
  };

  // 2. Complaints by Department (Bar Chart)
  const departmentData = {
    labels: Object.keys(statsData?.department_summary || {}),
    datasets: [
      {
        label: 'Issues Count',
        data: Object.values(statsData?.department_summary || {}),
        backgroundColor: '#2563EB',
        borderRadius: 8,
      }
    ]
  };

  // 3. Monthly complaints trend (Line Chart)
  const monthlyData = {
    labels: Object.keys(statsData?.monthly_summary || {}),
    datasets: [
      {
        label: 'Tickets Raised',
        data: Object.values(statsData?.monthly_summary || {}),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#6366F1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 10, family: 'Outfit' }, boxWidth: 12 }
      }
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
    <div className="space-y-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* METRIC COUNTER CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Students', count: stats.total_students, color: 'border-slate-100', icon: FaUsers, iconColor: 'bg-indigo-50 text-indigo-600' },
          { label: 'Total Staff', count: stats.total_staff, color: 'border-slate-100', icon: FaUserTie, iconColor: 'bg-sky-50 text-sky-600' },
          { label: 'Total Complaints', count: stats.total_complaints, color: 'border-slate-100', icon: FaClipboardList, iconColor: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Action', count: stats.pending, color: 'border-amber-100', icon: FaHourglassHalf, iconColor: 'bg-amber-50 text-amber-600' },
          { label: 'Resolved Tickets', count: stats.resolved, color: 'border-emerald-100', icon: FaCheckCircle, iconColor: 'bg-emerald-50 text-emerald-600' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`bg-white p-5 rounded-3xl border ${card.color} shadow-premium flex items-center justify-between`}>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="font-outfit text-2xl font-extrabold text-slate-800">{card.count}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* REAL-TIME STAFF WORK NOTIFICATION FEED FOR ADMIN */}
      {dbData?.notifications && dbData.notifications.length > 0 && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-premium border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FaBell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-base text-slate-800">
                  Staff Work Completion & Operations Alerts
                </h3>
                <p className="text-xs text-slate-400">
                  Live notifications triggered when department staff members complete assigned work.
                </p>
              </div>
            </div>
            <Link
              to="/admin/notifications"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <span>Notification Center</span>
              <FaArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dbData.notifications.slice(0, 4).map((n, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:bg-white hover:border-emerald-300 transition-all space-y-2 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <h4 className="font-bold text-xs text-slate-800">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.complaint_id && (
                  <div className="pt-1 flex items-center justify-between">
                    <Link
                      to="/admin/complaints"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                    >
                      <span>Review Ticket #{n.complaint_id}</span>
                      <FaArrowRight className="h-2.5 w-2.5" />
                    </Link>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                      Staff Resolved
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS GRAPH LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Pie: Category */}
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-4">
          <h4 className="font-outfit font-bold text-sm text-slate-800">Complaints by Category</h4>
          <div className="h-64 relative">
            <Pie data={categoryData} options={chartOptions} />
          </div>
        </div>

        {/* Bar: Departments */}
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-4">
          <h4 className="font-outfit font-bold text-sm text-slate-800">Complaints by Department</h4>
          <div className="h-64 relative">
            <Bar data={departmentData} options={chartOptions} />
          </div>
        </div>

        {/* Line: Monthly Trend */}
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-4 md:col-span-2 lg:col-span-1">
          <h4 className="font-outfit font-bold text-sm text-slate-800">Monthly Registration Trend</h4>
          <div className="h-64 relative">
            <Line data={monthlyData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* RECENT COMPLAINTS SUMMARY LIST */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-outfit font-bold text-base text-slate-800">Latest Registered Issues</h3>
          <Link to="/admin/complaints" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1">
            <span>Manage All Tickets</span>
            <FaArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No complaints logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Complaint Title</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Category</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Student Name</th>
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
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <FaMapMarkerAlt />
                        <span>{c.location}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{c.category}</td>
                    <td className="py-4 text-slate-600 font-medium">{c.student_name}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link 
                        to={`/student/complaints/${c.id}`} // Resolves details correctly
                        className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 font-semibold text-xs transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEFAULT SYSTEM ACCOUNTS & ACCESS CARD */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl shadow-premium text-white border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h3 className="font-outfit font-bold text-base text-white flex items-center space-x-2">
              <span className="p-1.5 bg-indigo-500/30 rounded-lg text-indigo-300">
                <FaUserTie className="h-4 w-4" />
              </span>
              <span>Default System Credentials & Quick Access</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pre-configured demo accounts for all roles with 1-click fill on the login page.
            </p>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all text-center"
          >
            Go to Login Form &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin Account */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-indigo-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Administrator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">Active</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <p className="text-slate-200"><span className="text-slate-400">Email:</span> admin@college.com</p>
              <p className="text-slate-200"><span className="text-slate-400">Pass:</span> admin123</p>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">Full system control, staff & department management.</p>
          </div>

          {/* Student Account */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-blue-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Student</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30">Active</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <p className="text-slate-200"><span className="text-slate-400">Email:</span> student@college.com</p>
              <p className="text-slate-200"><span className="text-slate-400">Pass:</span> student123</p>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">Raise complaints, track status, and chat with AI.</p>
          </div>

          {/* Staff Account */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-emerald-400/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Department Staff</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">Active</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              <p className="text-slate-200"><span className="text-slate-400">Email:</span> staff@college.com</p>
              <p className="text-slate-200"><span className="text-slate-400">Mobile:</span> 9876543212</p>
              <p className="text-slate-200"><span className="text-slate-400">Pass:</span> staff123</p>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">Resolve assigned tickets and update statuses.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
