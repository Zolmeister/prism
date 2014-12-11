function $(selector, el) {
	if (!el) {el = document;}
	return el.querySelectorAll(selector);
}

var GAME = {
	board: new Board()
}

var $grid = $('.grid')[0]
Events.on('move', function(move) {
	if (move.fromRow === move.toRow && move.fromCol === move.toCol) return;
	var $tiles = $('.tile-'+move.fromRow+'-'+move.fromCol)
	var $old = $('.tile-'+move.toRow+'-'+move.toCol)[0]
	for(var i=0;i<$tiles.length;i++) {
		$tiles[i].className = $tiles[i].className.replace(/tile-\d-\d/, 'tile-'+move.toRow+'-'+move.toCol)
	}

	if ($old) {
		setTimeout(function() {
			try {
				for(var i=0;i<$tiles.length;i++) {
						$tiles[i].parentElement.removeChild($tiles[i])
				}
			} catch(e) {
			}
		}, 1000)
	}
})

Events.on('spawn', function(spawn) {
	var $div = document.createElement('div')
	var $tile = document.createElement('div')
	$tile.setAttribute('class', 'tile '+'tile-'+spawn.row+'-'+spawn.col+' tile-phase-'+(spawn.color-1))
	$div.setAttribute('class', 'tile-inner')
	$tile.appendChild($div)
	$grid.appendChild($tile)
})

var maxColor = 1
Events.on('setColor', function(elem) {
	var $tiles = $('.tile-'+elem.row+'-'+elem.col)
	try {
		for(var i=0;i<$tiles.length;i++) {
			$tiles[i].className = $tiles[i].className.replace(/tile-phase-\d/, 'tile-phase-'+(elem.color-1))
		}

		if (elem.color > maxColor) {
			maxColor = elem.color
			$progress = $('#progress-cover')[0]
			$progress.className = $progress.className.replace(/progress-\d/, 'progress-'+(maxColor-1))
		}
	} catch (e) {}
})

// super hack to prevent multiple buttons spawning end of game
var gameOverOnce = false
var postedScore = false
var postingScore = false
Events.on('gameOver', function() {
	Clay('ui.ads.page', function (err, ad) {
	  document.body.appendChild(ad.$el)
		ad.on('remove', function() { Events.emit('gameOverAdRemoved') })
	})
})

Events.on('gameOverAdRemoved', function() {
	postedScore = false
	postingScore = false
	maxColor = 0
	var $infoScreen = document.getElementById('info-screen')
	$infoScreen.className = 'show'
	$infoScreen.style.display = 'table'

	var $gameOverBox = document.getElementById('game-over-box')
	$gameOverBox.style.display = 'block'

	var $challengeButton = document.createElement('button')
	$challengeButton.innerHTML = 'Challenge a Friend'
	// Should add some sort of fastclick here... (touch first)
	$challengeButton.addEventListener('click', function() {
		Events.emit('challengeFriend')
	})

	// move the score element inside this div, we move back to it's original spot when a new game is started
	var $scoreWrapperEle = $('.bubble-wrapper')[0]
	if($scoreWrapperEle) {
		$scoreWrapperEle.style.zIndex = 10 // show above game over box. we want it below the tutorial tips at start though
		$gameOverBox.appendChild($scoreWrapperEle)
	}

	var $shareBubble = $('.share-bubble')[0]
	if($shareBubble)
		$shareBubble.style.display = 'none'

	if (!gameOverOnce) {
		var $gameOverButton = document.createElement('button')
		$gameOverButton.innerHTML = 'Play Again'
		$gameOverButton.className = 'play-again'
		// Should add some sort of fastclick here... (touch first)
		$gameOverButton.addEventListener('click', function() {
			Events.emit('restartGame')
		})

		$gameOverBox.appendChild($challengeButton)

		$gameOverBox.appendChild($gameOverButton)

		gameOverOnce = true
	}

	// move the score element inside this div, we move back to it's original spot when a new game is started
	var $scoreWrapperEle = $('.bubble-wrapper')[0]
	if($scoreWrapperEle)
		$gameOverBox.appendChild($scoreWrapperEle)

	// Reset saved game
	delete localStorage['grid']
	delete localStorage['score']
})

Events.on('challengeFriend', function() {
	var score = GAME.board.score;
	Clay('client.share.any', {
		text: 'I just scored ' + score + ' in Prism! Think you can beat my score? http://prism.clay.io'
	})
})

Events.on('restartGame', function() {
	$('.grid')[0].innerHTML = ''
	document.getElementById('progress-cover').className = 'progress-0'
	document.getElementById('info-screen').className = 'hide'

	// move the score element back to where it was before
	var $scoreWrapperEle = $('.bubble-wrapper')[0]
	if($scoreWrapperEle)
		document.body.appendChild($scoreWrapperEle)

	var $shareBubble = $('.share-bubble')[0]
	if($shareBubble)
		$shareBubble.style.display = 'inline-block'

	GAME.board.newGame()
})

$scoreEle = $('#score')[0]
Events.on('score', function(score) {
	$scoreEle.innerHTML = score;
})

// keybindings
var move = 'left';
Hammer(window, {
	drag_min_distance:5,
	drag_block_horizontal:true,
	drag_block_vertical:true
}).on("dragleft", function(e) {
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
	e.preventDefault()
	var key = e.keyIdentifier
	if(!key) { // firefox
		switch(e.which) {
			case 40:
				key = 'Down';
				break;
			case 39:
				key = 'Right';
				break;
			case 37:
				key = 'Left';
				break;
			case 38:
				key = 'Up';
				break;
		}
	}
	GAME.board.move(key.toLowerCase())
});

// init
// Run the tutorial for first-time visitors
if (!localStorage['tutorial-shown']) {

	// row, col, color
	GAME.board.newGame([[2,1,1],[2,2,1]])
	GAME.tutorial = new Tutorial([2, 1])
	localStorage['tutorial-shown'] = 1
} else if (localStorage['grid']) { // for persistence
	var grid = JSON.parse(localStorage['grid'])
	var startingPositions = []
	for(var r=0;r<4;r++) {
		for(var c=0;c<4;c++) {
			if(grid[r][c] > 0)
				startingPositions.push([r, c, grid[r][c]])
		}
	}
	GAME.board.newGame(startingPositions)
	GAME.board.score = parseInt(localStorage['score']) || 0
	Events.emit('score', GAME.board.score)
} else {
	GAME.board.newGame()
}

Clay('ui.ads.banner', {position: 'bottom'}, function (err, ad) {
	document.body.appendChild(ad.$el)
})

Clay('client.kik.isEnabled', function(err, isEnabled) {
	if (isEnabled) {
		Clay('client.kik.browser.setOrientationLock', ['portrait'], function(err) {
			if(err)
				console.error(err)
		})

		// track messages sent
		Clay('client.kik.metrics.enableGoogleAnalytics', function(err) {
			if(err)
				console.error(err)
		})

		var $shareBubble = document.getElementById('share')

		var $share = document.createElement('a')
		$share.className = 'kik-share'
		$share.href = '#'
		$share.id = 'kik-share'
		$share.innerHTML = "<img src='images/kik-it.png'><span>share!</span></a>"
		$shareBubble.addEventListener('click', function() {
			Clay('client.share.any', {
				text: 'Come play Prism, the most addicting game around! http://prism.clay.io'
			})
		})
		$shareBubble.appendChild($share)

	} else {
		var html = '<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fprism.clay.io&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp;appId=405599259465424" style="border:none; overflow:hidden; width: 90px; height:21px;"></iframe>'
		html += '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="https://platform.twitter.com/widgets/tweet_button.html?url=http://prism.clay.io&via=claydotio&text=Prism%20-%202048%20without%20numbers" style="width:85px; height:20px;"></iframe>'
		document.getElementById('share').innerHTML = html
	}
})

window.addEventListener('load', function() {
	scrollTo( 0, 1 );

	// Detect old android and toss a class on <body> to use less animations
	var androidUserAgent = navigator.userAgent.match(/Android\s([0-9\.]*)/)
	if(androidUserAgent && parseInt(androidUserAgent[1], 10) < 3)
		document.body.className = 'slow'

	// webkit-clip: text doesn't work on older android, so the logo, etc.. looks screwy
	var $gameOverText = document.getElementById('game-over-text')
	var supportsWebkitBackgroundClipText = typeof $gameOverText.style.webkitBackgroundClip !== "undefined" && ( $gameOverText.style.webkitBackgroundClip = "text", $gameOverText.style.webkitBackgroundClip === "text" )
	var gameOverTextStyle = window.getComputedStyle($gameOverText)
	var supportsLinearGradient = gameOverTextStyle.getPropertyValue('background').indexOf('linear-gradient') !== -1
	if(!supportsWebkitBackgroundClipText || !supportsLinearGradient) {
		$gameOverText.style.background = 'transparent'
		$gameOverText.style.webkitTextFillColor = '#000'
		var $logoText = document.getElementById('logo-text')
		$logoText.style.background = 'transparent'
		$logoText.style.webkitTextFillColor = '#000'
	}
})

function sizing() {
	var gridWidth = window.innerWidth
	var gridHeight = window.innerHeight - $('.grid-inner')[0].offsetTop * 2 // .grid-outer padding
	var boxSize = Math.min(gridWidth, gridHeight) * 0.94 // 3% css padding
	$('.grid-background')[0].style.width = boxSize + 'px'
	$('.grid-background')[0].style.height = (boxSize - 14) + 'px' // 7px  padding
}
sizing()
$grid.style.visibility = 'visible'
$('.grid-background')[0].style.visibility = 'visible'
window.onresize = sizing
