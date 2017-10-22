import * as d3 from 'd3';
import { ellipseForce } from 'd3-ellipse-force'
import config from './config';
import './index.css';
import Timeline from './Timeline';
import Peopleline from './Peopleline';
import AssignmentNodeRenderer from './AssignmentNodeRenderer'
import AssignmentLineRenderer from './AssignmentLineRenderer';
import JigsawService from './JigsawService';

var margins = {top: 50, right: 280, bottom: 50, left: 280};

var svgContainer = d3.select('body').append('svg');

const jigsawService = new JigsawService(config.apiKey);

const usernames = ['ajham'];

const personPromises = Promise.all(usernames.map((i) => jigsawService.getPersonByUsername(i)));

const assignmentsPromises = personPromises.then((people) =>
  Promise.all(people.map((person) => jigsawService.getAssignmentsForPerson(person)))
).catch(() => {
  svgContainer
    .append('g')
    .attr('transform', 'translate(100, 100)')
    .append('text')
    .style('font-size', '48px')
    .text('😟')
});

Promise.all([personPromises, assignmentsPromises]).then(([people, allAssignments]) => {

  const firstHireDate = (people) => people.map((person) => person.hireDate).sort().pop();
  const timeline = new Timeline(firstHireDate(people), new Date(), margins);
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

  const assignmentNodeRenderers = allAssignments.map((assignments) => (
    new AssignmentNodeRenderer(assignments, timeline, dimensions))
  );

  const assignmentLineRenderers = assignmentNodeRenderers.map((i) => (
    new AssignmentLineRenderer(i.nodeData, timeline, peopleline, dimensions))
  );

  assignmentLineRenderers.forEach((i) => i.render(svgContainer));
  assignmentNodeRenderers.forEach((i) => i.render(svgContainer));

  const flatten = (a, b) => a.concat(b)

  d3.forceSimulation(assignmentNodeRenderers.map((i) => i.nodeData).reduce(flatten))
    .force('x', d3.forceX((d, i) => d.midX).strength(1))
    .force('y', d3.forceY((d) => peopleline.plot(d.person)).strength(0.03))
    .force('collision', ellipseForce())
    .on('tick', () => {
      assignmentNodeRenderers.forEach((i) => i.update());
      assignmentLineRenderers.forEach((i) => i.update());
  });
});
