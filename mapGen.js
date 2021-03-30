let saveButton;
let loadButton;
let clearButton;

let tileButtons, entityButtons;
let rectCheckbox;

let floodButton;

let newMapButton;

let dimInput;
let saveSlotInput;
let loadSlotInput;

let currentTexture = 0,
  currentEntity = 0;
let floodfillMode = false;
let rectMode = false;
let rectCorner = 0;
let topRightX = 0;
let topRightY = 0;

let currentMode;

let len;

let defaultSaveName = "CustomMapForGame_";
let map;
let dim = 32;
let mapSize = 1000;
let tileSize = mapSize / dim;
let minimap;
let colorList;
let entityNames = [];
let entityList = [];
let textureNames = [];
let textureList = [];

function loadImages() {
  textureList[0] = loadImage("Tiles/usedTextures/textures/grass.JPG");
  textureList[1] = loadImage("Tiles/usedTextures/textures/sand.JPG");
  textureList[2] = loadImage("Tiles/usedTextures/textures/water.jpg");

  entityList[0] = loadImage("Tiles/usedTextures/entities/enemy0.png");
  entityList[1] = loadImage("Tiles/usedTextures/entities/enemy1.png");
  entityList[2] = loadImage("Tiles/usedTextures/entities/boss.png");
  entityList[3] = loadImage("Tiles/usedTextures/entities/key.png");
  entityList[4] = loadImage("Tiles/usedTextures/entities/trap.png");
  entityList[5] = loadImage("Tiles/usedTextures/entities/portal.png");
  entityList[6] = loadImage("Tiles/usedTextures/entities/player.png");
}


function setup() {
  createCanvas(screen.width, screen.height);

  loadImages();

  let alpha = 155;
  colorList = [
    color(0, 255, 0, alpha),
    color(255, 255, 0, alpha),
    color(0, 0, 255, alpha),
  ];

  textureNames = ["Grass", "Sand", "Water"];
  entityNames = ["Scorpion", "Spider", "Boss", "Key", "Trap", "Portal"];

  saveButton = createButton('Save Map');
  saveButton.position(mapSize + 110, 0);
  saveButton.size(100, 50);
  saveButton.mousePressed(saveMap);

  saveSlotInput = createInput('Save Slot Index Here');
  saveSlotInput.position(mapSize, 0);
  saveSlotInput.size(100, 40);

  loadButton = createButton('Load Map');
  loadButton.position(mapSize + 110, 50);
  loadButton.size(100, 50);
  loadButton.mousePressed(loadMap);

  loadSlotInput = createInput('Load Slot Index Here');
  loadSlotInput.position(mapSize, 50);
  loadSlotInput.size(100, 40);

  clearButton = createButton('Clear Map');
  clearButton.position(mapSize + 110, 100);
  clearButton.size(100, 50);
  clearButton.mousePressed(clearMap);

  newMapButton = createButton('Generate new Map');
  newMapButton.position(mapSize + 110, 150);
  newMapButton.size(100, 50);
  newMapButton.mousePressed(generateMap);

  dimInput = createInput('Map Size Here');
  dimInput.position(mapSize, 150);
  dimInput.size(100, 40);

  tileButtons = [];
  len = textureList.length;
  for (let i = 0; i < len; i++) {
    tileButtons[i] = createButton('Select ' + textureNames[i] + ' Tile');
    tileButtons[i].position(mapSize + 300, 50 * i);
    tileButtons[i].size(100, 50);
    tileButtons[i].mousePressed(() => {
      currentMode = 0;
      currentTexture = i;
    });
  }

  rectCheckbox = createCheckbox('Rect Mode');
  rectCheckbox.position(mapSize + 300, len * 50);
  rectCheckbox.size(100, 25);

  floodButton = createButton('Next Click will Flood Fill the Area');
  floodButton.position(mapSize + 300, (len + 0.5) * 50);
  floodButton.size(100, 50);
  floodButton.mousePressed(() => {
    floodfillMode = true;
  });

  entityButtons = [];
  len = entityList.length;
  for (let i = 0; i < len; i++) {
    entityButtons[i] = createButton('Select ' + entityNames[i] + ' Entity');
    entityButtons[i].position(mapSize + 500, 50 * i);
    entityButtons[i].size(100, 50);
    entityButtons[i].mousePressed(() => {
      currentMode = 1;
      currentEntity = i;
    });
  }

  generateMap();
}

function loadMap() {
  let saveName = defaultSaveName + loadSlotInput.value();
  let storedSave = localStorage.getItem(saveName);
  if (storedSave === null || typeof storedSave === "undefined") {
    console.log("Nothing to load!");
    return;
  }
  let decodeSave = atob(storedSave);
  let parsedSave = JSON.parse(decodeSave);
  let save = parsedSave;

  console.log("Found ", save);

  let mapWidth, mapHeight, mapDim;
  let defaultDim = 32;

  if (save.tiles === null || typeof save.tiles === 'undefined') {
    console.log("No tiles given, setting default Map.");
    save.tiles = [];
  }

  if (save.dim === null || typeof save.dim === 'undefined') {
    console.log("No dimension given, setting to default.");
    mapDim = defaultDim;
  } else {
    console.log("Setting dimension to " + save.dim + ".");
    mapDim = save.dim;
  }
  if (save.xSize === null || typeof save.xSize === 'undefined') {
    console.log("No map width given, setting to default.");
    mapWidth = mapSize / defaultDim;
  } else {
    console.log("Setting map width to " + save.xSize + ".");
    mapWidth = save.xSize;
  }
  if (save.ySize === null || typeof save.ySize === 'undefined') {
    console.log("No map height given, setting to default.");
    mapHeight = mapSize / defaultDim;
  } else {
    console.log("Setting map height to " + save.ySize + ".");
    mapHeight = save.ySize;
  }

  tileSize = mapSize / mapDim;

  console.log("Initializing new Map");
  let newMap = new Map(mapWidth, mapHeight);

  dim = mapDim;

  console.log("Creating new Map");
  for (let x = 0; x < mapWidth; x++) {
    console.log((x + 1) * 100 / mapWidth + "%");
    newMap.tiles[x] = [];
    for (let y = 0; y < mapHeight; y++) {
      newMap.tiles[x][y] = new TileSet(x, y, 0);
    }
  }

  console.log("Filling new Map");
  for (let t of save.tiles) {
    //console.log("Loaded tile at (" + t.xPos + "," + t.yPos + ") with an ID of " + t.tileID);
    if (t.index) newMap.set(t.xPos, t.yPos, t.index);
    if (t.tileID) newMap.set(t.xPos, t.yPos, t.tileID);
    if (t.entityID) newMap.setEntity(t.xPos, t.yPos, t.entityID);
  }

  console.log(newMap);
  map = newMap;
  generateMinimap();
}

function saveMap() {
  let toBeSaved = {
    dim: dim,
    xSize: map.width,
    ySize: map.height,
    tiles: []
  };
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      let tile = map.tiles[x][y];
      if (tile.tileID === 0 && tile.entityID === -1) continue;
      else {
        let t = {
          xPos: x,
          yPos: y,
          tileID: tile.tileID,
          entityID: tile.entityID,
        }
        toBeSaved.tiles.push(t);
      }
    }
  }
  let save = btoa(JSON.stringify(toBeSaved));
  let saveName = defaultSaveName + saveSlotInput.value();
  localStorage.setItem(saveName, save);
}

function clearMap() {
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      map.tiles[x][y].set(0);
      map.tiles[x][y].setEntity(-1);
    }
  }
}

function generateMap() {
  if (isNaN(floor(int(dimInput.value())))) dim = 32;
  else dim = floor(int(dimInput.value()));
  tileSize = mapSize / dim;
  map = new Map(dim, dim);
  generateMinimap();
}

function generateMinimap() {
  minimap = createImage(200, 200);
  minimap.loadPixels();
  for (let i = 0; i < minimap.width; i++) {
    for (let j = 0; j < minimap.height; j++) {
      let x = floor(i * map.width / minimap.width);
      let y = floor(j * map.height / minimap.height);
      minimap.set(i, j, colorList[map.tiles[x][y].tileID]);
    }
  }
  minimap.updatePixels();
}

let upd = setInterval(generateMinimap, 100);

/*
function updateMinimap(x, y, id) {
  return;
  let w = minimap.width / dim;
  let h = minimap.height / dim;
  minimap.loadPixels();
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      minimap.set(x * w + i, y * h + j, colorList[id]);
    }
  }
  minimap.updatePixels();
}
*/

function draw() {
  background(255);
  map.display();
  image(minimap, mapSize - 100, mapSize - 100, 100, 100);

  image(textureList[currentTexture], mapSize + 300, (len + 1) * 50, 100, 100);
  image(entityList[currentEntity], mapSize + 500, (len + 1) * 50, 100, 100);

  rectMode = rectCheckbox.checked();
}

class Map {
  constructor(xSize, ySize, initTiles = true) {
    this.tiles = [];
    this.width = xSize;
    this.height = ySize;
    if (initTiles) {
      for (let i = 0; i < xSize; i++) {
        this.tiles[i] = [];
        for (let j = 0; j < ySize; j++) {
          this.tiles[i][j] = new TileSet(i, j);
        }
      }
    }
  }

  display() {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.tiles[i][j].show();
      }
    }
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

  validElement(x, y) {
    return (x >= 0 && x < this.width && y >= 0 && y < this.height);
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
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= mapSize && mouseY >= 0 && mouseY <= mapSize) {
    if (currentMode === 0) {
      if (floodfillMode) {
        let x = floor(mouseX * dim / mapSize);
        let y = floor(mouseY * dim / mapSize);
        map.floodfill(x, y);
        floodfillMode = false;
      } else if (rectMode) {
        if (rectCorner === 0) {
          topRightX = mouseX;
          topRightY = mouseY;
          rectCorner = 1;
        } else {
          let minX = floor(min(mouseX, topRightX) * dim / mapSize);
          let maxX = floor(max(mouseX, topRightX) * dim / mapSize);
          let minY = floor(min(mouseY, topRightY) * dim / mapSize);
          let maxY = floor(max(mouseY, topRightY) * dim / mapSize);
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
        let x = floor(mouseX * dim / mapSize);
        let y = floor(mouseY * dim / mapSize);
        map.set(x, y, currentTexture);
      }
    } else if (currentMode === 1) {
      let x = floor(mouseX * dim / mapSize);
      let y = floor(mouseY * dim / mapSize);
      map.setEntity(x, y, currentEntity);

    }
  }
}

function mouseDragged() {
  if (mouseX >= 0 && mouseX <= mapSize && mouseY >= 0 && mouseY <= mapSize) {
    if (rectMode || currentMode === 1) return;
    let x = floor(mouseX * dim / mapSize);
    let y = floor(mouseY * dim / mapSize);
    map.set(x, y, currentTexture);
  }
}

class TileSet {
  constructor(x, y, id = 0) {
    this.x = x;
    this.y = y;
    this.tileID = id;
    this.entityID = -1;
    this.xPos = x * tileSize;
    this.yPos = y * tileSize;
    this.img = textureList[this.tileID];
    this.entity = null;
    //this.img.size(dim, dim);
  }

  setEntity(i) {
    this.entityID = i;
    if (i === -1) this.entity = null;
    else this.entity = entityList[i];
  }

  show() {
    if (dim > 20) {
      if (this.entity) image(this.entity, this.xPos, this.yPos, tileSize, tileSize);
      else image(this.img, this.xPos, this.yPos, tileSize, tileSize);
    } else {
      image(this.img, this.xPos, this.yPos, tileSize, tileSize);
      if (this.entity) image(this.entity, this.xPos, this.yPos, tileSize, tileSize);
    }
  }

  set(i) {
    this.tileID = i;
    this.img = textureList[i];
  }
}
