<template>
	<view class="container">
		<text class="page-title">家族树</text>
		
		<view v-if="generations.length > 0" class="family-tree">
			<view v-for="(gen, index) in generations" :key="index" class="generation-section">
				<text class="generation-title">第 {{gen.generation}} 代</text>
				<view class="members-row">
					<view 
						v-for="member in gen.members" 
						:key="member.id" 
						class="member-couple"
					>
						<!-- 主成员 -->
						<view 
							class="member-node"
							@click="viewMember(member.id)"
						>
							<view 
								class="member-avatar" 
								:style="{backgroundColor: member.gender === 'male' ? '#667eea' : '#e91e63'}"
							>
								<text class="avatar-text">{{member.name.charAt(0)}}</text>
							</view>
							<text class="member-name">{{member.name}}</text>
							<text class="member-age">{{Math.floor(member.age)}}岁</text>
							<view class="relation-tags">
								<text v-if="member.spouse" class="tag tag-married">已婚</text>
								<text v-if="member.children && member.children.length > 0" class="tag tag-parent">有子女</text>
								<text v-if="member.age >= 60" class="tag tag-elder">老年</text>
								<text v-if="member.age >= 18 && member.age < 25" class="tag tag-young">青年</text>
								<text v-if="member.age < 18" class="tag tag-child">未成年</text>
							</view>
							<view v-if="!member.isAlive" class="deceased-mark">
								<text class="deceased-text">已故</text>
							</view>
						</view>
						
						<!-- 配偶连接符 -->
						<view v-if="getSpouse(member)" class="spouse-connector">
							<text class="connector-line">——</text>
						</view>
						
						<!-- 配偶 -->
						<view 
							v-if="getSpouse(member)"
							class="member-node spouse"
							@click="viewMember(getSpouse(member).id)"
						>
							<view 
								class="member-avatar" 
								:style="{backgroundColor: getSpouse(member).gender === 'male' ? '#667eea' : '#e91e63'}"
							>
								<text class="avatar-text">{{getSpouse(member).name.charAt(0)}}</text>
							</view>
							<text class="member-name">{{getSpouse(member).name}}</text>
							<text class="member-age">{{Math.floor(getSpouse(member).age)}}岁</text>
							<view class="relation-tags">
								<text v-if="getSpouse(member).children && getSpouse(member).children.length > 0" class="tag tag-parent">有子女</text>
								<text v-if="getSpouse(member).age >= 60" class="tag tag-elder">老年</text>
							</view>
							<view v-if="!getSpouse(member).isAlive" class="deceased-mark">
								<text class="deceased-text">已故</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view v-else class="empty-state">
			<text class="empty-text">暂无家族成员</text>
		</view>
		
		<view class="stats-summary">
			<text class="summary-title">家族统计</text>
			<view class="stats-grid">
				<view class="stat-item">
					<text class="stat-number">{{totalMembers}}</text>
					<text class="stat-label">总成员</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{livingMembers}}</text>
					<text class="stat-label">在世</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{deceasedMembers}}</text>
					<text class="stat-label">已故</text>
				</view>
				<view class="stat-item">
					<text class="stat-number">{{maxGeneration}}</text>
					<text class="stat-label">世代</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
			computed: {
				generations() {
					const groups = this.$store.getters.getMembersByGeneration()
					return Object.keys(groups)
						.sort((a, b) => parseInt(a) - parseInt(b))
						.map(gen => {
							// 过滤掉已经在夫妻配对中显示的配偶
							const filteredMembers = groups[gen].filter(member => {
								// 如果成员有配偶，且配偶ID小于当前成员ID，则跳过（因为会在夫妻配对中显示）
								if (member.spouse) {
									const spouse = this.$store.state.members.find(m => m.id === member.spouse)
									if (spouse && String(member.id) > String(member.spouse)) {
										return false
									}
								}
								return true
							})
							
							return {
								generation: gen,
								members: filteredMembers
							}
						})
				},
				totalMembers() {
					return this.$store.state.members.length
				},
				livingMembers() {
					return this.$store.getters.getLivingMembers().length
				},
				deceasedMembers() {
					return this.$store.getters.getDeceasedMembers().length
				},
				maxGeneration() {
					const gens = this.$store.state.members.map(m => m.generation)
					return gens.length > 0 ? Math.max(...gens) : 0
				}
			},		methods: {
			viewMember(memberId) {
				uni.navigateTo({
					url: `/pages/member-detail/member-detail?id=${memberId}`
				})
			},
			
			getSpouse(member) {
				if (!member.spouse) return null
				
				// 避免重复展示（只显示一次夫妻，ID小的在前）
				if (member.id > member.spouse) return null
				
				return this.$store.state.members.find(m => m.id === member.spouse)
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
	}
	
	.family-tree {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
	}
	
	.generation-section {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.generation-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #667eea;
		display: block;
		margin-bottom: 30rpx;
		text-align: center;
	}
	
	.members-row {
		display: flex;
		flex-wrap: wrap;
		gap: 30rpx;
		justify-content: center;
	}
	
	.member-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		min-width: 160rpx;
		position: relative;
	}
	
	.member-couple {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin: 20rpx;
	}
	
	.spouse-connector {
		display: flex;
		align-items: center;
	}
	
	.connector-line {
		font-size: 32rpx;
		color: #999;
		font-weight: bold;
	}
	
	.member-node.spouse {
		opacity: 0.9;
		transform: scale(0.95);
	}
	
	.member-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
	}
	
	.avatar-text {
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.member-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.member-age {
		font-size: 24rpx;
		color: #666;
	}
	
	.deceased-mark {
		position: absolute;
		top: 0;
		right: 0;
		background: rgba(244, 67, 54, 0.9);
		border-radius: 50%;
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.deceased-text {
		font-size: 20rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 600rpx;
	}
	
	.empty-text {
		font-size: 32rpx;
		color: #999;
	}
	
	.stats-summary {
		margin-top: 50rpx;
		background: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx;
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
		grid-template-columns: repeat(4, 1fr);
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
		font-size: 36rpx;
		font-weight: bold;
		color: #667eea;
		margin-bottom: 8rpx;
	}
	
	.stat-label {
		font-size: 24rpx;
		color: #666;
	}
	
	/* 关系标签样式 */
	.relation-tags {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 10rpx;
		gap: 8rpx;
	}
	
	.tag {
		padding: 4rpx 12rpx;
		border-radius: 16rpx;
		font-size: 20rpx;
		font-weight: bold;
		color: #ffffff;
	}
	
	.tag-married {
		background: #ff6b6b;
	}
	
	.tag-parent {
		background: #4ecdc4;
	}
	
	.tag-elder {
		background: #95a5a6;
	}
	
	.tag-young {
		background: #f39c12;
	}
	
	.tag-child {
		background: #3498db;
	}
</style>
