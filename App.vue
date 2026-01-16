<script>
	import { getState } from './store/app-store.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 将状态挂载到全局
			getState()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>