import { FaBullseye, FaRegEye, FaCogs, FaGraduationCap } from 'react-icons/fa';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in pt-8">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 uppercase tracking-widest">
          Project Details
        </span>
        <h1 className="font-outfit font-extrabold text-4xl text-slate-900">
          About The Project
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Smart College Issue Reporting & Management System is an advanced digital grievance portal bridging campus residents with maintenance administration.
        </p>
      </div>

      {/* Grid: Mission and Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 space-y-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
            <FaBullseye className="h-6 w-6" />
          </div>
          <h3 className="font-outfit font-bold text-xl text-slate-800">Our Mission</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            To eliminate manual, paperwork-driven grievance registrations on campus. By providing a transparent web portal, we ensure every classroom, hostel, and laboratory issue is recorded, assigned, tracked, and closed with proper accountability.
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 space-y-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit">
            <FaRegEye className="h-6 w-6" />
          </div>
          <h3 className="font-outfit font-bold text-xl text-slate-800">Our Objectives</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Implement state-of-the-art automated complaint routing. The integration of a local AI text classifier automatically predicts categories (Electrical, Water Supply, Furniture, etc.) based on description text, minimizing manual sorting overhead.
          </p>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 space-y-8">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
          <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
            <FaCogs className="h-5 w-5" />
          </div>
          <h3 className="font-outfit font-bold text-lg text-slate-800">Project Technology Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 text-sm">Frontend Frameworks</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• React.js (Vite Core build)</li>
              <li>• Tailwind CSS (Glassmorphic cards, custom shadows)</li>
              <li>• React Router DOM (Declarative routing)</li>
              <li>• Chart.js (Graphical analytics on Admin Panel)</li>
              <li>• Axios (Interceptors for token authorization)</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 text-sm">Backend & AI Services</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Python Flask API framework</li>
              <li>• Flask-SQLAlchemy (ORM model relationships)</li>
              <li>• JWT (Role authentication middleware)</li>
              <li>• Scikit-learn Multinomial Naive Bayes & TF-IDF Vectorizer</li>
              <li>• Flask-Mail (Immediate mail dispatcher)</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
