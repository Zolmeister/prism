function Board(grid) {
	var Events = typeof window !== 'undefined' ? window.Events : {emit:function(){}};
	
	this.score = 0
	this.isGameOver = false
	
	
	this.resetGrid = function() {
		this.grid = _.map(Array(4), function() {
			return _.map(Array(4), function() {
				return 0
			})
		})
	}
	
	if(grid)
		this.grid = grid
	else
		this.resetGrid()
	
	this.newGame = function() {
		this.resetGrid()
		this.spawn()
		this.spawn()
		this.score = 0
		this.isGameOver = false
	}
		
	this.hasAnotherMove = function() {
		for(var r=0;r<this.grid.length;r++) {
			for(var c=0;c<this.grid[0].length;c++) {
				if (!this.grid[r][c]) {
					return true
				}
				var dirs = [
					[-1, 0],
					[1, 0],
					[0, -1],
					[0, 1]
				]
				var self = this
				if (_.some(dirs, function(dir) {
					return self.grid[r+dir[0]] &&
						self.grid[r][c] === self.grid[r+dir[0]][c+dir[1]]
				})) return true
			}
		}
		return false
	}
	
	this.spawn = function() {
		
		// get random empty grid cell
		var emptyCells = []
		for(var r=0;r<this.grid.length;r++) {
			for(var c=0;c<this.grid[0].length;c++) {
				if(!this.grid[r][c]) {
					emptyCells.push([r,c])
				}
			}
		}
		
		if (!this.hasAnotherMove()) {
			return this.endGame()
		}
		
		if (!emptyCells.length) {
			return;
		}
		
		var target = _.sample(emptyCells)
		var row = target[0]
		var col = target[1]
		
		// fill with either the first or second colors. 90% first color, 10% second
		var color = Math.random() < 0.1 ? 2 : 1
		this.grid[row][col] = color
		
		// add element to DOM
		Events.emit('spawn', {row: row, col: col, color: color})
		
		return [row, col] // used for tutorial
	}
	
	this.endGame = function() {
		// show end game screen
		this.isGameOver = true
		Events.emit('gameOver')
	}
	
	this.move = function(dir) {
		if (this.isGameOver) return;
		if (GAME.tutorial)
			GAME.tutorial.nextStep()
		this._move(dir)
		this.spawn()
	}
	
	this._move = function(dir) {
		var keymap = {
			up: [-1, 0],
			down: [1, 0],
			left: [0, -1],
			right: [0, 1]
		}
		
		var grid = this.grid
		var diff = keymap[dir]
		var rows = _.range(0, 4)
		var cols = _.range(0, 4)
		
		if(dir === 'down') {
			rows.reverse()
		}
		if(dir === 'right') {
			cols.reverse()
		}

		// Hack, is something has been combined, it has 0.1 added to it temporarily
		for(var r=0;r<rows.length;r++) {
			for(var c=0;c<cols.length;c++) {
				var row = rows[r]
				var col = cols[c]
				
				var fromRow = row
				var fromCol = col
				
				if (grid[row] && grid[row][col]) {
					var combine = grid[row][col]
					
					while (grid[row + diff[0]] && (grid[row + diff[0]][col + diff[1]] === 0 ||
								grid[row][col] === grid[row + diff[0]][col + diff[1]])) {
						
						combine = grid[row][col]
						if (grid[row][col] === grid[row + diff[0]][col + diff[1]]) {
							combine = grid[row][col] + 1 + Math.random() / 2
							this.score += Math.pow(grid[row][col], 2)
						}
							
						grid[row][col] = 0
						row += diff[0]
						col += diff[1]
						grid[row][col] = combine
						
					}
					Events.emit('move', {fromRow: fromRow, toRow: row, fromCol: fromCol, toCol: col});
					Events.emit('setColor', {row:row, col: col, color: Math.floor(combine)});
				}
			}
		}
		
		this.grid = _.map(grid, function(row) {
			return _.map(row, Math.floor.bind(Math))
		})
	}
}

if(typeof module !== 'undefined') {
	module.exports = Board
}
// events
(function(){var d={},c=0,a,b;this.Events={on:function(a,c,b){d[a]=d[a]||[];d[a].push({f:c,c:b})},off:function(b,e){a=d[b]||[];if(!e)return a.length=0;for(c=a.length;0<=--c;)e==a[c].f&&a.splice(c,1)},emit:function(){b=Array.apply([],arguments);a=d[b.shift()]||[];b=b[0]instanceof Array&&b[0]||b;for(c=a.length;0<=--c;)a[c].f.apply(a[c].c,b)}}})()

var $ = document.querySelectorAll.bind(document);

var GAME = {
	board: new Board()
}

var $grid = $('.grid')[0]
Events.on('move', function(move) {
	if (move.fromRow === move.toRow && move.fromCol === move.toCol) return;
	var $tiles = $('.tile-'+move.fromRow+'-'+move.fromCol)
	var $old = $('.tile-'+move.toRow+'-'+move.toCol)[0]
	_.map($tiles, function($tile) {
		$tile.className = $tile.className.replace(/tile-\d-\d/, 'tile-'+move.toRow+'-'+move.toCol)
	})
	
	if ($old) {
		setTimeout(function() {
			_.map($tiles, function($tile) {
				try {
					$tile.parentElement.removeChild($tile)
				} catch(e) {
				}
			})
		}, 1000)
	}
})

Events.on('spawn', function(spawn) {
	var $div = document.createElement('div')
	var $tile = document.createElement('div')
	$tile.setAttribute('class', 'tile '+'tile-'+spawn.row+'-'+spawn.col+' tile-phase-'+(spawn.color-1))
	$tile.appendChild($div)
	$grid.appendChild($tile)
})

var maxColor = 1
Events.on('setColor', function(elem) {
	var $tiles = $('.tile-'+elem.row+'-'+elem.col)
	try {
		_.map($tiles, function($tile) {
			$tile.className = $tile.className.replace(/tile-phase-\d/, 'tile-phase-'+(elem.color-1))
		})

		if (elem.color > maxColor) {
			maxColor = elem.color
			$progress = $('#progress-cover')[0]
			$progress.className = $progress.className.replace(/progress-\d/, 'progress-'+(maxColor-1))
		}
	} catch (e) {}
})

// super hack to prevent multiple buttons spawning end of game
var gameOverOnce = false
Events.on('gameOver', function() {
	maxColor = 0
	var infoScreen = document.getElementById('info-screen')
	infoScreen.className = 'show'
	var gameOverBox = document.getElementById('game-over-box')
	gameOverBox.style.display = 'block'
	
	var challengeButton = document.createElement('button')
	challengeButton.innerText = 'Challenge a Friend'
	// Should add some sort of fastclick here... (touch first)
	challengeButton.addEventListener('click', function() {
		Events.emit('challengeFriend')
	})
	
	if (!gameOverOnce) {
		var gameOverButton = document.createElement('button')
		gameOverButton.innerText = 'Play Again'
		gameOverButton.className = 'play-again'
		// Should add some sort of fastclick here... (touch first)
		gameOverButton.addEventListener('click', function() {
			Events.emit('restartGame')
		})
		
		gameOverBox.appendChild(challengeButton)
		gameOverBox.appendChild(gameOverButton)
		gameOverOnce = true
	}
})

Events.on('challengeFriend', function() {
	var score = GAME.board.score;
	Clay.Social.smartShare({
		message: 'Think you can beat my score?',
		title: 'I just scored ' + score + ' in Prism!', 
		//image: screenshotURL,
		data: {},
		//respond: // the username of our opponent // cards.kik.returnToConversation
	})
})

Events.on('restartGame', function() {
	$('.grid')[0].innerHTML = ''
	document.getElementById('progress-cover').className = 'progress-0'
	document.getElementById('info-screen').className = 'hide'
	GAME.board.newGame()
})

// keybindings
var move = 'left';
Hammer(window).on("dragleft", function(e) {
	e.preventDefault()
	e.gesture.preventDefault()
	move='left'
}).on("dragright", function(e) {
	e.preventDefault()
	e.gesture.preventDefault()
	move='right'
}).on("dragup", function(e) {
	e.preventDefault()
	e.gesture.preventDefault()
	move='up'
}).on("dragdown", function(e) {
	e.preventDefault()
	e.gesture.preventDefault()
	move='down'
}).on('dragend', function(e) {
	GAME.board.move(move)
})

Mousetrap.bind(['up', 'down', 'left', 'right'], function(e) {
	GAME.board.move(e.keyIdentifier.toLowerCase())
});

// init
GAME.board.spawn()
var spawnPos = GAME.board.spawn() // store the spawn position for the tutorial. [row, col]

// Run the tutorial for first-time visitors
if(!localStorage['tutorial-shown']) {
	GAME.tutorial = new Tutorial(spawnPos)
	localStorage['tutorial-shown'] = 1
}

function sizing() {
	var gridWidth = $grid.offsetWidth
	var gridHeight = $grid.offsetHeight
	var boxSize = Math.min(gridWidth, gridHeight)
	$('.grid-background')[0].style.width = boxSize + 'px'
	$('.grid-background')[0].style.height = (boxSize - 14) + 'px' // 7px  padding
}
sizing()
$grid.style.visibility = 'visible'
$('.grid-background')[0].style.visibility = 'visible'
window.onresize = sizing

function Tutorial(spawnPos) {
	var Events = typeof window !== 'undefined' ? window.Events : {emit:function(){}};

	this.steps = [{
		message: "Swipe any direction to move tiles", // lined up next to one of the tiles we spawn
		x: ( spawnPos[1] * 25 ) + '%', // percent so it works w/ any scaling
		y: ( spawnPos[0] * 25 ) + '%',	
		position: 'absolute' // relative to grid
	}, {
		message: "Combine same-color tiles to make a new color",
		x: ( spawnPos[1] * 25 ) + '%', // percent so it works w/ any scaling
		y: ( spawnPos[0] * 25 ) + '%',	
		position: 'absolute' // relative to grid	
	}, {
		message: "Your progress is shown on this bar",
		x: '50%', // percent so it works w/ any scaling
		y: '5px',
		position: 'fixed' // relative to document		
	}, {
		message: "You win by making the full rainbow",
		x: '50%', // percent so it works w/ any scaling
		y: '5px',
		position: 'fixed' // relative to document
	}]
	
	this.currentStep = -1 // index of this.steps for the step that's being viewed

	
	this.removeCurrentTip = function() {
		var oldTip = document.getElementById('tip')
		if(oldTip)
			oldTip.parentNode.removeChild(oldTip)
	}
	
	this.nextStep = function(x, y, message) {
		this.currentStep++
		if(!this.steps[this.currentStep]) { // tutorial completed
			this.closeTutorial()
			return
		}
			
		this.removeCurrentTip()
		var $tipWrapper = document.createElement('div')
		$tipWrapper.id = 'tip'
		var x = this.steps[this.currentStep].x
		var y = this.steps[this.currentStep].y
		
		var yOrientation = y.indexOf('%') !== -1 && parseInt(y) >= 50 ? 'bottom' : 'top'
		if(yOrientation == 'bottom')
			$tipWrapper.style.bottom = ( 100 - parseInt(y) ) + '%' // so bottom of tip is never out of view
		else if(y.indexOf('%') !== -1)
			$tipWrapper.style.top = ( 25 + parseInt(y) ) + '%'
		else
			$tipWrapper.style.top = y
						
		
		var xOrientation = x.indexOf('%') !== false && parseInt(x) >= 50 ? 'right' : 'left'
		if(xOrientation == 'right')
			$tipWrapper.style.right = ( 75 - parseInt(x) ) + '%' // so bottom of tip is never out of view
		else if(x.indexOf('%') !== false)
			$tipWrapper.style.left = ( parseInt(x) ) + '%'
		else
			$tipWrapper.style.left = x
			
		$tipWrapper.style.position = this.steps[this.currentStep].position

		var $tip = document.createElement('div')
		$tip.innerHTML = this.steps[this.currentStep].message
		
		var $nextStep = document.createElement('a')
		$nextStep.innerText = 'Next Step'
		// TODO: fastclick
		var _this = this
		$nextStep.addEventListener('click', function() {
			_this.nextStep()
		})
		
		var $arrow = document.createElement( 'div' )
		var $arrowBorder = document.createElement( 'div' )
		if(yOrientation == 'bottom') {
			$arrow.className = 'arrow-bottom'
			$arrowBorder.className = 'arrow-bottom-border'
		}
		else {
			$arrow.className = 'arrow-top'
			$arrowBorder.className = 'arrow-top-border'			
		}
		
		$tipWrapper.appendChild($tip)
		$tipWrapper.appendChild($nextStep)
		$tipWrapper.appendChild($arrowBorder)
		$tipWrapper.appendChild($arrow)
		$('.grid-background')[0].appendChild($tipWrapper)
		Events.emit('nextStep', {})
	}
	
	this.closeTutorial = function() {
		this.removeCurrentTip()
	}
	
	// show the first step
	this.nextStep()
}

if(typeof module !== 'undefined') {
	module.exports = Tutorial
}