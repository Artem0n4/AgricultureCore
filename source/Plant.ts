class Plant {
  public createSeeds(level: int, farmlands: int[]): Seeds {
   const seeds = new Seeds(this.keyword);
   seeds.create();
   seeds.setLevel(level);
   seeds.setPlanting(BlockID[this.keyword + "_plant"], farmlands);
   return seeds;
  }
  constructor(public keyword: string, public stages: int, level = 1, farmlands: int[], essence_id: string, public type: string = "plant") {
    this.createBlock();
    this.randomCheckToDestroyIfNeeded();
    this.setupGrowing();
    this.growByFertilizers();
    this.createSeeds(level, farmlands);
    this.registerDrop(essence_id);
    Item.addCreativeGroup("creative_group.agriculture_core.seeds", "seeds",
     [ItemID[this.keyword + "_seeds"]]);
  }

  public static growCustom(
    fertilizer: string,
    data: int,
    coords: Callback.ItemUseCoordinates,
    item: ItemInstance,
    block: Tile,
    player: int
  ) {
    if (item.id !== ItemID[fertilizer]) return;
    const actor = new PlayerActor(player);
    for (let i = 0; i < 16; i++) {
      const px = coords.x + Math.random();
      const pz = coords.z + Math.random();
      const py = coords.y + Math.random();
      Particles.addParticle(37, px, py, pz, 0, 0, 0);
    }
   return World.setBlock(coords.x, coords.y, coords.z, block.id, data),
   actor.getGameMode() !== EGameMode.CREATIVE && 
   Entity.setCarriedItem(player, item.id, item.count - 1, item.data, item.extra)
  }
  public growByFertilizers() {
    Block.registerClickFunctionForID(
      BlockID[this.keyword + "_plant"],
      (coords, item, block, player) => {
        const random = randomInt(1, 6);
        return Plant.growCustom(
          "mystical_fertilizer",
          this.stages,
          coords,
          item,
          block,
          player
        ),
        Plant.growCustom(
          "fertilized_essence",
           random < this.stages ? random : Math.abs(block.data - random),
          coords,
          item,
          block,
          player
        );
      }
    );
  }
  public createBlock() {
    const datas = [];
    const id = this.keyword + "_plant";
    for (let i = 0; i <= this.stages; i++) {
      const condition = i <= this.stages - 1 ? `${this.type}_resources` : id;
      datas.push({
        name: condition,
        texture: [[condition, i <= this.stages - 1 ? i : 0]],
        inCreative: false,
      });
    };
    IDRegistry.genBlockID(id);
    Block.createBlock(id, datas, PLANT_BLOCKTYPE);
    Block.setBlockShape(
      BlockID[id],
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0.001, z: 1 }
    );
  }
  public randomCheckToDestroyIfNeeded() {
    Block.registerNeighbourChangeFunction(
      this.keyword + "_plant",
      (coords, block, changeCoords, region) => {
        if (
          region.getBlockId(coords.x, coords.y - 1, coords.z) !==
          VanillaBlockID.farmland
        ) {
         return region.destroyBlock(coords.x, coords.y, coords.z);
        }
      }
    );
  }
  public registerDrop(essence_id: string) {
    Block.registerDropFunction(
      this.keyword + "_plant",
      (
        blockCoords: Callback.ItemUseCoordinates,
        blockID: number,
        blockData: number
      ) => {
        const essence =
          Math.random() <= 0.1
            ? [ItemID["fertilized_essence"], 1, 0]
            : ([0, 0, 0] as any);
        return blockData >= this.stages
          ? [
              [ItemID[this.keyword + "_seeds"], randomInt(1, 3), 0],
              [ItemID[essence_id], 1, 0],
              essence
            ]
          : [[ItemID[this.keyword + "_seeds", 1, 0]]];
      }
    );
  }
  public setupGrowing() {
    Block.setRandomTickCallback(
      BlockID[this.keyword + "_plant"],
      (x, y, z, id, data, region) => {
        if (region.getLightLevel(x, y, z) >= 9) {
          return region.setBlock(x, y, z, id, data < this.stages ? data + 1 : data);
        }
      }
    );
  }
}
