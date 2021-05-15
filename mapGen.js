let EntityIDs = {
  None: 0,
  Spider: 1,
  Scorpion: 2,
  Wraith: 3,
  Octopus: 4,
  Ghost: 5,
  Dragon: 6,
  SkeletonBoss: 7,
  Key: 8,
  Trap: 9,
  Portal: 10,
  Player: 11,
};

let TextureIDs = {
  Grass: 0,
  Sand: 1,
  Water: 2
};

let SubTextureIDs = {
  VeryLight: 0,
  Light: 1,
  Dark: 2,
  VeryDark: 3
};

let saveButton;
let loadButton;
let clearButton;

let tileButtons, entityButtons;
let rectCheckbox;

let floodButton;

let newMapButton;

let dimInput;
let slotInput;

let currentTexture = 0,
  currentEntity = 0;
let floodfillMode = false;
let rectMode = false;
let rectCorner = 0;
let topRightX = 0;
let topRightY = 0;

let currentMode;

let len;

let map;
let dim = 32;
let mapSize = 800;
let tileSize = mapSize / dim;
let minimap;
let entityNames = [];
let entityList = [];
let textureNames = [];
let textureList = [];
let textureColorList = [];
let entityColorList = [];

let mapDir = "Tiles/usedTextures/";

let camera = {
  x: dim / 2,
  y: dim / 2
};

function getAverageColor(img, i, j) {
  img.loadPixels();

  let sr = 0,
    sg = 0,
    sb = 0;

  let pixCount = 0;

  for (let i = 0; i < img.pixels.length; i += 4) {
    if (img.pixels[i + 3] < 20 || (img.pixels[i] < 10 && img.pixels[i + 1] < 10 && img.pixels[i + 2] < 10)) continue;
    sr += img.pixels[i];
    sg += img.pixels[i + 1];
    sb += img.pixels[i + 2];
    pixCount++;
  }
  if (pixCount !== 0) {
    sr /= pixCount;
    sg /= pixCount;
    sb /= pixCount;
  }
  textureColorList[i][j][0] = sr;
  textureColorList[i][j][1] = sg;
  textureColorList[i][j][2] = sb;
  //console.log(sr, sg, sb);
}

function generateDefaultMap() {
  dim = parseInt(dimInput.value());
  tileSize = mapSize / dim;
  map = new WorldMap(dim, 0, 0, 1, 1);
  map.clear();
  map.resize(0, 0, 700, 700);
  map.show();

  camera.x = dim / 2;
  camera.y = dim / 2;
  map.forceUpdate();
}

function loadImages() {
  let alpha = 255;

  let n = ["grass", "sand", "water", "void"];
  for (let i = 0; i < 4; i++) {
    textureList[i] = [];
    for (let j = 0; j < 4; j++) {
      textureList[i][j] = mapDir + "textures/" + n[i] + "_tiles/" + n[i] + "" + j + ".png";
    }
  }
  textureColorList = [];

  for (let i = 0; i < textureList.length; i++) {
    textureColorList[i] = [];
    for (let j = 0; j < textureList[i].length; j++) {
      textureColorList[i][j] = [];
      loadImage(textureList[i][j], (img) => {
        getAverageColor(img, i, j);
      });
    }
  }
  entityList[EntityIDs.None] = mapDir + "entities/none.png";
  entityList[EntityIDs.Scorpion] = mapDir + "entities/scorpion.png";
  entityList[EntityIDs.Spider] = mapDir + "entities/spider.png";
  entityList[EntityIDs.SkeletonBoss] = mapDir + "entities/boss_skeleton.png";
  entityList[EntityIDs.Key] = mapDir + "entities/key.png";
  entityList[EntityIDs.Trap] = mapDir + "entities/trap.png";
  entityList[EntityIDs.Portal] = mapDir + "entities/portal.png";
  entityList[EntityIDs.Player] = mapDir + "entities/player.png";
  entityList[EntityIDs.Wraith] = mapDir + "entities/wraith.png";
  entityList[EntityIDs.Octopus] = mapDir + "entities/octopus.png";
  entityList[EntityIDs.Ghost] = mapDir + "entities/ghost.png";
  entityList[EntityIDs.Dragon] = mapDir + "entities/boss_dragon.png";

  for (let i = 0; i < entityList.length; i++) {
    entityColorList[i] = [];
    entityColorList[i][0] = 255;
    entityColorList[i][1] = 0;
    entityColorList[i][2] = 0;
  }
  entityColorList[EntityIDs.Key][0] = 255;
  entityColorList[EntityIDs.Key][1] = 215;
  entityColorList[EntityIDs.Key][2] = 0;
  entityColorList[EntityIDs.Player][0] = 0;
  entityColorList[EntityIDs.Player][1] = 255;
  entityColorList[EntityIDs.Player][2] = 0;
}

function loadMap() {
  let saveName = "test" + parseInt(slotInput.value()) + ".png";
  //if (!isLocalhost) saveName = "Fruit-Smasher/" + saveName;
  loadImage(saveName, loadActualMap, generateDefaultMap);
}

function saveMap() {
  let saveName = "test" + parseInt(slotInput.value()) + ".png";
  //if (!isLocalhost) saveName = "Fruit-Smasher/" + saveName;
  let saveImg = createImage(map.width, map.height);
  let getID = (a, b) => {
    return 50 * a + b;
  };
  saveImg.loadPixels();
  for (let i = 0; i < map.width; i++) {
    for (let j = 0; j < map.height; j++) {
      saveImg.pixels[(j * map.width + i) * 4] = getID(map.tiles[i][j].tileID, map.tiles[i][j].entityID);
      saveImg.pixels[(j * map.width + i) * 4 + 1] = getID(map.tiles[i][j].tileID, map.tiles[i][j].entityID);
      saveImg.pixels[(j * map.width + i) * 4 + 2] = getID(map.tiles[i][j].tileID, map.tiles[i][j].entityID);
      saveImg.pixels[(j * map.width + i) * 4 + 3] = 255;
    }
  }
  saveImg.updatePixels();
  save(saveImg, saveName);
}

function setup() {
  createCanvas(screen.width, screen.height);

  loadImages();

  textureNames = ["Grass", "Sand", "Water"];
  entityNames = [
    "None",
    "Spider",
    "Scorpion",
    "Wraith",
    "Octopus",
    "Ghost",
    "Dragon",
    "SkeletonBoss",
    "Key",
    "Trap",
    "Portal",
    "Player"
  ];

  optionButtons = new UICollection("Bla", 0, 0, 1, 1, [
    [Button, "Save", saveMap],
    [Button, "Load", loadMap],
    [Button, "Generate new Map", generateDefaultMap],
    [Button, "Clear", () => {
      map.clear();
    }],
  ], [
    [1],
    [
      [1, 1, 1, 1],
    ]
  ]);
  optionButtons.resize(mapSize + 100, 0, 75, 200);

  entityButtons = new UICollection("Bla1", 0, 0, 1, 1, [
      [Button, entityNames[0], () => {
        currentEntity = EntityIDs.None;
        currentMode = 1;
      }],
      [Button, entityNames[1], () => {
        currentEntity = EntityIDs.Spider;
        currentMode = 1;
      }],
      [Button, entityNames[2], () => {
        currentEntity = EntityIDs.Scorpion;
        currentMode = 1;
      }],
      [Button, entityNames[3], () => {
        currentEntity = EntityIDs.Wraith;
        currentMode = 1;
      }],
      [Button, entityNames[4], () => {
        currentEntity = EntityIDs.Octopus;
        currentMode = 1;
      }],
      [Button, entityNames[5], () => {
        currentEntity = EntityIDs.Ghost;
        currentMode = 1;
      }],
      [Button, entityNames[6], () => {
        currentEntity = EntityIDs.Dragon;
        currentMode = 1;
      }],
      [Button, entityNames[7], () => {
        currentEntity = EntityIDs.SkeletonBoss;
        currentMode = 1;
      }],
      [Button, entityNames[8], () => {
        currentEntity = EntityIDs.Key;
        currentMode = 1;
      }],
      [Button, entityNames[9], () => {
        currentEntity = EntityIDs.Trap;
        currentMode = 1;
      }],
      [Button, entityNames[10], () => {
        currentEntity = EntityIDs.Portal;
        currentMode = 1;
      }],
      [Button, entityNames[11], () => {
        currentEntity = EntityIDs.Player;
        currentMode = 1;
      }]
    ],
    [
      [1],
      [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ]
    ]
  );
  entityButtons.resize(mapSize + 200, 0, 100, mapSize);

  textureButtons = new UICollection("Bla1", 0, 0, 1, 1, [
      [Button, textureNames[0], () => {
        currentTexture = TextureIDs.Grass;
        currentMode = 0;
      }],
      [Button, textureNames[1], () => {
        currentTexture = TextureIDs.Sand;
        currentMode = 0;
      }],
      [Button, textureNames[2], () => {
        currentTexture = TextureIDs.Water;
        currentMode = 0;
      }],
    ],
    [
      [1],
      [
        [1, 1, 1],
      ]
    ]
  );
  textureButtons.resize(mapSize + 325, 0, 100, 200);

  slotInput = createInput("0");
  slotInput.position(mapSize + 10, 100);
  slotInput.size(75, 30);

  dimInput = createInput("10");
  dimInput.position(mapSize + 10, 10);
  dimInput.size(75, 30);

  rectCheckbox = createCheckbox('Rect Mode');
  rectCheckbox.position(mapSize + 300, len * 50);
  rectCheckbox.size(100, 25);

  floodButton = createButton('Next Click will Flood Fill the Area');
  floodButton.position(mapSize + 300, (len + 0.5) * 50);
  floodButton.size(100, 50);
  floodButton.mousePressed(() => {
    floodfillMode = true;
  });

  generateDefaultMap();
  map.resize(0, 0, mapSize, mapSize);
  map.show();
}

function draw() {
  map.displayOnce();
  optionButtons.displayOnce();
  entityButtons.displayOnce();
  textureButtons.displayOnce();

  rectMode = rectCheckbox.checked();
  console.log("looping");
}

function mousePressed() {
  let dim = map.viewRange;
  if (mouseX >= 0 && mouseX <= mapSize && mouseY >= 0 && mouseY <= mapSize) {
    if (currentMode === 0) {
      if (floodfillMode) {
        let x = camera.x - floor(dim / 2) + floor(mouseX * dim / mapSize);
        let y = camera.y - floor(dim / 2) + floor(mouseY * dim / mapSize);
        map.floodfill(x, y);
        floodfillMode = false;
      } else if (rectMode) {
        if (rectCorner === 0) {
          topRightX = mouseX;
          topRightY = mouseY;
          rectCorner = 1;
        } else {
          let minX = camera.x - floor(dim / 2) + floor(min(mouseX, topRightX) * dim / mapSize);
          let maxX = camera.x - floor(dim / 2) + floor(max(mouseX, topRightX) * dim / mapSize);
          let minY = camera.y - floor(dim / 2) + floor(min(mouseY, topRightY) * dim / mapSize);
          let maxY = camera.y - floor(dim / 2) + floor(max(mouseY, topRightY) * dim / mapSize);
          for (let x = minX; x < maxX; x++) {
            for (let y = minY; y < maxY; y++) {
              map.set(x, y, currentTexture);
            }
          }
          topRightX = 0;
          topRightY = 0;
          rectCorner = 0;
        }
      } else {
        let x = camera.x - floor(dim / 2) + floor(mouseX * dim / mapSize);
        let y = camera.y - floor(dim / 2) + floor(mouseY * dim / mapSize);
        map.set(x, y, currentTexture);
      }
    } else if (currentMode === 1) {
      let x = camera.x - floor(dim / 2) + floor(mouseX * dim / mapSize);
      let y = camera.y - floor(dim / 2) + floor(mouseY * dim / mapSize);
      map.setEntity(x, y, currentEntity);
    }
    map.forceUpdate();
  }
}

function mouseDragged() {
  let dim = map.viewRange;
  if (mouseX >= 0 && mouseX <= mapSize && mouseY >= 0 && mouseY <= mapSize) {
    if (rectMode || currentMode === 1) return;
    let x = camera.x - floor(dim / 2) + floor(mouseX * dim / mapSize);
    let y = camera.y - floor(dim / 2) + floor(mouseY * dim / mapSize);
    map.set(x, y, currentTexture);
    map.forceUpdate();
  }
}

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      camera.y--;
      map.updateImages(0, -1);
      break;
    case DOWN_ARROW:
      camera.y++;
      map.updateImages(0, 1);
      break;
    case LEFT_ARROW:
      camera.x--;
      map.updateImages(-1, 0);
      break;
    case RIGHT_ARROW:
      camera.x++;
      map.updateImages(1, 0);
      break;
    case 32: //SPACE
      map.forceUpdate();
      break;
  }
}

class Minimap extends BaseUIBlock {
  constructor() {
    this.content = createImage(200, 200);
    this.clear();
  }

  displayEveryFrame() {
    if (this.hidden) return;
    if (debug) {
      push();
      noFill();
      stroke(255, 0, 0);
      rect(this.tempX, this.tempY, this.tempW, this.tempH);
      stroke(0, 255, 0);
      rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      pop();
    }
  }

  displayOnce() {
    image(this.content, this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
  }

  show() {
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  updatePixels(x, y) {
    /*
    minimap.loadPixels();
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        minimap.set(x * w + i, y * h + j, colorList[id]);
      }
    }*/
    if (!mainWindow.subMenus[0].children[0].children[0].tiles[x][y].visible) return;
    mainWindow.subMenus[0].children[0].children[0].tiles[x][y].visible = true;
    let map = mainWindow.subMenus[0].children[0].children[0].tiles;
    let w = this.content.width / map.length;

    let tID = map[x][y].tileID;
    let eID = map[x][y].entityID;
    let sID = map[x][y].subTexID;

    this.content.loadPixels();
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < w; j++) {
        let xp = x * w + i;
        let yp = y * w + j;
        let id = yp * this.content.width + xp;
        if (eID !== 0) {
          this.content.pixels[4 * id] = entityColorList[eID][0];
          this.content.pixels[4 * id + 1] = entityColorList[eID][1];
          this.content.pixels[4 * id + 2] = entityColorList[eID][2];
          this.content.pixels[4 * id + 3] = 255;
        } else {
          this.content.pixels[4 * id] = textureColorList[tID][sID][0];
          this.content.pixels[4 * id + 1] = textureColorList[tID][sID][1];
          this.content.pixels[4 * id + 2] = textureColorList[tID][sID][2];
          this.content.pixels[4 * id + 3] = 255;
        }
      }
    }
    this.content.updatePixels();
    this.displayOnce();
  }

  clear() {
    this.content.loadPixels();
    for (let i = 0; i < this.content.pixels.length; i++) {
      this.content.pixels[4 * i] = 200; //R
      this.content.pixels[4 * i + 1] = 200; //G
      this.content.pixels[4 * i + 2] = 200; //B
      this.content.pixels[4 * i + 3] = 255; //A
    }
    this.content.updatePixels();
  }
}

class WorldMap extends BaseUIBlock {
  constructor(dim, x, y, w, h) {
    super(x, y, w, h);
    this.tiles = [];
    this.cachedTiles = [];
    this.width = dim;
    this.height = dim;
    this.viewRange = 5;
    for (let i = 0; i < this.width; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.height; j++) {
        this.tiles[i][j] = new TileSet(i, j);
      }
    }

    for (let i = 0; i < this.viewRange; i++) {
      this.cachedTiles[i] = [];
      for (let j = 0; j < this.viewRange; j++) {
        this.cachedTiles[i][j] = {
          tile: new CustomImage("Tiles/usedTextures/textures/grass_tiles/grass0.png", i / this.viewRange, j / this.viewRange, 1 / this.viewRange, 1 / this.viewRange, 1),
          entity: null
        };
      }
    }

    this.xMul = 0.3239;
    this.xOffs = 0; //.51031;
    this.yMul = 0.328;
    this.yOffs = 0;
    this.noiseMaxID = 4; //0.192179;
  }

  displayEveryFrame() {}

  displayOnce() {
    if (debug) {
      push();
      noFill();
      stroke(255, 0, 0);
      rect(this.tempX, this.tempY, this.tempW, this.tempH);
      stroke(0, 255, 0);
      rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      pop();
    }
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        t.tile.displayOnce();
        if (t.entity) t.entity.displayOnce();
      }
    }
  }

  show() {
    this.hidden = false;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile.show();
        if (this.cachedTiles[i][j].entity) this.cachedTiles[i][j].entity.show();
      }
    }
  }

  hide() {
    this.hidden = true;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        this.cachedTiles[i][j].tile.hide();
        if (this.cachedTiles[i][j].entity) this.cachedTiles[i][j].entity.hide();
      }
    }
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        if (t.tile) t.tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        if (t.entity) t.entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
      }
    }
    this.displayOnce();
  }

  updateEverything(x, y, px, py, id, placeInMap) {
    this.updateTileMap(px, py, EntityIDs.None);
    this.updateTileMap(x, y, id);
    this.updateEnemyPos(px, py, -1);
    this.updateEnemyPos(x, y, placeInMap);
    this.updateCacheMap(px, py, EntityIDs.None);
    this.updateCacheMap(x, y, id);
  }

  updateTileMap(x, y, id) {
    this.tiles[x][y].setEntity(id);
  }

  updateEnemyPos(x, y, id) {
    this.tiles[x][y].setEnemyID(id);
  }

  updateCacheMap(x, y, id) {
    let viewRange = this.viewRange;
    let xPos = camera.x - floor(viewRange / 2);
    let yPos = camera.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;
    let x1 = x - xPos,
      y1 = y - yPos;
    if (x1 >= 0 && y1 >= 0 && x1 < viewRange && y1 < viewRange) { //position cached
      let t = this.cachedTiles[x1][y1];
      if (t.entity) t.entity.content.elt.remove();
      if (id !== 0) {
        t.entity = new CustomImage(entityList[id], x1 * w1, y1 * w1, w1, w1);
        t.entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        t.entity.show();
        t.entity.displayOnce();
      }
    } else { //position outside of cache

    }
  }

  updateImages(x, y) {
    let viewRange = this.viewRange;
    let xPos = camera.x - floor(viewRange / 2);
    let yPos = camera.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;

    let tmpArray = [];
    for (let i = 0; i < this.cachedTiles.length; i++) {
      tmpArray[i] = [];
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        tmpArray[i][j] = {
          tile: null,
          entity: null
        };
        if (i + x >= 0 && i + x < this.cachedTiles.length && j + y >= 0 && j + y < this.cachedTiles[i].length) {
          tmpArray[i][j].tile = this.cachedTiles[i + x][j + y].tile;
          tmpArray[i][j].entity = this.cachedTiles[i + x][j + y].entity;
        } else {
          //Not cached, get picture from tiles
          let newX = xPos + i + x;
          let newY = yPos + j + y;
          if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
            let tID = this.tiles[newX][newY].tileID;
            let eID = this.tiles[newX][newY].entityID;
            let sID = this.tiles[newX][newY].subTexID;
            tmpArray[i][j].tile = new CustomImage(textureList[tID][sID], 0, 0, w1, w1);
            if (eID !== 0) tmpArray[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
            this.tiles[newX][newY].visible = true;
          } else {
            let sID = this.getNoise2D(newX, newY);
            tmpArray[i][j].tile = new CustomImage(mapDir + "textures/void_tiles/void" + sID + ".png", 0, 0, w1, w1);
            tmpArray[i][j].entity = null; // = new CustomImage(mapDir + "entities/none.png", 0, 0, w1, w1);
          }
        }
        //console.log(i, j, tmpArray[i][j]);
      }
    }

    if (x == -1) {
      //Delete right row
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[this.cachedTiles.length - 1][i];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    } else if (x == 1) {
      //Delete left row
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[0][i];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    } else if (y == -1) {
      //Delete bottom column
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[i][this.cachedTiles.length - 1];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    } else if (y == 1) {
      //Delete top column
      for (let i = 0; i < this.cachedTiles.length; i++) {
        let t = this.cachedTiles[i][0];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    }

    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles[i].length; j++) {
        let t = this.cachedTiles[i][j];
        t.tile = tmpArray[i][j].tile;
        t.entity = tmpArray[i][j].entity;
        t.tile.xRelToParent = i * w1;
        t.tile.yRelToParent = j * w1;
        t.tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        t.tile.show();
        if (t.entity) {
          t.entity.xRelToParent = i * w1;
          t.entity.yRelToParent = j * w1;
          t.entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
          t.entity.show();
        }
      }
    }

    this.displayOnce();
  }

  forceUpdate() {
    console.log("Forcing Cached Tiles Update");
    let viewRange = this.viewRange;
    let xPos = camera.x - floor(viewRange / 2);
    let yPos = camera.y - floor(viewRange / 2);
    let w1 = 1 / viewRange;
    for (let i = 0; i < this.cachedTiles.length; i++) {
      for (let j = 0; j < this.cachedTiles.length; j++) {
        let t = this.cachedTiles[i][j];
        t.tile.content.elt.remove();
        if (t.entity) t.entity.content.elt.remove();
      }
    }
    this.cachedTiles = new Array(viewRange);
    for (let i = 0; i < viewRange; i++) {
      this.cachedTiles[i] = [];
      for (let j = 0; j < viewRange; j++) {
        this.cachedTiles[i][j] = {
          tile: null,
          entity: null
        };
        let newX = xPos + i;
        let newY = yPos + j;
        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
          let tID = this.tiles[newX][newY].tileID;
          let eID = this.tiles[newX][newY].entityID;
          let sID = this.tiles[newX][newY].subTexID;
          this.cachedTiles[i][j].tile = new CustomImage(textureList[tID][sID], 0, 0, w1, w1);
          if (eID !== 0) this.cachedTiles[i][j].entity = new CustomImage(entityList[eID], 0, 0, w1, w1);
        } else {
          let sID = this.getNoise2D(newX, newY);
          this.cachedTiles[i][j].tile = new CustomImage(mapDir + "textures/void_tiles/void" + sID + ".png", 0, 0, w1, w1);
        }
        this.cachedTiles[i][j].tile.xRelToParent = i * w1;
        this.cachedTiles[i][j].tile.yRelToParent = j * w1;
        this.cachedTiles[i][j].tile.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        if (this.cachedTiles[i][j].entity) {
          this.cachedTiles[i][j].entity.xRelToParent = i * w1;
          this.cachedTiles[i][j].entity.yRelToParent = j * w1;
          this.cachedTiles[i][j].entity.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
        }
      }
    }
    this.show();
    this.displayOnce();
  }

  clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.tiles[x][y].set(TextureIDs.Grass);
        this.tiles[x][y].setEntity(EntityIDs.None);
        this.tiles[x][y].setTex(SubTextureIDs.VeryLight);
      }
    }
    this.forceUpdate();
  }

  set(x, y, id) {
    if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
      console.log("INVALID TILE", x, y);
      return;
    }
    this.tiles[x][y].set(id);
    //updateMinimap(x, y, id);
  }

  setEntity(x, y, id) {
    this.tiles[x][y].setEntity(id);
  }

  getIDs(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return {
        tID: -1,
        sID: -1,
        eID: -1,
      }
    } else {
      let t = this.tiles[x][y];
      return {
        tID: t.tileID,
        sID: t.subTexID,
        eID: t.entityID,
      }
    }
  }

  getNoise2D(i, j) {
    let noiseVal = noise(i * this.xMul + this.xOffs, j * this.yMul + this.yOffs);
    let len = 4;
    this.noiseMaxID = len;
    noiseVal = floor(noiseVal * this.noiseMaxID);
    return noiseVal;
  }

  checkIfLocationFree(x, y, tID, eID, sID) {
    if (this.getEnemyAtPosition(x, y)) return false; //There's an enemy at the position
    let ids = this.getIDs(x, y); //Get all necessary information about the target position
    if (tID !== null && ids.tID !== tID) return false; //Texture ID is not matching, e.g. if enemy needs to spawn on Grass
    if (eID !== null && ids.eID !== eID) return false; //Entity ID is not matching, e.g. if there's a key at that position
    if (sID !== null && ids.sID !== sID) return false; //SubTexture ID is not matching, e.g. if enemy needs to spawn on Very Dark Tiles
    return true; //Return true if everything matches the criteria
  }

  addEnemyToLocation(x, y, enemyType) {
    if (this.handleEnemy(x, y, enemyType)) {
      let enemy = enemies[enemies.length - 1];
      enemy.initPositions();
    } else {
      console.log("Something went wrong when adding the enemy");
    }
  }

  handleEnemy(x, y, entityID) {
    switch (entityID) {
      case EntityIDs.Scorpion:
        enemies.push(new Scorpion(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Spider:
        enemies.push(new Spider(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Ghost:
        enemies.push(new Ghost(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Wraith:
        enemies.push(new Wraith(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Octopus:
        enemies.push(new Octopus(x, y));
        entityCount.enemy.normal.total++;
        break;
      case EntityIDs.Dragon:
        enemies.push(new Dragon(x, y));
        entityCount.enemy.boss.total++;
        break;
      case EntityIDs.SkeletonBoss:
        enemies.push(new SkeletonBoss(x, y));
        entityCount.enemy.boss.total++;
        break;
      case EntityIDs.Key: //Key
        entityCount.object.key.total++;
        break;
      case EntityIDs.Trap: //Trap
        enemies.push(new Trap(x, y));
        break;
      case EntityIDs.Portal: //Spawner/Portal
        entityCount.enemy.spawner.total++;
        break;
      case EntityIDs.Player:
        player.position.x = x;
        player.position.y = y;
        break;
      default:
        return false;
    }
    return true;
  }

  getEnemyAtPosition(x, y) {
    if (this.tiles[x][y].enemyID === -1) return null;
    else return enemies[this.tiles[x][y].enemyID];
  }

  floodfill(xp, yp) {
    //debugger;

    let id = this.tiles[xp][yp].tileID;
    if (id === currentTexture) {
      console.log("Attempted to flood fill the same color!");
      return;
    }
    let q = [];
    q.push(this.tiles[xp][yp]);
    let x = xp,
      y = yp;
    while (q.length !== 0) {
      let n = q.shift();
      x = n.x;
      y = n.y;
      if (n.tileID === id) {
        n.set(currentTexture);
        if (this.validElement(x + 1, y)) q.push(this.tiles[x + 1][y]);
        if (this.validElement(x, y + 1)) q.push(this.tiles[x][y + 1]);
        if (this.validElement(x - 1, y)) q.push(this.tiles[x - 1][y]);
        if (this.validElement(x, y - 1)) q.push(this.tiles[x][y - 1]);
      }
    }
  }

  validElement(x, y) {
    return (x >= 0 && x < this.width && y >= 0 && y < this.height);
  }
}

class TileSet {
  constructor(i, j) {
    this.x = i;
    this.y = j;
    this.tileID = 0;
    this.subTexID = 0;
    this.entityID = 0;
    this.enemyID = -1;
    this.visible = false;
  }

  setEntity(i) {
    this.entityID = i;
  }

  set(i) {
    this.tileID = i;
  }

  setTex(i) {
    this.subTexID = i;
  }

  setEnemyID(i) {
    this.enemyID = i;
  }
}