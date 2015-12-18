## Stubbing de um JSON API com ember-cli-mirage

Quando desenvolvemos uma aplicacão client side em JavaScript, nem sempre teremos uma API disponível antes de começar. Mesmo quando fazemos faz isso não queremos nossos dependendo de uma API que ainda não está pronta.

Felizmente, há uma ótima solução para  "tocar"(`stubbing`) sua API enquanto constrói sua Ember app: [Ember CLI Mirage](http://www.ember-cli-mirage.com/). Mirage funciona perfeitamente quando `Ember Data` está esperando uma API REST, mas há uma conversão manual que deve ser feita se você quer consumir uma API JSON como eu tive que assim fazer recentemente em um projeto.

<hr/>

### Setup

```bash
$ ember new mirage-tutorial
$ cd mirage-tutorial
```
Nós iremos usar Ember/Ember Data 2.2.0 para esta app, então vamos fazer a atualização.

Em seu `bower.json` mude as seguintes linhas:

`"ember": "sua-versão",` para `"ember": "2.2.0"`

`"ember-data": "sua-versão",` para `"ember-data": "2.2.0"`

Feito isso agora rode o comando:

```bash
$ ember g adapter application
```

Pronto! Ember e Ember data devem estar atualizados, verifique no seu Ember inspector.

Nós vamos usar o adapter `JSONAPI, gere seu adapter:

```bash
$ ember g adapter application
```

Agora vá em nosso adapter que acabamos de criar e mude `RESTAdapter` para `JSONAPIAdapter`.

Agora instale o mirage, quando reiniciar seu servidor.

```bash
$ ember install ember-cli-mirage
```

Mirage irá criar uma pasta mirage dentro da `app/`. Ela contem um arquivo `config.js`, uma pasta `factories` e uma pasta `scenarios`.

**Arquivo config**: Mirage usa Pretender, que intercepta requisições que normalmente atingiriam sua API, permitindo você especificar a resposta que deveria ser enviada de volta. Este arquivo é onde você vai especificar os end-points de sua API.

Mirage lhe oferece uma sintaxe `shorthand` para rotas simples, mas você pode criar rotas manualmente quando esse `shorthand` não funcionar.Mirage docs](http://www.ember-cli-mirage.com/docs/v0.1.x/defining-routes/) tem uma descrição clara de curta de como lidar com as rotas.

**Scenarios**: Mirage cria um `default.js` dentro de `scenario` para você. Dentro de `scenario`n você declara todos dados que você deseja distribuir com seu ambiente de desenvolvimento. Estes dados não estarão em seu ambiente de testes.

**Factories**: Seu `scenario` mirage ira usar as `factories` definidas para gerar seus dados, e você deve usá-los em seu teste também.

Nós iremos criar uma simples aplicação que irá listar nossos carros e criarmos novos carros também. Nossos carros também contém partes, que podem ser criadas também. Enquanto parte do time está terminando a API, nós vamos começar com a nossa que já está terminada.

<hr/>
### Listando nossos carros
Isso vai riar um cars accecptance test.

```bash
$ ember g acceptance-test cars
```

Ember gera um teste para nós em `tests/acceptance/cars-test.js`, com um teste gerado que garante que nossa rota funciona. Vamos mudar isso para testar um link para índice de carros no template `application`. Ao escrever `QUnit`, você irá simular tudo que seu usuário navega ('click', visit, etc), que funcionam de forma assíncrona. Asserções são chamadas na callback `andThen()`, que irá executar depois de todas operações assíncronas estiverem terminadas.[^2](http://coryforsyth.com/2014/07/10/demystifing-ember-async-testing/)

```javascript
//app/tests/acceptance/cars.js
test('visiting /cars', function(assert) {
  visit('/');

  click('#all-cars');

  andThen(() => {
    assert.equal(currentURL(), '/cars');
  });
});
```

Nossos testes rodam em `localhost:4200/tests`. Quando voê for até a pagina, vá até o drop down module e selectione a seguinte opção 'Acceptance | cars'. Nós iremos ter um erro porque nos não temos o link `#all-cars`.

Então vamos fazer nosso teste passar. Frimeiro nós precisamos criar o link.

```html
<!-- app/templates/application.hbs -->
<h2 id="title">Welcome to Ember</h2>
{{link-to 'Cars' 'cars.index'}}

{{outlet}}
```

agora QUnit nos diz que não há nenhuma rota `cars.index`, então vamos criar.

```bash
$ ember g route cars
```

Ember irá adicionar a rota para você no arquivo `router.js`. Agora precisamos passar uma função vazia para `cars/index`.

```javascript
//router.js
Router.map(function() {
  this.route('cars', {}, function(){});
});
```
Agora verifique sua página de testes, agora irá passar.

Vamos testar que quando nós navegamos até a página de carros, nós veremos alguns carros. Segue o teste de aceitação do seu carro.

```javascript
//tests/acceptance/cars.js

test('I see all cars on the index page', (assert) => {
  server.create('car');
  visit('/cars');

  andThen(() => {
    const cars = find('li.car');
    assert.equal(cars.length, 1);
  });
});

```

`server.create('car')` diz ao Mirage para encontrar um factory chamado 'car', criar um daqueles carros e colocá-los no banco de dados do Mirage. Quando você rodar o teste ele ira mostrar um erro.

Rode seus testes com o Chrome debugger pra poder ver os erros.

Mirage registrará um erro dizendo que tentou encontrar a factory 'car' e ela não estava definida. Vamos fazer em `app/mirage/factories/car.js`.

```javascript
// /app/mirage/factories/car.js
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name(i) { return `Car ${i + 1}`;}
});
```

Isto irá criar um carro com o atributo `name`. Este (i) é usado para sequências Mirage, o prmeiro `name` irá ser "Car 1", então "Car 2", etc.

Se nós verificarmos nossos testes de novo. Ele irá falhar, buscando 0 carros, quando o esperado é 1. Para buscar os carros na página, nossa rota `car/index` irá precisar carregar o model car.

Vamos criar nosso car model, O Ember CLI generators é fantástico, mas ele irá gerar alguns testes que não está no escopo deste tutorial(unit tests). Você pode remover ou ignorá-los. Eu recomendo que removam os testes não utilizados.

```bash
$ ember g model car
```

```javascript
// /app/models/car.js
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string')
});
```

E nossa rota...
```bash
$ ember g route cars/index
```

```javascript
// /app/routes/cars/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model(){
    return this.store.findAll('car');
  }
});
```

```html
<!--app/templates/cars/index.hbs-->

<ul class='cars'>
  {{#each model as |car|}}
    <li class='car'>
      {{car.name}}
    </li>
  {{/each}}
</ul>

```
