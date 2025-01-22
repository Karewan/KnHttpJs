'use strict';

/**
 * Parse response headers
 * @param {string} headers
 * @returns {object}
 */
export function parseResponseHeaders(headers) {
	//console.log('KnHttp.utils.parseResponseHeaders()', arguments);

	const headerMap = {},
		arr = headers.trim().split(/[\r\n]+/);

	arr.forEach((line) => {
		const parts = line.split(': ');
		const header = parts.shift();
		const value = parts.join(': ');
		headerMap[header] = value;
	});

	return headerMap;
}

/**
 * Get filename from "content-disposition" header or url
 * @param {string} disposition
 * @param {string} url
 * @returns {string}
 */
export function getFilenameFromContentDisposition(disposition, url) {
	//console.log('KnHttp.utils.getFilenameFromContentDisposition()', arguments);

	let filename;

	if (disposition && disposition.indexOf('attachment') !== -1) {
		let matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
		if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
	}

	if (!filename) filename = url.substring(url.lastIndexOf('/') + 1).split(/[?#]/)[0];

	if (!filename) filename = 'download';

	return decodeURIComponent(filename);
}

/**
 * Serialize object to url encoded query
 * @param {object} params
 * @param {string} prefix
 * @returns {string}
 */
export function serializeForm(params, prefix) {
	//console.log('KnHttp.utils.serializeForm()', arguments);

	if (prefix) {
		if (((params.constructor === Array && params.length == 0) || (params.constructor === Object && Object.keys(params).length == 0))) return prefix;
	} else {
		if (params.constructor === Array) throw '';
	}

	const query = [];

	for (let key in params) {
		const value = (params[key] == null ? '' : params[key]);

		if (params.constructor === Array) key = `${prefix}[${key}]`;
		else if (params.constructor === Object) key = (prefix ? `${prefix}[${key}]` : key);

		if (typeof value === 'object') query.push(serializeForm(value, key));
		else query.push(`${key}=${encodeURIComponent(value)}`);
	}

	return query.join('&');
}

/**
 * Serialize object to form data
 * @param {object} params
 * @param {string} prefix
 * @param {FormData} fd
 * @returns {FormData}
 */
export function serializeFormData(params, prefix, fd) {
	//console.log('KnHttp.utils.serializeFormData()', arguments);

	if (prefix) {
		if (((params.constructor === Array && params.length == 0) || (params.constructor === Object && Object.keys(params).length == 0))) {
			fd.append(prefix, "");
			return;
		}
	} else {
		if (params.constructor === Array) throw '';
	}

	fd = fd ? fd : new FormData();

	for (let key in params) {
		const value = (params[key] == null ? '' : params[key]);

		if (params.constructor === Array) key = `${prefix}[${key}]`;
		else if (params.constructor === Object) key = (prefix ? `${prefix}[${key}]` : key);

		if (typeof value === 'object') serializeFormData(value, key, fd);
		else fd.append(key, value);
	}

	return fd;
}

/**
 * Download file into the broswer
 * @param {blob} file
 * @param {string} filename
 * @returns {void}
 */
export function downloadFile(file, filename) {
	//console.log('KnHttp.utils.downloadFile()', arguments);

	const url = window.URL.createObjectURL(file),
		link = document.createElement('a');

	link.href = url;
	link.setAttribute('download', filename);
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
