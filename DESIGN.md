Micro Snippet:
 - sets up chmln variable on window
 - adds setup, alias, track, set, show, custom, _data function placeholders
 - downloads Messo Snippet
 - can be included directly or via Segment.com

Messo Snippet:
 - download - chmln/index.min.js

 - if not logging in and are not already logged in
   - download - habitat/:account_token/:habitat_token.min.js => downloads data from edit.trychameleon.com
 - else if logging in
   - download - login/:session_token.min.js

 - if editing
   - downloads - editor/index.min.js
   - downloads - ecosystem.min.js (sent with header) => downloads data from edit.trychameleon.com
