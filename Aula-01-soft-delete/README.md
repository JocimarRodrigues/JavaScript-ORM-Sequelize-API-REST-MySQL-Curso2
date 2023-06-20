# Iniciando Projeto

- Tu fez o clone do rep e usou o cmd npx sequelize-cli db:migrate para criar as tabelas
- Tu usou o cmd npx sequelize-cli db:seed:all para rodar os seeders e popular as tabelas

### comando npm outdated
- Serve para tu saber as versoes dos pacotes que estão desatualizadas
- Para atualizar, basta tu ir no Package.json e substituir por uma versão mais nova.

### Comando npm update
- Vai atualizar todos os pacotes que tu alterou no package.json
- Tu pode utilizar o npm i também


# Soft Delete, ocultando sem deletar

- O cliente não gostaria que registros importantes do sistema, como as Pessoas, sejam apagados definitivamente do banco de dados.

- Para fazer isso tu vai usar a soft delete ou exclusão suave, no Sequelize essa função é chamda de Paranoid

- Essa opção é colocada nos MODELS

Exemplo
Models/matriculas.js
```js
'use strict'
module.exports = (sequelize, DataTypes) => {
  const Matriculas = sequelize.define('Matriculas', {
    status: DataTypes.STRING
  }, { paranoid: true }) // Aqui
  Matriculas.associate = function(models) {
    Matriculas.belongsTo(models.Pessoas, {
      foreignKey: 'estudante_id'
    })
    Matriculas.belongsTo(models.Turmas, {
      foreignKey: 'turma_id'
    })

  }
  return Matriculas
}
```

- Na documentação o primeiro {} do objeto se refere aos atributos e o 2 {} se refere aonde tu vai usar o Paranoid.

### E como o paranoid funciona?

- A documentação diz que essa opção, vou descer um pouco nas informações que tem na documentação, quando usamos paranoid true, ao invés de deletar, de usar a palavra-chave delete quando o sequelize monta a query de SQL, vai usar um update. Não é mais delete, vamos continuar usando o método sequelize destroy, porém o que vai ser feito na query? Vai ser feito um update e aí o que vai acontecer?

- A query vai adicionar um timestamp numa coluna que chama deletedAt. Deletado em. Não temos uma coluna, se voltarmos no terminal do MYSQL, deletedAt, que ele precisa para fazer o paranoid funcionar. Temos que criar essa coluna para conseguir implementar o soft delete, porque da próxima vez que usarmos o destroyvai ser feito um update, colocado um timestamp no registro nessa coluna e o sequelize vai puxar como registro ativo só o que não tiver nenhum timestamp nessa coluna. Vamos ver isso um pouco mais para frente.

- Mas primeiro precisamos adicionar essa coluna deletedAt em todas as nossas tabelas. Já usamos o sequelize para adicionar colunas através dos arquivos de migração. Vamos abrir as migrações. Usamos cada uma delas para conectar com o banco e criar as tabelas com o método create table, tem os atributos id, etc, 0, updatedAt.

- Conseguimos usar o sequelize para depois você criar uma tabela, cada uma delas, conseguimos adicionar colunas também usando o Sequelize? Vamos ver isso agora em seguida.

### Criando as colunas para fazer as migrações

- Tu pode fazer as colunas na mão utilizando os comandos de SQL, como o alter table, add colum, MAS tu pode fazer isso de uma maneira mais ágil que é utilizando as migrations

### Para tu ver todas as alteraçÕes no banco, usando as migrations tu vai pedir para mostrar a tabela SequelizeMeta

- Essa é a tabela responsável por guardar todas as alterações feita no banco, tipo o versionamento do banco.

- Se viermos no código e abrirmos o código do arquivo de migração que usamos para criar a tabela pessoas, ela tem up, que é o comando que é rodado quando mandamos criar uma migração. E se precisarmos desfazer o que foi feito, tem o down que roda um outro método.

- Se tu for no banco e rodar o cmd SQL na mão para criar uma tabela ou coluna, ele iria criar, mas não iria ficar o registro, não ia conseguir desfazer também se fosse necessário com a facilidade que desfazemos se usarmos migração.

###  Como usamos as migrações para ao invés de criar uma tabela criarmos uma coluna nova, por exemplo?

- Vou usar como base nosso arquivo create pessoas, que criamos anteriormente, porque o código vai ser parecido. Onde vamos trocar os métodos, não vai ser mais create table, mas vamos criar primeiro um arquivo novo na pasta de migração, o nome desse arquivo vai ser a data de hoje, não precisa ser exatamente a data de hoje, só precisa ser uma data posterior às migrações anteriores, e em seguida vou dar um nome, que vai ser addcolumn-pessoas.js.

#### nome da migration
```
20230006200446-addcolumn-pessoas
```

- É importante notar que a data der criação de uma migration TEM que ser POSTERIOR as migrations anteriores, PORQUE elas são executadas em ORDEM DE DATA.

#### Novo arquivo de migration

- Seguindo as regras acima o conteúdo da nova migration será esse:

```js
"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Pessoas", "deletedAt", {
      allowNull: true,
      type: Sequelize.DATE
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("Pessoas", "deletedAt");
  },
};

```
- Tu vai usar o método addColum do Sequelize
- Como parametros o 1 valor vai ser o nome da tabela que vai receber a coluna
- O 2 Parametro vai ser o nome da coluna
- Dentro do objeto tu vai definir as propriedades da coluna, por ex tu informou que ela é do tipo date e permite valores null
- Por que null? Porque quando tu usar o Select para mostrar os dados o SQL só vai mostrar os DADOS em que a tabela deletedAt são nulos, esse é o motivo do uso do Paranoid
- Por isso quando tu deletar um dado usando o Paranoid, ele vai adicionar uma DATA a coluna deletedAt assim, fazendo ela deixar de ser NULA e quando tu usar o Select do SQL, só vai mostrar os dados não nulos
- Lembrando que com o uso do Paranoid, você continua usando o método Destroy, mas quando ele é executado o método que vai excluir a tabela do banco vai ser o UPDATE, porque ele vai adicionar uma data a coluna deletedAt
- Se tiver dúvidas reveja a aula => https://cursos.alura.com.br/course/orm-nodejs-avancando-sequelize/task/79536
- Ou dê uma olhada na documentação do método Paranoid.
#### no Down
- Lembrando que o down serve para desfazer uma alteração usando a migration
- O 1 Parametro é referente a tabela
- O 2 Parametro é referente a coluna

#### Tu vai repetir o passo dessa coluna para as outras, e depois só vai rodar o cmd npx sequelize-cli db:migrate para rodar as migrations

### Relembrando sobre Migrações

- Qualquer alteração na estrutura do banco feita através de acesso direto ao banco (via terminal, por exemplo), sem o uso de uma migração, não é indexada/rastreável.
```
Por exemplo, uma nova coluna adicionada a uma tabela diretamente via SQL, com o comando ALTER TABLE Tabela, não passou pela migração, essa alteração não foi indexada pelo arquivo SequelizeMeta e o arquivo com a data e a descrição do que foi alterado não está na pasta de migrações.
```

- Migrações com ORM são úteis para coordenar alterações feitas por diferentes pessoas nas tabelas do banco.
```
Sim, quando temos mais de uma pessoa trabalhando em um mesmo projeto e fazendo alterações no banco durante o desenvolvimento, as migrações são úteis para “documentar” o que foi alterado no banco, e quando isso aconteceu.
```

- Migração em SQL é a transferência de dados entre plataformas/ambientes SQL.
```
O termo é o mesmo, o que às vezes pode gerar confusão, mas tem sentidos diferentes. É provável que, para uma pessoa que trabalha como DBA, este seja o significado mais comum, pois é dela a responsabilidade nesse tipo de migração.
```

- As alterações feitas no banco via migrações podem ser rastreadas e revertidas para debugar conflitos e erros.
```
Caso alguma alteração gere erros ou bugs, é possível desfazê-la. Da mesma forma que o Sequelize utiliza o comando db-migrate para rodar as migrações, o comando db:migrate:undo vai desfazê-las em ordem, começando pela última executada.
```

- Migração com ORM é o processo de documentar e rastrear mudanças em um banco de dados.
```
Quando utilizamos ORMs para gerenciar bancos SQL, o termo “migração” se refere a esta funcionalidade que é comum aos ORMs em geral, não apenas ao Sequelize.
```



