import { socket, io_instances, theme, user, sesh, page_code } from './stores.js';
import * as utils from './utils';

import { browser } from '$app/environment';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const API_KEY = import.meta.env.VITE_API_KEY;

export async function checkSesh() {
	let sesh = await getSesh();
	if (!utils.isEmptyObj(await getCurrentUser())) {
		if (sesh === `null` || Date.now() + 60 >= Number(sesh)) {
			await setSesh(Date.now() + 60);
			await setCurrentUser(
				(
					await restPost({
						// socket: await getSocket(),
						url: `get`,
						payload: {
							type: `user`,
							id: (await getCurrentUser()).id
						},
						all: true
					})
				).data,
				false
			);
		}
	}
}

export async function getSocket() {
	return new Promise((resolve, reject) => {
		socket.subscribe((socket) => {
			if (browser) resolve(socket);
		});
	});
}

export async function setSocket(val) {
	socket.set(val);
}

export async function getIoInstances() {
	return new Promise((resolve, reject) => {
		io_instances.subscribe((io_instances) => {
			if (browser) resolve(JSON.parse(io_instances));
		});
	});
}

export async function setIoInstances(val) {
	io_instances.set(JSON.stringify(val));
}

export async function getSesh() {
	return new Promise((resolve, reject) => {
		sesh.subscribe((sesh) => {
			if (browser) resolve(sesh);
		});
	});
}

export async function setSesh(val) {
	sesh.set(val);
}

export async function getPageCode() {
	return new Promise((resolve, reject) => {
		page_code.subscribe((page_code) => {
			if (browser) resolve(page_code);
		});
	});
}

export async function setPageCode(val) {
	page_code.set(val);
}

export async function getCurrentUser() {
	return new Promise((resolve, reject) => {
		user.subscribe((val) => {
			loadCurrentUser(JSON.parse(val));
			if (browser) resolve(JSON.parse(val));
		});
	});
}

let loading_user = false;

async function loadCurrentUser(user) {
	try {
		if (!loading_user && !utils.isEmptyObj(user)) {
			loading_user = true;

			// let current_user_data = await get({ id: user.id, type: `user` });
			let current_user_data = await restPost({
				// socket: await getSocket(),
				url: `get`,
				payload: {
					type: `user`,
					id: user.id
				},
				all: true
			});

			if (current_user_data.res === `ok`) {
				let current_user = current_user_data.data;
				setCurrentUser(current_user, false);
			}

			loading_user = false;
		}
	} catch (e) {
		console.log(e);
	}
}

export function setCurrentUser(new_user, reload) {
	user.set(JSON.stringify(new_user));

	if (reload) {
		location.reload();
	}
}

export async function logout() {
	user.set(null);
	location.reload();
}

// ---- user

export async function editUser(data) {
	let edited_user = await restPost({
		// socket: await getSocket(),
		url: `edit`,
		payload: { type: `user`, obj: data }
	});
	let current_user = await getCurrentUser();

	// if the user is editing their own profile, refresh the user
	if (!utils.isEmptyObj(current_user) && current_user.id === current_user.id) {
		await utils.wait(0.5);

		// let user_data = await get({
		// 	type: `user`,
		// 	id: current_user.id
		// });

		let user_data = await restPost({
			// socket: await getSocket(),
			url: `get`,
			payload: { type: `user`, id: current_user.id }
		});

		if (!utils.isEmptyObj(user_data) && user_data.res === `ok`) {
			setCurrentUser(user_data.data, false);
			// user.set(JSON.stringify(await getUser({ id: data.id })));
		}
	}

	return edited_user;
}

// ---- routes

export async function restPost(d) {
	if (!d.skip_intiation_check) {
		let initiated = (
			await bePost({
				url: `init`,
				payload: {}
			})
		).cache;

		if (!initiated) {
			location.reload();
			return;
		}
	}

	return await bePost(d);
}

export async function post(d) {
	if (!d.skip_intiation_check) {
		let initiated = (
			await ioPost({
				socket: await getSocket(),
				url: `init`,
				payload: {}
			})
		).cache;

		if (!initiated) {
			location.reload();
			return;
		}
	}

	return await ioPost(d);
}

// ---- io

async function ioPost(d) {
	return await new Promise((resolve) => {
		d.socket.emit(
			d.url,
			{
				...d.payload,
				api_key: API_KEY
			},
			(r) => {
				resolve(d.all ? r : r.data);
			}
		);
	});
}

// ---- mongo

async function beGet(endpoint) {
	return new Promise((resolve, reject) => {
		let url = `${API_ENDPOINT}${endpoint}`;

		$.getJSON(url, function (data) {
			resolve(data);
		}).fail(() => resolve(null));
	});
}

async function bePost(d) {
	let config = {
		method: `POST`,
		headers: {
			Accept: `application/json`,
			'Content-Type': `application/json`
		}
	};

	// if (!utils.isEmptyObj(d.payload)) {
	config.body = JSON.stringify({ ...(d.payload || {}), api_key: API_KEY });
	// }

	try {
		let res = JSON.parse(await (await fetch(`${API_ENDPOINT}${d.url}`, config)).text());

		try {
			return d.all ? res : res.data;
		} catch (e) {
			console.log(e);
			return res;
		}
	} catch (e) {
		console.log(e);
		return null;
	}
}
