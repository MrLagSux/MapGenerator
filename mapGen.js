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
let mapSize = 800;
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

  entityList[0] = loadImage("Tiles/usedTextures/entities/none.png");
  entityList[1] = loadImage("Tiles/usedTextures/entities/enemy0.png");
  entityList[2] = loadImage("Tiles/usedTextures/entities/enemy1.png");
  entityList[3] = loadImage("Tiles/usedTextures/entities/boss.png");
  entityList[4] = loadImage("Tiles/usedTextures/entities/key.png");
  entityList[5] = loadImage("Tiles/usedTextures/entities/trap.png");
  entityList[6] = loadImage("Tiles/usedTextures/entities/portal.png");
  entityList[7] = loadImage("Tiles/usedTextures/entities/player.png");
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
  entityNames = ["None", "Scorpion", "Spider", "Boss", "Key", "Trap", "Portal", "Player"];

  saveButton = createButton('Save Map');
  saveButton.position(mapSize + 110, 0);
  saveButton.size(100, 50);
  saveButton.mousePressed(saveMap);

  saveSlotInput = createInput('File Name Here');
  saveSlotInput.position(mapSize, 0);
  saveSlotInput.size(100, 40);

  loadButton = createButton('Load Map');
  loadButton.position(mapSize + 110, 50);
  loadButton.size(100, 50);
  loadButton.mousePressed(loadMap);

  loadSlotInput = createInput('File Name Here');
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

function loadActualMap(sav) {
  let newMap = new Map(0, 0);
  let mapFile = sav;
  dim = mapFile.width;
  tileSize = mapSize / dim;
  newMap.width = dim;
  newMap.height = dim;
  let getID = (a) => {
    return {
      tileID: round((a - (a % 10)) / 10),
      entityID: a % 10
    };
  };
  mapFile.loadPixels();
  for (let x = 0; x < dim; x++) {
    newMap.tiles[x] = [];
    for (let y = 0; y < dim; y++) {
      newMap.tiles[x][y] = new TileSet(x, y, 0);
      //let i = mapFile.get(x, y); //Slow AF .get(x, y)
      let i = mapFile.pixels[(y * dim + x) * 4]; //We can just directly access the pixel array for super speed
      //if (i === 255 || i === 0) continue;
      //      console.log(i);
      let ids = getID(i);
      newMap.tiles[x][y].set(ids.tileID);
      newMap.tiles[x][y].setEntity(ids.entityID);
    }
  }
  mapFile.updatePixels();

  console.log(newMap);
  map = newMap;
}

function loadMap() {
  let saveName = 'maps/' + loadSlotInput.value() + '.png';
  let sav = loadImage(saveName, loadActualMap);
  /*
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
  */
}

function saveMap() {
  //Helper function to get an unique ID based on tileID and entityID
  let getID = (a, b) => {
    return a * 10 + b;
  };

  let sav = createImage(dim, dim);
  sav.loadPixels();
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      sav.pixels[(j * dim + i) * 4] = getID(map.tiles[i][j].tileID, map.tiles[i][j].entityID);
      sav.pixels[(j * dim + i) * 4 + 1] = getID(map.tiles[i][j].tileID, map.tiles[i][j].entityID);
      sav.pixels[(j * dim + i) * 4 + 2] = getID(map.tiles[i][j].tileID, map.tiles[i][j].entityID);
      sav.pixels[(j * dim + i) * 4 + 3] = 255;
    }
  }
  sav.updatePixels();
  console.log(sav);
  save(sav, saveSlotInput.value() + '.png');
  /*
  let toBeSaved = {
    dim: dim,
    defaultID: -1,
    tiles: []
  };

  let textureCount, mostUsedID = 0,
    mostUsedCount;

  //Find most used texture ID so that when we load a map we can set a default value
  {
    textureCount = new Array(textureList.length);
    textureCount.fill(0);
    //Go through tile set, write down how often a texture appeared
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        textureCount[map.tiles[x][y].tileID]++;
      }
    }
    mostUsedID = 0;
    mostUsedCount = 0;
    //Find actual most used texture ID
    for (let i = 0; i < textureCount.length; i++) {
      if (textureCount[i] > mostUsedCount) {
        mostUsedCount = textureCount[i];
        mostUsedID = i;
      }
    }
    toBeSaved.defaultID = mostUsedID;
  }



  //Go through tile set and save tiles different to the default tile
  {
    for (let x = 0; x < map.width; x++) {
      for (let y = 0; y < map.height; y++) {
        let tile = map.tiles[x][y];
        if (tile.tileID === mostUsedID && tile.entityID === -1) continue; //Don't want to save default tiles
        else {
          //Note: We now need x and y pos of the tile so that we can savely place it when loading
          let uniqueID = getID(tile.tileID, tile.entityID);
          if (typeof toBeSaved.tiles[uniqueID] === 'undefined') toBeSaved.tiles[uniqueID] = [];
          let t = {
            x: tile.x,
            y: tile.y
          };
          toBeSaved.tiles[uniqueID].push(t);
        }
      }
    }
  }

  console.log(toBeSaved);
  const size = new TextEncoder().encode(JSON.stringify(toBeSaved)).length;
  const kiloBytes = size / 1024;
  console.log(kiloBytes);
  let sav = btoa(JSON.stringify(toBeSaved));
  console.log(sav);
  let saveName = saveSlotInput.value() + '.txt';
  saveStrings([sav], saveName);
  //localStorage.setItem(saveName, save);
  */
}

function clearMap() {
  for (let x = 0; x < map.width; x++) {
    for (let y = 0; y < map.height; y++) {
      map.tiles[x][y].set(0);
      map.tiles[x][y].setEntity(0);
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
    this.entityID = 0;
    this.xPos = x * tileSize;
    this.yPos = y * tileSize;
    this.img = textureList[this.tileID];
    this.entity = entityList[this.entityID];
    //this.img.size(dim, dim);
  }

  setEntity(i) {
    this.entityID = i;
    this.entity = entityList[i];
  }

  show() {
    /*if (dim > 20) {
      if (this.entity) image(this.entity, this.xPos, this.yPos, tileSize, tileSize);
      else image(this.img, this.xPos, this.yPos, tileSize, tileSize);
    } else {*/
    image(this.img, this.xPos, this.yPos, tileSize, tileSize);
    image(this.entity, this.xPos, this.yPos, tileSize, tileSize);
    //}
  }

  set(i) {
    this.tileID = i;
    this.img = textureList[i];
  }
}
