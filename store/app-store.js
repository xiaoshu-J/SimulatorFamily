// 简单的全局状态管理
import { reactive } from 'vue'
import { triggerRandomEvent } from '../utils/events.js'
import { generateId } from '../utils/id-generator.js'

let state = reactive({
  // 游戏主数据
  game: {
    familyName: '',
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
    gameSpeed: 1
  },
  	  	  	  // 职业收入配置（年收入）
  	  	    occupationIncome: {
  	  	      '无业': 0,
  	  	      '医生': 100000,      // 120000→100000 (降低17%)
  	  	      '工程师': 90000,     // 110000→90000 (降低18%)
  	  	      '教师': 75000,       // 90000→75000 (降低17%)
  	  	      '商人': 120000,      // 150000→120000 (降低20%)
  	  	      '艺术家': 65000,     // 80000→65000 (降低19%)
  	  	      '程序员': 95000,     // 115000→95000 (降低17%)
  	  	      '律师': 110000,      // 140000→110000 (降低21%)
  	  	      '科学家': 100000,    // 125000→100000 (降低20%)
  	  	      '运动员': 80000,     // 95000→80000 (降低16%)
  	  	      '厨师': 65000        // 75000→65000 (降低13%)
  	  	    },
  	  	    
  	  	    // 职业要求配置
  	  	    occupationRequirements: {
  	  	      '医生': { intelligence: 85, education: '本科' },
  	  	      '工程师': { intelligence: 75, education: '本科' },
  	  	      '教师': { intelligence: 70, education: '本科' },
  	  	      '商人': { intelligence: 65, education: '高中' },
  	  	      '艺术家': { appearance: 70, education: '高中' },
  	  	      '程序员': { intelligence: 75, education: '本科' },
  	  	      '律师': { intelligence: 85, education: '硕士' },
  	  	      '科学家': { intelligence: 90, education: '博士' },
  	  	         	      '运动员': { health: 80, education: '高中' },
  	  	         	      '厨师': { education: '高中' }
  	  	         	    },  // 成就系统
  	  	        achievements: [    {
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
    }
  ],
  // 家族企业（数组，支持多个企业）
  familyBusinesses: [],
  	  // 游戏历史数据（用于图表展示）
    gameHistory: {
      wealth: [],
      members: [],
      events: []
    },
    // 家族传承系统
    familyProperties: [],
    familyHeirlooms: [],
    // 家族声望系统
    familyReputation: 0, // 初始声望
    // 家族保险系统
    familyInsurance: {
      healthInsurance: false, // 是否购买健康保险
      insuranceStartYear: null, // 保险开始年份
      insurancePremium: 3000 // 年费
    },
    // 家族债务系统
    familyDebt: {
      amount: 0, // 当前债务金额
      interestRate: 0.1, // 年利率10%
      lastPaymentYear: null // 上次还款年份
    }
  })
// 生成唯一ID
// mutations
export function INIT_GAME(payload) {
  state.game = {
    ...state.game,
    ...payload,
    isGameStarted: true
  }
}

export function ADD_MEMBER(member) {
  // 数据验证
  if (!member || !member.id || !member.name) {
    console.error('ADD_MEMBER: 成员数据无效', member)
    return false
  }
  
  // 确保属性在合法范围内
  member.health = Math.max(0, Math.min(100, member.health || 80))
  member.happiness = Math.max(0, Math.min(100, member.happiness || 80))
  member.intelligence = Math.max(0, Math.min(100, member.intelligence || 60))
  member.appearance = Math.max(0, Math.min(100, member.appearance || 60))
  member.money = Math.max(0, member.money || 0)
  member.age = Math.max(0, member.age || 0)
  member.isAlive = member.isAlive !== undefined ? member.isAlive : true
  member.education = member.education || '无'
  
  state.members.push(member)
  CHECK_ACHIEVEMENTS()
  return true
}

export function UPDATE_MEMBER({ id, updates }) {
  const index = state.members.findIndex(m => m.id === id)
  if (index !== -1) {
    const validatedUpdates = { ...updates }
    
    if (validatedUpdates.health !== undefined) {
      validatedUpdates.health = Math.max(0, Math.min(100, validatedUpdates.health))
    }
    
    if (validatedUpdates.happiness !== undefined) {
      validatedUpdates.happiness = Math.max(0, Math.min(100, validatedUpdates.happiness))
    }
    
    if (validatedUpdates.intelligence !== undefined) {
      validatedUpdates.intelligence = Math.max(0, Math.min(100, validatedUpdates.intelligence))
    }
    
    if (validatedUpdates.appearance !== undefined) {
      validatedUpdates.appearance = Math.max(0, Math.min(100, validatedUpdates.appearance))
    }
    
    if (validatedUpdates.age !== undefined) {
      validatedUpdates.age = Math.max(0, validatedUpdates.age)
    }
    
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
    if (payload.familyBusiness.level > 0) {
      state.familyBusinesses = [{
        id: generateId(),
        ...payload.familyBusiness
      }]
    }
  }
  if (payload.familyHeirlooms) {
    state.familyHeirlooms = payload.familyHeirlooms
  }
  if (payload.familyProperties) {
    state.familyProperties = payload.familyProperties
  }
  if (payload.gameHistory) {
    state.gameHistory = payload.gameHistory
  }
  if (payload.familyReputation !== undefined) {
    state.familyReputation = payload.familyReputation
  }
  if (payload.familyInsurance) {
    state.familyInsurance = { ...state.familyInsurance, ...payload.familyInsurance }
  }
  if (payload.familyDebt) {
    state.familyDebt = { ...state.familyDebt, ...payload.familyDebt }
  }
}

export function UNLOCK_ACHIEVEMENT(achievementId) {
  const achievement = state.achievements.find(a => a.id === achievementId)
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true
    // 成就解锁增加声望
    UPDATE_REPUTATION(10)
  }
}

export function CHECK_ACHIEVEMENTS() {
  const livingMembers = getLivingMembers()
  const allMembers = state.members
  
  if (allMembers.length >= 10) {
    UNLOCK_ACHIEVEMENT('10_members')
  }
  
  if (state.game.totalWealth >= 100000) {
    UNLOCK_ACHIEVEMENT('wealth_100k')
  }
  if (state.game.totalWealth >= 500000) {
    UNLOCK_ACHIEVEMENT('wealth_500k')
  }
  if (state.game.totalWealth >= 1000000) {
    UNLOCK_ACHIEVEMENT('wealth_1m')
  }
  
  const generations = new Set(allMembers.filter(m => m.isAlive).map(m => m.generation))
  if (generations.size >= 3) {
    UNLOCK_ACHIEVEMENT('3_generations')
  }
  
  const maxGeneration = Math.max(...allMembers.map(m => m.generation), 0)
  if (maxGeneration >= 5) {
    UNLOCK_ACHIEVEMENT('5_generations')
  }
  
  if (allMembers.some(m => m.intelligence >= 100)) {
    UNLOCK_ACHIEVEMENT('max_education')
  }
  
  if (allMembers.some(m => m.age >= 90)) {
    UNLOCK_ACHIEVEMENT('long_life')
  }
}

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
        children: [],
        education: '高中'
      }  
  INIT_GAME({ familyName })
  ADD_MEMBER(founder)
  CHECK_ACHIEVEMENTS()
}

export function advanceGameTime(days = 1) {
  ADVANCE_TIME(days)
  
  let totalIncome = 0
  let totalExpense = 0
  
  // 保险年费处理（每年一次）
  if (days >= 365 && state.familyInsurance.healthInsurance) {
    const currentYear = new Date(state.game.currentDate).getFullYear()
    const insuranceStartYear = state.familyInsurance.insuranceStartYear ? 
      new Date(state.familyInsurance.insuranceStartYear).getFullYear() : currentYear
    
    // 检查是否需要支付年费（每年支付一次）
    if (currentYear > insuranceStartYear || !state.familyInsurance.lastPaymentYear) {
      if (state.game.totalWealth >= state.familyInsurance.insurancePremium) {
        UPDATE_WEALTH(-state.familyInsurance.insurancePremium)
        totalExpense += state.familyInsurance.insurancePremium
        state.familyInsurance.lastPaymentYear = state.game.currentDate
        
        uni.showToast({
          title: `健康保险年费 ¥${state.familyInsurance.insurancePremium.toLocaleString()}`,
          icon: 'none'
        })
      } else {
        // 资金不足，取消保险
        state.familyInsurance.healthInsurance = false
        uni.showToast({
          title: '资金不足，健康保险已失效',
          icon: 'none',
          duration: 3000
        })
      }
    }
  }
  
  state.members.forEach(member => {
    if (member.isAlive) {
      const newAge = member.age + days / 365
      const updates = { age: newAge }
      
      const oldAgeInt = Math.floor(member.age)
      const newAgeInt = Math.floor(newAge)
      
      if (newAgeInt > oldAgeInt) {
        // 年龄相关健康衰减
        let healthDecay = Math.random() * 2
        if (member.age > 60) {
          healthDecay = Math.random() * 4  // 60岁以上衰减加快
        }
        if (member.age > 80) {
          healthDecay = Math.random() * 6  // 80岁以上衰减更快
        }
        updates.health = Math.max(0, member.health - healthDecay)
        
        if (newAge > 70 && Math.random() < 0.05) {
          updates.isAlive = false
          const inheritanceAmount = member.money
          
          if (inheritanceAmount > 0) {
            let heirs = []
            
            if (member.spouse) {
              const spouse = state.members.find(m => m.id === member.spouse && m.isAlive)
              if (spouse) {
                heirs.push({ member: spouse, share: 0.5 })
              }
            }
            
            const children = state.members.filter(m => 
              m.parents && m.parents.includes(member.id) && m.isAlive
            )
            
            if (children.length > 0) {
              const childShare = heirs.length > 0 ? 0.5 / children.length : 1 / children.length
              children.forEach(child => {
                heirs.push({ member: child, share: childShare })
              })
            }
            
            if (heirs.length > 0) {
              heirs.forEach(heir => {
                const amount = Math.floor(inheritanceAmount * heir.share)
                heir.member.money += amount
              })
            } else {
              state.game.totalWealth += inheritanceAmount
            }
            
            // 传家宝传承逻辑
            const memberHeirlooms = state.familyHeirlooms.filter(h => h.ownerId === member.id)
            if (memberHeirlooms.length > 0) {
              // 优先寻找配偶
              let primaryHeir = null
              if (member.spouse) {
                const spouse = state.members.find(m => m.id === member.spouse && m.isAlive)
                if (spouse) {
                  primaryHeir = spouse
                }
              }
              
              // 如果没有配偶或配偶已去世，找子女
              if (!primaryHeir && children.length > 0) {
                // 随机选择一个子女
                primaryHeir = children[Math.floor(Math.random() * children.length)]
              }
              
              // 传承传家宝
              if (primaryHeir) {
                memberHeirlooms.forEach(heirloom => {
                  heirloom.ownerId = primaryHeir.id
                  // 传家宝效果在新拥有者上生效
                  const updates = {}
                  for (let key in heirloom.effect) {
                    if (primaryHeir[key] !== undefined) {
                      updates[key] = Math.min(100, primaryHeir[key] + heirloom.effect[key])
                    }
                  }
                  // 立即应用属性加成
                  Object.keys(updates).forEach(key => {
                    primaryHeir[key] = updates[key]
                  })
                })
                
                uni.showToast({
                  title: `${member.name}的${memberHeirlooms.length}件传家宝已传承给${primaryHeir.name}`,
                  icon: 'none',
                  duration: 3000
                })
              } else {
                // 没有继承人，传家宝保留在家族中但无拥有者
                memberHeirlooms.forEach(heirloom => {
                  heirloom.ownerId = null
                })
              }
            }
            
            updates.money = 0
          }
        }
        
        // 处理失业期
        let actualOccupation = member.occupation
        let actualIncome = 0
        
        if (member.unemploymentPeriod && member.unemploymentPeriod > 0) {
          // 处于失业期，减少失业期并跳过收入
          member.unemploymentPeriod--
          if (member.unemploymentPeriod === 0) {
            // 失业期结束，恢复工作（保持原职业）
            uni.showToast({
              title: `${member.name}结束了失业期，重新开始工作`,
              icon: 'none'
            })
          }
          actualIncome = 0
        } else {
          // 正常工作
          actualOccupation = member.occupation
          actualIncome = state.occupationIncome[actualOccupation] || 0
          totalIncome += actualIncome
        }
        
        // 所得税（年收入的10%）
        const tax = Math.floor(actualIncome * 0.1)
        const incomeAfterTax = actualIncome - tax
        
        updates.money = member.money + incomeAfterTax
        totalExpense += tax  // 税收计入支出
        
        // 动态日常开销系统
        let baseExpense = 12000
        
        // 年龄相关开销（老年人医疗开销更高）
        if (member.age > 60) {
          baseExpense += 5000  // 增加医疗开销
        }
        if (member.age > 80) {
          baseExpense += 8000  // 进一步增加医疗开销
        }
        
        // 职业相关开销（高收入职业生活成本更高）
        if (actualIncome > 100000) {
          baseExpense += 3000  // 高收入职业税收和生活成本
        }
        
        // 子女教育开销（每个子女每年2,000）
        const children = state.members.filter(m => 
          m.parents && m.parents.includes(member.id) && m.isAlive && m.age < 22
        )
        if (children.length > 0) {
          baseExpense += children.length * 2000
        }
        
        // 住房开销（简化计算）
        baseExpense += 15000  // 基础房租/房贷
        
        const expense = baseExpense
        totalExpense += expense
        updates.money = (updates.money || member.money) - expense
        
        if (Math.random() < 0.15) {
          const event = triggerRandomEvent(member)
          if (event) {
            const eventEffects = event.effect(member)
            Object.keys(eventEffects).forEach(key => {
              let value = eventEffects[key]
              if (key === 'health' || key === 'happiness' || key === 'intelligence' || key === 'appearance') {
                value = Math.max(0, Math.min(100, value))
              }
              if (key === 'money') {
                value = Math.max(0, value)
              }
              updates[key] = value
            })
          }
        }
      }
      
      UPDATE_MEMBER({ id: member.id, updates })
    }
  })
  
  if (totalIncome > 0 || totalExpense > 0) {
    const businessRevenue = state.familyBusinesses.reduce((total, business) => {
      // 企业运营成本（收入的30%）
      const operatingCost = Math.floor(business.revenue * 0.3)
      const netRevenue = business.revenue - operatingCost
      totalExpense += operatingCost
      return total + netRevenue
    }, 0)
    totalIncome += businessRevenue
    
    // 债务利息处理（每年一次）
    if (days >= 365 && state.familyDebt.amount > 0) {
      const currentYear = new Date(state.game.currentDate).getFullYear()
      const lastPaymentYear = state.familyDebt.lastPaymentYear ? 
        new Date(state.familyDebt.lastPaymentYear).getFullYear() : currentYear - 1
      
      // 检查是否需要支付利息（每年支付一次）
      if (currentYear > lastPaymentYear) {
        const interest = Math.floor(state.familyDebt.amount * state.familyDebt.interestRate)
        
        if (state.game.totalWealth >= interest) {
          UPDATE_WEALTH(-interest)
          totalExpense += interest
          state.familyDebt.lastPaymentYear = state.game.currentDate
          
          uni.showToast({
            title: `债务利息 ¥${interest.toLocaleString()}`,
            icon: 'none'
          })
        } else {
          // 资金不足支付利息，债务增加（复利）
          state.familyDebt.amount += interest
          uni.showToast({
            title: `无法支付利息，债务增加至¥${state.familyDebt.amount.toLocaleString()}`,
            icon: 'none',
            duration: 3000
          })
        }
      }
    }
    
    UPDATE_WEALTH(totalIncome - totalExpense)
    UPDATE_GAME_STATS({ 
      yearlyIncome: totalIncome, 
      yearlyExpense: totalExpense 
    })
  }
  
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
  
  CHECK_ACHIEVEMENTS()
  
  if (days >= 365) {
    const currentDate = state.game.currentDate
    
    state.gameHistory.wealth.push({
      date: currentDate,
      value: state.game.totalWealth
    })
    
    state.gameHistory.members.push({
      date: currentDate,
      count: state.members.filter(m => m.isAlive).length
    })
    
    if (state.gameHistory.wealth.length > 50) {
      state.gameHistory.wealth.shift()
    }
    if (state.gameHistory.members.length > 50) {
      state.gameHistory.members.shift()
    }
  }
  
  const livingMembers = getLivingMembers()
  if (livingMembers.length === 0 && state.members.length > 0) {
    state.game.isGameStarted = false
    
    if (uni && uni.showModal) {
      setTimeout(() => {
        uni.showModal({
          title: '游戏结束',
          content: `家族传承了${state.game.generation}代，最终资产：¥${state.game.totalWealth.toLocaleString()}`,
          showCancel: false,
          confirmText: '重新开始',
          success: () => {
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
  if (state.familyBusinesses.length >= 4) {
    uni.showToast({
      title: '最多只能创建4个企业',
      icon: 'none'
    })
    return false
  }
  
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
  UPDATE_WEALTH(-capital)
  
  uni.showToast({
    title: `成功创建${name}！`,
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

// 家族传承系统
export function BUY_PROPERTY({ type, location, price }) {
  if (state.game.totalWealth < price) {
    uni.showToast({
      title: '资金不足',
      icon: 'none'
    })
    return false
  }
  
  const property = {
    id: generateId(),
    type: type,
    location: location,
    value: price,
    ownerId: null,
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

export function CREATE_HEIRLOOM({ name, type, effect, targetMemberId }) {
  const heirloom = {
    id: generateId(),
    name: name,
    type: type,
    effect: effect,
    ownerId: targetMemberId,
    creationDate: state.game.currentDate,
    generation: state.game.generation
  }
  
  state.familyHeirlooms.push(heirloom)
  
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

// 社交关系系统
export function MAKE_FRIENDS({ memberId1, memberId2 }) {
  const member1 = state.members.find(m => m.id === memberId1)
  const member2 = state.members.find(m => m.id === memberId2)
  
  if (!member1 || !member2) {
    console.error('MAKE_FRIENDS: 成员不存在', { memberId1, memberId2 })
    return false
  }
  
  if (!member1.isAlive || !member2.isAlive) {
    uni.showToast({
      title: '只能与在世成员建立关系',
      icon: 'none'
    })
    return false
  }
  
  // 初始化数组（如果不存在）
  if (!member1.friends) member1.friends = []
  if (!member2.friends) member2.friends = []
  if (!member1.rivals) member1.rivals = []
  if (!member2.rivals) member2.rivals = []
  
  // 检查是否已经是好友
  if (member1.friends.includes(memberId2) || member2.friends.includes(memberId1)) {
    uni.showToast({
      title: '双方已经是好友',
      icon: 'none'
    })
    return false
  }
  
  // 检查是否是对立关系
  if (member1.rivals.includes(memberId2) || member2.rivals.includes(memberId1)) {
    uni.showToast({
      title: '双方存在矛盾，无法成为好友',
      icon: 'none'
    })
    return false
  }
  
  // 建立双向好友关系
  member1.friends.push(memberId2)
  member2.friends.push(memberId1)
  
  // 提升双方快乐值
  UPDATE_MEMBER({
    id: memberId1,
    updates: { happiness: Math.min(100, member1.happiness + 5) }
  })
  UPDATE_MEMBER({
    id: memberId2,
    updates: { happiness: Math.min(100, member2.happiness + 5) }
  })
  
  return true
}

export function CREATE_CONFLICT({ memberId1, memberId2 }) {
  const member1 = state.members.find(m => m.id === memberId1)
  const member2 = state.members.find(m => m.id === memberId2)
  
  if (!member1 || !member2) {
    console.error('CREATE_CONFLICT: 成员不存在', { memberId1, memberId2 })
    return false
  }
  
  if (!member1.isAlive || !member2.isAlive) {
    uni.showToast({
      title: '只能与在世成员产生矛盾',
      icon: 'none'
    })
    return false
  }
  
  // 初始化数组（如果不存在）
  if (!member1.friends) member1.friends = []
  if (!member2.friends) member2.friends = []
  if (!member1.rivals) member1.rivals = []
  if (!member2.rivals) member2.rivals = []
  
  // 检查是否已经是对手
  if (member1.rivals.includes(memberId2) || member2.rivals.includes(memberId1)) {
    uni.showToast({
      title: '双方已经是对手',
      icon: 'none'
    })
    return false
  }
  
  // 检查是否是好友关系
  if (member1.friends.includes(memberId2) || member2.friends.includes(memberId1)) {
    uni.showToast({
      title: '双方是好友，无法产生矛盾',
      icon: 'none'
    })
    return false
  }
  
  // 建立双向矛盾关系
  member1.rivals.push(memberId2)
  member2.rivals.push(memberId1)
  
  // 降低双方快乐值
  UPDATE_MEMBER({
    id: memberId1,
    updates: { happiness: Math.max(0, member1.happiness - 10) }
  })
  UPDATE_MEMBER({
    id: memberId2,
    updates: { happiness: Math.max(0, member2.happiness - 10) }
  })
  
  return true
}

// 获取状态
export function getState() {
  return state
}

// 设置状态
export function setState(newState) {
  state = { ...state, ...newState }
}

// getters
export const getters = {
  getLivingMembers,
  getDeceasedMembers,
  getFounder,
  getMembersByGeneration
}

// 婚姻系统
export function MARRY_BY_LOVE({ memberId, spouseName }) {
  const member = state.members.find(m => m.id === memberId)
  
  if (!member) {
    console.error('MARRY_BY_LOVE: 成员不存在', memberId)
    return false
  }
  
  if (!member.isAlive) {
    uni.showToast({ title: '已故成员无法结婚', icon: 'none' })
    return false
  }
  
  if (member.spouse) {
    uni.showToast({ title: '该成员已结婚', icon: 'none' })
    return false
  }
  
  const age = Math.floor(member.age)
  if (age < 20 || age > 60) {
    uni.showToast({ title: '结婚年龄需在20-60岁之间', icon: 'none' })
    return false
  }
  
  // 自由恋爱：属性完全随机
  const spouse = {
    id: generateId(),
    name: spouseName,
    gender: member.gender === 'male' ? 'female' : 'male',
    age: Math.floor(Math.random() * 15) + 20, // 20-35岁
    birthDate: new Date(new Date().getTime() - Math.floor(Math.random() * 15 + 20) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    occupation: '无业',
    health: Math.floor(Math.random() * 30) + 70,
    happiness: Math.floor(Math.random() * 30) + 70,
    intelligence: Math.floor(Math.random() * 50) + 50, // 50-100随机
    appearance: Math.floor(Math.random() * 50) + 50,
    money: Math.floor(Math.random() * 2000) + 500,
    isAlive: true,
    generation: member.generation,
    parents: [],
    siblings: [],
    children: [],
    spouse: memberId,
    education: '高中' // 添加教育背景
  }
  
  	// 100%成功
    state.members.push(spouse)
    UPDATE_MEMBER({
      id: memberId,
      updates: { spouse: spouse.id, happiness: Math.min(100, member.happiness + 10) }
    })
    
    // 结婚成功增加声望
    UPDATE_REPUTATION(5)
    
    return { success: true, spouse }
  }
export function MARRY_BY_MATCHMAKING({ memberId, membershipLevel }) {
  const member = state.members.find(m => m.id === memberId)
  
  if (!member) {
    console.error('MARRY_BY_MATCHMAKING: 成员不存在', memberId)
    return false
  }
  
  if (!member.isAlive) {
    uni.showToast({ title: '已故成员无法结婚', icon: 'none' })
    return false
  }
  
  if (member.spouse) {
    uni.showToast({ title: '该成员已结婚', icon: 'none' })
    return false
  }
  
  const age = Math.floor(member.age)
  if (age < 20 || age > 60) {
    uni.showToast({ title: '结婚年龄需在20-60岁之间', icon: 'none' })
    return false
  }
  
  // 相亲会员档次配置
  const membershipConfig = {
    '普通会员': { cost: 5000, minAttr: 50, maxAttr: 70, successRate: 0.6 },
    '黄金会员': { cost: 15000, minAttr: 60, maxAttr: 80, successRate: 0.75 },
    '钻石会员': { cost: 30000, minAttr: 70, maxAttr: 90, successRate: 0.9 }
  }
  
  const config = membershipConfig[membershipLevel]
  if (!config) {
    uni.showToast({ title: '会员档次无效', icon: 'none' })
    return false
  }
  
  // 扣除会员费（相亲是服务，即使失败也不退还）
  UPDATE_WEALTH(-config.cost)
  
      
  
      // 生成匹配对象（属性根据会员档次）
  
      const spouse = {
  
        id: generateId(),
  
        name: generateRandomName(member.gender === 'male' ? 'female' : 'male'),
  
        gender: member.gender === 'male' ? 'female' : 'male',
  
        age: Math.floor(Math.random() * 10) + 22, // 22-32岁
  
        birthDate: new Date(new Date().getTime() - Math.floor(Math.random() * 10 + 22) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  
        occupation: '无业',
  
        health: Math.floor(Math.random() * (config.maxAttr - config.minAttr)) + config.minAttr,
  
        happiness: Math.floor(Math.random() * (config.maxAttr - config.minAttr)) + config.minAttr,
  
        intelligence: Math.floor(Math.random() * (config.maxAttr - config.minAttr)) + config.minAttr,
  
        appearance: Math.floor(Math.random() * (config.maxAttr - config.minAttr)) + config.minAttr,
  
        money: Math.floor(Math.random() * 3000) + 1000,
  
        isAlive: true,
  
        generation: member.generation,
  
        parents: [],
  
        siblings: [],
  
        children: [],
  
        spouse: memberId,
  
        education: membershipLevel === '普通会员' ? '高中' : membershipLevel === '黄金会员' ? '本科' : '硕士'
  
      }
  
      
  
      // 计算属性匹配度
  
      const attrs = ['health', 'happiness', 'intelligence', 'appearance']
  
      let matchScore = 0
  
      attrs.forEach(attr => {
  
        const diff = Math.abs(member[attr] - spouse[attr])
  
        matchScore += Math.max(0, 100 - diff)
  
      })
  
      matchScore = matchScore / 4 / 100 // 0-1之间
  
      
  
      // 调整成功率（匹配度越高，成功率越高）
  
      const finalSuccessRate = config.successRate * (0.7 + matchScore * 0.3)
  
      
  
      if (Math.random() < finalSuccessRate) {
  
        // 成功
  
        	  state.members.push(spouse)
  
            UPDATE_MEMBER({
  
              id: memberId,
  
              updates: { spouse: spouse.id, happiness: Math.min(100, member.happiness + 15) }
  
            })
  
            
  
            // 相亲成功增加更多声望
  
            UPDATE_REPUTATION(10)
  
            
  
            return { success: true, spouse, matchScore: Math.round(matchScore * 100) }
  
      } else {
  
        // 失败：相亲是服务，失败也不退还费用
  
        uni.showToast({
  
          title: `相亲失败（匹配度${Math.round(matchScore * 100)}%）`,
  
          icon: 'none',
  
          duration: 3000
  
        })
  
        return { success: false, matchScore: Math.round(matchScore * 100) }
  
      }}

// 生成随机名字
function generateRandomName(gender) {
  const maleNames = ['浩然', '子轩', '宇航', '博文', '俊杰', '志强', '伟祺', '皓轩', '明辉', '建国', '建华', '伟强', '志强', '文轩', '子涵']
  const femaleNames = ['诗涵', '欣怡', '梓萱', '梦琪', '雨婷', '雅静', '婉儿', '思琪', '梦瑶', '晓雪', '丽华', '美华', '秀英', '秀兰', '桂英']
  const names = gender === 'male' ? maleNames : femaleNames
  return names[Math.floor(Math.random() * names.length)]
}

// 声望系统相关函数
export function UPDATE_REPUTATION(points) {
  state.familyReputation = Math.max(0, state.familyReputation + points)
  
  // 声望提升提示
  if (points > 0) {
    uni.showToast({
      title: `家族声望 +${points}（当前：${state.familyReputation}）`,
      icon: 'none'
    })
  }
}

// 保险系统相关函数
export function BUY_HEALTH_INSURANCE() {
  if (state.familyInsurance.healthInsurance) {
    uni.showToast({ title: '已购买健康保险', icon: 'none' })
    return false
  }
  
  if (state.game.totalWealth < state.familyInsurance.insurancePremium) {
    uni.showToast({
      title: `资金不足，需要¥${state.familyInsurance.insurancePremium.toLocaleString()}`,
      icon: 'none'
    })
    return false
  }
  
  state.familyInsurance.healthInsurance = true
  state.familyInsurance.insuranceStartYear = state.game.currentDate
  UPDATE_WEALTH(-state.familyInsurance.insurancePremium)
  
  uni.showToast({
    title: '健康保险购买成功！',
    icon: 'success'
  })
  
  return true
}

// 债务系统相关函数
export function TAKE_LOAN(amount) {
  const maxLoan = 100000
  const currentDebt = state.familyDebt.amount
  
  if (currentDebt > 0) {
    uni.showToast({ title: '请先还清现有债务', icon: 'none' })
    return false
  }
  
  if (amount > maxLoan) {
    uni.showToast({ title: `最高可贷款¥${maxLoan.toLocaleString()}`, icon: 'none' })
    return false
  }
  
  if (amount <= 0) {
    uni.showToast({ title: '贷款金额无效', icon: 'none' })
    return false
  }
  
  state.familyDebt.amount = amount
  state.familyDebt.lastPaymentYear = state.game.currentDate
  UPDATE_WEALTH(amount)
  
  uni.showToast({
    title: `贷款成功 ¥${amount.toLocaleString()}`,
    icon: 'success'
  })
  
  return true
}

export function REPAY_LOAN(amount) {
  const currentDebt = state.familyDebt.amount
  
  if (currentDebt <= 0) {
    uni.showToast({ title: '没有未偿还的债务', icon: 'none' })
    return false
  }
  
  if (amount > state.game.totalWealth) {
    uni.showToast({ title: '资金不足', icon: 'none' })
    return false
  }
  
  // 计算实际还款金额（不能超过债务）
  const actualRepayment = Math.min(amount, currentDebt)
  
  state.familyDebt.amount -= actualRepayment
  UPDATE_WEALTH(-actualRepayment)
  
  if (state.familyDebt.amount <= 0) {
    state.familyDebt.amount = 0
    uni.showToast({
      title: '债务已全部还清！',
      icon: 'success',
      duration: 3000
    })
  } else {
    uni.showToast({
      title: `还款 ¥${actualRepayment.toLocaleString()}，剩余债务 ¥${state.familyDebt.amount.toLocaleString()}`,
      icon: 'none'
    })
  }
  
  return true
}

// mutations
export const mutations = {
  INIT_GAME,
  ADD_MEMBER,
  UPDATE_MEMBER,
  REMOVE_MEMBER,
  ADVANCE_TIME,
  UPDATE_WEALTH,
  UPDATE_GAME_STATS,
  LOAD_GAME,
  UNLOCK_ACHIEVEMENT,
  CHECK_ACHIEVEMENTS,
  FOUND_BUSINESS,
  UPGRADE_BUSINESS,
  	BUY_PROPERTY,
    CREATE_HEIRLOOM,
    MAKE_FRIENDS,
    CREATE_CONFLICT,
    MARRY_BY_LOVE,
    MARRY_BY_MATCHMAKING,
    UPDATE_REPUTATION,
    BUY_HEALTH_INSURANCE,
    TAKE_LOAN,
    REPAY_LOAN
  }
