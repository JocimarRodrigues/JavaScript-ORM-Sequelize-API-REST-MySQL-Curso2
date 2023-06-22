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

### Para saber mais Mixins =: 