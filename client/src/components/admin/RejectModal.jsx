import React, { useState } from 'react';
import Modal from '../common/Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const RejectModal = ({
  isOpen,
  onClose,
  onConfirm,
  providerName = 'Provider',
  isLoading = false,
}) => {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const quickRemarks = [
    'Uploaded identity proof is blurry or illegible. Please re-upload a clear copy.',
    'Trade certification is expired or invalid for the selected category.',
    'Service location areas require more specificity.',
    'Experience details do not match the uploaded documentation.',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Rejection remarks are mandatory to explain required changes.');
      return;
    }
    setError('');
    onConfirm(remarks.trim());
  };

  const handleClose = () => {
    setRemarks('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Provider Application"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Application Revision Notice</p>
            <p className="mt-0.5 text-rose-700">
              Rejecting will unlock the application for <strong>{providerName}</strong> to update details and re-submit. Remarks are sent to the provider.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Rejection Remarks / Correction Feedback <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError('');
            }}
            placeholder="Clearly describe what needs to be changed (e.g., re-upload document, clarify service experience)..."
            className="w-full text-sm rounded-xl border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
          />
          {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-1.5">
            Quick Feedback Templates:
          </span>
          <div className="flex flex-col gap-1.5">
            {quickRemarks.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRemarks(template)}
                className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              >
                "{template}"
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Confirm Rejection'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectModal;
