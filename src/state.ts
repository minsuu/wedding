import { assert } from 'console';
import { CommandLibrary } from './commands';
import { stringToFinal, stringToInitial } from './constants';
import { zeroFrom } from './helper';

export enum GameState {
  TITLE,
  PLAY,
  WIN,
  GAMEOVER,
}

export type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

const DirectionValue: {[d in Direction]: number[]} = {
  LEFT: [0, -1],
  RIGHT: [0, 1],
  UP: [-1, 0],
  DOWN: [1, 0],
};

export interface State {
  state: GameState;
  board: GameBoard;
}

export interface GameBoard {
  N: number;
  M: number;
  elements: GameBoardElement[][];
}

export interface GameBoardElement {
  value: string;
  activated?: boolean;
}
const EmptyGameBoardElement = {
  value: ' ',
  activated: false
}

function isConsonants(s: string): boolean {
  return 'ㄱ' <= s && s <= 'ㅎ';
}

function isVowel(s: string): boolean {
  return 'ㅏ' <= s && s <= 'ㅣ';
}

function noFinalConsonants(s: string): boolean {
  // ( 자음번호 * 588 + 모음번호 * 28 + 종성번호 ) + '가'(44032)
  return (
    '가' <= s && s <= '힣' && (s.charCodeAt(0) - '가'.charCodeAt(0)) % 28 === 0
  );
}

function isCommand(s: string): boolean {
  return ('ㄱ' <= s && s <= 'ㅎ') || ('가' <= s && s <= '힣');
}

function genKorean(initial: number, middle: number, final: number) {
  return String.fromCharCode(initial * 588 + middle * 28 + final + '가'.charCodeAt(0));
}

function merge(s1: GameBoardElement, s2: GameBoardElement): GameBoardElement | boolean {
  function _mergable(s1: GameBoardElement, s2: GameBoardElement): GameBoardElement | boolean {
    if (s2 === EmptyGameBoardElement) {
      return {
        value: s1.value,
        activated: s1.activated
      };
    }
    if (isConsonants(s1.value) && isVowel(s2.value) && stringToInitial.has(s1.value)) {
      const vowelIndex = s2.value.charCodeAt(0) - 'ㅏ'.charCodeAt(0);
      return {
        value: genKorean(stringToInitial.get(s1.value)!, vowelIndex, 0),
        activated: s1.activated
      };
    }
    if (noFinalConsonants(s1.value) && isConsonants(s2.value) && stringToFinal.has(s2.value)) {
      return {
        value: String.fromCharCode(s1.value.charCodeAt(0) + stringToFinal.get(s2.value)!),
        activated: s1.activated
      }
    }
    return false;
  }
  const r1 = _mergable(s2, s1);
  return r1 === false ? _mergable(s1, s2) : r1;
}

assert(merge({value:'ㄱ'}, {value: 'ㄴ'}) === false);
const t2 = merge({value:'ㅎ'}, {value: 'ㅏ'});
assert(typeof(t2) !== 'boolean'  && t2.value === '하');

export type KeepFlags = 'wedding';
export class SingleGame {
  board: GameBoard;
  keepFlags: {[k in KeepFlags]: boolean};

  constructor(map: string[][]) {
    let elements = zeroFrom(map, EmptyGameBoardElement); 
    for (let i=0; i<map.length; i++){ 
      for (let j=0; j<map[0].length; j++){
        if (map[i][j] !== ' ') {
          elements[i][j] = {
            value: map[i][j],
            activated: !isCommand(map[i][j])
          };
        }
      }
    }
    this.keepFlags = {
      wedding: false
    };
    this.board = {
      N: map.length,
      M: map[0].length,
      elements: elements
    };
  }

  withinBoundary(i: number, j: number) {
    return 0<=i && i<this.board.N && 0<=j && j<=this.board.M;
  }

  singleCheck(dir: Direction, x: number, y:number) {
    const hist: [number, number][] = [];
    let curString = "";
    for (let l=0;l<3;l++){
      const nx = x + DirectionValue[dir as Direction][0] * l;
      const ny = y + DirectionValue[dir as Direction][1] * l;
      if (!this.withinBoundary(nx, ny) || !isCommand(this.board.elements[nx][ny].value)) {
        break;
      }
      hist.push([nx, ny]);
      curString += this.board.elements[nx][ny].value;
      if (CommandLibrary.has(curString)){
        CommandLibrary.get(curString)?.func(this);
        for (const [i, j] of hist) {
          this.board.elements[i][j].activated = true;
        }
      }
    }
  }

  checkActiveCommand() {
    this.keepFlags = {
      wedding: false
    };
    for (let i=0; i<this.board.N; i++) {
      for (let j=0; j<this.board.M; j++) {
        if (!isCommand(this.board.elements[i][j].value)) {
          continue;
        }
        this.board.elements[i][j].activated = false;
      }
    }
    for (let i=0; i<this.board.N; i++) {
      for (let j=0; j<this.board.M; j++) {
        if (!isCommand(this.board.elements[i][j].value)) {
          continue;
        }
        this.singleCheck('RIGHT', i, j);
        this.singleCheck('DOWN', i, j);
      }
    }
  }

  singleMove(dir: Direction, x: number, y: number) {
    let px = x;
    let py = y;
    let nx = x + DirectionValue[dir][0];
    let ny = y + DirectionValue[dir][1];       
    let movable = false;

    while (0 <= nx && nx < this.board.N && 0 <= ny && ny < this.board.M) {
      if (typeof(merge(this.board.elements[nx][ny], this.board.elements[px][py])) !== 'boolean') {
        movable = true;
        break;
      }
      px = nx;
      py = ny;
      nx += DirectionValue[dir][0];
      ny += DirectionValue[dir][1];       
    }

    if (!movable) return;

    while (nx != x || ny != y) {
      const merged = merge(this.board.elements[nx][ny], this.board.elements[px][py]);
      assert(typeof(merged) !== 'boolean');
      this.board.elements[nx][ny] = merged as GameBoardElement;
      this.board.elements[px][py] = EmptyGameBoardElement;
      px -= DirectionValue[dir][0];
      py -= DirectionValue[dir][1];
      nx -= DirectionValue[dir][0];
      ny -= DirectionValue[dir][1];       
    }
  }

  move(dir: Direction) {
    for (let i = 0; i < this.board.N; i++) {
      for (let j = 0; j < this.board.M; j++) {
        if (this.board.elements[i][j].value === 'm') {
          this.singleMove(dir, i, j);
          this.checkActiveCommand();
          return;
        }
      }
    }
  }
}
