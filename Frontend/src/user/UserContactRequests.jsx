import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaRegClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// IMPORTANT: Adjust this path based on your folder structure where contactSlice is located
import { getUserContactRequests } from '../features/contact.slice.js';

const UserContactRequests = () => {
  const dispatch = useDispatch();

  // Pull the users contact requests array, loading state, and potential errors from Redux[cite: 10]
  const { userContactRequests = [], loading, error } = useSelector((state) => state.contact || {});

  // Fetch the requests when the component mounts[cite: 10]
  useEffect(() => {
    dispatch(getUserContactRequests());
  }, [dispatch]);

  // Helper function to determine status color and icon
  const getStatusDisplay = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    
    switch (normalizedStatus) {
      case 'resolved':
      case 'closed':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: <FaCheckCircle />,
          label: 'Resolved'
        };
      case 'in progress':
      case 'open':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <FaExclamationCircle />,
          label: 'In Progress'
        };
      default: // pending
        return {
          color: 'text-orange-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: <FaRegClock />,
          label: 'Pending'
        };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-sm font-sans min-h-[60vh] flex flex-col shadow-sm">
      
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaHistory className="text-[#2874f0] text-xl" />
          <h2 className="text-[18px] font-semibold text-gray-900 tracking-wide">
            My Support Requests
          </h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-10 flex-1 w-full bg-slate-50/30">
        
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <div className="w-8 h-8 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium">Loading your requests...</p>
          </div>
        ) : error ? (
          
          /* Error State */
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
            {error || "Something went wrong while fetching your requests."}
          </div>
        ) : userContactRequests.length === 0 ? (
          
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <img 
              src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" 
              alt="Empty Requests" 
              className="w-40 mb-6 opacity-70"
            />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Support Requests Found</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Looks like you haven't submitted any contact requests yet. If you need help, feel free to reach out to us!
            </p>
          </div>
        ) : (
          
          /* Requests List */
          <div className="flex flex-col gap-4">
            {userContactRequests.map((request) => {
              const statusData = getStatusDisplay(request.status);
              
              return (
                <div 
                  key={request._id} 
                  className="bg-white border border-gray-200 rounded-md p-5 hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    {/* Subject & Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {request.subject || "Support Query"}
                      </h3>
                      <span className="hidden sm:inline-block text-gray-300">•</span>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                      {request.message}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center justify-end sm:justify-start mt-2 sm:mt-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${statusData.bg} ${statusData.color} ${statusData.border}`}>
                      {statusData.icon}
                      {statusData.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserContactRequests;