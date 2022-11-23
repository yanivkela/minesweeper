function getTime() {
  return new Date().toString().split(' ')[4]
}

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function getNumbers(min, max) {
  var nums = []
  for (var i = min; i <= max; i++) {
    nums.push(i)
  }
  return nums
}

function createMat(ROWS, COLS) {
  const mat = []
  for (var i = 0; i < ROWS; i++) {
    const row = []
    for (var j = 0; j < COLS; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

function countNeighbours(coord, board) {
  var count = 0
  for (var i = coord.i - 1; i <= coord.i + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = coord.j - 1; j <= coord.j + 1; j++) {
      if (i === coord.i && j === coord.j) continue
      if (j < 0 || j >= board[0].length) continue
      if (board[i][j].isMine) count++
    }
  }
  return count
}

function getRandomCells(num, skip) {
  var emptyCells = []
  var returnedCells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (skip.i === i && skip.j === j) continue
      emptyCells.push({ i: i, j: j })
    }
  }
  for (var i = 0; i < num; i++) {
    var randIdx = getRandomInt(0, emptyCells.length)
    returnedCells.push(emptyCells[randIdx])
    emptyCells.splice(randIdx, 1)
  }
  return returnedCells
}

function getEmptyCell() {
  var emptyCells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].gameElement === null && gBoard[i][j].type === FLOOR) {
        emptyCells.push({ i: i, j: j })
      }
    }
  }
  var randIdx = getRandomInt(0, emptyCells.length)
  return emptyCells[randIdx]
}

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location) // cell-i-j
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

function getClassName(location) {
  const cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}
