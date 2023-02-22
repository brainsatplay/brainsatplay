import Connection from './src/Connection.js'

const connection = new Connection()
connection.start()

connection.sendMessage('test')