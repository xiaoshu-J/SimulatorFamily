<template>
	<view class="container">
		<text class="page-title">🏆 成就系统</text>
		
		<view class="stats-summary">
			<text class="summary-title">成就统计</text>
			<view class="stats-grid">
				<view class="stat-item">
					<text class="stat-number">{{unlockedCount}}</text>
					<text class="stat-label">已解锁</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{totalCount}}</text>
					<text class="stat-label">总成就</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{Math.floor(unlockedCount / totalCount * 100)}}%</text>
					<text class="stat-label">完成度</text>
				</view>
			</view>
		</view>
		
		<view class="achievements-list">
			<view 
				v-for="achievement in achievements" 
				:key="achievement.id"
				class="achievement-card"
				:class="{unlocked: achievement.unlocked}"
			>
				<view class="achievement-icon">{{achievement.icon}}</view>
				<view class="achievement-info">
					<view class="achievement-name">{{achievement.name}}</view>
					<view class="achievement-desc">{{achievement.description}}</view>
				</view>
				<view class="achievement-status">
					<text class="status-text" v-if="achievement.unlocked">✅ 已解锁</text>
					<text class="status-text locked" v-else>🔒 未解锁</text>
				</view>
			</view>
		</view>
		
		<button @click="goBack" class="back-btn">返回</button>
	</view>
</template>

<script>
	export default {
		computed: {
			achievements() {
				return this.$store.state.achievements
			},
			unlockedCount() {
				return this.achievements.filter(a => a.unlocked).length
			},
			totalCount() {
				return this.achievements.length
			}
		},
		methods: {
			goBack() {
				uni.navigateBack()
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
	
	.stats-summary {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.summary-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		display: block;
		margin-bottom: 30rpx;
	}
	
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}
	
	.stat-item {
		text-align: center;
		padding: 20rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
	}
	
	.stat-number {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		color: #667eea;
		margin-bottom: 8rpx;
	}
	
	.stat-label {
		font-size: 24rpx;
		color: #666;
	}
	
	.achievements-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 40rpx;
	}
	
	.achievement-card {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		opacity: 0.6;
	}
	
	.achievement-card.unlocked {
		opacity: 1;
		border-left: 8rpx solid #4caf50;
	}
	
	.achievement-icon {
		font-size: 60rpx;
		margin-right: 20rpx;
	}
	
	.achievement-info {
		flex: 1;
	}
	
	.achievement-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.achievement-desc {
		font-size: 26rpx;
		color: #666;
	}
	
	.achievement-status {
		margin-left: 20rpx;
	}
	
	.status-text {
		font-size: 24rpx;
		color: #4caf50;
		font-weight: bold;
	}
	
	.status-text.locked {
		color: #999;
	}
	
	.back-btn {
		width: 100%;
		height: 88rpx;
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		margin-bottom: 30rpx;
	}
</style>
