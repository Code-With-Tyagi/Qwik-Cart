import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { 
  getContacts, 
  getContactStats,
  deleteContact, 
  updateAdminNotes, 
  updateContactStatus, 
  markAsReadContact 
} from '../features/contact.slice'; // Adjust import path as needed
import { 
  MdSearch, 
  MdFilterList, 
  MdEdit, 
  MdDelete, 
  MdSwapVert, 
  MdDownload, 
  MdVisibility, 
  MdClose, 
  MdExpandMore,
  MdEmail,
  MdPhone,
  MdAssignment,
  MdMarkEmailUnread,
  MdMarkEmailRead,
  MdInbox,
  MdWatchLater,
  MdCheckCircleOutline
} from 'react-icons/md';
import { Zoom, toast } from 'react-toastify';

const AdminContacts = () => {
  const dispatch = useDispatch();

  // Fetch contacts & stats from Redux Store
  const { contacts: rawContacts, contactStats } = useSelector((state) => state.contact);
  
  // Initial Fetch on Mount
  useEffect(() => {
    dispatch(getContacts());
    dispatch(getContactStats());
  }, [dispatch]);

  // Local Interaction & Filter States
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom Dropdown States
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  // Modal States
  const [editingContact, setEditingContact] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Closed'];

  // Handle outside clicks to close custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // DISPATCH HANDLERS
  // ==========================================
  
  const handleView = (contact) => {
    // If unread, dispatch action to mark as read in the backend
    if (!contact.isRead) {
      dispatch(markAsReadContact(contact._id))
        .unwrap()
        .then(() => {
          // Refetch stats to update the "Unread" counter at the top
          dispatch(getContactStats());
        });
      // Locally update the selected contact to show as read immediately
      contact = { ...contact, isRead: true };
    }
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id, name) => {
    dispatch(deleteContact(id))
      .unwrap()
      .then(() => {
        toast.error(`Message from ${name} deleted.`, {
          position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
        });
        // Refetch stats after deletion
        dispatch(getContactStats());
      })
      .catch((error) => {
        toast.error(`Error deleting message: ${error}`);
      });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    
    // Dispatch both Status and Notes updates concurrently
    Promise.all([
      dispatch(updateContactStatus({ id: editingContact._id, payload: { status: editingContact.status } })).unwrap(),
      dispatch(updateAdminNotes({ id: editingContact._id, payload: { notes: editingContact.notes } })).unwrap()
    ])
    .then(() => {
      toast.success(`Contact record updated successfully.`, {
        position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
      });
      setEditingContact(null);
      
      // Refetch stats to update "Pending", "Resolved", etc. counters
      dispatch(getContactStats());

      // Update selected contact if it's currently open in the slide-over viewer
      if (selectedContact && selectedContact._id === editingContact._id) {
        setSelectedContact(editingContact);
      }
    })
    .catch(() => {
      toast.error(`Failed to update contact details.`);
    });
  };

  const handleExport = () => {
    toast.success('Contact records exported successfully.', {
      position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // ==========================================
  // FILTER, SORT & PAGINATION PIPELINE
  // ==========================================
  
  const filteredAndSortedContacts = useMemo(() => {
    let output = Array.isArray(rawContacts) ? [...rawContacts] : [];

    if (searchQuery.trim() !== '') {
      output = output.filter(contact =>
        contact.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'All') {
      output = output.filter(contact => contact.status === selectedStatus);
    }

    if (sortConfig.key) {
      output.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return output;
  }, [rawContacts, searchQuery, selectedStatus, sortConfig]);

  const totalItems = filteredAndSortedContacts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedContacts, currentPage]);

  // ==========================================
  // UTILITIES
  // ==========================================
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6 pb-8 px-1 relative">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support & Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer messages, assign statuses, and add internal notes.</p>
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS DASHBOARD (Wired to contactStats)    */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contacts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MdInbox size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Messages</p>
            <h4 className="text-2xl font-bold text-slate-800">{contactStats?.totalContacts || 0}</h4>
          </div>
        </div>

        {/* Unread Contacts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <MdMarkEmailUnread size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Unread</p>
            <h4 className="text-2xl font-bold text-slate-800">{contactStats?.unreadContacts || 0}</h4>
          </div>
        </div>

        {/* Pending Contacts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <MdWatchLater size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Actions</p>
            <h4 className="text-2xl font-bold text-slate-800">{contactStats?.pendingContacts || 0}</h4>
          </div>
        </div>

        {/* Resolved Contacts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MdCheckCircleOutline size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Resolved</p>
            <h4 className="text-2xl font-bold text-slate-800">{contactStats?.resolvedContacts || 0}</h4>
          </div>
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
            placeholder="Search by name, email, or subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dropdowns Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto">
          
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
            <MdExpandMore size={20} className={`absolute right-3 text-slate-400 pointer-events-none shrink-0 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />

            {isStatusOpen && (
              <ul className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-50 overflow-hidden">
                {statuses.map(status => (
                  <li
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                      setIsStatusOpen(false);
                    }}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedStatus === status ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    {status === 'All' ? 'All Statuses' : status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Contacts Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-left border-collapse min-w-200">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center gap-1">
                    Customer Details <MdSwapVert size={16} className={sortConfig.key === 'fullName' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('subject')}>
                  <div className="flex items-center gap-1">
                    Subject <MdSwapVert size={16} className={sortConfig.key === 'subject' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4">Message Preview</th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Date Received <MdSwapVert size={16} className={sortConfig.key === 'createdAt' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => (
                  <tr key={contact._id} className={`hover:bg-slate-50/80 transition-colors group ${!contact.isRead ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!contact.isRead ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                          {contact.isRead ? <MdMarkEmailRead size={20} /> : <MdMarkEmailUnread size={20} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-bold tracking-wide truncate ${!contact.isRead ? 'text-blue-900' : 'text-slate-800'}`}>{contact.fullName}</span>
                          <span className="text-xs text-slate-500 mt-0.5 truncate">{contact.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                        {contact.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm truncate max-w-50 ${!contact.isRead ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium text-xs whitespace-nowrap">
                        {formatDate(contact.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getStatusBadge(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleView(contact)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Read Message">
                          <MdVisibility size={18} />
                        </button>
                        <button onClick={() => setEditingContact(contact)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Update Status & Notes">
                          <MdEdit size={18} />
                        </button>
                        <button onClick={() => handleDelete(contact._id, contact.fullName)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Message">
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 bg-slate-50/30">
                    No messages match your criteria.
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
              Showing <span className="font-medium text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-medium text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium text-slate-800">{totalItems}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SLIDE-OVER MESSAGE DETAILS PANEL */}
      <div className={`fixed inset-0 z-100 overflow-hidden transition-all duration-500 ${isViewModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isViewModalOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsViewModalOpen(false)} />

        <div className={`absolute inset-y-0 right-0 w-full sm:w-112.5 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isViewModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Sticky Panel Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <MdAssignment className="text-blue-600" size={20} /> Request Details
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsViewModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                <MdClose size={22} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {!selectedContact ? (
              <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
              <div className="pb-8 p-6 space-y-6">
                
                {/* Header Information */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBadge(selectedContact.status)}`}>
                      {selectedContact.status}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(selectedContact.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedContact.fullName}</h3>
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MdEmail className="text-slate-400" size={16} /> 
                      <a href={`mailto:${selectedContact.email}`} className="hover:text-blue-600 transition-colors">{selectedContact.email}</a>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MdPhone className="text-slate-400" size={16} /> 
                        <a href={`tel:${selectedContact.phone}`} className="hover:text-blue-600 transition-colors">{selectedContact.phone}</a>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Message Content */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Inquiry: <span className="capitalize text-slate-600">{selectedContact.subject}</span>
                  </h4>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                {/* Internal Notes Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Internal Notes</h4>
                  {selectedContact.notes ? (
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 text-amber-900 text-sm leading-relaxed whitespace-pre-wrap italic">
                      {selectedContact.notes}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No internal notes added yet.</p>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL (Update Status & Notes) */}
      {editingContact && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Manage Request</h2>
              <button onClick={() => setEditingContact(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex-1 flex flex-col">
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                
                {/* Read-only info header */}
                <div className="flex flex-col mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</span>
                  <span className="text-sm font-bold text-slate-800">{editingContact.fullName} ({editingContact.email})</span>
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Resolution Status</label>
                  <div className="relative">
                    <select 
                      value={editingContact.status} 
                      onChange={(e) => setEditingContact({ ...editingContact, status: e.target.value })} 
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer font-medium text-slate-700"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <MdExpandMore size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Internal Notes Update */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Internal Notes (Not visible to customer)</label>
                  <textarea 
                    rows="4" 
                    value={editingContact.notes || ''} 
                    onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })} 
                    placeholder="Add steps taken, resolution details, or reminders..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-slate-700"
                  ></textarea>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditingContact(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminContacts;