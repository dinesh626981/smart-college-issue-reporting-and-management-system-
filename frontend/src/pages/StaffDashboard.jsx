import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, complaintsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaClipboardList, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaArrowRight, 
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaBuilding,
  FaBell,
  FaTimes,
  FaCamera,
  FaFileUpload,
  FaEye,
  FaCheckDouble,
  FaCalendarAlt,
  FaInfoCircle
} from 'react-icons/fa';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed'); // 'completed', 'pending', 'all'
  
  // Quick resolution modal state
  const [activeModalComplaint, setActiveModalComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('Resolved');
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [modalImagePreview, setModalImagePreview] = useState(null);
  const [submittingModal, setSubmittingModal] = useState(false);

  // Lightbox preview for completion images
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
    } catch (err) {
      toast.error('Failed to load staff dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const openResolveModal = (complaint) => {
    setActiveModalComplaint(complaint);
    setModalStatus('Resolved');
    setModalRemarks(complaint.resolution_remarks || '');
    setModalImage(null);
    setModalImagePreview(null);
  };

  const closeResolveModal = () => {
    setActiveModalComplaint(null);
    setModalImage(null);
    setModalImagePreview(null);
  };

  const handleModalImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG and PNG formats are allowed!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be smaller than 5MB!');
      return;
    }

    setModalImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setModalImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalStatus) {
      toast.error('Please select status.');
      return;
    }

    setSubmittingModal(true);
    const formData = new FormData();
    formData.append('status', modalStatus);
    formData.append('resolution_remarks', modalRemarks);
    if (modalImage) {
      formData.append('completion_image', modalImage);
    }

    try {
      await complaintsService.updateComplaint(activeModalComplaint.id, formData, true);
      toast.success('Work marked as Completed! Admin has been directly notified.');
      closeResolveModal();
      await fetchDashboard();
      setActiveTab('completed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task status.';
      toast.error(msg);
    } finally {
      setSubmittingModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = data?.stats || { assigned: 0, completed: 0, pending: 0 };
  const recent = data?.recent_complaints || [];
  const completedComplaints = data?.completed_complaints || recent.filter(c => ['Resolved', 'Closed'].includes(c.status));
  const pendingComplaints = data?.pending_complaints || recent.filter(c => !['Resolved', 'Closed'].includes(c.status));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  const getDisplayedList = () => {
    if (activeTab === 'completed') return completedComplaints;
    if (activeTab === 'pending') return pendingComplaints;
    return recent;
  };

  const displayedList = getDisplayedList();

  return (
    <div className="space-y-8 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3500} />

      {/* Staff Hello Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-premium">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-1/4 translate-x-1/4">
          <FaClipboardList className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30 uppercase tracking-widest">
            Campus Operations Center
          </span>
          <h2 className="font-outfit font-extrabold text-2xl sm:text-3xl">
            Welcome Back, {data?.name || user?.name || 'Staff Member'}!
          </h2>
          
          {/* Staff Login Credentials & Info Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-300">
            {user?.email && (
              <span className="inline-flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <FaEnvelope className="text-primary-400 text-[11px]" />
                <span className="font-mono">{user.email}</span>
              </span>
            )}
            {user?.phone && (
              <span className="inline-flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <FaPhoneAlt className="text-emerald-400 text-[11px]" />
                <span className="font-mono">{user.phone}</span>
              </span>
            )}
            {user?.department_name && (
              <span className="inline-flex items-center space-x-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                <FaBuilding className="text-amber-400 text-[11px]" />
                <span>{user.department_name}</span>
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            Review and resolve complaints assigned to your department. When you complete an assigned task and set its status to <strong className="text-emerald-400">Resolved</strong>, the Administrator receives an immediate direct notification with your remarks and completion proof.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/staff/complaints"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 font-bold rounded-xl text-sm shadow-glow hover:shadow-primary-600/30 transition-all"
            >
              <span>Manage Assigned Queue</span>
              <FaArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-sm transition-all"
            >
              <FaCheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Show Completed Work ({stats.completed})</span>
            </button>
          </div>
        </div>
      </div>

      {/* COUNTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { 
            id: 'all',
            label: 'Assigned Complaints', 
            count: stats.assigned, 
            color: 'border-slate-100 hover:border-slate-300', 
            icon: FaClipboardList, 
            iconColor: 'bg-slate-100 text-slate-600',
            active: activeTab === 'all'
          },
          { 
            id: 'pending',
            label: 'Pending / In Progress', 
            count: stats.pending, 
            color: 'border-amber-100 hover:border-amber-300', 
            icon: FaHourglassHalf, 
            iconColor: 'bg-amber-50 text-amber-600',
            active: activeTab === 'pending'
          },
          { 
            id: 'completed',
            label: 'Work Completed (Resolved)', 
            count: stats.completed, 
            color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20', 
            icon: FaCheckCircle, 
            iconColor: 'bg-emerald-100 text-emerald-700',
            active: activeTab === 'completed',
            badge: 'Admin Notified'
          }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              onClick={() => setActiveTab(card.id)}
              className={`p-6 rounded-3xl border shadow-premium flex items-center justify-between cursor-pointer transition-all ${
                card.active ? 'ring-2 ring-primary-500 bg-white shadow-lg' : 'bg-white'
              } ${card.color}`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                  {card.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="font-outfit text-3xl font-extrabold text-slate-800">{card.count}</p>
              </div>
              <div className={`p-3 rounded-2xl ${card.iconColor}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* WORK MANAGEMENT CONTAINER (TABS & DISPLAY) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-outfit font-bold text-lg text-slate-800 flex items-center space-x-2">
              {activeTab === 'completed' && <FaCheckCircle className="text-emerald-500" />}
              {activeTab === 'pending' && <FaHourglassHalf className="text-amber-500" />}
              {activeTab === 'all' && <FaClipboardList className="text-primary-600" />}
              <span>
                {activeTab === 'completed' && 'Work Completed & Resolved Tasks'}
                {activeTab === 'pending' && 'Pending Work Queue'}
                {activeTab === 'all' && 'All Assigned Tasks'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {activeTab === 'completed' && 'Assigned issues resolved by you. Admin was automatically sent direct alerts upon completion.'}
              {activeTab === 'pending' && 'Tasks waiting for action. Set status to Resolved when finished to notify Admin.'}
              {activeTab === 'all' && 'Overview of all tickets allocated to your department profile.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'completed' 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FaCheckCircle className="h-3 w-3" />
              <span>Completed ({completedComplaints.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'pending' 
                  ? 'bg-white text-slate-800 font-bold shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FaHourglassHalf className="h-3 w-3" />
              <span>Pending ({pendingComplaints.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-800 font-bold shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All ({recent.length})</span>
            </button>
          </div>
        </div>

        {/* WORK COMPLETED BANNER NOTIFICATION */}
        {activeTab === 'completed' && completedComplaints.length > 0 && (
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-900">
            <FaBell className="text-emerald-600 h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950">Direct Admin Notifications Sent:</span>
              <p className="text-emerald-800">
                Whenever you marked any of these tasks as Resolved, the Administrator was directly notified via the in-app notification center and email with your resolution remarks and uploaded proof.
              </p>
            </div>
          </div>
        )}

        {/* COMPLAINTS LIST / TABLE */}
        {displayedList.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-3">
            {activeTab === 'completed' ? (
              <>
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                  <FaCheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-600">No completed work yet.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When you troubleshoot and resolve any assigned ticket, it will appear here with proof of completion, and the Admin will be directly notified.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('pending')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  View Pending Queue
                </button>
              </>
            ) : (
              <>
                <FaClipboardList className="h-10 w-10 mx-auto text-slate-300" />
                <p>No complaints found in this view.</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">Ticket</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Issue & Location</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Status & Admin Alert</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">
                    {activeTab === 'completed' ? 'Resolution Remarks & Proof' : 'Category'}
                  </th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedList.map((c) => {
                  const isCompleted = ['Resolved', 'Closed'].includes(c.status);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 font-bold text-slate-700">#{c.id}</td>
                      <td className="py-4">
                        <div className="font-semibold text-slate-800">{c.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <FaMapMarkerAlt />
                          <span>{c.location || 'Campus'}</span>
                          {c.student_name && (
                            <span className="text-slate-300">• Reported by {c.student_name}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 space-y-1">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                        {isCompleted && (
                          <div className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-700">
                            <FaBell className="text-emerald-500 text-[10px]" />
                            <span>Admin Notified Directly</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        {isCompleted ? (
                          <div className="space-y-1.5 max-w-xs">
                            {c.resolution_remarks ? (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 line-clamp-2">
                                <span className="font-bold text-slate-700">Remarks: </span>
                                {c.resolution_remarks}
                              </p>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No remarks provided</span>
                            )}
                            {c.completion_image && (
                              <button
                                type="button"
                                onClick={() => setPreviewImageUrl(`/api/uploads/${c.completion_image}`)}
                                className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200/50"
                              >
                                <FaCamera className="text-[10px]" />
                                <span>View Completion Proof</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium text-xs">{c.category}</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => openResolveModal(c)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs transition-colors flex items-center space-x-1 shadow-sm cursor-pointer"
                            >
                              <FaCheckDouble className="text-[11px]" />
                              <span>Mark Resolved</span>
                            </button>
                          )}
                          <Link 
                            to="/staff/complaints"
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK RESOLVE / MARK WORK COMPLETED MODAL */}
      {activeModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative animate-fade-in">
            <button
              onClick={closeResolveModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
            >
              <FaTimes />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center space-x-1">
                <FaCheckCircle />
                <span>Mark Work Completed</span>
              </span>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900">
                Resolve Task #{activeModalComplaint.id}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                "{activeModalComplaint.title}"
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800 flex items-start space-x-2">
              <FaBell className="text-emerald-600 h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <strong>Notice:</strong> Marking this task as <strong>Resolved</strong> will directly notify the Administrator via in-app alerts and email.
              </span>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status *</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800 bg-white"
                >
                  <option value="In Progress">In Progress (Work started)</option>
                  <option value="Resolved">Resolved (Work completed - Notifies Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolution Remarks *</label>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  required
                  placeholder="Describe the action taken to fix this issue (e.g. replaced faulty capacitor, tightened pipes)..."
                  className="w-full px-4 py-2.5 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Completion Proof Photo <span className="text-[10px] text-slate-400 font-normal">(Optional proof for Admin)</span>
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleModalImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {modalImagePreview ? (
                    <div className="flex items-center justify-center space-x-3">
                      <img src={modalImagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                      <div className="text-left text-xs">
                        <p className="font-semibold text-slate-700">{modalImage?.name}</p>
                        <span className="text-emerald-600 font-bold">Proof image attached</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-500">
                      <FaFileUpload className="mx-auto h-6 w-6 text-slate-400" />
                      <p className="text-xs font-medium">Click to upload completion photo</p>
                      <p className="text-[10px] text-slate-400">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeResolveModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-glow disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  <FaCheckCircle className="h-3.5 w-3.5" />
                  <span>{submittingModal ? 'Submitting & Notifying...' : 'Submit & Notify Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETION IMAGE PREVIEW LIGHTBOX */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-outfit font-bold text-base text-slate-800 flex items-center space-x-2">
                <FaCamera className="text-emerald-500" />
                <span>Work Completion Proof</span>
              </h4>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-slate-100">
              <img src={previewImageUrl} alt="Proof" className="w-full h-auto object-contain max-h-[70vh]" />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
