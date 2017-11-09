import moment from 'moment';
import { expect } from 'chai';
import IntersectionAlgorithm from './IntersectionAlgorithm';

const intersectionAlgorithm = new IntersectionAlgorithm();

const createDuration = (startDateString, endDateString, props) => ({
  startDate: moment(startDateString),
  endDate: moment(endDateString),
  ...props
});

const assignment = (startDateString, endDateString) => ({
  duration: moment.range(moment(startDateString), moment(endDateString)),
});

describe('Intersection Algorithm', () => {
  it('creates 1 node when 2 nodes intersect', () => {

    const input = [
      assignment('2020-01-01', '2020-01-20'),
      assignment('2020-01-10', '2020-01-30'),
    ];
    const expected = [
      assignment('2020-01-01', '2020-01-30'),
    ];

    expect(intersectionAlgorithm.process(input)).to.deep.equal(expected);
  });

  it('creates 2 nodes when 2 nodes do not intersect', () => {
    const input = [
      assignment('2020-01-01', '2020-01-14'),
      assignment('2020-01-15', '2020-01-30'),
    ];
    const expected = [
      assignment('2020-01-01', '2020-01-14'),
      assignment('2020-01-15', '2020-01-30'),
    ];

    expect(intersectionAlgorithm.process(input)).to.deep.equal(expected);
  });

  it('creates 2 nodes when 2 nodes intersect independantly from another 2 nodes', () => {
    const input = [
      assignment('2020-01-01', '2020-01-20'),
      assignment('2020-01-10', '2020-01-30'),
      assignment('2020-02-01', '2020-02-20'),
      assignment('2020-02-10', '2020-02-28'),
    ];
    const expected = [
      assignment('2020-01-01', '2020-01-30'),
      assignment('2020-02-01', '2020-02-28'),
    ];

    expect(intersectionAlgorithm.process(input)).to.deep.equal(expected);
  });
});
