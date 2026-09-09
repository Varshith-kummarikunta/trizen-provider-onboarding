import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { getFileUrl } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DocumentViewerModal from '../../components/admin/DocumentViewerModal';
import RejectModal from '../../components/admin/RejectModal';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const AdminProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchProviderDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getProviderById(id);
      if (res.success && res.data) {
        setProvider(res.data.provider);
      }
    } catch (err) {
      setError(err?.message || 'Failed to retrieve provider dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDetail();
  }, [id]);

  // Handle Approve
  const handleApprove = async () => {
    try {
      setIsActionLoading(true);
      setError('');
      const res = await adminService.approveProvider(id);
      if (res.success && res.data) {
        setProvider(res.data.provider);
        setIsApproveModalOpen(false);
        setSuccessMsg('Provider application has been approved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err?.message || 'Failed to approve provider.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async (remarks) => {
    try {
      setIsActionLoading(true);
      setError('');
      const res = await adminService.rejectProvider(id, remarks);
      if (res.success && res.data) {
        setProvider(res.data.provider);
        setIsRejectModalOpen(false);
        setSuccessMsg('Provider application rejected. Feedback delivered to applicant.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err?.message || 'Failed to reject provider.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading applicant dossier..." />;
  }

  if (error || !provider) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error || 'Provider record not found.'}</p>
        <Link
          to="/admin/providers"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Providers
        </Link>
      </div>
    );
  }

  const isPending = provider.status === 'pending';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/providers"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to Provider Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {provider.fullName || provider.user?.name || 'Applicant'}
              </h1>
              <StatusBadge status={provider.status} size="lg" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered Account ID: <span className="font-mono">{provider._id}</span>
            </p>
          </div>
        </div>

        {/* Action Decision Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition-all"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            {provider.status === 'rejected' ? 'Update Remarks' : 'Reject Application'}
          </button>

          <button
            type="button"
            onClick={() => setIsApproveModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            {provider.status === 'approved' ? 'Re-Approve' : 'Approve Application'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Rejection History Alert if currently rejected */}
      {provider.status === 'rejected' && provider.rejectionRemarks && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-sm text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Currently Rejected with Feedback:
          </p>
          <p className="p-3 bg-white rounded-xl border border-rose-200 font-semibold text-slate-800">
            "{provider.rejectionRemarks}"
          </p>
          <p className="text-[10px] text-slate-500">
            Applicant has been notified and can update details to resubmit.
          </p>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Personal & Account Dossier */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="relative inline-block mx-auto">
              {provider.profilePhoto?.url ? (
                <img
                  src={getFileUrl(provider.profilePhoto.url)}
                  alt={provider.fullName}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-md mx-auto"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-purple-100 text-purple-700 font-bold text-3xl flex items-center justify-center mx-auto border-4 border-slate-100">
                  {provider.fullName?.charAt(0) || 'P'}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {provider.fullName || provider.user?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Service Partner Applicant</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left text-xs space-y-3">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{provider.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{provider.phone || 'No phone set'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Joined {new Date(provider.createdAt).toLocaleDateString()}</span>
              </div>
              {provider.submittedAt && (
                <div className="flex items-center gap-2.5 text-amber-700 font-medium">
                  <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>Submitted {new Date(provider.submittedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Professional Bio
            </span>
            <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
              {provider.bio || 'Applicant did not provide a bio.'}
            </p>
          </div>
        </div>

        {/* Right Col: Qualifications & Verification Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services, Experience & Locations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Professional Capabilities & Coverage
            </h3>

            {/* Service Categories */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Applied Categories
              </span>
              <div className="flex flex-wrap gap-2">
                {provider.categories?.length > 0 ? (
                  provider.categories.map((c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No categories selected</span>
                )}
              </div>
            </div>

            {/* Experience & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Field Experience
                </span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {provider.experience} {provider.experience === 1 ? 'Year' : 'Years'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Specific Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {provider.skills?.length > 0 ? (
                    provider.skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Service Locations */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Service Locations & Clusters
              </span>
              <div className="flex flex-wrap gap-2">
                {provider.serviceLocations?.length > 0 ? (
                  provider.serviceLocations.map((loc, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No locations specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Verification Documents Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Verification Records ({provider.documents?.length || 0})
              </h3>
              <span className="text-xs text-slate-400">Click to preview document</span>
            </div>

            {provider.documents?.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {provider.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-700 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="capitalize font-semibold text-purple-700">
                            {doc.documentType}
                          </span>
                          <span>&bull;</span>
                          <span>{doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}</span>
                          <span>&bull;</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Applicant has not uploaded any verification documents yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Approval */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Service Provider"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">Confirm Partner Approval</p>
              <p className="text-emerald-800 mt-0.5">
                Are you sure you want to approve <strong>{provider.fullName || provider.user?.name}</strong>?
                Their status will become <strong>APPROVED</strong> and their profile will be verified on the platform.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={isActionLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving...
                </>
              ) : (
                'Yes, Approve Application'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal with Remarks */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        providerName={provider.fullName || provider.user?.name}
        isLoading={isActionLoading}
      />

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
};

export default AdminProviderDetail;
