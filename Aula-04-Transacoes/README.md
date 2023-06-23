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

