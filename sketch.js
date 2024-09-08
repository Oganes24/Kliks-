let score = 0;
let totalScore = 0;  // Всего очков за все время
let clicks = 0;
let totalClicks = 0;  // Всего кликов за все время
let victories = 0;  // Всего побед
let totalBattles = 0;  // Всего битв
let invitedFriends = 0;  // Всего приглашенных друзей
let totalTONEarned = 0;  // Всего заработано TON
let level = 1;
let nextLevelScore = 1000;  // Очки для достижения следующего уровня
let clickPower = 4;  // За один клик дается 4 очка
let circleSize = 100;
let circleX, circleY;
let animationScale = 1;
let isAnimating = false;

let profileWindowOpen = false;
let achievementsWindowOpen = false;
let leaderboardWindowOpen = false; // Окно для топа игроков

let rewardGeneratedTime = 0;
const rewardInterval = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах для генерации наград

let achievements = [];
let leaderboard = []; // Топ-игроки будут генерироваться автоматически
let scrollOffset = 0; // Прокрутка для списка игроков

// Telegram API Token и Chat ID
const TOKEN = '6614618999:AAGWioIuwEL1zNA9Z0m6ZLAbQv9g4Wgo2Mk';  // Токен бота
const BASE_URL = `https://api.telegram.org/bot${TOKEN}/getUpdates`;

// Для анимации "+4"
let animations = [];

// Получение обновлений из Telegram
function getUpdates() {
    fetch(BASE_URL)
        .then(response => response.json())
        .then(data => {
            const updates = data.result;
            if (updates.length > 0) {
                const message = updates[0].message;
                const firstName = message.from.first_name || 'Игрок';
                displayPlayerName(firstName);
            }
        })
        .catch(error => console.error('Ошибка при получении обновлений:', error));
}

// Отображение имени игрока в HTML
function displayPlayerName(name) {
    const playerName = document.getElementById('player-name');
    playerName.innerText = `Имя игрока: ${name}`;
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
    textAlign(CENTER, CENTER);

    circleX = width / 2;
    circleY = height / 2 + 50;

    // Инициализация топа игроков с 100 местами
    for (let i = 1; i <= 100; i++) {
        leaderboard.push({
            name: `Игрок${i}`,
            score: int(random(5000, 50000)), // Случайные очки для демонстрации
            ton: int(random(100, 1000)) // Случайные TON для демонстрации
        });
    }

    // Первоначальные достижения
    achievements = [
        {name: "За 50 кликов", condition: () => clicks >= 50, achieved: false, reward: 1000, claimed: false},
        {name: "За 10 побед", condition: () => victories >= 10, achieved: false, reward: 2000, claimed: false},
        {name: "За 10 битв", condition: () => totalBattles >= 10, achieved: false, reward: 2000, claimed: false},
        {name: "За вход в игру", condition: () => millis() - rewardGeneratedTime >= rewardInterval, achieved: true, reward: 1500, claimed: false}
    ];

    checkRewardGeneration();
    getUpdates();  // Получаем имя пользователя из Telegram
}

function draw() {
    background(20);
    textAlign(CENTER, CENTER);

    // Проверяем и генерируем награды каждые 12 часов
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
        drawWindow("Топ игроков", drawLeaderboard);
    }

    if (isAnimating) {
        animationScale += 0.05;
        if (animationScale > 1.2) {
            animationScale = 1;
            isAnimating = false;
        }
    }

    // Отрисовка анимаций "+4" или других чисел
    for (let i = animations.length - 1; i >= 0; i--) {
        let anim = animations[i];
        anim.y -= 1;  // Поднимаем текст вверх
        anim.alpha -= 5;  // Плавное исчезновение
        fill(255, anim.alpha);
        text(`+${anim.value}`, anim.x, anim.y);
        if (anim.alpha <= 0) {
            animations.splice(i, 1);  // Удаляем анимацию, когда она исчезла
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

function touchStarted() {
    // Поддержка до 8 одновременных касаний
    for (let i = 0; i < touches.length && i < 8; i++) {
        let touch = touches[i];
        if (dist(touch.x, touch.y, circleX, circleY) < circleSize * animationScale / 2) {
            addPoints(touches.length);  // Начисляем очки в зависимости от количества пальцев
            triggerAnimation(touch.x, touch.y, clickPower * touches.length);  // Анимация для каждого касания
        }
    }
    return false;
}

function addPoints(numTouches) {
    let pointsToAdd = clickPower * numTouches;
    score += pointsToAdd;
    totalScore += pointsToAdd;
    clicks += numTouches;
    totalClicks += numTouches;

    // Отправка сообщения при достижении нового уровня
    if (score >= nextLevelScore) {
        level++;
        nextLevelScore *= 2;  // Увеличиваем необходимое количество очков для следующего уровня в 2 раза
    }

    isAnimating = true;
    checkAchievements();
}

function triggerAnimation(x, y, value) {
    let offsetX = random(-30, 30);  // Случайное смещение по горизонтали
    let offsetY = random(-30, 30);  // Случайное смещение по вертикали
    animations.push({x: x + offsetX, y: y + offsetY, value: value, alpha: 255});
}

function drawInterfaceButtons() {
    drawButton("Профиль", width / 2 - 180, height / 2 - 230, toggleProfileWindow);
    drawButton("Достижения", width / 2 - 60, height / 2 - 230, toggleAchievementsWindow);
    drawButton("Топ", width / 2 + 60, height / 2 - 230, toggleLeaderboardWindow);  // Кнопка для топа игроков
}

function drawButton(label, x, y, onClick) {
    fill(0, 150, 255);
    stroke(255);
    strokeWeight(2);
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
    rect(width / 2 - 170, height / 2 - 170, 340, 340, 20);  // Увеличиваем окно профиля для большего количества данных
    
    fill(255);
    textSize(18);
    textAlign(CENTER, TOP);
    text(title, width / 2, height / 2 - 150);

    content();
    drawCloseButton();
}

function drawCloseButton() {
        fill(255, 0, 0);
    rect(width / 2 + 70, height / 2 + 130, 80, 30, 10);  // Смещаем кнопку для большего окна
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
}

function drawPlayerProfile() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(16);
    text(`Имя: Игрок`, width / 2 - 150, height / 2 - 120);
    text(`Уровень: ${level}`, width / 2 - 150, height / 2 - 90);
    text(`Очки: ${score}`, width / 2 - 150, height / 2 - 60);
    text(`Всего очков: ${totalScore}`, width / 2 - 150, height / 2 - 30);  // Очки за все время
    text(`Клики: ${clicks}`, width / 2 - 150, height / 2);  // Текущие клики
    text(`Всего кликов: ${totalClicks}`, width / 2 - 150, height / 2 + 30);  // Все клики
    text(`Победы: ${victories}`, width / 2 - 150, height / 2 + 60);  // Победы
    text(`Всего битв: ${totalBattles}`, width / 2 - 150, height / 2 + 90);  // Все битвы
    text(`Приглашенные друзья: ${invitedFriends}`, width / 2 - 150, height / 2 + 120);  // Приглашенные друзья
    text(`Заработано TON: ${totalTONEarned}`, width / 2 - 150, height / 2 + 150);  // Заработано TON
}

function drawAchievements() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    let yOffset = height / 2 - 110;

    for (let achievement of achievements) {
        // Фиксированное выравнивание текста
        let textX = width / 2 - 130;
        let rewardText = `${achievement.name} - ${achievement.reward}`;

        fill(achievement.achieved ? 'green' : 'white');
        textAlign(LEFT, TOP);
        text(rewardText, textX, yOffset);

        if (achievement.achieved && !achievement.claimed) {
            drawRewardButton(width / 2 + 40, yOffset, achievement);  // Сдвинуты кнопки левее
        } else if (achievement.claimed) {
            drawInactiveRewardButton(width / 2 + 40, yOffset);  // Сдвинуты кнопки левее
        }

        yOffset += 40;
    }
}

function drawRewardButton(x, y, achievement) {
    fill(0, 255, 0);
    stroke(255);
    strokeWeight(2);
    rect(x, y - 10, 100, 30, 10);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Забрать", x + 50, y + 5);

    if (mouseIsPressed && mouseX > x && mouseX < x + 100 && mouseY > y - 10 && mouseY < y + 20) {
        claimReward(achievement);
    }
}

function drawInactiveRewardButton(x, y) {
    fill(100);
    stroke(255);
    strokeWeight(2);
    rect(x, y - 10, 100, 30, 10);
    fill(255);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Забрано", x + 50, y + 5);
}

function claimReward(achievement) {
    score += achievement.reward;
    achievement.claimed = true;
}

function drawLeaderboard() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);  // Уменьшаем размер текста
    let yOffset = height / 2 - 130 + scrollOffset; // Добавляем scrollOffset для прокрутки и смещаем ниже

    for (let i = 0; i < leaderboard.length; i++) {
        let player = leaderboard[i];
        let textX = width / 2 - 150;  // Сдвигаем текст левее
        text(`${i + 1}. ${player.name}`, textX, yOffset);
        text(`Очки: ${player.score}`, textX + 100, yOffset);
        text(`TON: ${player.ton}`, textX + 200, yOffset);
        yOffset += 25;  // Уменьшаем расстояние между строками
    }
}

// Реализуем прокрутку списка
function mouseWheel(event) {
    if (leaderboardWindowOpen) {
        scrollOffset += event.delta;
        scrollOffset = constrain(scrollOffset, -1500, 0);  // Ограничиваем прокрутку
    }
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
        // Генерация нового достижения каждые 12 часов
        let newAchievement = {
            name: `За ${clicks + 50} кликов`,
            condition: () => clicks >= clicks + 50,
            achieved: false,
            reward: (level + 1) * 1000,  // Награда зависит от уровня
            claimed: false
        };
        achievements.push(newAchievement);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}