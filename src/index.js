const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)

//server supports websokets 
const io = socketio(server)

const port  = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))

// let count = 0

// server (emit) -> client (recieve) - countUpdated
// client (emit) -> server (recieve) - increment
io.on('connection', (socket) => {
    console.log('New WebSoket connection')

    io.emit('message', 'Welcome')

    // send to all except this socket
    socket.broadcast.emit('message','A new user has joined')

    socket.on('sendMessage',(message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.emit('message',message)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message','User A left')
    })

    socket.on('shareLocation', (position,callback) => {
        io.emit('message',`http://google.com/maps?q=${position.latitude},${position.longitude}`)
        callback()
    })
    // socket.emit("countUpdated",count)

    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count) // to change immidiately
    // })
})

server.listen(port,() => {
    console.log(`Server is up on port ${port}`)
})