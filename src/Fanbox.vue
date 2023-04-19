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
			<div class="content">
				<h1 class="post-title">{{title}}</h1>
				<template v-for="block in blocks">
					<p v-if="block.type === 'p'">
						{{block.text}}
					</p>
					<img v-else-if="block.type === 'image'" :src="imagesMap[block.imageId]?.src"/>
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
export default {
	name: 'Fanbox',
	data() {
		return {
			apikey: localStorage.getItem('HAKATASHI_API_KEY'),
			windowWidth: document.body.clientWidth,
			images: [],
			imagesMap: {},
			files: [],
			title: '',
			blocks: [],
			isLoading: false,
		};
	},
	computed: {
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
			console.log('mounted');


			this.isLoading = true;

			const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/fanbox?apikey=${this.apikey}`);
			const data = await res.json();

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
				for (const image of data.post?.body?.images) {
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
		onClickReload() {
			this.loadMedia();
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

