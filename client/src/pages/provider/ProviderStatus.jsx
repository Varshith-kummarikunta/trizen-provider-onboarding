import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STATUS_CONFIG } from '../../utils/constants';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ProviderStatus = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await providerService.getStatus();
      if (res.success && res.data) {
        setStatusData(res.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch status details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading status tracker..." />;
  }

  const status = statusData?.status || 'draft';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Verification Lifecycle Tracker
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Application Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track verification progress and administrative review outcomes
          </p>
        </div>
        <StatusBadge status={status} size="lg" />
      </div>

      {/* Hero Outcome Banner */}
      {status === 'approved' && (
        <div className="p-6 bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-emerald-950">
            Congratulations! You are an Approved Trizen Partner
          </h2>
          <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed">
            Your verification documents and experience profile have been successfully validated by the operations team. Your verified badge is live.
          </p>
          <div className="pt-2">
            <Link
              to="/provider/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Go to Partner Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="p-6 bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/20 animate-bounce">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-amber-950">
            Application Submitted Successfully
          </h2>
          <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
            Awaiting admin verification. Verification audits typically conclude within 24 to 48 business hours. Your application data is locked from modification during this period.
          </p>
          <div className="text-[11px] text-amber-700 font-semibold">
            Submitted On:{' '}
            {statusData?.submittedAt ? new Date(statusData.submittedAt).toLocaleString() : 'Recently'}
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-rose-950">
                Application Requires Revision
              </h2>
              <p className="text-xs text-rose-800 mt-0.5">
                Our verification team found items requiring your attention before your profile can be approved.
              </p>
            </div>
          </div>

          {/* Admin Remarks Container */}
          <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs space-y-1">
            <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px]">
              Admin Reviewer Remarks:
            </span>
            <p className="text-slate-800 font-semibold whitespace-pre-wrap leading-relaxed">
              "{statusData?.rejectionRemarks || 'Please review your uploaded documents and service information.'}"
            </p>
            <p className="text-[10px] text-slate-400 pt-1">
              Reviewed on:{' '}
              {statusData?.reviewedAt ? new Date(statusData.reviewedAt).toLocaleString() : 'Recently'}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              to="/provider/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Correct Details & Resubmit
            </Link>
          </div>
        </div>
      )}

      {status === 'draft' && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Application Still in Draft
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not yet submitted your application for verification.
          </p>
          <div>
            <Link
              to="/provider/onboarding"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              Continue Onboarding Wizard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Chronological Lifecycle Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">
          Lifecycle Progression Timeline
        </h3>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {/* Step 1 */}
          <div className="relative">
            <span className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs ring-4 ring-white shadow-sm">
              ✓
            </span>
            <h4 className="text-sm font-bold text-slate-900">Partner Account Registered</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Profile initiated with Trizen authentication system.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <span
              className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ring-4 ring-white shadow-sm ${
                status !== 'draft' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
              }`}
            >
              {status !== 'draft' ? '✓' : '2'}
            </span>
            <h4 className="text-sm font-bold text-slate-900">Onboarding Data Completed</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Service specializations, skills, areas, and verification records added.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <span
              className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ring-4 ring-white shadow-sm ${
                status === 'pending'
                  ? 'bg-amber-500 text-white animate-pulse'
                  : status === 'approved' || status === 'rejected'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {status === 'approved' || status === 'rejected' ? '✓' : '3'}
            </span>
            <h4 className="text-sm font-bold text-slate-900">Application Submitted</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {statusData?.submittedAt
                ? `Transmitted on ${new Date(statusData.submittedAt).toLocaleString()}`
                : 'Awaiting submission by provider.'}
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <span
              className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ring-4 ring-white shadow-sm ${
                status === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : status === 'rejected'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {status === 'approved' ? '✓' : status === 'rejected' ? '!' : '4'}
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Admin Verification Decision
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {status === 'approved'
                ? `Approved by reviewer on ${new Date(statusData.reviewedAt).toLocaleString()}`
                : status === 'rejected'
                ? `Returned with feedback on ${new Date(statusData.reviewedAt).toLocaleString()}`
                : 'Review pending.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderStatus;
