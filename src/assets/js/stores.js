// https://dev.to/danawoodman/svelte-quick-tip-connect-a-store-to-local-storage-4idi

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// ----

export const socket = writable((browser && localStorage.getItem('socket')) || null);
socket.subscribe((val) => {
	if (browser) return (localStorage.socket = val);
});

export const io_instances = writable((browser && localStorage.getItem('io_instances')) || null);
socket.subscribe((val) => {
	if (browser) return (localStorage.io_instances = val);
});

export const page_code = writable((browser && localStorage.getItem('page_code')) || null);
page_code.subscribe((val) => {
	if (browser) return (localStorage.page_code = val);
});

export const sesh = writable((browser && localStorage.getItem('sesh')) || null);
sesh.subscribe((val) => {
	if (browser) return (localStorage.sesh = val);
});

export const user = writable((browser && localStorage.getItem('user')) || null);
user.subscribe((val) => {
	if (browser) return (localStorage.user = val);
});

export const theme = writable((browser && localStorage.getItem('theme')) || `default`);
theme.subscribe((val) => {
	if (browser) return (localStorage.theme = val);
});

export const is_google_processing = writable((browser && localStorage.getItem('is_google_processing')) || false);
is_google_processing.subscribe((val) => {
	if (browser) return (localStorage.is_google_processing = val);
});

export const cache = writable((browser && localStorage.getItem('cache')) || null);
cache.subscribe((val) => {
	if (browser) return (localStorage.cache = val);
}); // {[code]:{data{...}, timestamp}}

// ----

// https://stackoverflow.com/a/60921566/8919391

// export let user;
// const user$ = writable(user);
// user$.set(user);
