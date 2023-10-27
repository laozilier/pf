/**
 * `接口
 */
import store from '@/store';

const HTTP_BASE = 'http://120.78.163.134:30000';

const HTTP_GET_VERIFY_CODE = '/getVerifyCode';
const HTTP_MOBILE_LOGIN = '/mobileLogin';

class httpManager {
	constructor(arg) {
		super.constructor(arg);
	}

	/**
	 * 将参数转找成链接形式
	 * @param context
	 * @return {*}
	 */
	queryString(context) {
		if (!context || typeof context !== "object") {
			return "";
		}
		let str = "?";
		for (let k in context) {
			str === "?" || (str += "&");
			str += k + "=" + context[k];
		}
		return str;
	}

	async nextRequest(url, method, params, suc, fail) {
		let context = "";
		if (!/post/i.test(method)) {
			context = this.queryString(params);
		}

		let finalUrl = HTTP_BASE + url + context;
		uni.request({
			method: method,
			url: finalUrl,
			data: {},
			header: {
				'Accept': 'application/json',
			},
			success: (res) => {
				// if (this.isDebug()) {
				console.log('----------------------------------------');
				console.log('http请求 finalUrl = ', finalUrl);
				console.log('http请求 method = ', method);
				console.log('http请求 params = ', JSON.stringify(params));
				console.log('http请求 res = ', res.data);
				console.log('----------------------------------------');
				// }
				if (res.statusCode == 200) {
					let resData = res.data;
					let code = resData.code;
					if (code == 200) {
						!!suc && suc(resData.result);
					} else {
						!!fail && fail(resData.code.toString());
					}
				} else {
					!!fail && fail(res.statusCode.toString() || "网络错误，请检查网络设置");
				}
			},
			fail: (err) => {
				!!fail && fail(err.desc || "网络错误，请检查网络设置");
			}
		});
	}

	isDebug() {
		return HTTP_BASE.indexOf("192.168") > -1 || HTTP_BASE.indexOf("127.0.0.1") > -1;
	}

	/**
	 * 获取验证码接口
	 * @param {Object} params {mobile}
	 * @param {Object} suc
	 * @param {Object} fail
	 */
	getVerifyCode(params, suc, fail) {
		this.nextRequest(HTTP_GET_VERIFY_CODE, 'GET', params, suc, fail);
	}

	/**
	 * 注册接口
	 * @param {Object} params {mobile}
	 * @param {Object} params {code}
	 * @param {Object} suc
	 * @param {Object} fail
	 */
	mobileLogin(params, suc, fail) {
		this.nextRequest(HTTP_MOBILE_LOGIN, 'GET', params, suc, fail);
	}
}

export default new httpManager();