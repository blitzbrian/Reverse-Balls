let music;
let gameMillis;
let record;
let logo;
let jump;
let screen;
let hit;
let won = null;
let players = 2;
let menu;
let started;
let player;
let player2;
let pins;
let pinImage;
let playerImages;
let player2Images;
let coinImage;

function preload() {
  music = loadSound('music.mp3');
  jump = loadSound('jump.wav');
  screen = loadSound('screen.wav');
  hit = loadSound('hit.wav');
  logo = loadImage('logo_0.png')
  pinImage = loadImage('pin.png');
  playerImages = {idle: loadImage('player.png'), left: loadImage('player_left.png'), right: loadImage('player_right.png')};
  player2Images = {idle: loadImage('player2.png'), left: loadImage('player2_left.png'), right: loadImage('player2_right.png')};
  coinImage = loadImage('jump.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noSmooth();
    music.loop();
    started = false;
    menu = new Menu();
    record = getItem('record');
    if(!record) record = 0;
}

function draw() {
    background(200);
    menu.show();
    if(started) {
      if(millis() - gameMillis > record && players == 1) {
        record = millis() - gameMillis;
        storeItem('record', record);
      }; 
      if(player.pos.y > height) {
        menu.open = true;
        started = false;
        if(players == 2) won = 'Player 2';
        screen.play();
        music.loop();
      };
      if(player2.pos.y > height) {
        menu.open = true;
        started = false;
        won = 'Player 1';
        screen.play();
        music.loop();
      };
      player.update();
      if(players == 2) player2.update();
      imageMode(CENTER);
      switch(player.animation) {
        case 'idle':
          image(playerImages.idle, player.pos.x, player.pos.y, 50, 50);
          break;
        case 'left':
          image(playerImages.left, player.pos.x, player.pos.y, 50, 50);
          break;
        case 'right':
          image(playerImages.right, player.pos.x, player.pos.y, 50, 50);
          break;
        }
      if(players == 2) switch(player2.animation) {
        case 'idle':
          image(player2Images.idle, player2.pos.x, player2.pos.y, 50, 50);
          break;
        case 'left':
          image(player2Images.left, player2.pos.x, player2.pos.y, 50, 50);
          break;
        case 'right':
          image(player2Images.right, player2.pos.x, player2.pos.y, 50, 50);
          break;
        }
      player.animation = 'idle';
      player2.animation = 'idle';
      if(keyIsDown(LEFT_ARROW)) {
        player.pos.x-=3;
        player.animation = 'left';
      };
      if(players == 2 && keyIsDown(65)) {
        player2.pos.x-=3;
        player2.animation = 'left';
      };
      if(keyIsDown(RIGHT_ARROW)) {
        player.pos.x+=3;
        player.animation = 'right';
      };
      if(players == 2 && keyIsDown(68)) {
        player2.pos.x+=3;
        player2.animation = 'right';
      };
      if(keyIsDown(UP_ARROW) && player.jump) {
        player.jump = false;
        player.pos.y -= 40;
        jump.play();
      }
      if(players == 2 && keyIsDown(87) && player2.jump) {
        player2.jump = false;
        player2.pos.y -= 40;
        jump.play();
      }
      pins.forEach(pin => {
        pin.update();
        pin.show();
      });
      textSize(20);
      stroke(0);
      fill(0);
      if(players == 1) text(Math.floor((millis() - gameMillis) / 1000) + ' seconds.', width/2, 20);
    }
}

function keyPressed() {
  userStartAudio();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Pin {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.touched = millis();
  }

  show() {
    imageMode(CENTER);
    image(pinImage, this.pos.x, this.pos.y, 30, 30);
  }

  update() {
    if(dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) <= 40) {
      let between = p5.Vector.sub(player.pos, this.pos);
      player.vel.add(between);
      if(millis() - this.touched > 500)  {
        hit.play();
        this.touched = millis();
      };
    }
    if(players == 2 && dist(this.pos.x, this.pos.y, player2.pos.x, player2.pos.y) <= 40) {
      let between = p5.Vector.sub(player2.pos, this.pos);
      player2.vel.add(between);
      if(millis() - this.touched > 500)  {
        hit.play();
        this.touched = millis();
      };
    }
  }
}

class Player {
  constructor() {
    this.pos = createVector(random(width), 50);
    this.vel = createVector();
    this.jump = false;
    this.animation = 'idle';
  }

  update() {
    this.vel.limit(3);
    this.pos.add(this.vel);
    this.vel.y += 0.1;
  }
}

class Coin {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.collected = false;
  }

  show() {
    if(!this.collected) {
      imageMode(CENTER);
      image(coinImage, this.pos.x, this.pos.y, 30, 30)
    }
  }

  update() {
    if(!this.collected && dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) <= 40) {
      this.collected = true;
      player.jump = true;
      pins.push(new Pin(this.pos.x, this.pos.y));
    }
    if(players == 2 && !this.collected && dist(this.pos.x, this.pos.y, player2.pos.x, player2.pos.y) <= 40) {
      this.collected = true;
      player2.jump = true;
      pins.push(new Pin(this.pos.x, this.pos.y));
    }
  }
}

class Menu {
  constructor() {
    this.open = true;
  }

  show() {
    if(this.open) {
      background(0, 100, 200);
      imageMode(CENTER);
      image(logo, width/2, height/2, height, height)
      textAlign(CENTER, CENTER);
      textSize(20);
      stroke(255);
      fill(255);
      if(won && players == 2) text(won + ' has won.', width/2, 60);
      if(players == 1) text(Math.floor(record/1000) + ' is your record of seconds living.', width/2, 60);
      text('Press Space to start.', width/2, height/2);
      text('Player 1', 85, height/2 - 100);
      text('Player 2', 85, height/1.2 - 100);
      text(players + ' player(s)', 50, 50 + 30);
      textSize(15)
      text('Press 1 or 2 to switch players modes.', 130, 130);
      rectMode(CENTER);
      noFill();
      rect(50, height/2, 50, 30);
      rect(120, height/2, 50, 30);
      rect(85, height/2 - 40, 50, 30);
      fill(255)
      text('<-', 50, height/2);
      text('->', 120, height/2);
      text('Left and Right', 80, height/2 + 30);
      text('Powerup', 80, height/2 - 100 + 30);
      textSize(30)
      text('^', 85, height/2 - 40);
      textSize(15)
      text('|', 85, height/2 - 40);
      stroke(255);
      noFill();
      rect(50, height/1.2, 50, 30);
      rect(120, height/1.2, 50, 30);
      rect(85, height/1.2 - 40, 50, 30);
      fill(255)
      text('A', 50, height/1.2);
      text('D', 120, height/1.2);
      text('Left and Right', 80, height/1.2 + 30);
      text('Powerup', 80, height/1.2 - 100 + 30);
      text('W', 85, height/1.2 - 40);
      textAlign(RIGHT, CENTER);
      text('Reverse Ball is pinball but reversed.\nIf you lose, you win.\nYou can also control the ball.\nThe game has a one player mode, (For records)\nAnd a two player mode. (Racing)', width - 10, height/2)
      if(keyIsDown(49)) players = 1;
      if(keyIsDown(50)) players = 2;
      if(keyIsDown(32)) {
        music.stop();
        gameMillis = millis();
        won = null;
        this.open = false;
        started = true;
        player = new Player();
        player2 = new Player();
        pins = [];
        let even = false;
        for(let i = 0; i < Math.floor(height/100); i++) {
          for(let j = 0; j < Math.floor(width/100); j++) {
            let coin = random(1) < 0.05;
            if(!coin) if(even) pins.push(new Pin(j * 100 + 100, i * 100 + 50)); else pins.push(new Pin(j * 100 + 50, i * 100 + 50));
            if(coin) if(even) pins.push(new Coin(j * 100 + 100, i * 100 + 50)); else pins.push(new Coin(j * 100 + 50, i * 100 + 50));
          }
          even = !even;
        }
      }
    }
  }
}