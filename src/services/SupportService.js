import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

class SupportService {
    constructor() {
        // No need to initialize from localStorage anymore
    }

    async getAllRequests() {
        try {
            const response = await axios.get(`${API_URL}/support`);
            return response.data;
        } catch (error) {
            console.error('Error fetching support requests:', error);
            return [];
        }
    }

    async getUserRequests(userId) {
        try {
            const response = await axios.get(`${API_URL}/support/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching support requests for user ${userId}:`, error);
            return [];
        }
    }

    async getRequestById(id) {
        try {
            const response = await axios.get(`${API_URL}/support/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching support request ${id}:`, error);
            return null;
        }
    }

    async createRequest(userId, username, requestData) {
        try {
            const supportRequest = {
                userId: userId,
                customer: username,
                title: requestData.title,
                description: requestData.description,
                category: requestData.category.charAt(0).toUpperCase() + requestData.category.slice(1),
                priority: requestData.priority.charAt(0).toUpperCase() + requestData.priority.slice(1),
                email: requestData.email || '',
                // Status, isRead, and date will be set by the backend
            };

            const response = await axios.post(`${API_URL}/support`, supportRequest);
            return response.data;
        } catch (error) {
            console.error('Error creating support request:', error);
            throw error;
        }
    }

    async addMessage(requestId, senderType, senderName, messageText) {
        try {
            const message = {
                sender: senderType, // "customer", "agent", or "system"
                message: messageText,
                // Date will be set by the backend
            };

            if (senderType === "agent") {
                message.agentName = senderName;
            }

            const response = await axios.post(`${API_URL}/support/${requestId}/messages`, message);
            return response.data;
        } catch (error) {
            console.error(`Error adding message to support request ${requestId}:`, error);
            return null;
        }
    }

    async markAsReadByAdmin(requestId) {
        try {
            const response = await axios.put(`${API_URL}/support/${requestId}/read`);
            return response.data;
        } catch (error) {
            console.error(`Error marking support request ${requestId} as read by admin:`, error);
            return null;
        }
    }

    async markAsReadByCustomer(requestId) {
        try {
            const response = await axios.put(`${API_URL}/support/${requestId}/read-by-customer`);
            return response.data;
        } catch (error) {
            console.error(`Error marking support request ${requestId} as read by customer:`, error);
            return null;
        }
    }

    async closeRequest(requestId) {
        try {
            const response = await axios.put(`${API_URL}/support/${requestId}/close`);
            return response.data;
        } catch (error) {
            console.error(`Error closing support request ${requestId}:`, error);
            return null;
        }
    }

    async markAllAsReadByAdmin() {
        try {
            const response = await axios.put(`${API_URL}/support/read-all`);
            return response.data.count ?
                await this.getAllRequests() : // Refresh the list after successful update
                [];
        } catch (error) {
            console.error('Error marking all support requests as read by admin:', error);
            return [];
        }
    }

    async getUnreadCountForAdmin() {
        try {
            const response = await axios.get(`${API_URL}/support/count/unread`);
            return response.data.count;
        } catch (error) {
            console.error('Error getting unread count for admin:', error);
            return 0;
        }
    }

    async getUnreadCountForUser(userId) {
        try {
            // This endpoint isn't in your current controller, so we'll need to add it
            // For now, we'll fetch all the user's requests and count the unread ones
            const response = await axios.get(`${API_URL}/support/user/${userId}`);
            return response.data.filter(req => !req.isReadByCustomer).length;
        } catch (error) {
            console.error(`Error getting unread count for user ${userId}:`, error);
            return 0;
        }
    }

    // Additional method to delete a support request
    async deleteRequest(requestId) {
        try {
            const response = await axios.delete(`${API_URL}/support/${requestId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting support request ${requestId}:`, error);
            return null;
        }
    }
}

const supportService = new SupportService();
export default supportService;