function Board(grid) {
	var Events = typeof window !== 'undefined' ? window.Events : {emit:function(){}};

	this.grid = grid || _.map(Array(4), function() {
		return _.map(Array(4), function() {
			return 0
		})
	})
	
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
		
		if(emptyCells.length === 0) {
			return this.endGame()
		}
		
		var target = _.sample(emptyCells)
		var row = target[0]
		var col = target[1]
		
		// fill with either the first or second colors
		var color = 1 //Math.random() > .9 ? 2 : 1;
		this.grid[row][col] = color
		
		// add element to DOM
		Events.emit('spawn', {row: row, col: col, color: color})
	}
	
	this.endGame = function() {
		// show end game screen
		Events.emit('gameOver')
	}
	
	this.move = function(dir) {
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
					while (grid[row + diff[0]] && (grid[row + diff[0]][col + diff[1]] === 0 ||
								grid[row][col] === grid[row + diff[0]][col + diff[1]])) {
						
						var combine = grid[row][col]
						if (grid[row][col] === grid[row + diff[0]][col + diff[1]]) {
							combine = grid[row][col] + 1.1
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