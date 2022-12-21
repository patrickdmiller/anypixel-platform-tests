#!/usr/local/bin/node

// Might be good to use an explicit path to node on the shebang line
// in case it isn't in PATH when launched by Chrome

const sendMessage = require('./protocol')(handleMessage)
let runner = null
let buttons = new Array(6000).fill(0)
let pixelMessageCount = 0;
function handleMessage (req) {
  if(req && req.destination == 'wall'){
    if(req.type && req.type == 'pixel'){
      pixelMessageCount++;
    }
    if(req.type == 'command'){
      switch(req.command){
        case 'start_test_button':
          startButtonTest()
          break;
        case 'stop_test_button':
          stopButtonTest()
          break;
      }
    }
  }
  if (req.message === 'ping') {
    sendMessage({message: 'pong', body: `server : ${req.body}`})
  }
}

function sendSummary(){
  sendMessage({
    destination:'background',
    type:'stats',
    pixelFrameCount:pixelMessageCount,
    time:1
  })
  pixelMessageCount = 0
}

function sendButtonData(){
  for(let i =0; i < 10; i++){
    let which_button = getRandomInt(0, buttons.length)
    buttons[which_button]+=-1
    buttons[which_button]*=-1
  }
  sendMessage({
    destination:'render',
    type:'button',
    data:buttons
  })
}

function startButtonTest({fps = 60}={}){
  if(runner !== null){
    console.error("button test already running")
  }else{
    // runner = setInterval(sendButtonData)
    runner = setInterval(sendButtonData, (1000/fps))
  }
}

function stopButtonTest(){
  // console.log("stopping button test")
  clearInterval(runner)
  runner = null
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

setInterval(sendSummary, 1000)

