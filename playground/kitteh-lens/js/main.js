var
	canvas = document.getElementById('canvas'),
	ctx,
	img = document.getElementById('img'),
	lens = new Lens(400, 100, 150),
	lastBB = lens.bBox,
	counter = 0;

if(!canvas.getContext) {
	alert("Sorry, no canvas for you.");
	throw "Canvas ain't got no context";
}

ctx = canvas.getContext('2d');


function render() {
	if(lastBB.right > canvas.width) {
		lastBB.right = canvas.width;
	}

	if(lastBB.bottom > canvas.height) {
		lastBB.bottom = canvas.height;
	}

	lastBB.update();

	ctx.drawImage(img, lastBB.left, lastBB.top, lastBB.width, lastBB.height, lastBB.left, lastBB.top, lastBB.width, lastBB.height);

	var
		canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height),
		lensData = ctx.createImageData(lens.bBox.width, lens.bBox.height);

	for(var x = lens.bBox.left; x < lens.bBox.right; x++) {
		for(var y = lens.bBox.top; y < lens.bBox.bottom; y++) {
			var p = lens.computeRefraction(x, y);

			//If point is outside (happens for concave lenses), just take white
			if(p[0] < 0 || p[1] < 0 || p[0] > canvas.width || p[1] > canvas.height) {
				lensData.data[iTarget + 3] = 0xff;
			} else {
				var
					iTarget = ((x - lens.bBox.left) + (y - lens.bBox.top) * lens.bBox.width) * 4,
					iSource = (p[0] + p[1] * canvas.width) * 4;

				//Give pixels inside the lens some blue touch
				if(p[0] !== x || p[1] !== y) {
					lensData.data[iTarget + 0] = canvasData.data[iSource + 0];
					lensData.data[iTarget + 1] = canvasData.data[iSource + 1];
					lensData.data[iTarget + 2] = canvasData.data[iSource + 2] + 15;
					lensData.data[iTarget + 3] = canvasData.data[iSource + 3];
				} else {
					lensData.data[iTarget + 0] = canvasData.data[iSource + 0];
					lensData.data[iTarget + 1] = canvasData.data[iSource + 1];
					lensData.data[iTarget + 2] = canvasData.data[iSource + 2];
					lensData.data[iTarget + 3] = canvasData.data[iSource + 3];
				}


			}
		}
	}

	ctx.putImageData(lensData, lens.bBox.left, lens.bBox.top);

	lastBB = lens.bBox;
}


img.onload = function() {
	ctx.drawImage(img, 0, 0);
};

if(img.complete) {
	img.onload();
}

canvas.onmousemove = function(e) {
	lens.centerX = e.clientX - canvas.offsetLeft;
	lens.centerY = e.clientY - canvas.offsetTop;
	lens.update();

	render();
};

canvas.onclick = function() {
	lens.concave = !lens.concave;
	render();
};
