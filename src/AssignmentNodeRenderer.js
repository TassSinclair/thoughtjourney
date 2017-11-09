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
        startX: this.timeline.plot(assignment.startDate),
        midX: this.timeline.plotBetween(assignment.startDate, assignment.endDate),
        endX: this.timeline.plot(assignment.endDate),
      }
  );

  _flatten = (a, b) => a.concat(b);

  _compareByStartDate = (a, b) => (
    a.startDate === b.startDate ? 0 : a.startDate > b.startDate ? 1 : -1
  );

  _extractProjects = ({ startDate, endDate, account, project, person }) => ({
    startDate,
    endDate,
    account,
    projects: [project],
    person,
  });

  _mergeAdjacentAssignments = function(assignment, i, assignments) {
    const lastAssignment = assignments[i - 1];
    if (lastAssignment && lastAssignment.account === assignment.account) {
      assignments[i] = lastAssignment;
      lastAssignment.endDate = assignment.endDate;
      lastAssignment.projects = lastAssignment.projects.concat(assignment.projects);
      return false;
    }
    return true;
  }

  _assignmentsNotOverlapping = (assignment1, assignment2) => (
    !assignment2 || assignment1.endDate <= assignment2.startDate
  );

  _assignmentStartBeforeEndOverlap = (assignment1, assignment2) => (
    assignment1.endDate < assignment2.endDate
  );

  _withStartDate = (assignment, startDate) => (
    { ...assignment, startDate }
  )

  _withEndDate = (assignment, endDate) => (
    { ...assignment, endDate }
  )

  _toNonOverlappingDates = (assignment, i, assignments) => {
    const nextAssignment = assignments[i + 1];

    if (this._assignmentsNotOverlapping(assignment, nextAssignment)) {
      return [assignment];
    }

    if (this._assignmentStartBeforeEndOverlap(assignment, nextAssignment)) {
      return [this._withEndDate(assignment, nextAssignment.startDate)];
    }
    assignments[i + 1] = this._withStartDate(assignment, nextAssignment.endDate);
    return [this._withEndDate(assignment, nextAssignment.startDate), nextAssignment];
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
