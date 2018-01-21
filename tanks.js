// elHook = element to place game inside
// width & height of the game will default to defaults if not specified
let tanks = function(elHook, width, height) {
// options
	let ops = {
		board: { w: 700, h: 400, bgcolor: "white" },
		bullet: { r: 5, color: "black", life: 5000, speed: 400 },
		tanks: { r: 20,  s: 300, coolDown: 500 },
		gun: { length: 25, width: 4 },
		winScore: 5
	};

// setup
	document.addEventListener('keydown', e => canKeyDown(e));
	document.addEventListener('keyup', e => canKeyUp(e));

	let can = document.createElement('canvas');
	can.width = width || ops.board.w;
	can.height = height || ops.board.h;
	elHook.appendChild(can);
	let c = can.getContext('2d');

	let gameOver = false;
	let winner;

	let keys = {
		left: 37, up: 38, right: 39, down: 40, shoot: 77, // m
		left2: 65, up2: 87, right2: 68, down2: 83, shoot2: 69 // e
	};

	let tank = {
		r: ops.tanks.r, // radius
		x: 100,
		y: can.height / 2,
		color: "green",
		a: 0, // angle
		s: ops.tanks.s, // speed px/s
		rs: Math.PI * 2, // rads / s (rotation speed)
		lastShot: 0, // timestamp of last shot fired
		coolDown: ops.tanks.coolDown, // time between shots (ms)
		score: 0
	};
	let tank2 = {
		r: ops.tanks.r, 
		x: can.width - 100,
		y: can.height / 2,
		color: "red",
		a: Math.PI,
		s: ops.tanks.s,
		rs: Math.PI * 2,
		lastShot: 0,
		coolDown: ops.tanks.coolDown,
		score: 0
	};
	let bullets = [];
	function Bullet(x, y, a) {
		this.x = x;
		this.y = y;
		this.a = a;
		this.r = ops.bullet.r;
		this.color = ops.bullet.color;
		this.life = ops.bullet.life;
		this.s = ops.bullet.speed;
		this.shotTime = Date.now();
	}

// input funcs
	function canKeyDown(e) { if (keysdown.indexOf(e.keyCode) <= -1) keysdown.push(e.keyCode); }
	function canKeyUp(e) { keysdown.splice(keysdown.indexOf(e.keyCode), 1); }

// render
	function render() {
		//c.clearRect(0, 0, can.width, can.height);
		c.fillStyle = ops.board.bgcolor;
		c.fillRect(0, 0, can.width, can.height);
	// score
		c.font = "30px Helvetica";
		c.fillStyle = tank.color;
		c.fillText(tank.score, 20, 30);
		c.fillStyle = tank2.color;
		c.fillText(tank2.score, 50, 30);
	// tank 1
		c.beginPath();
		c.fillStyle = tank.color;
		c.arc(tank.x, tank.y, tank.r, 0, 2*Math.PI);
		c.fill();
		c.closePath();

		c.beginPath();
		c.moveTo(tank.x, tank.y);
		c.lineWidth = ops.gun.width;
		c.lineTo(tank.x + Math.cos(tank.a) * ops.gun.length,
			 tank.y + Math.sin(tank.a) * ops.gun.length);
		c.stroke();
		c.closePath();
	// tank 2
		c.beginPath();
		c.fillStyle = tank2.color;
		c.arc(tank2.x, tank2.y, tank2.r, 0, 2*Math.PI);
		c.fill();
		c.closePath();

		c.beginPath();
		c.moveTo(tank2.x, tank2.y);
		c.lineWidth = ops.gun.width;
		c.lineTo(tank2.x + Math.cos(tank2.a) * ops.gun.length,
			 tank2.y + Math.sin(tank2.a) * ops.gun.length);
		c.stroke();
		c.closePath();

	// bullets
		for (let i=0; i<bullets.length; i++) {
			let b = bullets[i];
			c.beginPath();
			c.fillStyle = b.color;
			c.arc(b.x, b.y, b.r, 0, Math.PI*2);
			c.fill();
			c.closePath();
		}
	// win
		if (gameOver) {
			//c.clearRect(0, 0, can.width, can.height);
			c.fillStyle = ops.board.bgcolor;
			c.fillRect(0, 0, can.width, can.height);
			c.font = "70px Helvetica";
			c.fillStyle = winner.color;
			c.fillText(winner.color + " wins!", can.width/2 - 150, can.height/2);
		}
	}

// update
	let keysdown = [];
	function update(delta) { // given in seconds
	// forward
		if (keysdown.indexOf(keys.up) >= 0) {
			tank.x += tank.s * delta * Math.cos(tank.a);
			tank.y += tank.s * delta * Math.sin(tank.a);

			// borders
			if (tank.x + tank.r > can.width) tank.x = can.width - tank.r;
			else if (tank.x - tank.r < 0) tank.x = tank.r;
			if (tank.y + tank.r > can.height) tank.y = can.height - tank.r;
			else if (tank.y - tank.r < 0) tank.y = tank.r;
		}
		if (keysdown.indexOf(keys.up2) >= 0) {
			tank2.x += tank2.s * delta * Math.cos(tank2.a);
			tank2.y += tank2.s * delta * Math.sin(tank2.a);

			// borders
			if (tank2.x + tank2.r > can.width) tank2.x = can.width - tank2.r;
			else if (tank2.x - tank2.r < 0) tank2.x = tank2.r;
			if (tank2.y + tank2.r > can.height) tank2.y = can.height - tank2.r;
			else if (tank2.y - tank2.r < 0) tank2.y = tank2.r;
		}
	// turning
		if (keysdown.indexOf(keys.left) >= 0) tank.a -= tank.rs * delta;
		if (keysdown.indexOf(keys.right) >= 0) tank.a += tank.rs * delta;
		if (keysdown.indexOf(keys.left2) >= 0) tank2.a -= tank2.rs * delta;
		if (keysdown.indexOf(keys.right2) >= 0) tank2.a += tank2.rs * delta;
	// shooting
		if (keysdown.indexOf(keys.shoot) >= 0
		    && Date.now() - tank.lastShot >= tank.coolDown) {
			tank.lastShot = Date.now();

			let dist = tank.r + ops.bullet.r;
			bullets.push(new Bullet(
				tank.x + Math.cos(tank.a) * dist,
				tank.y + Math.sin(tank.a) * dist,
				tank.a
			));
		}
		if (keysdown.indexOf(keys.shoot2) >= 0
		    && Date.now() - tank2.lastShot >= tank2.coolDown) {
			tank2.lastShot = Date.now();

			let dist = tank2.r + ops.bullet.r;
			bullets.push(new Bullet(
				tank2.x + Math.cos(tank2.a) * dist,
				tank2.y + Math.sin(tank2.a) * dist,
				tank2.a
			));
		}

	// bullets
		for (let i=0; i<bullets.length; i++) {
			let b = bullets[i];
			if (Date.now() - b.shotTime > b.life) {
				bullets.splice(bullets.indexOf(bullets[i]), 1);
				continue;
			}
			b.x += b.s * delta * Math.cos(b.a);
			b.y += b.s * delta * Math.sin(b.a);

			// borders
			if (b.x + b.r > can.width) { b.x = can.width - b.r; b.a = Math.PI - b.a; }
			else if (b.x - b.r < 0) { b.x = b.r; b.a = Math.PI - b.a; }
			if (b.y + b.r > can.height) { b.y = can.height - b.r; b.a *= -1; }
			else if (b.y - b.r < 0) { b.y = b.r; b.a *= -1; }

			// hit tank
			if (getDist(b.x, b.y, tank.x, tank.y) < tank.r + b.r) tankHit(tank);
			if (getDist(b.x, b.y, tank2.x, tank2.y) < tank2.r + b.r) tankHit(tank2);
		}
	// winning
		if (tank.score >= ops.winScore) { gameOver = true; winner = tank; }
		if (tank2.score >= ops.winScore) { gameOver = true; winner = tank2; }
	}

// helpers for update
	function tankHit(t) {
		bullets = [];
		if (t == tank) tank2.score++;
		else tank.score++;
		tank.x = 100; tank.y = can.height / 2; tank.a = 0;
		tank2.x = can.width - 100; tank2.y = can.height / 2; tank2.a = Math.PI;
	}
	let getDist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

// go
	let now = Date.now();
	let then = Date.now();
	let gameLoop = setInterval(main, 1);

	function main() {
		now = Date.now();
		delta = now - then;
		update(delta / 1000);
		render();
		then = now;
	}

};
