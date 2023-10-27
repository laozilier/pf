import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		inviteCode: {
			uid: 0
		}
	},
	mutations: {
		login(state, provider) {},
	},

	actions: {

	}
})

export default store