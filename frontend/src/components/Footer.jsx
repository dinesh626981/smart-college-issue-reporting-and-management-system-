import { Link } from 'react-router-dom';
import { FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary-600 text-white rounded-xl">
                <FaGraduationCap className="h-6 w-6" />
              </div>
              <span className="font-outfit font-bold text-xl tracking-tight text-white">
                Smart<span className="text-primary-500">College</span>
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm">
              Making campus issue reporting simple, transparent, and highly efficient. Powered by Naive Bayes classifier AI for rapid automated category prediction.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg font-outfit mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">User Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-lg font-outfit mb-4">Contact College</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start space-x-2">
                <FaMapMarkerAlt className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                <span>123 University Campus, Education Hill, NH-44, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhone className="h-4 w-4 text-primary-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="h-4 w-4 text-primary-500 shrink-0" />
                <span>support@smartcollege.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Smart College Issue Reporting & Management System. Built as MCA Final Year Project.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
