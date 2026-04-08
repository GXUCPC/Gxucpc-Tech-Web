import http from './http';

export const CompetitionAPI = {
  // 获取列表用 get
  getCompetitionList: () => {
    return http.get('/competition'); // 确保路径和后端 @Controller 一致
  },

  // 提交报名用 post
  applyCompetition: (data) => {
    return http.post('/competition/apply', data);
  },

  deleteCompetition: (id) => {
    return http.delete(`/competition/${id}`);
  },

  addCompetition: (data) => {
    return http.post('/competition', data);
  },

  // 获取比赛报名人员记录
  getRecords: (competition_id) => {
    return http.get(`/competition/records?competition_id=${competition_id}`);
  },

  // 删除特定参数选手
  deleteParticipant: (competition_id, student_id) => {
    return http.delete(`/competition/${competition_id}/participant/${student_id}`);
  },

  // 发送验证码
  sendCode: (data) => {
    return http.post('/competition/send_code', data);
  },
}
