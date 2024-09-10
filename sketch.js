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
let shopWindowOpen = false;

let rewardGeneratedTime = 0;
const rewardInterval = 12 * 60 * 60 * 1000;

let achievements = [];
let leaderboard = [];
let scrollOffset = 0;
let shopIndex = 0; // Для магазина

const TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE'; // Вставь свой токен Telegram
const BASE_URL = `https://api.telegram.org/bot${TOKEN}/getUpdates`;

let animations = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    textSize(16);
    textAlign(CENTER, CENTER);

    circleX = width / 2;
    circleY = height / 2 + 50;

    // Генерация случайных данных для топа
    for (let i = 1; i <= 100; i++) {
        leaderboard.push({
            name: `Игрок${i}`,
            score: int(random(5000, 50000)),
            ton: int(random(100, 1000))
        });
    }

    achievements = [
        {name: "За 50 кликов", condition: () => clicks >= 50, achieved: false, reward: 1000, claimed: false},
        {name: "За 10 побед", condition: () => victories >= 10, achieved: false, reward: 2000, claimed: false},
        {name: "За 10 битв", condition: () => totalBattles >= 10, achieved: false, reward: 2000, claimed: false},
        {name: "За вход в игру", condition: () => millis() - rewardGeneratedTime >= rewardInterval, achieved: true, reward: 1500, claimed: false}
    ];

    checkRewardGeneration();
    updateLeaderboardContent();
    getUpdatesFromTelegram(); // Интеграция с Telegram
}

function draw() {
    background(20);
    textAlign(CENTER, CENTER);

    checkRewardGeneration();

    if (!profileWindowOpen && !achievementsWindowOpen && !leaderboardWindowOpen && !shopWindowOpen) {
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
    if (shopWindowOpen) {
        drawShop(); // Окно магазина
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
    if (!profileWindowOpen && !achievementsWindowOpen && !leaderboardWindowOpen && !shopWindowOpen) {
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

function triggerAnimation(x, y, value) {
    let offsetX = random(-30, 30);
    let offsetY = random(-30, 30);
    animations.push({x: x + offsetX, y: y + offsetY, value: value, alpha: 255});
}

function drawInterfaceButtons() {
    let buttonY = height / 2 - 150; // Позиция кнопок теперь над кругом
    let shopButtonY = height - 60; // Кнопка "Магазин" внизу

    drawButton("Профиль", width / 2 - 130, buttonY, toggleProfileWindow); // Профиль слева
    drawButton("Достижения", width / 2 - 50, buttonY, toggleAchievementsWindow); // Достижения по центру
    drawButton("Топ", width / 2 + 40, buttonY, toggleLeaderboardWindow); // Топ справа
    drawButton("Магазин", width / 2 - 40, shopButtonY, toggleShopWindow); // Кнопка "Магазин" внизу
}

function drawButton(label, x, y, onClick) {
    if (isButtonPressAllowed()) {
        fill(0, 150, 255);
        stroke(255);
        strokeWeight(2);
        rect(x, y, 80, 30, 10);
        fill(255);
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text(label, x + 40, y + 15);
    }

    if (mouseIsPressed && mouseX > x && mouseX < x + 80 && mouseY > y && mouseY < y + 30) {
        onClick();
    }
}

function isButtonPressAllowed() {
    if (millis() - lastButtonPressTime > buttonPressDelay) {
        lastButtonPressTime = millis();
        return true;
    }
    return false;
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
    shopWindowOpen = false;
    document.getElementById('leaderboardWindow').style.display = 'none';
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
        document.getElementById('leaderboardWindow').style.display = 'block';
    }
}

function toggleShopWindow() {
    closeAllWindows();
    shopWindowOpen = !shopWindowOpen;
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

function drawAchievements() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    let yOffset = height / 2 - 110;

    for (let achievement of achievements) {
        let textX = width / 2 - 130;
        let rewardText = `${achievement.name} - ${achievement.reward}`;

        fill(achievement.achieved ? 'green' : 'white');
        textAlign(LEFT, TOP);
        text(rewardText, textX, yOffset);

        if (achievement.achieved && !achievement.claimed) {
            drawRewardButton(width / 2 + 40, yOffset, achievement);
        } else if (achievement.claimed) {
            drawInactiveRewardButton(width / 2 + 40, yOffset);
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

function drawShop() {
    const shopItems = [
        {color: 'Синий', health: 100, damage: 10, price: 500},
        {color: 'Зеленый', health: 150, damage: 15, price: 1000},
        {color: 'Красный', health: 200, damage: 20, price: 1500},
        {color: 'Желтый', health: 250, damage: 25, price: 2000},
        {color: 'Фиолетовый', health: 300, damage: 30, price: 2500}
    ];

    let currentItem = shopItems[shopIndex];

    fill(currentItem.color.toLowerCase());
    ellipse(width / 2, height / 2, 100, 100);

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(`${currentItem.color} круг - Здоровье: ${currentItem.health}, Урон: ${currentItem.damage}, Цена: ${currentItem.price}`, width / 2, height / 2 + 100);

    drawButton("Назад", width / 2 - 120, height / 2 + 150, () => changeShopItem('prev'));
    drawButton("Купить", width / 2 - 40, height / 2 + 150, () => buyItem(currentItem));
    drawButton("Вперед", width / 2 + 40, height / 2 + 150, () => changeShopItem('next'));

    drawButton("Выход", width / 2 - 40, height / 2 + 190, toggleShopWindow);
}

function buyItem(item) {
    if (score >= item.price) {
        score -= item.price;
        console.log(`Куплен ${item.color} круг с уроном ${item.damage} и здоровьем ${item.health}`);
        // Логика добавления предмета игроку, если нужно
    } else {
        console.log("Недостаточно очков для покупки!");
    }
}

function changeShopItem(direction) {
    const shopItems = [
        {color: 'Синий', health: 100, damage: 10, price: 500},
        {color: 'Зеленый', health: 150, damage: 15, price: 1000},
        {color: 'Красный', health: 200, damage: 20, price: 1500},
        {color: 'Желтый', health: 250, damage: 25, price: 2000},
        {color: 'Фиолетовый', health: 300, damage: 30, price: 2500}
    ];

    if (direction === 'next' && shopIndex < shopItems.length - 1) {
        shopIndex++;
    } else if (direction === 'prev' && shopIndex > 0) {
        shopIndex--;
    }
}

function drawLeaderboard() {
    fill(50, 50, 50, 200); // Прозрачный фон окна
    stroke(255);
    strokeWeight(2);
    rect(width / 2 - 170, height / 2 - 170, 340, 340, 20); // Ограничение окна по высоте

    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    let yOffset = height / 2 - 150 + scrollOffset;

    for (let i = 0; i < leaderboard.length; i++) {
        let player = leaderboard[i];
        let textX = width / 2 - 150;

        // Плавное исчезновение при прокрутке
        let distanceFromCenter = abs(height / 2 - (yOffset + (i * 25)));
        let alpha = map(distanceFromCenter, 0, height / 2, 255, 0);
        alpha = constrain(alpha, 0, 255);

        fill(255, alpha);
        text(`${i + 1}. ${player.name}`, textX, yOffset);
        text(`Очки: ${player.score}`, textX + 100, yOffset);
        text(`TON: ${player.ton}`, textX + 200, yOffset);
        yOffset += 25;
    }
}

function mouseWheel(event) {
    if (leaderboardWindowOpen) {
        scrollOffset += event.delta;
        scrollOffset = constrain(scrollOffset, -1500, 0);
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

function updateLeaderboardContent() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    leaderboardContent.innerHTML = ''; // Очищаем предыдущий контент

    leaderboard.forEach((player, index) => {
        const playerEntry = document.createElement('div');
        playerEntry.classList.add('playerEntry');
        playerEntry.innerHTML = `<div>${index + 1}. ${player.name}</div><div>Очки: ${player.score} TON: ${player.ton}</div>`;
        leaderboardContent.appendChild(playerEntry);
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function getUpdatesFromTelegram() {
    fetch(BASE_URL)
        .then(response => response.json())
        .then(data => {
            const updates = data.result;
            if (updates.length > 0) {
                const message = updates[0].message;
                playerName = message.from.first_name || 'Игрок';
                displayPlayerName(playerName);
            }
        })
        .catch(error => console.error('Ошибка при получении обновлений:', error));
}

function displayPlayerName(name) {
    const playerNameElement = document.getElementById('player-name');
    if (playerNameElement) {
        playerNameElement.innerText = `Имя игрока: ${name}`;
    }
}

function touchStarted() {
    for (let i = 0; i < touches.length && i < 8; i++) {
        let touch = touches[i];
        if (dist(touch.x, touch.y, circleX, circleY) < circleSize * animationScale / 2) {
            addPoints(touches.length);
            triggerAnimation(touch.x, touch.y, clickPower * touches.length);
        }
    }
    return false;
}

function touchEnded() {
    return false;
}

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

// Функция для отображения имени игрока на странице
function displayPlayerName(name) {
    const playerNameElement = document.getElementById('player-name');
    if (playerNameElement) {
        playerNameElement.innerText = `Имя игрока: ${name}`;
    }
}

// Управление магазином — смена товаров
function changeShopItem(direction) {
    const shopItems = [
        {color: 'Синий', health: 100, damage: 10, price: 500},
        {color: 'Зеленый', health: 150, damage: 15, price: 1000},
        {color: 'Красный', health: 200, damage: 20, price: 1500},
        {color: 'Желтый', health: 250, damage: 25, price: 2000},
        {color: 'Фиолетовый', health: 300, damage: 30, price: 2500}
    ];

    if (direction === 'next' && shopIndex < shopItems.length - 1) {
        shopIndex++;
    } else if (direction === 'prev' && shopIndex > 0) {
        shopIndex--;
    }
}

function drawShop() {
    const shopItems = [
        {color: 'Синий', health: 100, damage: 10, price: 500},
        {color: 'Зеленый', health: 150, damage: 15, price: 1000},
        {color: 'Красный', health: 200, damage: 20, price: 1500},
        {color: 'Желтый', health: 250, damage: 25, price: 2000},
        {color: 'Фиолетовый', health: 300, damage: 30, price: 2500}
    ];

    let currentItem = shopItems[shopIndex];

    fill(currentItem.color.toLowerCase());
    ellipse(width / 2, height / 2, 100, 100);

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(`${currentItem.color} круг - Здоровье: ${currentItem.health}, Урон: ${currentItem.damage}, Цена: ${currentItem.price}`, width / 2, height / 2 + 100);

    drawButton("Назад", width / 2 - 120, height / 2 + 150, () => changeShopItem('prev'));
    drawButton("Купить", width / 2 - 40, height / 2 + 150, () => buyItem(currentItem));
    drawButton("Вперед", width / 2 + 40, height / 2 + 150, () => changeShopItem('next'));

    drawButton("Выход", width / 2 - 40, height / 2 + 190, toggleShopWindow);
}

function drawInterfaceButtons() {
    let buttonY = height / 2 - 150;
    let shopButtonY = height - 60;

    drawButton("Профиль", width / 2 - 130, buttonY, toggleProfileWindow);
    drawButton("Достижения", width / 2 - 50, buttonY, toggleAchievementsWindow);
    drawButton("Топ", width / 2 + 40, buttonY, toggleLeaderboardWindow);
    drawButton("Магазин", width / 2 - 40, shopButtonY, toggleShopWindow);
}