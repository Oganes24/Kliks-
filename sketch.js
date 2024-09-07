let score = 0;
let targetSize = 100;
let pulse = 0; // Для анимации пульсации круга
let pulseSpeed = 0.05;

function setup() {
    createCanvas(400, 400);
    textAlign(CENTER, CENTER);
    textSize(32);
}

function draw() {
    drawAnimatedBackground();

    // Анимация круга (пульсация)
    let currentSize = targetSize + sin(pulse) * 10; // Пульсация круга
    pulse += pulseSpeed;

    // Отображение цели (круга)
    fill(0, 255, 0);
    ellipse(width / 2, height / 2, currentSize);

    // Внутренний круг для объёма
    fill(0, 150, 0);
    ellipse(width / 2, height / 2, currentSize * 0.7);

    // Отображение счёта
    fill(255);
    text('Score: ' + score, width / 2, 50);
}

function mousePressed() {
    // Проверяем, нажал ли игрок на центр круга
    let d = dist(mouseX, mouseY, width / 2, height / 2);
    if (d < targetSize / 2) {
        score++;
    }
}

function drawAnimatedBackground() {
    // Анимированный градиентный фон (движется вверх)
    for (let i = 0; i < height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(50, 100, 255), color(255, 150, 200), inter + sin(frameCount * 0.01));
        stroke(c);
        line(0, i, width, i);
    }
}