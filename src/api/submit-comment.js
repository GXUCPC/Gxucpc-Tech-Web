import http from './http';

export const CommentAPI = {
  submitComment: (data) => {
    return http.post('/discussions', data);
  }
}
