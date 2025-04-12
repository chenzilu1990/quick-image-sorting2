'use client';

import React, { useState, useMemo } from 'react';
import { RenameMode } from '@/types';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

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

  // 生成预览文件名
  const previewFileName = useMemo(() => {
    const fileExt = '.jpg'; // 假设扩展名
    const safePrefix = prefix || '';
    const safeSuffix = suffix || '';
    const sequences = customSequence.split(',').map(s => s.trim()).filter(Boolean);

    switch (renameMode) {
      case RenameMode.AMAZON:
        return `${safePrefix || dict.placeholders.amazonSku}.MAIN${fileExt}`;
      case RenameMode.PREFIX_INDEX:
        return `${safePrefix}01${safeSuffix}${fileExt}`;
      case RenameMode.CUSTOM_SEQUENCE:
        const firstSeq = sequences[0] || 'Seq1';
        return `${firstSeq}${fileExt}`;
      case RenameMode.AI_GENERATED:
        return dict.placeholders.aiPreview; // 使用占位符
      default:
        return `preview${fileExt}`;
    }
  }, [prefix, suffix, customSequence, renameMode, dict]);

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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow">
      <div className="flex items-center">
        <Label htmlFor="rename-mode" className="mr-2 whitespace-nowrap">{dict.formLabels.renameModeLabel}</Label>
        <Select 
          id="rename-mode"
          value={renameMode} 
          onChange={(e) => onRenameModeChange(e.target.value as RenameMode)}
          className="min-w-[200px]"
        >
          <option value={RenameMode.AMAZON}>{dict.renameOptions.amazon}</option>
          <option value={RenameMode.PREFIX_INDEX}>{dict.renameOptions.prefixIndex}</option>
          <option value={RenameMode.CUSTOM_SEQUENCE}>{dict.renameOptions.customSequence}</option>
          <option value={RenameMode.AI_GENERATED}>{dict.renameOptions.aiGenerated}</option>
        </Select>
      </div>

      <div className="flex flex-grow gap-x-4 gap-y-2 items-center flex-wrap">
        {(isAmazonMode || isPrefixIndexMode) && (
          <div className="flex-1 min-w-[150px]">
            <Input 
              type="text" 
              placeholder={isAmazonMode ? dict.placeholders.amazonSku : dict.placeholders.prefixOptional}
              value={prefix}
              onChange={(e) => onPrefixChange(e.target.value)}
            />
          </div>
        )}

        {isPrefixIndexMode && (
          <div className="flex-1 min-w-[150px]">
            <Input 
              type="text" 
              placeholder={dict.placeholders.suffixOptional} 
              value={suffix}
              onChange={(e) => onSuffixChange(e.target.value)}
            />
          </div>
        )}

        {isCustomSequenceMode && (
          <div className="flex-1 min-w-[250px]">
            <Input 
              type="text" 
              placeholder={dict.placeholders.customSequenceHint} 
              value={customSequence}
              onChange={(e) => onCustomSequenceChange(e.target.value)}
            />
          </div>
        )}

        {isAIGeneratedMode && (
          <div className="p-2 bg-blue-100 text-blue-800 rounded border border-blue-200 text-sm">
            <span className="ai-mode-tip">{dict.selectionInfo.aiModeTip}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded min-w-[200px]">
        <Label className="font-semibold text-gray-600 whitespace-nowrap">{dict.formLabels.preview}</Label>
        <span className="font-mono text-sm bg-white px-2 py-0.5 rounded truncate">{previewFileName}</span>
      </div>

      <Button
        onClick={onApplyPrefix}
        disabled={isApplyButtonDisabled()}
        variant="warning"
        className="ml-auto whitespace-nowrap"
      >
        {dict.buttons.rename}
      </Button>
    </div>
  );
};

export default PrefixInputForm; 