import {Fixture} from '../../data/lib/fixtures/Fixture';

let fixture = new Fixture(Fixture.TYPE_CONSTANTS());
fixture.process().then(() => process.exit());
