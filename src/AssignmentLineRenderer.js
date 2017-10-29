import * as d3 from 'd3';

class AssignmentLineRenderer {

  constructor(lineNodes, person, timeline, peopleline, dimensions) {
    this._peopleAxisOffset = 70;
    this.person = person;
    this.timeline = timeline;
    this.peopleline = peopleline;
    this.dimensions = dimensions;
    this.lineNodes = lineNodes;
    this._allLines = this._buildAllLines(lineNodes, person);
  }

  _asCurve = d3.line()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveMonotoneX);

  _lineStart = (person) => (
    {
      midX: this.timeline.plot(person.hireDate),
      y: this.peopleline.plot(person),
      endX: this.timeline.plot(person.hireDate),
    }
  );

  _lineEnd = (person) => (
    {
      startX: this.timeline.endPoint,
      y: this.peopleline.plot(person),
      midX: this.timeline.endPoint + this._peopleAxisOffset,
    }
  );

  _toLineSegment = (assignment, i, assignments) => (
    {
      source: assignment,
      target: assignments[i + 1] || assignment,
      get segments() {
          return [
            {x: this.source.midX, y: this.source.y},
            {x: this.source.endX, y: this.source.y},
            {x: this.target.startX, y: this.target.y},
            {x: this.target.midX, y: this.target.y},
          ];
      }
    }
  );

  _buildAllLines = (lineNodes, person) =>
    [
      this._lineStart(person),
      ...lineNodes,
      this._lineEnd(person)
    ].map(this._toLineSegment).slice(0, -1)

  render(svgContainer) {
    const lines = svgContainer.append('g')
            .attr('class', 'lines')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('transform', 'translate(0, 20)')
    this.projectLines = lines
            .selectAll('path')
            .data(this._allLines)
            .enter()
            .append('path')
            .attr('stroke', '#7a7c81')
            .attr('stroke-width', 3)
            .attr('fill', 'none');

    this.preHireLine = lines
            .append('line')
            .attr('x1', this.timeline.startPoint - this._peopleAxisOffset)
            .attr('y1', this.peopleline.plot(this.person))
            .attr('y2', this.peopleline.plot(this.person))
            .attr('stroke', '#7a7c81')
            .attr('stroke-dasharray', '10,20')
            .attr('stroke-width', 3)
            .attr('fill', 'none');
  }

  update() {
    this.projectLines.attr('d', (d) => this._asCurve(d.segments));
    this.preHireLine.attr('x2', (d) => (this.timeline.plot(this.person.hireDate)));
  }
}

export default AssignmentLineRenderer;
