LIBRARY({
  name: "AgricultureCore",
  version: 1,
  shared: true,
  api: "CoreEngine",
});

const LIB = { name: "AgricultureCore", version: 1 };

alert(`${LIB.name} of version ${LIB.version} has been initialized!`)  

function randomInt(min, max): int {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const PLANT_BLOCKTYPE = Block.createSpecialType({
  renderlayer: 3,
  translucency: 0,
  lightopacity: 0,
  destroytime: 0, 
  rendertype: 1,
  sound: "grass"
}, "crop");


Translation.addTranslation("Level: ", {en: "Level: ", ru: "Уровень: "});
Translation.addTranslation("seeds", {en: "Seeds", ru: "Семена"});