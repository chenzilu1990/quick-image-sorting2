'use client';

import { useState, useEffect } from 'react';
import type { Workflow, ImageFile } from '@/types';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface WorkflowModalProps {
  isOpen?: boolean;
  isLoading: boolean;
  availableWorkflows: Workflow[];
  selectedWorkflow: string;
  onWorkflowSelect: (workflowId: string) => void;
  onClose: () => void;
  onEditWithComfyUI: () => void;
}

/**
 * 工作流选择模态框组件
 * 
 * 用于在编辑图片前选择ComfyUI工作流
 */
export default function WorkflowModal({
  isOpen = true,
  isLoading,
  availableWorkflows,
  selectedWorkflow,
  onWorkflowSelect,
  onClose,
  onEditWithComfyUI
}: WorkflowModalProps) {
  const dict = useDictionary();
  
  if (!isOpen) return null;

  return (
    <div className="workflow-modal">
      <div className="workflow-modal-content relative pb-16">
        <div className="workflow-modal-header">
          <h3>{dict.modals.workflowTitle}</h3>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        {isLoading ? (
          <p className="loading-text">{dict.modals.workflowLoading}</p>
        ) : (
          availableWorkflows.length > 0 ? (
            <div className="workflow-select">
              <select
                value={selectedWorkflow}
                onChange={(e) => onWorkflowSelect(e.target.value)}
              >
                <option value="">{dict.modals.workflowDefault}</option>
                {availableWorkflows.map(workflow => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} ({new Date(workflow.timestamp * 1000).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="no-workflows">{dict.modals.workflowEmpty}</p>
          )
        )}
        
        <div className="workflow-modal-footer absolute bottom-0 left-0 right-0 p-4 flex justify-end gap-2 border-t">
          <Button variant="secondary" onClick={onClose}>{dict.buttons.cancel}</Button>
          <Button 
            variant="primary"
            onClick={onEditWithComfyUI} 
            disabled={isLoading}
          >
            {dict.buttons.proceed}
          </Button>
        </div>
      </div>
    </div>
  );
} 