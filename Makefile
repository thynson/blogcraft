
.PHONY: init clean start build

all: build


build:
	component build -o static -n blogcraft

init:
	git submodule init
	git submodule update
	npm install


start: init
	npm start

clean:
	find . | grep 'npm-debug.log' | xargs -n1 rm
