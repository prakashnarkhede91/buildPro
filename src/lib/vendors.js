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

export async function getVendors(params = {}) {
  const response = await api.get('/purchase/vendors', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createVendor(payload) {
  const response = await api.post('/purchase/vendors', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
