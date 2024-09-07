let score = 0;
let level = 1;
let particles = 20;
let particleList = [];
let levelProgress = 0;
let nextLevelScore = 1000;
let circleSize = 150;
let minSize = 130;
let maxSize = 170;
let animationSpeed = 5;
let isAnimating = false;
let animationStage = 0;
let circleColor;
let profileWidth = 100;
let profileHeight = 80;
let profileX, profileY;
let isPopupVisible = false;
let totalClicks = 0;
let totalPoints = 0;
let coins = 100;
let isAchievementsPopupVisible = false;
let popupWidth = 300;
let popupHeight = 200;
let popupX, popupY;
let achievementsList = [];
let rewardsList = [];

function setup() {
    createCanvas(800, 600);  // Размер холста для Telegram Web
    textSize(20);
    textAlign(CENTER, CENTER);
    circleColor = color(0, 150, 255);
    profileX = 10;
    profileY = 10;
    popupX = (width - popupWidth) * 0.48;
    popupY = (height - popupHeight) / 2 - 50;
    generateAchievements();
}

function draw() {
    background(20);
    drawPlayerProfile();
    drawScoreAboveProgressBar();
    drawLevelProgressBar();
    if (isAnimating) {
        animateCircle();
    }
    fill(circleColor);
    ellipse(width / 2, height / 2 + 50, circleSize, circleSize);
    for (let i = particleList.length - 1; i >= 0; i--) {
        let p = particleList[i];
        p.update();
        p.display();
        if (p.isDead()) {
            particleList.splice(i, 1);
        }
    }
    if (isPopupVisible) {
        drawPopup();
    }
    if (isAchievementsPopupVisible) {
        drawAchievementsPopup();
    }
    drawAchievementsButton();
}

function mousePressed() {
    if (dist(mouseX, mouseY, width / 2, height / 2 + 50) < circleSize / 2) {
        score += 10;
        totalClicks++;
        totalPoints += 10;
        levelProgress = score / nextLevelScore;
        addParticles(width / 2, height / 2 + 50);
        isAnimating = true;
        animationStage = 0;
        if (score >= nextLevelScore) {
            level++;
            nextLevelScore *= 2;
            levelProgress = 0;
            levelUp();
        }
    }
    if (isMouseOverProfile()) {
        isPopupVisible = !isPopupVisible;
    }
}

function animateCircle() {
    if (animationStage === 0) {
        circleSize -= animationSpeed;
        if (circleSize <= minSize) {
            circleSize = minSize;
            animationStage = 1;
        }
    } else if (animationStage === 1) {
        circleSize += animationSpeed;
        if (circleSize >= maxSize) {
            circleSize = maxSize;
            animationStage = 2;
        }
    } else if (animationStage === 2) {
        circleSize -= animationSpeed;
        if (circleSize <= 150) {
            circleSize = 150;
            isAnimating = false;
        }
    }
}

function drawLevelProgressBar() {
    let barWidth = 300;
    let barHeight = 20;
    let xOffset = (width - barWidth) / 2;
    let yOffset = height / 2 - 50 - 30;
    fill(100);
    noStroke();
    rect(xOffset, yOffset, barWidth, barHeight, 10);
    fill(circleColor);
    rect(xOffset, yOffset, barWidth * levelProgress, barHeight, 10);
}

function drawScoreAboveProgressBar() {
    fill(255);
    textSize(20);
    text("Очки: " + score, width / 2, height / 2 - 130);
}

function drawPlayerProfile() {
    fill(circleColor);
    noStroke();
    rect(profileX, profileY, profileWidth, profileHeight, 20);
    fill(255);
    textSize(12);
    text("Игрок", profileX + profileWidth / 2, profileY + 20);
    drawStar(profileX + profileWidth / 2, profileY + 50, 8, 16, 5);
}

function drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function drawPopup() {
    let popupWidth = 250;
    let popupHeight = 320;
    let popupX = (width - popupWidth) / 2;
    let popupY = (height - popupHeight) / 2 - 50;
    fill(circleColor);
    noStroke();
    rect(popupX, popupY, popupWidth, popupHeight, 20);
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Информация об игроке", popupX + popupWidth / 2, popupY + 30);
    textSize(12);
    textAlign(LEFT, TOP);
    text("Имя: Игрок", popupX + 20, popupY + 60);
    text("Уровень: " + level, popupX + 20, popupY + 90);
    text("Очки: " + score, popupX + 20, popupY + 120);
    text("Всего кликов: " + totalClicks, popupX + 20, popupY + 270);
}

function drawAchievementsButton() {
    fill(circleColor);
    noStroke();
    rect(achievementsX, achievementsY, profileWidth, profileHeight, 20);
    fill(255);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("Достижения", achievementsX + profileWidth / 2, achievementsY + 20);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("🏅", achievementsX + profileWidth / 2, achievementsY + 55);
}

function drawAchievementsPopup() {
    fill(circleColor);
    noStroke();
    rect(popupX, popupY, popupWidth, popupHeight, 20);
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Достижения", popupX + popupWidth / 2, popupY + 30);
}

function addParticles(x, y) {
    for (let i = 0; i < particles; i++) {
        let angle = random(TWO_PI);
        let radius = random(0, circleSize / 2);
        let offsetX = cos(angle) * radius;
        let offsetY = sin(angle) * radius;
        let speedX = cos(angle) * random(1, 3);
        let speedY = sin(angle) * random(1, 3);
        particleList.push(new Particle(x + offsetX, y + offsetY, speedX, speedY, circleColor));
    }
}

class Particle {
    constructor(startX, startY, speedX, speedY, c) {
        this.x = startX;
        this.y = startY;
        this.speedX = speedX;
        this.speedY = speedY;
        this.lifespan = 255;
        this.size = 5;
        this.particleColor = c;
    }

        update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifespan -= 4.0;
        this.size -= 0.05;
    }

    display() {
        noStroke();
        fill(this.particleColor, this.lifespan);
        ellipse(this.x, this.y, this.size, this.size);
    }

    isDead() {
        return this.lifespan < 0 || this.size < 0;
    }
}

function generateAchievements() {
    achievementsList = [];
    rewardsList = [];

    achievementsList.push("Наберите " + (level * 100) + " очков");
    rewardsList.push(level * 50);

    achievementsList.push("Сделайте " + (level * 50) + " кликов");
    rewardsList.push(level * 25);

    achievementsList.push("Достигните уровня " + (level + 1));
    rewardsList.push(level * 100);

    if (coins >= 200) {
        achievementsList.push("Заработайте 200 монет");
        rewardsList.push(200);
    }

    if (coins >= 500) {
        achievementsList.push("Заработайте 500 монет");
        rewardsList.push(500);
    }

    if (coins >= 1000) {
        achievementsList.push("Заработайте 1000 монет");
        rewardsList.push(1000);
    }

    achievementsList.push("Сыграйте 5 дней подряд");
    rewardsList.push(250);
}

function levelUp() {
    level++;
    coins += 50;
    generateAchievements();
}

function isMouseOverProfile() {
    return mouseX > profileX && mouseX < profileX + profileWidth && mouseY > profileY && mouseY < profileY + profileHeight;
}

function isMouseOverButton(x, y, w, h) {
    return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}