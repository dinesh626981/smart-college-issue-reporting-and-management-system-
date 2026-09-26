import { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import api from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFileCsv, FaChartBar, FaStar, FaBuilding, FaClipboardCheck } from 'react-icons/fa';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await adminService.getReports();
      setData(res);
    } catch (err) {
      toast.error('Failed to load system reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadCSV = async () => {
    setExporting(true);
    try {
      // Securely fetch CSV using authenticated Axios call and responseType 'blob'
      const response = await api.get('/reports', {
        params: { format: 'csv' },
        responseType: 'blob'
      });

      // Create browser link to download the Blob file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'complaints_system_report.csv');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV report exported and downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate CSV export.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const deptRatings = data?.department_ratings || {};
  const statusSummary = data?.status_summary || {};
  const avgRating = data?.average_rating || 0.0;

  return (
    <div className="space-y-8 animate-fade-in">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* EXPORT ACTION ROW */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="font-outfit font-bold text-slate-800 text-lg">Export Campus Statistics</h2>
          <p className="text-xs text-slate-400 font-semibold">Generate raw system logs as standard spreadsheet compatible CSV files.</p>
        </div>

        <button
          onClick={handleDownloadCSV}
          disabled={exporting}
          className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <FaFileCsv className="h-5 w-5" />
          <span>{exporting ? 'Exporting CSV...' : 'Download CSV Report'}</span>
        </button>
      </div>

      {/* RATING SCORE & FEEDBACK SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Rating Metrics Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
            <FaStar className="text-amber-500" />
            <h3 className="font-outfit font-bold text-slate-800 text-base">Feedback Ratings</h3>
          </div>

          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <span className="text-5xl font-black font-outfit text-slate-800">{avgRating}</span>
            <div className="flex space-x-1 text-amber-500 text-2xl">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(avgRating) ? 'text-amber-500' : 'text-slate-200'} />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-400">Weighted average rating of resolved complaints.</p>
          </div>
        </div>

        {/* Department Feedback Ratings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
            <FaBuilding className="text-primary-600" />
            <h3 className="font-outfit font-bold text-slate-800 text-base">Ratings by Departments</h3>
          </div>

          <div className="space-y-4">
            {Object.keys(deptRatings).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No rating submissions found for departments.</p>
            ) : (
              Object.entries(deptRatings).map(([dept, val]) => (
                <div key={dept} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">{dept}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{val} / 5.0</span>
                    <div className="flex space-x-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`h-3 w-3 ${i < Math.round(val) ? 'text-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* TICKET STATUS DISTRIBUTION SUMMARY */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-premium border border-slate-100 space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center space-x-2">
          <FaClipboardCheck className="text-primary-600" />
          <h3 className="font-outfit font-bold text-slate-800 text-base">Overall Ticket Status Breakdown</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(statusSummary).map(([status, count]) => (
            <div key={status} className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-center space-y-1 hover:border-slate-300 hover:bg-white transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{status}</span>
              <p className="font-outfit text-xl font-extrabold text-slate-700">{count}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Reports;
