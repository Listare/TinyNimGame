import { Component } from '@angular/core';

function resize<T>(arr: T[], len: number, defaultValue: () => T): void {
  if (arr.length > len)
    for (let i = arr.length; i > len; i--)
      arr.pop();
  else if (arr.length < len)
    for (let i = arr.length; i < len; i++)
      arr.push(defaultValue());
}

function highbit(val: number): number { // 较小的数字可以使用
  let result: number = 0;
  while (val != 0) {
    val >>= 1;
    result++;
  }
  return result;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private _stackCount: number = 2;
  get stackCount(): number {
    return this._stackCount;
  }
  set stackCount(val: number) {
    this._stackCount = val;
    resize(this.stoneCount, val, () => 1);
  }
  stoneCount: number[] = [2, 2];
  isPvp: boolean = false;
  gameRunning: boolean = false;
  gameEnded: boolean = false;

  stoneRange: number[] = [];
  curStoneCount: number[] = [];
  isStoneSelected: boolean[][] = [];
  selectedStack: number = -1;
  selectCount: number = 0;
  isFirstPlayerTurn: boolean = true;
  hideCircle: boolean = false;

  start(): void {
    let maxStoneCount = 0;
    for (let i of this.stoneCount)
      if (i > maxStoneCount)
        maxStoneCount = i;
    this.stoneRange = Array.from(Array(maxStoneCount).keys()).reverse();
    this.curStoneCount = Array.from(this.stoneCount);
    this.isStoneSelected = this.stoneCount.map(x => Array(x).fill(false));
    this.isFirstPlayerTurn = true;
    this.selectedStack = -1;
    this.selectCount = 0;
    this.gameRunning = true;
    this.gameEnded = false;
    this.hideCircle = false;
  }

  selectStone(row: number, column: number): void {
    if (!this.isPvp && !this.isFirstPlayerTurn)
      return;
    if (this.selectedStack != -1 && column != this.selectedStack)
      return;
    this.isStoneSelected[column][row] = !this.isStoneSelected[column][row];
    if (this.isStoneSelected[column][row]) {
      if (this.selectCount == 0)
        this.selectedStack = column;
      this.selectCount++;
    }
    else {
      this.selectCount--;
      if (this.selectCount == 0)
        this.selectedStack = -1;
    }
  }

  nextStep(): void {
    if (this.selectCount == 0)
      return;
    if (this.isGameEnd()) {
      this.gameEnded = true;
      return;
    }
    this.hideCircle = true;
    setTimeout(() => {
      this.processChange();
      this.hideCircle = false;
      this.isFirstPlayerTurn = !this.isFirstPlayerTurn;
      if (!this.isFirstPlayerTurn && !this.isPvp)
        this.calculate();
    })
  }

  private isGameEnd(): boolean {
    for (let i of this.isStoneSelected)
      for (let j of i)
        if (!j)
          return false;
    return true;
  }

  private processChange(): void {
    for (let i = 0; i < this.stackCount; i++) {
      let toRemove: number = 0;
      for (let j of this.isStoneSelected[i])
        if (j)
          toRemove++;
      this.curStoneCount[i] -= toRemove;
    }
    let maxStoneCount = 0;
    for (let i of this.curStoneCount)
      if (i > maxStoneCount)
        maxStoneCount = i;
    this.stoneRange = Array.from(Array(maxStoneCount).keys()).reverse();
    this.isStoneSelected = this.curStoneCount.map(x => Array(x).fill(false));
    this.selectedStack = -1;
    this.selectCount = 0;
  }

  private calculate(): void {
    let result: number = 0;
    for (let i of this.curStoneCount)
      result ^= i;
    if (result == 0) { // 必败状态，随便拿
      let targetStack: number = Math.floor(Math.random() * this.stackCount);
      while (this.curStoneCount[targetStack] == 0)
        targetStack = Math.floor(Math.random() * this.stackCount);
      result = Math.floor(Math.random() * this.curStoneCount[targetStack]) + 1;
    }
    else {
      for (let i = 0 ;i < this.stackCount; i++) {
        if (highbit(this.curStoneCount[i]) == highbit(result)) {
          result = this.curStoneCount[i] - (this.curStoneCount[i] ^ result);
          break;
        }
      }
    }

    this.selectCount = result;
    for (let i = 0; i < this.stackCount; i++) {
      if (this.curStoneCount[i] >= result) {
        for (let j = 0; j < result; j++)
          this.isStoneSelected[i][this.curStoneCount[i] - j - 1] = true;
        break;
      }
    }
    setTimeout(() => {
      this.nextStep();
    }, 1000);
  }
}
