const ports = {wall:null, render:null}

function connectNative(){
  ports.wall = chrome.runtime.connectNative('native.messaging.example')
  ports.wall.onMessage.addListener((req) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
    }
    messageHandler({msg:req, sender:'wall'})
  })
  ports.wall.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
    }
    console.log(' -- wall Disconnected -- attempt reconnect')
    connectNative()
  })
  
}

connectNative()


chrome.runtime.onConnect.addListener(function(cport) {
  ports.render = cport
  ports.render.onMessage.addListener(function(msg) {
    messageHandler({msg, sender:'render'})
  });
});



let message_count = 0
let interval = 1000

function messageHandler({msg=null, sender=null}={}){
  if(msg && msg.destination){
    //need to forward
    switch(msg.destination){
      case 'background':
        console.log("message to -> background", msg)
        if(msg.type && msg.type == 'stats'){
          forwardMsg({...msg, destination:'render'}, 'wall')
        }
        break
      default:
        forwardMsg(msg, sender)
    }
  }
}
function summary(){
  console.log(`messages received in last ${interval}ms = ${message_count}`)
  message_count = 0
}

function forwardMsg(msg, sender){
  if(!msg || !msg.destination){
    console.error("no destination to forward", msg)
    return
  }

  if(!(msg.destination in ports)){
    console.error("invalid destination", msg.destination)
    return;
  }

  if(ports[msg.destination] === null){
    console.warn("port disconnected", msg.destination)
    return;
  }
  if(msg.destination == 'wall' && msg.type == 'command'){
    console.log(msg)
  }
  msg.sender = sender
  ports[msg.destination].postMessage(msg)
}


chrome.runtime.onConnectExternal.addListener(function(cport) {
  console.assert(cport.name === "knockknock");
  cport.onMessage.addListener(function(msg) {
    console.log("in bg", msg)
    if (msg.joke === "Knock knock")
      cport.postMessage({question: "Who's there?"});
    else if (msg.answer === "Madame")
      cport.postMessage({question: "Madame who?"});
    else if (msg.answer === "Madame... Bovary")
      cport.postMessage({question: "I don't get it."});
    else{
      cport.postMessage({stuff:"hi"})
    }
  });
});

let  id = chrome.runtime.id;
chrome.action.onClicked.addListener((tab)=>{
  chrome.tabs.query({active: true, currentWindow:true}, (tabs)=>{
    let tab = tabs[0];
    chrome.tabs.update(tab.id, {url: 'chrome-extension://'+id+'/app.html'})
  })
})