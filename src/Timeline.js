import * as d3 from 'd3';
import moment from 'moment';
import { extendMoment as withMomentRange } from 'moment-range';

withMomentRange(moment);

class Timeline {
  constructor(duration, margins) {
    this.duration = duration;
    this.startPoint = margins.left;
    this.endPoint = duration.diff('days') * 1.5;
    this.scale = d3.scaleTime()
      .domain([duration.start, duration.end])
      .range([this.startPoint, this.endPoint]);
    this.width = this.endPoint - this.startPoint;
  }

  yearTickValues = () => (
    [this.duration.start, ...d3.timeYears(this.duration.start, this.duration.end, 1), this.duration.end]
  );

  visibleOnTimeline = (anEvent) => (
    anEvent.duration.start < this.duration.end && anEvent.duration.end > this.duration.start
  );

  trimEventForTimeline = (anEvent) => (
    {
      ...anEvent,
      duration: moment.range(
        anEvent.duration.start < this.duration.start ? this.duration.start : anEvent.duration.start,
        anEvent.duration.end > this.duration.end ? this.duration.end : anEvent.duration.end,
      )
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
