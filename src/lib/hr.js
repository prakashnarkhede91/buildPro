import api from './api';
import { getAuthToken } from './session';

function getAuthorizedHeaders() {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Login token not found. Please login again.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getEmployees(params = {}) {
  const response = await api.get('/hr/employees', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createEmployee(payload) {
  const response = await api.post('/hr/employees', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
