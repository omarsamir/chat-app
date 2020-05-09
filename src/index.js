const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

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
    socket.on('join', (options, callback) => {
        const {error, user} = addUser({id:socket.id, ...options})
debugger
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome'))
        // send to all except this socket
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${options.username} has joined`))
        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit : emit event to everybody in specific room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message, callback) => {
        const filter = new Filter()
       
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        const user = getUser(socket.id)
        io.emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('shareLocation', (position,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`http://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })
    // socket.emit("countUpdated",count)

    // socket.on('increment', () => {
    //     count++
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count) // to change immidiately
    // })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }else{
            console.log('NOT EMIT DISCONNECT')
        }
    })
})

server.listen(port,() => {
    console.log(`Server is up on port ${port}`)
})