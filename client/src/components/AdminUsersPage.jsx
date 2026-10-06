import React, { useState, useEffect, useMemo } from 'react';

function AdminUsersPage({ currentUser, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Role guard: Do not allow ordinary members to access this page
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-red-200 rounded-lg p-8 text-center max-w-md mx-auto shadow-sm space-y-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            Access Restricted
          </span>
          <h2 className="text-lg font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            You do not have administrative privileges to inspect or manage the platform user directory.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await res.json();
      if (res.ok && result.status === 'success' && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        throw new Error(result.message || 'Failed to load user directory.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Network error while connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  // Manage user status according to intended application permissions
  const handleUpdateStatus = async (userId, newStatus) => {
    setUpdatingUserId(userId);
    try {
      const token = localStorage.getItem('fitpulse_token');
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ membershipStatus: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to update user status.');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, membershipStatus: newStatus } : u))
      );
      showNotification(`Membership status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filtered users by search query and role filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.membershipStatus && u.membershipStatus.toLowerCase().includes(q));

      const matchesRole =
        selectedRoleFilter === 'All' ||
        (u.role && u.role.toLowerCase() === selectedRoleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Member';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Admin Center
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">User Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Platform Users
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Inspect registered members, instructors, and system administrators. Manage enrollment statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-md border border-gray-300 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Refresh Directory
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-md text-sm font-medium flex items-center justify-between shadow-xs">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {/* Search and Role Filter Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Simple search bar */}
          <div className="flex-1 relative">
            <input
              id="admin-users-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, email, or role..."
              className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All', 'Member', 'Trainer', 'Admin'].map((role) => {
              const isSelected = selectedRoleFilter === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-white text-slate-700 border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  {role === 'All' ? 'All Roles' : `${role}s`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Directory Listing
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Showing {filteredUsers.length} of {users.length} Users
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900">Loading user records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No users found matching your search.</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or clearing the role filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRoleFilter('All');
              }}
              className="mt-2 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Membership Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, idx) => {
                  const isUpdating = updatingUserId === user.id;
                  return (
                    <tr key={user.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{user.fullName}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-mono">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                            user.role === 'admin'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : user.role === 'trainer'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                            user.membershipStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : user.membershipStatus === 'Frozen'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : user.membershipStatus === 'Expired'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {user.membershipStatus || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.role === 'member' ? (
                          <div className="inline-flex items-center gap-1">
                            <select
                              disabled={isUpdating}
                              value={user.membershipStatus || 'Active'}
                              onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                              className="text-xs bg-white border border-gray-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer disabled:opacity-50"
                              title="Update membership status"
                            >
                              <option value="Active">Active</option>
                              <option value="Frozen">Frozen</option>
                              <option value="Expired">Expired</option>
                            </select>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Protected Role</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminUsersPage;
