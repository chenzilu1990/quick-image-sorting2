'use client';

import React from 'react';

interface EmptyStateMessageProps {
  message?: string;
}

/**
 * 空状态消息组件
 * 
 * 当没有图片时显示的提示信息
 */
const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ 
  message = '请拖拽或选择图片以开始排序'
}) => {
  return (
    <div className="empty-message">
      <p>{message}</p>
      <div className="empty-illustration">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="empty-help-text">双击页面任意位置或拖放图片到此处</p>
    </div>
  );
};

export default EmptyStateMessage; 