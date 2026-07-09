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

export async function createProject(payload) {
  const response = await api.post('/projects', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjects() {
  const response = await api.get('/projects', {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjectById(id) {
  const response = await api.get(`/projects/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjectUnits(id) {
  const response = await api.get(`/projects/${id}/units`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjectAmenities(id) {
  const response = await api.get(`/projects/${id}/amenities`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjectDocuments(id) {
  const response = await api.get(`/projects/${id}/documents`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createProjectAmenity(id, payload) {
  const response = await api.post(`/projects/${id}/amenities`, payload, {
    headers: {
      ...getAuthorizedHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function createProjectDocument(id, payload) {
  const response = await api.post(`/projects/${id}/documents`, payload, {
    headers: {
      ...getAuthorizedHeaders(),
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function deleteProjectDocument(projectId, documentId) {
  const response = await api.delete(`/projects/${projectId}/documents/${documentId}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function deleteProjectAmenity(projectId, amenityId) {
  const response = await api.delete(`/projects/${projectId}/amenities/${amenityId}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createProjectUnit(id, payload) {
  const response = await api.post(`/projects/${id}/units`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updateProjectUnit(projectId, unitId, payload) {
  const response = await api.put(`/projects/${projectId}/units/${unitId}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function deleteProjectUnit(projectId, unitId) {
  const response = await api.delete(`/projects/${projectId}/units/${unitId}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjectTowers(id) {
  const response = await api.get(`/projects/${id}/towers`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createProjectTower(id, payload) {
  const response = await api.post(`/projects/${id}/towers`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getProjectTowerById(projectId, towerId) {
  const response = await api.get(`/projects/${projectId}/towers/${towerId}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updateProjectTower(projectId, towerId, payload) {
  const response = await api.put(`/projects/${projectId}/towers/${towerId}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updateProject(id, payload) {
  const response = await api.put(`/projects/${id}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function deleteProject(id) {
  const response = await api.delete(`/projects/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getLands() {
  const response = await api.get('/masters/lands', {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
