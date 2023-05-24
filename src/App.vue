<template>
	<div class="app-selector">
		<app-v-1 v-if="app === 'v1'"/>
		<photo-gallery v-else-if="app === 'pixiv-public'" mode="pixiv" visibility="public"/>
		<photo-gallery v-else-if="app === 'pixiv-private'" mode="pixiv" visibility="private"/>
		<fanbox v-else-if="app === 'fanbox'"/>
		<photo-gallery v-else-if="app === 'tag'" mode="tag"/>
		<div v-else>
			<h1 class="title">HakataArchiver</h1>
			<ul class="switcher">
				<li class="app-select" @click="app = 'v1'">V1⏳</li>
				<li class="app-select" @click="app = 'pixiv-public'">pixiv public🅿️</li>
				<li class="app-select" @click="app = 'pixiv-private'">pixiv private🅿️</li>
				<li class="app-select" @click="app = 'fanbox'">pixiv fanbox🗃️</li>
				<li class="app-select" @click="app = 'tag'">tag cloud☁️</li>
			</ul>
		</div>
	</div>
</template>

<script>
import AppV1 from './AppV1.vue';
import Fanbox from './Fanbox.vue';
import PhotoGallery from './PhotoGallery.vue';
import 'photoswipe/style.css';

export default {
	name: 'App',
	components: {AppV1, PhotoGallery, Fanbox},
	data() {
		return {
			app: null,
		};
	},
};
</script>

<style lang="scss">
@import "../node_modules/bulma/css/bulma.css";

html, body, #app, .app-selector {
	width: 100%;
	height: 100%;
}

.title {
	font-size: 10vmin;
	font-weight: bold;
	text-align: center;
}

.switcher {
	width: 100%;
	max-width: 1080px;
	margin: 0 auto;

	display: flex;
	flex-wrap: wrap;
	flex-direction: row;
	justify-content: center;
}

.app-select {
	width: 20rem;
	height: 20rem;
	margin: 1rem;

	border: 1px solid darkgrey;
	border-radius: 6px;

	display: flex;
	align-items: center;
	justify-content: center;

	font-size: 3rem;

	cursor: pointer;
}
</style>
