import React, { useState } from 'react';
import { MdWarning } from 'react-icons/md';
import { Zoom, toast } from 'react-toastify'; 
import { seedProducts } from '../features/see.slice';
import { useDispatch } from 'react-redux';

const AdminDatabaseSeeding = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSeedDatabase = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      let payload = {
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
      };

      // Directly dispatch and wait for the API call to finish
      await dispatch(seedProducts(payload)).unwrap();

      // 1. Success Toast with your specific configurations
      toast.success(`Database Seeding Successful`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
      
    } catch (error) {
      // 2. Error Toast with your specific configurations
      toast.error(error?.message || 'Failed to seed the database. Please try again.', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8 relative">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Database Seeding</h1>
        <p className="text-sm text-slate-500 mt-1">
          Import external dummy data into your environment for testing and development.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
        
        {/* Animated Top Loading Bar */}
        <div className={`absolute top-0 left-0 w-full h-0.75 bg-slate-100 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-full bg-slate-900 w-1/3 rounded-full animate-[bounce_1.5s_infinite_linear] relative -left-1/3" style={{ animationName: 'slide', animationDuration: '1.5s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}>
            <style>
              {`
                @keyframes slide {
                  0% { transform: translateX(0%); width: 10%; }
                  50% { width: 40%; }
                  100% { transform: translateX(400%); width: 10%; }
                }
              `}
            </style>
          </div>
        </div>
        
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Seed Parameters</h2>
          <p className="text-sm text-slate-500 mt-1">
            Set the pagination details to fetch data from the external source.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSeedDatabase}>
          {/* Dim the form content while loading */}
          <div className={`p-6 space-y-6 transition-all duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Target Page Input */}
              <div>
                <label htmlFor="pageInput" className="block text-sm font-medium text-slate-700 mb-2">
                  Target Page
                </label>
                <input
                  id="pageInput"
                  type="number"
                  min="1"
                  required
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                  placeholder="1"
                />
                <p className="text-xs text-slate-500 mt-2">
                  The specific page number to fetch from the API.
                </p>
              </div>

              {/* Items Limit Input */}
              <div>
                <label htmlFor="limitInput" className="block text-sm font-medium text-slate-700 mb-2">
                  Items Limit
                </label>
                <input
                  id="limitInput"
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
                  placeholder="30"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Total records to insert per request (Max: 500).
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 transition-opacity duration-300">
              {isLoading ? 'Processing records...' : ''}
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-80 disabled:cursor-not-allowed transition-all min-w-35"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Seeding...
                </>
              ) : (
                'Run Data Seed'
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AdminDatabaseSeeding;