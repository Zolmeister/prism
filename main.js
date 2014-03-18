var $ = document.querySelectorAll.bind(document);

var GAME = {
	board: new Board()
}

'tile tile-0-0 tile-phase-1'

var $grid = $('.grid')[0]
Events.on('move', function(move) {
	console.log('move', move)
	var $tile = $('.tile-'+move.fromRow+'-'+move.fromCol)[0]
	var $old = $('tile-'+move.toRow+'-'+move.toCol)[0]
	if ($old) {
		$old.parentElement.removeChild($old)
	}
	$tile.className = $tile.className.replace(/tile-\d-\d/, 'tile-'+move.toRow+'-'+move.toCol)
})

Events.on('spawn', function(spawn) {
	console.log('spawn', spawn)
	var $div = document.createElement('div')
	var $tile = document.createElement('div')
	$tile.setAttribute('class', 'tile '+'tile-'+spawn.row+'-'+spawn.col+' tile-phase-'+spawn.color)
	$tile.appendChild($div)
	$grid.appendChild($tile)
})

Events.on('setColor', function(elem) {
	console.log('setColor', elem)
	var $tile = $('.tile-'+elem.row+'-'+elem.col)[0]
	try {
		$tile.className = $tile.className.replace(/tile-phase-\d/, 'tile-phase-'+(elem.color-1))
	} catch (e) {}
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