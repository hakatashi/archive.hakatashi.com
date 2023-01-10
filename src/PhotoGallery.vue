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
	</div>
</template>

<script>
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
		};
	},
	watch: {
		apikey(newKey) {
			localStorage.setItem('HAKATASHI_API_KEY', newKey);
		},
	},
};
</script>

<style lang="scss">
.photo-gallery {
	width: 100%;
	height: 100%;

	display: flex;
	flex-direction: column;
}

.top-area {
	flex: 0 0 3rem;
}
</style>

