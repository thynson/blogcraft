
# Blogcraft
is a simple blog system written in [node.js].

## Quick Start
Assuming you have installed node.js and npm, typing the following shell
command
```
npm install
npm start
```
to start the blog. By default `localhost:8080` will be listened, if you
want to make it accessable over Internet, you need to configure it first

## Configure Blogcraft
Blogcraft read configuration from environment variable `BLOG_CRAFT_CONFIG`,
expecting it is a valid JSON, just like what [express.js] does. You can write
a short script to make things more convinent, e.g.
```bash
export BLOG_CONFIG_CONFIG='
{
	"listenaddr" : [ 80, "0.0.0.0" ],
	"password" : "topsecret"
}'
npm start
```
*	`listenaddr`: You need need to provide an address blogcraft can listen on.
	actually the form of listen address is confirm of the [node.js] API, you
	can just write `[80]` as by default node.js will listen on `0.0.0.0`, or if
	you want to listen on a UNIX socket and serve behind a reverse proxy, write
	`[ "/path/to/unix.socket" ]`.
*	`password`: Also password is required so only you can compose a post on
	your blog.

[node.js]: http://nodejs.org
[express.js]: http://expressjs.com
