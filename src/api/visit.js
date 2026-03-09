import http from './http';

export const VisitAPI = {
  submitVisit: (data) => {
    return http.post('/visit', data);
  }
}
