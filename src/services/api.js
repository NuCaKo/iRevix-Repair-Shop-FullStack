import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Repair Order API calls
export const getRepairOrders = async () => {
    return axios.get(`${API_URL}/repair-orders`);
};

export const getRepairOrderById = async (id) => {
    return axios.get(`${API_URL}/repair-orders/${id}`);
};

export const createRepairOrder = async (repairOrder) => {
    return axios.post(`${API_URL}/repair-orders`, repairOrder);
};

export const updateRepairOrder = async (id, repairOrder) => {
    return axios.put(`${API_URL}/repair-orders/${id}`, repairOrder);
};

export const deleteRepairOrder = async (id) => {
    return axios.delete(`${API_URL}/repair-orders/${id}`);
};

// Technician API calls
export const getTechnicians = async () => {
    return axios.get(`${API_URL}/technicians`);
};

export const getTechnicianById = async (id) => {
    return axios.get(`${API_URL}/technicians/${id}`);
};

export const createTechnician = async (technician) => {
    return axios.post(`${API_URL}/technicians`, technician);
};

export const updateTechnician = async (id, technician) => {
    return axios.put(`${API_URL}/technicians/${id}`, technician);
};

export const deleteTechnician = async (id) => {
    return axios.delete(`${API_URL}/technicians/${id}`);
};

export const getActiveTechnicians = async () => {
    return axios.get(`${API_URL}/technicians/active`);
};