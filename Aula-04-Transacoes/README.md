# Aula 04

- O cliente gostaria que, uma vez que o cadastro de um estudante fosse desativado, todas as matrículas relativas a este estudante automaticamente passassem a constar como “canceladas”.

### Operação com dois modelos

- Se tu colocar que o estudante tem o cadastrado cancelado, todas as suas matriculas, sejam alteradas para o status cancelado

- Tu vai fazer isso no Controlador de Pessoas
PessoaController.js
```js
  static async cancelaPessoa(req, res) {
    const { estudanteId } = req.params;
    try {
      await database.Pessoas.update(
        { ativo: false },
        { where: { id: Number(estudanteId) } }
      );
      await database.Matriculas.update(
        { status: "cancelado" },
        { where: { estudante_id: Number(estudanteId) } }
      );
      return res
        .status(200)
        .json({
          message: `Matriculas referente estudante ${estudanteId} canceladas!`,
        });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```
- 1 Tu vai pegar o ID do estudante para poder fazer a lógica
- 2 Tu vai fazer um update, note que tu está passando o valor da coluna DIRETO como o primeiro parametro, e está atribuindo o valor false, para cancelar o Estudante.
- 3 Tu precisa usar o Where, para especficiar para o Sequelize qual ID que tu quer alterar, informando o ID que tu pegou no req params
- 4 Tu vai refazer o mesmo processo para a Tabela Matriculas
- Note que tu não passou o req.body, diferente dos outros updates realizado no projeto, Mas por que isso? Porque como tu não precisa de um valor informado pelo front, a exclusao vai ser feita diretamente pelo back, tu só vai precisar dos params do front para especificar qual o ID da tabela vai sofrer a alteração
- O body dos outros updates, tu recebia valores, porque esses valores deveriam ser informados pelo front, porque era uma atualização realizada pelo usuário e aqui é uma exclusao, então os dados sempre serão os mesmos.

#### Feito os passos acima, crie a rota
pessoasRoute.js
```js
  .post('/pessoas/:estudanteId/cancela', PessoaController.cancelaPessoa)
```

# Transações

#### O que é?
- As Transações servem para garantir a integração dos dados em operações como a de cima, que é uma operação entre dois  ou operadores
- Caso de algum erro é a transação que vai lidar com ele.
- Resumindo => Uma Transação é para garantir a intregridade de dados em uma operação que acesse mais de uma tabela, acesse várias tabelas, ou que faça atualizações em várias linhas de uma tabela.

- Se acontece qualquer erro nesse processo, qualquer erro de banco, e temos uma falha em qualquer parte dessa operação, nenhum dado é salvo, nenhum dado é atualizado no banco, na realidade, e o banco volta para o ponto onde ele estava antes de tudo isso começar, antes de todas as operações que passamos começarem. 

- Quando temos que voltar o banco para o estado anterior chamamos de rollback.

#### Documentação Sequelize Transações => https://sequelize.org/docs/v6/other-topics/transactions/

### Aplicando a transação

#### Código SEM a Transação
PessoaController.js
```js
  static async cancelaPessoa(req, res) {
    const { estudanteId } = req.params;
    try {

      await database.Pessoas.update(
        { ativo: false },
        { where: { id: Number(estudanteId) } }
      );
      await database.Matriculas.update(
        { status: "cancelado" },
        { where: { estudante_id: Number(estudanteId) } }
      );
      return res
        .status(200)
        .json({
          message: `Matriculas referente estudante ${estudanteId} canceladas!`,
        });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
```

#### Código COM a Transação
PessoaController.js
```js
  static async cancelaPessoa(req, res) {
    const { estudanteId } = req.params;
    try {
      database.sequelize.transaction(async (transacao) => { // Aqui
        
        await database.Pessoas.update(
          { ativo: false },
          { where: { id: Number(estudanteId) } },
          {transaction: transacao} // Aqui
        );
        await database.Matriculas.update(
          { status: "cancelado" },
          { where: { estudante_id: Number(estudanteId) } },
          {transaction: transacao} // Aqui
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
- Tu vai iniciar a transacao, e passar como paramatro, a transacao, na documentaçao do Sequelize se usa T q é a mesma coisa
- Aí como 3 Parametro tu vai criar um novo objeto com a propriedade TRANSACTION, tem que ser essa! E passando como valor o paramatro o transacao que tu definiu lá em cima.
- Com isso tua transação está criada.

#### Como dito anteriormente a transação vai impedir que caso de erro em alguma autalização de uma tabela, esse valor não seja inserido.

- Assim vai acontecer um Rollback e não vai permitir as alterações nas outras TABELAS
- Por Exemplo digamos que tu fez a lógica da TABELA 1 sem a transação e ela passou, mas a lógica da TABELA 2, está com ERRO, o que vai acontecer se tu não usar uma transaçÃo? Os valores da TABELA 1 serão atualizados e os da TABELA 2 NÃO.
- Entende o problema que isso pode causar? Por isso, sempre que for fazer operações com várias tabelas, use transações :D

#### Obersavações sobre transações

- Transações servem para garantir a consistência dos dados em um banco; no fim de cada transação, todos os dados devem estar em um estado consistente.
```
 Uma transação sempre mantém o banco em um estado válido/consistente, o que inclui dados válidos (de acordo com as restrições) e impede registros incorretos no banco; por exemplo, uma tabela não pode ter FKs que não existam na tabela de origem da chave.
```

- O gerenciamento de transações pode ser feito pelo Sequelize através do método .transaction().
```
O Sequelize por definição não inclui transações nas operações de banco; elas devem ser implementadas conforme necessário.
```

- Uma transação é uma única operação e deve ser completada com todas as modificações de dados, ou nenhuma modificação é feita.
```
 O princípio da transação é garantir que todas as alterações nos dados sejam integralmente efetuadas (e concluídas com COMMIT) ou todos os dados envolvidos serão revertidos para o estado anterior (o chamado ROLLBACK).
```

- O ideal é utilizar transações para todas as operações que fazemos no banco ?
```
No caso de queries SELECT e de alterações únicas no banco - por exemplo, uma inclusão em somente uma tabela, não há necessidade de se implementar transações. Em operações mais complexas, como alterações ou inserções que envolvam mais de uma tabela e/ou campos, elas se tornam necessárias para garantir que todas as operações envolvidas sejam ou finalizadas com sucesso, ou revertidas.
```

### Transações manuais com Sequelize

- O Sequelize não implementa transações nas queries por padrão; mas é muito aconselhável que você as utilize, especialmente em produção.

- Existem duas formas de fazer isso utilizando os métodos do Sequelize: a primeira é utilizando transações não gerenciadas (unmanaged transactions), onde quem está desenvolvendo é responsável por chamar os métodos apropriados de rollback e commit:
```js
const transacao = await sequelize.transaction();

try {
  const personagem = await Personagem.create({
    nome: 'Bart',
    sobrenome: 'Simpson'
  }, { transaction: transacao });
  await personagem.addParente({
    nome: 'Lisa',
    sobrenome: 'Simpson'
  }, { transaction: transacao });
  await transacao.commit();
} catch (error) {
  await transacao.rollback();
}
```
- No exemplo acima (da própria documentação do Sequelize) os métodos t.commit() e t.rollback() foram adicionados manualmente.

- A outra forma, como fizemos acima, foi utilizando transações gerenciadas (managed transactions) onde toda a operação a ser feita no banco é passada como callback do método sequelize.transaction(). Nesse caso, e como foi feito no código do nosso projeto, não há a necessidade de adicionar manualmente os métodos t.commit() e t.rollback().

- Link documentação sobre Transações => https://sequelize.org/docs/v6/other-topics/transactions/
