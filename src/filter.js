'use strict';

const sortButton = document.getElementById('sort-btn');
const sortBar = document.querySelector('.sort-bar');
const sortByType = document.querySelector('.sort-type');
const sortByDate = document.querySelector('.sort-date');
const sortByDistance = document.querySelector('.sort-distance');
const sortByTime = document.querySelector('.sort-time');
const refreshSort = document.getElementById('refresh-sort');

class Filter {
  constructor(workouts, workoutDisplay) {
    this.#workouts = workouts;
    this.#workoutDisplay = workoutDisplay;

    sortButton.addEventListener('click', this.#showSortBar.bind(this));
    sortByType.addEventListener('click', this.#sortWorkoutsByType.bind(this));
    sortByDate.addEventListener('click', this.#sortWorkoutsByDate.bind(this));
    sortByDistance.addEventListener(
      'click',
      this.#sortWorkoutsByDistance.bind(this)
    );
    sortByTime.addEventListener('click', this.#sortWorkoutsByTime.bind(this));
    refreshSort.addEventListener('click', this.refreshFilters.bind(this));
  }

  #workouts;
  #workoutDisplay;
  #filteredWorkouts = [];
  #sortType = 'all';
  #sortDate = 'desc';
  #sortDistance = '';
  #sortTime = '';

  #showSortBar() {
    sortBar.classList.toggle('hidden');
    this.refreshFilters();
  }

  refreshFilters() {
    this.#filteredWorkouts = [...this.#workouts];
    this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
  }

  #sortWorkoutsByType() {
    if (this.#sortType === 'all') {
      this.#sortType = 'run';
      this.#filteredWorkouts = this.#workouts.filter(
        workout => workout.type === 'running'
      );
      sortByType.innerHTML = '🏃🏻‍♂️←🚴‍♀️';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    } else if (this.#sortType === 'run') {
      this.#sortType = 'bike';
      this.#filteredWorkouts = this.#workouts.filter(
        workout => workout.type === 'cycling'
      );
      sortByType.innerHTML = '🏃🏻‍♂️→🚴‍♀️';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    } else if (this.#sortType === 'bike') {
      this.#sortType = 'all';
      this.#filteredWorkouts = [...this.#workouts];
      sortByType.innerHTML = '🏃🏻‍♂️↔🚴‍♀️';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    }
  }

  #sortWorkoutsByDate() {
    if (this.#sortDate === 'desc') {
      this.#sortDate = 'asc';
      sortByDate.innerHTML = '📅↑';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    } else if (this.#sortDate === 'asc') {
      this.#sortDate = 'desc';
      sortByDate.innerHTML = '📅↓';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    }
    this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
  }

  #sortWorkoutsByDistance() {
    if (!this.#sortDistance) {
      this.#sortDistance = 'desc';
      this.#filteredWorkouts.sort((a, b) => {
        return b.distance - a.distance;
      });
      sortByDistance.innerHTML = '📏↓';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    } else if (this.#sortDistance === 'desc') {
      this.#sortDistance = 'asc';
      this.#filteredWorkouts.sort((a, b) => {
        return a.distance - b.distance;
      });
      sortByDistance.innerHTML = '📏↑';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    } else if (this.#sortDistance === 'asc') {
      this.#sortDistance = '';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      sortByDistance.innerHTML = '📏↕';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    }
  }

  #sortWorkoutsByTime() {
    if (!this.#sortTime) {
      this.#sortTime = 'desc';
      this.#filteredWorkouts.sort((a, b) => {
        return b.duration - a.duration;
      });
      sortByTime.innerHTML = '⏱↓';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    } else if (this.#sortTime === 'desc') {
      this.#sortTime = 'asc';
      this.#filteredWorkouts.sort((a, b) => {
        return a.duration - b.duration;
      });
      sortByTime.innerHTML = '⏱↑';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    } else if (this.#sortTime === 'asc') {
      this.#sortTime = '';
      this.#filteredWorkouts.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      sortByTime.innerHTML = '⏱↕';
      this.#workoutDisplay.renderWorkouts(this.#filteredWorkouts);
    }
  }
}

export { Filter };
