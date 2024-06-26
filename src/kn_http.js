'use strict';
const KnHttp = function() {
	/** LIB VERSION */
	const VERSION = '1.0.8';

	/**
	 * ERRORS CODES
	 */
	const CANCELED_ERROR = -1,
	NETWORK_ERROR = 0,
	HTTP_ERROR = 1,
	UNKNOWN_ERROR = 2;

	/**
	 * DEFAULTS OPTIONS
	 */
	const DEFAULTS = {
		validateStatus: validateStatus,
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
	 * Deferred class
	 */
	class Deferred {
		/**
		 * Class constructor
		 */
		constructor() {
			console.log("KnHttp.Deferred.constructor()", arguments);

			this._xhr = new XMLHttpRequest();
		}

		/**
		 * Abort the request
		 * @returns {void}
		 */
		abort() {
			console.log("KnHttp.Deferred.abort()", arguments);

			if(this._xhr && this._xhr.readyState != 4) this._xhr.abort();
		}

		/**
		 * Trigger on progress
		 * @returns {void}
		 */
		progress() {
			console.log("KnHttp.Deferred.progress()", arguments);

			if(this._onProgress) this._onProgress.apply(null, arguments);
		}

		/**
		 * Trigger on success
		 * @returns {void}
		 */
		success() {
			console.log("KnHttp.Deferred.success()", arguments);

			if(this._onSuccess) this._onSuccess.apply(null, arguments);
			if(this._onEnd) this._onEnd();
			if(this._xhr) this._xhr = null;
		}

		/**
		 * Trigger on error
		 * @returns {void}
		 */
		error() {
			console.log("KnHttp.Deferred.error()", arguments);

			if(this._onError) this._onError.apply(null, arguments);
			if(this._onEnd) this._onEnd();
			if(this._xhr) this._xhr = null;
		}

		/**
		 * Set on progress callback
		 * @param {function(progress):void} cb
		 * @returns {Deferred}
		 */
		onProgress(cb) {
			console.log("KnHttp.Deferred.onProgress()", arguments);

			this._onProgress = cb;

			return this;
		}

		/**
		 * Set on success callback
		 * @param {function(res, headers):void} cb
		 * @returns {Deferred}
		 */
		onSuccess(cb) {
			console.log("KnHttp.Deferred.onSuccess()", arguments);

			this._onSuccess = cb;

			return this;
		}

		/**
		 * Set on error callback
		 * @param {function(err, status):void} cb
		 * @returns {Deferred}
		 */
		onError(cb) {
			console.log("KnHttp.Deferred.onError()", arguments);

			this._onError = cb;

			return this;
		}

		/**
		 * Set on end callback
		 * @param {function():void} cb
		 * @returns {Deferred}
		 */
		onEnd(cb) {
			console.log("KnHttp.Deferred.onEnd()", arguments);

			this._onEnd = cb;

			return this;
		}
	}

	/**
	 * Validate status
	 * @param {number} status
	 * @returns {boolean}
	 */
	function validateStatus(status) {
		console.log("KnHttp.validateStatus()", arguments);
		return status == 200;
	}

	/**
	 * Make a request
	 * @param {string} url
	 * @param {string} method
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function request(url, method, opt) {
		console.log("KnHttp.request()", arguments);

		// Init deferred object
		const d = new Deferred();

		// Request options
		opt = Object.assign({
			timeout: DEFAULTS.timeout,
			requestType: DEFAULTS.requestType,
			responseType: DEFAULTS.responseType,
			withCredentials: DEFAULTS.withCredentials,
			basicAuth: DEFAULTS.basicAuth,
			bearerAuthToken: DEFAULTS.bearerAuthToken,
			csrfHeader: DEFAULTS.csrfHeader,
			download: false,
			upload: false,
			headers: {},
			csrf: null,
			body: null
		}, opt || {});

		// Headers
		const reqHeaders = {};
		for(const k in opt.headers) reqHeaders[k.trim().toLowerCase()] = opt.headers[k];
		for(const k in DEFAULTS.headers) {
			const kt = k.trim().toLowerCase();
			if(typeof reqHeaders[kt] == 'undefined') reqHeaders[kt] = DEFAULTS.headers[k];
		}

		// Init request
		d._xhr.open(method.toUpperCase(), url, true);

		// Timeout
		d._xhr.timeout = opt.timeout;

		// With credential
		d._xhr.withCredentials = opt.withCredentials;

		// HTTP basic auth
		if(opt.basicAuth) d._xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa((opt.basicAuth.username || '') + ':' + (opt.basicAuth.password || '')));

		// Bearer token auth
		if(opt.bearerAuthToken) d._xhr.setRequestHeader('Authorization', 'Bearer ' + opt.bearerAuthToken);

		// CSRF
		if(opt.csrf) d._xhr.setRequestHeader(opt.csrfHeader, opt.csrf);

		// Request headers
		for(const k in reqHeaders) d._xhr.setRequestHeader(k, reqHeaders[k]);

		// Response type
		d._xhr.responseType = opt.responseType;

		// On load end
		d._xhr.onloadend = (e) => {
			console.log("KnHttp.request.xhr.onloadend()", e, d._xhr);

			if(!d._xhr) return;

			if(DEFAULTS.validateStatus(d._xhr.status)) {
				let resHeaders = parseResponseHeaders(d._xhr.getAllResponseHeaders());

				if(opt.download && opt.responseType == 'blob') {
					downloadFile(d._xhr.response, getFilenameFromDownload(d._xhr.getResponseHeader('content-disposition'), url));
					d.success(true, resHeaders);
				} else {
					if(opt.responseType == 'json' && !d._xhr.response) d.error(UNKNOWN_ERROR, d._xhr.status);
					else d.success(d._xhr.response, resHeaders);
				}
			} else {
				d.error(HTTP_ERROR, d._xhr.status);
			}
		};

		// On error
		d._xhr.onerror = (e) => {
			console.log("KnHttp.request.xhr.onerror()", e, d._xhr);

			if(!d._xhr) return;
			d.error(NETWORK_ERROR, d._xhr.status);
		};

		// On timeout
		d._xhr.ontimeout = (e) => {
			console.log("KnHttp.request.xhr.ontimeout()", e, d._xhr);

			if(!d._xhr) return;
			d.error(UNKNOWN_ERROR, d._xhr.status);
		};

		// On abort
		d._xhr.onabort = (e) => {
			console.log("KnHttp.request.xhr.onabort()", e, d._xhr);

			if(!d._xhr) return;
			d.error(CANCELED_ERROR, d._xhr.status);
		};

		// Download mode
		if(opt.download) {
			// Download progress
			d._xhr.onprogress = (e) => {
				console.log("KnHttp.request.xhr.onprogress()", e, d._xhr);

				if(!d._xhr) return;
				d.progress(e.lengthComputable ? Math.floor((e.loaded / e.total) * 100) : -1);
			};
		}

		// Upload mode
		if(opt.upload) {
			// Upload progress
			d._xhr.upload.onprogress = (e) => {
				console.log("KnHttp.request.xhr.upload.onprogress()", e, d._xhr);

				if(!d._xhr) return;
				d.progress(e.lengthComputable ? Math.floor((e.loaded / e.total) * 100) : -1);
			};

			// Upload error
			d._xhr.upload.onerror = (e) => {
				console.log("KnHttp.request.xhr.upload.onerror()", e, d._xhr);

				if(!d._xhr) return;
				d.error(NETWORK_ERROR, d._xhr.status);
			};
		}

		// Body
		if(opt.body) switch(opt.requestType) {
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
	function get(url, opt) {
		console.log("KnHttp.get()", arguments);

		return request(url, 'GET', opt);
	}

	/**
	 * Text GET request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function getText(url, opt) {
		console.log("KnHttp.getText()", arguments);

		if(!opt) opt = {};
		opt.responseType = 'text';
		return request(url, 'GET', opt);
	}

	/**
	 * DELETE request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function del(url, opt) {
		console.log("KnHttp.delete()", arguments);

		return request(url, 'DELETE', opt);
	}

	/**
	 * Download GET request
	 * @param {string} url
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function download(url, opt) {
		console.log("KnHttp.download()", arguments);

		if(!opt) opt = {};
		opt.download = true;
		opt.responseType = 'blob';
		return request(url, 'GET', opt);
	}

	/**
	 * Raw POST request
	 * @param {string} url
	 * @param {string} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function postRaw(url, data, opt) {
		console.log("KnHttp.postRaw()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'raw';
		return request(url, 'POST', opt);
	}

	/**
	 * Form POST request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	 function postForm(url, data, opt) {
		console.log("KnHttp.postForm()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'form';
		return request(url, 'POST', opt);
	}

	/**
	 * FormData POST request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function postFormData(url, data, opt) {
		console.log("KnHttp.postFormData()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'formData';
		return request(url, 'POST', opt);
	}

	/**
	 * JSON POST request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function postJson(url, data, opt) {
		console.log("KnHttp.postJson()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'json';
		return request(url, 'POST', opt);
	}

	/**
	 * Raw PUT request
	 * @param {string} url
	 * @param {string} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function putRaw(url, data, opt) {
		console.log("KnHttp.putRaw()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'raw';
		return request(url, 'PUT', opt);
	}

	/**
	 * Form PUT request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	 function putForm(url, data, opt) {
		console.log("KnHttp.putForm()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'form';
		return request(url, 'PUT', opt);
	}

	/**
	 * FormData PUT request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function putFormData(url, data, opt) {
		console.log("KnHttp.putFormData()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'formData';
		return request(url, 'PUT', opt);
	}

	/**
	 * JSON PUT request
	 * @param {string} url
	 * @param {object} data
	 * @param {object} opt
	 * @returns {Deferred}
	 */
	function putJson(url, data, opt) {
		console.log("KnHttp.putJson()", arguments);

		if(!opt) opt = {};
		opt.body = data;
		opt.requestType = 'json';
		return request(url, 'PUT', opt);
	}

	/**
	 * Serialize object to url encoded query
	 * @param {object} params
	 * @param {string} prefix
	 * @returns {string}
	 */
	 function serializeForm(params, prefix) {
		if(prefix) {
			if(((params.constructor === Array && params.length == 0) || (params.constructor === Object && Object.keys(params).length == 0))) return prefix;
		} else {
			if(params.constructor === Array) throw '';
		}

		const query = [];

		for(let key in params) {
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
	function serializeFormData(params, prefix, fd) {
		if(prefix) {
			if(((params.constructor === Array && params.length == 0) || (params.constructor === Object && Object.keys(params).length == 0))) {
				fd.append(prefix, "");
				return;
			}
		} else {
			if(params.constructor === Array) throw '';
		}

		fd = fd ? fd : new FormData();

		for(let key in params) {
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
	function downloadFile(file, filename) {
		console.log("KnHttp.downloadFile()", arguments);

		const url = window.URL.createObjectURL(file),
		link = document.createElement('a');

		link.href = url;
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	}

	/**
	 * Get filename from "content-disposition" header or url
	 * @param {string} disposition
	 * @param {string} url
	 * @returns {string}
	 */
	function getFilenameFromDownload(disposition, url) {
		console.log('KnHttp.getFilenameFromDownload()', arguments);

		let filename;

		if(disposition && disposition.indexOf('attachment') !== -1) {
			let matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
			if(matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
		}

		if(!filename) filename = url.substring(url.lastIndexOf('/')+1).split(/[?#]/)[0];

		if(!filename) filename = 'download';

		return decodeURIComponent(filename);
	}

	/**
	 * Parse response headers
	 * @param {string} headers
	 * @returns {object}
	 */
	function parseResponseHeaders(headers) {
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
	 * Export public methods
	 */
	return {
		VERSION,
		DEFAULTS,
		CANCELED_ERROR,
		NETWORK_ERROR,
		HTTP_ERROR,
		UNKNOWN_ERROR,
		get,
		getText,
		del,
		download,
		postRaw,
		postForm,
		postFormData,
		postJson,
		request
	};
}();
