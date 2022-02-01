import Vue from 'vue';
import {VueJustifiedLayout} from 'vue-justified-layout';
import App from './App.vue';

Vue.use(VueJustifiedLayout);

new Vue({
	el: '#app',
	render: (h) => h(App),
});
