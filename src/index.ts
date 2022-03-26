import * as PIXI from 'pixi.js';
import {SingleGame} from './state';

//Aliases
const Application = PIXI.Application,
  Container = PIXI.Container,
  resources = PIXI.Loader.shared.resources,
  Texture = PIXI.Texture,
  Sprite = PIXI.Sprite,
  AnimatedSprite = PIXI.AnimatedSprite,
  Rectangle = PIXI.Rectangle;


const animated = "결mg"

const boardInString = [
  '           ',
  '           ',
  '           ',
  '    겨혼합니다  ',
  '   mㄹ   g  ',
  '           ',
  '           ',
].map((s) => s.split(''));

const game = new SingleGame(boardInString);

//Create a Pixi Application
const app = new PIXI.Application({
  width: 800,
  height: 450,
  antialias: false,
  resolution: devicePixelRatio,
});
const container = document.querySelector('.container');
if (container !== null) {
  container.appendChild(app.view);
}

const loader = PIXI.Loader.shared;
//load an image and run the `setup` function when it's done
loader.add('sprite', 'spritesheet.json').load(setup);

let screen: PIXI.AnimatedSprite[][] = [];

function setup() {
  //Create the `tileset` sprite from the texture
  for (let i = 0; i < game.board.N; i++) {
    let newSpriteRow: PIXI.AnimatedSprite[] = [];
    for (let j = 0; j < game.board.M; j++) {
      const element =
        game.board.elements[i][j].value === ' ' ? 'Z' : game.board.elements[i][j].value;
      
      let textures;
      if (animated.includes(element)) {
        textures = [PIXI.Texture.from(`${element}0.gif`), PIXI.Texture.from(`${element}1.gif`), PIXI.Texture.from(`${element}2.gif`)]
      } else {
        textures = [PIXI.Texture.from(`${element}.gif`)];
      }
      const elementSprite = new PIXI.AnimatedSprite(textures);
      elementSprite.x = j * 48;
      elementSprite.y = i * 48;
      elementSprite.animationSpeed = 0.05;
      if (!game.board.elements[i][j].activated) {
        elementSprite.alpha = 0.5;
      }
      elementSprite.play();
      newSpriteRow.push(elementSprite);
      app.stage.addChild(elementSprite);
    }
    screen.push(newSpriteRow);
  }

  const left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40);

  left.press = function () {
    game.move('LEFT');
    update();
  };

  right.press = function () {
    game.move('RIGHT');
    update();
  };

  up.press = function () {
    game.move('UP');
    update();
  };

  down.press = function () {
    game.move('DOWN');
    update();
  };

  //Start the game loop
  // app.ticker.add(delta => gameLoop(delta));
  app.start();
}

function glitterEffect() {
  let textures = [];
  for (let i=0; i<12; i++) {
    const texture = PIXI.Texture.from(`glitter${i}.gif`);
    if (texture !== undefined) {
      textures.push(texture);
    }
  }
  const sprite = new PIXI.AnimatedSprite(textures);
  sprite.animationSpeed = 0.15;
  return sprite;
}

let removeEffect: PIXI.AnimatedSprite[] = [];

function update() {
  for (let effect of removeEffect){
    app.stage.removeChild(effect);
  }
  removeEffect = [];
  for (let i = 0; i < game.board.N; i++) {
    for (let j = 0; j < game.board.M; j++) {
      const element =
        game.board.elements[i][j].value === ' ' ? 'Z' : game.board.elements[i][j].value;
      let textures;
      if (animated.includes(element)) {
        textures = [PIXI.Texture.from(`${element}0.gif`), PIXI.Texture.from(`${element}1.gif`), PIXI.Texture.from(`${element}2.gif`)]
      } else {
        textures = [PIXI.Texture.from(`${element}.gif`)];
      }
      if (!game.board.elements[i][j].activated) {
        screen[i][j].alpha = 0.5;
      } else {
        screen[i][j].alpha = 1;
      }
      if (game.keepFlags.wedding && element === 'g') {
        const sprite = glitterEffect();
        sprite.x = screen[i][j].x;
        sprite.y = screen[i][j].y;
        sprite.play();
        app.stage.addChild(sprite);
        removeEffect.push(sprite); 
      }
      screen[i][j].textures = textures;
      screen[i][j].gotoAndPlay(screen[i][j].currentFrame);
    }
  }
}

//The `keyboard` helper function
function keyboard(keyCode) {
  const key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) {
        key.press();
      }
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) {
        key.release();
      }
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener('keydown', key.downHandler.bind(key), false);
  window.addEventListener('keyup', key.upHandler.bind(key), false);
  return key;
}
