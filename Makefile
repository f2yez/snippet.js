all: microify devify minify clean

build:
	@node tasks/build

messoify:
	INPUT_FILE=messo.js PROTOCOL=https FAST_URL=fast.trychameleon.com TLD=com TARGET_FILE=messo.tmp.js $(MAKE) build
	@uglifyjs messo.tmp.js --compress --mangle --stats --output messo.min.js
	rm messo.tmp.js

microify:
	INPUT_FILE=micro.js PROTOCOL=https FAST_URL=fast.trychameleon.com TLD=com TARGET_FILE=index.js $(MAKE) build

devify:
	INPUT_FILE=micro.js PROTOCOL=http FAST_URL=localhost:3278 TLD=dev TARGET_FILE=index.dev.js $(MAKE) build

minify:
	@uglifyjs index.js --compress --mangle --stats --output index.min.js

release: messoify publish clean

publish:
	@node tasks/publish

clean:
	if [ -e index.js ]; then rm index.js; fi
	if [ -e messo.min.js ]; then rm messo.min.js; fi

spec:
	if [ -e ./node_modules/.bin/minijasminenode2 ]; then ./node_modules/.bin/minijasminenode2 --verbose --forceexit **/*_spec.js; else printf "\nMini Jasmine not installed @ ./node_modules/.bin/minijasminenode2...\n\nTrying npm install\n\n" && npm install; fi;

test: microify spec clean

.PHONY: spec
.PHONY: test
.PHONY: microify
.PHONY: messoify
.PHONY: devify
.PHONY: release
.PHONY: publish
