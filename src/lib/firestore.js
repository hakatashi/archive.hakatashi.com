import {initializeApp} from 'firebase/app';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: 'AIzaSyBNJrQwNsboWOT8vcp4nwjoE9UkzUnxe8A',
	authDomain: 'hakataarrchive.firebaseapp.com',
	projectId: 'hakataarrchive',
	storageBucket: 'hakataarrchive.appspot.com',
	messagingSenderId: '371371811494',
	appId: '1:371371811494:web:8e72827150b690d4fd4a67',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);