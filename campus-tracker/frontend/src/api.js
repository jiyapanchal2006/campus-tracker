import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

export const studentAPI = {
  getAll: () => API.get('/students'),
  getById: (id) => API.get(`/students/${id}`),
  update: (id, data) => API.put(`/students/${id}`, data),
  delete: (id) => API.delete(`/students/${id}`),
};

export const courseAPI = {
  getAll: () => API.get('/courses'),
  getById: (id) => API.get(`/courses/${id}`),
  create: (data) => API.post('/courses', data),
  update: (id, data) => API.put(`/courses/${id}`, data),
  delete: (id) => API.delete(`/courses/${id}`),
  enroll: (id, studentId) => API.post(`/courses/${id}/enroll`, { studentId }),
};

export const attendanceAPI = {
  get: (params) => API.get('/attendance', { params }),
  mark: (data) => API.post('/attendance', data),
  bulkMark: (data) => API.post('/attendance/bulk', data),
  summary: (studentId) => API.get(`/attendance/summary/${studentId}`),
};

export const gradeAPI = {
  get: (params) => API.get('/grades', { params }),
  getOne: (studentId, courseId) => API.get(`/grades/${studentId}/${courseId}`),
  save: (data) => API.post('/grades', data),
  update: (id, data) => API.put(`/grades/${id}`, data),
};

export const eventAPI = {
  getAll: () => API.get('/events'),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  delete: (id) => API.delete(`/events/${id}`),
};

export default API;
