var gameon = true;

var spaceship = {
    
    points : [],
    size : 10,
    firing : false,
    angle : 0,
    
    setup: function() {
        this.points.push(createVector(0,0));
        this.points.push(createVector(-this.size,this.size*2));
        this.points.push(createVector(+this.size,this.size*2));
    },
    
    draw: function() {    
        
        beginShape();
        for (var i = 0; i < this.points.length; i++) {
            vertex(this.points[i].x, this.points[i].y);
        }
        endShape(CLOSE);        
    },
    
    rotate: function(r) {        
        // store rotation as basic radians for missile computations
        this.angle += r;        
        if (this.angle < 0) {
            this.angle = PI * 2 + r;
        }
        if (this.angle > PI * 2) {
            this.angle = 0 + r;
        }
        
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].rotate(r);
        }
    }
}

var asteroidfield = {
    asteroids : [],
    
    add : function() {
        this.asteroids.push({
            center: null,
            points : [],
            size : null,
            directionX : null,
            directionY : null,
            setup: function() {
                this.center = createVector(random(-width/2,width/2),random(-height/2,height/2));
                this.size = random(20,60);
                this.directionX = random(-1,1);
                this.directionY = random(-1,1);
                this.setupPoints();
            },
            setupPoints : function() {
                this.points = [];
                for (var i = 0; i < random(6,20); i++) {    
                    this.points.push(createVector(this.center.x + random(-this.size, this.size),this.center.y + random(-this.size, this.size)));
                }                    
            },

            draw: function() {            
                fill(255);
                beginShape();
                for (var i = 0; i < this.points.length; i++) {
                    vertex(this.points[i].x, this.points[i].y);
                }
                endShape(CLOSE);
                fill(0);
            },
        });
        this.asteroids[this.asteroids.length-1].setup();
    },
    
    remove : function(n) {
        this.asteroids.splice(n,1);
        for (var n = 0; n < random(1,3); n++) {
            this.add();
        }
    },
    
    setup: function() {
        for (var n = 0; n < random(1,10); n++) {
            this.add();
        }
    },
    draw : function() {
        for (var i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw();
        }
    },
    move : function() {
        for (var i = 0; i < this.asteroids.length; i++) {            
            this.asteroids[i].center.x += this.asteroids[i].directionX;
            this.asteroids[i].center.y += this.asteroids[i].directionY;
            for (var j = 0; j < this.asteroids[i].points.length; j++) {                                
                this.asteroids[i].points[j].x += this.asteroids[i].directionX;
                this.asteroids[i].points[j].y += this.asteroids[i].directionY;

                // if offscreen, wrap and recompute points
                if (this.asteroids[i].center.x < -width/2) {
                    this.asteroids[i].center.x = width/2;
                    this.asteroids[i].setupPoints();
                } else if (this.asteroids[i].center.x > width/2) {
                    this.asteroids[i].center.x = -width/2;
                    this.asteroids[i].setupPoints();
                }
                if (this.asteroids[i].center.y < -height/2) {
                    this.asteroids[i].center.y = height/2;
                    this.asteroids[i].setupPoints();
                } else if (this.asteroids[i].center.y > height/2) {
                    this.asteroids[i].center.y = -height/2;
                    this.asteroids[i].setupPoints();
                }
            }
        }
    }
    
}

var missile = {
    point : null,
    angle : null,
    speed : 3,
    setup : function() {
        this.point = createVector(spaceship.points[0].x, spaceship.points[0].y);
        this.angle = spaceship.angle;        
    },
    draw : function() {
        fill(255);
        ellipse(this.point.x, this.point.y, 10, 10);
        fill(0);
    },
    move : function() {              
        if (this.angle == 0 || this.angle == PI * 2) {
            this.point.y -= this.speed;
        } else if (this.angle > 0 && this.angle < PI * 0.5) {
            this.point.x += this.speed;
            this.point.y -= this.speed;
        } else if (this.angle == PI * 0.5) {
            this.point.x += this.speed;
        } else if (this.angle > PI * 0.5 && this.angle < PI) {
            this.point.x += this.speed;
            this.point.y += this.speed;
        } else if (this.angle == PI) {
            this.point.y += this.speed;
        } else if (this.angle > PI && this.angle < PI * 1.5) {
            this.point.x -= this.speed;
            this.point.y += this.speed;
        } else if (this.angle == PI * 1.5) {
            this.point.x -= this.speed;
        } else if (this.angle > PI * 1.5 && this.angle < PI * 2) {
            this.point.x -= this.speed;
            this.point.y -= this.speed;
        } else {
            // bug
            console.log(this.angle);
        }
        
        // check
        if (this.point.x < -width / 2 || this.point.x > width / 2 || this.point.y < -height / 2 || this.point.y > height / 2) {            
            spaceship.firing = false;
            
        }
    }
}


function setup()
{
	createCanvas(windowWidth - 100, windowHeight - 100);
    
    spaceship.setup();
    asteroidfield.setup();    
        
}

function draw()
{
    // center coordinate space
    translate(width/2, height/2);
	
	background("black");
    stroke("white");
    
    if (gameon) {
            
        spaceship.draw();

        if (spaceship.firing) {
            missile.move();        
            missile.draw();

            // check asteroid hit by missile
            for (var n = 0; n < asteroidfield.asteroids.length; n++) {
                var distance = dist(missile.point.x, missile.point.y, asteroidfield.asteroids[n].center.x, asteroidfield.asteroids[n].center.y);
                if (distance < asteroidfield.asteroids[n].size) {
                    asteroidfield.remove(n);
                    spaceship.firing = false;
                    break;
                }
            }
            
        }
        
        // check spaceship hit by asteroid
        for (var n = 0; n < asteroidfield.asteroids.length; n++) {
            console.log(spaceship.points[0].x);
            var distance = dist(spaceship.points[0].x, spaceship.points[0].y, asteroidfield.asteroids[n].center.x, asteroidfield.asteroids[n].center.y);
            if (distance < asteroidfield.asteroids[n].size) {                    
                gameon = false;
                break;
            }
        }
        
    }
    
    asteroidfield.move();
    
    asteroidfield.draw();

}

function keyPressed() {
    
	if(key == 'A' || keyCode == 37)
	{
		spaceship.rotate(-PI/4);
	}

	if(key == 'D' || keyCode == 39)
	{
		spaceship.rotate(PI/4);
	}

	if(key == ' ' || key == 'W')
	{
        //if (!spaceship.firing) {
            spaceship.firing = true;
            missile.setup();
        //}
	}
}