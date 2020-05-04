
const socket = io()

socket.on('message', (message) => {
    console.log(message)
})
// socket.on('countUpdated', (count) => {
//     console.log(`The count has been updated! ${count}`)
// })

// document.querySelector('#increment').addEventListener('click' ,() => {
//     console.log('clicked')
//     socket.emit('increment')
// })

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()
    // const messaage = document.querySelector('input').value
    const messaage = e.target.elements.message.value
    socket.emit('sendMessage',messaage)
})