import * as d3 from 'd3';
import moment from 'moment';

class Timeline {
  constructor(startDate, endDate, margins) {
    this.startDate = moment(startDate);
    this.endDate = moment(endDate);
    this.startPoint = margins.left;
    this.endPoint = moment.duration(endDate - startDate).asDays() * 1.5;
    this.scale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([this.startPoint, this.endPoint]);
    this.width = this.endPoint - this.startPoint;
  }

  yearTickValues = () => (
    [this.startDate, ...d3.timeYears(this.startDate, this.endDate, 1), this.endDate]
  );

  visibleOnTimeline = (anEvent) => (
    anEvent.startDate < this.endDate && anEvent.endDate > this.startDate
  );

  trimEventForTimeline = (anEvent) => (
    {
      ...anEvent,
      endDate: anEvent.endDate > this.endDate ? this.endDate : anEvent.endDate,
      startDate: anEvent.startDate < this.startDate ? this.startDate : anEvent.startDate
    }
  );

  halfWayBetween = (from, to) => from + ((to - from) / 2);

  plot = (date) => this.scale(date);

  plotBetween = (startDate, endDate) => (
    this.halfWayBetween(this.plot(startDate), this.plot(endDate))
  )

  renderMonthAxis = () => (
    d3.axisTop(this.scale)
      .ticks(d3.timeMonth)
      .tickFormat(d3.timeFormat('%b'))
  );

  renderYearAxis = () => (
    d3.axisBottom(this.scale)
      .tickSize(0)
      .tickFormat(d3.timeFormat('%Y'))
      .tickValues(this.yearTickValues())
  );

  render(svgContainer) {
    svgContainer.append('g')
      .attr('class', 'month-axis')
      .attr('transform', 'translate(0,60)')
      .call(this.renderMonthAxis());
    svgContainer.append('g')
      .attr('class', 'year-axis')
      .attr('transform', 'translate(0,10)')
      .call(this.renderYearAxis());
  }
}

export default Timeline;
