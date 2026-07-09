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

export async function getLands() {
  const response = await api.get('/masters/lands', {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createLand(payload) {
  const response = await api.post('/masters/lands', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getLandDocuments(id) {
  const response = await api.get(`/masters/lands/${id}/documents`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function uploadLandDocument(id, formData) {
  const response = await api.post(`/masters/lands/${id}/documents`, formData, {
    headers: {
      ...getAuthorizedHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
