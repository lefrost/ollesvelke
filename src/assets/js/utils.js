import moment from 'moment';
import moment_tz from 'moment-timezone';
import _ from 'lodash';

const FALLBACK_USER_IMAGE = import.meta.env.VITE_FALLBACK_USER_IMAGE;

export function formatNumber(num) {
	try {
		return _.comma(num);
	} catch (e) {
		console.log(e);
		return 0;
	}
}

export function padNumber(num, length) {
	try {
		// note: prepend num with 0's till length is sufficed --- will return string --- max 100 char length

		let num_string = (num || 0).toString() || ``;

		while (num_string.length < Math.min((length || 0), 100)) {
			num_string = `0${num_string}`;
		}

		return num_string || `0`;
	} catch (e) {
		console.log(e);
		return `0`;
	}
}

// https://stackoverflow.com/a/38340730/8919391
export function removeEmptyArrays(obj) {
	return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v.length != 0));
}

export function redirect(url) {
	window.open(url, `_blank`);
}

export function squeezeWebsiteName(url, hasSuffix) {
	url = url.toLowerCase();
	let searchFor = url.includes(`www.`) ? `www.` : url.includes(`https://`) ? `https://` : `http://`;

	let endingIndex = url.indexOf(`.`, url.indexOf(searchFor));
	if (hasSuffix) {
		endingIndex =
			url.indexOf(`/`, url.indexOf(`.`, url.indexOf(searchFor))) !== -1
				? url.indexOf(`/`, url.indexOf(`.`, url.indexOf(searchFor)))
				: url.length;
	}

	return url.substring(url.indexOf(searchFor) + searchFor.length, endingIndex);
}

export function sanitiseString (str) {
	try {
		return (str || ``).trim().toLowerCase().replaceAll(` `, ``);
	} catch (e) {
		console.log(e);
	}
}

export function urlifyString(str) {
	return str.replaceAll(`&`, `[ampersand]`).replaceAll(`#`, `[hash]`);
}

export function unurlifyString(str) {
	return str.replaceAll(`[ampersand]`, `&`).replaceAll(`[hash]`, `#`);
}

export function objToUrl(obj) {
	// https://stackoverflow.com/a/38340730/8919391
	// obj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null && v.length > 0));
	if (obj === null || obj === undefined) {
		return ``;
	} else {
		obj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined));
		return decodeURIComponent(new URLSearchParams(obj).toString());
	}
}

export function isEmptyObj(obj) {
	for (let i in obj) return false;
	return true;
}

export function isUrl(val) {
	let url;
	try {
		url = new URL(val);
	} catch (e) {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
}

export function wait(seconds) {
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve();
		}, seconds * 1000);
	});
}

// function dec2hex(dec) {
// 	return dec.toString(16).padStart(2, '0');
// }

// export function generateId(length) {
// 	var arr = new Uint8Array((length || 40) / 2);
// 	// window.crypto.getRandomValues(arr);
// 	return Array.from(arr, dec2hex).join('');
// }

export function generateId(length) {
	// https://stackoverflow.com/a/58326357/8919391
	return [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function getTimestamp() {
	return moment.utc().unix();
}

export function convertToTimestamp(input, format) {
	return moment.utc(input, format).unix();
}

export function datetimeToTimestamp(d) {
	// new
	try {
		let datetime_timezone = d.datetime_timezone || `UTC`;
		let datetime = d.datetime || ``;
		
		return Number(moment(datetime).tz(datetime_timezone).format(`X`));
	} catch (e) {
		console.log(e);
		return null;
	}
}

export function timestampToDatetime(d) {
	// new
	try {
		let timestamp = d.timestamp || 0;
		let datetime_timezone = d.datetime_timezone || `UTC`;
		let datetime_format = d.datetime_format || `YYYY-MM-DDTHH:mm`;
		
		return moment.tz(moment.unix(timestamp), datetime_timezone).format(datetime_format);
	} catch (e) {
		console.log(e);
		return null;
	}
}

export function formatTimestamp(timestamp, format) {
	return moment.unix(timestamp).utc().format(format);
}

export function formatDatetime(datetime, format, timezone) {
	// deprecated
	if (!timezone) {
		timezone = `UTC`;
	}
	return moment_tz.utc(datetime).tz(timezone).format(format);
}

export function getTimestampDiff(start, end, format) {
	let diff = moment.duration(moment.unix(end).diff(moment.unix(start)));

	switch (format) {
		case `days`:
			return diff.asDays();
		case `hours`:
			return diff.asHours();
		case `minutes`:
			return diff.asMinutes();
		case `seconds`:
		default:
			return diff.asSeconds();
	}
}

export function getDatetimeDiff(start, end, format) {
	let diff = moment.duration(moment(end).diff(moment(start)));

	switch (format) {
		case `days`:
			return diff.asDays();
		case `minutes`:
			return diff.asMinutes();
		case `minutes`:
			return diff.asHours();
		case `seconds`:
		default:
			return diff.asSeconds();
	}
}

export function alterTimestamp(operation, offset, type, timestamp) {
	switch (operation) {
		case 'add':
			return moment
				.utc(timestamp, `X`)
				.add(offset || 0, type || `seconds`)
				.unix();
		case 'subtract':
			return moment
				.utc(timestamp, `X`)
				.subtract(offset || 0, type || `seconds`)
				.unix();
		default:
			return timestamp;
	}
}

export function getDisplayableTimeElapsed(timestamp) {
	if (timestamp <= 0) {
		return `n/a`;
	}

	let now = getTimestamp();
	let diff_in_seconds = getTimestampDiff(timestamp, now, `seconds`);
	let diff_in_minutes = getTimestampDiff(timestamp, now, `minutes`);
	let diff_in_hours = getTimestampDiff(timestamp, now, `hours`);
	let diff_in_days = getTimestampDiff(timestamp, now, `days`);

	if (diff_in_seconds < 60) {
		return `${Math.floor(diff_in_seconds)}s`;
	} else if (diff_in_minutes < 60) {
		return `${Math.floor(diff_in_minutes)}m`;
	} else if (diff_in_hours < 24) {
		return `${Math.floor(diff_in_hours)}h`;
	} else {
		return `${Math.floor(diff_in_days)}d`;
	}
}

export function getDisplayableTimeBefore(timestamp) {
	if (timestamp <= 0) {
		return `n/a`;
	}
	
	let now = getTimestamp();
	let diff_in_seconds = getTimestampDiff(now, timestamp, `seconds`);
	let diff_in_minutes = getTimestampDiff(now, timestamp, `minutes`);
	let diff_in_hours = getTimestampDiff(now, timestamp, `hours`);
	let diff_in_days = getTimestampDiff(now, timestamp, `days`);

	if (diff_in_seconds < 60) {
		// return `${Math.floor(diff_in_seconds)}s`;
		return `Now`;
	} else if (diff_in_minutes < 60) {
		return `${Math.floor(diff_in_minutes)}m`;
	} else if (diff_in_hours < 24) {
		return `${Math.floor(diff_in_hours)}h`;
	} else {
		return `${Math.floor(diff_in_days)}d`;
	}
}

export function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomDefaultBackground() {
	return `/images/backgrounds/default-${getRandomNumber(1, 4)}.png`;
}

export function isToggled(dom_item) {
	return dom_item ? [...dom_item.classList].includes(`toggled--`) : false;
}

export async function toggle(dom_item) {
	if (dom_item) {
		if (![...dom_item.classList].includes(`toggled--`)) {
			// console.log(`toggling on`);
			dom_item.classList.add(`toggled--`);
			await wait(0.05);
			dom_item.classList.add(`visible--`);
		} else {
			// console.log(`toggling off`);
			dom_item.classList.remove(`visible--`);
			await wait(0.2);
			dom_item.classList.remove(`toggled--`);
		}
		return dom_item;
	}
}

// https://stackoverflow.com/a/20285053/8919391
export async function blobToDataUrl(val, type) {
	let blob = type === `url` ? await (await fetch(val)).blob() : val;
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
	});
}

export function isValidUrl(str) {
	try {
		new URL(str);
		return true;
	} catch (e) {
		return false;
	}
}

export function scrollHorz(e, target) {
	target.scrollLeft += e.deltaY * 6;
}

export function shuffleArray(arr) {
	// https://stackoverflow.com/a/46545530/8919391
	return arr
		.map((value) => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
}

export function hasErrors(arr) {
	if (
		Object.keys(arr)
			.map((key) => arr[key])
			.join(``)
			.trim().length === 0
	) {
		return false;
	} else {
		return true;
	}
}

export function resetErrors(arr) {
	for (let key of Object.keys(arr)) {
		arr[key] = ``;
	}

	return arr;
}

export function calcValBeforePercChange(val, perc_change) {
	let val_before_perc_change = (val / (100 + perc_change)) * 100;
	if (val_before_perc_change === Infinity) {
		val_before_perc_change = val * 2;
	}
	return val_before_perc_change || 0;
}

export function calcPercChange(a, b) {
	if (a === null || b === null) {
		return 0;
	}

	let percent;
	if (b !== 0) {
		if (a !== 0) {
			percent = ((b - a) / a) * 100;
		} else {
			percent = b * 100;
		}
	} else {
		percent = -a * 100;
	}
	return percent;
}

export function round(num, precision) {
	if (num) {
		if (num >= 0) {
			return Math.abs(parseFloat(num.toString().split('e')[0])).toFixed(precision);
		} else {
			return (Math.abs(parseFloat(num.toString().split('e')[0])) * -1).toFixed(precision);
		}
	} else {
		return `0`;
	}
}

export function shortenString(data) {
	if (data.string) {
		data.string = data.string.toString();
	}

	if (!data.left && !data.right) {
		data.right = true;
	}

	if (data.string && data.string.length > data.length) {
		if (data.left) {
			return `...${data.string
				.substring(data.string.length - data.length, data.string.length)
				.trim()}`;
		} else if (data.right) {
			return `${data.string.substring(0, data.length).trim()}...`;
		}
	} else {
		return data.string;
	}
}

export function formatUrl(url) {
	try {
		let { hostname } = new URL(url);
		return hostname.replace(`www.`, ``);
	} catch (e) {
		return ``;
	}
}

export function formatAddress(address) {
	return !isEmptyObj(address)
		? `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`
		: ``;
}

export function isBetween(x, min, max) {
	return x >= min && x <= max;
}

export function clone(obj) {
	try {
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	} catch (e) {
		console.log(e);
		return null;
	}
}

// export function clone(obj) {
// 	return Object.assign({}, obj);
// }

export function getTimezones() {
	let timezones = moment_tz.tz.names().map((t) => {
		let zone = moment_tz.tz(t).format(`z`);

		return {
			name: t,
			zone: `${zone.startsWith(`+`) || zone.startsWith(`-`) ? `UTC` : ``}${zone
				.replace(`+0`, `+`)
				.replace(`-0`, `-`)}`
		};
	});

	timezones = JSON.parse(JSON.stringify(timezones))
		.filter((t) => t.name.startsWith(`Etc/`))
		.concat(JSON.parse(JSON.stringify(timezones)).filter((t) => !t.name.startsWith(`Etc/`)));

	return timezones;
}

export function getTimezoneZone(id) {
	let zone = moment_tz.tz(id).format(`z`);

	return `${zone.startsWith(`+`) || zone.startsWith(`-`) ? `UTC` : ``}${zone
		.replace(`+0`, `+`)
		.replace(`-0`, `-`)}`;
}

export function timestampToMinute(timestamp) {
	return Math.ceil((timestamp || getTimestamp()) / 60);
}

// export function getDatetimeInTimezone(datetime, timezone) {
// 	return moment_tz.utc(datetime).tz(timezone).format();
// }

// export function getTimezoneInDatetime(datetime, timezone) {
// 	return moment_tz.tz(datetime, timezone).toISOString();
// }

export function getIoInstanceStatuses() {
	return [
		{
			code: `active`,
			colour: `map-green`
		},
		{
			code: `idle`,
			colour: `map-yellow`
		}
	];
}

export function calcUserAccessLevel(user) {
	let obj = {
		access_level: 0,
		collections: []
	};

	let suave_collections = [
		{
			code: `suaveseals`,
			name: `Suave Seals`,
			amount: 100,
			image_url: `https://creator-hub-prod.s3.us-east-2.amazonaws.com/suaveseals_pfp_1649551224701.png`
		}
	];

	if (user && user.collections) {
		for (let collection of user.collections) {
			let matching_suave_collection = suave_collections.find((c) => c.code === collection.code);

			if (!isEmptyObj(matching_suave_collection)) {
				obj.collections.push({
					...matching_suave_collection,
					nfts: collection.nfts,
					count: collection.nfts.length
				});

				obj.access_level += matching_suave_collection.amount * collection.nfts.length;
			}
		}
	}

	return obj;
}

export function scrollToItemInContainer(data) {
	data.container_div.scrollBy({
		top: data.item_div.offsetTop - data.container_div.scrollTop - 150,
		left: 0,
		behavior: 'smooth'
	});
}

export function getStringLength(str) {
	try {
		str = str || ``;
		return _.toArray(str.toString().trim()).length;
	} catch (e) {
		console.log(e);
		return 0;
	}
}

export function getImgSrc(file) {
	return new Promise(async (resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.addEventListener(`load`, function () {
			resolve(reader.result);
		});
	});
}

export async function imgUrlToBase64(img_url) {
	try {
		// ref: https://stackoverflow.com/a/64929732/8919391
		return new Promise(async (resolve, reject) => {
			const reader = new FileReader();
			const img_data = await fetch(img_url);
			const img_blob = await img_data.blob();
			reader.readAsDataURL(img_blob);
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
		});
	} catch (e) {
		console.log(e);
		return null;
	}
}

export function getBlockchain(blockchain) {
	try {
		blockchain = blockchain.trim().toLowerCase();

		if (blockchain === `solana` || blockchain.startsWith(`sol`)) {
			return `solana`;
		} else if (blockchain === `arbitrum` || blockchain.startsWith(`arb`)) {
			return `arbitrum`;
		} else if (blockchain === `bitcoin` || blockchain.startsWith(`btc`)) {
			return `bitcoin`;
		} else if (blockchain === `ethereum` || blockchain.startsWith(`eth`)) {
			return `ethereum`;
		} else if (
			blockchain === `polygon` ||
			blockchain === `matic` ||
			blockchain.startsWith(`poly`) ||
			blockchain.startsWith(`matic`)
		) {
			return `polygon`;
		} else if (blockchain === `sui` || blockchain.startsWith(`sui`)) {
			return `sui`;
		} else {
			return null;
		}
	} catch (e) {
		console.log(e);
		return null;
	}
}

export function getWeightedRandom(d) {
	try {
		let arr = d.arr || [];
		let rarity_prop = d.rarity_prop || ``;
		let value_prop = d.value_prop || ``;
		
		let sum = 0;
		let r = getRandomNumber(0, 100);
		arr = (arr || []).sort((a, b) => b[rarity_prop] - a[rarity_prop]);

		for (let i = 0; i < arr.length; i++) {
			sum += arr[i][rarity_prop];
			if (r <= sum) return (value_prop ? arr[i][value_prop] : arr[i]);
		}

		return value_prop ? arr[0][value_prop] : arr[0];
	} catch (e) {
		console.log(e);
		return null;
	}
}

export function removeAccents(str) {
	// https://stackoverflow.com/a/37511463/8919391
	return str.normalize(`NFD`).replace(/\p{Diacritic}/gu, ``);
}

export function getSubstringOccurrenceCount(d) {
	try {
		return (d.string || ``).split(d.substring || ``).length - 1;
	} catch (e) {
		console.log(e);
		return 0;
	}
}

export function compressImage(d) {
	try {
		let image_url = d.image_url || ``;
		let width = d.width || 0;
		let height = d.height || width;
		
		if (image_url === FALLBACK_USER_IMAGE) {
			return image_url;
		}
	
		if (getSubstringOccurrenceCount({
			string: image_url,
			substring: `http`
		}) <= 1) {
			return `https://wsrv.nl/?url=${image_url}&w=${width}&h=${height}`;
		} else {
			return image_url;
		}
	} catch (e) {
		console.log(e);
		return null;
	}
}

export function copyToClipboard(text) {
	navigator.clipboard.writeText(text);
}