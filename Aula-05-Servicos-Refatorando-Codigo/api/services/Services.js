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

  async atualizaRegistro(dadosAtualizados, id, transacao = {}) {
    return database[this.nomeDoModelo].update(dadosAtualizados, {where: { id: Number(id)}}, transacao)
  }

  async atualizaRegistros(dadosAtualizados, where, transacao = {}) {
    return database[this.nomeDoModelo].update(dadosAtualizados, {where: {...where }}, transacao)
  }

  async apagaRegistro(id) {
    
  }
}

module.exports = Services;
