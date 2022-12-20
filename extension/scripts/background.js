let port = chrome.runtime.connectNative('native.messaging.example')

port.onMessage.addListener((req) => {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message)
  }
  handleMessage(req)
})

port.onDisconnect.addListener(() => {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message)
  }
  console.log(' -- Disconnected -- attempt reconnect')
  port = chrome.runtime.connectNative('native.messaging.example')
})

port.postMessage({message: 'ping', body: 'helo'})

let message_count = 0
let interval = 1000

function handleMessage (req) {

  message_count++
}

setInterval(summary, interval)

function summary(){
  console.log(`messages received in last ${interval}ms = ${message_count}`)
  message_count = 0
}