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

export async function getBookings(params = {}) {
  const response = await api.get('/bookings', {
    headers: getAuthorizedHeaders(),
    params,
  });

  return response.data;
}

export async function getBookingById(id) {
  const response = await api.get(`/bookings/${id}`, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function createBooking(payload) {
  const response = await api.post('/bookings', payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}

export async function updateBooking(id, payload) {
  const response = await api.put(`/bookings/${id}`, payload, {
    headers: getAuthorizedHeaders(),
  });

  return response.data;
}
