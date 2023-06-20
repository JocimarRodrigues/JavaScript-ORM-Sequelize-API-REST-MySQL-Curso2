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
