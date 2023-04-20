<template>
	<div class="fanbox">
		<div class="top-area">
			<input
				v-model="apikey"
				class="input"
				type="text"
				placeholder="API Key"
			>
		</div>
		<div class="main-area">
			<div ref="content" class="content">
				<h1 class="post-title">
					<a :href="postUrl" target="_blank" rel="noopener noreferrer">
						{{title}}
					</a>
				</h1>
				<template v-for="block, blockIndex in blocks" :key="blockIndex">
					<p v-if="block.type === 'p'">
						{{block.text}}
					</p>
					<img
						v-else-if="block.type === 'image'"
						:src="imagesMap[block.imageId]?.src"
						:data-block-index="blockIndex"
						@click.prevent="onClickImage(blockIndex, $event)"
					>
					<div v-else>
						{{block}}
					</div>
				</template>
			</div>
		</div>
		<footer class="float-menu">
			<p>
				<button type="button" class="button is-large is-fullwidth" @click="onClickReload">
					Reload
				</button>
			</p>
		</footer>

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
	name: 'Fanbox',
	data() {
		return {
			apikey: localStorage.getItem('HAKATASHI_API_KEY'),
			windowWidth: document.body.clientWidth,
			id: '',
			creatorId: '',
			images: [],
			imagesMap: {},
			files: [],
			title: '',
			blocks: [],
			isLoading: false,
		};
	},
	computed: {
		postUrl() {
			return `https://${this.creatorId}.fanbox.cc/posts/${this.id}`;
		},
	},
	watch: {
		apikey(newKey) {
			localStorage.setItem('HAKATASHI_API_KEY', newKey);
		},
	},
	mounted() {
		window.addEventListener('resize', this.updateDimensions);
		this.loadMedia();
	},
	unmounted() {
		window.removeEventListener('resize', this.updateDimensions);
	},
	methods: {
		async loadMedia() {
			if (this.isLoading) {
				return;
			}
			this.isLoading = true;

			const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/fanbox?apikey=${this.apikey}`);
			const data = await res.json();

			this.id = data.post?.id ?? '';
			this.creatorId = data.post?.creatorId ?? '';
			this.images = data.images ?? [];
			this.imagesMap = Object.assign({}, ...this.images.map((image) => ({[image.id]: image})));
			this.files = data.files ?? [];
			this.filesMap = Object.assign({}, ...this.files.map((file) => ({[file.id]: file})));
			this.blocks = data.post?.body?.blocks ?? [];
			this.title = data.post?.title;

			if (data.post?.body?.text) {
				this.blocks.push({
					type: 'p',
					text: data.post?.body?.text,
				});
			}

			if (data.post?.body?.images) {
				for (const image of data.post.body.images) {
					this.blocks.push({
						type: 'image',
						imageId: image.id,
					});
				}
			}

			this.isLoading = false;
		},
		updateDimensions() {
			this.windowWidth = document.body.clientWidth;
		},
		onClickImage(blockIndex) {
			const imageBlocks = this.blocks
				.map((block, index) => ({
					...block,
					index,
				}))
				.filter((block) => block.type === 'image');
			const images = imageBlocks.map((block) => {
				const imageData = this.imagesMap[block.imageId];
				return {
					w: imageData?.w ?? 0,
					h: imageData?.h ?? 0,
					src: imageData?.src ?? '',
				};
			});
			const index = imageBlocks.findIndex((block) => block.index === blockIndex);
			const gallery = new PhotoSwipe(
				this.$refs.pswp,
				PhotoSwipeUI_Default,
				images,
				{
					index,
					getThumbBoundsFn: (i) => {
						const clickedBlockIndex = imageBlocks[i].index;
						const imgEl = this.$refs.content.querySelector(`img[data-block-index="${clickedBlockIndex}"]`);
						const rect = imgEl.getBoundingClientRect();
						const imageSize = images[i];
						const zoom = Math.max(rect.width / imageSize.w, rect.height / imageSize.h);
						return {
							x: rect.left + (rect.width - imageSize.w * zoom) / 2,
							y: rect.top + (rect.height - imageSize.h * zoom) / 2 + window.pageYOffset,
							w: imageSize.w * zoom,
						};
					},
				},
			);
			gallery.init();
		},
		onClickReload() {
			this.loadMedia();
			this.$refs.content.scrollTop = 0;
		},
	},
};
</script>

<style lang="scss">
.fanbox {
	width: 100%;
	height: 100%;

	display: flex;
	flex-direction: column;
	align-items: center;
}

.top-area {
	width: 100%;
	flex: 0 0 3rem;
}

.main-area {
	flex: 1 1 0;
	width: 100%;
	overflow-y: auto;
}

.content {
	max-width: 60rem;
	margin: 0 auto;

	img {
		cursor: pointer;
	}
}

.float-menu {
	flex: 0 0 4rem;
	text-align: center;
	width: 100%;
}
</style>

