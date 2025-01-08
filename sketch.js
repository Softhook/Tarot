/* --------------------------
   GLOBAL VARIABLES
-------------------------- */

let state = "intro"; 
let simulateMode = false;
let OUimg;
let OUfont;

let isIOS = isIOSDevice();
let isMobile = isMobileDevice();

let layouts = [
  {name: "Single Card", positionsCount: 1},
  {name: "Past, Present, Future", positionsCount: 3},
  {name: "Celtic Cross", positionsCount: 10},
  {name: "5-Card Cross", positionsCount: 5},
  {name: "Year", positionsCount: 13},
  {name: "STAR", positionsCount: 4},
  {name: "SMART", positionsCount: 5},
  {name: "Full Deck", positionsCount: 78},
];

let layoutLabels = {
  "Past, Present, Future": ["Past", "Present", "Future"],
  "Celtic Cross": ["Present", "Challenge", "Immediate Future", "Past", "Foundation", "Future", "Outcome", "Hopes & Fears", "External", "Self", "Outcome"],
  "STAR": ["Situation", "Action", "Task", "Result"],
  "Year": ["Summary", "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"],
  "SMART": ["Specific", "Measurable", "Achievable", "Relevant", "Time-bound"],
  "5-Card Cross": ["Present", "Internal", "External", "Past", "Future"]
};

let chosenLayout = null;
let cards = [];
let enlargedCardIndex = -1;

let startTouchX = 0;
let startTouchY = 0;

let cardData = [];
let cardAspectRatio = 100 / 171;
let cardWidth, cardHeight, margin;

let majorArcanaNames = [
  "The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant",
  "The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man",
  "Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"
];
let suits = ["Mind","Heart","Body","World"];
let ranks = ["Ace","2","3","4","5","6","7","8","9","10","Page","Knight","Queen","King"];

let cardImages = [];
let imagesLoaded = 0;
let totalImages = 0;
let descriptions = [];

let filePaths = [];       // Will hold all image paths for cards
let currentIndex = 0;     // Tracks how many we have loaded so far
let chunkSize = 5;        // How many images to load per batch

/* --------------------------
   HELPER FUNCTIONS
-------------------------- */
function isIOSDevice() {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isMobileDevice() {
  return (
    /(Mobi|Android|iPhone|iPad|iPod)/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function preload() {
  OUimg = loadImage('ou.png', () => {}, () => {});
  OUfont = loadFont('poppins.ttf', () => {}, () => {});
  descriptions = loadStrings("descriptions.txt");
}

function setup() { 
  createCanvas(isMobile ? windowWidth : 1200, isMobile ? windowHeight : 800);
  
  textFont(OUfont);
  textSize(isMobile ? 16 : 12);
  margin = isMobile ? 12 : 25;

  // Create cardData and attach descriptions
  for (let i = 0; i < 22; i++) {
    cardData.push({
      name: majorArcanaNames[i],
      description: descriptions[i] || ""
    });
  }
  let indexOffset = 22;
  for (let s = 0; s < suits.length; s++) {
    for (let r = 0; r < ranks.length; r++) {
      let idx = indexOffset + s * ranks.length + r;
      cardData.push({
        name: ranks[r] + " of " + suits[s],
        description: descriptions[idx] || ""
      });
    }
  }

  // Build filePaths array (one entry per card)
  for (let i = 0; i < cardData.length; i++) {
    let fileName = getFileNameForCard(cardData[i].name);
    filePaths.push("data/" + fileName);
  }

  // We will load them in chunks:
  totalImages = filePaths.length;
  loadNextBatch();  // <--- start chunk loading
}

function draw() {
  background(0);

  // Loading progress bar
  if (imagesLoaded < totalImages) {
    let progress = imagesLoaded / totalImages;
    let barW = width * 0.8;
    let barH = 20;
    let barX = width * 0.1;
    let barY = 10;
    fill(255);
    rect(barX, barY, barW * progress, barH);
  }

  // State logic (unchanged)
  if (state === "intro") {
    drawIntroScreen();
  } else if (state === "about") {
    drawAboutScreen();
  } else if (state === "display") {
    if (enlargedCardIndex >= 0) {
      drawEnlargedCard(cards[enlargedCardIndex]);
    } else {
      drawLayout();
      drawBackButton();
    }
  }
}

/* --------------------------
   CHUNK LOADING FUNCTIONS
-------------------------- */
function loadNextBatch() {
  // Load up to 'chunkSize' images from filePaths
  let endIndex = min(currentIndex + chunkSize, totalImages);
  for (let i = currentIndex; i < endIndex; i++) {
    loadImage(
      filePaths[i],
      (img) => {
        // On success
        cardImages[i] = img;
        imagesLoaded++;
        checkLoadStatus();
      },
      (err) => {
        // On error
        console.log("Load error on:", filePaths[i], err);
        cardImages[i] = null;
        imagesLoaded++;
        checkLoadStatus();
      }
    );
  }
  currentIndex = endIndex;
}

function checkLoadStatus() {
  // If not all loaded, and we still have more to request, queue next batch
  if (imagesLoaded < totalImages && currentIndex < totalImages) {
    setTimeout(loadNextBatch, 200); 
  }
}

/* --------------------------
   SCREEN DRAW FUNCTIONS
-------------------------- */
function drawIntroScreen() {
  imageMode(CENTER);
  image(OUimg, width / 2, 80);
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 16 : 18);

  for (let i = 0; i < layouts.length; i++) {
    let yPos = (isMobile ? 180 : 200) + i * (isMobile ? 50 : 60);
    rectMode(CENTER);
    fill(200, 150, 0);
    rect(width / 2, yPos, isMobile ? 180 : 200, isMobile ? 35 : 40);
    fill(0);
    text(layouts[i].name, width / 2, yPos);
  }

  let aboutButtonY = isMobile ? 650 : 720;
  let aboutButtonW = 100;
  let aboutButtonH = 40;
  fill(180);
  rectMode(CENTER);
  rect(width / 2, aboutButtonY, aboutButtonW, aboutButtonH);
  fill(0);
  textSize(isMobile ? 16 : 14);
  text("About", width / 2, aboutButtonY);
}

function drawAboutScreen() {
  fill(255);
  textAlign(LEFT, TOP);
  textSize(isMobile ? 16 : 18);
  textLeading(25);

  let a = "This Tarot deck was created by Christian Nold, Georgy Holden, James Warren as part of an OU scholarship project. The card designs are based on the wishes, hopes and dreams submitted by Design students from the U101 module over the last decade. The students wrote their wishes onto postcards that they posted to us and we transcribed and analysed by hand and then transformed into graphics using generative Artificial Intelligence (AI) and lots of human labour. The design was created with Adobe Firefly, Photoshop, p5.js, Chat GPT o1 and the typefaces Roman Holiday Sketch and Poppins.";

  text(a, width / 2, isMobile ? 50 : 100, 400);
  
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 16 : 14);
  let backButtonW = 100;
  let backButtonH = 40;
  let backButtonX = width / 2;
  let backButtonY = isMobile ? 650 : 720;

  rectMode(CENTER);
  fill(180);
  rect(backButtonX, backButtonY, backButtonW, backButtonH);
  fill(0);
  text("Back", backButtonX, backButtonY);
}

function drawLayout() {
  if (!chosenLayout) return;
  let count = chosenLayout.positionsCount;
  let layoutName = chosenLayout.name;

  if (layoutName === "Full Deck") {
    let rows = isMobile ? 10 : 6;
    let cols = ceil(count / rows);
    calculateCardSize(rows, cols);
    for (let i = 0; i < cards.length; i++) {
      let r = floor(i / cols);
      let co = i % cols;
      let xPos = margin + (co + 1) * margin + co * cardWidth + cardWidth / 2;
      let yPos = (isMobile ? margin * 3 : margin * 2) + margin + (r + 1) * margin + r * cardHeight + cardHeight / 2;
      cards[i].x = xPos;
      cards[i].y = yPos;
      drawCard(cards[i], xPos, yPos, cardWidth, cardHeight, i);
    }
  }
  else if (layoutName === "Year") {
    let radius = isMobile ? width / 3 : width / 5;
    let centreX = width / 2;
    let centreY = height / 2;
    cardHeight = isMobile ? 90 : height / 6;
    cardWidth = cardHeight * cardAspectRatio;

    cards[0].x = centreX;
    cards[0].y = centreY;
    drawCard(cards[0], cards[0].x, cards[0].y, cardWidth, cardHeight, 0);

    for (let i = 1; i < 13; i++) {
      let angle = -PI / 2 + TWO_PI * (i - 1) / 12;
      let xPos = centreX + radius * cos(angle);
      let yPos = centreY + radius * sin(angle);
      cards[i].x = xPos;
      cards[i].y = yPos;
      drawCard(cards[i], xPos, yPos, cardWidth, cardHeight, i);
    }
  }
  else if (layoutName === "5-Card Cross") {
    cardHeight = isMobile ? 170 : 260;
    cardWidth = cardHeight * cardAspectRatio;
    let centreX = width / 2;
    let centreY = height / 2;

    cards[0].x = centreX;
    cards[0].y = centreY;
    drawCard(cards[0], centreX, centreY, cardWidth, cardHeight, 0);

    cards[1].x = centreX;
    cards[1].y = centreY - (cardHeight + margin);
    drawCard(cards[1], cards[1].x, cards[1].y, cardWidth, cardHeight, 1);

    cards[2].x = centreX;
    cards[2].y = centreY + (cardHeight + margin);
    drawCard(cards[2], cards[2].x, cards[2].y, cardWidth, cardHeight, 2);

    cards[3].x = centreX - (cardWidth + margin);
    cards[3].y = centreY;
    drawCard(cards[3], cards[3].x, cards[3].y, cardWidth, cardHeight, 3);

    cards[4].x = centreX + (cardWidth + margin);
    cards[4].y = centreY;
    drawCard(cards[4], cards[4].x, cards[4].y, cardWidth, cardHeight, 4);

  }
  else if (layoutName === "Celtic Cross") {
    cardHeight = isMobile ? 140 : 220;
    cardWidth = cardHeight * cardAspectRatio;
    let middleOffset = 50;
    let centreX = width / 2 - middleOffset;
    let centreY = height / 2;

    cards[0].x = centreX;
    cards[0].y = centreY;
    cards[1].x = centreX;
    cards[1].y = centreY;
    cards[2].x = centreX;
    cards[2].y = centreY + cardHeight + margin;
    cards[3].x = centreX - (cardWidth + margin);
    cards[3].y = centreY;
    cards[4].x = centreX;
    cards[4].y = centreY - (cardHeight + margin);
    cards[5].x = centreX + (cardWidth + margin);
    cards[5].y = centreY;

    for (let i = 6; i < 10; i++) {
      cards[i].x = centreX + 2 * (cardWidth + margin);
    }
    cards[6].y = centreY - (cardHeight + margin) * 1.5;
    cards[7].y = centreY - (cardHeight + margin) * 0.5;
    cards[8].y = centreY + (cardHeight + margin) * 0.5;
    cards[9].y = centreY + (cardHeight + margin) * 1.5;
    
    drawCard(cards[0], cards[0].x, cards[0].y, cardWidth, cardHeight, 0);
    push();
    translate(cards[1].x, cards[1].y);
    rotate(HALF_PI);
    drawCard(cards[1], 0, 0, cardWidth, cardHeight, 1);
    pop();
    drawCard(cards[2], cards[2].x, cards[2].y, cardWidth, cardHeight, 2);
    drawCard(cards[3], cards[3].x, cards[3].y, cardWidth, cardHeight, 3);
    drawCard(cards[4], cards[4].x, cards[4].y, cardWidth, cardHeight, 4);
    drawCard(cards[5], cards[5].x, cards[5].y, cardWidth, cardHeight, 5);

    for (let i = 6; i < 10; i++) {
      drawCard(cards[i], cards[i].x, cards[i].y, cardWidth, cardHeight, i);
    }
  }
  else {
    let rows = (count > 3) ? 2 : 1;
    let cols = ceil(count / rows);
    calculateCardSize(rows, cols);
    for (let i = 0; i < cards.length; i++) {
      let r = floor(i / cols);
      let co = i % cols;
      let xPos = margin + (co + 1) * margin + co * cardWidth + cardWidth / 2;
      let yPos = (isMobile ? 70 : 100) + margin + (r + 1) * margin + r * cardHeight + cardHeight / 2;
      cards[i].x = xPos;
      cards[i].y = yPos;
      drawCard(cards[i], xPos, yPos, cardWidth, cardHeight, i);
    }
  }
}

function drawEnlargedCard(thisCard) {
  let enlargedH = height * 0.9;
  let enlargedW = enlargedH * cardAspectRatio;
  drawCard(thisCard, width / 2, height / 2, enlargedW, enlargedH);
}

function calculateCardSize(rows, cols) {
  let availableW = width - (cols + 1) * margin;
  let cardMaxW = availableW / cols;

  let availableH = height - (isMobile ? 150 : 200) - (rows + 1) * margin;
  let cardMaxH = availableH / rows;

  if (cardMaxW / cardMaxH > cardAspectRatio) {
    cardHeight = cardMaxH;
    cardWidth = cardHeight * cardAspectRatio;
  } else {
    cardWidth = cardMaxW;
    cardHeight = cardWidth / cardAspectRatio;
  }
}

/* --------------------------
   TOUCH / MOUSE CONTROLS
-------------------------- */
document.ontouchmove = function(event) {
  event.preventDefault();
};

function touchStarted() {
  startTouchX = mouseX;
  startTouchY = mouseY;
  mousePressed();
  return false;
}

function touchEnded() {
  let endTouchX = mouseX;
  let endTouchY = mouseY;
  let dx = endTouchX - startTouchX;
  let dy = endTouchY - startTouchY;
  let swipeThreshold = 50;

  if (enlargedCardIndex >= 0 && chosenLayout && chosenLayout.positionsCount > 1 && abs(dx) > swipeThreshold && abs(dy) < swipeThreshold) {
    if (dx < 0 && enlargedCardIndex < cards.length - 1) {
      enlargedCardIndex++;
    } else if (dx > 0 && enlargedCardIndex > 0) {
      enlargedCardIndex--;
    }
  }
  return false;
}

function mousePressed() {
  if (!isIOS && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
    if (!fullscreen()) {
      fullscreen(true);
      resizeCanvas(windowWidth, windowHeight);
    }
  }

  if (state === "intro") {
    // Check layout selection
    for (let i = 0; i < layouts.length; i++) {
      let yPos = (isMobile ? 180 : 200) + i * (isMobile ? 50 : 60);
      let halfW = isMobile ? 90 : 100;
      let halfH = isMobile ? 17.5 : 20;
      if (
        mouseX > width/2 - halfW && mouseX < width/2 + halfW &&
        mouseY > yPos - halfH && mouseY < yPos + halfH
      ) {
        chosenLayout = layouts[i];
        setupLayout();
        state = "display";
        if (chosenLayout.name === "Single Card") {
          enlargedCardIndex = 0;
        }
      }
    }

    // Check "About" button
    let aboutButtonY = isMobile ? 650 : 720;
    let aboutButtonW = 100;
    let aboutButtonH = 40;
    let aboutButtonX1 = (width / 2) - aboutButtonW / 2;
    let aboutButtonX2 = (width / 2) + aboutButtonW / 2;
    let aboutButtonY1 = aboutButtonY - aboutButtonH / 2;
    let aboutButtonY2 = aboutButtonY + aboutButtonH / 2;

    if (
      mouseX > aboutButtonX1 && mouseX < aboutButtonX2 &&
      mouseY > aboutButtonY1 && mouseY < aboutButtonY2
    ) {
      state = "about";
    }

  } else if (state === "about") {
    // Back button
    let backButtonY = isMobile ? 650 : 720;
    let backButtonW = 100;
    let backButtonH = 40;
    let backButtonX1 = (width / 2) - backButtonW / 2;
    let backButtonX2 = (width / 2) + backButtonW / 2;
    let backButtonY1 = backButtonY - backButtonH / 2;
    let backButtonY2 = backButtonY + backButtonH / 2;

    if (
      mouseX > backButtonX1 && mouseX < backButtonX2 &&
      mouseY > backButtonY1 && mouseY < backButtonY2
    ) {
      state = "intro";
    }

  } else if (state === "display") {
    // Back button in display
    if (mouseX > width - 110 && mouseX < width - 10 &&
        mouseY > height - 40 && mouseY < height - 10) {
      state = "intro";
      enlargedCardIndex = -1;
      cards = [];
      return;
    }

    if (enlargedCardIndex >= 0) {
      if (chosenLayout.name === "Single Card") {
        state = "intro";
        enlargedCardIndex = -1;
        cards = [];
      } else {
        enlargedCardIndex = -1;
      }
    } else {
      // Check card click
      for (let i = 0; i < cards.length; i++) {
        let c = cards[i];
        let w = cardWidth;
        let h = cardHeight;

        // Special bounding box if Celtic Cross index is 1 (rotated card)
        if (chosenLayout && chosenLayout.name === "Celtic Cross" && i === 1) {
          w = cardHeight;
          h = cardWidth;
        }

        if (
          mouseX > c.x - w/2 && mouseX < c.x + w/2 &&
          mouseY > c.y - h/2 && mouseY < c.y + h/2
        ) {
          enlargedCardIndex = i;
          break;
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* --------------------------
   LAYOUT SETUP
-------------------------- */
function setupLayout() {
  cards = [];
  
  if (chosenLayout.name === "Full Deck") {
    for (let i = 0; i < chosenLayout.positionsCount; i++) {
      cards.push({
        x: 0,
        y: 0,
        name: cardData[i].name,
        index: i,
        description: cardData[i].description
      });
    }
  } else {
    // Only pick images that were successfully loaded
    let validIndices = cardData
      .map((_, index) => index)
      .filter(index => cardImages[index] !== null);
    
    validIndices = shuffleArray(validIndices);

    for (let i = 0; i < chosenLayout.positionsCount; i++) {
      let idx = validIndices[i];
      cards.push({
        x: 0,
        y: 0,
        name: cardData[idx].name,
        index: idx,
        description: cardData[idx].description
      });
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawBackButton() {
  rectMode(CORNER);
  fill(180);
  rect(width - 110, height - 40, 100, 30);
  fill(0);
  textAlign(CENTER, CENTER);
  text("Back", width - 60, height - 25);
}

function getFileNameForCard(cardName) {
  let majorIndex = majorArcanaNames.indexOf(cardName);
  if (majorIndex >= 0) {
    let shortName = cardName.toLowerCase().replace(/ /g, "_");
    return "major_" + majorIndex + "_" + shortName + ".jpg";
  } else {
    let parts = cardName.toLowerCase().split(" of ");
    let rank = parts[0];
    let suit = parts[1];
    return suit + "_" + rank + ".jpg";
  }
}

function drawCard(c, x, y, w, h, cardIndex) {
  imageMode(CENTER);
  if (cardImages[c.index]) {
    image(cardImages[c.index], x, y, w, h);
  } else {
    fill(200);
    rectMode(CENTER);
    rect(x, y, w, h);
    fill(0);
    textAlign(CENTER, CENTER);
    text(c.name, x, y);
  }

  if (chosenLayout && layoutLabels[chosenLayout.name]) {
    let labels = layoutLabels[chosenLayout.name];
    if (typeof cardIndex !== 'undefined' && cardIndex < labels.length) {
      textAlign(LEFT, BOTTOM);
      fill(255);
      textSize(isMobile ? 10 : 14);
      text(labels[cardIndex], x - w / 2 + 1, y - h / 2);
    }
  }
}

function keyPressed() {
  if (enlargedCardIndex >= 0 && chosenLayout && chosenLayout.positionsCount > 1) {
    if (keyCode === RIGHT_ARROW && enlargedCardIndex < cards.length - 1) {
      enlargedCardIndex++;
    } else if (keyCode === LEFT_ARROW && enlargedCardIndex > 0) {
      enlargedCardIndex--;
    }
  }
}