import { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaPaperPlane } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all the contact form fields.');
      return;
    }

    setLoading(true);
    // Simulate API contact message dispatch
    setTimeout(() => {
      toast.success('Your message has been sent to college support! We will reply shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in pt-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 uppercase tracking-widest">
          Get In Touch
        </span>
        <h1 className="font-outfit font-extrabold text-4xl text-slate-900">
          Contact College Support
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Need help logging in, registering, or have general feedback about system maintenance? Write to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info & Map Placeholder */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
            <h3 className="font-outfit font-bold text-xl text-slate-800">Support Desk</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl mt-0.5"><FaMapMarkerAlt className="h-5 w-5" /></div>
                <div className="text-sm">
                  <p className="font-bold text-slate-800">Campus Address</p>
                  <p className="text-slate-500">123 University Campus, Education Hill, NH-44, India</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><FaEnvelope className="h-5 w-5" /></div>
                <div className="text-sm">
                  <p className="font-bold text-slate-800">Support Email</p>
                  <p className="text-slate-500">support@smartcollege.edu</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><FaPhone className="h-5 w-5" /></div>
                <div className="text-sm">
                  <p className="font-bold text-slate-800">Direct Helpline</p>
                  <p className="text-slate-500">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Mockup */}
          <div className="bg-slate-200 h-64 rounded-3xl overflow-hidden relative border border-slate-300/50 shadow-premium flex items-center justify-center text-center p-6">
            {/* Background design */}
            <div className="absolute inset-0 bg-cover bg-center opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=13&size=600x300&sensor=false')]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/60 to-slate-900/60 z-0"></div>
            
            <div className="relative z-10 text-white space-y-2">
              <FaMapMarkerAlt className="h-10 w-10 text-primary-500 mx-auto animate-bounce" />
              <p className="font-outfit font-bold">College Main Campus Map</p>
              <p className="text-xs text-slate-300">Central Block 1, Campus Entrance Area</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl shadow-premium border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="e.g. rahul@email.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="e.g. Registration verification issue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors resize-none"
                placeholder="Write your issue details here..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              <FaPaperPlane className="h-4 w-4" />
              <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Contact;
