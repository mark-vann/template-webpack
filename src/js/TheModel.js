import { EventEmitter } from 'events';

class TheModel extends EventEmitter {
  constructor() {
    super();
    console.log('TheModel');
  }
}

export default new TheModel();
