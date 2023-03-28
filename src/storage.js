import { Running, Cycling } from './workouts.js';

class WorkoutStorage {
  #storageKey = 'workouts';

  set(workouts) {
    // make sure we received workouts
    if (!workouts) {
      workouts = [];
    }
    // save workouts
    localStorage.setItem(this.#storageKey, JSON.stringify(workouts));
  }

  get() {
    const workoutsJson = localStorage.getItem(this.#storageKey);
    let payload;

    // parse json
    try {
      payload = JSON.parse(workoutsJson);
    } catch (error) {
      console.error(error);
    }

    // check if payload is array
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload.map(this.transformItem);
  }

  transformItem(item) {
    let workout;

    if (item.type === 'running') {
      workout = new Running(item);
    } else if (item.type === 'cycling') {
      workout = new Cycling(item);
    } else {
      throw new Error(`Undefined workout type ${item.type}`);
    }

    return workout;
  }
}

export { WorkoutStorage };
