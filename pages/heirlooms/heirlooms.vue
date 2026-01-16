<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="nav-bar">
			<text class="nav-title">🏺 传家宝管理</text>
			<button @click="goBack" class="back-btn">返回</button>
		</view>
		
		<!-- 传家宝列表 -->
		<view v-if="heirlooms.length > 0" class="heirlooms-section">
			<text class="section-title">家族传家宝 ({{heirlooms.length}})</text>
			<scroll-view class="heirlooms-list" scroll-y>
				<view v-for="heirloom in heirlooms" :key="heirloom.id" class="heirloom-card">
					<view class="heirloom-header">
						<text class="heirloom-icon">{{getHeirloomIcon(heirloom.type)}}</text>
						<text class="heirloom-name">{{heirloom.name}}</text>
						<text class="heirloom-type">{{getHeirloomTypeText(heirloom.type)}}</text>
					</view>
					<view class="heirloom-effects">
						<text class="effect-label">效果：</text>
						<view v-for="(value, key) in heirloom.effect" :key="key" class="effect-item">
							<text class="effect-name">{{getEffectName(key)}}</text>
							<text class="effect-value">+{{value}}</text>
						</view>
					</view>
					<view class="heirloom-owner" v-if="heirloom.ownerId">
						<text class="owner-label">拥有者：</text>
						<text class="owner-name">{{getMemberName(heirloom.ownerId)}}</text>
					</view>
					<view class="heirloom-info">
						<text class="info-text">创建于：{{heirloom.creationDate}}</text>
						<text class="info-text">世代：第{{heirloom.generation}}代</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<view v-else class="empty-state">
			<text class="empty-text">暂无传家宝</text>
			<text class="empty-tip">点击下方按钮创建第一个传家宝</text>
		</view>
		
		<!-- 创建传家宝 -->
		<view class="create-section">
			<text class="section-title">创建传家宝</text>
			
			<view class="form-item">
				<text class="form-label">传家宝名称：</text>
				<input v-model="heirloomName" class="form-input" placeholder="请输入传家宝名称" />
			</view>
			
			<view class="form-item">
				<text class="form-label">传家宝类型：</text>
				<view class="type-selector">
					<view 
						v-for="type in heirloomTypes" 
						:key="type.type"
						class="type-option"
						:class="{selected: selectedType === type.type}"
						@click="selectType(type)"
					>
						<text class="type-icon">{{type.icon}}</text>
						<text class="type-name">{{type.name}}</text>
						<text class="type-desc">{{type.desc}}</text>
					</view>
				</view>
			</view>
			
			<view class="form-item" v-if="selectedType">
				<text class="form-label">效果强度：</text>
				<view class="effect-slider">
					<text class="slider-label">弱</text>
					<slider 
						:value="effectStrength" 
						@change="onEffectStrengthChange"
						min="5" 
						max="20" 
						step="5"
						class="slider"
					/>
					<text class="slider-label">强</text>
				</view>
				<text class="effect-value-text">效果值：+{{effectStrength}}</text>
			</view>
			
			<view class="form-item" v-if="selectedType">
				<text class="form-label">分配给成员：</text>
				<view v-if="members.length === 0" class="empty-members-warning">
					<text class="warning-text">⚠️ 暂无在世成员，请先创建或添加成员</text>
				</view>
				<picker v-else @change="onMemberChange" :value="selectedMemberIndex" :range="memberNames" class="member-picker">
					<view class="picker-content">
						<text>{{selectedMemberIndex >= 0 ? memberNames[selectedMemberIndex] : '请选择成员（可选）'}}</text>
						<text class="picker-arrow">▼</text>
					</view>
				</picker>
			</view>
			
			<view class="cost-info" v-if="selectedType">
				<text class="cost-label">创建费用：</text>
				<text class="cost-value">¥{{creationCost.toLocaleString()}}</text>
			</view>
			
			<button @click="createHeirloom" class="create-btn" :disabled="!canCreate">创建传家宝</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				heirloomName: '',
				selectedType: '',
				selectedMemberIndex: -1,
				effectStrength: 10,
				heirloomTypes: [
					{ type: 'wisdom', name: '智慧之书', icon: '📚', desc: '提升智力' },
					{ type: 'beauty', name: '美丽之镜', icon: '💎', desc: '提升外貌' },
					{ type: 'health', name: '健康之石', icon: '💚', desc: '提升健康' },
					{ type: 'luck', name: '幸运之符', icon: '🍀', desc: '提升快乐' }
				]
			}
		},
		computed: {
			heirlooms() {
				return this.$store.state.familyHeirlooms || []
			},
			members() {
				// 调用getter函数获取在世成员列表
				return this.$store.getters.getLivingMembers()
			},
			memberNames() {
				return this.members.map(m => m.name)
			},
			creationCost() {
				return this.effectStrength * 500 + 2000
			},
			canCreate() {
				return this.heirloomName.trim() && this.selectedType && this.$store.state.game.totalWealth >= this.creationCost
			},
			selectedMember() {
				return this.selectedMemberIndex >= 0 ? this.members[this.selectedMemberIndex] : null
			}
		},
		onShow() {
			// 调试：打印成员列表信息
			console.log('传家宝页面显示')
			console.log('在世成员数量:', this.members.length)
			console.log('在世成员列表:', this.members)
		},
		methods: {
			selectType(type) {
				this.selectedType = type.type
			},
			onEffectStrengthChange(e) {
				this.effectStrength = e.detail.value
			},
			onMemberChange(e) {
				this.selectedMemberIndex = e.detail.value
			},
			createHeirloom() {
				if (!this.canCreate) return
				
				const effect = {}
				switch (this.selectedType) {
					case 'wisdom':
						effect.intelligence = this.effectStrength
						break
					case 'beauty':
						effect.appearance = this.effectStrength
						break
					case 'health':
						effect.health = this.effectStrength
						break
					case 'luck':
						effect.happiness = this.effectStrength
						break
				}
				
				const success = this.$store.commit('CREATE_HEIRLOOM', {
					name: this.heirloomName.trim(),
					type: this.selectedType,
					effect: effect,
					targetMemberId: this.selectedMember ? this.selectedMember.id : null
				})
				
				if (success !== false) {
					uni.showToast({
						title: '传家宝创建成功！',
						icon: 'success'
					})
					
					// 重置表单
					this.heirloomName = ''
					this.selectedType = ''
					this.selectedMemberIndex = -1
					this.effectStrength = 10
				}
			},
			getHeirloomIcon(type) {
				const typeInfo = this.heirloomTypes.find(t => t.type === type)
				return typeInfo ? typeInfo.icon : '🏺'
			},
			getHeirloomTypeText(type) {
				const typeInfo = this.heirloomTypes.find(t => t.type === type)
				return typeInfo ? typeInfo.name : '未知'
			},
			getMemberName(memberId) {
				const member = this.$store.state.members.find(m => m.id === memberId)
				return member ? member.name : '未知'
			},
			getEffectName(key) {
				const names = {
					intelligence: '智力',
					appearance: '外貌',
					health: '健康',
					happiness: '快乐'
				}
				return names[key] || key
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
	
	/* 传家宝列表 */
	.heirlooms-section {
		margin-bottom: 40rpx;
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.heirlooms-list {
		max-height: 400rpx;
	}
	
	.heirloom-card {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.heirloom-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.heirloom-icon {
		font-size: 48rpx;
		margin-right: 20rpx;
	}
	
	.heirloom-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
	}
	
	.heirloom-type {
		font-size: 24rpx;
		color: #667eea;
		background: #f0f0f0;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}
	
	.heirloom-effects {
		margin-bottom: 20rpx;
	}
	
	.effect-label {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.effect-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}
	
	.effect-name {
		font-size: 26rpx;
		color: #333;
	}
	
	.effect-value {
		font-size: 26rpx;
		color: #4caf50;
		font-weight: bold;
	}
	
	.heirloom-owner {
		margin-bottom: 20rpx;
		padding: 20rpx;
		background: #f8f8f8;
		border-radius: 12rpx;
	}
	
	.owner-label {
		font-size: 26rpx;
		color: #666;
		margin-right: 10rpx;
	}
	
	.owner-name {
		font-size: 28rpx;
		color: #667eea;
		font-weight: bold;
	}
	
	.heirloom-info {
		display: flex;
		justify-content: space-between;
		font-size: 22rpx;
		color: #999;
		margin-top: 20rpx;
	}
	
	/* 空状态 */
	.empty-state {
		text-align: center;
		padding: 100rpx 40rpx;
		background: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.empty-text {
		display: block;
		font-size: 32rpx;
		color: #999;
		margin-bottom: 20rpx;
	}
	
	.empty-tip {
		display: block;
		font-size: 24rpx;
		color: #ccc;
	}
	
	/* 创建区域 */
	.create-section {
		background: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 15rpx;
		font-weight: bold;
	}
	
	.form-input {
		width: 100%;
		height: 80rpx;
		background: #f5f5f5;
		border-radius: 12rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		border: none;
	}
	
	/* 类型选择器 */
	.type-selector {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.type-option {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background: #f5f5f5;
		border-radius: 12rpx;
		transition: all 0.3s;
		cursor: pointer;
	}
	
	.type-option.selected {
		background: #e8eaf6;
		border: 2rpx solid #667eea;
	}
	
	.type-icon {
		font-size: 40rpx;
		margin-right: 20rpx;
	}
	
	.type-name {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-right: 20rpx;
	}
	
	.type-desc {
		font-size: 24rpx;
		color: #666;
	}
	
	/* 滑块 */
	.effect-slider {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-top: 20rpx;
	}
	
	.slider-label {
		font-size: 24rpx;
		color: #666;
	}
	
	.slider {
		flex: 1;
	}
	
	.effect-value-text {
		font-size: 28rpx;
		color: #667eea;
		font-weight: bold;
		text-align: center;
		margin-top: 15rpx;
	}
	
	/* 成员选择器 */
	.member-picker {
		width: 100%;
	}
	
	.picker-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background: #f5f5f5;
		border-radius: 12rpx;
	}
	
	.picker-arrow {
		color: #999;
	}
	
	/* 费用信息 */
	.cost-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background: #fff3cd;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
	}
	
	.cost-label {
		font-size: 28rpx;
		color: #856404;
		font-weight: bold;
	}
	
	.cost-value {
		font-size: 32rpx;
		color: #856404;
		font-weight: bold;
	}
	
	/* 创建按钮 */
	.create-btn {
		width: 100%;
		height: 88rpx;
		background: #667eea;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.create-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
	
	/* 空成员警告 */
	.empty-members-warning {
		padding: 20rpx;
		background: #fff3cd;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
	}
	
	.warning-text {
		font-size: 26rpx;
		color: #856404;
		text-align: center;
	}
</style>
