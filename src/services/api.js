import axios from 'axios';

// API Base URL configuration
// In development, use localhost:5001
// In production, use the Lambda URL
const isProduction = import.meta.env.PROD || 
                    (typeof window !== 'undefined' && 
                     (window.location.hostname.includes('cloudfront.net') || 
                      window.location.hostname.includes('amazonaws.com')));

const API_BASE_URL = isProduction
  ? 'https://phslqkfk47zphdmvbufwi3oiz40ugscg.lambda-url.us-east-1.on.aws/api' // Production - Lambda URL
  : 'http://127.0.0.1:5001/api'; // Development - local backend

console.log(`[API] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[API] Using API URL: ${API_BASE_URL}`);

// Enable debug mode
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

// Debug logging function
const logDebug = (message, data) => {
  if (DEBUG) {
    console.log(`[API Debug] ${message}`, data);
  }
};

// Create axios instance with appropriate config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(config => {
  logDebug(`Request: ${config.method.toUpperCase()} ${config.url}`, {
    headers: config.headers,
    data: config.data,
    params: config.params
  });
  return config;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    logDebug(`Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    if (error.response) {
      logDebug(`Error Response: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      logDebug('Error Request (No Response):', error.request);
    } else {
      logDebug('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

// --- Generic Request Functions ---

export const get = async (endpoint, params = {}) => {
  try {
    logDebug(`Starting GET request to ${endpoint}`, params);
    const response = await apiClient.get(endpoint, { params });
    logDebug(`GET ${endpoint} successful`, { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logDebug(`GET ${endpoint} failed`, error.response?.data || error.message);
    console.error(`GET ${endpoint} failed:`, error.response || error.message);
    throw error; // Re-throw error for components to handle
  }
};

export const post = async (endpoint, data) => {
  try {
    logDebug(`Starting POST request to ${endpoint}`, data);
    const response = await apiClient.post(endpoint, data);
    logDebug(`POST ${endpoint} successful`, { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logDebug(`POST ${endpoint} failed`, error.response?.data || error.message);
    console.error(`POST ${endpoint} failed:`, error.response || error.message);
    throw error;
  }
};

export const put = async (endpoint, data) => {
  try {
    logDebug(`Starting PUT request to ${endpoint}`, data);
    const response = await apiClient.put(endpoint, data);
    logDebug(`PUT ${endpoint} successful`, { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logDebug(`PUT ${endpoint} failed`, error.response?.data || error.message);
    console.error(`PUT ${endpoint} failed:`, error.response || error.message);
    throw error;
  }
};

export const del = async (endpoint) => {
  try {
    logDebug(`Starting DELETE request to ${endpoint}`);
    const response = await apiClient.delete(endpoint);
    logDebug(`DELETE ${endpoint} successful`, { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logDebug(`DELETE ${endpoint} failed`, error.response?.data || error.message);
    console.error(`DELETE ${endpoint} failed:`, error.response || error.message);
    throw error;
  }
};

// --- Resource-Specific Functions (Examples) ---

// Patients
export const getPatients = () => get('/patients');
export const getPatient = (id) => get(`/patients/${id}`);
export const createPatient = (data) => post('/patients', data);
export const updatePatient = (id, data) => put(`/patients/${id}`, data);
export const deletePatient = (id) => del(`/patients/${id}`);

// Providers
export const getProviders = () => get('/providers');
export const getProvider = (id) => get(`/providers/${id}`);
export const createProvider = (data) => post('/providers', data);
export const updateProvider = (id, data) => put(`/providers/${id}`, data);
export const deleteProvider = (id) => del(`/providers/${id}`);

// Services
export const getServices = () => get('/services');
export const getService = (id) => get(`/services/${id}`);
export const createService = (data) => post('/services', data);
export const updateService = (id, data) => put(`/services/${id}`, data);
export const deleteService = (id) => del(`/services/${id}`);

// Appointments
export const getAppointments = (params = {}) => get('/appointments', params);
export const getAppointment = (id) => get(`/appointments/${id}`);
export const createAppointment = (data) => post('/appointments', data);
export const updateAppointment = (id, data) => put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => del(`/appointments/${id}`);

// Claims
export const getClaims = (params = {}) => get('/claims', params);
export const getClaim = (id) => get(`/claims/${id}`);
export const createClaim = (data) => post('/claims', data);
export const updateClaim = (id, data) => put(`/claims/${id}`, data);
export const deleteClaim = (id) => del(`/claims/${id}`);

// Audit-specific function
export const auditClaim = async (id, data) => {
  logDebug(`Special audit request debug for claim ${id}`, data);
  
  // Extract model_id from data to pass as query parameter
  const { model_id, ...bodyData } = data || {};
  const params = {};
  
  if (model_id) {
    params.model_id = model_id;
    logDebug(`Using model_id as query parameter: ${model_id}`);
  }
  
  try {
    logDebug(`Starting POST request to /claims/${id}/audit with params`, params);
    const response = await apiClient.post(`/claims/${id}/audit`, bodyData, { params });
    logDebug(`POST /claims/${id}/audit successful`, { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logDebug(`POST /claims/${id}/audit failed`, error.response?.data || error.message);
    console.error(`POST /claims/${id}/audit failed:`, error.response || error.message);
    throw error;
  }
};

// Payments (Note: create usually nested under claim)
export const getPaymentsForClaim = (claimId) => get(`/claims/${claimId}/payments`);
export const getPayment = (id) => get(`/payments/${id}`);
export const createPaymentForClaim = (claimId, data) => post(`/claims/${claimId}/payments`, data);
export const updatePayment = (id, data) => put(`/payments/${id}`, data);
export const deletePayment = (id) => del(`/payments/${id}`);

export default apiClient; 
