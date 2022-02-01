<template>
	<div class="app">
		<section class="section main">
			<div class="container is-fluid">
				<article class="media">
					<figure class="media-left">
						<p class="image is-64x64">
							<img :src="profileImage">
						</p>
					</figure>
					<div class="media-content">
						<div class="profile content">
							<p>
								<a :href="userUrl" target="_blank" rel="noopener noreferrer">
									<strong>{{userName}}</strong>
									<small>@{{userId}}</small>
								</a>
								<a :href="entryUrl" target="_blank" rel="noopener noreferrer">
									<small>{{getDateText(date)}}</small>
								</a>
								<br>
								<span :style="{whiteSpace: 'pre-line'}">{{description}}</span>
							</p>
						</div>
						<nav v-if="mode === 'twitter'" class="level is-mobile">
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

				<vue-justified-layout
					v-slot="{item, index}"
					:items="media"
					:options="{targetRowHeight: 600}"
					class="gallery"
				>
					<figure
						class="image"
						itemprop="associatedMedia"
						itemscope
						itemtype="http://schema.org/ImageObject"
					>
						<a
							:href="item.url"
							itemprop="contentUrl"
							@click.prevent="onClickImage(index, $event)"
						>
							<img :src="item.url" itemprop="thumbnail">
						</a>
					</figure>
				</vue-justified-layout>

				<input
					v-model="apikey"
					class="input"
					type="text"
					placeholder="API Key"
				>

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
		<footer class="float-menu">
			<p>
				<button type="button" class="button is-small" @click="onClickStockNijisearch">
					<span v-if="isStockCompleted" class="icon has-text-success">
						<i class="fas fa-check"/>
					</span>
					<span>Stock in Nijisearch</span>
				</button>
				<button
					v-if="mode === 'twitter'"
					type="button"
					class="button is-small"
					@click="onClickToggleMode('pixiv', 'public')"
				>
					Switch to pixiv (public) mode
				</button>
				<button
					v-if="mode === 'pixiv' && visibility === 'public'"
					type="button"
					class="button is-small"
					@click="onClickToggleMode('pixiv', 'private')"
				>
					Switch to pixiv (private) mode
				</button>
				<button
					v-if="mode === 'pixiv' && visibility === 'private'"
					type="button"
					class="button is-small"
					@click="onClickToggleMode('twitter', null)"
				>
					Switch to Twitter mode
				</button>
			</p>
			<p>
				<button type="button" class="button is-large is-fullwidth" @click="onClickReload">
					Reload
				</button>
			</p>
		</footer>
	</div>
</template>

<script>
import PhotoSwipe from 'photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js';
import {VueJustifiedLayout} from 'vue-justified-layout';

export default {
	name: 'App',
	components: {VueJustifiedLayout},
	data () {
		return {
			apikey: localStorage.getItem('HAKATASHI_API_KEY'),
			mode: 'twitter',
			visibility: null,
			media: [],
			entry: {
				user: {},
			},
			isStockCompleted: false,
		};
	},
	computed: {
		profileImage() {
			return this.entryObject.profileImage;
		},
		userId() {
			return this.entryObject.userId;
		},
		userName() {
			return this.entryObject.userName;
		},
		userUrl() {
			return this.entryObject.userUrl;
		},
		entryUrl() {
			return this.entryObject.entryUrl;
		},
		description() {
			return this.entryObject.description;
		},
		date() {
			return this.entryObject.date;
		},
		entryObject() {
			if (this.mode === 'twitter') {
				return {
					profileImage: this.entry.user.profile_image_url_https,
					userId: this.entry.user.screen_name,
					userName: this.entry.user.name,
					userUrl: `https://twitter.com/${this.entry.user.screen_name}`,
					entryUrl: `https://twitter.com/${this.entry.user.screen_name}/status/${this.entry.id_str}`,
					description: this.entry.text,
					date: this.entry.created_at,
				};
			} else if (this.mode === 'pixiv') {
				const [, , , , , , , year, month, date, hour, minute, second] = this.entry.url.split('/').map((c) => parseInt(c));
				return {
					profileImage: this.entry.profileImageUrl.replace(/pximg\.net/, 'pixiv.cat'),
					userId: this.entry.userId,
					userName: this.entry.userName,
					userUrl: `https://www.pixiv.net/users/${this.entry.userId}`,
					entryUrl: `https://www.pixiv.net/artworks/${this.entry.id}`,
					description: `${this.entry.title || ''} ${this.entry.tags.map((t) => `#${t}`).join(' ')}`,
					date: new Date(year, month - 1, date, hour, minute, second).toUTCString(),
				};
			}

			return {};
		},
	},
	watch: {
		apikey(newKey) {
			localStorage.setItem('HAKATASHI_API_KEY', newKey);
		},
	},
	mounted() {
		this.loadMedia(this.mode, this.visibility);
	},
	methods: {
		onClickImage(index, event) {
			const parentElement = event.target.closest('.gallery');
			const imageSizes = Array.from(parentElement.children).map((el) => {
				const imgEl = el.querySelector('img');
				return {width: imgEl.naturalWidth, height: imgEl.naturalHeight};
			});
			console.log(imageSizes);
			const gallery = new PhotoSwipe(
				this.$refs.pswp,
				PhotoSwipeUI_Default,
				this.media.map(({url}, i) => ({src: url, w: imageSizes[i].width, h: imageSizes[i].height})),
				{
					index,
					getThumbBoundsFn: (i) => {
						const imgEl = parentElement.children[i].querySelector('img');
						const rect = imgEl.getBoundingClientRect();
						const imageSize = imageSizes[i];
						const zoom = Math.max(rect.width / imageSize.width, rect.height / imageSize.height);
						return {
							x: rect.left + (rect.width - imageSize.width * zoom) / 2,
							y: rect.top + (rect.height - imageSize.height * zoom) / 2 + window.pageYOffset,
							w: imageSize.width * zoom,
						};
					},
				},
			);
			gallery.init();
		},
		onClickStockNijisearch () {
			const iframe = document.createElement('iframe');
			iframe.src = `https://nijisearch.kivantium.net/status/${this.entry.id_str}/`;
			iframe.classList.add('nanoframe');
			iframe.addEventListener('load', () => {
				document.body.removeChild(iframe);
				this.isStockCompleted = true;
			});
			document.body.appendChild(iframe);
		},
		onClickReload() {
			this.loadMedia(this.mode, this.visibility);
		},
		onClickToggleMode(mode, visibility) {
			this.loadMedia(mode, visibility);
		},
		async loadMedia(mode, visibility) {
			const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/${mode}?apikey=${this.apikey}&visibility=${visibility}`);
			const data = await res.json();

			this.media = data.media.map(({w, h, src}) => ({width: w, height: h, url: src}));
			this.entry = data.entry;
			this.isStockCompleted = false;
			this.mode = mode;
			this.visibility = visibility;
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

html, body, .app {
	width: 100%;
	height: 100%;
}

.app {
	display: flex;
	flex-direction: column;
}

.main {
	flex: 1 0 0;
	overflow-y: auto;
}

.float-menu {
	flex: 0 0 5rem;
	text-align: center;
}

.image img {
	object-fit: cover;
}

.media {
	margin-bottom: 2rem;
}

.profile a {
	color: inherit;
}

.nanoframe {
	width: 1px;
	height: 1px;
	position: absolute;
	visibility: hidden;
}
</style>
