export default function() {

    this.get('/cars', (db) => {
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

  this.post('/cars', (db, request) => {
    return JSON.parse(request.requestBody);
  });

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
    };

    data.relationships.parts.data = parts.map((attrs) => {
      return { type: 'parts', id: attrs.id, attributes: attrs };
    });

    return { data };
  });

  this.get('parts/:id', (db, request) => {
    let part = db.parts.find(request.params.id);

    let data = {
      type: 'parts',
      id: request.params.id,
      attributes: part,
    };

    return { data };
  });

  this.post('parts', (db, request) => {
      return JSON.parse(request.requestBody);
  });


  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */
  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Route shorthand cheatsheet
  */
  /*
    GET shorthands

    // Collections
    this.get('/contacts');
    this.get('/contacts', 'users');
    this.get('/contacts', ['contacts', 'addresses']);

    // Single objects
    this.get('/contacts/:id');
    this.get('/contacts/:id', 'user');
    this.get('/contacts/:id', ['contact', 'addresses']);
  */

  /*
    POST shorthands

    this.post('/contacts');
    this.post('/contacts', 'user'); // specify the type of resource to be created
  */

  /*
    PUT shorthands

    this.put('/contacts/:id');
    this.put('/contacts/:id', 'user'); // specify the type of resource to be updated
  */

  /*
    DELETE shorthands

    this.del('/contacts/:id');
    this.del('/contacts/:id', 'user'); // specify the type of resource to be deleted

    // Single object + related resources. Make sure parent resource is first.
    this.del('/contacts/:id', ['contact', 'addresses']);
  */

  /*
    Function fallback. Manipulate data in the db via

      - db.{collection}
      - db.{collection}.find(id)
      - db.{collection}.where(query)
      - db.{collection}.update(target, attrs)
      - db.{collection}.remove(target)

    // Example: return a single object with related models
    this.get('/contacts/:id', function(db, request) {
      var contactId = +request.params.id;

      return {
        contact: db.contacts.find(contactId),
        addresses: db.addresses.where({contact_id: contactId})
      };
    });

  */
}

/*
You can optionally export a config that is only loaded during tests
export function testConfig() {

}
*/
