import React from 'react';
import { Link } from 'react-router-dom';

const AdminNotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Main Illustration */}
      <div className="w-full max-w-md mb-8 flex justify-center">
        <img 
          src="/Image-404.png" 
          alt="Page Not Found" 
          className="w-full h-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* Error Message */}
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight text-center">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-base md:text-lg text-center mb-10 max-w-xl leading-relaxed">
        Unfortunately, the admin page you are looking for has been moved, deleted, or does not exist.
      </p>

      {/* Go to Dashboard Button */}
      <Link 
        to="/admin/dashboard" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md shadow-blue-500/10 text-sm md:text-base transition-all uppercase tracking-wider"
      >
        Back to Dashboard
      </Link>
      
    </div>
  );
};

export default AdminNotFoundPage;