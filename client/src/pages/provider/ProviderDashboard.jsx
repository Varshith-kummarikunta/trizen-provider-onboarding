import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { providerService } from '../../services/providerService';
import { getFileUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DocumentViewerModal from '../../components/admin/DocumentViewerModal';
import { STATUS_CONFIG } from '../../utils/constants';
import {
  User,
  Briefcase,
  MapPin,
  FileCheck,
  ArrowRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await providerService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data.profile);
        setCompletion(res.data.completionPercentage || 0);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your dashboard..." />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-rose-600 font-medium">{error || 'Could not load profile.'}</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const status = profile.status || 'draft';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const isEditable = status === 'draft' || status === 'rejected';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {profile.fullName || user?.name}!
            </h1>
            <StatusBadge status={status} size="lg" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Service Partner Portal &bull; Application Status: <strong>{config.label}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditable && (
            <Link
              to="/provider/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow transition-all"
            >
              <Edit3 className="w-4 h-4" />
              {status === 'rejected' ? 'Review Remarks & Edit' : 'Edit Application'}
            </Link>
          )}
          <Link
            to="/provider/status"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Track Status
          </Link>
        </div>
      </div>

      {/* Dynamic Status Alert Notification */}
      {status === 'draft' && (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm flex-shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Action Required: Complete Your Onboarding Application
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Provide your service categories, experience, service locations, and verification documents to submit for admin review.
              </p>
            </div>
          </div>
          <Link
            to="/provider/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            Complete Onboarding <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {status === 'pending' && (
        <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Application Under Verification
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Your application was submitted on{' '}
              <strong>{profile.submittedAt ? new Date(profile.submittedAt).toLocaleDateString() : 'recently'}</strong>{' '}
              and is currently being reviewed by our administrative operations team. Application data is safely locked while under review.
            </p>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">
              Congratulations! Your Partner Profile is Verified & Approved
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your application passed all verification checks on{' '}
              <strong>{profile.reviewedAt ? new Date(profile.reviewedAt).toLocaleDateString() : 'recently'}</strong>.
              Your professional profile is now verified and active.
            </p>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-sm flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Action Required: Application Requires Corrections
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                The verification team reviewed your application and requested the changes detailed below. Your profile has been unlocked for editing.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-rose-200/80 text-xs">
            <span className="font-bold text-rose-700 block uppercase tracking-wider text-[10px] mb-1">
              Admin Rejection Feedback Remarks:
            </span>
            <p className="text-slate-800 font-medium whitespace-pre-wrap">
              "{profile.rejectionRemarks || 'Please update your details and re-submit.'}"
            </p>
          </div>

          <div className="flex justify-end">
            <Link
              to="/provider/onboarding"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
            >
              Update Profile & Resubmit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Profile Completion Meter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-800">
            Onboarding Completeness
          </span>
          <span className="text-sm font-bold text-brand-600">
            {completion}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              completion === 100
                ? 'bg-emerald-500'
                : completion >= 60
                ? 'bg-brand-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-[11px] text-slate-500">
          <span className={profile.fullName && profile.phone ? 'text-emerald-600 font-semibold' : ''}>
            ✓ Personal Info
          </span>
          <span className={profile.categories?.length > 0 ? 'text-emerald-600 font-semibold' : ''}>
            ✓ Categories
          </span>
          <span className={profile.skills?.length > 0 ? 'text-emerald-600 font-semibold' : ''}>
            ✓ Skills & Exp
          </span>
          <span className={profile.serviceLocations?.length > 0 ? 'text-emerald-600 font-semibold' : ''}>
            ✓ Locations
          </span>
          <span className={profile.documents?.length > 0 ? 'text-emerald-600 font-semibold' : ''}>
            ✓ Documents
          </span>
        </div>
      </div>

      {/* Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Personal Dossier */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            {profile.profilePhoto?.url ? (
              <img
                src={getFileUrl(profile.profilePhoto.url)}
                alt={profile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xl border border-brand-100">
                {profile.fullName?.charAt(0) || 'P'}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">{profile.fullName || 'Not provided'}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {profile.phone || 'Phone not set'}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Professional Bio
            </span>
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              {profile.bio || 'No bio provided yet.'}
            </p>
          </div>
        </div>

        {/* Card 2: Services & Experience */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Service Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.categories?.length > 0 ? (
                profile.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No categories selected</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Years of Experience
            </span>
            <p className="text-sm font-bold text-slate-800">
              {profile.experience} {profile.experience === 1 ? 'Year' : 'Years'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Specialized Skills
            </span>
            <div className="flex flex-wrap gap-1">
              {profile.skills?.length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills added</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Locations & Documents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Service Locations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.serviceLocations?.length > 0 ? (
                profile.serviceLocations.map((loc, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    {loc}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No locations specified</span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Verification Documents ({profile.documents?.length || 0})
            </span>
            <div className="space-y-1.5">
              {profile.documents?.length > 0 ? (
                profile.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-slate-800 truncate">{doc.fileName}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{doc.documentType}</span>
                    </div>
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex-shrink-0"
                      title="Inspect Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No documents uploaded</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
};

export default ProviderDashboard;
