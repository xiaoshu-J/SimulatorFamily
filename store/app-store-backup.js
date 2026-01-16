// 简单的全局状态管理
import { reactive } from 'vue'
import { triggerRandomEvent } from '../utils/events.js'

let state = reactive({
  // 游戏主数据
  game: {
    familyName: '新家族',
    generation: 1,
    totalWealth: 100000,
    currentDate: '2025-01-01',
    isGameStarted: false,
    yearlyIncome: 0,
    yearlyExpense: 0
  },
  // 家族成员列表
  members: [],
  // 游戏设置
  settings: {
    autoSave: true,
    gameSpeed: 1 // 游戏速度：1, 5, 10
  },
  // 职业收入配置（年收入）
  occupationIncome: {
    '无业': 0,
    '医生': 150000,
    '工程师': 120000,
    '教师': 80000,
    '商人': 200000,
    '艺术家': 60000,
    '程序员': 130000,
    '律师': 180000,
    '科学家': 160000,
    '运动员': 100000,
    '厨师': 70000
  },
  // 成就系统
  achievements: [
    {
      id: 'first_baby',
      name: '第一代',
      description: '家族迎来第一个新生儿',
      unlocked: false,
      icon: '🍼'
    },
    {
      id: '3_generations',
      name: '三代同堂',
      description: '同时存在三代在世成员',
      unlocked: false,
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'wealth_100k',
      name: '小有积蓄',
      description: '家族资产达到10万',
      unlocked: false,
      icon: '💰'
    },
    {
      id: 'wealth_500k',
      name: '中产阶级',
      description: '家族资产达到50万',
      unlocked: false,
      icon: '🏠'
    },
    {
      id: 'wealth_1m',
      name: '百万富翁',
      description: '家族资产达到100万',
      unlocked: false,
      icon: '💎'
    },
    {
      id: '10_members',
      name: '人丁兴旺',
      description: '家族成员达到10人',
      unlocked: false,
      icon: '👥'
    },
    {
      id: '5_generations',
      name: '百年家族',
      description: '传承至第五代',
      unlocked: false,
      icon: '🏛️'
    },
    {
      id: 'max_education',
      name: '书香门第',
      description: '培养出智力100的后代',
      unlocked: false,
      icon: '🎓'
    },
    {
      id: 'first_marriage',
      name: '喜结连理',
      description: '家族第一次婚姻',
      unlocked: false,
      icon: '💒'
    },
    {
      id: 'long_life',
      name: '长寿家族',
      description: '有成员活到90岁以上',
      unlocked: false,
      icon: '🎂'
    },
    // 新增成就
    {
      id: 'business_empire',
      name: '商业帝国',
      description: '拥有3个满级企业',
      unlocked: false,
      icon: '🏰'
    },
    {
      id: 'perfect_child',
      name: '完美后代',
      description: '培养出智力、外貌、健康都达到100的后代',
      unlocked: false,
      icon: '⭐'
    },
    {
      id: 'wealth_10m',
      name: '千万富翁',
      description: '家族资产达到1000万',
      unlocked: false,
      icon: '💰'
    },
    {
      id: 'long_life_5',
      name: '长寿家族',
      description: '有5个成员活到80岁以上',
      unlocked: false,
      icon: '🎂'
    },
    {
      id: 'divorce_first',
      name: '婚姻危机',
      description: '第一次离婚',
      unlocked: false,
      icon: '💔'
    },
    {
      id: 'business_diversified',
      name: '多元化经营',
      description: '拥有4种不同类型的企业',
      unlocked: false,
      icon: '🏢'
    },
    {
      id: 'education_investor',
      name: '教育投资者',
      description: '为5个子女进行教育投资',
      unlocked: false,
      icon: '📚'
    },
    {
      id: 'tragedy',
      name: '家族悲剧',
      description: '有3个成员因意外去世',
      unlocked: false,
      icon: '⚰️'
    },
    {
      id: 'renaissance',
      name: '家族复兴',
      description: '从资产低于1万恢复到100万',
      unlocked: false,
      icon: '🌟'
    }
  ],
  // 家族企业（数组，支持多个企业）
  familyBusinesses: [],
  // 游戏历史数据（用于图表展示）
  gameHistory: {
    wealth: [], // {date, value}
    members: [], // {date, count}
    events: [] // {date, type, description}
  },
  // 家族传承系统
  familyProperties: [], // 房产 {id, type, value, location, ownerId}
  familyHeirlooms: [] // 传家宝 {id, name, type, effect, ownerId}
})

// 生成唯一ID
function generateId() {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 获取状态
export function getState() {
  return state
}

// 设置状态
export function setState(newState) {
  state = { ...state, ...newState }
}

//  mutations
export function INIT_GAME(payload) {
  state.game = {
    ...state.game,
    ...payload,
    isGameStarted: true
  }
}

export function ADD_MEMBER(member) {
  state.members.push(member)
  
  // 检查成就：第一个婴儿（年龄为0且父母不为空）
  if (member.age === 0 && member.parents && member.parents.length > 0) {
    UNLOCK_ACHIEVEMENT('first_baby')
  }
  
  CHECK_ACHIEVEMENTS()
}

export function UPDATE_MEMBER({ id, updates }) {
  const index = state.members.findIndex(m => m.id === id)
  if (index !== -1) {
    // 数据验证和边界检查
    const validatedUpdates = { ...updates }
    
    // 健康值验证 (0-100)
    if (validatedUpdates.health !== undefined) {
      validatedUpdates.health = Math.max(0, Math.min(100, validatedUpdates.health))
    }
    
    // 快乐值验证 (0-100)
    if (validatedUpdates.happiness !== undefined) {
      validatedUpdates.happiness = Math.max(0, Math.min(100, validatedUpdates.happiness))
    }
    
    // 智力验证 (0-100)
    if (validatedUpdates.intelligence !== undefined) {
      validatedUpdates.intelligence = Math.max(0, Math.min(100, validatedUpdates.intelligence))
    }
    
    // 外貌验证 (0-100)
    if (validatedUpdates.appearance !== undefined) {
      validatedUpdates.appearance = Math.max(0, Math.min(100, validatedUpdates.appearance))
    }
    
    // 年龄验证 (不小于0)
    if (validatedUpdates.age !== undefined) {
      validatedUpdates.age = Math.max(0, validatedUpdates.age)
    }
    
    // 个人资金验证 (不小于0)
    if (validatedUpdates.money !== undefined) {
      validatedUpdates.money = Math.max(0, validatedUpdates.money)
    }
    
    state.members[index] = { ...state.members[index], ...validatedUpdates }
  }
}

export function REMOVE_MEMBER(memberId) {
  state.members = state.members.filter(m => m.id !== memberId)
}

export function ADVANCE_TIME(days) {
  const current = new Date(state.game.currentDate)
  current.setDate(current.getDate() + days)
  state.game.currentDate = current.toISOString().split('T')[0]
}

export function UPDATE_WEALTH(amount) {
  state.game.totalWealth += amount
  // 确保总资产不会为负数
  state.game.totalWealth = Math.max(0, state.game.totalWealth)
}

export function UPDATE_GAME_STATS(stats) {
  state.game = { ...state.game, ...stats }
}

export function SET_GAME_SPEED(speed) {
  state.settings.gameSpeed = speed
}

export function LOAD_GAME(payload) {
  state.game = payload.game
  state.members = payload.members
  if (payload.achievements) {
    state.achievements = payload.achievements
  }
  if (payload.familyBusinesses) {
    state.familyBusinesses = payload.familyBusinesses
  } else if (payload.familyBusiness) {
    // 兼容旧存档
    if (payload.familyBusiness.level > 0) {
      state.familyBusinesses = [{
        id: generateId(),
        ...payload.familyBusiness
      }]
    }
  }
}

// 成就系统相关
export function UNLOCK_ACHIEVEMENT(achievementId) {
  const achievement = state.achievements.find(a => a.id === achievementId)
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true
    // 显示成就解锁提示
    if (uni && uni.showToast) {
      uni.showToast({
        title: `🏆 成就解锁：${achievement.name}`,
        icon: 'none',
        duration: 3000
      })
    }
  }
}

export function CHECK_ACHIEVEMENTS() {
  const livingMembers = getLivingMembers()
  const allMembers = state.members
  
  // 检查成就：人丁兴旺（10个成员）
  if (allMembers.length >= 10) {
    UNLOCK_ACHIEVEMENT('10_members')
  }
  
  // 检查成就：财富相关
  if (state.game.totalWealth >= 100000) {
    UNLOCK_ACHIEVEMENT('wealth_100k')
  }
  if (state.game.totalWealth >= 500000) {
    UNLOCK_ACHIEVEMENT('wealth_500k')
  }
  if (state.game.totalWealth >= 1000000) {
    UNLOCK_ACHIEVEMENT('wealth_1m')
  }
  
  // 检查成就：三代同堂
  const generations = new Set(allMembers.filter(m => m.isAlive).map(m => m.generation))
  if (generations.size >= 3) {
    UNLOCK_ACHIEVEMENT('3_generations')
  }
  
  // 检查成就：百年家族（5代）
  const maxGeneration = Math.max(...allMembers.map(m => m.generation), 0)
  if (maxGeneration >= 5) {
    UNLOCK_ACHIEVEMENT('5_generations')
  }
  
  // 检查成就：书香门第（智力100）
  if (allMembers.some(m => m.intelligence >= 100)) {
    UNLOCK_ACHIEVEMENT('max_education')
  }
  
  // 检查成就：长寿家族（90岁以上）
  if (allMembers.some(m => m.age >= 90)) {
    UNLOCK_ACHIEVEMENT('long_life')
  }
}

// getters
export function getLivingMembers() {
  return state.members.filter(m => m.isAlive)
}

export function getDeceasedMembers() {
  return state.members.filter(m => !m.isAlive)
}

export function getFounder() {
  return state.members.find(m => m.generation === 1)
}

export function getMembersByGeneration() {
  const groups = {}
  state.members.forEach(member => {
    if (!groups[member.generation]) {
      groups[member.generation] = []
    }
    groups[member.generation].push(member)
  })
  return groups
}

// mutations 集合
export const mutations = {
  INIT_GAME,
  ADD_MEMBER,
  UPDATE_MEMBER,
  REMOVE_MEMBER,
  ADVANCE_TIME,
  UPDATE_WEALTH,
  UPDATE_GAME_STATS,
  SET_GAME_SPEED,
  UNLOCK_ACHIEVEMENT,
  CHECK_ACHIEVEMENTS,
  FOUND_BUSINESS,
  UPGRADE_BUSINESS,
  LOAD_GAME,
  CREATE_HEIRLOOM,
  BUY_PROPERTY,
  MAKE_FRIENDS,
  CREATE_CONFLICT
}

// getters 集合
export const getters = {
  getLivingMembers,
  getDeceasedMembers,
  getFounder,
  getMembersByGeneration
}

// actions
export function createNewGame({ familyName, founderName }) {
  const founder = {
    id: generateId(),
    name: founderName,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    age: 25,
    birthDate: '2000-01-01',
    occupation: '无业',
    health: 100,
    happiness: 80,
    intelligence: Math.floor(Math.random() * 30) + 70,
    appearance: Math.floor(Math.random() * 30) + 70,
    money: 1000,
    isAlive: true,
    generation: 1,
    parents: [],
    siblings: [],
    children: []
  }
  
  INIT_GAME({ familyName })
  ADD_MEMBER(founder)
  CHECK_ACHIEVEMENTS()
}

export function advanceGameTime(days = 1) {
  ADVANCE_TIME(days)
  
  let totalIncome = 0
  let totalExpense = 0
  
    // 更新所有成员的年龄和状态
    state.members.forEach(member => {
      if (member.isAlive) {
        const newAge = member.age + days / 365
        const updates = { age: newAge }
        
        // 获取年龄变化前的整数年龄
        const oldAgeInt = Math.floor(member.age)
        // 获取年龄变化后的整数年龄
        const newAgeInt = Math.floor(newAge)
        
        // 只有当整数年龄真正增加时才触发年度事件
        if (newAgeInt > oldAgeInt) {
          // 年龄增长了一岁
          updates.health = Math.max(0, member.health - Math.random() * 2)
          
          // 老年死亡概率
          if (newAge > 70 && Math.random() < 0.05) {
            updates.isAlive = false
            
            // 遗产继承逻辑
            const inheritanceAmount = member.money
            
            if (inheritanceAmount > 0) {
              // 查找继承人（优先配偶，其次子女，最后家族资产）
              let heirs = []
              
              // 1. 配偶继承50%
              if (member.spouse) {
                const spouse = state.members.find(m => m.id === member.spouse && m.isAlive)
                if (spouse) {
                  heirs.push({
                    member: spouse,
                    share: 0.5
                  })
                }
              }
              
              // 2. 子女平分剩余50%
              const children = state.members.filter(m => 
                m.parents && m.parents.includes(member.id) && m.isAlive
              )
              
              if (children.length > 0) {
                const childShare = heirs.length > 0 ? 0.5 / children.length : 1 / children.length
                children.forEach(child => {
                  heirs.push({
                    member: child,
                    share: childShare
                  })
                })
              }
              
              // 3. 分配遗产
              if (heirs.length > 0) {
                heirs.forEach(heir => {
                  const amount = Math.floor(inheritanceAmount * heir.share)
                  heir.member.money += amount
                })
              } else {
                // 无继承人，归入家族资产
                state.game.totalWealth += inheritanceAmount
              }
              
              // 死者资产清零
              updates.money = 0
            }
          }
          
          // 计算年收入（每增长一岁计算一次）
          const occupation = member.occupation
          const income = state.occupationIncome[occupation] || 0
          totalIncome += income
          
          // 个人获得收入
          updates.money = member.money + income
          
          // 计算年支出（生活费）
          const expense = 12000 // 基本生活费
          totalExpense += expense
          updates.money = (updates.money || member.money) - expense
          
          // 触发随机事件（优化频率，每年只有20%概率触发事件）
          if (Math.random() < 0.2) {
            const event = triggerRandomEvent(member)
            if (event) {
              const eventEffects = event.effect(member)
              // 应用事件效果并进行验证
              Object.keys(eventEffects).forEach(key => {
                let value = eventEffects[key]
                // 对属性值进行边界验证
                if (key === 'health' || key === 'happiness' || key === 'intelligence' || key === 'appearance') {
                  value = Math.max(0, Math.min(100, value))
                }
                if (key === 'money') {
                  value = Math.max(0, value)
                }
                updates[key] = value
              })
              
              // 显示事件消息（延长显示时间）
              if (uni && uni.showToast) {
                uni.showToast({
                  title: `${member.name}: ${event.name}`,
                  icon: event.type === 'positive' ? 'success' : 'none',
                  duration: 3000
                })
              }
            }
          }
        }
        
        UPDATE_MEMBER({ id: member.id, updates })
      }
    })  
  // 更新家族总资产
  if (totalIncome > 0 || totalExpense > 0) {
    // 添加所有企业收入
    const businessRevenue = state.familyBusinesses.reduce((total, business) => {
      return total + business.revenue
    }, 0)
    totalIncome += businessRevenue
    
    UPDATE_WEALTH(totalIncome - totalExpense)
    UPDATE_GAME_STATS({ 
      yearlyIncome: totalIncome, 
      yearlyExpense: totalExpense 
    })
  }
  
  // 自动存档
  if (state.settings.autoSave) {
    const saveData = {
      game: state.game,
      members: state.members,
      achievements: state.achievements,
      familyBusinesses: state.familyBusinesses
    }
    import('../utils/storage.js').then(module => {
      module.saveGame(saveData)
    })
  }
  
  // 检查成就
  CHECK_ACHIEVEMENTS()
  
  // 记录历史数据（每年记录一次）
  if (days >= 365) {
    const currentDate = state.game.currentDate
    
    // 记录资产历史
    state.gameHistory.wealth.push({
      date: currentDate,
      value: state.game.totalWealth
    })
    
    // 记录成员数量历史
    state.gameHistory.members.push({
      date: currentDate,
      count: state.members.filter(m => m.isAlive).length
    })
    
    // 限制历史数据数量（最多保留50条）
    if (state.gameHistory.wealth.length > 50) {
      state.gameHistory.wealth.shift()
    }
    if (state.gameHistory.members.length > 50) {
      state.gameHistory.members.shift()
    }
  }
  
  // 检查游戏是否结束（没有在世成员）
  const livingMembers = getLivingMembers()
  if (livingMembers.length === 0 && state.members.length > 0) {
    // 游戏结束
    state.game.isGameStarted = false
    
    // 显示游戏结束提示
    if (uni && uni.showModal) {
      setTimeout(() => {
        uni.showModal({
          title: '游戏结束',
          content: `家族传承了${state.game.generation}代，最终资产：¥${state.game.totalWealth.toLocaleString()}`,
          showCancel: false,
          confirmText: '重新开始',
          success: () => {
            // 清除存档
            import('../utils/storage.js').then(module => {
              module.deleteSave()
            })
          }
        })
      }, 500)
    }
  }
}

// 家族企业相关
export function FOUND_BUSINESS({ type, name, capital }) {
  // 限制最多创建4个企业（因为总共只有4种类型）
  if (state.familyBusinesses.length >= 4) {
    uni.showToast({
      title: '最多只能创建4个企业',
      icon: 'none'
    })
    return false
  }
  
  // 检查是否已存在同类型企业
  const existingType = state.familyBusinesses.find(b => b.type === type)
  if (existingType) {
    uni.showToast({
      title: `已存在${type}企业`,
      icon: 'none'
    })
    return false
  }
  
  if (state.game.totalWealth < capital) {
    uni.showToast({
      title: '资金不足',
      icon: 'none'
    })
    return false
  }
  
  const businessTypes = {
    '餐饮': { baseRevenue: 50000, baseEmployees: 5 },
    '科技': { baseRevenue: 100000, baseEmployees: 10 },
    '制造': { baseRevenue: 80000, baseEmployees: 15 },
    '零售': { baseRevenue: 60000, baseEmployees: 8 }
  }
  
  const businessType = businessTypes[type]
  if (!businessType) return false
  
  const business = {
    id: generateId(),
    type: type,
    level: 1,
    name: name,
    capital: capital,
    revenue: businessType.baseRevenue,
    employees: businessType.baseEmployees,
    foundedYear: state.game.currentDate
  }
  
  state.familyBusinesses.push(business)
  
  // 扣除家族资金
  UPDATE_WEALTH(-capital)
  
  uni.showToast({
    title: `成功创建${name}！`,
    icon: 'success'
  })
  
  return true
}

// 家族传承系统 - 购买房产
export function BUY_PROPERTY({ type, location, price }) {
  // 检查资金
  if (state.game.totalWealth < price) {
    uni.showToast({
      title: '资金不足',
      icon: 'none'
    })
    return false
  }
  
  const property = {
    id: generateId(),
    type: type, // 'apartment', 'house', 'villa', 'mansion'
    location: location,
    value: price,
    ownerId: null, // 初始无所有者，可分配给成员
    purchaseDate: state.game.currentDate
  }
  
  state.familyProperties.push(property)
  UPDATE_WEALTH(-price)
  
  uni.showToast({
    title: `购买${type}成功！`,
    icon: 'success'
  })
  
  return true
}

// 创建传家宝
export function CREATE_HEIRLOOM({ name, type, effect, targetMemberId }) {
  const heirloom = {
    id: generateId(),
    name: name,
    type: type, // 'wisdom', 'beauty', 'health', 'luck'
    effect: effect, // {intelligence: 10, appearance: 5, ...}
    ownerId: targetMemberId,
    creationDate: state.game.currentDate,
    generation: state.game.generation
  }
  
  state.familyHeirlooms.push(heirloom)
  
  // 立即应用效果
  if (targetMemberId) {
    const member = state.members.find(m => m.id === targetMemberId)
    if (member) {
      const updates = {}
      for (let key in effect) {
        if (member[key] !== undefined) {
          updates[key] = Math.min(100, member[key] + effect[key])
        }
      }
      UPDATE_MEMBER({ id: targetMemberId, updates })
    }
  }
  
  uni.showToast({
    title: `传家宝${name}创建成功！`,
    icon: 'success'
  })
  
  return true
}

export function UPGRADE_BUSINESS(businessId) {
  const business = state.familyBusinesses.find(b => b.id === businessId)
  
  if (!business) {
    uni.showToast({
      title: '企业不存在',
      icon: 'none'
    })
    return false
  }
  
  // 最高等级限制为10级
  if (business.level >= 10) {
    uni.showToast({
      title: '企业已达到最高等级(10级)',
      icon: 'none'
    })
    return false
  }
  
  const upgradeCost = business.level * 100000
  
  if (state.game.totalWealth < upgradeCost) {
    uni.showToast({
      title: `升级需要¥${upgradeCost.toLocaleString()}`,
      icon: 'none'
    })
    return false
  }
  
  business.level++
  business.capital += upgradeCost
  business.revenue += Math.floor(business.revenue * 0.3)
  business.employees += Math.floor(business.employees * 0.2)
  
  UPDATE_WEALTH(-upgradeCost)
  
  // 检查是否达到满级
  if (business.level >= 10) {
    uni.showToast({
      title: `企业已升级到最高级(10级)！`,
      icon: 'success',
      duration: 3000
    })
  } else {
    uni.showToast({
      title: `企业升级到${business.level}级！`,
      icon: 'success'
    })
  }
  
  return true
}

// 社交关系系统 - 建立友谊
export function MAKE_FRIENDS({ memberId1, memberId2 }) {
  const member1 = state.members.find(m => m.id === memberId1)
  const member2 = state.members.find(m => m.id === memberId2)
  
  if (!member1 || !member2) {
    uni.showToast({
      title: '��Ա������',
      icon: 'none'
    })
    return false
  }
  
  if (memberId1 === memberId2) {
    uni.showToast({
      title: '�������Լ���������',
      icon: 'none'
    })
    return false
  }
  
  // ��ʼ��friends���飨��������ڣ�
  if (!member1.friends) member1.friends = []
  if (!member2.friends) member2.friends = []
  
  // ����Ƿ��Ѿ��Ǻ���
  if (member1.friends.includes(memberId2) || member2.friends.includes(memberId1)) {
    uni.showToast({
      title: '�Ѿ��Ǻ��ѹ�ϵ',
      icon: 'none'
    })
    return false
  }
  
  // ����˫������
  member1.friends.push(memberId2)
  member2.friends.push(memberId1)
  
  // ��������˫������ֵ
  UPDATE_MEMBER({
    id: memberId1,
    updates: { happiness: Math.min(100, member1.happiness + 5) }
  })
  
  UPDATE_MEMBER({
    id: memberId2,
    updates: { happiness: Math.min(100, member2.happiness + 5) }
  })
  
  uni.showToast({
    title: ${member1.name}�ͳ�Ϊ���ѣ�,
    icon: 'success'
  })
  
  return true
}

// ����ì��
export function CREATE_CONFLICT({ memberId1, memberId2 }) {
  const member1 = state.members.find(m => m.id === memberId1)
  const member2 = state.members.find(m => m.id === memberId2)
  
  if (!member1 || !member2) {
    uni.showToast({
      title: '��Ա������',
      icon: 'none'
    })
    return false
  }
  
  // ��ʼ��rivals���飨��������ڣ�
  if (!member1.rivals) member1.rivals = []
  if (!member2.rivals) member2.rivals = []
  
  // ����Ƿ��Ѿ��Ƕ���
  if (member1.rivals.includes(memberId2) || member2.rivals.includes(memberId1)) {
    uni.showToast({
      title: '�Ѿ���ì�ܹ�ϵ',
      icon: 'none'
    })
    return false
  }
  
  // ����˫��ì��
  member1.rivals.push(memberId2)
  member2.rivals.push(memberId1)
  
  // ì�ܽ���˫������ֵ
  UPDATE_MEMBER({
    id: memberId1,
    updates: { happiness: Math.max(0, member1.happiness - 10) }
  })
  
  UPDATE_MEMBER({
    id: memberId2,
    updates: { happiness: Math.max(0, member2.happiness - 10) }
  })
  
  uni.showToast({
    title: ${member1.name}�Ͳ���ì�ܣ�,
    icon: 'none'
  })
  
  return true
}\
