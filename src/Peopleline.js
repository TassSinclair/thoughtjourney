import * as d3 from 'd3';

class Peopleline {
  constructor(people, margins, spanX) {
    this.people = people;
    this.height = people.length * 200;
    this.spanX = spanX;
    this.margins = margins;
    this.axisWidth = 240;
    this.scale = d3.scalePoint()
      .domain(people.map((person) => person.name))
      .range([margins.top, margins.top + this.height])
      .padding(0.3);
  }

  plot = (person) => this.scale(person.name);

  renderImagePattern(svgContainer, person) {
    svgContainer.select('defs')
          .append('pattern')
          .attr('id', `picture-${person.username}`)
          .attr('height', '100%')
          .attr('width', '100%')
          .attr('patternContentUnits', 'objectBoundingBox')
          .attr('viewBox', '0 0 1 1')
          .attr('preserveAspectRatio', 'xMidYMid slice')
          .append('svg:image')
          .attr('xlink:href', person.picture)
          .attr('width', 1)
          .attr('height', 1)
          .attr('preserveAspectRatio', 'xMidYMid slice');
  }

  renderAxisSide(svgContainer, side) {
    const vars = (side === 'left') ?
      {posX: this.axisWidth, scale: d3.axisLeft(this.scale), imageX: -28, textX: -55} :
      {posX: this.spanX - this.axisWidth, scale: d3.axisRight(this.scale), imageX: 28, textX: 55};

    svgContainer.append('g')
      .attr('class', `person-axis person-axis-${side}`)
      .attr('transform', `translate(${vars.posX}, 20)`)
      .call(vars.scale);
    svgContainer.selectAll(`.person-axis-${side} .tick`)
          .data(this.people)
          .append('circle')
          .attr('r', 20)
          .attr('cx', vars.imageX)
          .attr('fill', (d) => `url(#picture-${d.username})`)

    svgContainer.selectAll(`.person-axis-${side} .tick text`)
          .attr('x', vars.textX)
  }

  render(svgContainer) {
    svgContainer.append('defs');
    this.people.forEach((person) => this.renderImagePattern(svgContainer, person));
    this.renderAxisSide(svgContainer, 'left');
    this.renderAxisSide(svgContainer, 'right');
  }
}

export default Peopleline;
