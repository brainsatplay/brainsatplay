const os = require('os');
const ifaces = os.networkInterfaces();

let ip;
if (ifaces['Wi-Fi']) ip = ifaces['Wi-Fi'].find((x) => x.family === 'IPv4').address;
if (ip) console.log(':::LAN Server Running::: ==> http://' + ip + ':' + '1234');
