LIBRARY({
    name: "AgricultureCore",
    version: 1,
    shared: true,
    api: "CoreEngine",
});
var LIB = { name: "AgricultureCore", version: 1 };
alert("".concat(LIB.name, " of version ").concat(LIB.version, " has been initialized!"));
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var PLANT_BLOCKTYPE = Block.createSpecialType({
    renderlayer: 3,
    translucency: 0,
    lightopacity: 0,
    destroytime: 0,
    rendertype: 1,
    sound: "grass"
}, "crop");
Translation.addTranslation("Level: ", { en: "Level: ", ru: "Уровень: " });
Translation.addTranslation("seeds", { en: "Seeds", ru: "Семена" });
var Seeds = /** @class */ (function () {
    function Seeds(id) {
        this.id = id + "_seeds";
    }
    Seeds.prototype.create = function () {
        IDRegistry.genItemID(this.id);
        Item.createItem(this.id, "item.agriculture_core." + this.id, {
            name: this.id,
            meta: 0,
        }, {
            stack: 64,
            isTech: false,
        });
        return this;
    };
    Seeds.prototype.setLevel = function (level) {
        var color;
        switch (level) {
            case 1: color = Native.Color.YELLOW;
            case 2: color = Native.Color.GREEN;
            case 3: color = Native.Color.GOLD;
            case 4: color = Native.Color.BLUE;
            case 5: color = Native.Color.RED;
            default: color = Native.Color.YELLOW;
        }
        Item.registerNameOverrideFunction(this.id, function (item, name) {
            return "".concat(Translation.translate(name), "\n").concat(Native.Color.GRAY).concat(Translation.translate("Level: ") + color + level);
        });
        return this;
    };
    Seeds.prototype.plantById = function (block_id, coords, player) {
        var region = BlockSource.getDefaultForActor(player);
        var item = Entity.getCarriedItem(player);
        return (region.setBlock(coords.x, coords.y + 1, coords.z, typeof block_id !== "number" ? BlockID[block_id] : block_id, 0),
            Entity.setCarriedItem(player, item.id, item.count - 1, item.data, item.extra),
            Commands.execAt("playsound dig.grass @a[r=16] ~~~ 0.6 0.8", coords.x, coords.y, coords.z));
    };
    Seeds.prototype.setPlanting = function (plant, farmlands) {
        var _this = this;
        Item.registerUseFunctionForID(ItemID[this.id], function (coords, item, block, player) {
            if (farmlands.includes(block.id)) {
                return _this.plantById(plant, coords, player);
            }
        });
        return this;
    };
    return Seeds;
}());
var Plant = /** @class */ (function () {
    function Plant(keyword, stages, level, farmlands, essence_id, type) {
        if (level === void 0) { level = 1; }
        if (type === void 0) { type = "plant"; }
        this.keyword = keyword;
        this.stages = stages;
        this.type = type;
        this.createBlock();
        this.randomCheckToDestroyIfNeeded();
        this.setupGrowing();
        this.growByFertilizers();
        this.createSeeds(level, farmlands);
        this.registerDrop(essence_id);
        Item.addCreativeGroup("creative_group.agriculture_core.seeds", "seeds", [ItemID[this.keyword + "_seeds"]]);
    }
    Plant.prototype.createSeeds = function (level, farmlands) {
        var seeds = new Seeds(this.keyword);
        seeds.create();
        seeds.setLevel(level);
        seeds.setPlanting(BlockID[this.keyword + "_plant"], farmlands);
        return seeds;
    };
    Plant.growCustom = function (fertilizer, data, coords, item, block, player) {
        if (item.id !== ItemID[fertilizer])
            return;
        var actor = new PlayerActor(player);
        for (var i = 0; i < 16; i++) {
            var px = coords.x + Math.random();
            var pz = coords.z + Math.random();
            var py = coords.y + Math.random();
            Particles.addParticle(37, px, py, pz, 0, 0, 0);
        }
        return World.setBlock(coords.x, coords.y, coords.z, block.id, data),
            actor.getGameMode() !== EGameMode.CREATIVE &&
                Entity.setCarriedItem(player, item.id, item.count - 1, item.data, item.extra);
    };
    Plant.prototype.growByFertilizers = function () {
        var _this = this;
        Block.registerClickFunctionForID(BlockID[this.keyword + "_plant"], function (coords, item, block, player) {
            var random = randomInt(1, 6);
            return Plant.growCustom("mystical_fertilizer", _this.stages, coords, item, block, player),
                Plant.growCustom("fertilized_essence", random < _this.stages ? random : Math.abs(block.data - random), coords, item, block, player);
        });
    };
    Plant.prototype.createBlock = function () {
        var datas = [];
        var id = this.keyword + "_plant";
        for (var i = 0; i <= this.stages; i++) {
            var condition = i <= this.stages - 1 ? "".concat(this.type, "_resources") : id;
            datas.push({
                name: condition,
                texture: [[condition, i <= this.stages - 1 ? i : 0]],
                inCreative: false,
            });
        }
        ;
        IDRegistry.genBlockID(id);
        Block.createBlock(id, datas, PLANT_BLOCKTYPE);
        Block.setBlockShape(BlockID[id], { x: 0, y: 0, z: 0 }, { x: 1, y: 0.001, z: 1 });
    };
    Plant.prototype.randomCheckToDestroyIfNeeded = function () {
        Block.registerNeighbourChangeFunction(this.keyword + "_plant", function (coords, block, changeCoords, region) {
            if (region.getBlockId(coords.x, coords.y - 1, coords.z) !==
                VanillaBlockID.farmland) {
                return region.destroyBlock(coords.x, coords.y, coords.z);
            }
        });
    };
    Plant.prototype.registerDrop = function (essence_id) {
        var _this = this;
        Block.registerDropFunction(this.keyword + "_plant", function (blockCoords, blockID, blockData) {
            var essence = Math.random() <= 0.1
                ? [ItemID["fertilized_essence"], 1, 0]
                : [0, 0, 0];
            return blockData >= _this.stages
                ? [
                    [ItemID[_this.keyword + "_seeds"], randomInt(1, 3), 0],
                    [ItemID[essence_id], 1, 0],
                    essence
                ]
                : [[ItemID[_this.keyword + "_seeds", 1, 0]]];
        });
    };
    Plant.prototype.setupGrowing = function () {
        var _this = this;
        Block.setRandomTickCallback(BlockID[this.keyword + "_plant"], function (x, y, z, id, data, region) {
            if (region.getLightLevel(x, y, z) >= 9) {
                return region.setBlock(x, y, z, id, data < _this.stages ? data + 1 : data);
            }
        });
    };
    return Plant;
}());
//EXPORT("ModItem",ModItem);
//EXPORT("ModBlock",ModBlock);
/*
EXPORT("Plant", Plant)
EXPORT("Farmland", Farmland)
EXPORT("Converter", Converter);
*/
EXPORT("Plant", Plant);
EXPORT("Seeds", Seeds);
