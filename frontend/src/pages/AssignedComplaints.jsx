import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintsService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaClipboardList, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaEdit, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaTimes,
  FaFileUpload,
  FaRegLightbulb,
  FaBell
} from 'react-icons/fa';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected complaint for updating status
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [completionImage, setCompletionImage] = useState(null);
  const [completionImagePreview, setCompletionImagePreview] = useState(null);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const res = await complaintsService.getComplaints();
      setComplaints(res);
    } catch (err) {
      toast.error('Failed to load assigned complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const openUpdateModal = (c) => {
    setActiveComplaint(c);
    setUpdateStatus(c.status === 'Pending' || c.status === 'Assigned' ? 'In Progress' : c.status);
    setUpdateRemarks(c.resolution_remarks || '');
    setCompletionImage(null);
    setCompletionImagePreview(null);
  };

  const closeUpdateModal = () => {
    setActiveComplaint(null);
  };

  const handleImageChange = (e) => {
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

    setCompletionImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompletionImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateStatus) {
      toast.error('Please select a valid progress status.');
      return;
    }

    setSubmittingUpdate(true);

    // Prepare Multipart form data
    const updateData = new FormData();
    updateData.append('status', updateStatus);
    updateData.append('resolution_remarks', updateRemarks);
    if (completionImage) {
      updateData.append('completion_image', completionImage);
    }

    try {
      await complaintsService.updateComplaint(activeComplaint.id, updateData, true);
      if (updateStatus === 'Resolved') {
        toast.success('Work marked as Completed! Admin has been directly notified.');
      } else {
        toast.success('Complaint status updated successfully!');
      }
      closeUpdateModal();
      fetchAssigned();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.';
      toast.error(msg);
    } finally {
      setSubmittingUpdate(false);
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

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100">
        <h3 className="font-outfit font-bold text-lg text-slate-800 pb-4 border-b border-slate-100 mb-6">Assigned Complaint List</h3>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm space-y-2">
            <FaClipboardList className="h-10 w-10 mx-auto text-slate-300" />
            <p>No complaints assigned to your account at this moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-3">
                  <th className="pb-3 text-xs uppercase tracking-wider">ID</th>
                  <th className="pb-3 text-xs uppercase tracking-wider">Issue Title</th>
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
                        <span className="flex items-center space-x-1"><FaMapMarkerAlt /> <span>{c.location}</span></span>
                        <span className="flex items-center space-x-1"><FaCalendarAlt /> <span>{new Date(c.created_at).toLocaleDateString()}</span></span>
                      </div>
                    </td>
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
                    <td className="py-4 text-right space-x-2">
                      <Link
                        to={`/student/complaints/${c.id}`} // Same details tracking page
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                      >
                        Track
                      </Link>
                      
                      {c.status !== 'Resolved' && c.status !== 'Closed' && (
                        <button 
                          onClick={() => openUpdateModal(c)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE MODAL POPUP */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-premium border border-slate-100 overflow-hidden relative animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400">Update Issue Ticket #{activeComplaint.id}</span>
                <h4 className="font-outfit font-bold text-slate-800 text-base truncate max-w-[300px]">{activeComplaint.title}</h4>
              </div>
              <button 
                onClick={closeUpdateModal}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-6">
              
              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Progress Status *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 bg-white"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved (Troubleshoot Completed)</option>
                </select>
                {updateStatus === 'Resolved' && (
                  <p className="mt-1.5 text-xs text-emerald-700 font-medium flex items-center space-x-1.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <FaBell className="text-emerald-500 shrink-0" />
                    <span>Setting status to <strong>Resolved</strong> will directly notify the Administrator with your remarks and proof.</span>
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolution Remarks *</label>
                <textarea
                  value={updateRemarks}
                  onChange={(e) => setUpdateRemarks(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 resize-none text-slate-800"
                  placeholder="Explain actions taken to resolve this complaint..."
                ></textarea>
              </div>

              {/* Upload Proof */}
              {updateStatus === 'Resolved' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Completion Photo Proof</label>
                  <div className="flex items-center gap-6">
                    <label className="px-4 py-2 border border-dashed border-slate-300 rounded-lg hover:border-primary-500 flex items-center space-x-2 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer text-xs font-semibold">
                      <FaFileUpload />
                      <span>{completionImage ? 'Change Proof' : 'Upload Proof'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {completionImagePreview && (
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                        <img src={completionImagePreview} alt="Proof" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setCompletionImage(null); setCompletionImagePreview(null); }}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 text-[8px] font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUpdate}
                  className="px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 hover:shadow-glow font-bold rounded-xl text-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submittingUpdate ? 'Submitting...' : 'Save Progress Update'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssignedComplaints;
