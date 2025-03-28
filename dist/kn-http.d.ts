/**
 * KnHttp v3.0.1 (2025-03-28T16:41:49.569Z)
 * Copyright (c) 2022 - 2025 Florent VIALATTE
 * Released under the MIT license
 */

declare module "kn-http" {
	export { KnHttp as default };
	/**
	 * KnHttp
	 */
	const KnHttp: {
		/** LIB VERSION */
		VERSION: string;
		/**
		 * ERRORS CODES
		 */
		CANCELED_ERROR: number;
		NETWORK_ERROR: number;
		HTTP_ERROR: number;
		UNKNOWN_ERROR: number;
		/**
		 * DEFAULTS OPTIONS
		 */
		DEFAULTS: {
			validateStatus: (status: number) => boolean;
			timeout: number;
			basicAuth: any;
			bearerAuthToken: any;
			withCredentials: boolean;
			requestType: string;
			responseType: string;
			csrfHeader: string;
			headers: {
				Accept: string;
				'X-Requested-With': string;
			};
		};
		/**
		 * Validate status
		 * @param {number} status
		 * @returns {boolean}
		 */
		validateStatus(status: number): boolean;
		/**
		 * Make a request
		 * @param {string} url
		 * @param {string} method
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		request(url: string, method: string, opt: object): Deferred;
		/**
		 * GET request
		 * @param {string} url
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		get(url: string, opt: object): Deferred;
		/**
		 * Text GET request
		 * @param {string} url
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		getText(url: string, opt: object): Deferred;
		/**
		 * DELETE request
		 * @param {string} url
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		del(url: string, opt: object): Deferred;
		/**
		 * Download GET request
		 * @param {string} url
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		download(url: string, opt: object): Deferred;
		/**
		 * Raw POST request
		 * @param {string} url
		 * @param {string} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		postRaw(url: string, data: string, opt: object): Deferred;
		/**
		 * Form POST request
		 * @param {string} url
		 * @param {object} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		postForm(url: string, data: object, opt: object): Deferred;
		/**
		 * FormData POST request
		 * @param {string} url
		 * @param {object} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		postFormData(url: string, data: object, opt: object): Deferred;
		/**
		 * JSON POST request
		 * @param {string} url
		 * @param {object} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		postJson(url: string, data: object, opt: object): Deferred;
		/**
		 * Raw PUT request
		 * @param {string} url
		 * @param {string} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		putRaw(url: string, data: string, opt: object): Deferred;
		/**
		 * Form PUT request
		 * @param {string} url
		 * @param {object} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		putForm(url: string, data: object, opt: object): Deferred;
		/**
		 * FormData PUT request
		 * @param {string} url
		 * @param {object} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		putFormData(url: string, data: object, opt: object): Deferred;
		/**
		 * JSON PUT request
		 * @param {string} url
		 * @param {object} data
		 * @param {object} opt
		 * @returns {Deferred}
		 */
		putJson(url: string, data: object, opt: object): Deferred;
	};
	/**
	 * Deferred
	 */
	class Deferred {
		/**
		 * @private
		 * @returns {XMLHttpRequest}
		 */
		private _xhr;
		/**
		 * @private
		 * @returns {(progress: number) => void}
		 */
		private _onProgress;
		/**
		 * @private
		 * @returns {(res: Response) => void}
		 */
		private _onSuccess;
		/**
		 * @private
		 * @returns {(err: Error) => void}
		 */
		private _onError;
		/**
		 * @private
		 * @returns {(wasSuccess: boolean) => void}
		 */
		private _onEnd;
		/**
		 * Abort the request
		 * @returns {void}
		 */
		abort(): void;
		/**
		 * Trigger on progress
		 * @private
		 * @param {number} progress
		 * @returns {void}
		 */
		private _progress;
		/**
		 * Trigger on success
		 * @private
		 * @param {Response} res
		 * @returns {void}
		 */
		private _success;
		/**
		 * Trigger on error
		 * @private
		 * @param {Error} err
		 * @returns {void}
		 */
		private _error;
		/**
		 * Set on progress callback
		 * @param {(progress: number) => void} cb
		 * @returns {Deferred}
		 */
		onProgress(cb: (progress: number) => void): Deferred;
		/**
		 * Set on success callback
		 * @param {(res: Response) => void} cb
		 * @returns {Deferred}
		 */
		onSuccess(cb: (res: Response) => void): Deferred;
		/**
		 * Set on error callback
		 * @param {(err: Error) => void} cb
		 * @returns {Deferred}
		 */
		onError(cb: (err: Error) => void): Deferred;
		/**
		 * Set on end callback
		 * @param {(wasSuccess: boolean) => void} cb
		 * @returns {Deferred}
		 */
		onEnd(cb: (wasSuccess: boolean) => void): Deferred;
	}

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
		constructor(data: any, headers: object, httpCode: number);
		data: any;
		headers: any;
		httpCode: number;
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
		constructor(code: number, httpCode: number, data?: any, headers?: object);
		code: number;
		httpCode: number;
		data: any;
		headers: any;
	}
}
