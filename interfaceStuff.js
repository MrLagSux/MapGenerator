let realDefaultFontSize = 32;
let defaultFontSize = realDefaultFontSize;
let debug = false;
let equipSlotCount = 17;
let digits = 2;

class BaseUIBlock {
  constructor(x, y, w, h) {
    this.xRelToParent = x;
    this.yRelToParent = y;
    this.wRelToParent = w;
    this.hRelToParent = h;
    this.xAbsToScreen = 0;
    this.yAbsToScreen = 0;
    this.wAbsToScreen = 0;
    this.hAbsToScreen = 0;
    this.tempY = 0;
    this.tempX = 0;
    this.tempW = 0;
    this.tempH = 0;
    this.hidden = true;
    this.aspectRatio = 0;
    this.content = null;
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    this.xAbsToScreen = parentXAbs + parentWAbs * this.xRelToParent;
    this.yAbsToScreen = parentYAbs + parentHAbs * this.yRelToParent;
    this.wAbsToScreen = parentWAbs * this.wRelToParent;
    this.hAbsToScreen = parentHAbs * this.hRelToParent;
    if (this.aspectRatio !== 0) {
      this.tempX = this.xAbsToScreen;
      this.tempY = this.yAbsToScreen;
      this.tempW = this.wAbsToScreen;
      this.tempH = this.hAbsToScreen;
      if (this.wAbsToScreen / this.aspectRatio > this.hAbsToScreen) {
        this.wAbsToScreen = this.hAbsToScreen * this.aspectRatio;
        this.xAbsToScreen = this.xAbsToScreen + (this.tempW - this.wAbsToScreen) / 2.0;
      } else {
        this.hAbsToScreen = this.wAbsToScreen / this.aspectRatio;
        this.yAbsToScreen = this.yAbsToScreen + (this.tempH - this.hAbsToScreen) / 2.0;
      }
    }
  }

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
    if (this.content === null) return;
    this.content.position(this.xAbsToScreen, this.yAbsToScreen);
    this.content.size(this.wAbsToScreen, this.hAbsToScreen);
  }

  displayEveryFrame() {}

  hide() {
    if (this.content === null) return;
    this.content.hide();
  }

  show() {
    if (this.content === null) return;
    this.content.show();
  }
}

class Button extends BaseUIBlock {
  constructor(name, x, y, w, h, fun, s = defaultFontSize) {
    super(x, y, w, h);
    this.content = createButton(name);
    this.content.mouseReleased(fun);
    this.txtSize = s;
    this.content.style('font-size', this.txtSize + 'px');
    this.content.style('font-weight', 'bold');
    this.content.style('font-family', 'monospace');
    this.content.style('display', 'inline-flex');
    this.content.style('justify-content', 'center');
    this.content.style('align-items', 'center');
    this.content.style('padding', '0.5em var(--padding-x)');
    this.content.style('border-width', '2px');
    this.content.style('border-style', 'solid');
    this.content.style('background', 'rgba(255, 150, 0, 0.8)');
    this.content.style('opacity', '0.8');
    this.content.style('border-color', ' rgba(0, 0, 255, 0.8)');
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    this.txtSize = floor(this.wAbsToScreen / getStringSizeInPixels(this.content.html(), "-mono")) - 1;
    this.txtSize = Math.min(this.txtSize, this.hAbsToScreen * 0.8);
    this.txtSize = Math.min(this.txtSize, defaultFontSize);
    this.content.style('font-size', this.txtSize + 'px');
  }
}

class Text extends BaseUIBlock {
  constructor(messageArray, x, y, w, h, a = 'center', format = true, maxFontSize = defaultFontSize) {
    super(x, y, w, h);
    this.message = messageArray;
    this.txtSize = defaultFontSize;
    this.align = a;
    this.format = format;
    this.maxTxtSize = maxFontSize;
    this.textLengthInPixels = 0;
    this.content = createP(this.secondaryMessage + roundToSpecificDecimalLength(eval(this.message), 2));
    this.content.style('font-weight', 'bold');
    this.content.style('font-family', 'cursive');
    this.content.style('line-height', '0px');
    this.content.style('text-align', this.align);
    this.content.style('font-size', defaultFontSize);
    this.content.style('text-shadow', '0px 0px 10px rgba(255, 255, 255, 1)');
    this.setTextLength();
  }

  setText(arr) {
    this.message = [...arr];
    this.setTextLength();
    this.setTextSize();
    this.displayOnce();
  }

  setTextLength() {
    let resultString = "";
    for (let i = 0; i < this.message.length; i++) {
      let msg = this.message[i];
      try {
        let valText = roundToSpecificDecimalLength(eval(msg), digits);
        if (this.format) valText = toFixedDecimalLength(valText, digits);
        resultString += valText;
      } catch (e) {
        resultString += msg;
      }
    }
    this.textLengthInPixels = getStringSizeInPixels(resultString, "-cursive");
  }

  setTextSize() {
    this.txtSize = floor(this.wAbsToScreen / this.textLengthInPixels);
    this.txtSize = Math.min(this.txtSize, this.hAbsToScreen * 0.8);
    this.txtSize = Math.min(this.txtSize, this.maxTxtSize);
  }

  resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs) {
    super.resize(parentXAbs, parentYAbs, parentWAbs, parentHAbs);
    this.setTextLength();
    this.setTextSize();
    this.content.style('font-size', this.txtSize + 'px');
    this.content.style('margin', (this.hAbsToScreen / 2) + 'px 0px');
    //this.content.center();
  }

  displayOnce() {
    super.displayOnce();
    let resultString = "";
    for (let i = 0; i < this.message.length; i++) {
      let msg = this.message[i];
      try {
        let valText = roundToSpecificDecimalLength(eval(msg), digits);
        if (this.format) valText = toFixedDecimalLength(valText, digits);
        resultString += valText;
      } catch (e) {
        resultString += msg;
      }
    }
    this.content.html(resultString);
  }
}

class CustomImage extends BaseUIBlock {
  constructor(n, x, y, w, h, ar = 1) {
    super(x, y, w, h);
    this.content = createImg(n, "");
    this.content.hide();
    this.aspectRatio = ar;
  }
}

class MainMenuButton extends Button {
  constructor(name, x, y, w, h, id) {
    super(name, x, y, w, h, function() {
      mainWindow.showMenu(id);
      mainWindow.resize();
      mainWindow.displayOnce();
    });
  }
}

class ItemSlot extends BaseUIBlock {
  constructor(id, x, y, w, h, item, itemTypeID = -1) {
    super(x, y, w, h);
    this.slotID = id;
    this.item = item ?? null;
    this.itemID = item?.id ?? -1;
    this.itemTypeID = itemTypeID;
    this.mouseOver = false;
    if (item === null || item.img === null) this.content = null;
    else this.content = item.img;
    this.setMouseEvents();
    this.createTooltip();
  }

  setMouseEvents() {
    //if (this.item === null || typeof this.item === "undefined") return;
    //if (this.item.img === null || typeof this.item.img === "undefined") return;
    if (this.content === null) return;
    this.content.attribute("draggable", false);
    this.content.style("user-select", "none");
    this.content.mousePressed(() => {
      currentlySelectedSlotID = this.slotID;
      currentlySelectedItemID = this.itemID;
      console.log(currentlySelectedSlotID);
    });
    this.content.mouseOver(() => {
      currentlySelectedItemID = this.itemID;
      mainWindow.currentSubMenu.displayOnce();
    });
    this.content.mouseOut(() => {
      currentlySelectedItemID = -1;
      mainWindow.currentSubMenu.displayOnce();
    });
  }

  setItem(item) {
    if (item === null || typeof item === "undefined") {
      console.log("Attempted to set an undefined item.");
      return;
    }
    this.item = item;
    this.itemID = item.id;
    this.content = item.img;
    this.itemTypeID = item.itemType;
    this.setMouseEvents();
    this.createTooltip();
  }

  setItemByID(i) {
    if (i === -1) {
      this.item = null;
      this.itemID = -1;
      this.content = null;
      if (this.slotID >= equipSlotCount) this.itemTypeID = -1;
      this.mouseOver = false;
      this.displayOnce();
      return;
    }
    this.item = itemList[i];
    this.itemID = itemList[i].id;
    this.content = itemList[i].img;
    this.itemTypeID = itemList[i].itemType;
    this.setMouseEvents();
    this.displayOnce();
  }

  displayOnce() {
    push();
    strokeWeight(0.3);
    stroke(0);
    if (currentlySelectedItemID !== -1 && this.itemID === currentlySelectedItemID) fill(0, 255, 0);
    else fill(255);
    rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    pop();

    if (this.content) {
      let x = this.xAbsToScreen;
      let y = this.yAbsToScreen;
      let s = this.hAbsToScreen;
      let newS = s * (1 + 0.2 * this.mouseOver);
      let off = (newS - s) / 2;
      x = x - off;
      y = y - off;
      this.content.position(x, y);
      this.content.size(newS, newS);
    }
  }

  displayEveryFrame() {}

  createTooltip() {
    if (this.content === null || this.item === null) return;
    this.content.attribute("title", this.item.getTooltip());
  }
}

class ProgressBar extends BaseUIBlock {
  constructor(cval, mval, col, x, y, w, h) {
    super(x, y, w, h);
    this.currVal = cval;
    this.maxVal = mval;
    this.color = col;
    this.maxTxtSize = defaultFontSize;
  }

  displayOnce() {
    this.txtSize = Math.min(this.maxTxtSize, this.hAbsToScreen * 0.8);
    let v1, v2;
    try {
      v1 = roundToSpecificDecimalLength(eval(this.currVal), digits);
      v1 = toFixedDecimalLength(v1, digits);
      v2 = roundToSpecificDecimalLength(eval(this.maxVal), digits);
      v2 = toFixedDecimalLength(v2, digits);
    } catch (e) {
      return;
    }
    let ratio = v1 / v2;
    push();
    fill(255);
    rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    noStroke();
    fill(this.color);
    rect(this.xAbsToScreen + 1, this.yAbsToScreen + 1, this.wAbsToScreen * ratio - 2, this.hAbsToScreen - 2);
    fill(0);
    textSize(this.txtSize);
    textAlign(LEFT, CENTER);
    text(v1, this.xAbsToScreen, this.yAbsToScreen + this.hAbsToScreen / 2);
    textAlign(RIGHT, CENTER);
    text(v2, this.xAbsToScreen + this.wAbsToScreen, this.yAbsToScreen + this.hAbsToScreen / 2);
    pop();
  }

  displayEveryFrame() {

  }
}

class EmptyElement extends BaseUIBlock {
  constructor(x, y, w, h) {
    super(x, y, w, h);
  }
}

function swapItems(id1, id2) {
  //debugger;
  let inv = mainWindow.currentSubMenu;
  let slot1, slot2;
  let item1, item2;

  console.log("Swapping Items", id1, id2);
  if (id1 < 0 || id2 < 0 || id1 > itemCount + equipSlotCount || id2 > itemCount + equipSlotCount) {
    console.log("Something went wrong!");
    return;
  }
  //Get both ItemSlots
  if (id1 >= equipSlotCount && id2 >= equipSlotCount) {
    //Both Items in Inventory
    slot1 = inv.children[1].children[id1 - equipSlotCount];
    slot2 = inv.children[1].children[id2 - equipSlotCount];
    item1 = slot1.itemID;
    item2 = slot2.itemID;
    slot1.setItemByID(item2);
    slot2.setItemByID(item1);
    return;
  } else if (id1 >= equipSlotCount && id2 < equipSlotCount) {
    //Item One in Inventory, Item Two in Equipment
    slot1 = inv.children[1].children[id1 - equipSlotCount];
    slot2 = inv.children[0].children[id2];
  } else if (id1 < equipSlotCount && id2 >= equipSlotCount) {
    //Item One in Equipment, Item Two in Inventory
    slot1 = inv.children[0].children[id1];
    slot2 = inv.children[1].children[id2 - equipSlotCount];
  } else if (id1 < equipSlotCount && id2 < equipSlotCount) {
    //Both Items in Equipment
    slot1 = inv.children[0].children[id1];
    slot2 = inv.children[0].children[id2];
  }

  //Is swapping Items possible? (E.g. can you equip a Sword in the Shield slot?)
  let itemTypeID1 = slot1.itemTypeID;
  let itemTypeID2 = slot2.itemTypeID;
  if (itemTypeID2 === -1) {
    //Moving Item to empty (non-equipment) slot
    item1 = slot1.itemID;
    item2 = slot2.itemID;
    slot1.setItemByID(item2);
    slot2.setItemByID(item1);
    return;
  }
  if (itemTypeID1 === itemTypeID2) {
    //Same item type in both slots, swap possible
    item1 = slot1.itemID;
    item2 = slot2.itemID;
    slot1.setItemByID(item2);
    slot2.setItemByID(item1);
  }
}

function roundToSpecificDecimalLength(val, digits) {
  if (typeof val !== "number") return val;
  if (isNaN(val)) return;
  if (val === 0) return 0;
  var powOf10 = pow(10, digits);
  return round(val * powOf10) / powOf10;
}

let replacementChar = "0";
function toFixedDecimalLength(val, digits) {
  if (typeof val !== "number") return val;
  var splitted = (val + "").split(".");
  var s;
  if (splitted.length === 1)
    s = splitted[0] + "." + replacementChar.repeat(digits);
  else
    s = splitted[0] + "." + splitted[1].padEnd(digits, replacementChar);
  return s;
}

function getStringSizeInPixels(text, type) {
  let ruler = document.getElementById("ruler" + type);
  ruler.innerHTML = text;
  return ruler.offsetWidth / 100;
}

//Returns singular or plural form
//Of the word based on number
function pl(word, number, plural) {
  plural = (plural === '' || plural === undefined) ? word + 's' : plural;
  return `${number} ${number !== 1 ? plural : word}`;
}
