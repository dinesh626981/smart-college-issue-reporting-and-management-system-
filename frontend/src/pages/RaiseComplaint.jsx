import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsService, aiService } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlusCircle, FaBrain, FaFileUpload, FaMapMarkerAlt, FaFileAlt, FaInfoCircle } from 'react-icons/fa';

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

const PRIORITIES = ['Low', 'Medium', 'High'];

const RaiseComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'Medium'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // AI predicting state
  const [predicting, setPredicting] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  // Auto-predict category when user finishes writing a description (more than 15 chars)
  // We use a small delay (debounce) to avoid flooding the API while typing
  useEffect(() => {
    if (formData.description.length < 15) {
      setAiSuggested(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleAutoPredict();
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.description]);

  const handleAutoPredict = async () => {
    setPredicting(true);
    try {
      const res = await aiService.predictCategory(formData.description);
      if (res.category && CATEGORIES.includes(res.category)) {
        setFormData(prev => ({ ...prev, category: res.category }));
        setAiSuggested(true);
        toast.info(`AI predicted category: ${res.category}`, {
          position: "bottom-right",
          autoClose: 2000
        });
      }
    } catch (err) {
      // Fail silently for auto-prediction, fallback to manual
      console.error("Auto prediction failed:", err);
    } finally {
      setPredicting(false);
    }
  };

  const handleManualPredict = async () => {
    if (!formData.description || formData.description.trim().length < 5) {
      toast.warning('Please enter a longer description before asking the AI!');
      return;
    }
    
    setPredicting(true);
    try {
      const res = await aiService.analyzeIssue(formData.description);
      if (res.category) {
        setFormData(prev => ({ 
          ...prev, 
          category: res.category,
          priority: res.urgency || prev.priority 
        }));
        setAiSuggested(true);
        toast.success(`AI suggested Category: ${res.category} & Priority: ${res.urgency}`);
        
        if (res.missing_information && res.missing_information.length > 0) {
          window.alert(`AI identified missing information:\n\n- ${res.missing_information.join('\n- ')}\n\nPlease update your description before final submission.`);
        }
      }
    } catch (err) {
      toast.error('AI category prediction service failed. Please select manually.');
    } finally {
      setPredicting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG and PNG formats are allowed!');
      return;
    }

    // Check size <5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be smaller than 5MB!');
      return;
    }

    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, location, priority } = formData;

    if (!title || !description || !category || !location) {
      toast.error('Please enter all required form fields.');
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', title);
    submitData.append('description', description);
    submitData.append('category', category);
    submitData.append('location', location);
    submitData.append('priority', priority);
    if (image) {
      submitData.append('image', image);
    }

    try {
      // AI Report Quality Check
      const qualityRes = await aiService.reportQuality(description);
      if (qualityRes.status === 'Potentially Suspicious' || qualityRes.status === 'Low Quality') {
        if (!window.confirm(`Your report was flagged as ${qualityRes.status} by AI.\nReason: ${qualityRes.reason}\n\nDo you still want to submit it?`)) {
          setLoading(false);
          return;
        }
      }

      // AI Duplicate Check
      const dupRes = await aiService.checkDuplicate(description);
      if (dupRes.is_duplicate) {
        if (!window.confirm(`Similar complaint found: [${dupRes.existing_status}] ${dupRes.existing_title}.\nReason: ${dupRes.reason || 'Semantic match'}\n\nDo you want to continue submitting?`)) {
          setLoading(false);
          return;
        }
      }

      await complaintsService.createComplaint(submitData);
      toast.success('Complaint registered successfully!');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint. Please check fields.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center space-x-3">
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
            <FaPlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-outfit font-bold text-lg text-slate-800">Raise Issue Ticket</h2>
            <p className="text-xs text-slate-400 font-medium">Explain the campus grievance and assign details.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="e.g. Water cooler leaking on 2nd floor"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Description *</label>
              <button
                type="button"
                onClick={handleManualPredict}
                disabled={predicting}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <FaBrain className={`h-3.5 w-3.5 ${predicting ? 'animate-pulse' : ''}`} />
                <span>{predicting ? 'AI predicting...' : 'AI Categorize'}</span>
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Write detailed complaint here. Write at least 15 characters to trigger auto-categorization (e.g. 'The fan is making clicking noise')."
            ></textarea>
            {aiSuggested && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1 mt-1.5">
                <FaInfoCircle />
                <span>AI Suggested Category. You can modify it manually below.</span>
              </p>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Complaint Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white"
              >
                <option value="">-- Choose Category --</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Urgency / Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors bg-white"
              >
                {PRIORITIES.map(pr => (
                  <option key={pr} value={pr}>{pr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specific Campus Location *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <FaMapMarkerAlt />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors text-slate-800"
                placeholder="e.g. Block-B Room 302 near lab gate"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload Image Proof (Optional, Max 5MB)</label>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <label className="w-full sm:w-auto px-5 py-3 border border-dashed border-slate-300 hover:border-primary-500 rounded-xl flex items-center justify-center space-x-2 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer text-sm font-semibold">
                <FaFileUpload className="h-4 w-4" />
                <span>{image ? 'Change Photo' : 'Select Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              
              {imagePreview && (
                <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[9px] font-bold hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow flex items-center justify-center space-x-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            <FaFileAlt className="h-4 w-4" />
            <span>{loading ? 'Submitting Ticket...' : 'File Issue Ticket'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseComplaint;
