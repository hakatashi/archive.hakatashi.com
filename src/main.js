import Vue from 'vue';
import App from './App.vue';
import {VueJustifiedLayout} from 'vue-justified-layout';

Vue.use(VueJustifiedLayout);

new Vue({
	el: '#app',
	render: (h) => h(App),
});
