import React from 'react';
import { STATUS_CONFIG } from '../../utils/constants';

export const StatusBadge = ({ status = 'draft', size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.badgeClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`rounded-full ${config.dotClass} ${dotSizes[size] || dotSizes.md}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
