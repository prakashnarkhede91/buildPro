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

export async function getPayments(params = {}) {
  const response = await api.get('/payments', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function getPaymentStagesByBooking(bookingId) {
  const response = await api.get(`/payments/stages/${bookingId}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createPaymentStages(payload) {
  const response = await api.post('/payments/stages', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function deletePaymentStage(id) {
  const response = await api.delete(`/payments/stages/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createPayment(payload) {
  const response = await api.post('/payments', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
