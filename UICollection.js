/*
Example:

let xyz = new UICollection("HealAction", 0, 0, 1, 0,
  [
    [Button, "Heal (" + ActionCost.HealAction + " EP)", () => {
      if (player.attributes[AttributeIDs.Energy].current < ActionCost.HealAction) {
        return;
      }
      player.heal();
      mainWindow.subMenus[SubMenu.Field].children[1].displayOnce();
      if (currentlyFightingEnemy)
        currentlyFightingEnemy.performRandomAction(player);
      mainWindow.subMenus[SubMenu.Field].children[1].displayOnce();
    }],
    [Text, ["Heal yourself for ", "player.attributes[AttributeIDs.Damage].total * player.healRange.min", " to ", "player.attributes[AttributeIDs.Damage].total * player.healRange.max", " hitpoints"]],
    [Text, ["This is another text!"]]
  ],
  [
    [1, 3],
    [
      [1],
      [1, 1]
    ]
  ], [0.0, space]));
*/



class UICollection extends MenuTemplate {
  constructor(name, x, y, w, h, child, dims, space = [0.0, 0.0]) {
    super(name, x, y, w, h);
    if (dims[0].length != dims[1].length) {
      console.log("Failed to create UICollection.");
      console.log("Reason: Wrong Dimensions for widths and heights.");
      return;
    }

    let sumWidth = 0,
      spaceForChildren = 0;
    for (let i = 0; i < dims[0].length; i++) {
      sumWidth += dims[0][i];
      for (let j = 0; j < dims[1][i].length; j++) {
        spaceForChildren++;
      }
    }

    let tmpWidth = [];
    let tmpHeight = [];
    for (let i = 0; i < dims[0].length; i++) {
      let sumHeight = 0;
      for (let j = 0; j < dims[1][i].length; j++) {
        sumHeight += dims[1][i][j];
      }
      for (let j = 0; j < dims[1][i].length; j++) {
        tmpWidth.push(dims[0][i] / sumWidth);
        tmpHeight.push(dims[1][i][j] / sumHeight);
      }
    }

    let xOff = 0;
    let yOff = 0;
    let width = 0;
    let height = 0;
    let xywh = [];
    let id = 0;
    for (let i = 0; i < dims[0].length; i++) {
      yOff = 0;
      for (let j = 0; j < dims[1][i].length; j++) {
        xywh.push({
          x: xOff,
          y: yOff,
          w: tmpWidth[id],
          h: tmpHeight[id],
        });
        yOff += tmpHeight[id];
        id++;
      }
      xOff += tmpWidth[id - 1];
    }

    for (let dim of xywh) {
      dim.x = (1 - 2 * dim.x) * space[0] + dim.x;
      dim.y = (1 - 2 * dim.y) * space[1] + dim.y;
      dim.w = dim.w * (1.0 - 2 * space[0]);
      dim.h = dim.h * (1.0 - 2 * space[1]);
    }

    for (let i = 0; i < child.length; i++) {
      if (i >= spaceForChildren) {
        console.log("Attempted to add more children than space is available.");
        break;
      }
      let c = child[i];
      let id = i % xywh.length;
      xOff = xywh[id].x;
      yOff = xywh[id].y;
      width = xywh[id].w;
      height = xywh[id].h;
      try {
        switch (c[0]) {
          case UICollection:
            this.children.push(new UICollection("", xOff, yOff, width, height, c[1], c[2], c[3]));
            break;
          case Button:
            this.children.push(new Button(c[1], xOff, yOff, width, height, c[2]));
            break;
          case Text:
            this.children.push(new Text(c[1], xOff, yOff, width, height));
            break;
          case CustomImage:
            this.children.push(new CustomImage(c[1], xOff, yOff, width, height, c[2]));
            break;
          case ProgressBar:
            this.children.push(new ProgressBar(c[1], c[2], c[3], xOff, yOff, width, height));
            break;
          case EmptyElement:
            this.children.push(new EmptyElement(xOff, yOff, width, height));
            break;
          default:
            console.log("Attempted to push an undefined UI element.");
            this.children.push(new EmptyElement(xOff, yOff, width, height));
            break;
        }
        //this.children.push(new c[0](c[1], 0, 0, 0, 0, c[2]));
      } catch (e) {
        console.log("Something went terribly wrong!");
        console.log("Couldn't push " + c[0].name + " to the stack!");
        console.log("Reason: " + e);
        this.children.push(new Text(["The Element you wanted to place here caused an error."], xOff, yOff, width, height));
      }
    }
  }
}
