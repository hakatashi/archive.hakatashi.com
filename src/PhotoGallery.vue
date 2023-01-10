<template>
	<div class="photo-gallery">
		<div class="top-area">
			<input
				v-model="apikey"
				class="input"
				type="text"
				placeholder="API Key"
			>
		</div>
		<div class="photo-area">
			<div class="photo-container">
				<div v-for="row, index in photoLayout" :key="index" class="photo-row">
					<div v-for="photo in row" :key="photo.src" class="photo">
						<img :src="photo.src" :style="{width: `${photo.renderWidth}px`, height: `${photo.renderHeight}px`}">
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import calculateLayout from './lib/calculateLayout.js';

export default {
	name: 'PhotoGallery',
	props: {
		mode: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			apikey: localStorage.getItem('HAKATASHI_API_KEY'),
			photos: [],
			photoLayout: [],
			windowWidth: document.body.clientWidth,
		};
	},
	watch: {
		apikey(newKey) {
			localStorage.setItem('HAKATASHI_API_KEY', newKey);
		},
		windowWidth(newWidth) {
			this.updateLayout(newWidth);
		},
	},
	mounted() {
		window.addEventListener('resize', this.updateDimensions);

		this.loadMedia(this.mode, 'private').then(() => {
			this.updateLayout(this.windowWidth);
		});
	},
	unmounted() {
		window.removeEventListener('resize', this.updateDimensions);
	},
	methods: {
		async loadMedia(mode, visibility) {
			const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/${mode}?apikey=${this.apikey}&visibility=${visibility}&count=3`);
			const data = await res.json();

			this.photos = data.media.map(({w, h, src}) => ({width: w, height: h, src}));
			this.photos.sort((a, b) => a.src.localeCompare(b.src));
		},
		updateLayout(targetWidth) {
			this.photoLayout = calculateLayout({
				photos: this.photos,
				margin: 10,
				targetWidth,
				targetRowHeight: 480,
				portraitRatioLimit: 3,
				landscapeRatioLimit: 2,
			});
			console.log(this.photoLayout);
		},
		updateDimensions() {
			this.windowWidth = document.body.clientWidth;
		},
	},
};
</script>

<style lang="scss">
.photo-gallery {
	width: 100%;

	display: flex;
	flex-direction: column;
}

.top-area {
	flex: 0 0 3rem;
}

.photo-area {
	flex: 0 0 auto;

	.photo-row {
		display: flex;
		margin-bottom: 10px;

		img {
			width: 20rem;
			height: 20rem;
			object-fit: cover;
			vertical-align: bottom;
		}

		.photo {
			&:not(:first-child) {
				margin-left: 10px;
			}
		}
	}
}
</style>

