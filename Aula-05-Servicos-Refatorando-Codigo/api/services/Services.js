const database = require("../models");

class Services {
  constructor(nomeDoModelo) {
    this.nomeDoModelo = nomeDoModelo;
  }
  async pegaTodosOsRegristros() {
    return  await database[this.nomeDoModelo].findAll();
  }
}

module.exports = Services;
