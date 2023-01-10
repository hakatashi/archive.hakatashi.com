<template>
	<div class="app-selector">
		<app-v-1 v-if="app === 'v1'"/>
		<div v-else>
			<h1 class="title">HakataArchiver</h1>
			<ul class="switcher">
				<li class="app-select" @click="app = 'v1'">V1⏳</li>
			</ul>
		</div>
	</div>
</template>

<script>
import AppV1 from './AppV1.vue';

export default {
	name: 'App',
	components: {AppV1},
	data() {
		return {
			app: null,
		};
	},
};
</script>

<style lang="scss">
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
	cursor: pointer;
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

	font-size: 5rem;
}
</style>
