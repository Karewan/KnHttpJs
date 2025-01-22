# KnHttpJS

Javascript HTTP client for the browser.

### Changelog

See the changelog [here](CHANGELOG.md)

### Usage

* Install via your favorite package manager or get the latest version in [dist](dist) folder

	```shell
	pnpm install kn-http
	```

	```shell
	npm install kn-http
	```

* Usage example

	```javascript
	console.log('saveBtn()');

	saveBtn.btnLoading(true);

	KnHttp.postForm("/account/settings",
			{
				currentPassword: currentPassword,
				newPassword: newPassword,
				newPasswordConfirm: newPasswordConfirm
			},
			{
				csrf: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
			})
			.onSuccess((json, headers) => {
				console.log('saveBtn() onSuccess()', json, headers);

				if (json.success) {
					currentPassword = newPassword = newPasswordConfirm = '';
					notifySuccess("Password updated successfully");
				} else {
					notifyError(json.error ? json.error : "Unknown error");
				}
			})
			.onError((err, status) => {
				console.error('saveBtn() onError()', err, status);

				if (err == KnHttp.CANCELED_ERROR) {
					return;
				} else if (err == KnHttp.HTTP_ERROR) {
					notifyError("Unknown error: HTTP CODE " + status);
				} else {
					if(err == KnHttp.NETWORK_ERROR) notifyError("Please check your internet connection");
					else notifyError("Unknown error");
				}
			})
			.onEnd((wasSuccess) => {
				console.log('saveBtn() onEnd()', wasSuccess);

				saveBtn.btnLoading(false);
			});
	```

* Methods

	```javascript
	// HTTP GET request with optional options
	// responseType json
	let req = KnHttp.get('https://mysuperurl', opt);

	// HTTP GET request with optional options
	// responseType text
	let req = KnHttp.getText('https://mysuperurl', opt);

	// HTTP GET download request with optional options
	// forced download to browser and responseType blob
	let req = KnHttp.download('https://mysuperurl', opt);

	// HTTP DELETE request with optional options
	// responseType json
	let req = KnHttp.del('https://mysuperurl', opt);

	// HTTP POST "raw" request with optional options
	// raw body and responseType json
	let req = KnHttp.postRaw('https://mysuperurl', data, opt);

	// HTTP POST "form encoded" with optional options
	// form encoded with "application/x-www-form-urlencoded" header
	// responseType json
	let req = KnHttp.postForm('https://mysuperurl', data, opt);

	// HTTP POST "form data" with optional options
	// form data and responseType json
	let req = KnHttp.postFormData('https://mysuperurl', data, opt);

	// HTTP POST "json" with optional options
	// json body and responseType json
	let req = KnHttp.postJson('https://mysuperurl', data, opt);

	// HTTP PUT "raw" request with optional options
	// raw body and responseType json
	let req = KnHttp.putRaw('https://mysuperurl', data, opt);

	// HTTP PUT "form encoded" with optional options
	// form encoded with "application/x-www-form-urlencoded" header
	// responseType json
	let req = KnHttp.putForm('https://mysuperurl', data, opt);

	// HTTP PUT "form data" with optional options
	// form data and responseType json
	let req = KnHttp.putFormData('https://mysuperurl', data, opt);

	// HTTP PUT "json" with optional options
	// json body and responseType json
	let req = KnHttp.putJson('https://mysuperurl', data, opt);

	// Custom HTTP req with options
	let req = KnHttp.request('https://mysuperurl', method, opt);

	// On progress pourcent callback for upload only
	// return self
	req.onProgress((progress) => {
	});

	// On req sucess callback
	// return self
	req.onSuccess((res, headers) => {
	});

	// On req error callback
	// return self
	req.onError((err, status) => {
		// See the err codes bellow
	});

	// On req ended callback (whatever the final result)
	// return self
	req.onEnd((wasSuccess) => {
	});

	// Abort / cancel the request
	req.abort();
	```

* Error codes

	```javascript
	// Request has been cancelled (using the abort method)
	KnHttp.CANCELED_ERROR;

	// Network error (Server can't be reached, no internet ?)
	KnHttp.NETWORK_ERROR;

	// Http error (validateStatus callback has failed)
	KnHttp.HTTP_ERROR;

	// Unknown error (can be a bad JSON for exemple)
	KnHttp.UNKNOWN_ERROR;
	```

* Properties

	```javascript
	// Get the XMLHttpRequest of the request object
	req._xhr;

	// Return the default options object (you can update the properties)
	KnHttp.DEFAULTS;

	// Return the lib version
	KnHttp.VERSION;
	```

* Options

	```javascript
	let req = KnHttp.request('https://mysuperurl', 'POST', {
		// Request timeout in ms
		timeout = 270_000,
		// Request type (raw, json, form, formData)
		requestType = 'raw',
		// Response type (text, json, blob)
		responseType = 'json',
		// Headers object
		headers = {
			'x-custom-header': 'test'
		},
		// Forced download result of the request to the browser
		download = false,
		// Upload request with progress
		upload = false,
		// XMLHttpRequest.withCredentials
		withCredentials = false,
		// HTTP basic auth
		basicAuth = {
			username: 'username',
			password: 'password'
		},
		// Bearer token
		bearerAuthToken = '838da7ac74d22a0d5b25048632f6eb4ae4ec3c6c007613ecd83336f348f75aa7',
		// CSRF Header name
		csrfHeader = 'X-CSRF',
		// CSRF Token
		csrf = '838da7ac74d22a0d5b25048632f6eb4ae4ec3c6c007613ecd83336f348f75aa7',
		// Raw body content
		body = 'rawbodycontent';
	});
	```

### License

See the license [here](LICENSE.txt)

```
The MIT License (MIT)

Copyright (c) 2022-2025 Florent VIALATTE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
