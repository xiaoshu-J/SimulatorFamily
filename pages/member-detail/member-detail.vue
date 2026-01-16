<template>
	<view class="container">
		<view v-if="member" class="member-detail">
			<!-- 基本信息 -->
			<view class="basic-info">
				<text class="member-name">{{member.name}}</text>
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">年龄</text>
						<text class="info-value">{{Math.floor(member.age)}}岁</text>
					</view>
					<view class="info-item">
						<text class="info-label">性别</text>
						<text class="info-value">{{member.gender === 'male' ? '男' : '女'}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">职业</text>
						<text class="info-value">{{member.occupation}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">学历</text>
						<text class="info-value">{{member.education || '无'}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">生日</text>
						<text class="info-value">{{member.birthDate}}</text>
					</view>
				</view>
			</view>
			
			<!-- 属性状态 -->
			<view class="stats-section">
				<text class="section-title">状态属性</text>
				
				<!-- 疾病状态显示 -->
				<view v-if="member.illness" class="illness-status">
					<view class="illness-header">
						<text class="illness-title">🏥 疾病状态</text>
						<text class="illness-name">{{getIllnessName(member.illness.type)}}</text>
					</view>
					<view class="illness-details">
						<text class="illness-info">等级: {{member.illness.level}}级</text>
						<text class="illness-info" v-if="!$store.state.familyInsurance.healthInsurance">治疗费用: ¥{{member.illness.treatmentCost.toLocaleString()}}</text>
						<text class="illness-info" v-else>💰 保险覆盖50% | 自费: ¥{{Math.floor(member.illness.treatmentCost * 0.5).toLocaleString()}}</text>
					</view>
					<view v-if="$store.state.familyInsurance.healthInsurance" style="margin-bottom: 10rpx;">
						<text style="font-size: 22rpx; color: #28a745;">🛡️ 健康保险已生效</text>
					</view>
					<button @click="treatIllness" class="treat-btn" v-if="game.totalWealth >= (member.illness.treatmentCost * ($store.state.familyInsurance.healthInsurance ? 0.5 : 1))">💊 治疗</button>
					<text class="no-money-warning" v-else>资金不足，需要¥{{($store.state.familyInsurance.healthInsurance ? Math.floor(member.illness.treatmentCost * 0.5) : member.illness.treatmentCost).toLocaleString()}}</text>
				</view>
				
				<view class="stat-list">
					<view class="stat-row">
						<text class="stat-name">健康</text>
						<view class="stat-bar">
							<view class="stat-fill" :style="{width: member.health + '%'}"></view>
						</view>
						<text class="stat-value">{{Math.floor(member.health)}}</text>
					</view>
					<view class="stat-row">
						<text class="stat-name">快乐</text>
						<view class="stat-bar">
							<view class="stat-fill happiness" :style="{width: member.happiness + '%'}"></view>
						</view>
						<text class="stat-value">{{Math.floor(member.happiness)}}</text>
					</view>
					<view class="stat-row">
						<text class="stat-name">智力</text>
						<view class="stat-bar">
							<view class="stat-fill intelligence" :style="{width: member.intelligence + '%'}"></view>
						</view>
						<text class="stat-value">{{Math.floor(member.intelligence)}}</text>
					</view>
					<view class="stat-row">
						<text class="stat-name">外貌</text>
						<view class="stat-bar">
							<view class="stat-fill appearance" :style="{width: member.appearance + '%'}"></view>
						</view>
						<text class="stat-value">{{Math.floor(member.appearance)}}</text>
					</view>
				</view>
			</view>
			
			<!-- 个人资产 -->
			<view class="money-section">
				<text class="section-title">个人资产</text>
				<view class="money-display">
					<text class="money-amount">¥{{member.money.toLocaleString()}}</text>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<!-- 互动类按钮 -->
				<view class="button-group">
					<text class="group-title">互动</text>
					<view class="group-buttons">
						<button @click="chatWith" class="action-btn small">💬 聊天</button>
						<button @click="giveGift" class="action-btn small">🎁 送礼</button>
					</view>
				</view>
				
				<!-- 生活类按钮 -->
				<view class="button-group">
					<text class="group-title">生活</text>
					<view class="group-buttons">
						<button @click="investInEducation" class="action-btn small" v-if="canInvestEducation">🎓 教育投资</button>
						<button @click.stop="showMarriageOptions" class="action-btn small" v-if="canMarry">💒 结婚</button>
						<button @click.stop="divorce" class="action-btn small" v-if="canDivorce">💔 离婚</button>
						<button @click.stop="haveChild" class="action-btn small" v-if="canHaveChild">👶 生育子女</button>
					</view>
				</view>
				
				<!-- 职业类按钮 -->
				<view class="button-group">
					<text class="group-title">职业</text>
					<view class="group-buttons">
						<button @click="changeOccupation" class="action-btn small">💼 更换职业</button>
					</view>
				</view>
				
				<!-- 社交关系 -->
				<view class="button-group">
					<text class="group-title">社交关系</text>
					
					<!-- 好友列表 -->
					<view v-if="member.friends && member.friends.length > 0" class="relation-list">
						<text class="relation-title">好友 ({{member.friends.length}})</text>
						<view v-for="friendId in member.friends" :key="friendId" class="relation-item">
							<text class="relation-name">{{getMemberName(friendId)}}</text>
						</view>
					</view>
					
					<!-- 矛盾列表 -->
					<view v-if="member.rivals && member.rivals.length > 0" class="relation-list">
						<text class="relation-title">矛盾 ({{member.rivals.length}})</text>
						<view v-for="rivalId in member.rivals" :key="rivalId" class="relation-item rival">
							<text class="relation-name">{{getMemberName(rivalId)}}</text>
						</view>
					</view>
					
					<view class="group-buttons">
						<button @click="makeFriend" class="action-btn small" v-if="canMakeFriend">👥 添加好友</button>
						<button @click="createConflict" class="action-btn small" v-if="canCreateConflict">⚔️ 产生矛盾</button>
					</view>
				</view>
				
				<button @click="goBack" class="back-btn">⬅️ 返回</button>
			</view>
		</view>
		
		<view v-else class="loading">
			<text>加载中...</text>
		</view>
	</view>
</template>

<script>
	import { generateId } from '@/utils/id-generator.js'
	
	export default {
		data() {
			return {
				memberId: null,
				member: null
			}
		},
		onLoad(options) {
			this.memberId = options.id
			this.loadMember()
		},
		computed: {
			game() {
				return this.$store.state.game
			},
			canMarry() {
				if (!this.member) return false
				const age = Math.floor(this.member.age)
				// 20-60岁可以结婚，必须有配偶且在世，且未婚
				return age >= 20 && age <= 60 && 
					   this.member.isAlive && 
					   !this.member.spouse
			},
			canHaveChild() {
				if (!this.member) return false
				const age = Math.floor(this.member.age)
				// 20-45岁可以生育，必须有配偶且在世
				return age >= 20 && age <= 45 && 
					   this.member.isAlive && 
					   this.member.spouse
			},
			canInvestEducation() {
				if (!this.member) return false
				const age = Math.floor(this.member.age)
				// 0-18岁可以进行教育投资
				return age >= 0 && age < 18 && this.member.isAlive
			},
			canDivorce() {
				if (!this.member) return false
				// 已婚且在世才能离婚
				return this.member.isAlive && this.member.spouse
			},
			canMakeFriend() {
				if (!this.member || !this.member.isAlive) return false
				// 检查是否有可添加为好友的成员
				const availableMembers = this.$store.state.members.filter(m => {
					return m.isAlive && 
						   m.id !== this.memberId &&
						   (!this.member.friends || !this.member.friends.includes(m.id)) &&
						   (!this.member.rivals || !this.member.rivals.includes(m.id))
				})
				return availableMembers.length > 0
			},
			canCreateConflict() {
				if (!this.member || !this.member.isAlive) return false
				// 检查是否有可产生矛盾的成员
				const availableMembers = this.$store.state.members.filter(m => {
					return m.isAlive && 
						   m.id !== this.memberId &&
						   (!this.member.friends || !this.member.friends.includes(m.id)) &&
						   (!this.member.rivals || !this.member.rivals.includes(m.id))
				})
				return availableMembers.length > 0
			}
		},
		methods: {
			loadMember() {
				// 兼容字符串和数字类型的ID比较
				this.member = this.$store.state.members.find(m => String(m.id) === String(this.memberId))
				if (!this.member) {
					uni.showToast({
						title: '成员不存在',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}
			},
			chatWith() {
				// 聊天提升快乐值
				const currentHappiness = this.member.happiness
				const increase = Math.floor(Math.random() * 10) + 5 // 5-15点
				const newHappiness = Math.min(100, currentHappiness + increase)
				
				this.$store.commit('UPDATE_MEMBER', {
					id: this.memberId,
					updates: { happiness: newHappiness }
				})
				
				this.loadMember()
				
				uni.showToast({
					title: `聊天愉快，快乐值+${increase}`,
					icon: 'success'
				})
			},
			giveGift() {
				// 送礼需要消耗资金，大幅提升快乐值
				const giftCost = 1000
				
				if (this.game.totalWealth < giftCost) {
					uni.showToast({
						title: '家族资金不足，需要¥1,000',
						icon: 'none'
					})
					return
				}
				
				const currentHappiness = this.member.happiness
				const increase = Math.floor(Math.random() * 20) + 15 // 15-35点
				const newHappiness = Math.min(100, currentHappiness + increase)
				
				// 更新成员快乐值
				this.$store.commit('UPDATE_MEMBER', {
					id: this.memberId,
					updates: { happiness: newHappiness }
				})
				
				// 扣除家族资金
				this.$store.commit('UPDATE_WEALTH', -giftCost)
				
				this.loadMember()
				
				uni.showToast({
					title: `送礼成功，快乐值+${increase}`,
					icon: 'success'
				})
			},
			investInEducation() {
				if (!this.member) return
				
				const age = Math.floor(this.member.age)
				if (age >= 18) {
					uni.showToast({
						title: '成员已超过教育年龄',
						icon: 'none'
					})
					return
				}
				
				// 计算教育投资费用：每年5000，根据剩余教育年限计算
				const remainingYears = 18 - age
				const educationCost = remainingYears * 5000
				
				if (this.game.totalWealth < educationCost) {
					uni.showToast({
						title: `资金不足，需要¥${educationCost.toLocaleString()}`,
						icon: 'none'
					})
					return
				}
				
				// 教育投资效果：智力+20，外貌+10，快乐+15
				const intelligenceIncrease = 20
				const appearanceIncrease = 10
				const happinessIncrease = 15
				
				// 学历提升逻辑
				let newEducation = this.member.education || '无'
				if (age < 6) {
					newEducation = '学前教育'
				} else if (age < 12) {
					newEducation = '小学'
				} else if (age < 15) {
					newEducation = '初中'
				} else if (age < 18) {
					newEducation = '高中'
					// 高智力成员有机会直接上大学
					if (this.member.intelligence > 80 && Math.random() < 0.3) {
						newEducation = '本科'
					}
				}
				
				this.$store.commit('UPDATE_MEMBER', {
					id: this.memberId,
					updates: {
						intelligence: Math.min(100, this.member.intelligence + intelligenceIncrease),
						appearance: Math.min(100, this.member.appearance + appearanceIncrease),
						happiness: Math.min(100, this.member.happiness + happinessIncrease),
						education: newEducation
					}
				})
				
				// 扣除家族资金
				this.$store.commit('UPDATE_WEALTH', -educationCost)
				
				this.loadMember()
				
				uni.showToast({
					title: `教育投资成功！学历提升至${newEducation}`,
					icon: 'success',
					duration: 2500
				})
			},
			changeOccupation() {
				const occupations = ['医生', '工程师', '教师', '商人', '艺术家', '程序员', '律师', '科学家', '运动员', '厨师']
				uni.showActionSheet({
					itemList: occupations,
					success: (res) => {
						const newOccupation = occupations[res.tapIndex]
						const oldOccupation = this.member.occupation
						
						// 检查是否满足职业要求
						const requirements = this.$store.state.occupationRequirements[newOccupation]
						if (requirements) {
							if (requirements.intelligence && this.member.intelligence < requirements.intelligence) {
								uni.showToast({
									title: `智力不足（需要${requirements.intelligence}）`,
									icon: 'none'
								})
								return
							}
							if (requirements.health && this.member.health < requirements.health) {
								uni.showToast({
									title: `健康不足（需要${requirements.health}）`,
									icon: 'none'
								})
								return
							}
							if (requirements.appearance && this.member.appearance < requirements.appearance) {
								uni.showToast({
									title: `外貌不足（需要${requirements.appearance}）`,
									icon: 'none'
								})
								return
							}
						}
						
						// 失业风险（30%概率）
						let unemploymentPeriod = 0
						if (Math.random() < 0.3) {
							unemploymentPeriod = Math.floor(Math.random() * 3) + 1 // 1-3年失业期
						}
						
						// 立即计算收入差额并更新
						const oldIncome = this.$store.state.occupationIncome[oldOccupation] || 0
						const newIncome = this.$store.state.occupationIncome[newOccupation] || 0
						const incomeDiff = newIncome - oldIncome
						
						// 更新成员职业和资金
						const updates = { 
							occupation: newOccupation,
							// 立即获得年收入差额
							money: this.member.money + incomeDiff
						}
						
						// 如果有失业期，设置失业状态
						if (unemploymentPeriod > 0) {
							updates.unemploymentPeriod = unemploymentPeriod
							updates.occupation = '无业' // 失业期间无收入
						}
						
						this.$store.commit('UPDATE_MEMBER', {
							id: this.memberId,
							updates
						})
						
						// 更新家族总资产
						this.$store.commit('UPDATE_WEALTH', incomeDiff)
						
						this.loadMember()
						
						let message = ''
						if (unemploymentPeriod > 0) {
							message = `转职失败！失业${unemploymentPeriod}年`
						} else {
							message = incomeDiff >= 0 
								? `职业变更为${newOccupation}，年收入增加¥${incomeDiff.toLocaleString()}` 
								: `职业变更为${newOccupation}，年收入减少¥${Math.abs(incomeDiff).toLocaleString()}`
						}
						
						uni.showToast({
							title: message,
							icon: unemploymentPeriod > 0 ? 'none' : 'success',
							duration: 2500
						})
					}
				})
			},
			showMarriageOptions() {
				console.log('显示婚姻选项菜单')
				// 使用setTimeout确保在下一个事件循环执行，避免渲染问题
				setTimeout(() => {
					uni.showActionSheet({
						itemList: ['💕 自由恋爱', '💎 相亲介绍'],
						success: (res) => {
							console.log('用户选择了:', res.tapIndex)
							if (res.tapIndex === 0) {
								this.marryByLove()
							} else {
								this.marryByMatchmaking()
							}
						},
						fail: (err) => {
							console.log('ActionSheet失败:', err)
						}
					})
				}, 50)
			},
			
			marryByLove() {
				uni.showModal({
					title: '自由恋爱',
					content: '输入你心仪的对象姓名：',
					editable: true,
					placeholderText: '输入配偶姓名',
					success: (res) => {
						if (res.confirm && res.content) {
							const result = this.$store.commit('MARRY_BY_LOVE', {
								memberId: this.memberId,
								spouseName: res.content
							})
							if (result !== false) {
								this.loadMember()
								uni.showToast({
									title: `恭喜！与${res.content}喜结连理`,
									icon: 'success',
									duration: 3000
								})
							}
						}
					}
				})
			},
			
			marryByMatchmaking() {
				// 先检查资金是否充足
				const costs = {
					'普通会员': 5000,
					'黄金会员': 15000,
					'钻石会员': 30000
				}
				
				uni.showActionSheet({
					title: '选择相亲会员档次',
					itemList: [
						'普通会员 ¥5,000（成功率60%，属性50-70）',
						'黄金会员 ¥15,000（成功率75%，属性60-80）',
						'钻石会员 ¥30,000（成功率90%，属性70-90）'
					],
					success: (res) => {
						const levels = ['普通会员', '黄金会员', '钻石会员']
						const level = levels[res.tapIndex]
						const cost = costs[level]
						
						// 在前端检查资金
						if (this.game.totalWealth < cost) {
							uni.showToast({
								title: `资金不足，需要¥${cost.toLocaleString()}`,
								icon: 'none'
							})
							return
						}
						
						const result = this.$store.commit('MARRY_BY_MATCHMAKING', {
							memberId: this.memberId,
							membershipLevel: level
						})
						
						if (result && result.success) {
							this.loadMember()
							uni.showToast({
								title: `相亲成功！匹配度${result.matchScore}%`,
								icon: 'success',
								duration: 3000
							})
						}
					}
				})
			},
									createSpouse(name) {
										const spouse = {
											id: this.$store.state.members.length + '_' + Math.random().toString(36).substr(2, 9),
											name: name,
											gender: this.member.gender === 'male' ? 'female' : 'male',
											age: Math.floor(this.member.age),
											birthDate: new Date(new Date().getTime() - Math.floor(this.member.age) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
											occupation: '无业',
											health: 100,
											happiness: 80,
											intelligence: Math.floor(Math.random() * 30) + 70,
											appearance: Math.floor(Math.random() * 30) + 70,
											money: 500,
											isAlive: true,
											generation: this.member.generation,
											parents: [],
											siblings: [],
											children: [],
											spouse: this.memberId
										}
										this.$store.commit('ADD_MEMBER', spouse)
										
										// 更新当前成员的婚姻状态
										this.$store.commit('UPDATE_MEMBER', {
											id: this.memberId,
											updates: { spouse: spouse.id }
										})
										
										this.loadMember()
										uni.showToast({
											title: '结婚成功！',
											icon: 'success'
										})
												},
												divorce() {
													if (!this.member.spouse) {
														uni.showToast({
															title: '该成员未婚',
															icon: 'none'
														})
														return
													}
													
													// 找到配偶
													const spouse = this.$store.state.members.find(m => m.id === this.member.spouse)
													if (!spouse) {
														uni.showToast({
															title: '配偶信息异常',
															icon: 'none'
														})
														return
													}
													
													// 显示确认对话框
													uni.showModal({
														title: '离婚',
														content: `确定要让${this.member.name}和${spouse.name}离婚吗？`,
														success: (res) => {
															if (res.confirm) {
																// 解除双方婚姻关系
																this.$store.commit('UPDATE_MEMBER', {
																	id: this.memberId,
																	updates: { spouse: null }
																})
																
																this.$store.commit('UPDATE_MEMBER', {
																	id: spouse.id,
																	updates: { spouse: null }
																})
																
																this.loadMember()
																
																uni.showToast({
																	title: '离婚成功',
																	icon: 'success'
																})
															}
														}
													})
												},
												haveChild() {
													if (!this.member.spouse) {
														uni.showToast({
															title: '需要先结婚',
															icon: 'none'
														})
														return
													}
									
																													const child = {
																														id: generateId(),  // 使用统一的ID生成器
																														name: this.generateChildName(),
																														gender: Math.random() > 0.5 ? 'male' : 'female',
																														age: 0,
																														birthDate: this.$store.state.game.currentDate,
																														occupation: '无业',
																														health: 100,
																														happiness: 90,
																														intelligence: Math.floor(Math.random() * 40) + 60,  // 60-100随机
																														appearance: Math.floor(Math.random() * 40) + 60,
																														money: 0,
																														isAlive: true,
																														generation: this.member.generation + 1,
																														parents: [this.memberId, this.member.spouse],
																														spouse: null,
																														education: '无'
																													}				
							this.$store.commit('ADD_MEMBER', child)
							
																																				// 消耗家庭资金作为育儿费用
							
																																				const childCost = 60000
							
																																				this.$store.commit('UPDATE_WEALTH', -childCost)
							
																																				
							
																																				uni.showToast({
							
																																					title: `恭喜！${child.name}出生了！`,
							
																																					icon: 'success',
							
																																					duration: 2500
							
																																				})
							
							// 刷新当前页面数据
							this.loadMember()
						},
						
						generateChildName() {
							// 简单的名字生成逻辑
							const names = {
								male: ['浩然', '子轩', '宇航', '博文', '俊杰', '志强', '伟祺', '皓轩'],
								female: ['诗涵', '欣怡', '梓萱', '梦琪', '雨婷', '雅静', '婉儿', '思琪']
							}
													const gender = Math.random() > 0.5 ? 'male' : 'female'
													const nameList = names[gender]
													return nameList[Math.floor(Math.random() * nameList.length)]
												},
												makeFriend() {
													// 获取可添加为好友的成员（排除自己和已有关系）
													const availableMembers = this.$store.state.members.filter(m => {
														return m.isAlive && 
															   m.id !== this.memberId &&
															   (!this.member.friends || !this.member.friends.includes(m.id)) &&
															   (!this.member.rivals || !this.member.rivals.includes(m.id))
													})
													
													if (availableMembers.length === 0) {
														uni.showToast({
															title: '没有可添加的成员',
															icon: 'none'
														})
														return
													}
													
													const memberNames = availableMembers.map(m => m.name)
													uni.showActionSheet({
														itemList: memberNames,
														success: (res) => {
															const targetMember = availableMembers[res.tapIndex]
															this.$store.commit('MAKE_FRIENDS', {
																memberId1: this.memberId,
																memberId2: targetMember.id
															})
															this.loadMember()
															uni.showToast({
																title: `与${targetMember.name}成为好友`,
																icon: 'success'
															})
														}
													})
												},
												createConflict() {
													// 获取可产生矛盾的成员（排除自己和已有关系）
													const availableMembers = this.$store.state.members.filter(m => {
														return m.isAlive && 
															   m.id !== this.memberId &&
															   (!this.member.friends || !this.member.friends.includes(m.id)) &&
															   (!this.member.rivals || !this.member.rivals.includes(m.id))
													})
													
													if (availableMembers.length === 0) {
														uni.showToast({
															title: '没有可产生矛盾的成员',
															icon: 'none'
														})
														return
													}
													
													const memberNames = availableMembers.map(m => m.name)
													uni.showActionSheet({
														itemList: memberNames,
														success: (res) => {
															const targetMember = availableMembers[res.tapIndex]
															this.$store.commit('CREATE_CONFLICT', {
																memberId1: this.memberId,
																memberId2: targetMember.id
															})
															this.loadMember()
															uni.showToast({
																title: `与${targetMember.name}产生矛盾`,
																icon: 'none'
															})
														}
													})
												},
																	getMemberName(memberId) {
																		const member = this.$store.state.members.find(m => String(m.id) === String(memberId))
																		return member ? member.name : '未知'
																	},
																	
																	// 疾病相关方法
																	getIllnessName(type) {
																		const names = {
																			'cold': '普通感冒',
																			'flu': '季节性流感',
																			'pneumonia': '肺炎',
																			'chronic': '慢性疾病'
																		}
																		return names[type] || '未知疾病'
																	},
																	
																						treatIllness() {
																							if (!this.member.illness) return
																							
																							// 检查是否有保险
																							const hasInsurance = this.$store.state.familyInsurance.healthInsurance
																							const originalCost = this.member.illness.treatmentCost
																							const cost = hasInsurance ? Math.floor(originalCost * 0.5) : originalCost
																							
																							if (this.game.totalWealth < cost) {
																								uni.showToast({
																									title: `资金不足，需要¥${cost.toLocaleString()}`,
																									icon: 'none'
																								})
																								return
																							}
																							
																							// 扣除治疗费用
																							this.$store.commit('UPDATE_WEALTH', -cost)
																							
																							// 移除疾病
																							this.$store.commit('UPDATE_MEMBER', {
																								id: this.memberId,
																								updates: { 
																									illness: null,
																									happiness: Math.min(100, this.member.happiness + 10)
																								}
																							})
																							
																							this.loadMember()
																							
																							let message = `治疗成功，花费¥${cost.toLocaleString()}`
																							if (hasInsurance) {
																								message += `（保险覆盖¥${(originalCost - cost).toLocaleString()}）`
																							}
																							
																							uni.showToast({
																								title: message,
																								icon: 'success',
																								duration: 3000
																							})
																						},																	
																	goBack() {
																		uni.navigateBack()
																	}
															}
													}
												</script><style>
	.container {
		min-height: 100vh;
		background: #f5f5f5;
		padding: 30rpx;
	}
	
	.member-detail {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.basic-info {
		margin-bottom: 50rpx;
	}
	
	.member-name {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		display: block;
		margin-bottom: 40rpx;
	}
	
	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30rpx;
	}
	
	.info-item {
		text-align: center;
		padding: 20rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
	}
	
	.info-label {
		display: block;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 8rpx;
	}
	
	.info-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}
	
	.stats-section {
		margin-bottom: 50rpx;
	}
	
	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		display: block;
	}
	
	.stat-list {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}
	
	.stat-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.stat-name {
		font-size: 28rpx;
		color: #666;
		width: 100rpx;
	}
	
	.stat-bar {
		flex: 1;
		height: 24rpx;
		background: #e0e0e0;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.stat-fill {
		height: 100%;
		background: #4caf50;
		transition: width 0.3s ease;
	}
	
	.stat-fill.happiness {
		background: #ff9800;
	}
	
	.stat-fill.intelligence {
		background: #2196f3;
	}
	
	.stat-fill.appearance {
		background: #e91e63;
	}
	
	.stat-value {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		width: 80rpx;
		text-align: right;
	}
	
	.money-section {
		text-align: center;
		margin-bottom: 50rpx;
	}
	
	.money-display {
		padding: 30rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16rpx;
	}
	
	.money-amount {
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.action-btn {
		height: 88rpx;
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
	}
	
	/* 社交关系样式 */
	.relation-list {
		margin-bottom: 20rpx;
		padding: 20rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
	}
	
	.relation-title {
		display: block;
		font-size: 28rpx;
		font-weight: bold;
		color: #667eea;
		margin-bottom: 15rpx;
	}
	
	.relation-item {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
		border-bottom: 1rpx solid #e0e0e0;
	}
	
	.relation-item:last-child {
		border-bottom: none;
	}
	
	.relation-item.rival {
		color: #f44336;
	}
	
	.relation-name {
		font-size: 26rpx;
		color: #333;
	}
	
	/* 疾病状态样式 */
	.illness-status {
		background: #fff3cd;
		border: 2rpx solid #ffc107;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 30rpx;
	}
	
	.illness-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.illness-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #856404;
	}
	
	.illness-name {
		font-size: 26rpx;
		color: #dc3545;
		font-weight: bold;
	}
	
	.illness-details {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.illness-info {
		font-size: 24rpx;
		color: #856404;
	}
	
	.treat-btn {
		width: 100%;
		height: 70rpx;
		background: #28a745;
		color: #ffffff;
		border: none;
		border-radius: 8rpx;
		font-size: 26rpx;
		font-weight: bold;
	}
	
	.no-money-warning {
		display: block;
		font-size: 24rpx;
		color: #dc3545;
		text-align: center;
		margin-top: 10rpx;
	}
	
	.back-btn {
		height: 88rpx;
		background: #999;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		margin-top: 20rpx;
	}
	
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		font-size: 32rpx;
		color: #666;
	}
	
	/* 按钮分组样式 */
	.button-group {
		margin-bottom: 30rpx;
	}
	
	.group-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #667eea;
		margin-bottom: 20rpx;
		display: block;
		padding-left: 10rpx;
		border-left: 6rpx solid #667eea;
	}
	
	.group-buttons {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}
	
	.action-btn.small {
		height: 70rpx;
		font-size: 24rpx;
		margin-bottom: 0;
	}
</style>
