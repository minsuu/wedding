export function zeroFrom<T, V>(array: T[][], v: V): V[][] {
    let newBoard: V[][] = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
      let newRow: V[] = new Array(array[0].length);
      for (let j = 0; j < array[0].length; j++) {
        newRow[j] = v;
      }
      newBoard[i] = newRow;
    }
    return newBoard;
}