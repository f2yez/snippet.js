all: minify

minify:
	@uglifyjs index.js --compress --mangle --stats --output index.min.js

clean:
	@rm index.min.js

test:
	if [ -e ./node_modules/.bin/minijasminenode2 ]; then ./node_modules/.bin/minijasminenode2 --verbose --forceexit **/*_spec.js; else printf "\nMini Jasmine not installed @ ./node_modules/.bin/minijasminenode2...\n\nTrying npm install\n\n" && npm install; fi;
