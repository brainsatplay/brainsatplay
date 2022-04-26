const settings = {
    protocol:'http', //'http' or 'https'
    host: 'localhost', //'localhost' or '127.0.0.1' etc.
    port: 8000, //e.g. port 80, 443, 8000
    hotreload: 5000, //hotreload websocket server port
    startpage: 'src/index.html',  //home page
    errpage: 'src/other/404.html', //error page, etc.
    sslpath:'node_server/ssl/cert.pfx'//if using https, this is required. See cert.pfx.md for instructions
}

exports.settings = settings;