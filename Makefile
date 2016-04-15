all: microify minify clean

build:
	@node tasks/build

microify:
	INPUT_FILE=micro.js FAST_URL=https://fast.trychameleon.com ACCOUNT_TOKEN=account-1845 TARGET_FILE=index.js $(MAKE) build

minify:
	./node_modules/uglify-js/bin/uglifyjs index.js --compress --mangle --stats --output index.min.js

deploy:
	@node tasks/deploy

clean:
	if [ -e index.js ]; then rm index.js; fi

spec:
	if [ -e ./node_modules/.bin/minijasminenode2 ]; then ./node_modules/.bin/minijasminenode2 --verbose --forceexit **/*_spec.js; else printf "\nMini Jasmine not installed @ ./node_modules/.bin/minijasminenode2...\n\nTrying npm install\n\n" && npm install; fi;

test: microify spec clean

.PHONY: spec
.PHONY: test
.PHONY: microify
.PHONY: publish
