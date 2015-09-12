Done
------

1. Skip checks into localStorage when it is not available [Done in 0.9.1]
1. Allow a developer to configure the URLs that are used for scripts [Done in 1.0.0]
1. Login in the same manner that Prehensile logins happen. [Done in 1.0.3]
 - Re-use the same cookie keys `chmln-user-id` and `chmln-user-token`
1. Login should shim itself before the editor to seamlessly authenticate [Done in 1.0.3]
1. Load the all scripts synchronously when editing or logging in [Done in 1.0.1]
1. Run any cached pre-load method calls (i.e. someone calls chmln._data before the chmln script is loaded) [Done in 1.0.9 - via chmln.js]
1. Load the editor scripts synchronously only when the editor is going to be shown [Won't implement - we always load chmln.js first then editor.js and the data *]
1. Load the scripts asynchronously when the editor is minimized [Won't implement - *]

TODO
------
1. Expose the snippet version to the chmln global object
