class AssignmentNodeRenderer {
  constructor(assignments, timeline, dimensions) {
    this.timeline = timeline;
    this.dimensions = dimensions;
    this.nodeData = assignments
      .filter((it) => timeline.visibleOnTimeline(it))
      .map((it) => timeline.trimEventForTimeline(it))
      .sort(this._compareByStartDate)
      .filter(this._mergeWithSameName)
      .map(this._toNonOverlappingDates).reduce(this._flatten)
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

  _mergeWithSameName = function(assignment, i, assignments) {
    const lastAssignment = assignments[i - 1];
    if (lastAssignment && lastAssignment.account === assignment.account) {
      lastAssignment.endDate = assignment.endDate;
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
    const rects = this.nodes.append('rect')

    this.nodes
            .append('text').text((i) => i.account)
            .style('font-weight', '600')
            .style('font-style', 'italic')
            .style('fill', '#fff')
            .attr('y', -12)
            .each((d, i, elements) => {
              d.width = elements[i].getBBox().width;
              d.rx = (d.width / 2) + 10;
              d.ry = 30;
            })
    rects
            .style('fill', '#b51557')
            .attr('x', -8)
            .attr('y', -32)
            .attr('width', (d) => d.width + 16)
            .attr('height', 30);
  }

  update() {
    const withinY = (y) => Math.max(80, y);
    this.nodes.attr('transform', (d) => (
      `translate(${d.x - d.width/2}, ${d.y = withinY(d.y)})`
    ));
  }
}

export default AssignmentNodeRenderer;
