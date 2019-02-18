import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';

import { Matrix, linearDependencies, positiveLinearDep } from '../..';

expect.extend({ toBeDeepCloseTo });

describe('Linear Dependencies', () => {
  it('should compute the rows dependencies', () => {
    const A = new Matrix([
      [2, 0, 0, 1],
      [0, 1, 6, 0],
      [0, 3, 0, 1],
      [0, 0, 1, 0],
      [0, 1, 2, 0]
    ]);
    const dependencies = linearDependencies(A);
    expect(dependencies.to2DArray()).toBeDeepCloseTo(
      [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 4, 1],
        [0, 0, 0, 0, 0],
        [0, 0.25, 0, 0, -0.25],
        [0, 1, 0, -4, 0]
      ],
      3
    );
  });
});

describe('Positive Linear Dependencies', () => {
  it('Positive Linear Dependencies I', () => {
    // Should find the optimal solution, with only positive terms
    let vector = new Matrix([[0, 1, 1, 0, 0, 0]]);
    let vectorBase = new Matrix([
      [1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 0, 0]
    ]);
    let result = new Matrix([[0, 0, 1, 0]]);
    expect(positiveLinearDep(20, 1000, vector, vectorBase)).toBeDeepCloseTo(result);
  });
});
