import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Only importing the single user fetching API as requested
import { usersApi } from '../features/user.slice'; 

import { generatePdf } from '../utils/generate.pdf';
import { Zoom, toast } from 'react-toastify';
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdSwapVert,
  MdDownload,
  MdPerson,
  MdVisibility,
  MdClose,
  MdEmail,
  MdPhone,
  MdDateRange,
  MdShoppingCart,
  MdVerifiedUser,
  MdExpandMore,
  MdSecurity
} from 'react-icons/md';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AdminUser = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    dispatch(usersApi());
  }, [dispatch]);

  // Fetching users from Redux state
  const reduxUsers = useSelector((state) => state.user?.users) || [];
  
  // Local state for the selected user
  const [selectedUser, setSelectedUser] = useState(null);

  // Interaction & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom Dropdown States
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const roleRef = useRef(null);
  const statusRef = useRef(null);

  // Handle outside clicks to close custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setIsRoleOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Derive unique roles for the filter dropdown
  const roles = useMemo(() => {
    const allRoles = reduxUsers.map(u => u.role).filter(Boolean);
    return ['All', ...new Set(allRoles)];
  }, [reduxUsers]);

  // Status options for verification
  const statuses = ['All', 'Verified', 'Unverified'];

  // Handler for View Button
  const handleView = (id) => {
    const userToView = reduxUsers.find(u => u._id === id);
    setSelectedUser(userToView);
    setIsViewModalOpen(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const headers = [
      "#",
      "Name",
      "Email",
      "Orders Count", 
      "Role",
      "Status",
      "Joined Date"
    ];

    const rows = reduxUsers.map((user, index) => [
      index + 1,
      user.name,
      user.email,
      user.ordersCount || 0,
      user.role,
      user.isVerified ? "Verified" : "Unverified",
      formatDate(user.createdAt)
    ]);

    generatePdf({
      companyName: "QwikCart",
      reportName: "User Directory Report",
      fileName: "QwikCart_Users_Report.pdf",
      headers,
      rows
    });
  };

  // Filter, Sort, and Pagination Pipeline
  const filteredAndSortedUsers = useMemo(() => {
    let output = [...reduxUsers];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      output = output.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by Role
    if (selectedRole !== 'All') {
      output = output.filter(user => user.role === selectedRole);
    }

    // Filter by Status
    if (selectedStatus !== 'All') {
      const isVerifiedTarget = selectedStatus === 'Verified';
      output = output.filter(user => user.isVerified === isVerifiedTarget);
    }

    // Handle Sorting
    if (sortConfig.key) {
      output.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (valA === undefined) valA = sortConfig.key === 'ordersCount' ? 0 : '';
        if (valB === undefined) valB = sortConfig.key === 'ordersCount' ? 0 : '';

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return output;
  }, [reduxUsers, searchQuery, selectedRole, selectedStatus, sortConfig]);

  // Pagination Math
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage]);

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'user': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 pb-8 px-1 relative">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer accounts, roles, and details.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <MdDownload size={18} />
            <span className="text-sm cursor-pointer">Export</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dropdowns Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto">
          
          {/* Custom Role Dropdown */}
          <div ref={roleRef} className="relative w-full sm:w-56 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            <MdFilterList size={20} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />
            
            <button
              type="button"
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-10 pr-10 outline-none text-sm font-medium cursor-pointer truncate"
            >
              {selectedRole === 'All' ? 'All Roles' : selectedRole}
            </button>
            <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

            {isRoleOpen && (
              <ul className="absolute top-full left-0 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50">
                {roles.map(role => (
                  <li
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setCurrentPage(1);
                      setIsRoleOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedRole === role ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    {role === 'All' ? 'All Roles' : role}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Custom Status Dropdown */}
          <div ref={statusRef} className="relative w-full sm:w-48 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            <MdFilterList size={20} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />
            
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-10 pr-10 outline-none text-sm font-medium cursor-pointer truncate"
            >
              {selectedStatus === 'All' ? 'All Statuses' : selectedStatus}
            </button>
            <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

            {isStatusOpen && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50 overflow-hidden">
                {statuses.map(status => (
                  <li
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                      setIsStatusOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedStatus === status ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    {status}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Joined Date <MdSwapVert size={16} className={sortConfig.key === 'createdAt' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('ordersCount')}>
                  <div className="flex items-center gap-1">
                    Orders <MdSwapVert size={16} className={sortConfig.key === 'ordersCount' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Role</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=475569`;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-800 truncate" title={user.name}>{user.name}</span>
                            <span className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{user.ordersCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold border border-emerald-200">
                            <MdVerifiedUser size={14} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold border border-red-200">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {/* Continuously visible view button */}
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(user._id)}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="View Details"
                          >
                            <MdVisibility size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 bg-slate-50/30">
                    No users match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-medium text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium text-slate-800">{totalItems}</span> users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COMPACT SLIDE-OVER USER DETAILS PANEL */}
      <div 
        className={`fixed inset-0 z-100 overflow-hidden transition-all duration-500 ${isViewModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} 
        aria-labelledby="slide-over-title" 
        role="dialog" 
        aria-modal="true"
      >
        {/* Dark Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isViewModalOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsViewModalOpen(false)}
        />

        {/* Sliding Panel */}
        <div className={`absolute inset-y-0 right-0 w-full sm:w-120 md:w-140 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isViewModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Sticky Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight" id="slide-over-title">User Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                title="Close panel"
              >
                <MdClose size={22} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {!selectedUser ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="pb-8">
                
                {/* Profile Header Block */}
                <div className="px-6 py-8 flex flex-col items-center text-center bg-slate-50 border-b border-slate-100">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-sm overflow-hidden mb-4">
                    <img 
                      src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=e2e8f0&color=475569&size=128`} 
                      alt={selectedUser.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{selectedUser.name}</h1>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 mb-3">ID: {selectedUser._id}</p>
                  
                  <div className="flex items-center gap-2">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                      {selectedUser.isVerified && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-emerald-200">
                          <MdVerifiedUser size={12} /> Verified
                        </span>
                      )}
                  </div>
                </div>

                {/* Stacked Detail Cards */}
                <div className="px-6 py-6 space-y-4">
                  
                  {/* Contact Info Card */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MdPerson size={16} /> Contact Information
                    </h4>
                    <dl className="space-y-4 text-sm">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0"><MdEmail size={18}/></div>
                        <div>
                          <dt className="text-xs text-slate-500">Email Address</dt>
                          <dd className="font-semibold text-slate-800">{selectedUser.email}</dd>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0"><MdPhone size={18}/></div>
                        <div>
                          <dt className="text-xs text-slate-500">Phone Number</dt>
                          <dd className="font-semibold text-slate-800">{selectedUser.phone || 'Not provided'}</dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  {/* Account Activity Card */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MdSecurity size={16} /> Account Activity
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <MdDateRange size={16} />
                          <span className="text-xs font-medium uppercase tracking-wide">Joined</span>
                        </div>
                        <p className="font-bold text-slate-800">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <MdShoppingCart size={16} />
                          <span className="text-xs font-medium uppercase tracking-wide">Total Orders</span>
                        </div>
                        <p className="font-bold text-slate-800">{selectedUser.ordersCount || 0}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminUser;