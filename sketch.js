let score = 0;
let totalScore = 0;
let clicks = 0;
let totalClicks = 0;
let victories = 0;
let totalBattles = 0;
let invitedFriends = 0;
let totalTONEarned = 0;
let level = 1;
let nextLevelScore = 1000;
let clickPower = 4;
let circleSize = 100;
let circleX, circleY;
let animationScale = 1;
let isAnimating = false;
let playerName = "Игрок";

let profileWindowOpen = false;
let achievementsWindowOpen = false;
let leaderboardWindowOpen = false;

let rewardGeneratedTime = 0;
const rewardInterval = 12 * 60 * 60 * 1000;

let achievements = [];
let leaderboard = [];
let scrollOffset = 0;

const TOKEN = '6614618999:AAGWioIuwEL1zNA9Z0m6ZLAbQv9g4Wgo2Mk'; // Токен не удален, как вы просили
const BASE_URL = `https://api.telegram.org/bot${TOKEN}/getUpdates`;

let animations = [];

function getUpdates() {
    fetch(BASE_URL)
        .then(response => response.json())
        .then(data => {
            const updates = data.result;
            if (updates.length > 0) {
                const message = updates[0].message;
                playerName = message.from.first_name || 'Игрок';
            }
        })
        .catch(error => console.error('Ошибка при получении обновлений:', error));
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
    textAlign(CENTER, CENTER);

    circleX = width / 2;
    circleY = height / 2 + 50;

    for (let i = 1; i <= 100; i++) {
        leaderboard.push({
            name: `Игрок${i}`,
            score: int(random(5000, 50000)),
            ton: int(random(100, 1000))
        });
    }

    achievements = [
        { name: "За 50 кликов", condition: () => clicks >= 50, achieved: false, reward: 1000, claimed: false },
        { name: "За 10 побед", condition: () => victories >= 10, achieved: false, reward: 2000, claimed: false },
        { name: "За 10 битв", condition: () => totalBattles >= 10, achieved: false, reward: 2000, claimed: false },
        { name: "За вход в игру", condition: () => millis() - rewardGeneratedTime >= rewardInterval, achieved: true, reward: 1500, claimed: false }
    ];

    checkRewardGeneration();
    getUpdates();
}

function draw() {
    background(20);
    textAlign(CENTER, CENTER);

    checkRewardGeneration();

    if (!profileWindowOpen && !achievementsWindowOpen && !leaderboardWindowOpen) {
        drawClickerScene();
        drawInterfaceButtons();
    }

    if (profileWindowOpen) {
        drawWindow("Профиль", drawPlayerProfile);
    }
    if (achievementsWindowOpen) {
        drawWindow("Достижения", drawAchievements);
    }
    if (leaderboardWindowOpen) {
        drawLeaderboardWindow();
    }

    if (isAnimating) {
        animationScale += 0.05;
        if (animationScale > 1.2) {
            animationScale = 1;
            isAnimating = false;
        }
    }

    for (let i = animations.length - 1; i >= 0; i--) {
        let anim = animations[i];
        anim.y -= 1;
        anim.alpha -= 5;
        fill(255, anim.alpha);
        text(`+${anim.value}`, anim.x, anim.y);
        if (anim.alpha <= 0) {
            animations.splice(i, 1);
        }
    }
}

function drawClickerScene() {
    fill(255);
    textSize(24);
    text(`Очки: ${score}`, width / 2, height / 2 - 100);
    text(`Уровень: ${level}`, width / 2, height / 2 - 60);
    drawClickableCircle();
}

function drawClickableCircle() {
    fill(0, 150, 255);
    stroke(255);
    strokeWeight(4);
    ellipse(circleX, circleY, circleSize * animationScale, circleSize * animationScale);
}

function mousePressed() {
    if (!profileWindowOpen && !achievementsWindowOpen && !leaderboardWindowOpen) {
        if (dist(mouseX, mouseY, circleX, circleY) < circleSize * animationScale / 2) {
            addPoints(1);
            triggerAnimation(mouseX, mouseY, clickPower);
        }
    }
}

function addPoints(numTouches) {
    let pointsToAdd = clickPower * numTouches;
    score += pointsToAdd;
    totalScore += pointsToAdd;
    clicks += numTouches;
    totalClicks += numTouches;

    if (score >= nextLevelScore) {
        level++;
        nextLevelScore *= 2;
    }

    isAnimating = true;
    checkAchievements();
}

function drawInterfaceButtons() {
    drawButton("Профиль", width / 2 - 180, height / 2 - 230, toggleProfileWindow);
    drawButton("Достижения", width / 2 - 60, height / 2 - 230, toggleAchievementsWindow);
    drawButton("Топ", width / 2 + 60, height / 2 - 230, toggleLeaderboardWindow);
}

function drawButton(label, x, y, onClick) {
    fill(0, 150, 255);
    stroke(255);
    strokeWeight(2);
    Продолжаем с завершением кода `sketch.js`:

```javascript
    rect(x, y, 80, 30, 10);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(label, x + 40, y + 15);

    if (mouseIsPressed && mouseX > x && mouseX < x + 80 && mouseY > y && mouseY < y + 30) {
        onClick();
    }
}

function drawWindow(title, content) {
    fill(50);
    stroke(255);
    rect(width / 2 - 170, height / 2 - 170, 340, 340, 20);
    
    fill(255);
    textSize(18);
    textAlign(CENTER, TOP);
    text(title, width / 2, height / 2 - 150);

    content();
    drawCloseButton();
}

function drawCloseButton() {
    fill(255, 0, 0);
    rect(width / 2 + 70, height / 2 + 130, 80, 30, 10);
    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Закрыть", width / 2 + 110, height / 2 + 145);

    if (mouseIsPressed && mouseX > width / 2 + 70 && mouseX < width / 2 + 150 && mouseY > height / 2 + 130 && mouseY < height / 2 + 160) {
        closeAllWindows();
    }
}

function closeAllWindows() {
    profileWindowOpen = false;
    achievementsWindowOpen = false;
    leaderboardWindowOpen = false;
}

function toggleProfileWindow() {
    closeAllWindows();
    profileWindowOpen = !profileWindowOpen;
}

function toggleAchievementsWindow() {
    closeAllWindows();
    achievementsWindowOpen = !achievementsWindowOpen;
}

function toggleLeaderboardWindow() {
    closeAllWindows();
    leaderboardWindowOpen = !leaderboardWindowOpen;
    if (leaderboardWindowOpen) {
        populateLeaderboard();  // Загружаем данные таблицы лидеров при открытии окна
    }
}

function populateLeaderboard() {
    const leaderboardWindow = document.getElementById('leaderboardContent');
    leaderboardWindow.innerHTML = ""; // Очищаем старый контент

    leaderboard.sort((a, b) => b.score - a.score); // Сортируем таблицу лидеров

    for (let i = 0; i < leaderboard.length; i++) {
        let player = leaderboard[i];
        const playerElement = document.createElement('div');
        playerElement.classList.add('playerEntry');
        playerElement.innerText = `${i + 1}. ${player.name} — Очки: ${player.score}, TON: ${player.ton}`;
        leaderboardWindow.appendChild(playerElement);
    }

    document.getElementById('leaderboardWindow').style.display = 'block';
}

document.getElementById('closeButton').addEventListener('click', function() {
    document.getElementById('leaderboardWindow').style.display = 'none';
    leaderboardWindowOpen = false;
});

function drawLeaderboardWindow() {
    // Эта функция будет пустой, потому что мы уже отображаем список игроков через DOM-элементы
}

function drawPlayerProfile() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Имя: ${playerName}`, width / 2 - 150, height / 2 - 120);
    text(`Уровень: ${level}`, width / 2 - 150, height / 2 - 90);
    text(`Очки: ${score}`, width / 2 - 150, height / 2 - 60);
    text(`Всего очков: ${totalScore}`, width / 2 - 150, height / 2 - 30);
    text(`Клики: ${clicks}`, width / 2 - 150, height / 2);
    text(`Всего кликов: ${totalClicks}`, width / 2 - 150, height / 2 + 30);
    text(`Победы: ${victories}`, width / 2 - 150, height / 2 + 60);
    text(`Всего битв: ${totalBattles}`, width / 2 - 150, height / 2 + 90);
    text(`Приглашенные друзья: ${invitedFriends}`, width / 2 - 150, height / 2 + 120);
    text(`Заработано TON: ${totalTONEarned}`, width / 2 - 150, height / 2 + 150);
}

function checkAchievements() {
    for (let achievement of achievements) {
        if (achievement.condition() && !achievement.achieved) {
            achievement.achieved = true;
        }
    }
}

function checkRewardGeneration() {
    if (millis() - rewardGeneratedTime >= rewardInterval) {
        rewardGeneratedTime = millis();
        let newAchievement = {
            name: `За ${clicks + 50} кликов`,
            condition: () => clicks >= clicks + 50,
            achieved: false,
            reward: (level + 1) * 1000,
            claimed: false
        };
        achievements.push(newAchievement);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
