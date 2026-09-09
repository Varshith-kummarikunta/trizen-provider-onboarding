import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { getFileUrl } from '../../services/api';
import { SERVICE_CATEGORIES, DOCUMENT_TYPES } from '../../utils/constants';
import TagInput from '../../components/forms/TagInput';
import FileUploadDropzone from '../../components/forms/FileUploadDropzone';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DocumentViewerModal from '../../components/admin/DocumentViewerModal';
import {
  User,
  Briefcase,
  MapPin,
  FileText,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  Loader2,
  Send,
} from 'lucide-react';

export const ProviderOnboarding = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState(0);
  const [serviceLocations, setServiceLocations] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('identity');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await providerService.getProfile();
      if (res.success && res.data) {
        const p = res.data.profile;
        setProfile(p);
        setFullName(p.fullName || '');
        setPhone(p.phone || '');
        setBio(p.bio || '');
        setCategories(p.categories || []);
        setSkills(p.skills || []);
        setExperience(p.experience || 0);
        setServiceLocations(p.serviceLocations || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch onboarding profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isEditable = profile?.status === 'draft' || profile?.status === 'rejected';

  // Save current step data to backend
  const handleSaveStep = async (silent = false) => {
    if (!isEditable) return;
    try {
      setSaving(true);
      setError('');
      if (!silent) setSuccessMsg('');

      const res = await providerService.updateProfile({
        fullName,
        phone,
        bio,
        categories,
        skills,
        experience: Number(experience),
        serviceLocations,
      });

      if (res.success && res.data) {
        setProfile(res.data.profile);
        if (!silent) {
          setSuccessMsg('Progress saved successfully.');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to save progress.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSaveStep(true);
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Category selection
  const toggleCategory = (cat) => {
    if (!isEditable) return;
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  // Profile Photo Upload Handler
  const handlePhotoUpload = async (file) => {
    if (!isEditable) return;
    try {
      setIsUploadingPhoto(true);
      setError('');
      const res = await providerService.uploadPhoto(file);
      if (res.success && res.data) {
        setProfile((prev) => ({
          ...prev,
          profilePhoto: res.data.profilePhoto,
        }));
        setSuccessMsg('Profile photo updated.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err?.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Document Upload Handler
  const handleDocumentUpload = async (file) => {
    if (!isEditable) return;
    try {
      setIsUploadingDoc(true);
      setError('');
      const res = await providerService.uploadDocument(file, selectedDocType);
      if (res.success && res.data) {
        setProfile((prev) => ({
          ...prev,
          documents: res.data.documents,
        }));
        setSuccessMsg('Verification document uploaded.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err?.message || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Document Deletion Handler
  const handleDeleteDocument = async (docId) => {
    if (!isEditable) return;
    if (!window.confirm('Are you sure you want to remove this verification document?')) return;
    try {
      const res = await providerService.deleteDocument(docId);
      if (res.success && res.data) {
        setProfile((prev) => ({
          ...prev,
          documents: res.data.documents,
        }));
        setSuccessMsg('Document removed.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err?.message || 'Failed to delete document.');
    }
  };

  // Final Application Submission Handler
  const handleSubmitApplication = async () => {
    try {
      setSubmitting(true);
      setError('');

      // First save all latest data
      await providerService.updateProfile({
        fullName,
        phone,
        bio,
        categories,
        skills,
        experience: Number(experience),
        serviceLocations,
      });

      // Submit
      const res = await providerService.submitApplication();
      if (res.success) {
        navigate('/provider/status');
      }
    } catch (err) {
      const errorsList = err?.errors?.join(', ');
      setError(errorsList ? `${err.message}: ${errorsList}` : err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading onboarding portal..." />;
  }

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Services & Skills', icon: Briefcase },
    { number: 3, title: 'Service Locations', icon: MapPin },
    { number: 4, title: 'Verification Docs', icon: FileText },
    { number: 5, title: 'Review & Submit', icon: CheckSquare },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1 block">
            Partner Onboarding Program
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Provider Application
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {currentStep} of 5: {steps[currentStep - 1].title}
          </p>
        </div>
        <StatusBadge status={profile?.status || 'draft'} size="lg" />
      </div>

      {/* Lock Notification if not editable */}
      {!isEditable && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-sm">Application Locked from Modification</p>
            <p className="mt-0.5 text-amber-800">
              Your profile is currently <strong>{profile?.status}</strong>. In accordance with platform compliance rules, submitted or approved applications cannot be directly edited.
            </p>
            <Link
              to="/provider/status"
              className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline mt-2"
            >
              View Application Timeline &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Rejection Remarks Notice if rejected */}
      {profile?.status === 'rejected' && profile?.rejectionRemarks && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-sm text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Admin Feedback on Previous Submission:
          </p>
          <p className="p-3 bg-white rounded-xl border border-rose-200 font-medium text-slate-800">
            "{profile.rejectionRemarks}"
          </p>
          <p className="text-[11px] text-rose-600">
            Please make the required adjustments below and re-submit your application at Step 5.
          </p>
        </div>
      )}

      {/* Visual Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <React.Fragment key={s.number}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.number)}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold mt-2 ${
                      isCurrent
                        ? 'text-brand-600'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > s.number ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
        {/* ================= STEP 1: PERSONAL INFO ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell clients and verification officers about yourself
              </p>
            </div>

            {/* Profile Photo Section */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {profile?.profilePhoto?.url ? (
                  <img
                    src={getFileUrl(profile.profilePhoto.url)}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-2xl border border-brand-200">
                    {fullName?.charAt(0) || 'P'}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-800">Profile Photo</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a professional, front-facing image (JPG, PNG, WEBP max 5MB).
                </p>

                {isEditable && (
                  <div className="mt-3">
                    <FileUploadDropzone
                      onUpload={handlePhotoUpload}
                      accept="image/jpeg,image/png,image/webp"
                      maxSizeMB={5}
                      title="Upload New Photo"
                      subtitle="Click or drop a picture"
                      allowedFormatsText="JPG, PNG up to 5MB"
                      isUploading={isUploadingPhoto}
                      disabled={!isEditable}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!isEditable}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  disabled={!isEditable}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Professional Bio & Introduction
              </label>
              <textarea
                rows={4}
                disabled={!isEditable}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your craft, work ethic, and background..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all disabled:bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2: SERVICES & SKILLS ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Services & Experience</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your service specializations, technical skills, and years on the job
              </p>
            </div>

            {/* Service Categories Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Service Categories <span className="text-rose-500">*</span> (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isSelected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      disabled={!isEditable}
                      onClick={() => toggleCategory(cat)}
                      className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      } ${!isEditable ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <span>{cat}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Years of Experience */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Years of Professional Experience <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="50"
                  disabled={!isEditable}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-500">
                  {Number(experience) === 1 ? 'Year' : 'Years'} in professional service delivery
                </span>
              </div>
            </div>

            {/* Skills Tag Input */}
            <div>
              <TagInput
                label="Specialized Skills & Tools"
                placeholder="e.g. Wiring, Inverter Repair, Tile Cutting..."
                tags={skills}
                onChange={setSkills}
                disabled={!isEditable}
                helperText="Type a skill and hit Enter or comma to add."
              />
            </div>
          </div>
        )}

        {/* ================= STEP 3: SERVICE LOCATIONS ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Locations</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify cities, districts, or localized service clusters you operate in
              </p>
            </div>

            <div>
              <TagInput
                label="Serviceable Neighborhoods / Cities"
                placeholder="e.g. Bengaluru - Whitefield, Koramangala, Indiranagar..."
                tags={serviceLocations}
                onChange={setServiceLocations}
                disabled={!isEditable}
                helperText="Type an area or city and press Enter to save."
              />
            </div>

            {/* Popular quick add recommendations */}
            {isEditable && (
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Quick Add Recommendations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Bengaluru - Whitefield',
                    'Bengaluru - Indiranagar',
                    'Bengaluru - Koramangala',
                    'Bengaluru - HSR Layout',
                    'Mumbai - Andheri',
                    'Delhi NCR - Gurgaon',
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        if (!serviceLocations.includes(loc)) {
                          setServiceLocations([...serviceLocations, loc]);
                        }
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: VERIFICATION DOCUMENTS ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Verification Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload sample verification records (PDF, PNG, or JPG up to 10MB).
              </p>
            </div>

            {/* Safe Demo Notice */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
              <span className="font-bold block mb-0.5">Safe Demonstration Protocol</span>
              Do not upload sensitive government identity cards. You may upload sample/test documents or mock certificates for evaluation.
            </div>

            {isEditable && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Document Category
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <FileUploadDropzone
                  onUpload={handleDocumentUpload}
                  accept="application/pdf,image/jpeg,image/png"
                  maxSizeMB={10}
                  title="Upload Verification Document"
                  subtitle="Drag and drop PDF or image file"
                  allowedFormatsText="PDF, JPG, PNG up to 10MB"
                  isUploading={isUploadingDoc}
                  disabled={!isEditable}
                />
              </div>
            )}

            {/* Uploaded Documents List */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Uploaded Verification Documents ({profile?.documents?.length || 0})
              </h4>

              {profile?.documents?.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {profile.documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2 rounded-lg bg-brand-50 text-brand-600 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {doc.fileName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="capitalize font-medium text-slate-600">
                              {doc.documentType}
                            </span>
                            <span>&bull;</span>
                            <span>
                              {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                            </span>
                            <span>&bull;</span>
                            <span>
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  No documents uploaded yet. Please upload at least one document to proceed with submission.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review & Submit Application</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify all application details before transmitting for admin verification
              </p>
            </div>

            {/* Completeness Checklist */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Application Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {fullName && phone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span className={fullName && phone ? 'text-slate-800' : 'text-rose-600 font-semibold'}>
                    Full Name & Valid Phone Provided
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {categories.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span className={categories.length > 0 ? 'text-slate-800' : 'text-rose-600 font-semibold'}>
                    At Least One Category Selected ({categories.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {skills.length > 0 && typeof Number(experience) === 'number' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span className={skills.length > 0 ? 'text-slate-800' : 'text-rose-600 font-semibold'}>
                    Skills & Experience Specified ({experience} yrs)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {serviceLocations.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span className={serviceLocations.length > 0 ? 'text-slate-800' : 'text-rose-600 font-semibold'}>
                    Service Locations Designated ({serviceLocations.length})
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  {profile?.documents?.length > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  )}
                  <span className={profile?.documents?.length > 0 ? 'text-slate-800' : 'text-rose-600 font-semibold'}>
                    Verification Documents Uploaded ({profile?.documents?.length || 0})
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Preview Dossier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Applicant Identity
                </span>
                <p><strong>Name:</strong> {fullName || 'N/A'}</p>
                <p><strong>Phone:</strong> {phone || 'N/A'}</p>
                <p><strong>Bio:</strong> {bio || 'No bio provided'}</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                  Professional Scope
                </span>
                <p><strong>Categories:</strong> {categories.join(', ') || 'None'}</p>
                <p><strong>Experience:</strong> {experience} Years</p>
                <p><strong>Skills:</strong> {skills.join(', ') || 'None'}</p>
                <p><strong>Locations:</strong> {serviceLocations.join(', ') || 'None'}</p>
              </div>
            </div>

            {/* Submission CTA */}
            {isEditable ? (
              <div className="p-6 bg-brand-50 border border-brand-200 rounded-2xl text-center space-y-3">
                <h3 className="text-base font-bold text-brand-950">
                  Ready to Submit for Admin Verification?
                </h3>
                <p className="text-xs text-brand-800 max-w-lg mx-auto">
                  By clicking Submit, your profile status will change to <strong>PENDING</strong> and data will be locked while under official review.
                </p>

                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transmitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application for Verification
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-xl text-center text-xs text-slate-500">
                Application has already been submitted ({profile?.status}).
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation Controls */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-3">
          {isEditable && (
            <button
              type="button"
              onClick={() => handleSaveStep(false)}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-xl transition-colors border border-brand-200"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
          )}

          {currentStep < 5 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentViewerModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
};

export default ProviderOnboarding;
