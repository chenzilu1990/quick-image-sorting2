export default {
  config: {
    // ... existing config content ...
  },
  errors: {
    // ... existing errors ...
    missingGithubFields: '请填写所有GitHub必填字段',
    missingApiUrl: '请输入API URL',
    missingAwsFields: '请填写所有AWS S3必填字段',
    awsConnectionFailed: 'AWS S3连接失败: {message}',
    invalidCredentials: '无效的凭证',
    bucketNotFound: '存储桶未找到或无法访问',
  },
  status: {
    // ... existing status ...
    autoSaving: '自动保存中...',
    configChanged: '配置已更改，未保存',
    pendingSave: '待保存...',
    configSaved: '✓ 配置已保存',
    saveFailed: '❌ 保存失败',
    connectionSuccess: '✓ 连接成功 {version}',
    connectionPartial: '⚠️ 部分连接成功，但权限可能有限',
    connectionFailed: '❌ 连接失败: {message}',
    testNotImplemented: '测试功能未实现，请直接上传测试',
    awsSDKMissing: '未发现AWS SDK，使用备用测试方法',
  },
  // ... existing dict content ...
}; 