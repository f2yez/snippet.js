Micro Snippet:
 - Sets up chmln variable on window
 - Adds setup, identify, alias, track, set, show, on, off, custom, help and _data function placeholders
 - Downloads Messo Snippet
 - Can be included directly or via Segment.com

Messo Snippet:
 - Cached for 2 minutes
 - When an admin publishes content to their users, a new version of this file is uploaded
   - The uploaded file contains the :habitat_token embedded.

 - It downloads - chmln/index.min.js
   - Cached for 5 minutes

 - if not logging in and are not already logged in
   - It downloads - :account_token/:habitat_token/habitat.min.js
     - Cached forever (the habitat token is stable for a single 'version' of the dataset)
     - Downloads the published versions of data from edit.trychameleon.com
 - else if logging in
   - It downloads - login/:session_token.min.js which sets an authentication cookie

 - if editing
   - It downloads - editor/index.min.js
     - Cached for 5 minutes
     - The JS needed to present the sidebar editing interface
     - The JS needed to store additions, updates and deletions of data
   - It downloads - :account_token/ecosystem.min.js
     - Never cached
     - Authenticated as the admin user via cookie
     - Contains data from edit.trychameleon.com
