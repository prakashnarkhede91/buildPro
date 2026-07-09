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

export async function getCustomers(params = {}) {
  const response = await api.get('/customers', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createCustomer(payload) {
  const response = await api.post('/customers', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
