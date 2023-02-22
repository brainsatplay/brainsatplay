

export default class Connection {

    connection = null
    connection_status = false
    ip_address = 'localhost' // edit by yours
    port = '3030' // port

    queue = []

    constructor(options={}){
        Object.assign(this, options)
    }

    start = () => {
        this.connection = new WebSocket('ws://' + this.ip_address + ':' + this.port);

        this.connection.onopen = (e) => {
            this.connection_status = true;
            console.log("Connection established!");
            this.queue.forEach(this.sendMessage)
        };

        // callback messages
        this.connection.onmessage = function (e) {
            var data = JSON.parse(e.data);
            console.log(data);
        };

        // Closed window
        this.connection.onclose = function (e) {
            console.log("Connection closed!");
            this.connection_status = false;
        };

        // Error window
        this.connection.onerror = function (e) {
            console.log("Connection error!");
            this.connection_status = false;
        };

    }

    sendMessage = (data) => {
        if (this.connection_status === false) {
            this.queue.push(data);
            return
        }

        var data = JSON.stringify(data);
        this.connection.send(data);
    }

}