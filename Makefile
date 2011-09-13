
TESTS = test/*.js
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY_FLAGS = --no-mangle 

all: coffee-jade.min.js coffee-jade-runtime.min.js

test:
	@./node_modules/.bin/expresso \
		-I node_modules \
		$(TESTS)

benchmark:
	@node support/benchmark

coffee-jade.js: $(SRC)
	@node support/compile.js $^

coffee-jade.min.js: coffee-jade.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
		&& du coffee-jade.min.js \
		&& du coffee-jade.js

coffee-jade-runtime.js: lib/runtime.js
	@cat support/head.js $< support/foot.js > $@

coffee-jade-runtime.min.js: coffee-jade-runtime.js
	@uglifyjs $(UGLIFY_FLAGS) $< > $@ \
	  && du coffee-jade-runtime.min.js \
	  && du coffee-jade-runtime.js

clean:
	rm -f coffee-jade.js
	rm -f coffee-jade.min.js
	rm -f coffee-jade-runtime.js
	rm -f coffee-jade-runtime.min.js

.PHONY: test benchmark clean
