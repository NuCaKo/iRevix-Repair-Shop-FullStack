import axios from 'axios';
import {
    faMobileAlt,
    faTabletScreenButton,
    faLaptop,
    faHeadphones,
    faClock
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:8080/api';

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
// Repair orders API calls
export const getRepairs = async () => {
    try {
        const res = await axios.get(`${API_URL}/repairs`);
        return res.data;
    } catch (err) {
        console.error('Error fetching repairs:', err);
        throw err;
    }
};

export const addRepair = async (repairData) => {
    try {
        const res = await axios.post(`${API_URL}/repairs`, repairData);
        return res.data;
    } catch (err) {
        console.error('Error adding repair:', err);
        throw err;
    }
};

export const updateRepair = async (id, repairData) => {
    try {
        const res = await axios.put(`${API_URL}/repairs/${id}`, repairData);
        return res.data;
    } catch (err) {
        console.error('Error updating repair:', err);
        throw err;
    }
};

export const deleteRepair = async (id) => {
    try {
        const res = await axios.delete(`${API_URL}/repairs/${id}`);
        return res.data;
    } catch (err) {
        console.error('Error deleting repair:', err);
        throw err;
    }
};

// Support requests API calls
export const getSupportRequests = async () => {
    try {
        const res = await axios.get(`${API_URL}/support`);
        return res.data;
    } catch (err) {
        console.error('Error fetching support requests:', err);
        throw err;
    }
};

export const updateSupportRequest = async (id, requestData) => {
    try {
        const res = await axios.put(`${API_URL}/support/${id}`, requestData);
        return res.data;
    } catch (err) {
        console.error('Error updating support request:', err);
        throw err;
    }
};

// Traffic data API calls
export const getTrafficData = async (period = '7days') => {
    try {
        const res = await axios.get(`${API_URL}/traffic?period=${period}`);
        return res.data;
    } catch (err) {
        console.error('Error fetching traffic data:', err);
        throw err;
    }
};

// Revenue data API calls
export const getRevenueData = async (period = '7days') => {
    try {
        console.log('Fetching revenue data for period:', period);
        const res = await axios.get(`${API_URL}/revenue/${period}`);

        console.log('Response Data:', res.data);
        return res.data;
    } catch (err) {
        console.error('Error fetching revenue data:', err);

        // Always return a valid structure even if there's no data
        return {
            dailyRevenue: [],
            deviceRevenue: [],
            repairsByType: [],
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
            lastMonth: 0,
            repairSalesRatio: '0:0',
            periodLabel: period,
            todayChange: '0%',
            weekChange: '0%',
            monthChange: '0%'
        };
    }
};
// Notification API calls
export const getNotifications = async () => {
    try {
        const res = await axios.get(`${API_URL}/notifications`);
        return res.data;
    } catch (err) {
        console.error('Error fetching notifications:', err);
        throw err;
    }
};
export const getDevices = async () => {
    try {
        const response = await axios.get(`${API_URL}/devices`);;
        return response.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
    }
};

export const getDeviceModels = async (deviceId) => {
    try {
        const res = await axios.get(`${API_URL}/devices/${deviceId}/models`);
        return res.data;
    } catch (err) {
        console.error('Error fetching device models:', err);
        throw err;
    }
};

export const getPartCategories = async (deviceId) => {
    try {
        const res = await axios.get(`${API_URL}/parts/categories/${deviceId}`);
        return res.data;
    } catch (err) {
        console.error('Error fetching part categories:', err);
        throw err;
    }
};

// Get all devices and their models
export const getDevicesAndModels = async () => {
    try {
        const response = await axios.get(`${API_URL}/devices/all`);

        // Map the icon strings to the actual FontAwesome icons
        const iconMapping = {
            'faMobileAlt': faMobileAlt,
            'faTabletScreenButton': faTabletScreenButton,
            'faLaptop': faLaptop,
            'faHeadphones': faHeadphones,
            'faClock': faClock
        };

        // Map the fetched devices to include the correct FontAwesome icon objects
        const mappedDevices = response.data.devices.map(device => ({
            ...device,
            icon: iconMapping[device.icon] || faMobileAlt
        }));

        return {
            devices: mappedDevices,
            deviceModels: response.data.deviceModels
        };
    } catch (error) {
        console.error('Error fetching devices and models:', error);

        // Fallback data if the API call fails
        const fallbackDevices = [
            { id: 'iphone', name: 'iPhone', icon: faMobileAlt },
            { id: 'ipad', name: 'iPad', icon: faTabletScreenButton },
            { id: 'macbook', name: 'MacBook', icon: faLaptop },
            { id: 'airpods', name: 'AirPods', icon: faHeadphones },
            { id: 'applewatch', name: 'Apple Watch', icon: faClock }
        ];

        const fallbackModels = {
            iphone: ['iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS', 'iPhone X'],
            ipad: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad Mini', 'iPad'],
            macbook: ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Pro 13"', 'MacBook Air'],
            airpods: ['AirPods Pro', 'AirPods 3rd Gen', 'AirPods 2nd Gen', 'AirPods Max'],
            applewatch: ['Apple Watch Series 7', 'Apple Watch Series 6', 'Apple Watch SE', 'Apple Watch Series 5']
        };

        return {
            devices: fallbackDevices,
            deviceModels: fallbackModels
        };
    }
};

export const getInventoryParts = async (deviceId, model) => {
    try {
        const response = await axios.get(`${API_URL}/inventory?devices=${deviceId}&models=${encodeURIComponent(model)}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory parts:', error);
        throw error;
    }
};
// Delete inventory item
export const deleteInventoryItem = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/inventory/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        throw error;
    }
};
export const updateInventoryItem = async (id, itemData) => {
    try {
        const response = await axios.put(`${API_URL}/inventory/${id}`, itemData);
        return response.data;
    } catch (error) {
        console.error('Error updating inventory item:', error);
        throw error;
    }
};
export const fetchLowStockItems = async () => {
    try {
        const response = await axios.get(`${API_URL}/inventory`, {
            params: {
                lowStock: 'true'
            }
        });

        // Check if the response has a message (in case no low stock items are found)
        if (response.data.message) {
            console.log(response.data.message);
            return []; // Return empty array if no low stock items
        }

        console.log('Low Stock Items Fetched:', {
            totalCount: response.data.length,
            items: response.data.map(item => ({
                name: item.name,
                stockLevel: item.stockLevel,
                reorderPoint: item.reorderPoint,
                deviceType: item.deviceType,
                modelType: item.modelType,
                percentageOfReorderPoint: ((item.stockLevel / item.reorderPoint) * 100).toFixed(2)
            }))
        });

        return response.data;
    } catch (error) {
        console.error('Low Stock Fetch Error:', {
            message: error.message,
            details: error.response ? error.response.data : 'No response',
            status: error.response ? error.response.status : 'Unknown'
        });

        throw new Error(`Failed to fetch low stock items: ${error.message}`);
    }
};
export const createNotification = async (notificationData) => {
    try {
        const res = await axios.post(`${API_URL}/notifications`, notificationData);
        return res.data;
    } catch (err) {
        console.error('Error creating notification:', err);
        throw err;
    }
};
export const markNotificationAsRead = async (id) => {
    try {
        const res = await axios.put(`${API_URL}/notifications/${id}/read`);

        // Log the response for debugging
        console.log('Mark Notification As Read Response:', {
            data: res.data,
            status: res.status
        });

        return res.data;
    } catch (err) {
        console.error('Error marking notification as read:', err);

        // More detailed error logging
        if (err.response) {
            console.error('Response data:', err.response.data);
            console.error('Response status:', err.response.status);
        }

        throw err;
    }
};


export const markAllNotificationsAsRead = async () => {
    try {
        const res = await axios.put(`${API_URL}/notifications/read-all`);

        // Log the response for debugging
        console.log('Mark All Notifications As Read Response:', {
            data: res.data,
            status: res.status
        });

        return res.data;
    } catch (err) {
        console.error('Error marking all notifications as read:', err);

        // More detailed error logging
        if (err.response) {
            console.error('Response data:', err.response.data);
            console.error('Response status:', err.response.status);
        }

        throw err;
    }
};
export const restockInventoryItem = async (id, quantity) => {
    try {
        const response = await axios.patch(`${API_URL}/inventory/${id}/restock?quantity=${quantity}`);
        return response.data;
    } catch (error) {
        console.error('Error restocking inventory item:', error);
        throw error;
    }
};
