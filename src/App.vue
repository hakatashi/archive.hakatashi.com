<template>
	<section class="section">
		<div class="container is-fluid">
			<article class="media">
				<figure class="media-left">
					<p class="image is-64x64">
						<img :src="entry.user.profile_image_url_https">
					</p>
				</figure>
				<div class="media-content">
					<div class="profile content">
						<p>
							<a :href="`https://twitter.com/${entry.user.screen_name}`" target="_blank" rel="noopener">
								<strong>{{entry.user.name}}</strong>
								<small>@{{entry.user.screen_name}}</small>
							</a>
							<a :href="`https://twitter.com/${entry.user.screen_name}/status/${entry.id_str}`" target="_blank" rel="noopener">
								<small>{{getDateText(entry.created_at)}}</small>
							</a>
							<br>
							<span :style="{whiteSpace: 'pre-line'}">{{entry.text}}</span>
						</p>
					</div>
					<nav class="level is-mobile">
						<div class="level-left">
							<a class="level-item">
								<span class="icon is-small"><i class="fas fa-retweet"/></span> {{entry.retweet_count}}
							</a>
							<a class="level-item">
								<span class="icon is-small"><i class="fas fa-heart"/></span> {{entry.favorite_count}}
							</a>
						</div>
					</nav>
				</div>
			</article>

			<div
				class="photoswipe-gallery columns is-mobile is-multiline"
				itemscope
				itemtype="http://schema.org/ImageGallery"
			>
				<div
					v-for="(medium, index) in media"
					:key="medium.src"
					class="column is-half-mobile is-one-quarter-fullhd"
				>
					<figure
						class="image is-3by4"
						itemprop="associatedMedia"
						itemscope
						itemtype="http://schema.org/ImageObject"
					>
						<a
							:href="medium.src"
							itemprop="contentUrl"
							@click.prevent="onClickImage(index, $event)"
						>
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
			entry: {
				user: {},
			},
		};
	},
	async mounted() {
		const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/twitter?apikey=${this.apikey}`);
		const data = await res.json();

		this.media = data.media;
		this.entry = data.entry;
	},
	methods: {
		onClickImage(index, event) {
			const parentElement = event.target.closest('.photoswipe-gallery');
			const gallery = new PhotoSwipe(this.$refs.pswp, PhotoSwipeUI_Default, this.media, {
				index,
				getThumbBoundsFn: (i) => {
					const rect = parentElement.children[i].querySelector('img').getBoundingClientRect();
					return {
						x: rect.left,
						y: rect.top + window.pageYOffset,
						w: rect.width,
					};
				},
			});
			gallery.init();
		},
		getDateText(input) {
			const date = new Date(input);
			const year = date.getFullYear().toString().padStart(4, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			const hour = date.getHours().toString().padStart(2, '0');
			const minute = date.getMinutes().toString().padStart(2, '0');
			const second = date.getSeconds().toString().padStart(2, '0');
			return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
		},
	},
};
</script>

<style lang="scss">
@import "../node_modules/photoswipe/dist/photoswipe.css";
@import "../node_modules/photoswipe/dist/default-skin/default-skin.css";

.image img {
	object-fit: cover;
}

.media {
	margin-bottom: 2rem;
}

.profile a {
	color: inherit;
}
</style>
