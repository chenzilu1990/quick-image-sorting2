'use client';

import { useState, useEffect } from 'react';
import type { Workflow, ImageFile } from '../types';

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
  if (!isOpen) return null;

  return (
    <div className="workflow-modal">
      <div className="workflow-modal-content">
        <div className="workflow-modal-header">
          <h3>选择ComfyUI工作流</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        {isLoading ? (
          <p className="loading-text">正在加载工作流列表...</p>
        ) : (
          availableWorkflows.length > 0 ? (
            <div className="workflow-select">
              <select
                value={selectedWorkflow}
                onChange={(e) => onWorkflowSelect(e.target.value)}
              >
                <option value="">-- 使用默认工作流 --</option>
                {availableWorkflows.map(workflow => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name} ({new Date(workflow.timestamp * 1000).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="no-workflows">未找到可用的工作流，请先在ComfyUI中创建工作流</p>
          )
        )}
        
        <div className="workflow-modal-footer">
          <button onClick={onClose} className="cancel-btn">取消</button>
          <button 
            onClick={onEditWithComfyUI} 
            className="proceed-btn"
            disabled={isLoading}
          >
            前往编辑
          </button>
        </div>
      </div>
    </div>
  );
} 