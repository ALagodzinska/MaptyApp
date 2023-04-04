'use strict';

class Colors {
  #colors = [
    '#8A2BE2',
    '#0000FF',
    '#A52A2A',
    '#D2691E',
    '#FFF8DC',
    '#006400',
    '#8B0000',
    '#00BFFF',
    '#FFD700',
    '#FF69B4',
    '#90EE90',
    '#9370DB',
    '#3CB371',
  ];

  getRandomColor() {
    return this.#colors[Math.floor(Math.random() * this.#colors.length)];
  }
}

export { Colors };
