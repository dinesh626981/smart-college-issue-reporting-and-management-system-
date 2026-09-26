import { useState, useEffect } from 'react';
import { feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStar, FaEnvelopeOpenText, FaChartLine } from 'react-icons/fa';

const FeedbackPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (user?.role === 'admin') {
        try {
          const res = await feedbackService.getAllFeedback();
          setData(res);
        } catch (err) {
          toast.error('Failed to load system feedbacks.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-premium">
        <FaStar className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <p className="font-outfit font-bold text-slate-800">Issue Feedback System</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Students submit rating feedback directly upon complaint resolution under the "Track Ticket" page.
        </p>
      </div>
    );
  }

  const feedbacks = data?.feedbacks || [];
  const avgRating = data?.average_rating || 0.0;
  const count = data?.total_feedback_count || 0;

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* METRICS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average System Rating</p>
            <p className="font-outfit text-3xl font-extrabold text-slate-800">{avgRating} / 5.0</p>
          </div>
          <div className="flex space-x-0.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'text-amber-500' : 'text-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Feedbacks</p>
            <p className="font-outfit text-3xl font-extrabold text-slate-800">{count}</p>
          </div>
          <div className="p-3 rounded-2xl bg-primary-50 text-primary-600">
            <FaChartLine className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FEEDBACK LIST */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100">
        <h3 className="font-outfit font-bold text-lg text-slate-800 pb-4 border-b border-slate-100 mb-6">User Reviews & Comments</h3>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <FaEnvelopeOpenText className="h-10 w-10 mx-auto text-slate-300" />
            <p>No feedback reviews received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((f) => (
              <div key={f.id} className="p-5 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-4 hover:border-slate-300 hover:bg-white transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">Complaint ID #{f.complaint_id}</span>
                    <h4 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{f.complaint_title}</h4>
                  </div>
                  <div className="flex space-x-0.5 text-amber-500 shrink-0">
                    {[...Array(5)].map((_, idx) => (
                      <FaStar key={idx} className={`h-3 w-3 ${idx < f.rating ? 'text-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{f.comment || 'No review comment provided.'}"
                </p>
                
                <p className="text-[9px] text-slate-400 font-semibold text-right">
                  {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
