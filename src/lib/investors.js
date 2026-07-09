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

export async function getInvestors(params = {}) {
  const response = await api.get('/investors', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createInvestor(payload) {
  const response = await api.post('/investors', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updateInvestor(id, payload) {
  const response = await api.put(`/investors/${id}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getInvestments(params = {}) {
  const response = await api.get('/investors/investments', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createInvestment(investorId, payload) {
  const response = await api.post(`/investors/${investorId}/investments`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getInvestorById(id) {
  const response = await api.get(`/investors/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

