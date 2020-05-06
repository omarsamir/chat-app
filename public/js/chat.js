
const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message
    })
    $messages.insertAdjacentHTML('beforeend',html)
})
// socket.on('countUpdated', (count) => {
//     console.log(`The count has been updated! ${count}`)
// })

// document.querySelector('#increment').addEventListener('click' ,() => {
//     console.log('clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')


    // const messaage = document.querySelector('input').value
    const messaage = e.target.elements.message.value
    socket.emit('sendMessage',messaage, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
            
        } 
        console.log('The message was delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser')
    }



    

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('shareLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared excellent !')
        })
    })
})