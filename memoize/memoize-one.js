/**
 * https://github.com/alexreardon/memoize-one
 */

import areInputsEqual from './are-inputs-equal';

function memoizeOne(resultFn, isEqual = areInputsEqual) {
  let lastThis;
  let lastArgs = [];
  let lastResult;
  let calledOnce = false;

  // breaking cache when context (this) or arguments change
  function memoized(this, ...newArgs) {
    if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
      return lastResult;
    }

    // Throwing during an assignment aborts the assignment: https://codepen.io/alexreardon/pen/RYKoaz
    // Doing the lastResult assignment first so that if it throws
    // nothing will be overwritten
    lastResult = resultFn.apply(this, newArgs);
    calledOnce = true;
    lastThis = this;
    lastArgs = newArgs;
    return lastResult;
  }

  return memoized ;
}

export default memoizeOne;
