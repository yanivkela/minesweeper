var gLevel = {
  SIZE: 4,
  MINES: 2,
}
var gGame = {}
var gTimeInterval
var gMines = []
var gBoard
var gHint = {}
var gManuallyCreateMinesLeft = 0


function initGame() {
  gBoard = buildBoard(gLevel.SIZE)
  renderBoard(gBoard)
  gMines = []
  gGame.isOn = true
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.lives = 3
  gHint.hintsLeft = 3
  gHint.isHint = false
  gHint.safeClicksLeft = 3
  document.querySelector('.safe-click span').innerText = gHint.safeClicksLeft
  document.querySelector('.best-score span').innerText = loadFromLocalStorage()
  document.querySelector('.hints').innerText = '💡💡💡'
  document.querySelector('.lives').innerText = '❤️❤️❤️'
  document.querySelector('.timer').innerText = gGame.secsPassed
  document.querySelector('.smiley').innerText = '😃'
  document.querySelector('.flags-left').innerText = gLevel.MINES - gGame.markedCount
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
      strHtml += `<td class="cell cell-${i}-${j}" onclick="cellClicked(this,${i},${j})" onmousedown="cellMarked(event,this,${i},${j})"></td>\n`
    }
    strHtml += '</tr>\n'
  }
  var elTable = document.querySelector('tbody')
  elTable.innerHTML = strHtml
}

function cellClicked(elCell, idx, jdx) {
  if (gManuallyCreateMinesLeft) {
    if (gBoard[idx][jdx].isMine) return
    gBoard[idx][jdx].isMine = true
    elCell.innerText = '💣'
    gMines.push({i:idx, j: jdx})
    gManuallyCreateMinesLeft--
    if (!gManuallyCreateMinesLeft) {
      setMinesNegsAround(gBoard)
      setTimeout(() => {
        for (var i = 0 ; i < gMines.length; i++) {
          var currMine = gMines[i]
          var elMine = document.querySelector(`.cell-${currMine.i}-${currMine.j}`)
          elMine.innerText = ''
        }
      },250)
    }
    return
  }

  if (gMines.length === 0) {
    addMines(gLevel.MINES, { i: idx, j: jdx })
    setMinesNegsAround(gBoard)
  }
  if (!gGame.isOn) return
  if (gHint.isHint) {
    showHint(idx, jdx)
    return
  }
  if (!gGame.shownCount) {
    gTimeInterval = setInterval(() => {
      gGame.secsPassed++
      elTimer = document.querySelector('.timer')
      elTimer.innerText = gGame.secsPassed
    }, 1000)
  }

  var curCell = gBoard[idx][jdx]
  if (curCell.isMarked || curCell.isShown) return
  if (curCell.isMine) {
    if (gGame.lives > 0) {
      elCell.innerText = '💣'
      setTimeout(
        (elCell,curCell) => {
          if (elCell.innerText === '💣' && !curCell.isShown) {
            elCell.innerText = ''
          }
        },
        2000,
        elCell, curCell
      )
      gGame.lives--
      var strLives = ''
      for (var i = 0; i < gGame.lives; i++) {
        strLives += '❤️'
      }
      document.querySelector('.lives').innerText = strLives
      return
    } else {
      onGameOver(false)
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
    expandShown(idx, jdx)
  }
  if (checkGameOver()) onGameOver(true)
}

function expandShown(idx, jdx) {
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
      if (gBoard[i][j].minesAroundCount) {
        elNegCell.innerText = gBoard[i][j].minesAroundCount
      }
      if (!gBoard[i][j].minesAroundCount) expandShown(i, j)
    }
  }
}

function saveToLocalStorage() {
  var strName
  switch (gLevel.SIZE) {
    case 4:
      strName = 'bestScoreEasy'
      break
    case 8:
      strName = 'bestScoreMedium'
      break
    case 12:
      strName = 'bestScoreExtreme'
      break
  }
  if (!localStorage.getItem(strName)) {
    localStorage.setItem(strName, gGame.secsPassed)
  } else if (gGame.secsPassed < parseInt(localStorage.getItem(strName))) {
    localStorage.setItem(strName, gGame.secsPassed)
  }
}

function loadFromLocalStorage() {
  var strName
  switch (gLevel.SIZE) {
    case 4:
      strName = 'bestScoreEasy'
      break
    case 8:
      strName = 'bestScoreMedium'
      break
    case 12:
      strName = 'bestScoreExtreme'
      break
  }
  if (localStorage.getItem(strName)) return +localStorage.getItem(strName)
  else return ''
}

function showHint(idx, jdx) {
  if (gBoard[idx][jdx].isShown) return
  for (var i = idx - 1; i <= idx + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = jdx - 1; j <= jdx + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue
      if (gBoard[i][j].isShown) continue
      if (gBoard[i][j].isMine) {
        document.querySelector(`.cell-${i}-${j}`).innerText = '💣'
      } else if (gBoard[i][j].minesAroundCount) {
        document.querySelector(`.cell-${i}-${j}`).innerText =
          gBoard[i][j].minesAroundCount
      }
      setTimeout(
        (loc) => {
          document.querySelector(`.cell-${loc.i}-${loc.j}`).innerText = ''
        },
        1000,
        { i: i, j: j }
      )
    }
  }
  gHint.isHint = false
}

function cellMarked(ev, elCell, idx, jdx) {
  if (ev.button !== 2) return
  var curCell = gBoard[idx][jdx]
  if (curCell.isShown) return
  if (!curCell.isMarked) {
    curCell.isMarked = true
    elCell.innerText = '🚩'
    gGame.markedCount++
    if (checkGameOver()) onGameOver(true)
  } else {
    curCell.isMarked = false
    elCell.innerText = ''
    gGame.markedCount--
  }
  var elFlags = document.querySelector('.flags-left')
  elFlags.innerText = gLevel.MINES - gGame.markedCount
}

function onHintClick() {
  if (gHint.hintsLeft > 0) {
    gHint.hintsLeft--
    var strHint = ''
    for (var i = 0; i < gHint.hintsLeft; i++) {
      strHint += '💡'
    }
    document.querySelector('.hints').innerText = strHint
    gHint.isHint = true
  } else return
}

function onSafeClick() {
  if (gHint.safeClicksLeft === 0) return
  gHint.safeClicksLeft--
  document.querySelector('.safe-click span').innerText = gHint.safeClicksLeft
  var randEmptyCell = getEmptyCell()
  var elEmpttyCell = document.querySelector(
    `.cell-${randEmptyCell.i}-${randEmptyCell.j}`
  )
  elEmpttyCell.style.backgroundColor = '#ae8617'
  setTimeout((randEmptyCell) => {
    // if (gBoard[randEmptyCell.i][randEmptyCell.j].isShown) return
    var elEmpttyCell = document.querySelector(
      `.cell-${randEmptyCell.i}-${randEmptyCell.j}`
    )
    elEmpttyCell.style.backgroundColor = ''
  }, 3000,randEmptyCell)
}

function onManuallyCreate() {
  clearInterval(gTimeInterval)
  gManuallyCreateMinesLeft = gLevel.MINES
  initGame()
}

function onGameOver(isVictory) {
  gGame.isOn = false
  clearInterval(gTimeInterval)
  elSmiley = document.querySelector('.smiley')
  if (isVictory) {
    elSmiley.innerText = '😎'
    saveToLocalStorage()
  } else {
    for (var i = 0; i < gMines.length; i++) {
      var loc = gMines[i]
      var elCell = document.querySelector(`.cell-${loc.i}-${loc.j}`)
      elCell.classList.add('shown')
      var curCell = gBoard[loc.i][loc.j]
      curCell.isShown = true
      elCell.innerText = '💣'
    }
    elSmiley.innerText = '🤯'
  }
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
  gManuallyCreateMinesLeft = 0
  clearInterval(gTimeInterval)
  initGame()
}

function restartGame() {
  gManuallyCreateMinesLeft = 0
  clearInterval(gTimeInterval)
  initGame()
}
