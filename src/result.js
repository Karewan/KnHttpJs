'use strict';

/**
 * Success response
 */
export class Response {
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
export class Error {
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
