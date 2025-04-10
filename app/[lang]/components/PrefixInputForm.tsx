'use client';

import React, { useState } from 'react';
import { RenameMode } from '../../types';
import { useDictionary } from './client-dictionary';

interface PrefixInputFormProps {
  prefix: string;
  selectedCount: number;
  onPrefixChange: (value: string) => void;
  onApplyPrefix: () => void;
  renameMode: RenameMode;
  onRenameModeChange: (mode: RenameMode) => void;
  suffix: string;
  onSuffixChange: (value: string) => void;
  customSequence: string;
  onCustomSequenceChange: (value: string) => void;
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
  onApplyPrefix,
  renameMode,
  onRenameModeChange,
  suffix,
  onSuffixChange,
  customSequence,
  onCustomSequenceChange
}) => {
  const dict = useDictionary();
  
  if (selectedCount === 0) return null;

  const isAmazonMode = renameMode === RenameMode.AMAZON;
  const isPrefixIndexMode = renameMode === RenameMode.PREFIX_INDEX;
  const isCustomSequenceMode = renameMode === RenameMode.CUSTOM_SEQUENCE;
  const isAIGeneratedMode = renameMode === RenameMode.AI_GENERATED;

  // 根据重命名模式判断是否需要禁用应用按钮
  const isApplyButtonDisabled = () => {
    if (isAmazonMode) {
      return selectedCount === 0 || !prefix.trim();
    } else if (isPrefixIndexMode) {
      return selectedCount === 0; // 前缀和后缀可以为空
    } else if (isCustomSequenceMode) {
      return selectedCount === 0 || !customSequence.trim();
    } else if (isAIGeneratedMode) {
      // TODO: 检查是否已配置AI服务
      return selectedCount === 0;
    }
    return selectedCount === 0;
  };

  return (
    // <div className="floating-prefix-form">
      <div className="rename-options">
        <div className="rename-mode-selector">
          <label>{dict.formLabels.renameModeLabel}</label>
          <select 
            value={renameMode} 
            onChange={(e) => onRenameModeChange(e.target.value as RenameMode)}
            className="rename-mode-select"
          >
            <option value={RenameMode.AMAZON}>{dict.renameOptions.amazon}</option>
            <option value={RenameMode.PREFIX_INDEX}>{dict.renameOptions.prefixIndex}</option>
            <option value={RenameMode.CUSTOM_SEQUENCE}>{dict.renameOptions.customSequence}</option>
            <option value={RenameMode.AI_GENERATED}>{dict.renameOptions.aiGenerated}</option>
          </select>
        </div>

        {/* Amazon规则和前缀-序号-后缀模式显示前缀输入框 */}
        {(isAmazonMode || isPrefixIndexMode) && (
          <div className="prefix-container">
            <input 
              type="text" 
              placeholder={isAmazonMode ? dict.placeholders.amazonSku : dict.placeholders.prefixOptional}
              value={prefix}
              onChange={(e) => onPrefixChange(e.target.value)}
              className="prefix-input"
            />
          </div>
        )}

        {/* 前缀-序号-后缀模式显示后缀输入框 */}
        {isPrefixIndexMode && (
          <div className="suffix-container">
            <input 
              type="text" 
              placeholder={dict.placeholders.suffixOptional} 
              value={suffix}
              onChange={(e) => onSuffixChange(e.target.value)}
              className="suffix-input"
            />
          </div>
        )}

        {/* 自定义序列模式只显示自定义序列输入框 */}
        {isCustomSequenceMode && (
          <div className="custom-sequence-container">
            <input 
              type="text" 
              placeholder={dict.placeholders.customSequenceHint} 
              value={customSequence}
              onChange={(e) => onCustomSequenceChange(e.target.value)}
              className="custom-sequence-input"
            />
          </div>
        )}

        {/* AI生成模式显示提示 */}
        {isAIGeneratedMode && (
          <div className="ai-mode-info">
            <span className="ai-mode-tip">{dict.selectionInfo.aiModeTip}</span>
          </div>
        )}

        <button 
          onClick={onApplyPrefix}
          disabled={isApplyButtonDisabled()}
          className="apply-button"
        >
          {dict.buttons.rename}
        </button>
      </div>
    // </div>
  );
};

export default PrefixInputForm; 