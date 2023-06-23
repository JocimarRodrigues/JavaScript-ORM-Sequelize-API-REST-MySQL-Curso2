# Escopos de Assosiação

- É importante poder consultar todas as matrículas confirmadas referentes a estudante X de forma rápida.

### Como fazer isso?

#### Tu pode fazer isso usando as formas que tu usou anteriormente por exemplo
- Cria um novo método no Controller
Controllers/PessoaController.js
```js
  static async pegaMatriculas(req, res) {
    const { estudanteId } = req.params
    try {
      const matriculas = await database.Matriculas.findAll({ where: { estudante_id: Number(estudanteId) }})
      return res.status(200).json(matriculas)

    } catch (error) {
      return res.status(500).json(error.message)
    }
  }
```

- O que é esse estudante_id ? Esse estudante_id é a chave estrangeira que liga a tabela MATRICULAS com a tabela Pessoas

#### Mas tem uma forma melhor de fazer isso, usando os ESCOPOS de assosiação

## Escopos de Assosiação

- No modelo pessoas temos duas associações que já deixamos feitas, já trouxemos feitas do curso anterior. Tem pessoas.hasMany, que é uma associação de um para muitos de pessoas para turmas. E pessoas.hasMany, que é uma associação de pessoas com matrículas.

- Por enquanto está dessa forma. A associação da tabela pessoas no modelo pessoas com turmas é a partir da coluna docente_id, e de pessoas com matrículas é através da coluna estudante_id, que foi a coluna que vimos no diagrama de banco.

- Podemos a partir daí passar uma instrução nessa parte falando que já que esses dois modelos estão associados, conseguimos fazer eles se cruzarem? Por exemplo, uma função do tipo cruzar matrículas com pessoas, etc? Sim, conseguimos. Para fazer isso que servem justamente os escopos de associação.

- a documentação do Sequelize ele tem a parte de escopo de associação, é similar ao que fazemos anteriormente no escopo de modelo, só que aqui ao invés de definirmos o escopo dentro do próprio modelo, como fizemos anteriormente, se voltarmos um pouco no código, dentro do método define, que é o método onde definimos o modelo, passamos o nome dele e em seguida um objeto com os atributos, é dentro aqui desses parâmetros que passamos o escopo de modelo.

- Vamos escrever para entender melhor o que está acontecendo. O que queremos associar é uma associação de pessoas com matrículas. Logo depois que escrevo foreignKey: estudante_id vou adicionar mais duas propriedades nesse objeto.

-  primeira propriedade vai ser scope, de escopo mesmo, o valor dela é um objeto. Dentro desse objeto vou passar justamente o escopo. Qual é o escopo dessa associação que quero fazer? É status confirmado.

- Status é uma coluna da tabela matrículas e ele recebe confirmado ou cancelado. Como queremos nesse caso só filtrar os registros que tiverem status confirmado, passamos ele no escopo, e vamos passar outra propriedade, que é as, e ela vai ter um valor que vou passar como string que é o nome que quero dar para esse escopo também.

- O que acabamos de fazer é adicionar um escopo de associação passando duas informações. A primeira é o escopo que queremos trabalhar, que na verdade é a condição que vai ser passada no where quando o sequelize montar o array para nós, e em segundo o nome que queremos usar. E vamos usar esse nome para chamar esses tais métodos automáticos que fiquei me perguntando se o sequelize tem.

#### Exemplo
Models/pessoas.js
```js
  Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
      scope: { status: "confirmado" },
      as: "aulasMatriculadas",
    });
```

- Vamos usar alguns desses métodos que ele cria para nós. Os nomes desses métodos são mixins.

- Se estiver com dúvidas a aula sobre isso é => https://cursos.alura.com.br/course/orm-nodejs-avancando-sequelize/task/79543

- Documentação Escopos de assosiação Sequelize => https://sequelize.org/docs/v6/advanced-association-concepts/association-scopes/

## Usando Mixins

- Resumindo o que tu vai fazer é pegar todas as matriculas de um estudante pelo ID dele.
- Tu vai fazer isso no Controller
Controllers/PessoaController.js
```js
  static async pegaMatriculas(req, res) {
    const { estudanteId } = req.params
    try {
      const pessoa = await database.Pessoas.findOne( { where: {id: Number(estudanteId)}})
      const matriculas = await pessoa.getAulasMatriculadas()
      return res.status(200).json(matriculas)

    } catch (error) {
      return res.status(500).json(error.message)
    }
  }
```
- Da onde está vindo esse getAulasMatriculadas? Esse get é aquela função que tu criou no scope de assosiação do model com o AS

#### Após os passos acima, crie a rota
Routes/pessoasRoute.js
```js
  .get('/pessoas/:estudanteId/matricula', PessoaController.pegaMatriculas)
```
- Lembrando que para o mixin funcionar tu precisa criar o escopo de assosiação que é o que tu fez anteriormente

Exemplo 
Models/pessoas.js
```js
 Pessoas.associate = function (models) {
    Pessoas.hasMany(models.Turmas, {
      foreignKey: "docente_id",
    });
    Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
      scope: { status: "confirmado" }, // Aqui
      as: "aulasMatriculadas", // Aqui
    });
  };
```

#### Os Escopos não são obrigatórios para usar os Mixins, por exemplo se tu for na assosiação do Model Pessoas e remover o scope, o mixin ainda vai funcionar, mas ele vai mostrar TODAS as matrículas do estudante e não apenas as que estão com os status CONFIRMADO.

### Se tiver dúvidas sobre o mixin dê uma lida na documentação => https://sequelize.org/docs/v6/core-concepts/assocs/

### Para saber mais Mixins => https://cursos.alura.com.br/course/orm-nodejs-avancando-sequelize/task/79567

# Usando Operadores

- Resolvendo o Problema => O cliente gostaria de poder consultar as turmas abertas por intervalo de data, para não receber informações desnecessárias (como turmas antigas).

- 

### Como tu vai resolver isso lógica?

- Relembrando o SQL tu pode usar Query Strings para fazer isso
- Mas o que são query Strings?
- São Querys personalizadas que tu vai passar um parametro para filtrar a busca, dê uma relembrada no SQL
- Exemplo de uma Query String => localhost:3000/turmas?data_inicial-2020-01-01&data_final=2020-03-01

- no curso e no ORM tu vai resolver o problema usando operadores para fazer essa query string!
- Documentação sobre Operadores do MYSQL => https://dev.mysql.com/doc/refman/8.0/en/non-typed-operators.html
- Documentação sobre Operadores do Sequelize => https://sequelize.org/docs/v6/core-concepts/model-querying-basics/


### Resolvendo no código

- O Op do Sequelize precisa ser importado
TurmaController.js
```js
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

 ```
- Tu vai fazer essa lógica no Controller

#### Criando a query string e os operadores do Sequelize

TurmaController.js
```js
  static async pegaTodasAsTurmas(req, res){
    const {data_inicial, data_final} = req.query // Pegando os valores da query String = os valores que vem dps do ?
      const where = {} // Ele começa como vazio
      data_inicial || data_final ? where.data_inicio = {} : null // Se a data Inicial existir, o where recebe  valor da data inicial
      data_inicial ? where.data_inicio[Op.gte] = data_inicial : null // Se a Data Inicial for maior que a data final, o where vai receber a data inicial
      data_final ? where.data_inicio[Op.lte] = data_final : null // Se a Data final for maior que a data inicial, o where recebe a data final
    try {

      const todasAsTurmas = await database.Turmas.findAll({ where }) // Como parametro para o where tu está passando o where que é o filto que está recebendo a lógica acima
      return res.status(200).json(todasAsTurmas) 
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }
```
- Importante => Prestar atenção que data_inicio se refere ao valor da COLUNA no MODEL
- NÃO confundir con o data_inicial que é o valor que tu pega como PARAMETRO DA QUERY STRING
- NOTE que a lógica que você tá usando, tu está ATRIBUINDO os valores que tu pegou NA QUERY STRING, nas COLUNAS da TABELA com o WHERE, assim permitindo que tu faça uma busca PERSONALIZADA.
- Da forma que tu criou o método acima, tu fez uma lógica usando operadores e ifs ternários para filtrar a busca
- Lembrando que tu usou os Operadores do Sequelize para fazer a lógica
- Tem que lembrar que tu precisa abrir os {} no find all e passar o parametro
- Da forma como tu criou o método, ele sempre vai retornar um valor, mesmo que seja nulo.

#### Para testar o código acima no PostMan use:
```
http://localhost:3000/turmas?data_inicial=2020-01-01&data_final=2020-03-01
```
- Com isso tu passou os valores para a  Query String, permitindo assim uma busca personalizada.

# Funções Agregadoras

- Ok O cliente gostaria de poder consultar as turmas abertas por intervalo de data, para não receber informações desnecessárias (como turmas antigas).

- São os Finders do Sequelize, Documentação => https://sequelize.org/docs/v6/core-concepts/model-querying-finders/

### Como resolver?

- Tu pode usar o método findAll e passar um where e deixar o front fazer essa busca, mas não é uma boa prática
- Por isso tu vai usar o método findAndCountAll
Exemplo
PessoaController.js
```js
  static async pegaMatriculasPorTurma(req, res) {
    const { turmaId } = req.params;
    try {
      const todasAsMatriculas = await database.Matriculas.findAndCountAll({
        where: {
          turma_id: Number(turmaId),
          status: "confirmado",
        },
      });
      return res.status(200).json(todasAsMatriculas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```
- Note que tu criou um where dentro do findAndCountAll e criou um where com o nome da coluna da tabela, e o nome do valor q tu está recebendo do params
- Mas eu poderia fazer isso usando um where fora por q fazer dessa forma?
- Porque esse método além de fazer a busca vai te retornar um OBJETO com um valour de COUNTS = quantidade de resultados da busca
- E vai retornar ROWS que vai ser um objeto com a quantidade de dados filtrados

#### Por isso tu também pode adicionar outros parametros para a busca dentro desse méotodo como o limit
- O limit determina a quantidade de limite que pode ser trazido por vez do banco, isso melhora a perfomance

- Tu também por Ordenar os resultados com o ASC para resultados por ordem Ascdente e DESC para ordenar por ordem Descendente

PessoaController.js
```js
  static async pegaMatriculasPorTurma(req, res) {
    const { turmaId } = req.params;
    try {
      const todasAsMatriculas = await database.Matriculas.findAndCountAll({
        where: {
          turma_id: Number(turmaId),
          status: "confirmado",
        },
        limit: 20,
        order: [['estudante_id', 'ASC']]
      });
      return res.status(200).json(todasAsMatriculas);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```
- Com o exemplo acima, tu definiu um limite de 20 resultados em ordem Ascendente

#### IMPORTANTE

- TU usar limit não vai diminuir a quantidade de COUNTS, ele vai buscar em TODOS OS ITEMS, mas só vai retornar o valor do LIMIT. Por exemplo em uma lista de 500 resultados, ele vai buscar em TODOS OS 500, mas vai retornar apenas os primeiros 20, assim melhorando a perfomance.


#### Cria a rota
pessoasRoute.js
```js
  .get('/pessoas/matricula/:turmaId/confirmados', PessoaController.pegaMatriculasPorTurma)
```

## Outros agregadores

- Você já criou o método para pegar todas as matriculas por turma, agora tu precisa criar um método para exibir só as turmas que estão lotadas, para isso tu vai usar outro método

- Tu vai usar o GROUPING para fazer isso, documentação Sequelize => https://sequelize.org/docs/v6/core-concepts/model-querying-basics/

- Tu vai precisar usar SQL puro para fazer esse filtro

### Sequelize Literal
- É a forma que tu escreve SQL puro no Sequelize
- Lembrar que tu precisa importar isso no começo do Controller
```js
const Sequelize = require('sequelize')
```

Exemplo
PessoasController.js
```js
  static async pegaTurmasLotadas(req, res) {
    const lotacaoTurma = 2 // Tu criou a variável para definir o limite para a turma estar lotada
    try {
      const turmasLotadas = await database.Matriculas.findAndCountAll({
        where: { // Usou um where para pegar apenas as turmas com status confirmado
          status: 'confirmado'
        },
        attributes: ['turma_id'], // Definiu a coluna que tu quer filtrar
        group: ['turma_id'], // Agrupa todas as turmas que tem o mesmo valor de turma_id
        having: Sequelize.literal(`COUNT(turma_id) >= ${lotacaoTurma}`) // Usando SQL puro para fazer o filtro
      })
      return res.status(200).json(turmasLotadas.count)
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```

#### Group

- O group é necessário para especificar qual coluna ou conjunto de colunas deve ser usado para agrupar os resultados da consulta. Nesse caso, o código está agrupando os resultados pela coluna turma_id, ou seja, todas as matrículas que possuem o mesmo valor de turma_id serão agrupadas juntas.

#### Having

- é utilizada com a função COUNT(turma_id) >= ${lotacaoTurma} para filtrar os grupos que possuem uma contagem de turma_id maior ou igual ao valor definido em lotacaoTurma (2, no exemplo).

### Feito os passos acima, basta criar a rota
pessoasRoute.js
```js
  .get('/pessoas/matricula/lotada', PessoaController.pegaTurmasLotadas)
```

#### Por que tu não passou parametros para essa rota?

- Como o filtro que tu está fazendo é direto no SQl, dentro do Controller, tu não precisa passar parametros
- Resumindo, como tu está passando o lotacaoTurma = 2 q é o responsável por fazer o filtro, é desnecessário tu receber um parametro do front