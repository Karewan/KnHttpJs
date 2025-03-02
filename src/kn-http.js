'use strict';

import { Deferred } from "./deferred";
import { Error, Response } from "./result";
import { downloadFile, getFilenameFromContentDisposition, parseResponseHeaders, serializeForm, serializeFormData } from "./utils";

/**
 * KnHttp
 */
const KnHttp = new class {
	/** LIB VERSION */
	VERSION = process.env.npm_package_version;

	/**
	 * ERRORS CODES
	 */
	CANCELED_ERROR = -1;
	NETWORK_ERROR = 0;
	HTTP_ERROR = 1;
	UNKNOWN_ERROR = 2;

	/**
	 * DEFAULTS OPTIONS
	 */
	DEFAULTS = {
		validateStatus: this.validateStatus,
		timeout: 270_000,
		basicAuth: null,
		bearerAuthToken: null,
		withCredentials: false,
		requestType: 'raw',
		responseType: 'json',
		csrfHeader: 'X-CSRF',
		headers: {
			'Accept': '*/*',
			'X-Requested-With': 'XMLHttpRequest'
		}
	};

	/**
	 * Validate status
	 * @param {number} status
	 * @returns {boolean}
	 */
	validateStatus(status) {
		//console.log("KnHttp.validateStatus()", arguments);
		return status == 200;
	}

	/**
	 * Make a request
	 * @param {string} url
	 * @param {string} method
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	request(url, method, opt) {
		//console.log("KnHttp.request()", arguments);

		// Init deferred object
		const d = new Deferred();

		// Request options
		opt = Object.assign({
			timeout: this.DEFAULTS.timeout,
			requestType: this.DEFAULTS.requestType,
			responseType: this.DEFAULTS.responseType,
			withCredentials: this.DEFAULTS.withCredentials,
			basicAuth: this.DEFAULTS.basicAuth,
			bearerAuthToken: this.DEFAULTS.bearerAuthToken,
			csrfHeader: this.DEFAULTS.csrfHeader,
			download: false,
			upload: false,
			headers: {},
			csrf: null,
			body: null
		}, opt || {});

		// Headers
		const reqHeaders = {};
		for (const k in opt.headers) reqHeaders[k.trim().toLowerCase()] = opt.headers[k];
		for (const k in this.DEFAULTS.headers) {
			const kt = k.trim().toLowerCase();
			if (typeof reqHeaders[kt] == 'undefined') reqHeaders[kt] = this.DEFAULTS.headers[k];
		}

		// Init request
		d._xhr.open(method.toUpperCase(), url, true);

		// Timeout
		d._xhr.timeout = opt.timeout;

		// With credential
		d._xhr.withCredentials = opt.withCredentials;

		// HTTP basic auth
		if (opt.basicAuth) d._xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa((opt.basicAuth.username || '') + ':' + (opt.basicAuth.password || '')));

		// Bearer token auth
		if (opt.bearerAuthToken) d._xhr.setRequestHeader('Authorization', 'Bearer ' + opt.bearerAuthToken);

		// CSRF
		if (opt.csrf) d._xhr.setRequestHeader(opt.csrfHeader, opt.csrf);

		// Request headers
		for (const k in reqHeaders) d._xhr.setRequestHeader(k, reqHeaders[k]);

		// Response type
		d._xhr.responseType = opt.responseType;

		// On load end
		d._xhr.onloadend = (e) => {
			//console.log("KnHttp.request.xhr.onloadend()", e, d._xhr);

			if (!d._xhr) return;

			const resHeaders = parseResponseHeaders(d._xhr.getAllResponseHeaders());

			if (this.DEFAULTS.validateStatus(d._xhr.status)) {
				if (opt.download && opt.responseType == 'blob') {
					downloadFile(d._xhr.response, getFilenameFromContentDisposition(d._xhr.getResponseHeader('content-disposition'), url));
					d._success(new Response(true, resHeaders, d._xhr.status));
				} else {
					if (opt.responseType == 'json' && !d._xhr.response) {
						d._error(new Error(this.UNKNOWN_ERROR, d._xhr.status, d._xhr.response, resHeaders));
					} else {
						d._success(new Response(d._xhr.response, resHeaders, d._xhr.status));
					}
				}
			} else {
				d._error(new Error(this.HTTP_ERROR, d._xhr.status, d._xhr.response, resHeaders));
			}
		};

		// On error
		d._xhr.onerror = (e) => {
			//console.log("KnHttp.request.xhr.onerror()", e, d._xhr);

			if (!d._xhr) return;
			d._error(new Error(this.NETWORK_ERROR, d._xhr.status));
		};

		// On timeout
		d._xhr.ontimeout = (e) => {
			//console.log("KnHttp.request.xhr.ontimeout()", e, d._xhr);

			if (!d._xhr) return;
			d._error(new Error(this.UNKNOWN_ERROR, d._xhr.status));
		};

		// On abort
		d._xhr.onabort = (e) => {
			//console.log("KnHttp.request.xhr.onabort()", e, d._xhr);

			if (!d._xhr) return;
			d._error(new Error(this.CANCELED_ERROR, d._xhr.status));
		};

		// Download mode
		if (opt.download) {
			// Download progress
			d._xhr.onprogress = (e) => {
				//console.log("KnHttp.request.xhr.onprogress()", e, d._xhr);

				if (!d._xhr) return;
				d._progress(e.lengthComputable ? Math.floor((e.loaded / e.total) * 100) : -1);
			};
		}

		// Upload mode
		if (opt.upload) {
			// Upload progress
			d._xhr.upload.onprogress = (e) => {
				//console.log("KnHttp.request.xhr.upload.onprogress()", e, d._xhr);

				if (!d._xhr) return;
				d._progress(e.lengthComputable ? Math.floor((e.loaded / e.total) * 100) : -1);
			};

			// Upload error
			d._xhr.upload.onerror = (e) => {
				//console.log("KnHttp.request.xhr.upload.onerror()", e, d._xhr);

				if (!d._xhr) return;
				d._error(new Error(this.NETWORK_ERROR, d._xhr.status));
			};
		}

		// Body
		if (opt.body) switch (opt.requestType) {
			case 'json':
				d._xhr.setRequestHeader('Content-Type', 'application/json');
				opt.body = JSON.stringify(opt.body);
				break;

			case 'form':
				d._xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				opt.body = serializeForm(opt.body);
				break;

			case 'formData':
				opt.body = serializeFormData(opt.body);
				break;
		}

		// Send request
		d._xhr.send(opt.body || null);

		// Return deferred object
		return d;
	}

	/**
	 * GET request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	get(url, opt) {
		//console.log("KnHttp.get()", arguments);

		return this.request(url, 'GET', opt);
	}

	/**
	 * Text GET request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	getText(url, opt) {
		//console.log("KnHttp.getText()", arguments);

		if (!opt) opt = {};
		opt.responseType = 'text';
		return this.request(url, 'GET', opt);
	}

	/**
	 * DELETE request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	del(url, opt) {
		//console.log("KnHttp.delete()", arguments);

		return this.request(url, 'DELETE', opt);
	}

	/**
	 * Download GET request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	download(url, opt) {
		//console.log("KnHttp.download()", arguments);

		if (!opt) opt = {};
		opt.download = true;
		opt.responseType = 'blob';
		return this.request(url, 'GET', opt);
	}

	/**
	 * Raw POST request
	 * @param {string} url
	 * @param {string} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	postRaw(url, data, opt) {
		//console.log("KnHttp.postRaw()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'raw';
		return this.request(url, 'POST', opt);
	}

	/**
	 * Form POST request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	postForm(url, data, opt) {
		//console.log("KnHttp.postForm()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'form';
		return this.request(url, 'POST', opt);
	}

	/**
	 * FormData POST request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	postFormData(url, data, opt) {
		//console.log("KnHttp.postFormData()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'formData';
		return this.request(url, 'POST', opt);
	}

	/**
	 * JSON POST request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	postJson(url, data, opt) {
		//console.log("KnHttp.postJson()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'json';
		return this.request(url, 'POST', opt);
	}

	/**
	 * Raw PUT request
	 * @param {string} url
	 * @param {string} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	putRaw(url, data, opt) {
		//console.log("KnHttp.putRaw()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'raw';
		return this.request(url, 'PUT', opt);
	}

	/**
	 * Form PUT request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	putForm(url, data, opt) {
		//console.log("KnHttp.putForm()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'form';
		return this.request(url, 'PUT', opt);
	}

	/**
	 * FormData PUT request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	putFormData(url, data, opt) {
		//console.log("KnHttp.putFormData()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'formData';
		return this.request(url, 'PUT', opt);
	}

	/**
	 * JSON PUT request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	putJson(url, data, opt) {
		//console.log("KnHttp.putJson()", arguments);

		if (!opt) opt = {};
		opt.body = data;
		opt.requestType = 'json';
		return this.request(url, 'PUT', opt);
	}
}

export default KnHttp;
