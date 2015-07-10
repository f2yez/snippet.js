# snippet.js

[![Circle CI](https://circleci.com/gh/trychameleon/snippet.js.svg?style=svg)](https://circleci.com/gh/trychameleon/snippet.js)
[![npm version](https://badge.fury.io/js/snippet.js.svg)](http://badge.fury.io/js/snippet.js)

#Getting started

###Use it

1. Copy index.min.js
1. Replace {{ACCOUNT_ID}} with your account id from the Chameleon dashboard.
1. Include it on all HTML pages (before the closing `</head>` tag)
1. Include it *only* in production
1. For all private pages, call `chmln.setup({uid: '{{The user's unique identifier}}', email: '{{email}}')`
1. Deploy the app
