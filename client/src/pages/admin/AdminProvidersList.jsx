import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { getFileUrl } from '../../services/api';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Briefcase,
  MapPin,
  Calendar,
  X,
} from 'lucide-react';

export const AdminProvidersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [providers, setProviders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: currentPage,
        limit: pagination.limit,
      };

      if (searchInput.trim()) params.search = searchInput.trim();
      if (selectedStatus) params.status = selectedStatus;
      if (selectedCategory) params.category = selectedCategory;

      const res = await adminService.getProviders(params);
      if (res.success && res.data) {
        setProviders(res.data.providers || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch provider listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [currentPage, selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProviders();
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedStatus('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
            Provider Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Partner Applications Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, review compliance documents, and approve or reject submissions
          </p>
        </div>

        <div className="text-xs font-semibold px-4 py-2 bg-purple-50 text-purple-800 rounded-xl border border-purple-200 self-start sm:self-auto">
          Total Records: <strong>{pagination.total}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by provider name, email, or phone number..."
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-sm text-slate-700 focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(opt.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === opt.value
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(searchInput || selectedStatus || selectedCategory) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Provider Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Fetching provider applications..." />
          </div>
        ) : providers.length === 0 ? (
          <EmptyState
            title="No providers found"
            description="No provider applications match the active filters or search term."
            action={
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Provider</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Services & Exp</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {providers.map((prov) => (
                  <tr
                    key={prov._id}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    {/* Provider Name & Photo */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        {prov.profilePhoto?.url ? (
                          <img
                            src={getFileUrl(prov.profilePhoto.url)}
                            alt={prov.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                            {prov.fullName?.charAt(0) || prov.user?.name?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div className="truncate max-w-[150px]">
                          <p className="font-bold text-slate-900 truncate">
                            {prov.fullName || prov.user?.name || 'Incomplete'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Docs: {prov.documents?.length || 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <p className="text-slate-800 font-medium">{prov.user?.email}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {prov.phone || 'No phone'}
                      </p>
                    </td>

                    {/* Services & Experience */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {prov.categories?.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold"
                          >
                            {cat}
                          </span>
                        ))}
                        {prov.categories?.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{prov.categories.length - 2}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        {prov.experience} yrs exp
                      </span>
                    </td>

                    {/* Locations */}
                    <td className="py-4 px-4">
                      <p className="text-slate-700 truncate max-w-[140px]">
                        {prov.serviceLocations?.[0] || 'Unspecified'}
                      </p>
                      {prov.serviceLocations?.length > 1 && (
                        <span className="text-[10px] text-slate-400">
                          +{prov.serviceLocations.length - 1} more
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={prov.status} size="sm" />
                    </td>

                    {/* Submitted Date */}
                    <td className="py-4 px-4 text-slate-500">
                      {prov.submittedAt
                        ? new Date(prov.submittedAt).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/providers/${prov._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page <strong>{pagination.page}</strong> of{' '}
              <strong>{pagination.totalPages}</strong> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-purple-700">
                {currentPage}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage >= pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProvidersList;
