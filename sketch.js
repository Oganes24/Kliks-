let player;
let obstacles = [];
let gameOver = false;

function setup() {
    createCanvas(400, 400);
    player = new Player();
    frameRate(60);
}

function draw() {
    background(220);

    if (!gameOver) {
        player.update();
        player.display();

        if (frameCount % 60 == 0) {
            obstacles.push(new Obstacle());
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].display();

            if (obstacles[i].hits(player)) {
                gameOver = true;
                textSize(32);
                fill(255, 0, 0);
                text('Game Over!', 100, 200);
                noLoop();
            }

            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1);
            }
        }
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        player.move(-20);
    } else if (keyCode === RIGHT_ARROW) {
        player.move(20);
    }
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 20;
        this.size = 20;
    }

    update() {
        this.x = constrain(this.x, 0, width - this.size);
    }

    display() {
        fill(0);
        rect(this.x, this.y, this.size, this.size);
    }

    move(step) {
        this.x += step;
    }
}

class Obstacle {
    constructor() {
        this.x = random(width);
        this.y = 0;
        this.size = 20;
        this.speed = 5;
    }

    update() {
        this.y += this.speed;
    }

    display() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }

    offscreen() {
        return (this.y > height);
    }

    hits(player) {
        let distance = dist(this.x, this.y, player.x + player.size / 2, player.y + player.size / 2);
        return (distance < this.size / 2 + player.size / 2);
    }
}