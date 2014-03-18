var $ = document.querySelectorAll.bind(document);

var GAME = {
	board: new Board()
}

// keybindings
Hammer($('.grid')[0]).on("swipeleft", function(e) {
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

