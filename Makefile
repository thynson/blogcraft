
.PHONY: init clean start make-css

all: make-css


init:
	git submodule init
	git submodule update
	npm install


start: init
	npm start

clean:
	find . | grep 'npm-debug.log' | xargs -n1 rm
