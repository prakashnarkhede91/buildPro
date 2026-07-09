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

export async function getPurchaseOrders(params = {}) {
  const response = await api.get('/purchase/orders', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createPurchaseOrder(payload) {
  const response = await api.post('/purchase/orders', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getPurchaseOrderById(id) {
  const response = await api.get(`/purchase/orders/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updatePurchaseOrder(id, payload) {
  const response = await api.put(`/purchase/orders/${id}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getPurchaseRequisitions(params = {}) {
  const response = await api.get('/purchase/requisitions', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function createPurchaseRequisition(payload) {
  const response = await api.post('/purchase/requisitions', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function approvePurchaseRequisition(id) {
  const response = await api.put(`/purchase/requisitions/${id}/approve`, { action: "approve" }, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getPurchaseRequisitionById(id) {
  const response = await api.get(`/purchase/requisitions/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function rejectPurchaseRequisition(id) {
  const response = await api.put(`/purchase/requisitions/${id}/approve`, { action: "reject" }, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createGRN(payload) {
  const response = await api.post('/purchase/grn', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function getGRNs(params = {}) {
  const response = await api.get('/purchase/grn', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function getGRNById(id) {
  const response = await api.get(`/purchase/grn/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}









