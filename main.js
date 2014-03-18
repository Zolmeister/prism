var $ = document.querySelectorAll.bind(document);

var GAME = {
	board: new Board()
}

'tile tile-0-0 tile-phase-1'

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

Events.on('setColor', function(elem) {
	var $tiles = $('.tile-'+elem.row+'-'+elem.col)
	try {
		_.map($tiles, function($tile) {
			$tile.className = $tile.className.replace(/tile-phase-\d/, 'tile-phase-'+(elem.color-1))
		})
	} catch (e) {}
})

Events.on('gameOver', function() {
	var infoScreen = document.getElementById( 'info-screen' )
	infoScreen.className = 'show'
	var gameOverBox = document.getElementById( 'game-over-box' )
	var html = '<button>Challenge a Friend</button>'
	html += ''
	gameOverBox.innerHTML = html
})

// keybindings
Hammer($grid).on("swipeleft", function(e) {
    GAME.board.move('left')
}).on("swiperight", function(e) {
    GAME.board.move('right')
}).on("swipeup", function(e) {
    GAME.board.move('up')
}).on("swipedown", function(e) {
    GAME.board.move('down')
});

Mousetrap.bind(['up', 'down', 'left', 'right'], function(e) {
	GAME.board.move(e.keyIdentifier.toLowerCase())
});

// init
GAME.board.spawn()
GAME.board.spawn()

function sizing() {
	var gridWidth = $grid.offsetWidth
	var gridHeight = $grid.offsetHeight
	var boxSize = Math.min(gridWidth, gridHeight) + 'px'
	$grid.style.width = boxSize
	$grid.style.height = boxSize
	$('.grid-background')[0].style.width = boxSize
	$('.grid-background')[0].style.height = boxSize
}
sizing()
$grid.style.visibility = 'visible'
$('.grid-background')[0].style.visibility = 'visible'
window.onresize = sizing
