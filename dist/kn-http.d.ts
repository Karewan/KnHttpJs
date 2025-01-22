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
     * KnHttp v2.0.1 (2025-01-22T14:14:15.915Z)
     * Copyright (c) 2022 - 2025 Florent VIALATTE
     * Released under the MIT license
     */
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
         * @returns {(res: any, headers: object) => void}
         */
        private _onSuccess;
        /**
         * @private
         * @returns {(err: number, status: number) => void}
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
         * @returns {void}
         */
        private _progress;
        /**
         * Trigger on success
         * @private
         * @returns {void}
         */
        private _success;
        /**
         * Trigger on error
         * @private
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
         * @param {(res: any, headers: object) => void} cb
         * @returns {Deferred}
         */
        onSuccess(cb: (res: any, headers: object) => void): Deferred;
        /**
         * Set on error callback
         * @param {(err: number, status: number) => void} cb
         * @returns {Deferred}
         */
        onError(cb: (err: number, status: number) => void): Deferred;
        /**
         * Set on end callback
         * @param {(wasSuccess: boolean) => void} cb
         * @returns {Deferred}
         */
        onEnd(cb: (wasSuccess: boolean) => void): Deferred;
    }
}
