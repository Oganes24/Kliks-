PFont font;
int score = 0;
int level = 1;
int particles = 20;
ArrayList<Particle> particleList;
float levelProgress = 0;
int nextLevelScore = 1000;
boolean canClick = true;
float circleSize = 150;
float targetSize = 150;
float minSize = 130;
float maxSize = 170;
float animationSpeed = 5;
boolean isAnimating = false;
int animationStage = 0;
color circleColor = color(0, 150, 255);

int profileWidth = 100;
int profileHeight = 80;
int profileX, profileY;
boolean isPopupVisible = false;

int daysInGame = 0;
int totalWins = 0;
int totalBattles = 0;
int totalLosses = 0;
int totalClicks = 0;
int totalPoints = 0;
int coins = 100;

int[] clickIntervals = new int[5];
int lastClickTime = 0;
boolean isBlocked = false;
int blockStartTime = 0;
int blockDuration = 120000;

// Переменные для достижения
int achievementsX, achievementsY;
boolean isAchievementsPopupVisible = false;

int popupWidth = 300;
int popupHeight = 200;
int popupX, popupY;
int popupTargetX, popupTargetY;

int scrollY = 0;
float scrollVelocity = 0;
int totalContentHeight;
int scrollLimit;

int animationAlpha = 0;
float popupAnimationSpeed = 10;

ArrayList<String> achievementsList = new ArrayList<String>();
ArrayList<Integer> rewardsList = new ArrayList<Integer>();

void setup() {
  size(400, 800);
  font = createFont("Arial", 20);
  textFont(font);
  particleList = new ArrayList<Particle>();

  profileX = 10;
  profileY = 10;
  
  achievementsX = 10;
  achievementsY = 100;

  popupWidth += 60;
  popupHeight += 60;
  popupX = (int)((width - popupWidth) * 0.48);
  popupY = (height - popupHeight) / 2 - 50;
  popupTargetX = popupX;
  popupTargetY = popupY;
  
  generateAchievements();
  updateScrollLimit();
}

void draw() {
  background(20);
  
  drawPlayerProfile();
  drawScoreAboveProgressBar();
  drawLevelProgressBar();

  if (isAnimating) {
    animateCircle();
  }

  fill(circleColor);
  ellipse(width/2, height/2 + 50, circleSize, circleSize);

  for (int i = particleList.size() - 1; i >= 0; i--) {
    Particle p = particleList.get(i);
    p.update();
    p.display();
    if (p.isDead()) {
      particleList.remove(i);
    }
  }

  if (isBlocked) {
    drawBlockTimer();
  }

  if (!mousePressed && !isBlocked) {
    canClick = true;
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

void mousePressed() {
  int currentTime = millis();
  if (canClick && !isBlocked && dist(mouseX, mouseY, width/2, height/2 + 50) < circleSize / 2) {
    updateClickIntervals(currentTime);

    score += 10;
    totalClicks++;
    totalPoints += 10;
    levelProgress = float(score) / nextLevelScore;
    addParticles(width/2, height/2 + 50);

    isAnimating = true;
    animationStage = 0;

    if (score >= nextLevelScore) {
      level++;
      nextLevelScore *= 2;
      levelProgress = 0;
      levelUp(); // Обновление достижений при повышении уровня
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

void mouseDragged() {
  if (isAchievementsPopupVisible && mouseY > popupY && mouseY < popupY + popupHeight) {
    int newScrollY = scrollY + mouseY - pmouseY;
    scrollVelocity = mouseY - pmouseY;
    scrollY = constrain(newScrollY, scrollLimit, 0);
  }
}

void updateClickIntervals(int currentTime) {
  int interval = currentTime - lastClickTime;

  for (int i = 0; i < clickIntervals.length - 1; i++) {
    clickIntervals[i] = clickIntervals[i + 1];
  }
  clickIntervals[clickIntervals.length - 1] = interval;

  boolean allEqual = true;
  for (int i = 1; i < clickIntervals.length; i++) {
    if (clickIntervals[i] != clickIntervals[0]) {
      allEqual = false;
      break;
    }
  }

  if (allEqual) {
    isBlocked = true;
    blockStartTime = millis();
  }
}

void checkBlockStatus() {
  if (isBlocked && millis() - blockStartTime > blockDuration) {
    isBlocked = false;
  }
}

void drawBlockTimer() {
  int remainingTime = (blockDuration - (millis() - blockStartTime)) / 1000;
  fill(255, 0, 0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Блокировка за автокликер", profileX + profileWidth / 2, profileY + profileHeight + 30);
  text("Осталось: " + remainingTime + " сек", profileX + profileWidth / 2, profileY + profileHeight + 50);
}

void animateCircle() {
  if (animationStage == 0) {
    circleSize -= animationSpeed;
    if (circleSize <= minSize) {
      circleSize = minSize;
      animationStage = 1;
    }
  } else if (animationStage == 1) {
    circleSize += animationSpeed;
    if (circleSize >= maxSize) {
      circleSize = maxSize;
      animationStage = 2;
    }
  } else if (animationStage == 2) {
    circleSize -= animationSpeed;
    if (circleSize <= 150) {
      circleSize = 150;
      isAnimating = false;
    }
  }
}

void drawLevelProgressBar() {
  float barWidth = 300;
  float barHeight = 20;
  float xOffset = (width - barWidth) / 2;
  float yOffset = height/2 - 50 - 30;
  
  fill(100);
  noStroke();
   
  rect(xOffset, yOffset, barWidth, barHeight, 10);
  
  fill(circleColor);
  rect(xOffset, yOffset, barWidth * levelProgress, barHeight, 10);
}

void drawScoreAboveProgressBar() {
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Очки: " + score, width / 2, height/2 - 130);
}

void drawPlayerProfile() {
  fill(circleColor);
  noStroke();
  rect(profileX, profileY, profileWidth, profileHeight, 20);

  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Игрок", profileX + profileWidth / 2, profileY + 20);

  drawStar(profileX + profileWidth / 2, profileY + 50, 8, 16, 5);
}

void drawStar(float x, float y, float radius1, float radius2, int npoints) {
  float angle = TWO_PI / npoints;
  float halfAngle = angle / 2.0;
  beginShape();
  for (float a = 0; a < TWO_PI; a += angle) {
    float sx = x + cos(a) * radius2;
    float sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

void drawPopup() {
  int popupWidth = 250;
  int popupHeight = 320;
  int popupX = (width - popupWidth) / 2;
  int popupY = (height - popupHeight) / 2 - 50;

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

void drawAchievementsButton() {
  fill(circleColor);
  noStroke();
  rect(achievementsX, achievementsY, profileWidth, profileHeight, 20); // Закругленные углы
  fill(255);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Достижения", achievementsX + profileWidth / 2, achievementsY + 20);
  
  // Рисуем значок, связанный с достижениями (медаль)
  textSize(18); // Увеличенный размер значка
  textAlign(CENTER, CENTER);
  text("🏅", achievementsX + profileWidth / 2, achievementsY + 55); // Медаль как значок
}

void drawAchievementsPopup() {
  fill(circleColor, animationAlpha);
  noStroke();
  rect(popupX, popupY, popupWidth, popupHeight, 20);
  fill(255, animationAlpha);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Достижения", popupX + popupWidth / 2, popupY + 30);

  int textOffsetX = int(popupWidth * -0.015);
  int offsetY = 60;

  for (int i = 0; i < min(10, achievementsList.size()); i++) {
    int elementY = popupY + offsetY + scrollY;
    if (elementY > popupY + 40 && elementY < popupY + popupHeight - 40) {
      fill(255, animationAlpha);
      textAlign(LEFT, CENTER);
      String achievement = achievementsList.get(i);
      text(achievement, popupX + 20 + textOffsetX, elementY);
      
      textAlign(RIGHT, CENTER);
      textSize(12);
      fill(255, 0, 0, animationAlpha);
      text(rewardsList.get(i) + " очков", popupX + popupWidth - 120 + textOffsetX, elementY);

      drawButton("Забрать", popupX + popupWidth - 100, elementY - 10, 80, 20, animationAlpha);
    }
    offsetY += 40;
  }

  drawButton("Закрыть", popupX + popupWidth - 100, popupY + popupHeight - 40, 80, 20, animationAlpha);
}

void drawButton(String label, int x, int y, int w, int h, int alpha) {
  fill(circleColor, alpha);
  stroke(255, alpha);
  strokeWeight(2);
  rect(x, y, w, h, 10);
  
  fill(255, alpha);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

void animatePopup() {
  if (animationAlpha < 255) {
    animationAlpha += popupAnimationSpeed;
  }

  if (popupX < popupTargetX) {
    popupX += popupAnimationSpeed / 2;
  }
}

void animateScroll() {
  if (scrollVelocity != 0) {
    scrollY += scrollVelocity;
    scrollY = constrain(scrollY, scrollLimit, 0);
    scrollVelocity *= 0.9;
    if (abs(scrollVelocity) < 1) {
      scrollVelocity = 0;
    }
  }
}

void addParticles(float x, float y) {
  for (int i = 0; i < particles; i++) {
    float angle = random(TWO_PI);
    float radius = random(0, circleSize / 2);
    float offsetX = cos(angle) * radius;
    float offsetY = sin(angle) * radius;
    float speedX = cos(angle) * random(1, 3);
    float speedY = sin(angle) * random(1, 3);
    particleList.add(new Particle(x + offsetX, y + offsetY, speedX, speedY, circleColor));
  }
}

class Particle {
  float x, y;
  float speedX, speedY;
  float lifespan;
  float size = 5;
  color particleColor;

  Particle(float startX, float startY, float speedX, float speedY, color c) {
    x = startX;
    y = startY;
    this.speedX = speedX;
    this.speedY = speedY;
    lifespan = 255;
    particleColor = c;
  }

  void update() {
    x += speedX;
    y += speedY;
    lifespan -= 4.0;
    size -= 0.05;
  }

  void display() {
    noStroke();
    fill(particleColor, lifespan);
    ellipse(x, y, size, size);
  }

  boolean isDead() {
    return lifespan < 0 || size < 0;
  }
}

void generateAchievements() {
  achievementsList.clear();
  rewardsList.clear();

  achievementsList.add("Наберите " + (level * 100) + " очков");
  rewardsList.add(level * 50);

  achievementsList.add("Сделайте " + (level * 50) + " кликов");
  rewardsList.add(level * 25);

  achievementsList.add("Достигните уровня " + (level + 1));
  rewardsList.add(level * 100);

  if (coins >= 200) {
    achievementsList.add("Заработайте 200 монет");
    rewardsList.add(200);
  }
  
  if (coins >= 500) {
    achievementsList.add("Заработайте 500 монет");
    rewardsList.add(500);
  }
  
  if (coins >= 1000) {
    achievementsList.add("Заработайте 1000 монет");
    rewardsList.add(1000);
  }
  
  achievementsList.add("Завершите 10 битв");
  rewardsList.add(300);

  achievementsList.add("Сыграйте 5 дней подряд");
  rewardsList.add(250);

  achievementsList.add("Соберите 3 редких предмета");
   
  rewardsList.add(400);

  updateScrollLimit();
}

void updateScrollLimit() {
  totalContentHeight = achievementsList.size() * 40;
  scrollLimit = -(totalContentHeight - popupHeight + 50);
}

void levelUp() {
  level++;
  coins += 50;  // Например, добавление монет за повышение уровня
  generateAchievements();  // Обновляем достижения при каждом уровне
}

boolean isMouseOverProfile() {
  return mouseX > profileX && mouseX < profileX + profileWidth && mouseY > profileY && mouseY < profileY + profileHeight;
}

boolean isMouseOverButton(int x, int y, int w, int h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}