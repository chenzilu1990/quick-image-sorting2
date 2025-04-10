'use client';

import { useState, useEffect } from 'react';
import type { Workflow, ImageFile } from '../types';
import { useDictionary } from './client-dictionary';

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
      <div className="workflow-modal-content">
        <div className="workflow-modal-header">
          <h3>{dict.modals.workflowTitle}</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
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
        
        <div className="workflow-modal-footer">
          <button onClick={onClose} className="cancel-btn">{dict.buttons.cancel}</button>
          <button 
            onClick={onEditWithComfyUI} 
            className="proceed-btn"
            disabled={isLoading}
          >
            {dict.buttons.proceed}
          </button>
        </div>
      </div>
    </div>
  );
} 