'use client';

import React from 'react';

interface PrefixInputFormProps {
  prefix: string;
  selectedCount: number;
  onPrefixChange: (value: string) => void;
  onApplyPrefix: () => void;
}

/**
 * 前缀输入表单组件
 * 
 * 提供输入前缀并应用到选中图片的功能
 */
const PrefixInputForm: React.FC<PrefixInputFormProps> = ({
  prefix,
  selectedCount,
  onPrefixChange,
  onApplyPrefix
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="floating-prefix-form">
      <input 
        type="text" 
        placeholder="输入前缀..." 
        value={prefix}
        onChange={(e) => onPrefixChange(e.target.value)}
        className="prefix-input"
      />
      <button 
        onClick={onApplyPrefix}
        disabled={selectedCount === 0 || !prefix.trim()}
        className="apply-button"
      >
        应用前缀
      </button>
    </div>
  );
};

export default PrefixInputForm; 