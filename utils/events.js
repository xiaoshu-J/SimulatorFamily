// 随机事件配置（按年龄分组，平衡概率）
export const randomEvents = [
  // 儿童事件 (0-12岁)
  {
    id: 'school_award',
    name: '三好学生',
    description: '在学校表现优秀，获得奖励',
    type: 'positive',
    effect: (member) => ({
      intelligence: Math.min(100, member.intelligence + 5),
      happiness: Math.min(100, member.happiness + 10)
    }),
    probability: 0.05,  // 降低正面事件概率
    condition: (member) => member.age >= 6 && member.age <= 12
  },
  {
    id: 'child_illness',
    name: '童年疾病',
    description: '患上了儿童常见疾病',
    type: 'negative',
    effect: (member) => ({
      health: Math.max(0, member.health - 10),
      happiness: Math.max(0, member.happiness - 5)
    }),
    probability: 0.10,  // 提高负面事件概率
    condition: (member) => member.age >= 0 && member.age <= 12
  },
  {
    id: 'toy_break',
    name: '玩具损坏',
    description: '心爱的玩具坏了',
    type: 'negative',
    effect: (member) => ({
      happiness: Math.max(0, member.happiness - 8)
    }),
    probability: 0.07,  // 提高负面事件概率
    condition: (member) => member.age >= 3 && member.age <= 10
  },
  
  // 青少年事件 (13-18岁)
  {
    id: 'first_love',
    name: '初恋',
    description: '经历了美好的初恋',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 15)
    }),
    probability: 0.04,  // 降低正面事件概率
    condition: (member) => member.age >= 13 && member.age <= 18
  },
  {
    id: 'exam_stress',
    name: '考试压力',
    description: '考试压力大，影响了心情',
    type: 'negative',
    effect: (member) => ({
      happiness: Math.max(0, member.happiness - 10),
      intelligence: Math.min(100, member.intelligence + 3)
    }),
    probability: 0.12,  // 提高负面事件概率
    condition: (member) => member.age >= 13 && member.age <= 18
  },
  {
    id: 'school_bully',
    name: '校园欺凌',
    description: '在学校遭遇欺凌',
    type: 'negative',
    effect: (member) => ({
      happiness: Math.max(0, member.happiness - 12),
      health: Math.max(0, member.health - 5)
    }),
    probability: 0.08,  // 提高负面事件概率
    condition: (member) => member.age >= 12 && member.age <= 16
  },
  
  // 成年事件 (19-60岁)
  {
    id: 'promotion',
    name: '升职',
    description: '工作表现出色，获得升职',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 15),
      money: member.money + 5000
    }),
    probability: 0.02,  // 降低正面事件概率
    condition: (member) => member.occupation !== '无业' && member.age >= 25 && member.age <= 55
  },
  {
    id: 'job_change',
    name: '跳槽',
    description: '找到了更好的工作机会',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 10),
      money: member.money + 8000
    }),
    probability: 0.03,  // 降低正面事件概率
    condition: (member) => member.occupation !== '无业' && member.age >= 22 && member.age <= 50
  },
  {
    id: 'work_stress',
    name: '工作压力',
    description: '工作压力过大，影响健康',
    type: 'negative',
    effect: (member) => ({
      health: Math.max(0, member.health - 8),
      happiness: Math.max(0, member.happiness - 8)
    }),
    probability: 0.10,  // 提高负面事件概率
    condition: (member) => member.occupation !== '无业' && member.age >= 25 && member.age <= 55
  },
  {
    id: 'vacation',
    name: '度假',
    description: '享受了一次愉快的假期',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 20),
      money: member.money - 3000
    }),
    probability: 0.03,  // 降低正面事件概率
    condition: (member) => member.money > 5000 && member.age >= 20 && member.age <= 60
  },
  {
    id: 'car_accident',
    name: '车祸',
    description: '不幸遭遇车祸',
    type: 'negative',
    effect: (member) => ({
      health: Math.max(0, member.health - 25),
      happiness: Math.max(0, member.happiness - 20),
      money: member.money - 15000
    }),
    probability: 0.05,  // 提高负面事件概率
    condition: (member) => member.age >= 18 && member.age <= 70
  },
  {
    id: 'marriage_blessing',
    name: '婚礼祝福',
    description: '参加婚礼收到祝福',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 15)
    }),
    probability: 0.04,
    condition: (member) => member.age >= 20 && member.age <= 60
  },
  {
    id: 'divorce_stress',
    name: '离婚压力',
    description: '离婚带来的情感压力',
    type: 'negative',
    effect: (member) => ({
      happiness: Math.max(0, member.happiness - 25),
      health: Math.max(0, member.health - 5)
    }),
    probability: 0.03,
    condition: (member) => member.spouse && member.age >= 25 && member.age <= 55
  },
  
  // 老年事件 (60岁以上)
  {
    id: 'retirement_life',
    name: '退休生活',
    description: '享受悠闲的退休生活',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 10)
    }),
    probability: 0.06,
    condition: (member) => member.age >= 60
  },
  {
    id: 'chronic_disease',
    name: '慢性疾病',
    description: '患上了慢性疾病',
    type: 'negative',
    effect: (member) => ({
      health: Math.max(0, member.health - 15),
      happiness: Math.max(0, member.happiness - 10)
    }),
    probability: 0.07,
    condition: (member) => member.age >= 60
  },
  {
    id: 'grandchild_born',
    name: '孙辈出生',
    description: '孙辈出生，家族添丁',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 25)
    }),
    probability: 0.05,
    condition: (member) => member.age >= 50 && member.children.length > 0
  },
  
  // 全年龄段事件
  {
    id: 'health_check',
    name: '健康检查',
    description: '进行了健康检查，身体状况良好',
    type: 'positive',
    effect: (member) => ({
      health: Math.min(100, member.health + 8),
      happiness: Math.min(100, member.happiness + 5)
    }),
    probability: 0.05
  },
  {
    id: 'illness',
    name: '生病',
    description: '生病了，需要休息',
    type: 'negative',
    effect: (member) => ({
      health: Math.max(0, member.health - 12),
      happiness: Math.max(0, member.happiness - 8)
    }),
    probability: 0.04
  },
  {
    id: 'lottery_win',
    name: '中奖',
    description: '意外中了小额奖金',
    type: 'positive',
    effect: (member) => ({
      money: member.money + 10000,
      happiness: Math.min(100, member.happiness + 15)
    }),
    probability: 0.008
  },
  {
    id: 'inheritance',
    name: '遗产',
    description: '继承了远房亲戚的遗产',
    type: 'positive',
    effect: (member) => ({
      money: member.money + 50000
    }),
    probability: 0.003
  },
  {
    id: 'theft',
    name: '被盗',
    description: '家中被盗，损失财物',
    type: 'negative',
    effect: (member) => ({
      money: member.money - 12000,
      happiness: Math.max(0, member.happiness - 8)
    }),
    probability: 0.02
  },
  {
    id: 'friend_visit',
    name: '朋友拜访',
    description: '老朋友来访，心情愉快',
    type: 'positive',
    effect: (member) => ({
      happiness: Math.min(100, member.happiness + 8)
    }),
    probability: 0.06
  },
  {
    id: 'depression',
    name: '情绪低落',
    description: '最近情绪低落，需要关心',
    type: 'negative',
    effect: (member) => ({
      happiness: Math.max(0, member.happiness - 12)
    }),
    probability: 0.035
  },
  
  // 疾病事件（新增）
  {
    id: 'common_cold',
    name: '普通感冒',
    description: '患上了普通感冒，需要休息几天',
    type: 'negative',
    effect: (member) => {
      // 添加疾病状态
      if (!member.illness) {
        member.illness = {
          type: 'cold',
          level: 1,
          duration: 7, // 持续7天
          treatmentCost: 500
        }
      }
      return {
        health: Math.max(0, member.health - 5),
        happiness: Math.max(0, member.happiness - 5)
      }
    },
    probability: 0.06
  },
  {
    id: 'flu',
    name: '季节性流感',
    description: '感染了流感病毒，需要治疗和休息',
    type: 'negative',
    effect: (member) => {
      if (!member.illness) {
        member.illness = {
          type: 'flu',
          level: 2,
          duration: 14,
          treatmentCost: 2000
        }
      }
      return {
        health: Math.max(0, member.health - 15),
        happiness: Math.max(0, member.happiness - 10)
      }
    },
    probability: 0.04
  },
  {
    id: 'pneumonia',
    name: '肺炎',
    description: '患上了肺炎，需要住院治疗',
    type: 'negative',
    effect: (member) => {
      if (!member.illness) {
        member.illness = {
          type: 'pneumonia',
          level: 3,
          duration: 30,
          treatmentCost: 8000
        }
      }
      return {
        health: Math.max(0, member.health - 30),
        happiness: Math.max(0, member.happiness - 20)
      }
    },
    probability: 0.02,
    condition: (member) => member.age > 50 || member.health < 60
  },
  {
    id: 'chronic_disease_adult',
    name: '慢性疾病',
    description: '患上了需要长期治疗的慢性疾病',
    type: 'negative',
    effect: (member) => {
      if (!member.illness) {
        member.illness = {
          type: 'chronic',
          level: 2,
          duration: 365, // 持续一年
          treatmentCost: 3000
        }
      }
      return {
        health: Math.max(0, member.health - 20),
        happiness: Math.max(0, member.happiness - 15)
      }
    },
    probability: 0.03,
    condition: (member) => member.age > 40
  }
]

// 触发随机事件
export function triggerRandomEvent(member) {
  const availableEvents = randomEvents.filter(event => {
    // 检查概率
    if (Math.random() > event.probability) return false
    // 检查条件
    if (event.condition && !event.condition(member)) return false
    return true
  })
  
  if (availableEvents.length > 0) {
    // 随机选择一个事件
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)]
    return event
  }
  
  return null
}