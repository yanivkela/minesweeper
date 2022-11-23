var gLevel = {
  SIZE: 4,
  MINES: 2,
}

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
}
var gTimeInterval
var gMines = []
var gBoard
function initGame() {
  gBoard = buildBoard(gLevel.SIZE)
  renderBoard(gBoard)
  gMines = []
  gGame.isOn = true
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.lives = 3
  document.querySelector('.lives').innerText = '❤️❤️❤️'
  elTimer = document.querySelector('.timer')
  elTimer.innerText = gGame.secsPassed
  var elSmiley = document.querySelector('.smiley')
  elSmiley.innerText = '😃'
  var elFlags = document.querySelector('.flags-left')
  elFlags.innerText = gLevel.MINES - gGame.markedCount
}

function buildBoard(size) {
  const board = []
  for (var i = 0; i < size; i++) {
    board[i] = []
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
  return board
}

function addMines(num, clickedCell) {
  gMines = getRandomCells(num, clickedCell)
  for (var i = 0; i < gMines.length; i++) {
    var loc = gMines[i]
    gBoard[loc.i][loc.j].isMine = true
  }
}

function setMinesNegsAround(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var minesAround = countNeighbours({ i: i, j: j }, board)
      board[i][j].minesAroundCount = minesAround
    }
  }
}

function renderBoard(board) {
  var strHtml = ''
  for (var i = 0; i < board.length; i++) {
    strHtml += '<tr>\n'
    for (var j = 0; j < board[i].length; j++) {
      var curCell = board[i][j]
      strHtml += `<td class="cell cell-${i}-${j}" onclick="cellClicked(this,${i},${j})" onmousedown="cellMarked(event,this,${i},${j})"></td>\n`
    }
    strHtml += '</tr>\n'
  }
  var elTable = document.querySelector('tbody')
  elTable.innerHTML = strHtml
}

function cellClicked(elCell, idx, jdx) {
  if (gMines.length === 0) {
    addMines(gLevel.MINES, { i: idx, j: jdx })
    setMinesNegsAround(gBoard)
    gTimeInterval = setInterval(() => {
      gGame.secsPassed++
      elTimer = document.querySelector('.timer')
      elTimer.innerText = gGame.secsPassed
    }, 1000)
  }
  if (!gGame.isOn) return
  var curCell = gBoard[idx][jdx]
  if (curCell.isMarked || curCell.isShown) return
  if (curCell.isMine) {
    if (gGame.lives > 0) {
      elCell.innerText = '💣'
      setTimeout(
        (elCell) => {
          elCell.innerText = ''
        },
        2000,
        elCell
      )
      gGame.lives--
      var strLives = ''
      for (var i = 0; i < gGame.lives; i++) {
        strLives += '❤️'
      }
      document.querySelector('.lives').innerText = strLives
      return
    } else {
      for (var i = 0; i < gMines.length; i++) {
        var loc = gMines[i]
        var elCell = document.querySelector(`.cell-${loc.i}-${loc.j}`)
        elCell.classList.add('shown')
        var curCell = gBoard[loc.i][loc.j]
        curCell.isShown = true
        elCell.innerText = '💣'
      }
      gGame.isOn = false
      elSmiley = document.querySelector('.smiley')
      elSmiley.innerText = '🤯'
      clearInterval(gTimeInterval)
      // gameOver()
      return
    }
  }
  if (curCell.minesAroundCount) {
    curCell.isShown = true
    gGame.shownCount++
    elCell.classList.add('shown')
    elCell.innerText = curCell.minesAroundCount
  }

  if (!curCell.minesAroundCount) {
    curCell.isShown = true
    gGame.shownCount++
    elCell.classList.add('shown')
    for (var i = idx - 1; i <= idx + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue
      for (var j = jdx - 1; j <= jdx + 1; j++) {
        if (i === idx && j === jdx) continue
        if (j < 0 || j >= gBoard[0].length) continue
        if (gBoard[i][j].isMarked) continue
        if (gBoard[i][j].isShown) continue
        gBoard[i][j].isShown = true
        gGame.shownCount++
        var elNegCell = document.querySelector(`.cell-${i}-${j}`)
        elNegCell.classList.add('shown')
        if (gBoard[i][j].minesAroundCount)
          elNegCell.innerText = gBoard[i][j].minesAroundCount
      }
    }
  }
  if (checkGameOver()) {
    gGame.isOn = false
    elSmiley = document.querySelector('.smiley')
    elSmiley.innerText = '😎'
    clearInterval(gTimeInterval)
  }
}

function cellMarked(ev, elCell, idx, jdx) {
  if (ev.button !== 2) return
  var curCell = gBoard[idx][jdx]
  if (curCell.isShown) return
  if (!curCell.isMarked) {
    curCell.isMarked = true
    elCell.innerText = '🚩'
    gGame.markedCount++
  } else {
    curCell.isMarked = false
    elCell.innerText = ''
    gGame.markedCount--
  }
  var elFlags = document.querySelector('.flags-left')
  elFlags.innerText = gLevel.MINES - gGame.markedCount
}

function checkGameOver() {
  for (var i = 0; i < gMines.length; i++) {
    var curMine = gMines[i]
    if (!gBoard[curMine.i][curMine.j].isMarked) return false
  }
  return gMines.length + gGame.shownCount === gLevel.SIZE ** 2
}

function setDifficult(difficulty) {
  switch (difficulty) {
    case 'easy':
      gLevel.SIZE = 4
      gLevel.MINES = 2
      break
    case 'medium':
      gLevel.SIZE = 8
      gLevel.MINES = 14
      break
    case 'extreme':
      gLevel.SIZE = 12
      gLevel.MINES = 32
      break
  }
  initGame()
}

function restartGame() {
  clearInterval(gTimeInterval)
  initGame()
}
