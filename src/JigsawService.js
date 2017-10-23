import axios from 'axios';
import moment from 'moment';

class JigsawService {

  constructor(apiKey) {
    this.api = axios.create({
      baseURL: 'https://jigsaw.thoughtworks.net/api/',
      timeout: 5000,
      headers: {'Authorization': apiKey}
    });
    this.api.interceptors.response.use((response) => response.data);
  }

  getAssignmentsForPerson(person) {
    return this.api.get(`assignments?employee_ids=${person.id}`)
      .then((data) => data.map((datum) => ({
        startDate: moment(datum.duration.startsOn, 'DD-MM-YYYY'),
        endDate: moment(datum.duration.endsOn, 'DD-MM-YYYY'),
        account: datum.account.name,
        project: datum.project.name,
        person,
      })));
  }

  getPersonByUsername(id) {
    return this.api.get(`people/${id}`)
      .then((data) => ({
        id: data.employeeId,
        user: data.loginName,
        name: data.preferredName,
        picture: data.picture.url,
        hireDate: moment(data.hireDate, 'YYYY-MM-DD'),
      }));
  }
}

export default JigsawService
