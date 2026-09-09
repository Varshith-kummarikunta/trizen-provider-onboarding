import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export const TagInput = ({
  tags = [],
  onChange,
  placeholder = 'Type and press Enter...',
  disabled = false,
  label = '',
  helperText = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const clean = inputValue.trim().replace(/^,|,$/g, '');
    if (clean && !tags.includes(clean)) {
      onChange([...tags, clean]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    if (disabled) return;
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 p-2.5 rounded-xl border bg-white transition-all ${
          disabled
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed'
            : 'border-slate-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20'
        }`}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 animate-fadeIn"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-brand-500 hover:text-brand-800 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <div className="flex-1 flex items-center min-w-[140px]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : 'Add another...'}
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:outline-none focus:ring-0 p-1"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={addTag}
                className="p-1 text-brand-600 hover:bg-brand-50 rounded-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
};

export default TagInput;
