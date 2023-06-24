const database = require("../models");

class Services {
  constructor(nomeDoModelo) {
    this.nomeDoModelo = nomeDoModelo;
  }
  async pegaTodosOsRegristros() {
    return  await database[this.nomeDoModelo].findAll();
  }

  async pegaUmRegistro(id) {
    //
  }

  async criaRegistro(dados) {
    //
  }

  async atualizaRegistro(dadosAtualizados, id) {
    //
  }

  async apagaRegistro(id) {
    
  }
}

module.exports = Services;
