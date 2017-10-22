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

  render(svgContainer) {
    svgContainer.append('g')
      .attr('class', 'person-axis person-axis-left')
      .attr('transform', `translate(${this.axisWidth}, 20)`)
      .call(d3.axisLeft(this.scale));

    svgContainer.append('g')
      .attr('class', 'person-axis person-axis-right')
      .attr('transform', `translate(${this.spanX - this.axisWidth}, 20)`)
      .call(d3.axisRight(this.scale));

    svgContainer.append('defs').append('clipPath')
      .attr('id', 'circleClip1')
      .append('circle')
      .attr('stroke', '#000000')
      .attr('cx', -28)
      .attr('r', 20)
      svgContainer.select('defs').append('clipPath')
        .attr('id', 'circleClip2')
        .append('circle')
        .attr('stroke', '#000000')
        .attr('cx', 28)
        .attr('r', 20)

    svgContainer.selectAll('.person-axis-left .tick text').attr('x', -55);
    svgContainer.selectAll('.person-axis-right .tick text').attr('x', 55);

    svgContainer.selectAll('.person-axis-left .tick')
          .data(this.people)
          .append("svg:image")
          .attr("xlink:href", function (d) { return d.picture ; })
          .attr("width", 40)
          .attr("height", 40)
          .attr("x", -48)
          .attr('clip-path', 'url(#circleClip1)')
          .attr("y", -20);

          svgContainer.selectAll('.person-axis-right .tick')
                .data(this.people)
                .append("svg:image")
                .attr("xlink:href", function (d) { return d.picture ; })
                .attr("width", 40)
                .attr("height", 40)
                .attr("x", 8)
                .attr('clip-path', 'url(#circleClip2)')
                .attr("y", -20);


  }
}

export default Peopleline;
