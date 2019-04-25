// Daniel Shiffman
// http://youtube.com/thecodingtrain
// http://codingtra.in

// Transfer Learning Feature Extractor Classification with ml5
// https://youtu.be/eeO-rWYFuG0

let mobilenet;
let classifier;
let video;
let label = 'loading model';
let leftButton;
let rightButton;
let upButton;
let downButton;
let neutralButton;
let trainButton;

var buttonHeight1; //y coordinate of buttons (1)
var buttonHeight2; //y coordinates of buttons (2)

//MQTT variables
let hostname = "mqtt.colab.duke.edu";
let port = 9001;  // used for secure websocekt (wss://) connections

function modelReady() {
  console.log('Model is ready!!!');
  // classifier.load('model.json', customModelReady);
}

// function customModelReady() {
//   console.log('Custom Model is ready!!!');
//   label = 'model ready';
//   classifier.classify(gotResults);
// }

function videoReady() {
  console.log('Video is ready!!!');
}

function createButtons(){
  var buttonHeight1 = 280;
  var buttonHeight2 = 305;

  leftButton = createButton('left');
  leftButton.position(15, buttonHeight1);
  leftButton.mousePressed(function () {
    classifier.addImage('left');
  });

  rightButton = createButton('right');
  rightButton.position(55,buttonHeight1);
  rightButton.mousePressed(function () {
    classifier.addImage('right');
  });

  upButton = createButton('up');
  upButton.position(100,buttonHeight1);
  upButton.mousePressed(function () {
    classifier.addImage('up');
  });

  downButton = createButton('down');
  downButton.position(135,buttonHeight1);
  downButton.mousePressed(function () {
    classifier.addImage('down');
  });

  neutralButton = createButton('neutral');
  neutralButton.position(185,buttonHeight1);
  neutralButton.mousePressed(function () {
    classifier.addImage('neutral');
  });

  trainButton = createButton('train');
  trainButton.position(15, buttonHeight2);
  trainButton.mousePressed(function () {
    classifier.train(whileTraining);
  });
}

function setup() {

  //createCanvas(width, height);
  createCanvas(380,600);
  video = createCapture(VIDEO);
  video.hide();
  background(255);
  mobilenet = ml5.featureExtractor('MobileNet',{ numClasses: 5 }, modelReady);
  //featureExtractor.numClasses=4;
  classifier = mobilenet.classification(video, videoReady);

  var buttonHeight1 = 280;
  var buttonHeight2 = 305;

  createButtons();

  // create mqtt connection
  client = new Paho.MQTT.Client(hostname, port, "", "clientId");
  client.onConnectionLost = onConnectionLost;
  // connect the client using SSL and trigger onConnect callback
  client.connect({
    onSuccess: onConnect,
    useSSL: true
  });

//  maze.draw();
//  saveButton = createButton('save');
//  saveButton.mousePressed(function () {
//  });

  //maze.draw();
}

function draw() {
  background(0);
  image(video, 0, 0, 380, 240);
  fill(0,255,0);
  textSize(16);
  //text(label, 10, height - 10);
  text(label, 10, 260);
  //maze.draw();

  // //maze
  // fill(20, 19, 18);
  // let x1 = 380;
  // let y1 = 0;
  // let x2 = width;
  // let y2 = height;
  // let size = 700;
  // rect(x1,y1,size,size);
  // let squareSize = size/8;
  //
  //
  // //lvl1
  // fill(0,255,0);
  // rect(x1,y1,squareSize,squareSize);
  // rect(x1,y1 + squareSize,squareSize,squareSize);
  // rect(x1,y1 + (squareSize*2),squareSize,squareSize);
  // rect(x1 + squareSize,y1 + (squareSize*2),squareSize,squareSize);
  // rect(x1 + (squareSize * 2),y1 + (squareSize*2),squareSize,squareSize);
  // rect(x1 + (squareSize * 3),y1 + (squareSize*2),squareSize,squareSize);
  // rect(x1 + (squareSize * 3),y1 + (squareSize*3),squareSize,squareSize);
  // rect(x1 + (squareSize * 3),y1 + (squareSize*4),squareSize,squareSize);
  // rect(x1 + (squareSize * 4),y1 + (squareSize*4),squareSize,squareSize);
  // rect(x1 + (squareSize * 4),y1 + (squareSize*5),squareSize,squareSize);
  // rect(x1 + (squareSize * 5),y1 + (squareSize*5),squareSize,squareSize);
  // rect(x1 + (squareSize * 6),y1 + (squareSize*5),squareSize,squareSize);
  //console.log('drawn');
}


function whileTraining(loss) {
  if (loss == null) {
    console.log('Training Complete');
    classifier.classify(gotResults);
  } else {
    label = "training";
    console.log(loss);
  }
}


function gotResults(error, result) {
  if (error) {
    console.error(error);
  } else {
    label = result;
    var messageOut = new Paho.MQTT.Message(result);
    messageOut.destinationName = "/move";
    client.send(messageOut);
    classifier.classify(gotResults);
  }
}


function onConnect() {
    // Once a connection has been made, make subscription(s).
    console.log("onConnect");
    var messageOut = new Paho.MQTT.Message("Connected");
  messageOut.destinationName = "/move";
  client.send(messageOut);
};

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0)
      console.log("onConnectionLost:"+responseObject.errorMessage);
  };
