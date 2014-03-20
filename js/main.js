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
