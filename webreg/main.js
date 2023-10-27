import Vue from 'vue'
import store from './store'
import App from './App'
import httpManager from '@/common/httpManager.js'
Vue.prototype.$httpManager = httpManager
import uView from 'uview-ui';
Vue.use(uView);

const msg = (title, duration = 1500, mask = false, icon = 'none') => {
	//统一提示方便全局修改
	if (!!title) {
		uni.showToast({
			title,
			duration,
			mask,
			icon
		});
	} else {
		uni.hideToast();
	}
}

const prePage = () => {
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}

/**************************************时间格式化处理************************************/
const dateFtt = (fmt, dateStr) => { //author: meizz   
	let date = new Date(dateStr);
	var o = {
		"M+": date.getMonth() + 1, //月份   
		"d+": date.getDate(), //日   
		"h+": date.getHours(), //小时   
		"m+": date.getMinutes(), //分   
		"s+": date.getSeconds(), //秒   
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度   
		"S": date.getMilliseconds() //毫秒   
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k])
				.length)));
	return fmt;
}

const getQueryString = (url, name) => {
	let reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
	if (reg.test(url)) {
		let res = unescape(RegExp.$2.replace(/\+/g, " "));
		return res.replace('#', '').replace('/', '');
	}
}

// #ifdef H5
const is_weixin = () => {
	let ua = navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == "micromessenger") {
		return true;
	} else {
		return false;
	}
}
// #endif
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {
	msg,
	prePage,
	dateFtt,
	getQueryString,
	// #ifdef H5
	is_weixin,
	// #endif
};

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
