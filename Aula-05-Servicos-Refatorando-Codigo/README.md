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

# Adicionando os outros Services

### O ideal é tu criar um arquivo Services, para cada Controller e usar os métodos exclusivos dele, nesse arquivo.

#### Como fazer isso?

- 1 Cria o novo Service com o nome do Controller e Services no final, exemplo => PessoasServices.js
- 2 Tu vai IMPORTAR o SERVICES geral que tu criou q é o método que tem os Services em comum de todos os Controllers
- 3 Tu vai criar uma nova classe e usar o extends para essa classe herdar todo o conteúdo da classe Services Geral
PessoasServices.js
```js
const Services = require("./Services");

class PessoasServices extends Services {
  constructor() {
    super("Pessoas");
  }

  // Métodos específicos do controlador de Pessoas
}

module.exports = PessoasServices;

```
- 4 O super se refere ao conteúdo     this.nomeDoModelo = nomeDoModelo; da classe Services.

##### O que seria um método exclusivo?

- Um método específico apenas daquele Controller, por exemplo
```js
  static async pegaTodasAsPessoas(req, res) {
    try {
      const todasAsPessoas = await database.Pessoas.scope("todos").findAll();
      return res.status(200).json(todasAsPessoas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```
- Note que esse método é exclusivo apenas do controller pessoas, porque usa um SCOPE.

### Assim o código fica mais organizado e o Services geral vai apenas receber os métodos que são comuns em todos os controllers

Services/Services.js
```js
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

```

## Sobre o INDEX.JS do Services

- Ele serve para agrupar todos os teus Services, como nas outras pastas.
- Nele tu vai passar todos os Services que tu criou, exceto o Services.js
Services/index.js
```js
const PessoasServices = require("./PessoasServices.js");
const TurmasServices = require("./TurmasServices.js");
const NiveisServices = require("./NiveisServices.js");

module.exports = {
  PessoasServices: PessoasServices,
  TurmasServices: TurmasServices,
  NiveisServices: NiveisServices,
};

```

#### Dessa forma tu consegue organizar melhor teu código na hora da chamada, veja como vai ficar o PessoaController.js
SEM o index.js
Controller/PessoaController.js
```js
const Services = require('../services/Services.js')
const pessoasServices = new Services('Pessoas')

```


COM o index.js
Controller/PessoaController.js
```js
const { PessoasServices } = require('../services')
const pessoasServices = new PessoasServices();
```

- Note que tu não não precisa mais importar o Services geral
- E tu também não precisa mais definir qual modelo para o PessoasServices no controller, porque isso já está sendo feito lá dentro do PessoasServices.

## Herdando Serviços

- Tu pode tirar as responsabilidades do Controller e passar ela para o Services, e depois heradar elas no Controller, olhe o exemplo abaixo.

#### Sem Herdar os Serviços

PessoasServices.js
```js
  async pegaRegistrosAtivos(where = {}) {
    return database[this.nomeDoModelo].findAll({ where: { ...where } });
  }

  async pegaTodosOsRegistros(where = {}) {
    return database[this.nomeDoModelo]
      .scope("todos")
      .findAll({ where: { ...where } });
  }
```

- Olhe o Controller
PessoaController.js
```js
  static async pegaPessoasAtivas(req, res) {
    try {
      const pessoasAtivas = await pessoasServices.pegaTodosOsRegristros();
       return res.status(200).json(pessoasAtivas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaTodasAsPessoas(req, res) {
    try {
      const todasAsPessoas = await database.Pessoas.scope("todos").findAll();
      return res.status(200).json(todasAsPessoas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```

### O que você vai fazer é tirar a responsabilidade do controller de criar os métodos e jogar esses métodos para o Services, olhe como vai ficar

#### Herdando os Serviços

PessoasServices.js
```js
  async pegaRegistrosAtivos(where = {}) {
    return database[this.nomeDoModelo].findAll({ where: { ...where } });
  }

  async pegaTodosOsRegistros(where = {}) {
    return database[this.nomeDoModelo]
      .scope("todos")
      .findAll({ where: { ...where } });
  }
```

- Note a diferença que vai ficar no Controller

```js
  static async pegaPessoasAtivas(req, res) {
    try {
      const pessoasAtivas = await pessoasServices.pegaRegistrosAtivos(); // Aqui
       return res.status(200).json(pessoasAtivas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaTodasAsPessoas(req, res) {
    try {
      const todasAsPessoas = await pessoasServices.pegaTodosOsRegistros(); // Aqui
      return res.status(200).json(todasAsPessoas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```

- Note que tu tirou toda a responsabilidade de criar o método dentro do Controller e passou essa responsabilidade para o Service referente a ele, com isso tu otimiza o código e deixa mais fácil a manunteção e escabilidade dele.

### - IMPORTANTE: Note que como tu está criando os métodos no seu Services agora, tu também precisa importar os models, para ele poder funcionar, não esqueça.

- Exemplo do código completo e funcionando do PessoasServices.js
PessoasServices.js
```js
const Services = require("./Services");
const database = require('../models') // Não esquecer disso aqui. :)

class PessoasServices extends Services {
  constructor() {
    super("Pessoas");
  }

  // Métodos específicos do controlador de Pessoas

  async pegaRegistrosAtivos(where = {}) {
    return database[this.nomeDoModelo].findAll({ where: { ...where } });
  }

  async pegaTodosOsRegistros(where = {}) {
    return  database[this.nomeDoModelo]
      .scope("todos")
      .findAll({ where: { ...where } });
  }
}

module.exports = PessoasServices;

```

## Feito os passos acima, não esqueça de atualizar as rotas.
Routes/pessoasRoute.js
```js
  .get('/pessoas', PessoaController.pegaTodasAsPessoas)
  .get('/pessoas/ativas', PessoaController.pegaPessoasAtivas)
```

### Obversavções importantes sobre Services

- Os serviços podem herdar e se conectar entre si, independente das outras camadas. Por exemplo: ProdutoServices.js pode utilizar métodos das classes FornecedorServices.js e herdar métodos a partir de uma classe Services mais genérica.
```
Alternativa correta! Ao contrário do que acontece na relação entre controladores, entre os serviços não há problema em conectar as classes entre si e compartilhar seus métodos.
```

- A separação entre serviços e controladores ajuda a aplicação a ficar mais modular, fácil de se atualizar e dar manutenção.
```
Alternativa correta! A separação entre controladores e serviços, assim como serviços entre vários arquivos, pode a princípio parecer que está adicionando complexidade, mas na verdade ajuda a separar responsabilidades, localizar mais facilmente em que parte da aplicação está acontecendo cada coisa, fazer modificações necessárias (inclusive troca de banco). Os métodos de cada classe também ficam menores e mais limpos.
```

- A camada de serviços passa a ser a única com acesso aos modelos, tirando essa responsabilidade dos controladores.
```
Alternativa correta! Passamos toda a conexão com os modelos (e com o banco) para a camada de serviços, que vai ser a responsável por chamar os métodos que o Sequelize utiliza para montar as queries.
```

- É uma boa prática conectar um controlador somente ao seu próprio serviço. Por exemplo: ProdutoController.js apenas importar e utilizar métodos que venham de ProdutoServices.js.
```
Alternativa correta! Para manter a estrutura da aplicação organizada, é ideal que um controlador “conheça” somente seu próprio serviço. Por exemplo: ProdutoController.js utiliza métodos de ProdutoServices.js mas não de FornecedorServices.js.
```

- Após a separação, a responsabilidade do serviço é se conectar aos modelos através dos métodos de query do Sequelize; já os controladores recebem as chamadas das rotas, passam para os serviços as informações necessárias e fazem os tratamentos de dados nos retornos.
```
Alternativa correta! O controlador perdeu a responsabilidade de se conectar aos modelos; agora é encarregado de passar para o serviço correspondente as informações que ele precisa passar para a query (através dos parâmetros), receber o retorno e tratar os resultados.
```


