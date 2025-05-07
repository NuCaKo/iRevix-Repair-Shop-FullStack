import axios from 'axios';
import {
    faMobileAlt,
    faTabletScreenButton,
    faLaptop,
    faHeadphones,
    faClock
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:8080/api';

// Original API functions
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

export const getTrafficData = async (period = '7days') => {
    try {
        const res = await axios.get(`${API_URL}/traffic?period=${period}`);
        return res.data;
    } catch (err) {
        console.error('Error fetching traffic data:', err);
        throw err;
    }
};

export const getRevenueData = async (period = '7days') => {
    try {
        console.log('Fetching revenue data for period:', period);
        const res = await axios.get(`${API_URL}/revenue/${period}`);

        console.log('Response Data:', res.data);
        return res.data;
    } catch (err) {
        console.error('Error fetching revenue data:', err);
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

export const getNotifications = async () => {
    try {
        const res = await axios.get(`${API_URL}/notifications`);
        return res.data;
    } catch (err) {
        console.error('Error fetching notifications:', err);
        throw err;
    }
};

// Updated getDevicesAndModels function with better error handling and fallback data
export const getDevicesAndModels = async () => {
    try {
        console.log('Fetching devices and models from API...');
        const response = await axios.get(`${API_URL}/devices/all`);
        console.log('API response:', response.data);

        // Map FontAwesome icons to device names
        const iconMapping = {
            'faMobileAlt': faMobileAlt,
            'faTabletScreenButton': faTabletScreenButton,
            'faLaptop': faLaptop,
            'faHeadphones': faHeadphones,
            'faClock': faClock
        };

        // Format the response data to include FontAwesome icons
        const mappedDevices = response.data.devices.map(device => ({
            ...device,
            icon: iconMapping[device.icon] || faMobileAlt
        }));

        console.log('Mapped devices with icons:', mappedDevices);
        console.log('Device models:', response.data.deviceModels);

        return {
            devices: mappedDevices,
            deviceModels: response.data.deviceModels
        };
    } catch (error) {
        console.error('Error fetching devices and models:', error);
        console.error('Error details:', error.response?.data || error.message);

        // Fallback data in case of error
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

        console.log('Using fallback data for devices and models');
        return {
            devices: fallbackDevices,
            deviceModels: fallbackModels
        };
    }
};

// Updated getInventoryParts function with better error handling and debugging
export const getInventoryParts = async (deviceId, model) => {
    try {
        console.log(`Fetching inventory parts for device: ${deviceId}, model: ${model}`);

        // Normalize device name to match database format (device_type)
        let deviceName = deviceId.toLowerCase();
        if (deviceName === 'apple watch') deviceName = 'applewatch';

        console.log(`Making API call for device: ${deviceName}, model: ${encodeURIComponent(model)}`);
        const response = await axios.get(`${API_URL}/inventory?deviceType=${deviceName}&modelType=${encodeURIComponent(model)}`);

        console.log(`API response for ${deviceName}/${model}:`, {
            status: response.status,
            itemCount: response.data.length,
            sample: response.data.slice(0, 2)
        });

        // If the response is empty, try a direct database query
        if (response.data.length === 0) {
            console.log('No items found in initial query, trying database fallback');
            try {
                // You would need to implement this endpoint in your backend
                const fallbackResponse = await axios.get(`${API_URL}/inventory/fallback?deviceType=${deviceName}&modelType=${encodeURIComponent(model)}`);

                console.log('Fallback query results:', fallbackResponse.data);
                return fallbackResponse.data;
            } catch (fallbackError) {
                console.error('Error in fallback query:', fallbackError);
                // Return empty array if fallback fails
                return [];
            }
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching inventory parts:', error);
        console.error('Error details:', error.response?.data || error.message);

        // Try to generate mock data for testing purposes
        console.log('Generating mock data for testing...');
        const mockParts = generateMockParts(deviceId, model, 5);
        return mockParts;
    }
};

// Helper function to generate mock data for testing
function generateMockParts(deviceType, model, count = 5) {
    const partTypes = [
        { name: 'Screen Assembly', partNumber: 'SCR-', price: 129.99, description: 'Complete screen assembly' },
        { name: 'Battery', partNumber: 'BAT-', price: 49.99, description: 'Replacement battery' },
        { name: 'Logic Board', partNumber: 'LOG-', price: 199.99, description: 'Replacement logic board' },
        { name: 'Camera Module', partNumber: 'CAM-', price: 69.99, description: 'Replacement camera module' },
        { name: 'Speaker Assembly', partNumber: 'SPK-', price: 29.99, description: 'Replacement speaker assembly' }
    ];

    return partTypes.slice(0, count).map((partType, index) => {
        const devicePrefix = deviceType.replace(/\s/g, '').substring(0, 2).toUpperCase();
        const modelPrefix = model.replace(/\s/g, '').substring(0, 3).toUpperCase();

        return {
            id: `MOCK-${devicePrefix}-${modelPrefix}-${index + 1}`,
            name: `${partType.name} for ${model}`,
            partNumber: `${partType.partNumber}${devicePrefix}${modelPrefix}${index + 1}`,
            price: partType.price,
            description: `${partType.description} for ${model}. Testing mock data.`,
            stockLevel: Math.floor(Math.random() * 20) + 1,
            reorderPoint: 5,
            deviceType: deviceType,
            modelType: model,
            supplier: 'Mock Supplier Inc.'
        };
    });
}

export const getDevices = async () => {
    try {
        const response = await axios.get(`${API_URL}/devices`);
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

export const deleteInventoryItem = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/inventory/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        throw error;
    }
};

// Make sure your api.js has these functions properly defined with the correct URL
export const updateInventoryItem = async (id, itemData) => {
  try {
    console.log('Updating inventory item:', id, itemData); // Add logging
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
        console.log('Mark Notification As Read Response:', {
            data: res.data,
            status: res.status
        });

        return res.data;
    } catch (err) {
        console.error('Error marking notification as read:', err);
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
        console.log('Mark All Notifications As Read Response:', {
            data: res.data,
            status: res.status
        });

        return res.data;
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        if (err.response) {
            console.error('Response data:', err.response.data);
            console.error('Response status:', err.response.status);
        }

        throw err;
    }
};

export const restockInventoryItem = async (id, quantity) => {
  try {
    console.log('Restocking inventory item:', id, quantity); // Add logging
    const response = await axios.patch(`${API_URL}/inventory/${id}/restock?quantity=${quantity}`);
    return response.data;
  } catch (error) {
    console.error('Error restocking inventory item:', error);
    throw error;
  }
};
export const createInventoryItem = async (itemData) => {
    try {
        const response = await axios.post(`${API_URL}/inventory`, itemData);
        return response.data;
    } catch (error) {
        console.error('Error creating inventory item:', error);
        throw error;
    }
};
export const adjustInventoryItemPrice = async (id, price) => {
    try {
        console.log('Adjusting inventory item price:', id, price);

        // Ensure price is a number
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            throw new Error('Invalid price value');
        }

        // Send only price update or get the full item first and then update
        const response = await axios.get(`${API_URL}/inventory/${id}`);
        const currentItem = response.data;

        // Update just the price
        currentItem.price = numericPrice;

        // Put the updated item
        const updateResponse = await axios.put(`${API_URL}/inventory/${id}`, currentItem);

        console.log('Price adjustment response:', updateResponse.data);
        return updateResponse.data;
    } catch (error) {
        console.error('Error adjusting inventory item price:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
};

