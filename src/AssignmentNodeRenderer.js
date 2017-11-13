import moment from 'moment';
import { extendMoment as withMomentRange } from 'moment-range';

withMomentRange(moment);

class AssignmentNodeRenderer {

  constructor(assignments, person, timeline, dimensions) {
    this._distanceFromLine = 16;
    this.timeline = timeline;
    this.person = person;
    this.dimensions = dimensions;
    this.nodeData = assignments
      .filter((it) => timeline.visibleOnTimeline(it))
      .map((it) => timeline.trimEventForTimeline(it))
      .sort(this._compareByStartDate)
      .map(this._toNonOverlappingDates).reduce(this._flatten, [])
      .map(this._extractProjects)
      .filter(this._mergeAdjacentAssignments)
      .map(this._toProjectNodes);
  }

  _toProjectNodes = (assignment) => (
      {
        ...assignment,
        startX: this.timeline.plot(assignment.duration.start),
        midX: this.timeline.plotBetween(assignment.duration.start, assignment.duration.end),
        endX: this.timeline.plot(assignment.duration.end),
      }
  );

  _flatten = (a, b) => a.concat(b);

  _compareByStartDate = (a, b) => (
    a.duration.start === b.duration.start ? 0 : a.duration.start > b.duration.start ? 1 : -1
  );

  _extractProjects = ({ account, project, person, duration }) => ({
    account,
    projects: [project],
    person,
    duration,
  });

  _mergeAdjacentAssignments = function(assignment, i, assignments) {
    const lastAssignment = assignments[i - 1];
    if (lastAssignment && lastAssignment.account === assignment.account) {
      assignments[i] = lastAssignment;
      lastAssignment.duration.end = assignment.duration.end;
      lastAssignment.projects = lastAssignment.projects.concat(assignment.projects);
      return false;
    }
    return true;
  }

  _assignmentsNotOverlapping = (assignment1, assignment2) => (
    !assignment2 || assignment1.duration.end <= assignment2.duration.start
    // !(assignment2 && assignment1.duration.overlaps(assignment2.duration))
  );

  _assignmentsOverlapIncompletely = (assignment1, assignment2) => (
    assignment1.duration.end < assignment2.duration.end
  );

  _withStartingAfter = (assignment, startAfter) => (
    {
      ...assignment,
      duration: moment.range(startAfter.end, assignment.duration.end)
    }
  )

  _withEndingBefore = (assignment, endBefore) => (
    {
      ...assignment,
      duration: moment.range(assignment.duration.start, endBefore.start)
    }
  )

  _toNonOverlappingDates = (assignment, i, assignments) => {
    const nextAssignment = assignments[i + 1];
    // No overlap, return just this assignment.
    if (this._assignmentsNotOverlapping(assignment, nextAssignment)) {
      return [assignment];
    }

    if (this._assignmentsOverlapIncompletely(assignment, nextAssignment)) {
      return [this._withEndingBefore(assignment, nextAssignment.duration)];
    }
    assignments[i + 1] = this._withStartingAfter(assignment, nextAssignment.duration);
    return [this._withEndingBefore(assignment, nextAssignment.duration), nextAssignment];
  };

  render(svgContainer) {
    this.nodes = svgContainer.append('g')
            .attr('class', 'nodes')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('transform', 'translate(0, 20)')
            .selectAll('g')
            .data(this.nodeData)
            .enter()
            .append('g');
    const rects = this.nodes.append('rect');
    this.lines = this.nodes.append('line');

    this.nodes
            .append('text').text((i) => i.account)
            .style('font-weight', '600')
            .style('font-style', 'italic')
            .style('fill', '#fff')
            .attr('y', -this._distanceFromLine)
            .each((d, i, elements) => {
              d.width = elements[i].getBBox().width;
              d.rx = (d.width / 2) + 10;
              d.ry = 30;
            });
    rects
            .style('fill', '#b51557')
            .attr('x', -8)
            .attr('y', -this._distanceFromLine - 20)
            .attr('width', (d) => d.width + 16)
            .attr('height', 30);
    this.lines
            .attr('stroke-width', 5)
            .attr('stroke-linecap', 'round')
            .attr('stroke', '#911146');
  }

  update() {
    const withinY = (y) => Math.max(80, y);
    this.nodes.attr('transform', (d) => (
      `translate(${d.x - d.width/2}, ${d.y = withinY(d.y)})`
    ));
    this.lines
      .attr('x1', (d) => ((d.width/2) - (d.x - d.startX) + 3))
      .attr('x2', (d) => ((d.width/2) + (d.endX - d.x) - 3));
  }
}

export default AssignmentNodeRenderer;
