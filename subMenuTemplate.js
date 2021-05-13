class MenuTemplate {
  constructor(name, x, y, w, h) {
    this.name = name;
    this.xRelToParent = x;
    this.yRelToParent = y;
    this.wRelToParent = w;
    this.hRelToParent = h;
    this.xAbsToScreen = 0;
    this.yAbsToScreen = 0;
    this.wAbsToScreen = 0;
    this.hAbsToScreen = 0;
    this.children = []; //Alle Elemente eines Fensters hier rein, wenn möglich
    this.hidden = true;
    this.aspectRatio = 0;
  }

  displayOnce() {
    push();
    noFill();
    strokeWeight(2);
    stroke(102);
    rect(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
    pop();
    for (var c of this.children)
      if (typeof c !== "undefined" && c !== null)
        c.displayOnce();
  }

  displayEveryFrame() {
    if (this.hidden) return;
    for (var c of this.children)
      if (typeof c !== "undefined" && c !== null)
        c.displayEveryFrame();
  }

  show() {
    this.hidden = false;
    for (let c of this.children)
      if (typeof c !== "undefined" && c !== null)
        c.show();
  }

  hide() {
    this.hidden = true;
    for (let c of this.children)
      if (typeof c !== "undefined" && c !== null)
        c.hide();
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
    for (var c of this.children)
      if (typeof c !== "undefined" && c !== null)
        c.resize(this.xAbsToScreen, this.yAbsToScreen, this.wAbsToScreen, this.hAbsToScreen);
  }
}
