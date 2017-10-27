import axios from 'axios';
import moment from 'moment';

class JigsawService {

  constructor(apiKey) {
    this.api = axios.create({
      baseURL: 'https://jigsaw.thoughtworks.net/api/',
      timeout: 5000,
      headers: {'Authorization': apiKey}
    });
  }

  _getAssignments(params, page = 1, previousData = []) {
    return this.api.get('assignments', {params: {...params, page }})
      .then((response) => (
        page < response.headers['x-total-pages'] ?
        this._getAssignments(params, page + 1, response.data) : response.data
      ))
      .then((data) => previousData.concat(data));
  };

  getAssignmentsForPeople(people) {
    const employeeIdGroups = people.reduce((acc, person) => (acc[person.employeeId] = []) && acc, {});

    return this._getAssignments({ 'employee_ids' : people.map((i) => i.employeeId)})
      .then((data) => data.map((datum) => ({
        startDate: moment(datum.duration.startsOn, 'DD-MM-YYYY'),
        endDate: moment(datum.duration.endsOn, 'DD-MM-YYYY'),
        account: datum.account.name,
        project: {id: datum.project.id, name: datum.project.name},
        person: people.find((i) => i.employeeId === datum.consultant.employeeId)
        }),
      ).reduce((acc, assignment) => {
        acc[assignment.person.employeeId].push(assignment);
        return acc;
      }, employeeIdGroups));
  }

  getPersonByUsername(id) {
    return this.api.get(`people/${id}`)
      .then(({data}) => ({
        employeeId: data.employeeId,
        username: data.loginName,
        name: data.preferredName,
        picture: data.picture.url,
        hireDate: moment(data.hireDate, 'YYYY-MM-DD'),
      }));
  }
}

export default JigsawService
