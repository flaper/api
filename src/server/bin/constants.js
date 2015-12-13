import {Fixture} from '../../data/lib/Fixture';

let fixture = new Fixture(Fixture.TYPE_CONSTANTS());
fixture.process().then(() => process.exit());
