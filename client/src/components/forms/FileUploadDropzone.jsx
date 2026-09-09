import React, { useState, useRef } from 'react';
import { UploadCloud, File, Image, Check, AlertCircle, Loader2 } from 'lucide-react';

export const FileUploadDropzone = ({
  onUpload,
  accept = 'image/*',
  maxSizeMB = 5,
  title = 'Upload a file',
  subtitle = 'Drag and drop or browse from your device',
  allowedFormatsText = 'PNG, JPG, JPEG up to 5MB',
  isUploading = false,
  disabled = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setSelectedFile(file);

    // Create preview if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile || disabled || isUploading) return;
    try {
      await onUpload(selectedFile);
      // Reset state on successful upload
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err?.message || 'Failed to upload file.');
    }
  };

  const clearSelected = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
            : dragOver
            ? 'bg-brand-50/70 border-brand-500 scale-[1.01]'
            : 'bg-white hover:bg-slate-50/70 border-slate-300 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            <span className="text-[11px] text-slate-400 font-medium mt-2 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {allowedFormatsText}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-24 h-24 object-cover rounded-xl shadow-md mb-3 border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                <File className="w-8 h-8 text-brand-600" />
              </div>
            )}
            <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUploadClick();
                }}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Confirm & Upload
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelected();
                }}
                disabled={isUploading}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploadDropzone;
