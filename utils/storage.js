// 本地存储工具
const STORAGE_KEY = 'family_simulator_save'

export const saveGame = (data) => {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存游戏失败:', e)
    return false
  }
}

export const loadGame = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取存档失败:', e)
    return null
  }
}

export const hasSavedGame = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return !!data
  } catch (e) {
    return false
  }
}

export const deleteSave = () => {
  try {
    uni.removeStorageSync(STORAGE_KEY)
    return true
  } catch (e) {
    console.error('删除存档失败:', e)
    return false
  }
}