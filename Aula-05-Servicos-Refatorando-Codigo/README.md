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

# Passando Parametros

- Vamos ver, por exemplo, como ficaria essa refatoração do controlador para o serviço no método cancelaPessoa, que foi o último método que criamos dentro de pessoaController. Por que justamente esse? Porque além dele estar chamando update em duas tabelas diferentes, ainda envolvemos tudo com uma transação, então como vamos fazer para tirar isso tudo do controlador e passar para um serviço mais genérico, digamos assim?


- Primeiro tu cria esse Service
Services/Services.js
```js
  async atualizaRegistro(dadosAtualizados, id, transacao = {}) {
    return database[this.nomeDoModelo].update(dadosAtualizados, {where: { id: Number(id)}}, transacao)
  }
```

- Vamos então escrever esse método. Ele vai retornar database[this.nomeDoModelo]update. O que é update, o método update do sequelize recebe? Primeiro parâmetro que ele recebe é dadosAtualizados. O segundo é onde, no caso é o id, então aqui passamos como um where, abro um objeto where e o valor dele vai ser id:id. E além disso vou passar para atualizaRegistro um parâmetro que vai ser transação, iniciando com um objeto vazio, e dentro de update vou passar como terceiro parâmetro transação.

- O que vai acontecer aqui? Vamos conseguir usar atualizaRegistro com ou sem transação, porque se não tiver nenhuma transação o sequelize não vai passar isso para frente e se tiver ele vai passar com as informações que ele vai receber do call-back de sequelize.transaction.

#### Método um pouco mais específico que recebe um where

- Além desse método atualizaRegistro que atualiza um registro baseado no id, vamos precisar também de um um pouco mais específico, que receba um where e aí faça alteração de todas as linhas onde where se aplica. Vou copiar o método atualizaRegistro e vou colar embaixo, que o outro vai ser bem parecido, vou chamar de atualizaRegistros, porque ao invés de um id único ele vai receber um where. Então vou passar o where como parâmetro.

Services/Services.js
```js
  async atualizaRegistros(dadosAtualizados, where, transacao = {}) {
    return database[this.nomeDoModelo].update(dadosAtualizados, {where: {...where }}, transacao)
  }
```

- A única alteração que vamos fazer no update é que ao invés do where receber um id:id ele vai receber um spread de where. Como vamos usar esse método? Vamos passar como parâmetro do where o objeto onde ele vai montar as condições do where onde ele vai procurar os registros nas tabelas e fazer as atualizações.

### REspeitando as boas práticas o Ideal agora é tu ir em Pessoas Services e criar o Service referente ao Controller

## Lembrando que como tu vai usar Dois Modelos no Services, tu precisa importar o OUTRO modelo também no Service de Pessoas.
Services/PessoasServices.js
```js
const Services = require("./Services");
const database = require('../models')

class PessoasServices extends Services {
  constructor() {
    super("Pessoas")
    this.matriculas = new Services('Matriculas') // Aqui
  }
}
```
- Essa é a forma que tu faz para usar dois Modelos em um mesmo Service

### Feito isso tu pode escrever o método agora no Services de Pessoas, usando os dois modelos
Services/PessoasServices.js
```js
  async cancelaPessoaEMatriculas(estudanteId) {
    return database.sequelize.transaction(async (transacao) => {
      await super.atualizaRegistro({ ativo: false }, estudanteId, {
        transaction: transacao,
      });
      await this.matriculas.atualizaRegistros(
        { status: "cancelado" },
        { estudante_id: estudanteId },
        { transaction: transacao }
      );
    });
  }
```
- Note que tu está usando os métodos Gerais que tu criou lá no Services.js

#### Explicando sobre o que está acontecendo
- A primeira coisa é fazer a atualização na tabela de pessoas, então await super.atualizaRegistro, e os parâmetros que vamos passar são parecidos com os que já estão sendo passados no controlador.

- O primeiro é o que vai ser alterado, que é ativo um objeto contendo ativo false. O segundo é onde vai ser alterado, que podemos passar só como estudanteId, e o terceiro é um objeto contendo transaction: transacao, que é como estamos avisando no controlador que esse update faz parte de uma transação, ele está envolvido, está dentro de uma transação e faz parte de uma operação só.

- Já atualizamos na tabela pessoas, para atualizar em seguida na tabela matrículas await this.matriculas, que é como estamos recebendo matrículas lá no construtor, e atualizaRegistros.

- Novamente, os parâmetros de atualizaRegistros vão ser parecidos com o que já estamos usando no controlador atualmente, que primeiro é o que vai ser alterado, status cancelado. Where, só que não precisamos escrever where e dentro do where passar. Podemos passar só o objeto estudante_id, que é o nome da coluna, igual a estudanteId, que estamos recebendo por parâmetro.

- Nós vamos montar o where dentro de atualizaRegistros só passando o conteúdo dele. Não precisamos escrever where, só precisamos escrever o que vai dentro dele.

- O terceiro parâmetro é também avisar que tem uma transação rolando aqui com transaction:transacao. Nosso método está criado, faltou só fechar os parênteses do meu método. E agora refatorar o controlador, o método cancelaPessoa no controlador de pessoas passando o que acabamos de criar dentro de serviços. Substituindo todos esses updates pelo que acabamos de fazer.

#### O código acima é o mesmo que este, mas REFATORADO.
Controller/PessoaController.js
```js
  static async cancelaPessoa(req, res) {
    const { estudanteId } = req.params;
    try {
      database.sequelize.transaction(async (transacao) => {
        
        await database.Pessoas.update(
          { ativo: false },
          { where: { id: Number(estudanteId) } },
          {transaction: transacao}
        );
        await database.Matriculas.update(
          { status: "cancelado" },
          { where: { estudante_id: Number(estudanteId) } },
          {transaction: transacao}
        );
        return res
          .status(200)
          .json({
            message: `Matriculas referente estudante ${estudanteId} canceladas!`,
          });
      } )
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```

## Refatorando Controller
Controller/PessoaController.js

```js
  static async cancelaPessoa(req, res) {
    const { estudanteId } = req.params;
    try {
      await pessoasServices.cancelaPessoaEMatriculas(Number(estudanteId));
      return res.status(200).json({
        message: `Matriculas referente estudante ${estudanteId} canceladas!`,
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```

- Note que com isso tu tirou a responsabilidade de lidar com os Modelos do Controller
- O Código ficou menor e mais fácil de fazer manutenção
- Dá para ver inclusive que tanto o método no controlador quanto no serviço estão mais claros, é mais rápido de entender, de visualizar o que tecendo em cada um deles, ficou tudo mais separado. É isso sempre que temos que buscar quando fazemos esse tipo de refatoração e quando fazemos a separação entre serviços, controladores, separar entre arquivos, etc.

# Services Geral completo
Services/Services.js
```js
const database = require('../models')

class Services {
  constructor(nomeDoModelo) {
    this.nomeDoModelo = nomeDoModelo
  }

  async pegaTodosOsRegistros(where = {}) {
    return database[this.nomeDoModelo].findAll({ where: { ...where } })
  }

  async pegaUmRegistro(where = {}) {
    return database[this.nomeDoModelo].findOne({ where: { ...where } })
  }

  async criaRegistro(dados) {
    return database[this.nomeDoModelo].create(dados)
  }

  async atualizaRegistro(dadosAtualizados, id, transacao = {}){
    return database[this.nomeDoModelo]
      .update(dadosAtualizados, { where: { id: id } }, transacao)
  }

  async atualizaRegistros(dadosAtualizados, where, transacao = {}){
    return database[this.nomeDoModelo]
      .update(dadosAtualizados, { where: { ...where } }, transacao)
  }

  async apagaRegistro(id) {
    return database[this.nomeDoModelo].destroy({ where: { id: id } })
  }

  async restauraRegistro(id) {
    return database[this.nomeDoModelo].restore({ where: { id: id } })
  }

  async consultaRegistroApagado(id) {
    return database[this.nomeDoModelo]
      .findOne({ paranoid: false, where: { id: Number(id) } })
  }

  async encontraEContaRegistros(where = {}, agregadores) {
    return database[this.nomeDoModelo]
      .findAndCountAll({ where: { ...where }, ...agregadores })
  }

}

module.exports = Services
```

# Refatorando os Outros Services e Controllers

### Pessoas
- Controller SEM todos os Services
Controller/PessoaController.js
```js
const { PessoasServices } = require("../services");
const pessoasServices = new PessoasServices();

const database = require("../models");
const Sequelize = require("sequelize");

class PessoaController {
  static async pegaPessoasAtivas(req, res) {
    try {
      const pessoasAtivas = await pessoasServices.pegaRegistrosAtivos();
      return res.status(200).json(pessoasAtivas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaTodasAsPessoas(req, res) {
    try {
      const todasAsPessoas = await pessoasServices.pegaTodosOsRegistros();
      return res.status(200).json(todasAsPessoas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaUmaPessoa(req, res) {
    const { id } = req.params;
    try {
      const umaPessoa = await database.Pessoas.findOne({
        where: {
          id: Number(id),
        },
      });
      return res.status(200).json(umaPessoa);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async criaPessoa(req, res) {
    const novaPessoa = req.body;
    try {
      const novaPessoaCriada = await database.Pessoas.create(novaPessoa);
      return res.status(200).json(novaPessoaCriada);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async atualizaPessoa(req, res) {
    const { id } = req.params;
    const novasInfos = req.body;
    try {
      await database.Pessoas.update(novasInfos, { where: { id: Number(id) } });
      const pessoaAtualizada = await database.Pessoas.findOne({
        where: { id: Number(id) },
      });
      return res.status(200).json(pessoaAtualizada);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async apagaPessoa(req, res) {
    const { id } = req.params;
    try {
      await database.Pessoas.destroy({ where: { id: Number(id) } });
      return res.status(200).json({ mensagem: `id ${id} deletado` });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async restauraPessoa(req, res) {
    const { id } = req.params;
    try {
      await database.Pessoas.restore({ where: { id: Number(id) } });
      return res.status(200).json({ mensagem: `id ${id} restaurado` });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaUmaMatricula(req, res) {
    const { estudanteId, matriculaId } = req.params;
    try {
      const umaMatricula = await database.Matriculas.findOne({
        where: {
          id: Number(matriculaId),
          estudante_id: Number(estudanteId),
        },
      });
      return res.status(200).json(umaMatricula);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async criaMatricula(req, res) {
    const { estudanteId } = req.params;
    const novaMatricula = { ...req.body, estudante_id: Number(estudanteId) };
    try {
      const novaMatriculaCriada = await database.Matriculas.create(
        novaMatricula
      );
      return res.status(200).json(novaMatriculaCriada);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async atualizaMatricula(req, res) {
    const { estudanteId, matriculaId } = req.params;
    const novasInfos = req.body;
    try {
      await database.Matriculas.update(novasInfos, {
        where: {
          id: Number(matriculaId),
          estudante_id: Number(estudanteId),
        },
      });
      const MatriculaAtualizada = await database.Matriculas.findOne({
        where: { id: Number(matriculaId) },
      });
      return res.status(200).json(MatriculaAtualizada);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async apagaMatricula(req, res) {
    const { matriculaId } = req.params;
    try {
      await database.Matriculas.destroy({ where: { id: Number(matriculaId) } });
      return res.status(200).json({ mensagem: `id ${matriculaId} deletado` });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaMatriculas(req, res) {
    const { estudanteId } = req.params;
    try {
      const pessoa = await database.Pessoas.findOne({
        where: { id: Number(estudanteId) },
      });
      const matriculas = await pessoa.getAulasMatriculadas();
      return res.status(200).json(matriculas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaMatriculasPorTurma(req, res) {
    const { turmaId } = req.params;
    try {
      const todasAsMatriculas = await database.Matriculas.findAndCountAll({
        where: {
          turma_id: Number(turmaId),
          status: "confirmado",
        },
        limit: 20,
        order: [["estudante_id", "ASC"]],
      });
      return res.status(200).json(todasAsMatriculas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async pegaTurmasLotadas(req, res) {
    const lotacaoTurma = 2;
    try {
      const turmasLotadas = await database.Matriculas.findAndCountAll({
        where: {
          status: "confirmado",
        },
        attributes: ["turma_id"],
        group: ["turma_id"],
        having: Sequelize.literal(`COUNT(turma_id) >= ${lotacaoTurma}`),
      });
      return res.status(200).json(turmasLotadas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  static async cancelaPessoa(req, res) {
    const { estudanteId } = req.params;
    try {
      await pessoasServices.cancelaPessoaEMatriculas(Number(estudanteId));
      return res.status(200).json({
        message: `Matriculas referente estudante ${estudanteId} canceladas!`,
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}

module.exports = PessoaController;

```

Controller usando TODOS os Servicoes
Controller/PessoaController.js
```js
const { PessoasServices } = require('../services')
const pessoasServices = new PessoasServices()

class PessoaController {
  static async pegaPessoasAtivas(req, res){  
    try {
      const pessoasAtivas = await pessoasServices.pegaRegistrosAtivos()
      return res.status(200).json(pessoasAtivas)  
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async pegaTodasAsPessoas(req, res){  
    try {
      const todasAsPessoas = await pessoasServices.pegaTodosOsRegistros()
      return res.status(200).json(todasAsPessoas)  
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async pegaPessoa(req, res) {  
    const { id } = req.params
    try {
      const pessoa = await pessoasServices.pegaUmRegistro({ id })
      return res.status(200).json(pessoa)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async criaPessoa(req, res) {  
    const novaPessoa = req.body
    try {
      const novaPessoaCriada = await pessoasServices.criaRegistro(novaPessoa)
      return res.status(200).json(novaPessoaCriada)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async atualizaPessoa(req, res) {  
    const { id } = req.params
    const novasInfos = req.body
    try {
      await pessoasServices.atualizaRegistro(novasInfos, Number(id))
      return res.status(200).json({ mensagem: `id ${id} atualizado` })
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async apagaPessoa(req, res) {  
    const { id } = req.params
    try {
      await pessoasServices.apagaRegistro(Number(id))
      return res.status(200).json({ mensagem: `id ${id} deletado` })
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async restauraPessoa(req, res) {  
    const { id } = req.params
    try {
      const registroRestaurado = await pessoasServices
        .restauraRegistro(Number(id))
      return res.status(200).json(registroRestaurado)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async pegaMatriculas(req, res) {  
    const { estudanteId } = req.params
    try {
      const matriculas = await pessoasServices
        .pegaMatriculasPorEstudante({ id: Number(estudanteId) })
      return res.status(200).json(matriculas)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async cancelaPessoa(req, res) {  
    const { estudanteId } = req.params
    try {
      await pessoasServices.cancelaPessoaEMatriculas(Number(estudanteId))
      return res
        .status(200)
        .json({message: `matrículas ref. estudante ${estudanteId} canceladas`}) 
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }
}

module.exports = PessoaController
```

### Matriculas
MatriculasController.js
```js
const Sequelize = require('sequelize')
const { MatriculasServices } = require('../services')
const matriculasServices = new MatriculasServices()

class MatriculaController {
  static async pegaUmaMatricula(req, res) { 
    const { estudanteId, matriculaId } = req.params
    try {
      const umaMatricula = await matriculasServices
        .pegaUmRegistro({id: matriculaId, estudante_id: estudanteId})
      return res.status(200).json(umaMatricula)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async criaMatricula(req, res) {  
    const { estudanteId } = req.params
    const novaMatricula = { ...req.body, estudante_id: Number(estudanteId) }
    try {
      const novaMatriculaCriada = await matriculasServices
        .criaRegistro(novaMatricula)
      return res.status(200).json(novaMatriculaCriada)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async atualizaMatricula(req, res) {  
    const { estudanteId, matriculaId } = req.params
    const novasInfos = req.body
    try {
      await matriculasServices
        .atualizaRegistros(novasInfos, 
          { id: Number(matriculaId), estudante_id: Number(estudanteId) })
      return res.status(200).json({ mensagem: `id ${matriculaId} atualizado` })
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async apagaMatricula(req, res) {  
    const { matriculaId } = req.params
    try {
      await matriculasServices.apagaRegistro(Number(matriculaId))
      return res.status(200).json({ mensagem: `id ${matriculaId} deletado` })

    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async restauraMatricula(req, res) {  
    const { matriculaId } = req.params
    try {
      await matriculasServices
        .restauraRegistro(Number(matriculaId))
      return res.status(200).json({ mensagem: `id ${matriculaId} restaurado`})
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async pegaMatriculasPorTurma(req, res) {   
    const { turmaId } = req.params
    try {
      const todasAsMatriculas = await matriculasServices
        .encontraEContaRegistros(
          { turma_id: Number(turmaId), status: 'confirmado' },
          { limit: 20, order: [['estudante_id', 'DESC']] })
      return res.status(200).json(todasAsMatriculas)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }

  static async pegaTurmasLotadas(req, res) {  
    const lotacaoTurma = 2
    try {
      const turmasLotadas = await matriculasServices
        .encontraEContaRegistros({ status: 'confirmado' },
          { 
            attributes: ['turma_id'],
            group: ['turma_id'],
            having: Sequelize.literal(`count(turma_id) >= ${lotacaoTurma}`)
          })
      return res.status(200).json(turmasLotadas.count)
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }
}

module.exports = MatriculaController
```

## Você refez os passos acima, com os outros Controllers e Services, para ter uma visão melhor das mudanças feitas analise o código da aula 05 com a aula 04 para entender as diferenças, qualquer dúvida a mais acesse a aula => https://cursos.alura.com.br/course/orm-nodejs-avancando-sequelize/task/79557

- Essa é a aula referente as mudanças e refatorações que você fez usando os Services.

# Boas Práticas

### A ideia é que um Controller não se conecte com o Modelo, faça apenas o controle, quem deve se conectar com o Modelo é o Service referente ao Controller.

### Também Não é ideal um Crontoller lidar com mais de um Serviço, o ideal é um controlador lidar apenas com o Seu serviço, EX o Controlador de Pessoas só ter contato com o PessoasServices.js
