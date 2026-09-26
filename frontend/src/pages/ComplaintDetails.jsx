import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintsService, feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaUserTie, 
  FaExclamationTriangle,
  FaStar,
  FaImage,
  FaRegCheckCircle,
  FaBrain
} from 'react-icons/fa';

// Base API URL for images
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Status Explanation state
  const [statusExplanation, setStatusExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      const data = await complaintsService.getComplaintDetails(id);
      setComplaint(data);
      // Check if feedback already exists for this complaint
      if (data.status === 'Resolved' || data.status === 'Closed') {
        // If there's an associated feedback in data, we can disable submission
        // We'll see if the feedback is returned or checked via custom database lookup.
        // We can check if any feedback is listed (we added relationship in model and can filter or fetch)
      }
    } catch (err) {
      toast.error('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleCloseTicket = async () => {
    try {
      await complaintsService.updateComplaint(complaint.id, { status: 'Closed' });
      toast.success('Complaint ticket closed successfully.');
      fetchComplaintDetails();
    } catch (err) {
      toast.error('Failed to close the ticket.');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await feedbackService.submitFeedback({
        complaint_id: complaint.id,
        rating,
        comment
      });
      toast.success('Thank you for your feedback ratings!');
      setFeedbackSubmitted(true);
      fetchComplaintDetails();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback.';
      toast.error(msg);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleExplainStatus = async () => {
    setLoadingExplanation(true);
    try {
      // Use dynamic import or existing aiService from '../services/api'
      const { aiService } = await import('../services/api');
      const res = await aiService.explainStatus(complaint.id);
      setStatusExplanation(res.explanation);
    } catch (err) {
      toast.error('Failed to get status explanation from AI.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-premium">
        <p className="text-slate-500">Complaint not found!</p>
        <Link to="/student/dashboard" className="text-primary-600 font-semibold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Tracking Timeline steps configuration
  const steps = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentStepIndex = steps.indexOf(complaint.status);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Back button */}
      <div>
        <Link 
          to={user.role === 'student' ? '/student/complaints' : user.role === 'staff' ? '/staff/complaints' : '/admin/complaints'} 
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          <span>Back to List</span>
        </Link>
      </div>

      {/* Main card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Issue Info & Timeline */}
        <div className="lg:col-span-7 space-y-8">
          {/* Issue Details Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400">Issue ID #{complaint.id}</span>
                <h2 className="font-outfit font-extrabold text-2xl text-slate-800 leading-tight">{complaint.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                complaint.priority === 'High' 
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : complaint.priority === 'Medium' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
              }`}>
                {complaint.priority} Priority
              </span>
            </div>

            {/* Meta attributes */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-slate-400 shrink-0" />
                <span>Raised: {new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-slate-400 shrink-0" />
                <span className="truncate">Loc: {complaint.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-400">Category:</span>
                <span>{complaint.category}</span>
              </div>
              {complaint.department_name && (
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-400">Department:</span>
                  <span className="truncate">{complaint.department_name}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                {complaint.description}
              </p>
            </div>

            {/* Assigned Staff profile details */}
            {complaint.assigned_staff_name && (
              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-primary-600 text-white rounded-xl">
                    <FaUserTie className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Assigned Technician / Staff</p>
                    <p className="text-sm font-bold text-slate-800">{complaint.assigned_staff_name}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">Support Staff</span>
              </div>
            )}
          </div>

          {/* AI ANALYSIS CARD */}
          {(user.role === 'admin' || user.role === 'staff') && complaint.ai_analysis && (
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8 rounded-3xl shadow-premium border border-indigo-100 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-indigo-100/50">
                <FaBrain className="text-indigo-600 h-5 w-5" />
                <h3 className="font-outfit font-bold text-lg text-indigo-900">AI Analysis Dashboard</h3>
              </div>
              
              {/* Report Quality & Duplicate Warning */}
              <div className="flex flex-wrap gap-2 mt-2">
                {complaint.ai_analysis.report_quality_status && complaint.ai_analysis.report_quality_status !== 'Valid' && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Quality: {complaint.ai_analysis.report_quality_status}
                  </span>
                )}
                {complaint.ai_analysis.is_duplicate && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                    Possible Duplicate of #{complaint.ai_analysis.duplicate_of}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                  <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">Suggested Priority</span>
                  <span className="font-semibold text-slate-800">{complaint.ai_analysis.urgency || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">Suggested Department</span>
                  <span className="font-semibold text-slate-800">{complaint.ai_analysis.suggested_department || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">Confidence</span>
                  <span className="font-semibold text-slate-800">
                    {complaint.ai_analysis.confidence ? `${Math.round(complaint.ai_analysis.confidence * 100)}%` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Category</span>
                  <span className="font-semibold text-slate-800">{complaint.ai_analysis.category || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1 mt-4 pt-4 border-t border-indigo-100/50">
                <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Summary</span>
                <p className="text-sm text-slate-600 italic">
                  "{complaint.ai_analysis.summary}"
                </p>
              </div>

              {complaint.ai_analysis.missing_information && (
                <div className="space-y-1 mt-4 pt-4 border-t border-indigo-100/50">
                  <span className="block text-xs font-bold text-amber-500 uppercase tracking-wider">Missing Information Detected</span>
                  <p className="text-sm text-slate-600">
                    {complaint.ai_analysis.missing_information}
                  </p>
                </div>
              )}
              
              {complaint.ai_analysis.report_quality_reason && complaint.ai_analysis.report_quality_status !== 'Valid' && (
                <div className="space-y-1 mt-4 pt-4 border-t border-indigo-100/50">
                  <span className="block text-xs font-bold text-amber-600 uppercase tracking-wider">Quality Analysis Reason</span>
                  <p className="text-sm text-slate-600">
                    {complaint.ai_analysis.report_quality_reason}
                  </p>
                </div>
              )}

              {complaint.ai_analysis.recommended_action && (
                <div className="space-y-1 mt-4 pt-4 border-t border-indigo-100/50">
                  <span className="block text-xs font-bold text-emerald-500 uppercase tracking-wider">Recommended Initial Action</span>
                  <p className="text-sm text-slate-600">
                    {complaint.ai_analysis.recommended_action}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TIMELINE TRACKING STATUS WORKFLOW */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-outfit font-bold text-lg text-slate-800">Progress Tracker</h3>
              {user.role === 'student' && (
                <button 
                  onClick={handleExplainStatus}
                  disabled={loadingExplanation}
                  className="flex items-center space-x-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  <FaBrain className={loadingExplanation ? 'animate-pulse' : ''} />
                  <span>{loadingExplanation ? 'AI Thinking...' : 'AI Explain Status'}</span>
                </button>
              )}
            </div>

            {statusExplanation && (
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl space-y-2 mb-4">
                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider block">AI Status Explanation</span>
                <p className="text-sm text-primary-800 italic">{statusExplanation}</p>
              </div>
            )}
            
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;
                
                return (
                  <div key={step} className="relative flex items-start space-x-4">
                    {/* Circle Icon Indicator */}
                    <span className={`absolute -left-6 top-1 h-4.5 w-4.5 rounded-full border-2 ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : isCurrent 
                          ? 'bg-primary-500 border-primary-500 animate-ping-slow' 
                          : 'bg-white border-slate-300'
                    }`}></span>

                    <div>
                      <h4 className={`text-sm font-bold capitalize ${
                        isCompleted 
                          ? 'text-emerald-600' 
                          : isCurrent 
                            ? 'text-primary-600' 
                            : 'text-slate-400'
                      }`}>
                        {step}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {step === 'Pending' && 'Issue recorded on the central database.'}
                        {step === 'Assigned' && complaint.assigned_staff_name && `Ticket assigned to ${complaint.assigned_staff_name}.`}
                        {step === 'Assigned' && !complaint.assigned_staff_name && 'Central admin is allocating a department staff.'}
                        {step === 'In Progress' && 'Assigned staff is working on a fix.'}
                        {step === 'Resolved' && 'Resolution proof uploaded. Pending student review.'}
                        {step === 'Closed' && 'Issue completely resolved and ticket archived.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Images, Resolution Remarks & Feedback Form */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Photos Proof Card */}
          <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-6">
            <h3 className="font-outfit font-bold text-lg text-slate-800 flex items-center space-x-2">
              <FaImage className="text-primary-600" />
              <span>Image Proofs</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Initial image */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400">Raised Issue Image</p>
                {complaint.image ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-44 shadow-sm bg-slate-50">
                    <img 
                      src={`${API_URL}/uploads/${complaint.image}`} 
                      alt="Complaint" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200/50">No image attached by student.</p>
                )}
              </div>

              {/* Completion image */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400">Resolution Work Image</p>
                {complaint.completion_image ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 h-44 shadow-sm bg-slate-50">
                    <img 
                      src={`${API_URL}/uploads/${complaint.completion_image}`} 
                      alt="Resolution" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200/50">No completion image uploaded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Staff Resolution Remarks Card */}
          {complaint.resolution_remarks && (
            <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-4">
              <h3 className="font-outfit font-bold text-slate-800 flex items-center space-x-2">
                <FaRegCheckCircle className="text-emerald-500" />
                <span>Technician Remarks</span>
              </h3>
              <p className="text-xs text-slate-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 leading-relaxed italic">
                "{complaint.resolution_remarks}"
              </p>
            </div>
          )}

          {/* STUDENT FEEDBACK CARD & CLOSE ACTION */}
          {user.role === 'student' && complaint.status === 'Resolved' && (
            <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 space-y-6">
              <div className="space-y-1">
                <h3 className="font-outfit font-bold text-lg text-slate-800">Close Complaint Ticket</h3>
                <p className="text-xs text-slate-400 font-medium">Verify that the issue is successfully resolved.</p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseTicket}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-colors"
              >
                <FaCheckCircle className="h-4 w-4" />
                <span>Mark Issue Resolved & Close Ticket</span>
              </button>

              {/* Feedback Form */}
              {!feedbackSubmitted ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submit Review Feedback</h4>
                  
                  {/* Stars input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Rating (1 to 5 Stars)</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-2xl focus:outline-none cursor-pointer transform hover:scale-110 transition-transform"
                        >
                          <FaStar className={star <= rating ? 'text-amber-500' : 'text-slate-200'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Comments</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                      placeholder="Add comments about resolution speed or quality..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow disabled:opacity-50 transition-colors"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-800 text-center">
                  Feedback submitted successfully. Thank you!
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ComplaintDetails;
