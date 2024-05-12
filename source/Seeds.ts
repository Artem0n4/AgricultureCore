class Seeds {
  public id: string;
  constructor(id) {
    this.id = id + "_seeds";
  }
  public create() {
    IDRegistry.genItemID(this.id);
    Item.createItem(
      this.id,
      "item.agriculture_core." + this.id,
      {
        name: this.id,
        meta: 0,
      },
      {
        stack: 64,
        isTech: false,
      }
    );
    return this;
  }
  public setLevel(level: int) {
    let color: Native.Color;
    switch(level) {
      case 1: color = Native.Color.YELLOW;
      case 2: color = Native.Color.GREEN;
      case 3: color = Native.Color.GOLD;
      case 4: color = Native.Color.BLUE;
      case 5: color = Native.Color.RED;
      default: color = Native.Color.YELLOW;
    }
    Item.registerNameOverrideFunction(this.id, function (item, name) {
      return `${Translation.translate(
        name
      )}\n${Native.Color.GRAY}${Translation.translate("Level: ") + color + level}`;
    });
    return this;
  }
  protected plantById(
    block_id: string | number,
    coords: Callback.ItemUseCoordinates,
    player: int
  ) {
    const region = BlockSource.getDefaultForActor(player);
    const item = Entity.getCarriedItem(player);
    return (
      region.setBlock(
        coords.x,
        coords.y + 1,
        coords.z,
        typeof block_id !== "number" ? BlockID[block_id] : block_id,
        0
      ),
      Entity.setCarriedItem(
        player,
        item.id,
        item.count - 1,
        item.data,
        item.extra
      ),
      Commands.execAt(
        "playsound dig.grass @a[r=16] ~~~ 0.6 0.8",
        coords.x,
        coords.y,
        coords.z
      )
    );
  }
  public setPlanting(plant: string | number, farmlands: int[]) {
    Item.registerUseFunctionForID(
      ItemID[this.id],
      (coords, item, block, player) => {
        if (farmlands.includes(block.id)) {
          return this.plantById(plant, coords, player);
        }
      }
    );
    return this;
  }
}
