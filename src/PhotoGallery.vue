<template>
	<div class="photo-gallery">
		<div class="top-area">
			<div class="top-area-row">
				<input
					v-model="apikey"
					class="input"
					type="text"
					placeholder="API Key"
				>
			</div>
			<div v-if="mode === 'tag'" class="top-area-row">
				<form @submit.prevent="setTag($event.target[0].value)">
					<input
						list="tag"
						class="input"
						type="text"
						placeholder="Tag"
					>
					<datalist id="tag">
						<option
							v-for="tagInfo in tags"
							:key="tagInfo.name"
							:value="tagInfo.name"
							:label="`${tagInfo.name} (${tagInfo.count})`"
						/>
					</datalist>
				</form>
				<input
					v-model="threshold"
					class="input"
					type="number"
					step="0.01"
					min="0.05"
					max="1.00"
					defaultValue="0.05"
					placeholder="Threshold"
				>
				<div>Media stocks: {{entryStocks.length}}</div>
			</div>
		</div>
		<div class="photo-area">
			<div v-if="mode !== 'tag' || tag !== null" class="photo-container">
				<div v-for="row, index in photoLayout" :key="index" class="photo-row">
					<div v-for="photo in row" :key="photo.src" class="photo">
						<img
							:src="photo.src"
							:style="{
								width: `${photo.renderWidth}px`,
								height: `${photo.renderHeight}px`,
							}"
							@click="() => selectedPhotoIndex = photo.index"
						>
					</div>
				</div>
				<div v-if="noResults" class="notification is-warning">No more results</div>
				<infinite-loading v-if="!isLoading" @infinite="onInfinite"/>
			</div>
		</div>
		<div
			v-if="selectedPhotoIndex !== null"
			v-touch:swipe.left="onSwipeLeft"
			v-touch:swipe.right="onSwipeRight"
			class="photo-modal"
		>
			<div class="modal-mask">
				<div class="modal-wrapper">
					<img
						class="modal-image"
						:src="selectedPhoto.src"
						@click="selectedPhotoIndex = null"
					>
					<article class="media">
						<figure class="media-left">
							<p class="image is-64x64">
								<img :src="selectedEntry.profileImage">
							</p>
						</figure>
						<div class="media-content">
							<div class="profile content">
								<p>
									<a
										class="media-username"
										:href="selectedEntry.userUrl"
										target="_blank"
										rel="noopener noreferrer"
									>
										<strong>{{selectedEntry.userName}}</strong>
										<small>@{{selectedEntry.userId}}</small>
									</a>
									<a
										class="media-date"
										:href="selectedEntry.entryUrl"
										target="_blank"
										rel="noopener noreferrer"
									>
										<small>{{getDateText(selectedEntry.date)}}</small>
									</a>
									<br>
									<span :style="{whiteSpace: 'pre-line'}">{{selectedEntry.description}}</span>
								</p>
							</div>
							<nav v-if="mode === 'twitter'" class="level is-mobile">
								<div class="level-left">
									<a class="level-item">
										<span class="icon is-small"><i class="fas fa-retweet"/></span> {{selectedEntry.retweet_count}}
									</a>
									<a class="level-item">
										<span class="icon is-small"><i class="fas fa-heart"/></span> {{selectedEntry.favorite_count}}
									</a>
								</div>
							</nav>
						</div>
					</article>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {collection, query, orderBy, startAfter, limit, getDocs, where} from 'firebase/firestore';
import last from 'lodash/last';
import shuffle from 'lodash/shuffle';
import InfiniteLoading from 'vue-infinite-loading';
import calculateLayout from './lib/calculateLayout.js';
import {db} from './lib/firestore.js';

const getIdAndPage = (urlStr) => {
	const url = new URL(urlStr);
	const filename = url.pathname.split('/')[2] || '';
	const [basename = ''] = filename.split('.');
	const [id = '', page = ''] = basename.split('_p');
	return [parseInt(id) || 0, parseInt(page) || 0];
};

const sortPhotos = (photos) => {
	photos.sort(({src: a}, {src: b}) => {
		const [idA, pageA] = getIdAndPage(a);
		const [idB, pageB] = getIdAndPage(b);
		if (idA !== idB) {
			return idA - idB;
		}
		return pageA - pageB;
	});
};

const getEntryObject = (entry, mode) => {
	if (mode === 'twitter') {
		return {
			id: '',
			profileImage: entry.user.profile_image_url_https,
			userId: entry.user.screen_name,
			userName: entry.user.name,
			userUrl: `https://twitter.com/${entry.user.screen_name}`,
			entryUrl: `https://twitter.com/${entry.user.screen_name}/status/${entry.id_str}`,
			description: entry.text,
			date: entry.created_at,
		};
	} else if (mode === 'pixiv') {
		const [, , , , , , , year, month, date, hour, minute, second] = entry.url.split('/').map((c) => parseInt(c));
		return {
			id: parseInt(entry.id),
			profileImage: entry.profileImageUrl.replace(/pximg\.net/, 'pixiv.cat'),
			userId: entry.userId,
			userName: entry.userName,
			userUrl: `https://www.pixiv.net/users/${entry.userId}`,
			entryUrl: `https://www.pixiv.net/artworks/${entry.id}`,
			description: `${entry.title || ''} ${entry.tags.map((t) => `#${t}`).join(' ')}`,
			date: new Date(year, month - 1, date, hour, minute, second).toUTCString(),
		};
	}

	return {};
};

export default {
	name: 'PhotoGallery',
	components: {InfiniteLoading},
	props: {
		mode: {
			type: String,
			required: true,
		},
		visibility: {
			type: String,
			default: 'public',
		},
	},
	data() {
		return {
			apikey: localStorage.getItem('HAKATASHI_API_KEY'),
			photos: [],
			photoLayout: [],
			entries: [],
			entryStocks: [],
			windowWidth: document.body.clientWidth,
			isLoading: false,
			selectedPhotoIndex: null,
			tag: null,
			tags: [],
			cursor: 1,
			threshold: 0.05,
			noResults: false,
		};
	},
	computed: {
		selectedPhoto() {
			if (this.selectedPhotoIndex === null) {
				return {};
			}
			return this.photos[this.selectedPhotoIndex];
		},
		selectedEntry() {
			if (this.selectedPhotoIndex === null) {
				return {};
			}
			const [id] = getIdAndPage(this.selectedPhoto.src);
			const selectedEntry = this.entries.find((entry) => parseInt(entry.id) === id);
			return selectedEntry || {};
		},
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

		if (this.mode === 'tag') {
			this.loadTags();
		} else {
			this.loadMedia(this.mode, this.visibility);
		}
	},
	unmounted() {
		window.removeEventListener('resize', this.updateDimensions);
	},
	methods: {
		async fetchMedia(mode, visibility) {
			if (mode === 'tag') {
				if (this.entryStocks.length < 25) {
					const tagQuery = query(
						collection(db, 'media'),
						where(`danbooru_tags.${this.tag}`, '>=', this.threshold),
						orderBy(`danbooru_tags.${this.tag}`, 'desc'),
						startAfter(this.cursor),
						limit(1000),
					);
					const tagDocs = await getDocs(tagQuery);
					if (tagDocs.docs.length === 0) {
						this.noResults = true;
						return {media: [], entries: []};
					}
					this.cursor = last(tagDocs.docs).data().danbooru_tags[this.tag];
					this.entryStocks.push(...shuffle(tagDocs.docs));
				}

				const newEntries = this.entryStocks.splice(0, 25);

				const params = new URLSearchParams([['apikey', this.apikey]]);
				for (const entry of newEntries) {
					const keyLength = Object.keys(entry.data().danbooru_tags).length;
					if (keyLength > 500) {
						continue;
					}
					params.append('image', entry.id.replaceAll('+', '/'));
				}

				const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/getImages?${params}`);
				const data = await res.json();
				return {media: data.images, entries: []};
			}

			const res = await fetch(`https://co791uc66h.execute-api.ap-northeast-1.amazonaws.com/production/random/${mode}?apikey=${this.apikey}&visibility=${visibility}&count=3`);
			const data = await res.json();
			return data;
		},
		async loadMedia(mode, visibility) {
			if (this.isLoading) {
				return;
			}

			this.isLoading = true;

			const data = await this.fetchMedia(mode, visibility);

			const newPhotos = data.media.map(({w, h, src}) => ({width: w, height: h, src}));
			sortPhotos(newPhotos);

			let index = this.photos.length;
			for (const photo of newPhotos) {
				photo.index = index;
				index++;
			}

			this.photos.push(...newPhotos);
			this.entries.push(...data.entries.map((entry) => getEntryObject(entry, this.mode)));

			this.updateLayout(this.windowWidth);

			await new Promise((resolve) => {
				setTimeout(resolve, 2000);
			});

			this.isLoading = false;
		},
		async loadTags() {
			const tagQuery = query(
				collection(db, 'danbooru_tag_stats'),
				orderBy('count', 'desc'),
				limit(1000),
			);
			const tagDocs = await getDocs(tagQuery);
			this.tags = tagDocs.docs.map((doc) => ({...doc.data(), name: doc.id}));
		},
		setTag(tag) {
			this.tag = tag;
			this.photos = [];
			this.entries = [];
			this.entryStocks = [];
			this.noResults = false;
			this.cursor = 1;
			this.updateLayout(this.windowWidth);
			this.loadMedia(this.mode, this.visibility);
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
		onSwipeRight() {
			if (this.selectedPhotoIndex !== null) {
				this.selectedPhotoIndex = Math.max(0, this.selectedPhotoIndex - 1);
			}
		},
		onSwipeLeft() {
			if (this.selectedPhotoIndex !== null) {
				this.selectedPhotoIndex = Math.min(this.photos.length - 1, this.selectedPhotoIndex + 1);
			}
		},
		async onInfinite($state) {
			if (this.isLoading) {
				return;
			}
			await this.loadMedia(this.mode, this.visibility);
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

	&-row {
		display: flex;

		& > * {
			flex: 1 1 0;
		}
	}
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
			background-color: #DDD;
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
	background: white;
	display: table;
	transition: opacity 0.3s ease;
}

.modal-wrapper {
	width: 100vw;
	height: 100vh;
	overflow-y: scroll;
}

.modal-image {
	width: 100%;
	height: 100vh;
	background-color: black;
	object-fit: contain;
}

.media-date {
	margin-left: 0.3em;
}
</style>

