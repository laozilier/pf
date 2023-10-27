<script>
	/**
	 * vuex管理登陆状态，具体可以参考官方登陆模板示例
	 */
	import {
		mapState,
		mapMutations
	} from 'vuex';

	export default {
		computed: {
			...mapState(['hasLogin', 'inviteCode'])
		},
		methods: {
			...mapMutations(['login']),
			async getArgs(options) {
				// #ifdef H5
				let inviteCode = this.$api.getQueryString(location.href, 'inviteCode');
				this.inviteCode.uid = inviteCode;
				console.log("this.inviteCode = ", this.inviteCode);
				// #endif
			}
		},

		data() {
			return {}
		},

		onLaunch: async function(options) {
			this.getArgs();
		},

		onShow: async function(options) {},

		onHide: function() {
			console.log('App Hide');
		},
	}
</script>