export const SERVICE_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'AC Technician',
  'Appliance Repair',
  'Cleaning',
  'Beauty & Salon',
  'Driver',
  'Tutor',
  'Pest Control',
  'Other',
];

export const DOCUMENT_TYPES = [
  { value: 'identity', label: 'Identity Proof (e.g. ID Card, Passport)' },
  { value: 'address', label: 'Address Proof (e.g. Utility Bill, Rent Agreement)' },
  { value: 'certificate', label: 'Skill / Trade Certificate' },
  { value: 'other', label: 'Other Verification Document' },
];

export const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
    title: 'Profile Incomplete',
    description: 'Complete your onboarding application and submit for admin review.',
  },
  pending: {
    label: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-400 animate-pulse',
    title: 'Application Under Review',
    description: 'Your application has been submitted and is currently being verified by our operations team.',
  },
  approved: {
    label: 'Verified & Approved',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    title: 'Application Approved',
    description: 'Congratulations! Your profile is verified and active on the Trizen platform.',
  },
  rejected: {
    label: 'Needs Changes',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    title: 'Application Needs Revision',
    description: 'The admin requested modifications to your application. Please review feedback remarks and resubmit.',
  },
};
