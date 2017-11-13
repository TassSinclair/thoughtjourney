import * as d3 from 'd3';
import { ellipseForce } from 'd3-ellipse-force'
import config from './config';
import './index.css';
import Timeline from './Timeline';
import Peopleline from './Peopleline';
import AssignmentNodeRenderer from './AssignmentNodeRenderer'
import AssignmentLineRenderer from './AssignmentLineRenderer';
import JigsawService from './JigsawService';
import moment from 'moment';
import { extendMoment as withMomentRange } from 'moment-range';

withMomentRange(moment);

var margins = {top: 50, right: 310, bottom: 50, left: 310};

var svgContainer = d3.select('body').append('svg');

const jigsawService = new JigsawService(config.apiKey);

const usernames = ['ajham', 'jgammie', 'rboucher'];

const personPromises = Promise.all(usernames.map((i) => jigsawService.getPersonByUsername(i)));

const assignmentsPromises = personPromises.then((people) =>
  jigsawService.getAssignmentsForPeople(people)
);

Promise.all([personPromises, assignmentsPromises]).then(([people, assignments]) => {

  const compareDates = (a, b) => b.diff(a)
  const firstHireDate = (people) => (
    people.map((person) => person.hireDate).sort(compareDates).pop()
  );
  const timeline = new Timeline(moment.range(firstHireDate(people), new Date()), margins);

  const width = margins.left + timeline.width + margins.right;
  const peopleline = new Peopleline(people, margins, width);
  const height = margins.top + peopleline.height + margins.bottom

  const dimensions = {height, width };
  svgContainer
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
  d3.select('body').style('width', dimensions.width + 'px');

  timeline.render(svgContainer);
  peopleline.render(svgContainer);

  d3.selectAll('.tick>text')
    .style('font-size','14pt')
    .style('font-family','Open Sans');

  const assignmentNodeRenderers = people.map((person) => (
    new AssignmentNodeRenderer(assignments[person.employeeId], person, timeline, dimensions)
  ));

  const assignmentLineRenderers = assignmentNodeRenderers.map((i) => (
    new AssignmentLineRenderer(i.nodeData, i.person, timeline, peopleline, dimensions))
  );

  assignmentLineRenderers.forEach((i) => i.render(svgContainer));
  assignmentNodeRenderers.forEach((i) => i.render(svgContainer));

  const flatten = (acc, i) => acc.concat(i)

  d3.forceSimulation(assignmentNodeRenderers.map((i) => i.nodeData).reduce(flatten))
    .force('x', d3.forceX((d, i) => d.midX).strength(1))
    .force('y', d3.forceY((d) => peopleline.plot(d.person)).strength(0.08))
    .force('collision', ellipseForce())
    .on('tick', () => {
      assignmentNodeRenderers.forEach((i) => i.update());
      assignmentLineRenderers.forEach((i) => i.update());
  });
});
