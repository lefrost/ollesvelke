import { socket, io_instances, theme, user, sesh } from './stores.js';
import * as utils from './utils';

import { browser } from '$app/environment';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export async function checkSesh() {
	let sesh = await getSesh();
	if (!utils.isEmptyObj(await getCurrentUser())) {
		if (sesh === `null` || Date.now() + 60 >= Number(sesh)) {
			await setSesh(Date.now() + 60);
			await setCurrentUser(
				(
					await post({
						socket: await getSocket(),
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
			let current_user_data = await post({
				socket: await getSocket(),
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
	let edited_user = await post({
		socket: await getSocket(),
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

		let user_data = await post({
			socket: await getSocket(),
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
		d.socket.emit(d.url, d.payload, (r) => {
			resolve(d.all ? r : r.data);
		});
	});
}

// ---- mongo

// async function beGet(endpoint) {
// 	return new Promise((resolve, reject) => {
// 		let url = `${API_ENDPOINT}${endpoint}`;

// 		$.getJSON(url, function (data) {
// 			resolve(data);
// 		}).fail(() => resolve(null));
// 	});
// }

// async function bePost(endpoint, obj) {
// 	let config = {
// 		method: `POST`,
// 		headers: {
// 			Accept: `application/json`,
// 			'Content-Type': `application/json`
// 		}
// 	};

// 	if (!utils.isEmptyObj(obj)) {
// 		config.body = JSON.stringify(obj);
// 	}

// 	try {
// 		let res = await (await fetch(`${API_ENDPOINT}${endpoint}`, config)).text();

// 		try {
// 			return JSON.parse(res);
// 		} catch {
// 			return res;
// 		}
// 	} catch (e) {
// 		console.log(`error`);
// 		console.log(e);
// 		return null;
// 	}
// }
