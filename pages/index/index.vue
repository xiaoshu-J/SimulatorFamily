<template>
	<view class="container">
		<!-- 游戏开始界面 -->
		<view v-if="!gameStarted" class="start-screen">
			<view class="title-section">
				<text class="game-title">家族模拟器</text>
				<text class="game-subtitle">传承你的家族荣耀</text>
			</view>
			
			<view class="start-form" v-if="showStartForm">
				<view class="form-item">
					<text class="form-label">家族姓氏：</text>
					<input v-model="familyName" class="form-input" placeholder="请输入家族姓氏" />
				</view>
				<view class="form-item">
					<text class="form-label">创始人姓名：</text>
					<input v-model="founderName" class="form-input" placeholder="请输入创始人姓名" />
				</view>
				<view class="button-group">
					<button @click="startGame" class="primary-btn">开始游戏</button>
					<button @click="cancelStart" class="secondary-btn">返回</button>
				</view>
			</view>
			
			<view class="button-group" v-else>
				<button @click="showNewGame" class="primary-btn">新游戏</button>
				<button v-if="hasSavedGame" @click="loadSavedGame" class="secondary-btn">继续游戏</button>
			</view>
		</view>
		
		<!-- 游戏主界面 -->
		<view v-else class="game-screen">
			<!-- 顶部状态栏 -->
			<view class="status-bar">
				<view class="status-item">
					<text class="status-label">家族：</text>
					<text class="status-value">{{game.familyName}}</text>
				</view>
				<view class="status-item">
					<text class="status-label">声望：</text>
					<text class="status-value" style="color: #ff9800;">⭐{{$store.state.familyReputation}}</text>
				</view>
				<view class="status-item">
					<text class="status-label">日期：</text>
					<text class="status-value">{{game.currentDate}}</text>
				</view>
				<view class="status-item">
					<text class="status-label">资产：</text>
					<text class="status-value">¥{{game.totalWealth.toLocaleString()}}</text>
				</view>
				<view class="status-item">
					<text class="status-label">年收入：</text>
					<text class="status-value" style="color: #4caf50;">¥{{game.yearlyIncome.toLocaleString()}}</text>
				</view>
				<view class="status-item">
					<text class="status-label">年支出：</text>
					<text class="status-value" style="color: #f44336;">¥{{game.yearlyExpense.toLocaleString()}}</text>
				</view>
			</view>
			
			<!-- 家族成员列表 -->
			<view class="members-section">
				<text class="section-title">家族成员 ({{livingMembers.length}})</text>
				<scroll-view class="members-list" scroll-y>
					<view v-for="member in livingMembers" :key="member.id" class="member-card" @click="viewMember(member.id)">
						<view class="member-info">
							<view class="member-name">{{member.name}}</view>
							<view class="member-details">
								<text>年龄: {{Math.floor(member.age)}}岁</text>
								<text>职业: {{member.occupation}}</text>
							</view>
						</view>
						<view class="member-stats">
							<view class="stat-item">
								<text class="stat-label">健康</text>
								<view class="stat-bar">
									<view class="stat-fill health" :style="{width: member.health + '%'}"></view>
								</view>
							</view>
							<view class="stat-item">
								<text class="stat-label">快乐</text>
								<view class="stat-bar">
									<view class="stat-fill happiness" :style="{width: member.happiness + '%'}"></view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
			
			<!-- 速度控制 -->
			<view class="speed-control">
				<text class="speed-label">游戏速度：</text>
				<view class="speed-buttons">
					<button 
						@click="setSpeed(1)" 
						class="speed-btn" 
						:class="{active: gameSpeed === 1}"
					>1x</button>
					<button 
						@click="setSpeed(5)" 
						class="speed-btn" 
						:class="{active: gameSpeed === 5}"
					>5x</button>
					<button 
						@click="setSpeed(10)" 
						class="speed-btn" 
						:class="{active: gameSpeed === 10}"
					>10x</button>
				</view>
			</view>
			
			<!-- 控制按钮 -->
			<view class="control-panel">
				<button @click="advanceTime" class="control-btn">推进时间 ({{gameSpeed}}年)</button>
				<button @click="addMember" class="control-btn">添加成员</button>
				<button @click="viewFamilyTree" class="control-btn">家族树</button>
				<button @click="viewAchievements" class="control-btn">成就</button>
				<button @click="manageBusiness" class="control-btn">家族企业</button>
				<button @click="viewCharts" class="control-btn">数据统计</button>
				<button @click="manageHeirlooms" class="control-btn">传家宝</button>
				<button @click="buyInsurance" class="control-btn" v-if="!hasInsurance">🛡️ 购买保险</button>
				<button @click="showDebtOptions" class="control-btn" v-if="hasDebt">💳 还款 ¥{{debtAmount}}</button>
				<button @click="showDebtOptions" class="control-btn" v-else>💳 银行贷款</button>
				<button @click="saveGame" class="control-btn secondary">保存游戏</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { saveGame, loadGame, hasSavedGame } from '@/utils/storage.js'
	
	export default {
		data() {
			return {
				showStartForm: false,
				familyName: '',
				founderName: ''
			}
		},
		computed: {
			game() {
				return this.$store.state.game
			},
			gameStarted() {
				return this.$store.state.game.isGameStarted
			},
			livingMembers() {
				return this.$store.getters.getLivingMembers
			},
			hasSavedGame() {
				return hasSavedGame()
			},
			gameSpeed() {
				return this.$store.state.settings.gameSpeed
			},
			hasInsurance() {
				return this.$store.state.familyInsurance.healthInsurance
			},
			hasDebt() {
				return this.$store.state.familyDebt.amount > 0
			},
			debtAmount() {
				return this.$store.state.familyDebt.amount
			}
		},
		methods: {
			showNewGame() {
				this.showStartForm = true
				this.familyName = ''
				this.founderName = ''
			},
			cancelStart() {
				this.showStartForm = false
			},
			startGame() {
				if (!this.familyName || !this.founderName) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					})
					return
				}
				
				console.log('开始游戏，数据初始化', {
					familyName: this.familyName,
					founderName: this.founderName
				})
				
				this.$store.dispatch('createNewGame', {
					familyName: this.familyName,
					founderName: this.founderName
				})
				
				console.log('游戏状态：', this.$store.state.game)
			},
			loadSavedGame() {
				const savedData = loadGame()
				if (savedData) {
					this.$store.commit('LOAD_GAME', savedData)
				}
			},
			viewMember(memberId) {
				uni.navigateTo({
					url: `/pages/member-detail/member-detail?id=${memberId}`
				})
			},
			viewFamilyTree() {
				uni.navigateTo({
					url: '/pages/family-tree/family-tree'
				})
			},
			viewAchievements() {
				uni.navigateTo({
					url: '/pages/achievements/achievements'
				})
			},
			viewCharts() {
				uni.navigateTo({
					url: '/pages/charts/charts'
				})
			},
			manageHeirlooms() {
				uni.navigateTo({
					url: '/pages/heirlooms/heirlooms'
				})
			},
			manageBusiness() {
				uni.navigateTo({
					url: '/pages/business/business'
				})
			},
			advanceTime() {
				this.$store.dispatch('advanceGameTime', 365)
			},
			saveGame() {
				const data = {
					game: this.$store.state.game,
					members: this.$store.state.members,
					achievements: this.$store.state.achievements,
					familyBusinesses: this.$store.state.familyBusinesses,
					familyHeirlooms: this.$store.state.familyHeirlooms,
					familyProperties: this.$store.state.familyProperties,
					gameHistory: this.$store.state.gameHistory,
					familyReputation: this.$store.state.familyReputation,
					familyInsurance: this.$store.state.familyInsurance,
					familyDebt: this.$store.state.familyDebt
				}
				if (saveGame(data)) {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					})
				}
			},
			setSpeed(speed) {
				this.$store.commit('SET_GAME_SPEED', speed)
				uni.showToast({
					title: `游戏速度设置为 ${speed}x`,
					icon: 'none'
				})
			},
			
			// 保险和债务相关方法
			buyInsurance() {
				const success = this.$store.commit('BUY_HEALTH_INSURANCE')
				if (success !== false) {
					this.hasInsurance = true
				}
			},
			
			showDebtOptions() {
				if (this.hasDebt) {
					// 有债务，显示还款选项
					uni.showModal({
						title: '偿还债务',
						content: `当前债务：¥${this.debtAmount.toLocaleString()}\n年利率：10%`,
						editable: true,
						placeholderText: '输入还款金额',
						success: (res) => {
							if (res.confirm && res.content) {
								const amount = parseInt(res.content)
								if (!isNaN(amount) && amount > 0) {
									const result = this.$store.commit('REPAY_LOAN', amount)
									if (result !== false && this.$store.state.familyDebt.amount === 0) {
										this.hasDebt = false
										this.debtAmount = 0
									}
								}
							}
						}
					})
				} else {
					// 无债务，显示贷款选项
					uni.showActionSheet({
						itemList: [
							'贷款 ¥10,000',
							'贷款 ¥25,000',
							'贷款 ¥50,000',
							'贷款 ¥100,000'
						],
						success: (res) => {
							const amounts = [10000, 25000, 50000, 100000]
							const amount = amounts[res.tapIndex]
							
							const result = this.$store.commit('TAKE_LOAN', amount)
							if (result !== false) {
								this.hasDebt = true
								this.debtAmount = this.$store.state.familyDebt.amount
							}
						}
					})
				}
			},
			
			addMember() {
				// 检查家族资金是否足够（需要50,000）
				if (this.game.totalWealth < 50000) {
					uni.showToast({
						title: '资金不足，需要¥50,000',
						icon: 'none'
					})
					return
				}
				
				// 生成随机成年成员
				const occupations = Object.keys(this.$store.state.occupationIncome).filter(occ => occ !== '无业')
				const maleNames = ['浩然', '子轩', '宇航', '博文', '俊杰', '志强', '伟祺', '皓轩', '明辉', '建国']
				const femaleNames = ['诗涵', '欣怡', '梓萱', '梦琪', '雨婷', '雅静', '婉儿', '思琪', '梦瑶', '晓雪']
				
				const isMale = Math.random() > 0.5
				const names = isMale ? maleNames : femaleNames
				const randomName = names[Math.floor(Math.random() * names.length)]
				const randomOccupation = occupations[Math.floor(Math.random() * occupations.length)]
				const randomAge = Math.floor(Math.random() * 25) + 20 // 20-45岁
				
				const newMember = {
					id: this.$store.state.members.length + '_' + Math.random().toString(36).substr(2, 9),
					name: randomName,
					gender: isMale ? 'male' : 'female',
					age: randomAge,
					birthDate: new Date(new Date().getTime() - randomAge * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					occupation: randomOccupation,
					health: Math.floor(Math.random() * 30) + 70, // 70-100
					happiness: Math.floor(Math.random() * 30) + 70,
					intelligence: Math.floor(Math.random() * 40) + 60, // 60-100
					appearance: Math.floor(Math.random() * 40) + 60,
					money: Math.floor(Math.random() * 5000) + 1000, // 1000-6000
					isAlive: true,
					generation: 1, // 作为家族一代成员
					parents: [],
					spouse: null
				}
				
				// 添加成员到家族
				this.$store.commit('ADD_MEMBER', newMember)
				
				// 扣除家族资金
				this.$store.commit('UPDATE_WEALTH', -50000)
				
				uni.showToast({
					title: `成功添加成员：${randomName}`,
					icon: 'success'
				})
			}
		}
	}
</script>

<style>
	.container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	/* 开始界面样式 */
	.start-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 40rpx;
	}
	
	.title-section {
		text-align: center;
		margin-bottom: 100rpx;
	}
	
	.game-title {
		font-size: 64rpx;
		font-weight: bold;
		color: #ffffff;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.game-subtitle {
		font-size: 32rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.start-form {
		width: 100%;
		max-width: 600rpx;
	}
	
	.form-item {
		margin-bottom: 40rpx;
	}
	
	.form-label {
		display: block;
		font-size: 28rpx;
		color: #ffffff;
		margin-bottom: 16rpx;
	}
	
	.form-input {
		width: 100%;
		height: 80rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 28rpx;
	}
	
	.button-group {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		width: 100%;
		max-width: 600rpx;
	}
	
	.primary-btn {
		background: #ffffff;
		color: #667eea;
		border: none;
		border-radius: 50rpx;
		height: 88rpx;
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.secondary-btn {
		background: transparent;
		color: #ffffff;
		border: 2rpx solid #ffffff;
		border-radius: 50rpx;
		height: 88rpx;
		font-size: 32rpx;
	}
	
	/* 游戏界面样式 */
	.game-screen {
		min-height: 100vh;
		background: #f5f5f5;
	}
	
	.status-bar {
		display: flex;
		justify-content: space-around;
		align-items: center;
		background: #ffffff;
		padding: 20rpx 0;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.status-item {
		text-align: center;
	}
	
	.status-label {
		font-size: 24rpx;
		color: #666;
		display: block;
	}
	
	.status-value {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}
	
	.members-section {
		padding: 30rpx;
	}
	
	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		display: block;
	}
	
	.members-list {
		max-height: 800rpx;
	}
	
	.member-card {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.member-info {
		margin-bottom: 20rpx;
	}
	
	.member-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.member-details {
		display: flex;
		gap: 30rpx;
		font-size: 26rpx;
		color: #666;
	}
	
	.member-stats {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	
	.stat-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.stat-label {
		font-size: 24rpx;
		color: #666;
		width: 80rpx;
	}
	
	.stat-bar {
		flex: 1;
		height: 16rpx;
		background: #e0e0e0;
		border-radius: 8rpx;
		overflow: hidden;
	}
	
	.stat-fill {
		height: 100%;
		transition: width 0.3s ease;
	}
	
	.stat-fill.health {
		background: #4caf50;
	}
	
	.stat-fill.happiness {
		background: #ff9800;
	}
	
	.control-panel {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		padding: 30rpx;
		background: #ffffff;
		border-top: 1rpx solid #e0e0e0;
	}
	
	.control-btn {
		height: 88rpx;
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: bold;
	}
	
	.control-btn.secondary {
		background: #999;
		grid-column: span 2;
	}
	
	/* 速度控制样式 */
	.speed-control {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		background: #ffffff;
		border-top: 1rpx solid #e0e0e0;
		gap: 20rpx;
	}
	
	.speed-label {
		font-size: 28rpx;
		color: #666;
	}
	
	.speed-buttons {
		display: flex;
		gap: 10rpx;
	}
	
	.speed-btn {
		width: 80rpx;
		height: 60rpx;
		background: #f0f0f0;
		color: #666;
		border: none;
		border-radius: 8rpx;
		font-size: 24rpx;
		font-weight: bold;
	}
	
	.speed-btn.active {
		background: #667eea;
		color: #ffffff;
	}
</style>
