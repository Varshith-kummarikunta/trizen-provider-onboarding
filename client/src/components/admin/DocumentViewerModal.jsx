import React from 'react';
import Modal from '../common/Modal';
import { getFileUrl } from '../../services/api';
import { ExternalLink, Download, FileText, Calendar, Tag, HardDrive } from 'lucide-react';

export const DocumentViewerModal = ({ isOpen, onClose, document: doc }) => {
  if (!doc) return null;

  const fullUrl = getFileUrl(doc.fileUrl);
  const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf') || doc.fileUrl?.toLowerCase().endsWith('.pdf');
  const isImage = !isPdf;

  const docTypeLabels = {
    identity: 'Identity Proof',
    address: 'Address Proof',
    certificate: 'Professional Certificate',
    other: 'General Verification Document',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doc.fileName || 'Document Preview'}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Metadata Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block flex items-center gap-1 font-medium">
              <Tag className="w-3.5 h-3.5" /> Type
            </span>
            <span className="font-semibold text-slate-800 capitalize mt-0.5 block">
              {docTypeLabels[doc.documentType] || doc.documentType}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block flex items-center gap-1 font-medium">
              <HardDrive className="w-3.5 h-3.5" /> Size
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Uploaded
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
          </div>
        </div>

        {/* Document Viewer Frame */}
        <div className="rounded-xl border border-slate-200 bg-slate-900/5 overflow-hidden flex items-center justify-center min-h-[360px] max-h-[500px]">
          {isImage ? (
            <img
              src={fullUrl}
              alt={doc.fileName}
              className="max-h-[480px] w-auto max-w-full object-contain p-2 rounded-lg"
            />
          ) : isPdf ? (
            <iframe
              src={fullUrl}
              title={doc.fileName}
              className="w-full h-[450px] border-0 rounded-lg"
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Preview not directly available for this format.
              </p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewerModal;
