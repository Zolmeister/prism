var $ = document.querySelectorAll.bind(document);

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
Events.on('gameOver', function() {
	maxColor = 0
	var $infoScreen = document.getElementById('info-screen')
	$infoScreen.className = 'show'
	var $gameOverBox = document.getElementById('game-over-box')
	$gameOverBox.style.display = 'block'
	
	var $challengeButton = document.createElement('button')
	$challengeButton.innerText = 'Challenge a Friend'
	// Should add some sort of fastclick here... (touch first)
	$challengeButton.addEventListener('click', function() {
		Events.emit('challengeFriend')
	})
	
	// move the score element inside this div, we move back to it's original spot when a new game is started
	var $scoreWrapperEle = $('.bubble-wrapper')[0]
	if($scoreWrapperEle)
		$gameOverBox.appendChild($scoreWrapperEle)
	
	var $shareBubble = $('.share-bubble')[0]
	if($shareBubble)
		$shareBubble.style.display = 'none'
	
	if (!gameOverOnce) {
		var $gameOverButton = document.createElement('button')
		$gameOverButton.innerText = 'Play Again'
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
})

Events.on('challengeFriend', function() {
	var score = GAME.board.score;
	Clay.Social.smartShare({
		message: 'I just scored ' + score + ' in Prism! Think you can beat my score?',
		title: 'Prism', 
		link: 'http://prism.clay.io',
		//image: screenshotURL,
		ignoreScreenshot: true,
		data: {},
		//respond: // the username of our opponent // cards.kik.returnToConversation
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
	GAME.board.move(e.keyIdentifier.toLowerCase())
});

// init
// Run the tutorial for first-time visitors
if(!localStorage['tutorial-shown']) {
	
	// row, col, color
	GAME.board.newGame([[2,1,1],[2,2,1]])
	GAME.tutorial = new Tutorial([2, 1])
	localStorage['tutorial-shown'] = 1
} else {
	GAME.board.newGame()
}

window.addEventListener('load', function() {
	// Load in sharing buttons
	if(cards.kik) {
		var $share = document.createElement('a')
		$share.className = 'kik-share' 
		$share.href = '#'
		$share.id = 'kik-share'
		$share.innerHTML = "<img src='images/kik-it.png'><span>share!</span></a>"
		$share.addEventListener('touchstart', function() {
			Clay.Kik.post({
				message: 'Come play Prism, the most addicting game on Kik!',
				title: 'Prism',
				data: {}
			})
		})
		document.getElementById('share').appendChild($share)
	}
	else {
		var html = '<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fprism.clay.io&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp;appId=405599259465424" style="border:none; overflow:hidden; width: 90px; height:21px;"></iframe>'
		html += '<iframe allowtransparency="true" frameborder="0" scrolling="no" src="https://platform.twitter.com/widgets/tweet_button.html?url=http://prism.clay.io&via=claydotio&text=Prism%20-%202048%20without%20numbers" style="width:85px; height:20px;"></iframe>'
		document.getElementById('share').innerHTML = html
	}
})


function sizing() {
	var gridWidth = window.innerWidth
	var gridHeight = window.innerHeight - $('.grid-inner')[0].offsetTop * 2 // .grid-outer padding
	var boxSize = Math.min(gridWidth, gridHeight)
	$('.grid-background')[0].style.width = boxSize + 'px'
	$('.grid-background')[0].style.height = (boxSize - 14) + 'px' // 7px  padding
}
sizing()
$grid.style.visibility = 'visible'
$('.grid-background')[0].style.visibility = 'visible'
window.onresize = sizing
