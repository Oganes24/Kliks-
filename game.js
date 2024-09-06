let font;
let score = 0;
let level = 1;
let particles = 20;
let particleList = [];
let levelProgress = 0;
let nextLevelScore = 1000;
let canClick = true;
let circleSize = 150;
let targetSize = 150;
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

let daysInGame = 0;
let totalWins = 0;
let totalBattles = 0;
let totalLosses = 0;
let totalClicks = 0;
let totalPoints = 0;
let coins = 100;

let clickIntervals = new Array(5).fill(0);
let lastClickTime = 0;
let isBlocked = false;
let blockStartTime = 0;
let blockDuration = 120000;

// Переменные для достижения
let achievementsX, achievementsY;
let isAchievementsPopupVisible = false;

let popupWidth = 300;
let popupHeight = 200;
let popupX, popupY;
let popupTargetX, popupTargetY;

let scrollY = 0;
let scrollVelocity = 0;
let totalContentHeight;
let scrollLimit;

let animationAlpha = 0;
let popupAnimationSpeed = 10;

let achievementsList = [];
let rewardsList = [];

function setup() {
    createCanvas(400, 800);
    textSize(20);
    textAlign(CENTER, CENTER);
    circleColor = color(0, 150, 255);
    
    profileX = 10;
    profileY = 10;
    
    achievementsX = 10;
    achievementsY = 100;
    
    popupWidth += 60;
    popupHeight += 60;
    popupX = (width - popupWidth) * 0.48;
    popupY = (height - popupHeight) / 2 - 50;
    popupTargetX = popupX;
    popupTargetY = popupY;
    
    generateAchievements();
    updateScrollLimit();
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
    
    if (isBlocked) {
        drawBlockTimer();
    }
    
    if (isPopupVisible) {
        drawPopup();
    }
    
    if (isAchievementsPopupVisible) {
        drawAchievementsPopup();
        animatePopup();
        animateScroll();
    }
    
    drawAchievementsButton();
    checkBlockStatus();
}

function mousePressed() {
    let currentTime = millis();
    if (canClick && !isBlocked && dist(mouseX, mouseY, width / 2, height / 2 + 50) < circleSize / 2) {
        updateClickIntervals(currentTime);
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
        
        lastClickTime = currentTime;
        canClick = false;
    }
    
    if (isMouseOverProfile()) {
        isPopupVisible = !isPopupVisible;
    }
    
    if (isPopupVisible && isMouseOverButton((width - 250) / 2 + 150, (height - 320) / 2 - 50 + 280, 80, 30)) {
        isPopupVisible = false;
    }
    
    if (isAchievementsPopupVisible && mouseX > popupX + popupWidth - 100 && mouseX < popupX + popupWidth - 20 && mouseY > popupY + popupHeight - 40 && mouseY < popupY + popupHeight - 20) {
        isAchievementsPopupVisible = false;
        animationAlpha = 0;
    }
    
    if (mouseX > achievementsX && mouseX < achievementsX + profileWidth && mouseY > achievementsY && mouseY < achievementsY + profileHeight) {
        isAchievementsPopupVisible = true;
        scrollY = 0;
        scrollVelocity = 0;
        animationAlpha = 0;
        popupX = popupTargetX - 30;
    }
}

function mouseDragged() {
    if (isAchievementsPopupVisible && mouseY > popupY && mouseY < popupY + popupHeight) {
        let newScrollY = scrollY + mouseY - pmouseY;
        scrollVelocity = mouseY - pmouseY;
        scrollY = constrain(newScrollY, scrollLimit, 0);
    }
}

function updateClickIntervals(currentTime) {
    let interval = currentTime - lastClickTime;
    
    for (let i = 0; i < clickIntervals.length - 1; i++) {
        clickIntervals[i] = clickIntervals[i + 1];
    }
    clickIntervals[clickIntervals.length - 1] = interval;
    
    let allEqual = clickIntervals.every((val, i, arr) => val === arr[0]);
    
    if (allEqual) {
        isBlocked = true;
        blockStartTime = millis();
    }
}

function checkBlockStatus() {
    if (isBlocked && millis() - blockStartTime > blockDuration) {
        isBlocked = false;
    }
}

function drawBlockTimer() {
    let remainingTime = (blockDuration - (millis() - blockStartTime)) / 1000;
    fill(255, 0, 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Блокировка за автокликер", profileX + profileWidth / 2, profileY + profileHeight + 30);
    text("Осталось: " + remainingTime + " сек", profileX + profileWidth / 2, profileY + profileHeight + 50);
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
    text("Дней в игре: " + daysInGame, popupX + 20, popupY + 150);
    text("Всего побед: " + totalWins, popupX + 20, popupY + 180);
    text("Всего битв: " + totalBattles, popupX + 20, popupY + 210);
    text("Всего поражений: " + totalLosses, popupX + 20, popupY + 240);
    text("Всего кликов: " + totalClicks, popupX + 20, popupY + 270);
    text("Всего очков: " + totalPoints, popupX + 20, popupY + 300);

    drawButton("Закрыть", popupX + popupWidth - 100, popupY + popupHeight - 40, 80, 30);
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
    fill(circleColor, animationAlpha);
    noStroke();
    rect(popupX, popupY, popupWidth, popupHeight, 20);
    fill(255, animationAlpha);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Достижения", popupX + popupWidth / 2, popupY + 30);

    let textOffsetX = popupWidth * -0.015;
    let offsetY = 60;

    for (let i = 0; i < Math.min(10, achievementsList.length); i++) {
        let elementY = popupY + offsetY + scrollY;
        if (elementY > popupY + 40 && elementY < popupY + popupHeight - 40) {
            fill(255, animationAlpha);
            textAlign(LEFT, CENTER);
            let achievement = achievementsList[i];
            text(achievement, popupX + 20 + textOffsetX, elementY);
            
            textAlign(RIGHT, CENTER);
            textSize(12);
            fill(255, 0, 0, animationAlpha);
            text(rewardsList[i] + " очков", popupX + popupWidth - 120 + textOffsetX, elementY);

            drawButton("Забрать", popupX + popupWidth - 100, elementY - 10, 80, 20, animationAlpha);
        }
        offsetY += 40;
    }

    drawButton("Закрыть", popupX + popupWidth - 100, popupY + popupHeight - 40, 80, 20, animationAlpha);
}

function drawButton(label, x, y, w, h, alpha) {
    fill(circleColor, alpha);
    stroke(255, alpha);
    strokeWeight(2);
    rect(x, y, w, h, 10);
    
    fill(255, alpha);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(label, x + w / 2, y + h / 2);
}

function animatePopup() {
    if (animationAlpha < 255) {
        animationAlpha += popupAnimationSpeed;
    }

    if (popupX < popupTargetX) {
        popupX += popupAnimationSpeed / 2;
    }
}

function animateScroll() {
    if (scrollVelocity !== 0) {
        scrollY += scrollVelocity;
        scrollY = constrain(scrollY, scrollLimit, 0);
        scrollVelocity *= 0.9;
        if (Math.abs(scrollVelocity) < 1) {
            scrollVelocity = 0;
        }
    }
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

    achievementsList.push("Завершите 10 битв");
    rewardsList.push(300);

    achievementsList.push("Сыграйте 5 дней подряд");
    rewardsList.push(250);

    achievementsList.push("Соберите 3 редких предмета");
    rewardsList.push(400);

    updateScrollLimit();
}

function updateScrollLimit() {
    totalContentHeight = achievementsList.length * 40;
    scrollLimit = -(totalContentHeight - popupHeight + 50);
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