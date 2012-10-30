
.PHONY: init clean start make-css

all: make-css


init:
	git submodule init
	git submodule update
	npm install

make-css: static/css/style.css

static/css/style.css: less/style.less
	lessc $< > $@

start: init make-css
	npm start

clean:
	find . | grep 'npm-debug.log' | xargs -n1 rm
