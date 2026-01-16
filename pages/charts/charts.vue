<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="nav-bar">
			<text class="nav-title">📊 数据统计</text>
			<button @click="goBack" class="back-btn">返回</button>
		</view>
		
		<!-- 图表选项卡 -->
		<view class="tab-bar">
			<view 
				class="tab-item" 
				:class="{active: currentTab === 'wealth'}"
				@click="currentTab = 'wealth'"
			>
				💰 资产变化
			</view>
			<view 
				class="tab-item" 
				:class="{active: currentTab === 'members'}"
				@click="currentTab = 'members'"
			>
				👥 成员数量
			</view>
		</view>
		
		<!-- 图表容器 -->
		<view class="chart-container">
			<canvas 
				canvas-id="wealthChart" 
				v-show="currentTab === 'wealth'"
				class="chart-canvas"
			></canvas>
			<canvas 
				canvas-id="membersChart" 
				v-show="currentTab === 'members'"
				class="chart-canvas"
			></canvas>
		</view>
		
		<!-- 当前数据 -->
		<view class="current-data">
			<view class="data-card">
				<text class="data-label">当前总资产</text>
				<text class="data-value">¥{{game.totalWealth.toLocaleString()}}</text>
			</view>
			<view class="data-card">
				<text class="data-label">在世成员</text>
				<text class="data-value">{{livingMembersCount}}人</text>
			</view>
		</view>
		
		<!-- 无数据提示 -->
		<view v-if="showNoData" class="no-data">
			<text class="no-data-text">暂无历史数据</text>
			<text class="no-data-tip">推进时间会记录历史数据</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 'wealth'
			}
		},
		computed: {
			game() {
				return this.$store.state.game
			},
			wealthHistory() {
				return this.$store.state.gameHistory.wealth
			},
			membersHistory() {
				return this.$store.state.gameHistory.members
			},
			livingMembersCount() {
				return this.$store.getters.getLivingMembers().length
			},
			showNoData() {
				return this.wealthHistory.length === 0
			}
		},
		onReady() {
			this.drawCharts()
		},
		watch: {
			currentTab() {
				setTimeout(() => {
					this.drawCharts()
				}, 100)
			}
		},
		methods: {
			drawCharts() {
				if (this.currentTab === 'wealth') {
					this.drawWealthChart()
				} else {
					this.drawMembersChart()
				}
			},
			drawWealthChart() {
				const ctx = uni.createCanvasContext('wealthChart', this)
				const data = this.wealthHistory
				
				if (data.length === 0) return
				
				const width = 700
				const height = 400
				const padding = 40
				
				// 清空画布
				ctx.clearRect(0, 0, width, height)
				
				// 计算数据范围
				const values = data.map(d => d.value)
				const minValue = Math.min(...values)
				const maxValue = Math.max(...values)
				const valueRange = maxValue - minValue || 1
				
				// 绘制坐标轴
				ctx.beginPath()
				ctx.moveTo(padding, padding)
				ctx.lineTo(padding, height - padding)
				ctx.lineTo(width - padding, height - padding)
				ctx.setStrokeStyle('#333')
				ctx.setLineWidth(2)
				ctx.stroke()
				
				// 绘制折线
				ctx.beginPath()
				data.forEach((point, index) => {
					const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
					const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding)
					
					if (index === 0) {
						ctx.moveTo(x, y)
					} else {
						ctx.lineTo(x, y)
					}
				})
				ctx.setStrokeStyle('#667eea')
				ctx.setLineWidth(3)
				ctx.stroke()
				
				// 绘制数据点
				data.forEach((point, index) => {
					const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
					const y = height - padding - ((point.value - minValue) / valueRange) * (height - 2 * padding)
					
					ctx.beginPath()
					ctx.arc(x, y, 4, 0, 2 * Math.PI)
					ctx.setFillStyle('#667eea')
					ctx.fill()
				})
				
				// 添加标题
				ctx.setFontSize(16)
				ctx.setFillStyle('#333')
				ctx.fillText('资产变化趋势', width / 2 - 40, 20)
				
				// 添加Y轴标签
				ctx.setFontSize(10)
				ctx.setFillStyle('#666')
				ctx.fillText(`¥${(minValue / 10000).toFixed(1)}万`, 5, height - padding + 5)
				ctx.fillText(`¥${(maxValue / 10000).toFixed(1)}万`, 5, padding + 5)
				
				ctx.draw()
			},
			drawMembersChart() {
				const ctx = uni.createCanvasContext('membersChart', this)
				const data = this.membersHistory
				
				if (data.length === 0) return
				
				const width = 700
				const height = 400
				const padding = 40
				
				// 清空画布
				ctx.clearRect(0, 0, width, height)
				
				// 计算数据范围
				const values = data.map(d => d.count)
				const minValue = Math.min(...values)
				const maxValue = Math.max(...values)
				const valueRange = maxValue - minValue || 1
				
				// 绘制坐标轴
				ctx.beginPath()
				ctx.moveTo(padding, padding)
				ctx.lineTo(padding, height - padding)
				ctx.lineTo(width - padding, height - padding)
				ctx.setStrokeStyle('#333')
				ctx.setLineWidth(2)
				ctx.stroke()
				
				// 绘制折线
				ctx.beginPath()
				data.forEach((point, index) => {
					const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
					const y = height - padding - ((point.count - minValue) / valueRange) * (height - 2 * padding)
					
					if (index === 0) {
						ctx.moveTo(x, y)
					} else {
						ctx.lineTo(x, y)
					}
				})
				ctx.setStrokeStyle('#4ecdc4')
				ctx.setLineWidth(3)
				ctx.stroke()
				
				// 绘制数据点
				data.forEach((point, index) => {
					const x = padding + (index / (data.length - 1)) * (width - 2 * padding)
					const y = height - padding - ((point.count - minValue) / valueRange) * (height - 2 * padding)
					
					ctx.beginPath()
					ctx.arc(x, y, 4, 0, 2 * Math.PI)
					ctx.setFillStyle('#4ecdc4')
					ctx.fill()
				})
				
				// 添加标题
				ctx.setFontSize(16)
				ctx.setFillStyle('#333')
				ctx.fillText('成员数量变化', width / 2 - 40, 20)
				
				// 添加Y轴标签
				ctx.setFontSize(10)
				ctx.setFillStyle('#666')
				ctx.fillText(`${minValue}人`, 5, height - padding + 5)
				ctx.fillText(`${maxValue}人`, 5, padding + 5)
				
				ctx.draw()
			},
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
		padding: 20rpx;
	}
	
	/* 导航栏 */
	.nav-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.nav-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.back-btn {
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 8rpx;
		font-size: 24rpx;
		padding: 10rpx 20rpx;
	}
	
	/* 选项卡 */
	.tab-bar {
		display: flex;
		background: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}
	
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 30rpx;
		font-size: 28rpx;
		color: #666;
		background: #ffffff;
		transition: all 0.3s;
	}
	
	.tab-item.active {
		background: #667eea;
		color: #ffffff;
		font-weight: bold;
	}
	
	/* 图表容器 */
	.chart-container {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		height: 500rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.chart-canvas {
		width: 100%;
		height: 100%;
	}
	
	/* 当前数据 */
	.current-data {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.data-card {
		flex: 1;
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		text-align: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.data-label {
		display: block;
		font-size: 24rpx;
		color: #666;
		margin-bottom: 10rpx;
	}
	
	.data-value {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #667eea;
	}
	
	/* 无数据提示 */
	.no-data {
		text-align: center;
		padding: 100rpx 40rpx;
		background: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.no-data-text {
		display: block;
		font-size: 32rpx;
		color: #999;
		margin-bottom: 20rpx;
	}
	
	.no-data-tip {
		display: block;
		font-size: 24rpx;
		color: #ccc;
	}
</style>
