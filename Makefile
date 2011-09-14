
TESTS = test/*.js
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

all: coffeejade.min.js coffeejade-runtime.min.js

test:
	@./node_modules/.bin/expresso \
		-I node_modules \
		$(TESTS)

benchmark:
	@node support/benchmark

coffeejade.js: $(SRC)
	@node support/compile.js $^

coffeejade.min.js: coffeejade.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du coffeejade.min.js \
		&& du coffeejade.js

coffeejade-runtime.js: lib/runtime.js
	@cat support/head.js $< support/foot.js > $@

coffeejade-runtime.min.js: coffeejade-runtime.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
	  && du coffeejade-runtime.min.js \
	  && du coffeejade-runtime.js

clean:
	rm -f coffeejade.js
	rm -f coffeejade.min.js
	rm -f coffeejade-runtime.js
	rm -f coffeejade-runtime.min.js

.PHONY: test benchmark clean
