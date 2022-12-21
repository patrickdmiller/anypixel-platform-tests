let port = chrome.runtime.connect({name: "test"});
let sendPixels = false
let runner = null
let buttonMessageCount = 0

port.onMessage.addListener(function(msg) {
  if(msg && msg.type){
    switch(msg.type){
      case 'stats':
        updateStats(msg)
      case 'button':
        buttonMessageCount+=1
    }
  }
});

function generateSummary(){
  // console.log(buttonMessageCount)
  updateStats({sender:'render', buttonMessageCount})
  buttonMessageCount = 0
}
setInterval(generateSummary, 1000)


function updateStats(msg){

  let senderDiv = document.querySelector('#stats .'+msg.sender)
  if(senderDiv){
    senderDiv.innerHTML = JSON.stringify(msg)
  }else{
    console.warn("no sender div")
  }
  
}
function sendPixelData({byteLength = 6000 * 4}={}){
  if(!port || !port.postMessage){
    console.error("port is not set")
    return
  }
  port.postMessage({destination:'wall', type:'pixel', data:'x'.repeat(byteLength)})
}

function actionHandler(action){
  if(!port || !port.postMessage){
    console.error("port is not set")
    return
  }
  switch(action){
    case 'run_test_pixel':
      startPixelTest()
      break;
    case 'stop_test_pixel':
      stopPixelTest()
      break;
    case 'run_test_button':
      port.postMessage({
        type:'command',
        command:'start_test_button',
        destination:'wall'
      })
      break;
    case 'stop_test_button':
      port.postMessage({
        type:'command',
        command:'stop_test_button',
        destination:'wall'
      })
      break;
    default:
      port.postMessage({action})
  }
  
}
function startPixelTest({fps = 60}={}){
  if(runner !== null){
    console.error("pixel test already running")
  }else{
    console.log("starting pixel test.")
    // runner = setInterval(sendPixelData)
    runner = setInterval(sendPixelData, (1000/fps))
  }
}

function stopPixelTest(){
  console.log("stopping pixel test")
  clearInterval(runner)
  runner = null
}


function ready(){
  let buttons = document.querySelectorAll('.action')
  buttons.forEach((button)=>{
    button.addEventListener('click', (event)=>{
      actionHandler(button.dataset.ref)
      
    })
  })
}

document.addEventListener("DOMContentLoaded", ready);
