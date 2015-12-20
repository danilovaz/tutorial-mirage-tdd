import { test } from 'qunit';
import moduleForAcceptance from 'michael/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | parts');

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
