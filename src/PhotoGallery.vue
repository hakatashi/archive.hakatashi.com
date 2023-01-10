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
						<img
							:src="photo.src"
							:style="{
								width: `${photo.renderWidth}px`,
								height: `${photo.renderHeight}px`,
							}"
							@click="selectedPhoto = photo"
						>
					</div>
				</div>
				<infinite-loading v-if="!isLoading" @infinite="onInfinite"/>
			</div>
		</div>
		<div v-if="selectedPhoto !== null" class="photo-modal" @click="selectedPhoto = null">
			<div class="modal-mask">
				<div class="modal-wrapper">
					<img class="modal-image" :src="selectedPhoto.src">
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import calculateLayout from './lib/calculateLayout.js';

export default {
	name: 'PhotoGallery',
	components: {InfiniteLoading},
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
			isLoading: false,
			selectedPhoto: null,
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

		this.loadMedia(this.mode, 'private');
	},
	unmounted() {
		window.removeEventListener('resize', this.updateDimensions);
	},
	methods: {
		async loadMedia(mode, visibility) {
			if (this.isLoading) {
				return;
			}

			this.isLoading = true;

			const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/${mode}?apikey=${this.apikey}&visibility=${visibility}&count=3`);
			const data = await res.json();

			const newPhotos = data.media.map(({w, h, src}) => ({width: w, height: h, src}));
			newPhotos.sort((a, b) => a.src.localeCompare(b.src));
			this.photos.push(...newPhotos);
			this.updateLayout(this.windowWidth);

			await new Promise((resolve) => setTimeout(resolve, 2000));

			this.isLoading = false;
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
		},
		updateDimensions() {
			this.windowWidth = document.body.clientWidth;
		},
		async onInfinite($state) {
			if (this.isLoading) {
				return;
			}
			console.log('onInfinite');
			await this.loadMedia(this.mode, 'private');
			$state.loaded();
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
			cursor: pointer;
		}

		.photo {
			&:not(:first-child) {
				margin-left: 10px;
			}
		}
	}
}

.photo-modal {
	cursor: pointer;
}

.modal-mask {
	position: fixed;
	z-index: 9998;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: black;
	display: table;
	transition: opacity 0.3s ease;
}

.modal-wrapper {
	display: table-cell;
	vertical-align: middle;
}

.modal-image {
	width: 100vw;
	height: 100vh;
	object-fit: contain;
}
</style>

