import * as d3 from 'd3';

class AssignmentLineRenderer {

  constructor(lineNodes, timeline, peopleline, dimensions) {
    this._peopleAxisOffset = 40;
    this.timeline = timeline;
    this.peopleline = peopleline;
    this.dimensions = dimensions;
    this.lineNodes = lineNodes;
    this._allLines = this._buildAllLines(lineNodes, lineNodes[0].person);

  }

  _buildLine = d3.line()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveMonotoneX);

  _lineStart = (person) => (
    {
      midX: this.timeline.startPoint - this._peopleAxisOffset,
      y: this.peopleline.plot(person),
      endX: this.timeline.startPoint,
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
          return [{x: this.source.midX, y: this.source.y},
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
    this.lines = svgContainer.append('g')
            .attr('class', 'lines')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('transform', 'translate(0, 20)')
            .selectAll('path')
            .data(this._allLines)
            .enter()
            .append('path')
            .attr('stroke', '#7a7c81')
            .attr('stroke-width', 1)
            .attr('fill', 'none');
  }

  update() {
    this.lines &&
      this.lines.attr('d', (d) => this._buildLine(d.segments));
  }
}

export default AssignmentLineRenderer;
