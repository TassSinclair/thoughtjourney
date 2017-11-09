import baseMoment from 'moment';
import { extendMoment as withMomentRange } from 'moment-range';

withMomentRange(baseMoment);

class IntersectionAlgorithm {

  _compareMoments = (a, b) => a === b ? 0 : a > b ? 1 : -1;
  _compareByRangeStart = (a, b) => a.start === b.start ? 0 : a.start > b.start ? 1 : -1;

  _processOverlap = (a, b) => {
    const intersection = a.duration.add(b.duration);
    if (intersection) {
      return [{duration: intersection}];
    }
    return [a, b];
  }

  _takeLast = (list, callback, otherwise) => (
    (list && list.length) ? callback(list.pop()) : otherwise
  );

  process(inputs) {
    const durations = inputs;//.map((i) => i.duration);

    return durations.reduce((acc, item) => {
      console.log('comparing', acc, item);
      // const toReturn = acc.concat(this._takeLast(acc, (last) => this._processOverlap(last, item) : [item]));
      const toReturn = acc.concat(this._takeLast(acc, (last) => this._processOverlap(last, item), [item]));
      console.log('returning', toReturn);
      return toReturn;
    }, []);
  }
}

export default IntersectionAlgorithm;
