function BoundingBox(top, right, bottom, left) {
	this.top = Math.max(0, top);
	this.right = right;
	this.bottom = bottom;
	this.left = Math.max(0, left);

	/*
		Call this function after manipulating properties to create a consistent state
	*/
	this.update = function() {
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
	};

	this.containsPoint = function(x, y) {
		return x > this.left && x < this.right && y > this.top && y < this.bottom;
	};

	this.update();
}

BoundingBox.fromLens = function(lens) {
	return new BoundingBox(
		lens.centerY - lens.radius,
		lens.centerX + lens.radius,
		lens.centerY + lens.radius,
		lens.centerX - lens.radius
	);
};


function Lens(cx, cy, radius, concave) {
	this.centerX = cx;
	this.centerY = cy;
	this.radius = radius;
	this.concave = concave === true;

	/*
		Call this function after manipulating properties to create a consistent state
	*/
	this.update = function() {
		this.bBox = null;
		this.bBox = BoundingBox.fromLens(this);
	};

	/*
		@returns if the point is inside the circle
	*/
	this.containsPoint = function(x, y) {
		var
			dx = x - this.centerX,
			dy = y - this.centerY;

		return (dx * dx + dy * dy) < (this.radius * this.radius);
	};

	/*
		Given a point (x, y) the function will return a point [a, b]
		with the coordinates to get the color from.
	*/
	this.computeRefraction = function(x, y) {
		var
			dx = x - this.centerX,
			dy = y - this.centerY,
			dist = dx * dx + dy * dy,
			r2 = this.radius * this.radius;

		//The point is not inside the circle, take the color on that same point without refraction
		if(dist > r2) {
			return [x, y];
		}

		var
			relativeDist = 1 - dist / r2,
			a, b;

		if(this.concave) {
			a = x - (this.centerX - x) * relativeDist;
			b = y - (this.centerY - y) * relativeDist;
		} else {
			a = x + (this.centerX - x) * relativeDist;
			b = y + (this.centerY - y) * relativeDist;
		}

		return [(a  | 0) + 1, (b | 0) + 1];
	}

	this.update();
}
