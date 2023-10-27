<template>
	<view class="container">
		<view class="" style="padding:60rpx 36rpx 36rpx 36rpx;">
			<view class="top">注册下载</view>
			<u-form :model="form" ref="uForm">
				<u-form-item label="手机号码" label-width="140">
					<u-input v-model="form.mobile" placeholder="请输入手机号码" :custom-style="inputStyle" border
						type="number" />
				</u-form-item>
				<u-form-item label="验 证 码" label-width="140">
					<u-input v-model="form.code" placeholder="请输入验证码" :custom-style="inputStyle" border type="number" />
					<u-button slot="right" type="success" size="mini" :custom-style="codeStyle"
						@click="getCode">{{codeTips}}</u-button>
				</u-form-item>
				<view class="" style="height: 28rpx;" />
				<u-form-item label="邀 请 人" label-width="140">
					{{ form.inviteCode }}
				</u-form-item>
			</u-form>
			<view class="submit">
				<u-button :custom-style="customStyle" type="success" @click="submit()" v-if="!reged">注册</u-button>
				<view class="" style="height: 36rpx;"></view>
				<u-button :custom-style="customStyle" type="info" @click="downapp()">下载</u-button>
			</view>
		</view>
		<u-verification-code seconds="60" ref="uCode" @change="codeChange"></u-verification-code>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import httpManager from '../../common/httpManager';
	export default {
		computed: {
			...mapState(['hasLogin', 'inviteCode']),
		},

		data() {
			return {
				form: {},
				customStyle: {
					width: '100%'
				},
				inputStyle: {
					'height': '84rpx'
				},
				codeStyle: {
					'height': '84rpx',
				},
				codeTips: '获取验证码',
				form: {
					mobile: ""
				},
				reged: false,
				downUrl: "这里是下载地址"
			}
		},

		onLoad(e) {
			this.form.inviteCode = this.inviteCode.uid || 0;
		},

		methods: {
			downapp() {
				this.$api.msg("这里是下载地址，可以复制");
				this.copy();
			},

			copy() {
				this.h5Copy(this.downUrl);
			},
			h5Copy(content) {
				if (!document.queryCommandSupported('copy')) {
					// 不支持
					return false
				}

				let textarea = document.createElement("textarea")
				textarea.value = content
				textarea.readOnly = "readOnly"
				document.body.appendChild(textarea)
				textarea.select() // 选择对象
				textarea.setSelectionRange(0, content.length) //核心
				let result = document.execCommand("copy") // 执行浏览器复制命令
				textarea.remove()
				return result
			},

			submit() {
				if (!this.$u.test.mobile(this.form.mobile)) {
					return this.$api.msg('请输入手机号码');
				}

				if (!this.form.code || this.form.code.length != 6) {
					return this.$api.msg('请输入验证码');
				}

				this.$api.msg("注册中...", 60000, true, "loading");
				this.$httpManager.mobileLogin(this.form, (res) => {
					this.$api.msg('注册成功');
					this.reged = true;
				}, (msg) => {
					this.$api.msg(msg);
				})
			},

			getCode() {
				if (!this.$u.test.mobile(this.form.mobile)) {
					this.$api.msg('请先输入正确手机号')
					return;
				}

				if (this.$refs.uCode.canGetCode) {
					uni.showLoading({
						title: '正在获取验证码',
						mask: true
					})
					this.$httpManager.getVerifyCode({
							mobile: this.form.mobile
						},
						(res) => {
							setTimeout(() => {
								uni.hideLoading();
								this.$api.msg('验证码已发送');
								this.$refs.uCode.start();
							}, 1000);
							if (!!res) {
								this.form.code = res.code || "";
								this.downUrl = res.downUrl || "";
							}
						},
						(msg) => {
							this.$api.msg(msg);
						}
					);
				} else {
					this.$api.msg('倒计时结束后再发送');
				}
			},

			codeChange(text) {
				this.codeTips = text;
			},
		}
	}
</script>
<style lang="scss" scoped>
	page {
		// height: 100vh;
	}

	.top {
		color: #000;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		justify-content: center;
		padding: 36rpx;
	}

	.tips {
		color: red;
	}

	.input-bg {
		padding: 12rpx 0;
	}

	.input {
		align-items: center;
	}

	.submit {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 36rpx;
	}
</style>