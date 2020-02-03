<template>
	<section class="section">
		<div class="container is-fluid">
			<h1>{{entry.text}}</h1>
			<div class="columns is-mobile is-multiline" itemscope itemtype="http://schema.org/ImageGallery">
				<div
					v-for="medium in media"
					:key="medium.src"
					class="column is-half-mobile is-one-quarter-fullhd"
				>
					<figure
						class="image is-3by4"
						itemprop="associatedMedia"
						itemscope
						itemtype="http://schema.org/ImageObject"
					>
						<a :href="medium.src" itemprop="contentUrl" data-size="600x400">
							<img :src="medium.src" itemprop="thumbnail">
						</a>
					</figure>
				</div>
			</div>

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
	</section>
</template>

<script>
import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';

export default {
	name: 'App',
	data () {
		return {
			msg: 'Welcome to Your Vue.js App!!',
			apikey: localStorage.getItem('HAKATASHI_API_KEY'),
			media: [],
			entry: {},
		};
	},
	async mounted() {
		const pswpElement = this.$refs.pswp;
		const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/twitter?apikey=${this.apikey}`);
		const data = await res.json();

		this.media = data.media;
		this.entry = data.entry;

		const options = {
			index: 0,
		};

		// Initializes and opens PhotoSwipe
		const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, data.media, options);
		gallery.init();
	},
};
</script>

<style lang="scss">
@import "../node_modules/photoswipe/dist/photoswipe.css";
@import "../node_modules/photoswipe/dist/default-skin/default-skin.css";

.image img {
	object-fit: cover;
}
</style>
