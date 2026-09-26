import { Link } from 'react-router-dom';
import { FaGraduationCap, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 space-y-6 animate-fade-in">
      <div className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 animate-bounce">
        <FaGraduationCap className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="font-outfit font-black text-6xl text-slate-800">404</h1>
        <h2 className="font-outfit font-bold text-xl text-slate-700">Page Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          The page link you are looking for has been removed, renamed or was temporarily unavailable.
        </p>
      </div>
      
      <Link
        to="/"
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-glow flex items-center space-x-2 transition-colors"
      >
        <FaHome className="h-4 w-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
