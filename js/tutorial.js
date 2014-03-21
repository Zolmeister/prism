function Tutorial(spawnPos) {
	var Events = typeof window !== 'undefined' ? window.Events : {emit:function(){}};

	this.steps = [{
		message: "Swipe any direction to move tiles", // lined up next to one of the tiles we spawn
		x: ( spawnPos[1] * 25 ) + '%', // percent so it works w/ any scaling
		y: ( spawnPos[0] * 25 ) + '%',	
		position: 'absolute' // relative to grid
	}, {
		message: "Combine same-color tiles to make a new color",
		x: '35%', // percent so it works w/ any scaling
		y: '10%',	
		position: 'absolute', // relative to grid,
		noarrow: true
	}, {
		message: "Your progress is shown on this bar",
		x: '50%', // percent so it works w/ any scaling
		y: '10px',
		position: 'fixed' // relative to document		
	}, {
		message: "You win by making the full rainbow",
		x: '50%', // percent so it works w/ any scaling
		y: '10px',
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
		var noarrow = this.steps[this.currentStep].noarrow
		
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
		
		// TODO: fastclick
		var _this = this
		
		var $arrow = document.createElement( 'div' )
		var $arrowBorder = document.createElement( 'div' )
		if (noarrow) {
			$arrow.style.display = 'none';
			$arrowBorder.style.display = 'none';
		}
		if(yOrientation == 'bottom') {
			$arrow.className = 'arrow-bottom'
			$arrowBorder.className = 'arrow-bottom-border'
		}
		else {
			$arrow.className = 'arrow-top'
			$arrowBorder.className = 'arrow-top-border'			
		}
		
		$tipWrapper.appendChild($tip)
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