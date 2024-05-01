class Seeds {
    public id: string;
    constructor(id) {
        this.id = id + "_seeds"
    };

    public create() {
        IDRegistry.genItemID(this.id);
        Item.createItem(this.id, "item.agriculture_core." + this.id, {
          name: this.id,
          meta: 0
        }, {
          stack: 64, 
          isTech: false
        });
        return this;
    };
      public setLevel(level: int) {
        Item.registerNameOverrideFunction(this.id, function (item, name) { 
            return Translation.translate(name) + "\n§7" + Translation.translate("Level: ") + level});
          return this;
      };
       protected plantById(block_id: string | number, coords: Vector, player: int) {
          const region = BlockSource.getDefaultForActor(player);
          const item = Entity.getCarriedItem(player);

          return region.setBlock(coords.x, coords.y + 1, coords.z, 
            typeof block_id !== "number" ? BlockID[block_id] : block_id, 0),
          Entity.setCarriedItem(player, item.id, item.count -= 1, item.data, item.extra);

       }
   public setPlanting(plant: string | number, farmlands: int[]) {
     Item.registerUseFunctionForID(ItemID[this.id], (coords, item, block, player) => {
            for(const farmland of farmlands) {
                 if(block.id === farmland) {
                     return this.plantById(plant, coords, player);
                 }
            }
     });
     return this;
   };

}
 