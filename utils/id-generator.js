// 统一的ID生成器
export function generateId() {
  // 使用crypto.randomUUID()如果可用（现代浏览器）
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // 降级方案：使用Date.now() + 随机数 + 递增计数器
  // 确保在单个会话中不会重复
  if (!global._idCounter) {
    global._idCounter = 0
  }
  global._idCounter++
  
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  const counter = global._idCounter.toString(36)
  
  return `${timestamp}_${random}_${counter}`
}

// 生成短ID（用于简单场景）
export function generateShortId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}
