import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaPlusCircle, 
  FaSearchLocation, 
  FaUserShield, 
  FaBrain, 
  FaChartBar, 
  FaBell, 
  FaArrowRight,
  FaCheckCircle,
  FaHourglassHalf,
  FaWrench,
  FaStar
} from 'react-icons/fa';

const Landing = () => {
  const { isAuthenticated, user } = useAuth();

  const getStartedLink = () => {
    if (!isAuthenticated) return '/login';
    return user.role === 'admin' 
      ? '/admin/dashboard' 
      : user.role === 'staff' 
        ? '/staff/dashboard' 
        : '/student/raise-complaint';
  };

  return (
    <div className="space-y-24 -mt-6">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50/20 to-[#F8FAFC] py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Headline */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 uppercase tracking-widest animate-pulse">
                Campus Operations Simplified
              </span>
              <h1 className="font-outfit font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 leading-none">
                Smart College <br />
                <span className="text-primary-600 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                  Issue Reporting & <br />Management System
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
                A seamless, transparent, and AI-powered platform designed to raise, assign, track, and resolve campus infrastructure and laboratory issues in real-time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to={getStartedLink()}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-glow hover:shadow-primary-300 transform hover:-translate-y-0.5 transition-all text-center flex items-center justify-center space-x-2"
                >
                  <span>Report An Issue</span>
                  <FaArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all text-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Premium CSS Illustration */}
            <div className="lg:col-span-5 flex justify-center relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
              
              {/* College Dashboard Illustration */}
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 bg-white rounded-3xl shadow-premium border border-slate-100 p-6 flex flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex space-x-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-400"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-yellow-400"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">System Dashboard</span>
                </div>
                
                {/* Visual Data Cards */}
                <div className="space-y-4 my-4 flex-grow justify-center flex flex-col">
                  {/* Status Item */}
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-2xl border border-primary-100/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-600 text-white rounded-lg"><FaBrain className="h-4 w-4" /></div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">AI Classification</p>
                        <p className="text-[10px] text-slate-400">Category auto-predicted</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-primary-800">98% Accuracy</span>
                  </div>
                  
                  {/* Complaint Item */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg"><FaCheckCircle className="h-4 w-4" /></div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">Water Pipeline Leakage</p>
                        <p className="text-[10px] text-slate-400">Assigned to Housekeeping</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Resolved</span>
                  </div>

                  {/* Complaint Item 2 */}
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl border border-amber-100/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-500 text-white rounded-lg"><FaHourglassHalf className="h-4 w-4" /></div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">AC in Room 402 Flickering</p>
                        <p className="text-[10px] text-slate-400">Electrical Department</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">In Progress</span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Resolved: 954 issues</span>
                  <span>Avg response: 2.4 hrs</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2500+', label: 'Active Students' },
            { value: '8+', label: 'Departments Linked' },
            { value: '1800+', label: 'Issues Resolved' },
            { value: '98%', label: 'Resolution Rate' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100 text-center space-y-2">
              <p className="font-outfit text-3xl sm:text-4xl font-extrabold text-primary-600">{stat.value}</p>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900">
            Engineered For Seamless Campus Maintenance
          </h2>
          <p className="text-slate-600">
            A comprehensive set of modern, digital features tailored to bridge students, maintenance staff, and administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Online Complaint Reporting',
              desc: 'Students can quickly file details with category, specific campus location, and attach image proofs.',
              icon: FaPlusCircle,
              color: 'text-blue-600 bg-blue-50 border-blue-100'
            },
            {
              title: 'Real-time Status Tracking',
              desc: 'Follow the life cycle of your issue through Pending, Assigned, In Progress, Resolved, and Closed states.',
              icon: FaSearchLocation,
              color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
            },
            {
              title: 'AI Category Prediction',
              desc: 'Smart predictive engine automatically matches description text to categories (e.g. Electrical) to save time.',
              icon: FaBrain,
              color: 'text-purple-600 bg-purple-50 border-purple-100'
            },
            {
              title: 'Role-Based Dashboards',
              desc: 'Tailored panels with dedicated features for students, specialized department staff, and central administrators.',
              icon: FaUserShield,
              color: 'text-rose-600 bg-rose-50 border-rose-100'
            },
            {
              title: 'Admin Reports & CSV',
              desc: 'Generate visual charts, filter issue distributions by departments or categories, and download raw data CSV.',
              icon: FaChartBar,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
            },
            {
              title: 'Automated Mail Alerts',
              desc: 'Receive immediate email notifications whenever your raised issue gets assigned to a staff or marked resolved.',
              icon: FaBell,
              color: 'text-amber-600 bg-amber-50 border-amber-100'
            }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 hover:border-slate-200 transition-all space-y-6 group">
                <div className={`p-4 rounded-2xl w-fit border ${feat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-outfit font-bold text-xl text-slate-800 group-hover:text-primary-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-800/10 via-transparent to-transparent"></div>
        <div className="relative z-10 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl">How It Works</h2>
            <p className="text-slate-400">Follow the simple 4-step lifecycle of campus issue remediation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Raise Issue', desc: 'Describe the issue (AI auto-suggests category) and upload image proof.', icon: FaPlusCircle },
              { step: '02', title: 'Admin Assigns', desc: 'Central administrator reviews and assigns it to appropriate department staff.', icon: FaUserShield },
              { step: '03', title: 'Staff Resolves', desc: 'Assigned staff troubleshoots, writes resolution remarks, and uploads completion proof.', icon: FaWrench },
              { step: '04', title: 'Review & Close', desc: 'Student tracks update, submits rating/comment feedback, and closes ticket.', icon: FaCheckCircle }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-outfit font-black text-4xl text-primary-500/35">{item.step}</span>
                    <Icon className="h-6 w-6 text-slate-500" />
                  </div>
                  <h4 className="font-outfit font-bold text-lg">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900">What Our Campus Says</h2>
          <p className="text-slate-600">Feedback from students and department staff using the system daily.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Reporting is incredibly fast now. The AI category prediction works like magic! My hostel room door latch was repaired within 4 hours of raising the ticket.",
              author: "Rahul Sharma",
              role: "Final Year MCA Student",
              rating: 5
            },
            {
              quote: "As electrical staff, I get a clear, filterable dashboard of my tasks. I can mark them resolved and upload photos on my phone directly from the site.",
              author: "Suresh Kumar",
              role: "Electrical Maintenance Team",
              rating: 5
            },
            {
              quote: "The visual charts in the admin dashboard help us track response rate and identify repeat complaints. We exported the CSV for our monthly management meeting.",
              author: "Dr. Anjali Verma",
              role: "Campus Registrar / Administrator",
              rating: 5
            }
          ].map((test, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex space-x-1">
                  {[...Array(test.rating)].map((_, idx) => (
                    <FaStar key={idx} className="h-4 w-4 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{test.quote}"
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <p className="font-outfit font-bold text-slate-800 text-sm">{test.author}</p>
                <p className="text-xs text-slate-400 font-semibold">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Landing;
