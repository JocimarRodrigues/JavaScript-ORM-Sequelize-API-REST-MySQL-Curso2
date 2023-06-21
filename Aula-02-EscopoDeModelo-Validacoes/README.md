# Escopos de Modelo

#### Para deixar a interface mais limpa, o cliente gostaria que na lista de Pessoas, por padrão, fossem exibidos somente os usuários ativos.

- Como fazer isso?

- Tu vai usar o defaultScope do Sequelize, para definir uma regra para o método findAll

- Os escopos são usados para reutilizar código, ou seja, se tem um requisito como esse, eu quero que sempre as queries select sejam exibidas com determinado where, ou determinado include. Esse escopo serve para podermos reutilizar isso.

- O escopo por definição é declarado no modelo. Então, se vamos determinar um novo escopo padrão, que ele marca inclusive como escopo padrão, defaultScope, temos que fazer isso no nosso modelo de pessoas. 

Criando o escopo no Models pessoas.js
Models/pessoas.js
```js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Pessoas = sequelize.define(
    "Pessoas",
    {
      nome: DataTypes.STRING,
      ativo: DataTypes.BOOLEAN,
      email: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      paranoid: true,
      // Aqui
      defaultScope: {
        where: { ativo: true },
      },
      // Até aqui
    }
  );
  Pessoas.associate = function (models) {
    Pessoas.hasMany(models.Turmas, {
      foreignKey: "docente_id",
    });
    Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
    });
  };
  return Pessoas;
};

```

- Com isso tu mudou o Scope padrão do teu model, apenas para exibir as Pessoas que tiverem a propriedade ativo = TRUE

# Outros Escopos

#### defaultScope
- É o scropo padrão, se tu não usar nada ele sempre vai usar o defaultScope

#### Tu pode escrever mais escopos, para sobreescrever o defaultScopes

#### Para fazer isso tu vai definir outra propriedade chamada SCOPES
- Essa propriedade te permite, escrever vários escopos.

Exemplo
Models/pessoas.js
```js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Pessoas = sequelize.define(
    "Pessoas",
    {
      nome: DataTypes.STRING,
      ativo: DataTypes.BOOLEAN,
      email: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      paranoid: true,
      defaultScope: {
        where: { ativo: true },
      },
      scopes: { // AQUI
        todos: {where: {}}, // Nome do escopo
        //etc: { constraint: valor}
      }
      //
    }
  );
  Pessoas.associate = function (models) {
    Pessoas.hasMany(models.Turmas, {
      foreignKey: "docente_id",
    });
    Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
    });
  };
  return Pessoas;
};

```

### Agora que tu criou um escopo personalizado, tu não pode esquecer de definir isso no Controller e criar a rota

#### Controller
- Para usar o escopo personalizado, tu precisa incluir o scope() no método
- Pasando para o parametro de scope('todos') o nome do ESCOPO.
```js
  static async pegaTodasAsPessoas(req, res){
    try {
      const todasAsPessoas = await database.Pessoas.scope('todos').findAll() // Aqui
      return res.status(200).json(todasAsPessoas)  
    } catch (error) {
      return res.status(500).json(error.message)
    }
  }
```

#### Lembrando que tu precisa criar uma rota para usar esse get.
Routes/pessoasRoute.js
```js
  .get('/pessoas/todos', PessoaController.pegaTodasAsPessoas)
```

# Validando dados

- - Foram percebidas algumas falhas de validação dos formulários por parte do front-end, o que resultou em dados de email inválidos no banco. É desejável que essa validação não seja responsabilidade exclusiva do front.

### Como fazer isso?

- Tu pode fazer usando o SQL usando o cmd CHECK, mas isso não é aprofundado no curso, se tu tiver que fazer isso com SQL, puro dá uma lida na documentação => https://www.w3schools.com/sql/sql_check.asp

#### Tu vai usar o validations do Sequelize, para fazer a velidação.

- Link da documentação => https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/

### Lembrar que essa validaçÕes são feitas no MODELO
- Tu vai abrir um Objeto dentro do atributo usando {}
- A primeira propriedade desse objeto tem que ser o tipo de dado, usando o type
- A segunda propriedade é o validete que tu vai abrir como um OBJETO e passar qual validação que tu quer
- Esse isEmail é uma validação padrão que tem no Sequelize
- Dessa forma tu fez uma validação, mas tem como tu melhorar isso e passar mais propriedades pro validate
Models/pessoas.js
```js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Pessoas = sequelize.define(
    "Pessoas",
    {
      nome: DataTypes.STRING,
      ativo: DataTypes.BOOLEAN,
      email: {type: DataTypes.STRING, validate: { // Aqui
        isEmail: true //
      }},
      role: DataTypes.STRING,
    },
    {
      paranoid: true,
      defaultScope: {
        where: { ativo: true },
      },
      scopes: {
        todos: {where: {}},
      }
    }
  );
  Pessoas.associate = function (models) {
    Pessoas.hasMany(models.Turmas, {
      foreignKey: "docente_id",
    });
    Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
    });
  };
  return Pessoas;
};

```

### Passando mais informações para o validate
- Para fazer isso tu vai transformar o valor da propriedade de validação que tu pegou do Sequelize em um Objeto, no caso o isEmail
- A 1 propriedade desse Objeto vai ser ARGS que vai ser o argumento da validação
- A 2 propriedade desse objeto pode ser uma msg que tu vai mandar, caso a validação dê errada.
Models/pessoas.js
```js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Pessoas = sequelize.define(
    "Pessoas",
    {
      nome: DataTypes.STRING,
      ativo: DataTypes.BOOLEAN,
      email: {type: DataTypes.STRING, validate: {
        isEmail: { // Aqui
          args: true, //
          msg: "Dado do tipo e-mail inválidos" //
        }
        //
      }},
      role: DataTypes.STRING,
    },
    {
      paranoid: true,
      defaultScope: {
        where: { ativo: true },
      },
      scopes: {
        todos: {where: {}},
      }
    }
  );
  Pessoas.associate = function (models) {
    Pessoas.hasMany(models.Turmas, {
      foreignKey: "docente_id",
    });
    Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
    });
  };
  return Pessoas;
};

```
#### Para testar isso use no postman
```
http://localhost:3000/pessoas POST
```
body 
```json
{
        "nome": "Joao ",
        "ativo": true,
        "email": "jo",
        "role": "estudante"
}
```
- Vai aparecer um validation Error e a mensagem se estiver funcionando.

##### Observações sobre Validação no Front versus Back

- Validações feitas no front-end são muito úteis para melhorar a experiência de quem utiliza a aplicação, mas não substituem a validação no back-end.
```
Validações feitas no front-end ajudam na experiência de utilização, pois evitam o envio de requisições desnecessárias (o que pode consumir a conexão do usuário), mas não garantem a integridade dos dados enviados.
```

- Validações feitas no back-end devem ser levadas em conta nos custos de hospedagem em nuvem, pois é preciso fazer a requisição para então ser validada.
```
Serviços de hospedagem em nuvem podem cobrar alguns serviços por uso, ou a cada requisição feita. Um bom motivo para fazer a primeira validação no front é evitar requisições desnecessárias também por razões de custo.
```

- As validações feitas no front-end são mais fáceis de serem burladas por pessoas mal-intencionadas.
```
É possível alterar os dados de uma requisição, entre outras formas, a partir do próprio inspetor de código do navegador. Alguém com o conhecimento necessário pode passar por cima das regras de validação.
```

- Uma vez que a API é disponibilizada para o front-end, não é possível garantir que a requisição esteja realmente sendo enviada pela aplicação, então, por segurança, ela também deve ser feita no back-end.
```
É possível utilizar ferramentas para enviar requisições para a API sem necessariamente estar no ambiente da aplicação “oficial”, por exemplo via curl.
```

## Validações personalizadas
- Tu refaz os passos acima
- Tu pode criar uma função dentro do validate e passar como parametro para ela o dado e dentro dela fazer tua lógica de validação
Models/pessoas.js
```js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const Pessoas = sequelize.define(
    "Pessoas",
    {
      nome: {
        type: DataTypes.STRING,
        validate: {
          funcaoValidadora: function (dado) { // Aqui
            if (dado.length < 3) //
              throw new Error("O campo deve ter mais de 3 caracteres"); //
          }, //
        },
      },
      ativo: DataTypes.BOOLEAN,
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            args: true,
            msg: "Dado do tipo e-mail inválidos",
          },
        },
      },
      role: DataTypes.STRING,
    },
    {
      paranoid: true,
      defaultScope: {
        where: { ativo: true },
      },
      scopes: {
        todos: { where: {} },
      },
    }
  );
  Pessoas.associate = function (models) {
    Pessoas.hasMany(models.Turmas, {
      foreignKey: "docente_id",
    });
    Pessoas.hasMany(models.Matriculas, {
      foreignKey: "estudante_id",
    });
  };
  return Pessoas;
};

```
-  Validações de dados únicos IMPORTANTE: Tu vai usar isso para garantir que não tenha um nome repetido na tabela => https://cursos.alura.com.br/course/orm-nodejs-avancando-sequelize/task/79563
