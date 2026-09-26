import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaBell, 
  FaCalendarAlt, 
  FaEnvelopeOpenText, 
  FaCheckDouble, 
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await dashboardService.getNotifications();
      setNotifications(res || []);
    } catch (err) {
      try {
        const fallback = await dashboardService.getDashboardData();
        setNotifications(fallback.notifications || []);
      } catch (e) {
        toast.error('Failed to load notifications.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await dashboardService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const getComplaintLink = (n) => {
    if (!n.complaint_id) return null;
    if (user?.role === 'admin') return '/admin/complaints';
    if (user?.role === 'staff') return '/staff/complaints';
    return `/student/complaints/${n.complaint_id}`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-outfit font-bold text-lg text-slate-800 flex items-center space-x-2.5">
              <FaBell className="text-primary-600" />
              <span>Campus Notification Center</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live updates on complaints, staff work completion alerts, and status transitions.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
              {unreadCount > 0 ? `${unreadCount} Unread` : `${notifications.length} Alerts`}
            </span>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <FaCheckDouble className="text-[10px]" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <FaEnvelopeOpenText className="h-10 w-10 mx-auto text-slate-300" />
            <p>Your notification tray is completely clear.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, idx) => {
              const isWorkCompleted = n.title && n.title.toLowerCase().includes('work completed');
              const link = getComplaintLink(n);

              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border transition-all space-y-2.5 ${
                    !n.is_read
                      ? 'bg-emerald-50/30 border-emerald-200 shadow-sm'
                      : 'bg-[#F8FAFC] border-slate-200/50 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center space-x-2">
                      {isWorkCompleted ? (
                        <FaCheckCircle className="text-emerald-500 shrink-0 text-sm" />
                      ) : (
                        <span className={`h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary-500' : 'bg-slate-300'}`}></span>
                      )}
                      <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
                      {isWorkCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Staff Resolved
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1 shrink-0 font-mono">
                      <FaCalendarAlt className="text-[10px]" />
                      <span>{n.timestamp ? new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-4">{n.message}</p>
                  
                  {link && (
                    <div className="pl-4 pt-1">
                      <Link
                        to={link}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        <span>Inspect Ticket #{n.complaint_id}</span>
                        <FaArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
