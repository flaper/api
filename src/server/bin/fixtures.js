import {Fixture} from '../../data/lib/Fixture';

let fixture = new Fixture(Fixture.TYPE_ALL());
fixture.process().then(() => process.exit());
