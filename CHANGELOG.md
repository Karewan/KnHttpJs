KnHttpJS Changelog
==========

v3.0.0 (2025-03-02):
----------------------------
### Breaking changes
* onSuccess parameters replaced by one Response object
* onError parameters replaced by one Error object

v2.0.1 (2025-01-22):
----------------------------
* Published as npm package
* Added types
* Added wasSuccess param to the onEnd callback
* Commented out all the console.log
* Replaced gulp by rollup

v1.0.8 (2024-05-05):
----------------------------
* Added HTTT PUT methods
* Added a proper DocBlock for all methods

v1.0.7 (2023-12-23):
----------------------------
* Use Object.assign to set default options

v1.0.6 (2023-12-16):
----------------------------
* Replace the fake Deferred class by a true javascript class

v1.0.5 (2023-09-22):
----------------------------
* Do not abort/cancel an already ended request

v1.0.4 (2023-09-18):
----------------------------
* Add URL decoding of file name in download function

v1.0.3 (2023-06-11):
----------------------------
* Fixed body serialization when an array contains objects, keys were not correctly set

v1.0.2 (2023-06-09):
----------------------------
* Download: If no header attachment, remove the query string and hash at the end of the URL to get the correct file name

v1.0.1 (2023-01-07):
----------------------------
* Generates an error if responseType JSON and no JSON in response

v1.0.0 (2022-12-08):
----------------------------
* Initial release
