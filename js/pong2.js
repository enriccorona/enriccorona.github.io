var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/2) };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var arg_diff = 0;
var ant_prob = 0;

window.onload = function() {
  document.getElementById('canvas').appendChild(canvas);
  animate(step);
};

var step = function() {
  update();
  render();
  animate(step);
};

var update = function() {
  player.update();
  computer.update(ball);
  ball.update(player.paddle, computer.paddle);
  document.getElementById('points_computer').innerHTML = computer.points;
  document.getElementById('points_player').innerHTML = player.points;


var json = net.toJSON();
var str = JSON.stringify(json);
document.getElementById('Debugging').innerHTML = str;

};

var render = function() {
  context.fillStyle = "#FF00FF";
  context.fillRect(0, 0, width, height);
};

function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
}

Paddle.prototype.render = function() {
  context.fillStyle = "#0000FF";
  context.fillRect(this.x, this.y, this.width, this.height);
};

function Player() {
   this.paddle = new Paddle(175, 580, 50, 10);
   this.points = 0;
}

function Computer() {
  this.paddle = new Paddle(175, 10, 50, 10);
  this.points = 0;
}

Player.prototype.render = function() {
  this.paddle.render();
};

Computer.prototype.render = function() {
  this.paddle.render();
};

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3;
  this.radius = 5;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#000000";
  context.fill();
};

Ball.prototype.update = function(paddle1, paddle2) {
  this.x += this.x_speed;
  this.y += this.y_speed;

  var top_x = this.x - 5;
  var top_y = this.y - 5;
  var bottom_x = this.x + 5;
  var bottom_y = this.y + 5;

  if(this.x - 5 < 0) { // hitting the left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if(this.x + 5 > 400) { // hitting the right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }

  if(this.y < 0) { // a point was scored
    this.x_speed = 0;
    this.y_speed = 3;
    this.x = 200;
    this.y = 300;
    player.points += 1

    var x = new convnetjs.Vol([ ball.x, ball.y, ball.x_speed, ball.y_speed]);
    var prob = net.forward(x);

    // TODO!!!! UPDATE SOMEHOW WEIGHTS HERE!
    
    ant_prob.w[arg_diff] = -100
    var stats = trainer.train(x, ant_prob); //[ant_prob.w[0], ant_prob.w[1], ant_prob.w[2]]);

  } 
  if(this.y > 600) {
    this.x_speed = 0;
    this.y_speed = 3;
    this.x = 200;
    this.y = 300;
    computer.points += 1
  }

  if(top_y > 300) {
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
      // hit the player's paddle
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed / 2);
      this.y += this.y_speed;
    }
  } else {
    if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
      // hit the computer's paddle
      this.y_speed = 3;
      this.x_speed += (paddle2.x_speed / 2);
      this.y += this.y_speed;
    var x = new convnetjs.Vol([ ball.x, ball.y, ball.x_speed, ball.y_speed]);
    var prob = net.forward(x);

    // TODO!!!! UPDATE SOMEHOW WEIGHTS HERE!

    ant_prob.w[arg_diff] = 100
    var stats = trainer.train(x, ant_prob); //[ant_prob.w[0], ant_prob.w[1], ant_prob.w[2]]);


    }
  }
};

var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);

var render = function() {
  context.fillStyle = "#FF00FF";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

var keysDown = {};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});

Player.prototype.update = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) { // left arrow
      this.paddle.move(-4, 0);
    } else if (value == 39) { // right arrow
      this.paddle.move(4, 0);
    } else {
      this.paddle.move(0, 0);
    }
  }
};

Paddle.prototype.move = function(x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.x < 0) { // all the way to the left
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > 400) { // all the way to the right
    this.x = 400 - this.width;
    this.x_speed = 0;
  }
}

Computer.prototype.update = function(ball) {
  var x_pos = ball.x;
  var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
  var rd = Math.random();

var x = new convnetjs.Vol([ ball.x, ball.y, ball.x_speed, ball.y_speed]);
var prob = net.forward(x);
ant_prob = prob;

  if(prob.w[0]>prob.w[1] && prob.w[0]>prob.w[2]){
  diff = -5;
  arg_diff = 0;
  } else if(prob.w[1]>=prob.w[0] && prob.w[1]>=prob.w[2]) {
  diff = 5;
  arg_diff = 1;
  } else {
  diff = 0;
  arg_diff = 2;
  }

  this.paddle.move(diff, 0);

  if(this.paddle.x < 0) {
    this.paddle.x = 0;
  } else if (this.paddle.x + this.paddle.width > 400) {
    this.paddle.x = 400 - this.paddle.width;
  }
};



var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:4});   
layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});   
layer_defs.push({type:'regression', num_neurons:3}); 

var net = new convnetjs.Net();
net.makeLayers(layer_defs);

var trainer = new convnetjs.Trainer(net, {method: 'adadelta', l2_decay: 0.001,
                                    batch_size: 1});

