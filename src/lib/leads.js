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

export async function getLeads(params = {}) {
  const response = await api.get('/leads', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function getLeadById(id) {
  const response = await api.get(`/leads/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updateLead(id, payload) {
  const response = await api.put(`/leads/${id}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createLeadFollowUp(id, payload) {
  const response = await api.post(`/leads/${id}/follow-ups`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function deleteLead(id) {
  const response = await api.delete(`/leads/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createLead(payload) {
  const response = await api.post('/leads', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
