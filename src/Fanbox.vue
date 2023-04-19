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
			<div id="fanbox-gallery" ref="content" class="content">
				<h1 class="post-title">
					<a :href="postUrl" target="_blank" rel="noopener noreferrer">
						{{title}}
					</a>
				</h1>
				<template v-for="block, blockIndex in blocks" :key="blockIndex">
					<p v-if="block.type === 'p'">
						{{block.text}}
					</p>
					<a
						v-else-if="block.type === 'image'"
						:key="key"
						:href="imagesMap[block.imageId]?.src"
						:data-pswp-width="imagesMap[block.imageId]?.w"
						:data-pswp-height="imagesMap[block.imageId]?.h"
						class="photoswipe-item"
						target="_blank"
						rel="noopener noreferrer"
					>
						<img
							:src="imagesMap[block.imageId]?.src"
						>
					</a>
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
	</div>
</template>

<script>
import PhotoSwipe from 'photoswipe';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

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
			lightbox: null,
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

			this.lightbox?.destroy();

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

			this.lightbox = new PhotoSwipeLightbox({
				gallery: '#fanbox-gallery',
				children: 'a.photoswipe-item',
				pswpModule: PhotoSwipe,
				bgOpacity: 1,
				wheelToZoom: true,
				initialZoomLevel: ({elementSize, panAreaSize}) => (
					Math.min(panAreaSize.x / elementSize.x, panAreaSize.y / elementSize.y)
				),
				secondaryZoomLevel: 1,
				maxZoomLevel: 10,
			});
			this.lightbox.init();

			this.isLoading = false;
		},
		updateDimensions() {
			this.windowWidth = document.body.clientWidth;
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
}

.float-menu {
	flex: 0 0 4rem;
	text-align: center;
	width: 100%;
}
</style>

