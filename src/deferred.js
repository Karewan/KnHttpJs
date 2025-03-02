'use strict';

import { Error, Response } from "./result";

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
