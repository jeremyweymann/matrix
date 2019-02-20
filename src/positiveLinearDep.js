import Matrix from './matrix';

function max(array, size) {
  let maximum = array[0];
  for (let v = 1; v < size; v++) {
    if (maximum < array[v]) {
      maximum = array[v];
    }
  }
  return (maximum);
}

class units {
  constructor(nbUnits, nbVectors, nbPoints, vector, vectorBase) {
    this.nbUnits = nbUnits;
    this.nbVectors = nbVectors;
    this.nbPoints = nbPoints;
    this.mark = [];
    this.age = [];
    for (let i = 0; i < nbUnits; i++) {
      this.mark.push(0);
      this.age.push(0);
    }
    this.map = [];
    for (let i = 0; i < nbUnits; i++) {
      this.map.push([]);
      for (let j = 0; j < this.nbVectors; j++) {
        this.map[i].push(0);
      }
    }
    this.vector = vector;
    this.vectorBase = vectorBase;
  }

  sort() {
    let tmp = 0;
    for (let i = 0; i < this.nbUnits; i++) {
      for (let j = 1; j < this.nbUnits; j++) {
        if (this.mark[j - 1] > this.mark[j]) {
          tmp = this.mark[j - 1];
          this.mark[j - 1] = this.mark[j];
          this.mark[j] = this.mark[j - 1];
          tmp = this.age[j - 1];
          this.age[j - 1] = this.age[j];
          this.age[j] = this.age[j - 1];
          for (let v = 0; v < this.nbVectors; v++) {
            tmp = this.map[j - 1][v];
            this.map[j - 1][v] = this.map[j][v];
            this.map[j][v] = tmp;
          }
        }
      }
    }
  }
}

function randIni(units, u, version) {
  if (version === 0) {
    for (let v = 0; v < units.nbVectors; v++) {
      units.map[u][v] = Math.floor(Math.random() * (max(units.vector) + 2));
    }
  } else {
    // To be implemented
  }
  units.age[u] = 0;
  units.mark[u] = 0;
}

function mark(units, unit) {
  let tmpMark = 0;
  let tmpVector = [];
  for (let i = 0; i < units.nbPoints; i++) {
    tmpVector.push(0);
  }
  for (let v = 0; v < units.nbVectors; v++) {
    for (let w = 0; w < units.map[unit][v]; w++) {
      for (let p = 0; p < units.nbPoints; p++) {
        tmpVector[p] += units.vectorBase[v][p];
      }
    }
  }
  for (let p = 0; p < units.nbPoints; p++) {
    tmpMark += Math.abs(units.vector[p] - tmpVector[p]);
  }
  units.mark[unit] = tmpMark;
}

function selection(units) {
  let sum = 0;

  let maximum = max(units.mark, units.nbUnits);
  for (let u = 0; u < units.nbUnits; u++) {
    units.mark[u] = maximum - units.mark[u];
  }
  for (let u = 0; u < units.nbUnits; u++) {
    sum += units.mark[u];
  }
  let selected = 0;
  let r = Math.floor(Math.random() * (sum + 1));
  while (r > 0) {
    selected += 1;
    r -= units.mark[selected];
  }
  if (r < 0) {
    selected -= 1;
  }
  if (selected >= units.nbUnits) {
    selected = units.nbUnits - 1;
  }


  for (let u = 0; u < units.nbUnits; u++) {
    mark(units, u);
  }
  return (selected);
}

function reproduction(units, nextUnits, father, mother, u) {
  let tmpVector = [];
  let r = Math.floor(Math.random() * (2));
  if (r === 0) {
    for (let v = 0; v < Math.floor(units.nbVectors / 2); v++) {
      tmpVector.push(units.map[father][v]);
    }
    for (let v = Math.floor(units.nbVectors / 2); v < units.nbVectors; v++) {
      tmpVector.push(units.map[mother][v]);
    }
  } else {
    for (let v = 0; v < Math.floor(units.nbVectors / 2); v++) {
      tmpVector.push(units.map[mother][v]);
    }
    for (let v = Math.floor(units.nbVectors / 2); v < units.nbVectors; v++) {
      tmpVector.push(units.map[father][v]);
    }
  }

  nextUnits.mark[u] = 0;
  for (let v = 0; v < nextUnits.nbVectors; v++) {
    nextUnits.map[u][v] = tmpVector[v];
  }
  nextUnits.age [u] = 0;
  nextUnits.mark [u] = 0;
}

function merge(units, nextUnits) {
  for (let u = units.nbUnits; u < units.nbUnits + nextUnits.nbUnits; u++) {
    units.map.push([]);
    for (let v = 0; v < units.nbVectors; v++) {
      units.map[u].push(nextUnits.map[u - units.nbUnits][v]);
    }
    units.mark.push(nextUnits.mark);
    units.age.push(nextUnits.age);
  }
  units.nbUnits += nextUnits.nbUnits;
}

function eugenisme(units) {
  units.sort();
  for (let u = units.nbUnits / 2; u < units.nbUnits; u++) {
    units.map.pop();
    units.age.pop();
    units.mark.pop();
  }
  units.nbUnits /= 2;
}

function deces(units) {
  for (let u = 0; u < units.nbUnits; u++) {
    units.age[u] += 1;
    if (units.age[u] > 10) {
      randIni(units, u, 0);
    }
  }
}

/**
 * Compute Linear Dependency using genetic algorithm
 * @param {number} nbUnits
 * @param {number} time
 * @param {Matrix} vector // Should be a row vector
 * @param {Matrix} vectorBase
 * @return {Matrix} solution
 * @return best combination
 */
export function positiveLinearDep(nbUnits, time, vectorM, vectorBaseM) {
  let vector = vectorM.to1DArray();
  let vectorBase = vectorBaseM.to2DArray();
  let nbVectors = vectorBase.length;
  let nbPoints = vectorBase[0].length;
  let unitsTab = new units(nbUnits, nbVectors, nbPoints, vector, vectorBase);
  let solution = [];
  for (let v = 0; v < nbVectors; v++) {
    solution.push(0);
  }
  let bestMarkPerYear = [];
  for (let i = 0; i < time; i++) {
    bestMarkPerYear.push(0);
  }

  for (let u = 0; u < nbUnits; u++) {
    randIni(unitsTab, u, 0);
  }
  for (let year = 0; year < time; year++) {
    for (let unit = 0; unit < nbUnits; unit++) {
      mark(unitsTab, unit);
      if (unitsTab.mark[unit] === 0) {
        for (let i = 0; i < nbVectors; i++) {
          solution[i] = unitsTab.map[unit][i];
        }
        return (solution);
      }
    }
    let nextUnits = new units(nbUnits, nbVectors, vector);
    for (let u = 0; u < nbUnits; u++) {
      let father = selection(unitsTab);
      let mother = selection(unitsTab);
      reproduction(unitsTab, nextUnits, father, mother, u);
    }
    for (let unit = 0; unit < nextUnits.nbUnits; unit++) {
      mark(nextUnits, unit);
    }
    merge(unitsTab, nextUnits);
    eugenisme(unitsTab);
    deces(unitsTab);

    for (let unit = 0; unit < unitsTab.nbUnits; unit++) {
      mark(unitsTab, unit);
    }
    unitsTab.sort();

    bestMarkPerYear[year] = unitsTab.mark[0];
  }
  for (let i = 0; i < nbVectors; i++) {
    solution[i] = unitsTab.map[0][i];
  }
  let solutionM = new Matrix([solution]);
  return (solutionM);
}
