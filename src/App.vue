<template>
	<div id="app">
		<img src="./assets/logo.png">
		<h1>{{msg}}</h1>
		<h2>Essential Links</h2>
		<ul>
			<li><a href="https://vuejs.org" target="_blank">Core Docs</a></li>
			<li><a href="https://forum.vuejs.org" target="_blank">Forum</a></li>
			<li><a href="https://chat.vuejs.org" target="_blank">Community Chat</a></li>
			<li><a href="https://twitter.com/vuejs" target="_blank">Twitter</a></li>
		</ul>
		<h2>Ecosystem</h2>
		<ul>
			<li><a href="http://router.vuejs.org/" target="_blank">vue-router</a></li>
			<li><a href="http://vuex.vuejs.org/" target="_blank">vuex</a></li>
			<li><a href="http://vue-loader.vuejs.org/" target="_blank">vue-loader</a></li>
			<li><a href="https://github.com/vuejs/awesome-vue" target="_blank">awesome-vue</a></li>
		</ul>

		<div
			ref="pswp"
			class="pswp"
			tabindex="-1"
			role="dialog"
			aria-hidden="true"
		>
			<div class="pswp__bg"/>
			<div class="pswp__scroll-wrap">
				<div class="pswp__container">
					<div class="pswp__item"/>
					<div class="pswp__item"/>
					<div class="pswp__item"/>
				</div>

				<div class="pswp__ui pswp__ui--hidden">
					<div class="pswp__top-bar">
						<div class="pswp__counter"/>
						<button class="pswp__button pswp__button--close" title="Close (Esc)"/>
						<button class="pswp__button pswp__button--fs" title="Toggle fullscreen"/>
						<button class="pswp__button pswp__button--zoom" title="Zoom in/out"/>
						<div class="pswp__preloader">
							<div class="pswp__preloader__icn">
								<div class="pswp__preloader__cut">
									<div class="pswp__preloader__donut"/>
								</div>
							</div>
						</div>
					</div>
					<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"/>
					<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"/>
					<div class="pswp__caption">
						<div class="pswp__caption__center"/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';

export default {
	name: 'App',
	data () {
		return {
			msg: 'Welcome to Your Vue.js App!!',
		};
	},
	mounted() {
		const pswpElement = this.$refs.pswp;

		// build items array
		const items = [
			{
				src: 'https://placekitten.com/600/400',
				w: 600,
				h: 400,
			},
			{
				src: 'https://placekitten.com/1200/900',
				w: 1200,
				h: 900,
			},
		];

		// define options (if needed)
		const options = {
			// optionName: 'option value'
			// for example:
			index: 0, // start at first slide
		};

		// Initializes and opens PhotoSwipe
		const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
		gallery.init();
	},
};
</script>

<style lang="scss">
@import "../node_modules/photoswipe/dist/photoswipe.css";
@import "../node_modules/photoswipe/dist/default-skin/default-skin.css";

#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

h1, h2 {
	font-weight: normal;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}
</style>
