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
	
	this.newGame = function(startingPositions) {
		this.resetGrid()
		if (startingPositions) {
			var self = this
			_.forEach(startingPositions, function(pos){
				self.spawn(pos[0], pos[1], pos[2])
			})
		} else {
			this.spawn()
			this.spawn()
		}
		
		this.score = 0
		Events.emit('score', this.score)
		this.isGameOver = false
	}
	
	this.lastVisited = []
		
	this.hasAnotherMove = function() {
		for(var r=0;r<4;r++) {
			for(var c=0;c<4;c++) {
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
	
	this.sampleWithout = function(arr, exclude) {
		var result = []
		
		for(var i=0;i<arr.length;i++) {
			var cell = arr[i];
			for(var j=0;j<exclude.length;j++) {
				var exCell = exclude[j];
				if (_.isEqual(cell, exCell)) break
			}
			
			if (j === exclude.length) {
				result.push(cell)
			}
		}
		
		return _.sample(result)
	}
	
	this.spawn = function(row, col, color) {
		if (!this.hasAnotherMove()) {
			return this.endGame()
		}
		
		if(!row && !col) {
			var pos = this.randomSpawn()
			row = pos[0]
			col = pos[1]

			// fill with either the first or second colors. 90% first color, 10% second
			color = Math.random() < 0.1 ? 2 : 1
		}

		this.lastVisited.push([row, col])
		this.grid[row][col] = color
		localStorage['grid'] = JSON.stringify(this.grid) // persistence
		
		// add element to DOM
		Events.emit('spawn', {row: row, col: col, color: color})
		
		return [row, col] // used for tutorial
	}
	
	this.randomSpawn = function() {
		
		// get random empty grid cell that didn't have any blocks last time
		var emptyCells = []
		for(var r=0;r<4;r++) {
			for(var c=0;c<4;c++) {
				if(!this.grid[r][c]) {
					emptyCells.push([r,c])
				}
			}
		}
		
		if (!emptyCells.length) {
			return;
		}
		
		var target = this.sampleWithout(emptyCells, this.lastVisited)
		
		if (!target) {
			target = _.sample(emptyCells)
		}
		
		return target
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
		if (!this.hasAnotherMove()) {
			return this.endGame()
		}
		if (this.lastVisited.length !== 0) {
			this.spawn()
		}
		
		// game complete
		if (_.contains(_.flatten(this.grid), 10)) {
			this.endGame()
		}
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

		this.lastVisited = []
		
		// Hack, is something has been combined, it has 0.1 added to it temporarily
		for(var r=0;r<4;r++) {
			for(var c=0;c<4;c++) {
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
							this.score += Math.pow(grid[row][col] * 2, 2)
						}
						
						this.lastVisited.push([row, col])
						grid[row][col] = 0
						row += diff[0]
						col += diff[1]
						grid[row][col] = combine
						
					}
					
					Events.emit('score', this.score);
					Events.emit('move', {fromRow: fromRow, toRow: row, fromCol: fromCol, toCol: col});
					Events.emit('setColor', {row:row, col: col, color: Math.floor(combine)});
				}
			}
		}
		
		for(var r=0;r<4;r++) {
			for(var c=0;c<4;c++) {
				this.grid[r][c] = Math.floor(this.grid[r][c])
			}
		}
		localStorage['score'] = this.score
	}
}

if(typeof module !== 'undefined') {
	module.exports = Board
}