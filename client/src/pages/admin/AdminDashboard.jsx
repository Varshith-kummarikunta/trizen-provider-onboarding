import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading administration metrics..." />;
  }

  const counts = stats?.counts || { total: 0, pending: 0, approved: 0, rejected: 0, draft: 0 };
  const categories = stats?.categoryStats || [];
  const recent = stats?.recentApplications || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block mb-1">
            Trizen Operations Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Verification Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metrics on provider onboarding, verification queues, and compliance
          </p>
        </div>

        <Link
          to="/admin/providers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
        >
          <Users className="w-4 h-4" />
          View All Providers
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Registered"
          value={counts.total}
          subtitle="All provider accounts"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Review"
          value={counts.pending}
          subtitle="Awaiting admin action"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Partners"
          value={counts.approved}
          subtitle="Verified & active"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Returned / Rejected"
          value={counts.rejected}
          subtitle="Needs changes"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Draft Incomplete"
          value={counts.draft}
          subtitle="Not yet submitted"
          icon={FileText}
          color="slate"
        />
      </div>

      {/* Two Column Layout: Categories Distribution & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Service Distribution
            </h3>
            <span className="text-xs text-slate-400">By trade</span>
          </div>

          <div className="space-y-3 pt-2">
            {categories.length > 0 ? (
              categories.map((item, idx) => {
                const pct = counts.total ? Math.round((item.count / counts.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.category}</span>
                      <span className="text-slate-500">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, pct || 15)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6">
                No service categories registered yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Recently Active Applications
            </h3>
            <Link
              to="/admin/providers"
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              Manage All &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Applicant</th>
                  <th className="pb-3">Categories</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recent.length > 0 ? (
                  recent.map((prov) => (
                    <tr key={prov._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pr-2">
                        <p className="font-bold text-slate-900 truncate">
                          {prov.fullName || prov.user?.name || 'Unnamed'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {prov.user?.email}
                        </p>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="text-slate-600">
                          {prov.categories?.slice(0, 2).join(', ') || 'None selected'}
                          {prov.categories?.length > 2 ? '...' : ''}
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <StatusBadge status={prov.status} size="sm" />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/providers/${prov._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-semibold text-xs transition-colors"
                        >
                          Review <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 italic">
                      No applications recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
