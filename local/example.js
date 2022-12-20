#!/usr/local/bin/node

// Might be good to use an explicit path to node on the shebang line
// in case it isn't in PATH when launched by Chrome

const sendMessage = require('./protocol')(handleMessage)
const messageSizeBytes = 6000 * 4
let message = ''
for(let i = 0 ; i < messageSizeBytes; i++){
  message+='a'
}

function handleMessage (req) {
  if (req.message === 'ping') {
    sendMessage({message: 'pong', body: `server : ${req.body}`})
  }
}

const sender = function(){

  sendMessage({
    message:'pixels', body: message
  })
}

//blast at 60fps
setInterval(sender, 1000/60)

