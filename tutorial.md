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
$ bower install
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

Quandos nossa solicitação chega no `hook model` de nossa rota, o Ember Data envia uma solicitação GET para `/cars`. Se você for nos testes, irá ver que o teste vai aparecer congelado sem o debbuger do chrome aberto. Mirage irá mostrar o log do erro, dizendo que não existe nenhum end point para GET `/cars`

Vamos criar uma rota para Mirage para então interceptar essa solicitação. Para este tutorial nós vamos usar o `longer syntax`, porque o Mirage não lida com JSOM API em `shorthand syntax`- por enquando. Quando o branch `json-api-serializer` do Mirage for mergeado (que deve ser em breve), Mirage irá ser capaz de cuidar disso.

JSON API esperar uma resposta com a `key` de nível superior chamada `data`, podendo conter um array de recursos retornados. Cada recurso deve ter um tipo especifico. o id do recurso, e os atributos de recursos. Quando Mirage responde a solicitação ela irá registar a responsta no console para inspeção. O objeto deve ser semelhante a este:

```javascript
  data: {
    [
      {
        attributes: {
          id: 1,
          name: 'Car 1'
        },
        id: 1,
        type: 'cars'
      },
      {
        attributes: {
          id: 2,
          name: 'Car 2'
        },
        id: 2,
        type: 'cars'
      },
      //....
    ]
  }

```


Há outras `keys` como erros e relacionamentos. Nós vamos falar mais sobre as relações neste tutorial.

```javascript
// /app/mirage/config.js

export default function() {
  this.get('/cars', (db, request) => {
    let data = {};
    data = db.cars.map((attrs) => {
      let rec = {type: 'cars', id: attrs.id, attributes: attrs};
      return rec;
    });

    return { data };
  });
};
```

Quando nós rodarmos nossos testes de novo, ele vai passar. Se você gosta de ver como isso funciona em `development`, gere alguns alguns carros em `scenarios/default.js`, e vá até `localhost:4200/cars`.

```javascript
// /app/mirage/scenarios/default.js
export default function(server) {

    // Seed your development database using your factories. This data will not be loaded in your tests.
    server.createList('car', 10);
}
```

O que está acontecendo aqui?

Quando nós visitamos a rota `cars`, ember envia nos envia para a rota `cars/index`. A rota dispara o `hook model`, onde ember data envia uma solicitação `GET`para todos os carros. A rota mirage in `mirage/config.js` intercepta a solicitação, busca os `cars` que nós geramos no teste, adiciona-os em um objeto JSON API formatado, e envia de volta como resposta. Sem precisar de uma api.

Agora que nós temos um trabalho de acceptance test, vamos criar um car component para nossos `cars` ficarem lá.

```bash
ember g component a-car
```

Ember criará um `component integration test`, que vamos usar. É fácil de configurar Mirage para `integrantion tests`. Dentro de `tests/helpers/`, crie um arquivo chamado `mirage-integration.js`

```javascript
//tests/helpers/mirage-integration.js
import mirageInitializer from '../../initializers/ember-cli-mirage';

export default function setupMirage(container) {
  mirageInitializer.initialize(container);
}
```

E dentro do seu `component test`, importe a função `setupMirage`, você ira invocar no `moduleForComponent` o `hook setup`, passando  o `this.container`.

```javascript
//app/tests/integration/components/a-car-test.js

import { moduleForComponent, test } from 'ember-qunit';
import setupMirage from '../../helpers/mirage-integration';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('a-car', 'Integration | Component | a car', {
  integration: true,
  setup() {
    setupMirage(this.container);
  }
});

test('it renders', function(assert) {
  const car = server.create('car');
  this.set('car', car);
  this.render(hbs`{{a-car car=car}}`);

  assert.equal(this.$().text().trim(), 'Car 1');
});
```

Neste teste, nós criamos um `car`, e um comonent (`this`) e o definimos no componente. Então nós podemos renderizar o template, e afirmar qual texto o componente deve mostrar. É claro que não fiz nada com nosso componente ainda, então o teste falha.

Em nosso template `cars/index`, estamos renderizando nosso componente dentro de um `li` com uma class de 'car'.

```javascript
import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['car']
});
```

Mova a expression `{{car.name}}`para dentro do template do componente, e renderize o compoennte in cada loop, passando o model dentro do componente.
```html

<!-- templates/components/a-car.hbs -->
{{car.name}}
```

```html
<!-- templates/cars/index.hbs -->
Cars/Index

<ul class='cars'>
  {{#each model as |car|}}
    {{a-car car=car}}
  {{/each}}
</ul>
```
Rode os testes, ele deve pasar.

<hr/>
### Adding New Cars

Agora que nossos `cars` estão testados e funcionando, nós precisamos ser capazes de adicionar mais carros para nossa coleção. Vamos fazer um teste.

```javascript
//tests/acceptance/cars-test.js
test('I can add a new car', function(assert){
  server.createList('car', 10); visit('/cars');

  click('#add-car'); fillIn('input[name="car-name"]', 'My new car');
  click('button');

  andThen(() => {
    const newCar = find('li.car:contains("My new car")');
    assert.equal(newCar.text().trim(), "My new car");
  });
});
```

Nosso teste falha porque não existe um link com o id `add-car`. Este link deve nos levar para a rota `cars.new`. Em nosso template `cars/index` coloque na parte inferior do arquivo:

```html
<!-- app/templates/cars/index.hbs -->
<!-- ... -->

{{#link-to 'cars.new' id='add-car'}}
  Add new car
{{/link-to}}
```

Agora nosso teste falha porque nós não temos o input esppeficicado. Então precisamos do template `cars/new`, nós também sabemos que nós precisamos da rota. Gerando a rota nós criamos os dois.

```bash
ember g route cars/new
```

A rota deve ser ficar assim:

```javascript
//router.js
import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});


Router.map(function() {
  this.route('cars', function() {
    this.route('new', {});
  });
});

export default Router;
```

Adicione o form para criar um carro para nosso template `cars/new`:

```html
<!--app/templates/cars/new.hbs-->
New Car

<form {{action 'createCar' name on='submit'}}>
  {{input name='car-name' value=name}}
  <button> Create Car </button>
</form>
```

Nós sabemos que precisamos de uma `action`para lidar com a criação do `car`, então vamos declarar isso agora. Nosso teste irá falhar porque não há um `action' chamada `createCar`ainda. Minha preferência é lidar com tudo relacionada a `data` na rota enquanto eu puder. Vamos fazer isso.

```javascript
// /app/routes/cars/new.hbs
import Ember from 'ember';
export default Ember.Route.extend({
  actions: {
     createCar(name){
      const car = this.store.createRecord('car', { name });

      car.save()
        .then(() => {
          this.transitionTo('cars');
        }).catch(() => {
          // something that handles failures
        });
     }
   }

});
```

Agora nossas peças ember estão ligadas, mas o teste falha porque mirage não ver um rota que especifica uma solititação `POST`para `/cars`. Adicione no arquivo config do mirage o seguinte.

```javascript
// /app/mirage/config.js

export default function() {
  //...

  this.post('/cars', (db, request) => {
    return JSON.parse(request.requestBody);
  });
};
```

Nossa JSONAPIAdapter envia os dados serializados no formato correto, para que nós temos que analisá-los e então retorná-los

E com isso nosso teste deve passar.

<hr/>
### Vendo Partes

Já mencionei anteriormente que nossos carros contém `parts`. Nós vamos fazer isso, para que quando eu clicar em nosso `car`, nós seremos levados para essa página de partes do carro.

```bash
$ ember g acceptance-test parts
```

Delete o teste gerado e adicione este.

```javascript
//tests/acceptance/parts.js

test('when I click a car, I see its parts', (assert) => {
  const car = server.create('car');
  const parts = server.createList('part', 4, { car_id: car.id });
  visit('/cars');
  click('.car-link');

  andThen(() => {
    assert.equal(currentURL(), `/car/${car.id}/parts`);
    assert.equal(find('.part').length, parts.length);
  });
});
```

Nossa primeira ruptura ocorre porque Mirage não tem um factory para `part`.

```javascript
//mirage/factories/part.js

import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name(i) { return `Part ${i}`; }
});
```

Agora QUnit reclama porque nós não temos links. Transforme sua lista de carros em links, de modo que quando clicamos em um, nós podemos ver as partes desse carro.

```html
<!-- templates/components/a-car.hbs -->
{{#link-to 'car.parts' car class='car-link'}}
  {{car.name}}
{{/link-to}}
```
QUnit reclama novamente por não termos uma rota `car.parts`.

```bash
$ ember g route car/parts
```

Nosso `router` deve ficar assim:

```javascript
//router.js
import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('cars', function() {
    this.route('new', {});
  });

  this.route('car', function(){
    this.route('parts', {});
  });
});

export default Router;
```

Vamos adicionar um segmento dinâmico de `id` para o caminho de `car`.

```javascript
//...
  this.route('car', { path: '/car/:id'}, function(){
    this.route('parts');
  });
//...
});

export default Router;
```
Como nossa rota está aninhada, nós precisamos especificar o model para nossa rota primária.

```bash
$ ember g route car

```

Na rota car, retornamos o `car` especificado por um id dinâmico.

```javascript
//routes/car.js
import Ember from 'ember';

export default Ember.Route.extend({
  model(params){
    return this.store.find('car', params.id);
  }
});
```

Nós também temos que criar uma rota Mirage para GET de um único car. Neste ponto da aplicação, nós temos que ter nossos carros carregados ao visitar o index. mas um usuário pode ir direto para para uma url `car/:id`, então precisamos lidar com isso.

JSON API requer informações de relacionamento para ser aramazenado em um objeto 'relationships'. Adicione isso em seu arquivo mirage config.

```javascript
//mirage/config.js
export default function() {
  //...

  this.get('/cars/:id', (db, request) => {
    let car = db.cars.find(request.params.id);
    let parts = db.parts.where({car_id: car.id});

    let data = {
      type: 'car',
      id: request.params.id,
      attributes: car,
      relationships: {
        parts:{
          data:{}
        }
      }
    }

    data.relationships.parts.data = parts.map((attrs) => {
      return { type: 'parts', id: attrs.id, attributes: attrs };
    });

    return { data };
  });

}

```

Adicionamente, en nossa rota Mirage '/cars', nós retornamos apenar a informação do carro, sem associar suas pates. O que isso significa é que se a primeira página nós visitamos é a '/cars', os carros já estarão carregados no store (sem nenhum conhecimento de quaisquer partes associadas).

Quandos nós vamos para a página 'cars/part', o store não vai buscar o model, porque ele já está no store. por isso não haverá partes disponíveis para renderizar. Nós devemos carregar as partes dos carros na rota 'cars/index'

```javascript
//mirage/config.js
export default function() {
  this.get('/cars', (db, request) => {
    let data = {};
    data = db.cars.map((attrs) => {

      let car = {
        type: 'cars',
        id: attrs.id,
        attributes: attrs ,
        relationships: {
          parts: {
            data: {}
          }
        },
      };

      car.relationships.parts.data = db.parts
        .where({car_id: attrs.id})
        .map((attrs) => {
          return {
            type: 'parts',
            id: attrs.id,
            attributes: attrs
          };
        });

      return car;

    });
    return { data };
  });
//....
```
Agora nós precisamos do Mirage end-poinst para buscar uma part.
```javascript
//mirage/config.js
export default function() {
//...
  this.get('parts/:id', (db, request) => {
    let part = db.parts.find(request.params.id);

    let data = {
      type: 'parts',
      id: request.params.id,
      attributes: part,
    };

    return { data };
  });
//...
```

Agora nós precisamos de um model part, e uma factory.

```javascript
//models/part.js
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  car: DS.belongsTo('car')
});
```

```javascript
import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name(i) { return `Part ${i}`; }
});
```

E atualizar nosso car model para mostra essa associação.

```javascript
//models/car.js
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  parts: DS.hasMany('part')
});
```

E nosso template:
```html

<!-- car/parts.hbs -->
Parts
<ul>
  {{model.name}}
  {{#each model.parts as |part|}}
    <li class='part'>
      {{part.name}}
    </li>
  {{/each}}
</ul>
```
E agora nosso tesde deve passar.

Vou deixar a conversão de `part` em um componente com um teste de integração como exercicio para voce completar. Os passos são os mesmos como eram para carros.




















