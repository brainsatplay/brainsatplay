export const settings = {
    debug:false, //print debug messages?
    protocol:'http', //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
    host: 'localhost', //'localhost' or '127.0.0.1' etc.
    port: 4000, //e.g. port 80, 443, 8000
    mongodbmode: '',//"dev", //local, dev, production, or undefined/false/null/0 for no mongoose
    localdbport:27017, //mongodb localhost port
    localdb:'testing', //a mongodb database added onto the end of our localdb uri e.g. localhost/test
    key: './.key' //key file location, use MONGODB to set your private URI, do not share this!
}

//exports.settings = settings;