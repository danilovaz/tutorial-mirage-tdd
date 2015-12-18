## Stubbing de um JSON API com ember-cli-mirage

Quando desenvolvemos uma App client side em JavaScript, você nem sempre terá uma API disponível antes de começar. Mesmo quando você fazer isso, você provavelmente não vai querer ter seus tentes dependendo de uma API que ainda não está pronta.

Felizmente, há uma ótima solução para  "tocar"(`stubbing`) sua API enquanto const'roi sua Ember app: [Ember CLI Mirage](http://www.ember-cli-mirage.com/). Mirage funciona perfeitamente quando Ember Data está esperando uma API REST, mas há uma conversão manual que deve ser feita se você quer consumir uma API JSON como eu tive que assim fazer recentemente em um projeto.

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

Mirage irá criar uma pasta mirage dentro da `app/`. Ela contem um arquivo `config.js`, uma psta `factories` e uma pasta `scenarios`.

