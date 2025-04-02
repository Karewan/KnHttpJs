/**
 * KnHttp v3.0.2 (2025-04-02T09:02:13.199Z)
 * Copyright (c) 2022 - 2025 Florent VIALATTE
 * Released under the MIT license
 */
var KnHttp = (function () {
	'use strict';

	/**
	 * Success response
	 */
	class Response {
		/**
		 * Class constructor
		 * @param {any} data
		 * @param {object} headers
		 * @param {Number} httpCode
		 */
		constructor(data, headers, httpCode) {
			this.data = data;
			this.headers = headers;
			this.httpCode = httpCode;
		}
	}

	/**
	 * Error response
	 */
	class Error {
		/**
		 * Class constructor
		 * @param {Number} code
		 * @param {Number} httpCode
		 * @param {any} data
		 * @param {object} headers
		 */
		constructor(code, httpCode, data = null, headers = {}) {
			this.code = code;
			this.httpCode = httpCode;
			this.data = data;
			this.headers = headers;
		}
	}

	/**
	 * Deferred
	 */
	class Deferred {
		/**
		 * @private
		 * @returns {XMLHttpRequest}
		 */
		_xhr;

		/**
		 * @private
		 * @returns {(progress: number) => void}
		 */
		_onProgress;

		/**
		 * @private
		 * @returns {(res: Response) => void}
		 */
		_onSuccess;

		/**
		 * @private
		 * @returns {(err: Error) => void}
		 */
		_onError;

		/**
		 * @private
		 * @returns {(wasSuccess: boolean) => void}
		 */
		_onEnd;

		/**
		 * Class constructor
		 */
		constructor() {
			//console.log("KnHttp.Deferred.constructor()", arguments);

			this._xhr = new XMLHttpRequest();
		}

		/**
		 * Abort the request
		 * @returns {void}
		 */
		abort() {
			//console.log("KnHttp.Deferred.abort()", arguments);

			if (this._xhr && this._xhr.readyState != 4) this._xhr.abort();
		}

		/**
		 * Trigger on progress
		 * @private
		 * @param {number} progress
		 * @returns {void}
		 */
		_progress(progress) {
			//console.log("KnHttp.Deferred._progress()", arguments);

			if (this._onProgress) this._onProgress.apply(null, arguments);
		}

		/**
		 * Trigger on success
		 * @private
		 * @param {Response} res
		 * @returns {void}
		 */
		_success(res) {
			//console.log("KnHttp.Deferred._success()", arguments);

			if (this._onSuccess) this._onSuccess.apply(null, arguments);
			if (this._onEnd) this._onEnd(true);
			if (this._xhr) this._xhr = null;
		}

		/**
		 * Trigger on error
		 * @private
		 * @param {Error} err
		 * @returns {void}
		 */
		_error(err) {
			//console.log("KnHttp.Deferred._error()", arguments);

			if (this._onError) this._onError.apply(null, arguments);
			if (this._onEnd) this._onEnd(false);
			if (this._xhr) this._xhr = null;
		}

		/**
		 * Set on progress callback
		 * @param {(progress: number) => void} cb
		 * @returns {Deferred}
		 */
		onProgress(cb) {
			//console.log("KnHttp.Deferred.onProgress()", arguments);

			this._onProgress = cb;
			return this;
		}

		/**
		 * Set on success callback
		 * @param {(res: Response) => void} cb
		 * @returns {Deferred}
		 */
		onSuccess(cb) {
			//console.log("KnHttp.Deferred.onSuccess()", arguments);

			this._onSuccess = cb;
			return this;
		}

		/**
		 * Set on error callback
		 * @param {(err: Error) => void} cb
		 * @returns {Deferred}
		 */
		onError(cb) {
			//console.log("KnHttp.Deferred.onError()", arguments);

			this._onError = cb;
			return this;
		}

		/**
		 * Set on end callback
		 * @param {(wasSuccess: boolean) => void} cb
		 * @returns {Deferred}
		 */
		onEnd(cb) {
			//console.log("KnHttp.Deferred.onEnd()", arguments);

			this._onEnd = cb;
			return this;
		}
	}

	/**
	 * Parse response headers
	 * @param {string} headers
	 * @returns {object}
	 */
	function parseResponseHeaders(headers) {
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
	function getFilenameFromContentDisposition(disposition, url) {
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
	function serializeForm(params, prefix) {
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
	function serializeFormData(params, prefix, fd) {
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

			if (typeof value === 'object' && !(value instanceof File)) serializeFormData(value, key, fd);
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

	/**
	 * KnHttp
	 */
	const KnHttp = new class {
		/** LIB VERSION */
		VERSION = "3.0.2";

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
			onError: null,
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

			// Global error callback
			if (this.DEFAULTS.onError) d.onError(this.DEFAULTS.onError);

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
	};

	return KnHttp;

})();
