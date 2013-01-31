SRC = $(shell find src -name '*.coffee')
LIB = $(SRC:src/%.coffee=lib/%.js)
ALLLIB := $(wildcard lib/*.js)
AMD = $(ALLLIB:lib/%.js=lib/amd/%.js)

all: lib amd

lib: $(LIB)

amd: $(AMD)

watch:
	coffee -bc --watch -o lib src

lib/amd/%.js: lib/%.js
	@echo `date "+%H:%M:%S"` - AMD compiled $<
	@mkdir -p $(@D)
	@echo 'define(function(require, exports, module) {' > $@
	@cat $< >> $@
	@echo '});' >> $@

lib/%.js: src/%.coffee
	@echo `date "+%H:%M:%S"` - compiled $<
	@mkdir -p $(@D)
	@coffee -bcp $< > $@
