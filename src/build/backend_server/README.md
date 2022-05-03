## Data Server

server.ts is built with esbuild, run the build file with `node server.esbuild.js` after esbuild runs. See package.json for the launch sequence.

Use `server_settings.js` to configure protocol, host, port, mongodb, etc.

Add a .key file to use some preset env values to hook in mongodb with your private URI information, otherwise mongodb defaults to localhost, which you can set the port for with settings.localdbport if you reconfigure that, by default mongoose goes to port 27017. 
- set `settings.db:` to undefined (or another falsey value) to not initiate mongoose
- use `MONGODB=mongodb+srv://...` for production server key, set `settings.db:` to `production`
- use `TESTDB=mongodb+srv://...` for a test server key, set `settings.db` to `dev` (defaults to MONGODB otherwise)
- to run a `local` db server, e.g. run `mongod.exe --dbpath c:\data\db` in a terminal first to initiate a mongodb server