import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Main Illustration */}
      <div className="w-full max-w-lg mb-8 flex justify-center">
        <img 
          src="/404.png" 
          alt="Page Not Found" 
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Error Message */}
      <p className="text-gray-800 text-lg md:text-xl text-center mb-8 max-w-2xl">
        Unfortunately the page you are looking for has been moved or deleted
      </p>

      {/* Go to Homepage Button */}
      <Link 
        to="/" 
        className="bg-[#2879fe] hover:bg-[#1a65eb] text-white font-medium py-3 px-8 rounded shadow text-sm md:text-base transition-colors uppercase"
      >
        GO TO HOMEPAGE
      </Link>
      
    </div>
  );
};

export default NotFound;