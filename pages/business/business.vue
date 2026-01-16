<template>
	<view class="container">
		<text class="page-title">🏢 家族企业</text>
		
		<!-- 企业列表和总收益 -->
		<view v-if="hasBusiness" class="summary-section">
			<view class="summary-card">
				<text class="summary-title">企业总收益</text>
				<text class="summary-amount">¥{{totalBusinessRevenue.toLocaleString()}}</text>
				<text class="summary-desc">来自 {{businesses.length}} 家企业 ({{businessCountText}})</text>
			</view>
		</view>
		
		<!-- 已创建企业列表 -->
		<view v-if="hasBusiness" class="business-list">
			<view 
				v-for="business in businesses" 
				:key="business.id"
				class="business-card"
			>
				<view class="business-header">
					<text class="business-name">{{business.name}}</text>
					<text class="business-level">Lv.{{business.level}}</text>
				</view>
				
				<view class="business-stats">
					<view class="stat-item">
						<text class="stat-label">类型</text>
						<text class="stat-value">{{business.type}}</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">年收入</text>
						<text class="stat-value">¥{{business.revenue.toLocaleString()}}</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">员工</text>
						<text class="stat-value">{{business.employees}}人</text>
					</view>
					<view class="stat-item">
						<text class="stat-label">资本</text>
						<text class="stat-value">¥{{business.capital.toLocaleString()}}</text>
					</view>
				</view>
				
				<view class="business-actions">
					<view class="upgrade-info">
						<text v-if="business.level < 10">升级到 Lv.{{business.level + 1}} 需 ¥{{(business.level * 100000).toLocaleString()}}</text>
						<text v-else style="color: #4caf50;">🎉 已满级</text>
					</view>
					<button 
						@click="upgradeBusiness(business.id)" 
						class="upgrade-btn"
						:disabled="game.totalWealth < (business.level * 100000) || business.level >= 10"
						v-if="business.level < 10"
					>
						{{game.totalWealth >= (business.level * 100000) ? '升级' : '资金不足'}}
					</button>
				</view>
			</view>
		</view>
		
		<!-- 创建新企业 -->
		<view class="create-section">
			<text class="section-title">{{hasBusiness ? '创建新企业' : '创建你的第一家企业'}}</text>
			<view class="limit-info">
				<text class="limit-text" :class="{warning: !canCreateMoreBusiness}">
					{{businessCountText}} 已创建 (最多4个)
				</text>
				<text v-if="!canCreateMoreBusiness" class="limit-warning">⚠️ 已达到企业数量上限</text>
			</view>
			
			<view class="business-types">
				<view class="type-grid">
					<view 
						v-for="type in businessTypes" 
						:key="type.type"
						class="type-card"
						:class="{disabled: !canCreateMoreBusiness || isBusinessTypeExist(type.type)}"
						@click="selectBusinessType(type)"
					>
						<text class="type-icon">{{type.icon}}</text>
						<text class="type-name">{{type.type}}</text>
						<text class="type-desc">年收入：¥{{type.baseRevenue.toLocaleString()}}</text>
						<text class="type-desc">员工：{{type.baseEmployees}}人</text>
						<text class="type-desc">启动资金：¥{{type.minCapital.toLocaleString()}}</text>
						<text v-if="isBusinessTypeExist(type.type)" class="type-exists">✅ 已创建</text>
					</view>
				</view>
			</view>
		</view>
		
		<button @click="goBack" class="back-btn">返回</button>
	</view>
</template>

	<script>
	export default {
		data() {
			return {
				businessTypes: [
					{ type: '餐饮', icon: '🍽️', baseRevenue: 50000, baseEmployees: 5, minCapital: 50000 },
					{ type: '科技', icon: '💻', baseRevenue: 100000, baseEmployees: 10, minCapital: 100000 },
					{ type: '制造', icon: '🏭', baseRevenue: 80000, baseEmployees: 15, minCapital: 80000 },
					{ type: '零售', icon: '🛍️', baseRevenue: 60000, baseEmployees: 8, minCapital: 60000 }
				],
				selectedType: null
			}
		},
		computed: {
			game() {
				return this.$store.state.game
			},
			businesses() {
				return this.$store.state.familyBusinesses
			},
			hasBusiness() {
				return this.businesses.length > 0
			},
			totalBusinessRevenue() {
				return this.businesses.reduce((total, business) => {
					return total + business.revenue
				}, 0)
			},
			canCreateMoreBusiness() {
				return this.businesses.length < 4
			},
			businessCountText() {
				return `${this.businesses.length}/4`
			}
		},		methods: {
			selectBusinessType(type) {
				if (!this.canCreateMoreBusiness) {
					uni.showToast({
						title: '已达到企业数量上限',
						icon: 'none'
					})
					return
				}
				
				if (this.isBusinessTypeExist(type.type)) {
					uni.showToast({
						title: `已存在${type.type}企业`,
						icon: 'none'
					})
					return
				}
				
				this.selectedType = type
				
				if (this.game.totalWealth < type.minCapital) {
					uni.showToast({
						title: `资金不足，需要¥${type.minCapital.toLocaleString()}`,
						icon: 'none'
					})
					return
				}
				
				uni.showModal({
					title: '创建企业',
					content: `确定要创建${type.type}企业吗？\n需要投入：¥${type.minCapital.toLocaleString()}`,
					success: (res) => {
						if (res.confirm) {
							this.foundBusiness(type)
						}
					}
				})
			},
			foundBusiness(type) {
				const businessName = `${this.$store.state.game.familyName}${type.type}公司`
				
				const success = this.$store.commit('FOUND_BUSINESS', {
					type: type.type,
					name: businessName,
					capital: type.minCapital
				})
			},
			upgradeBusiness(businessId) {
				const business = this.businesses.find(b => b.id === businessId)
				const upgradeCost = business.level * 100000
				
				if (this.game.totalWealth < upgradeCost) {
					uni.showToast({
						title: '资金不足',
						icon: 'none'
					})
					return
				}
				
				this.$store.commit('UPGRADE_BUSINESS', businessId)
			},
			goBack() {
				uni.navigateBack()
			},
			isBusinessTypeExist(type) {
				return this.businesses.some(b => b.type === type)
			}
		}
	}
</script>

<style>
	.container {
		min-height: 100vh;
		background: #f5f5f5;
		padding: 30rpx;
	}
	
	.page-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		display: block;
		margin-bottom: 40rpx;
		margin-top: 40rpx;
	}
	
	/* 总收益汇总 */
	.summary-section {
		margin-bottom: 40rpx;
	}
	
	.summary-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		text-align: center;
	}
	
	.summary-title {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
		margin-bottom: 10rpx;
	}
	
	.summary-amount {
		font-size: 48rpx;
		font-weight: bold;
		color: #ffffff;
		display: block;
		margin-bottom: 10rpx;
	}
	
	.summary-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		display: block;
	}
	
	/* 企业列表 */
	.business-list {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		margin-bottom: 40rpx;
	}
	
	.business-card {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		border-left: 8rpx solid #667eea;
	}
	
	.business-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.business-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.business-level {
		font-size: 28rpx;
		color: #667eea;
		font-weight: bold;
		background: rgba(102, 126, 234, 0.1);
		padding: 8rpx 20rpx;
		border-radius: 8rpx;
	}
	
	.business-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		margin-bottom: 30rpx;
	}
	
	.stat-item {
		text-align: center;
		padding: 20rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
	}
	
	.stat-label {
		display: block;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 8rpx;
	}
	
	.stat-value {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}
	
	.business-actions {
		border-top: 1rpx solid #e0e0e0;
		padding-top: 20rpx;
	}
	
	.upgrade-info {
		margin-bottom: 20rpx;
		text-align: center;
	}
	
	.upgrade-info text {
		font-size: 24rpx;
		color: #666;
	}
	
	.upgrade-btn {
		width: 100%;
		height: 70rpx;
		background: #4caf50;
		color: #ffffff;
		border: none;
		border-radius: 8rpx;
		font-size: 26rpx;
		font-weight: bold;
	}
	
	.upgrade-btn:disabled {
		background: #ccc;
		color: #999;
	}
	
	/* 创建新企业 */
	.create-section {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 40rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.section-desc {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 30rpx;
		display: block;
	}
	
	.business-types {
		width: 100%;
	}
	
	.type-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}
	
	.type-card {
		background: #f8f8f8;
		border-radius: 16rpx;
		padding: 30rpx;
		text-align: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.type-icon {
		font-size: 60rpx;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.type-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.type-desc {
		font-size: 24rpx;
		color: #666;
		display: block;
		margin-bottom: 8rpx;
	}
	
	.back-btn {
		width: 100%;
		height: 88rpx;
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		margin-top: 20rpx;
	}
	
	/* 限制信息样式 */
	.limit-info {
		margin-bottom: 30rpx;
		text-align: center;
	}
	
	.limit-text {
		font-size: 28rpx;
		color: #4caf50;
		font-weight: bold;
		display: block;
	}
	
	.limit-text.warning {
		color: #ff9800;
	}
	
	.limit-warning {
		font-size: 24rpx;
		color: #ff9800;
		display: block;
		margin-top: 10rpx;
	}
	
	.type-card.disabled {
		opacity: 0.5;
		pointer-events: none;
		background: #f5f5f5;
	}
	
	.type-exists {
		font-size: 24rpx;
		color: #4caf50;
		font-weight: bold;
		margin-top: 10rpx;
		display: block;
	}
</style>
