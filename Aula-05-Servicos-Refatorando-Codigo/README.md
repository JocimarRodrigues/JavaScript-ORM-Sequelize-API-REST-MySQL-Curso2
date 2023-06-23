# Aula 05

# Serviços

### O que é?

- Quando a aplicação começa a crescer em complexidade, começam a aparecer alguns problemas. Por exemplo, os controladores começam a fazer coisas demais. Fica muito difícil refatorar, fica muito difícil fazer com que cada parte do código faça apenas uma coisa, que é o que sempre tentamos fazer, essa separação, e etc.

- Se olharmos os controladores do projeto, tanto controlador de pessoas como turmas, etc, cada um dos métodos desses controladores está recebendo requisição, recebendo os dados do corpo da requisição, etc, validando, se conectando com o banco, com a database através de algum método do sequelize, por exemplo, findAll. Está formatando os dados, passando os dados para a frente.

- É bastante coisa para um método fazer. E aí o que fazemos? O que dá para fazer agora é tentar reaproveitar um pouco de código e separar algumas dessas responsabilidades. Vamos fazer isso adicionando uma camada na aplicação que vamos chamar de camada de serviços.

-  O que essa camada vai fazer? Se olharmos de novo qualquer um dos nossos controladores, tanto de turma, pessoas, tanto faz, dá para ver que eles têm todos alguns métodos em comum, ou seja, métodos que todos eles usam. Como o findAll, o findOne, create. São esses métodos que o sequelize usa para transformar tudo que escrevemos em JavaScript para query, e passar isso para o SQL.

- É essa a responsabilidade de conectar com a database e processar esses dados que vai receber, enviar, etc, que vamos tirar dos controladores e passar para a nova camada, que vai ficar entre o controlador e o modelo, digamos assim.

### Como Fazer

- 1 Cria a pasta dentro do projeto, com o nome services, dentro da pasta cria um Arquivo chamado Services.js
- 2 Esse arquivo é quem vai fazer a interface para lidar com os modelos, por isso tu precisa importar os modelos.
- 3 Dentro desse arquivo tu vai criar uma classe e um constructor, esse constructor é para tu instanciar os métodos do controller que vai usar
- 4 Feito isso tu vai criar novos métodos que vão ser os métodos para tu usar as funções agregadoras do Sequelize

Exemplo
Services/Services.js
```js
const database = require("../models"); // Importando os modelos

class Services { // Constructor para pegar os métodos; poder instanciar novas classes
  constructor(nomeDoModelo) {
    this.nomeDoModelo = nomeDoModelo;
  }
  async pegaTodosOsRegristros() { // Métodos que tu vai usar para refatorar
    return database[this.nomeDoModelo].findAll();
  }
}

module.exports = Services;

```

### Feito o Services, tu pode ir no Controller e refatorar ele dessa forma
#### Método SEM O SERVICES
Controller/PessoaController.js
```js
const database = require("../models");
const Sequelize = require("sequelize");

class PessoaController {
  static async pegaPessoasAtivas(req, res) {
    try {
      const pessoasAtivas = await database.Pessoas.findAll();
      return res.status(200).json(pessoasAtivas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}
```
#### Método COM O SERVICES
```js
const Services = require("../services/Services.js");
const pessoasServices = new Services("Pessoas");


class PessoaController {
  static async pegaPessoasAtivas(req, res) {
    try {
       const pessoasAtivas = await pessoasServices.pegaTodosOsRegristros();
      return res.status(200).json(pessoasAtivas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}
```

- Note que com os Services tu tira do controller a responsabilidade de lidar com os DB
- Tu precisa importar os Services
- Criar uma nova Instancia de Services e definir o MODEL que tu vai usar, no caso o Model PESSOAS
- Aí em vez de tu utilizar o findAll aqui, tu usa ele dentro de Services e aqui tu só chama o método que tu criou lá, que no caso é pegaTodosOsRegritos
- Assim o código fica mais limpo, e tu coloca menos responsabilidades para o Controller
