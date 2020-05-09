
const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
// ignoreQueryPrefix to ensure that '?' goes away.
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessagesMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessagesMargin

    console.log(newMessageStyles)

    // Visablehight
    const visableHeight = $messages.offsetHeight
    
    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visableHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(`${message.url} LOOOL`)
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
// socket.on('countUpdated', (count) => {
//     console.log(`The count has been updated! ${count}`)
// })

// document.querySelector('#increment').addEventListener('click' ,() => {
//     console.log('clicked')
//     socket.emit('increment')
// })

socket.on('roomData', ({room, users}) => {
   const html = Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})


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


socket.emit('join', {username, room},(error) =>{
    if(error) {
        alert(error)
        location.href = '/'
    }
})