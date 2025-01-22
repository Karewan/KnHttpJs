'use strict';

/**
 * Deferred
 */
export class Deferred {
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
	 * @returns {(res: any, headers: object) => void}
	 */
	_onSuccess;

	/**
	 * @private
	 * @returns {(err: number, status: number) => void}
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
	 * @returns {void}
	 */
	_progress() {
		//console.log("KnHttp.Deferred._progress()", arguments);

		if (this._onProgress) this._onProgress.apply(null, arguments);
	}

	/**
	 * Trigger on success
	 * @private
	 * @returns {void}
	 */
	_success() {
		//console.log("KnHttp.Deferred._success()", arguments);

		if (this._onSuccess) this._onSuccess.apply(null, arguments);
		if (this._onEnd) this._onEnd(true);
		if (this._xhr) this._xhr = null;
	}

	/**
	 * Trigger on error
	 * @private
	 * @returns {void}
	 */
	_error() {
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
	 * @param {(res: any, headers: object) => void} cb
	 * @returns {Deferred}
	 */
	onSuccess(cb) {
		//console.log("KnHttp.Deferred.onSuccess()", arguments);

		this._onSuccess = cb;
		return this;
	}

	/**
	 * Set on error callback
	 * @param {(err: number, status: number) => void} cb
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
