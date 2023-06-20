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

