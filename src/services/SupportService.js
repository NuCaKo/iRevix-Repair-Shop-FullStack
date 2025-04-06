// SupportService.js
// A shared service for handling support requests between user and admin interfaces

class SupportService {
    constructor() {
        this.init();
    }

    init() {
        // Initialize from localStorage if available
        const storedRequests = localStorage.getItem('supportRequests');
        this.supportRequests = storedRequests ? JSON.parse(storedRequests) : [];

        // Initialize last ID
        this.lastId = this.supportRequests.length > 0
            ? Math.max(...this.supportRequests.map(req => req.id))
            : 0;
    }

    // Save current state to localStorage
    saveToStorage() {
        localStorage.setItem('supportRequests', JSON.stringify(this.supportRequests));
    }

    // Get all support requests
    getAllRequests() {
        return this.supportRequests;
    }

    // Get requests for a specific user
    getUserRequests(userId) {
        return this.supportRequests.filter(req => req.userId === userId);
    }

    // Get a specific request by ID
    getRequestById(id) {
        return this.supportRequests.find(req => req.id === id);
    }

    // Create a new support request
    createRequest(userId, username, requestData) {
        const newId = ++this.lastId;

        const newRequest = {
            id: newId,
            userId,
            customer: username,
            title: requestData.title,
            description: requestData.description,
            category: requestData.category.charAt(0).toUpperCase() + requestData.category.slice(1),
            priority: requestData.priority.charAt(0).toUpperCase() + requestData.priority.slice(1),
            status: "Open",
            isRead: false, // For admin notification
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            messages: [
                {
                    id: 1,
                    sender: "system",
                    message: "Your request has been received. A support agent will contact you shortly.",
                    date: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    })
                }
            ]
        };

        this.supportRequests.push(newRequest);
        this.saveToStorage();

        return newRequest;
    }

    // Add a message to a request
    addMessage(requestId, senderType, senderName, messageText) {
        const request = this.getRequestById(requestId);

        if (!request) {
            return null;
        }

        const newMessage = {
            id: request.messages.length + 1,
            sender: senderType, // "customer", "agent", or "system"
            message: messageText,
            date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            })
        };

        // For agent messages, add the agent name
        if (senderType === "agent") {
            newMessage.agentName = senderName;
        }

        // Update request status if it's not already closed
        if (request.status !== "Closed") {
            if (senderType === "agent") {
                request.status = "In Progress";
            }

            // Mark as unread for the other party
            if (senderType === "agent") {
                request.isReadByCustomer = false;
            } else if (senderType === "customer") {
                request.isRead = false;
            }
        }

        request.messages.push(newMessage);
        this.saveToStorage();

        return request;
    }

    // Mark a request as read by admin
    markAsReadByAdmin(requestId) {
        const request = this.getRequestById(requestId);

        if (request) {
            request.isRead = true;
            this.saveToStorage();
        }

        return request;
    }

    // Mark a request as read by customer
    markAsReadByCustomer(requestId) {
        const request = this.getRequestById(requestId);

        if (request) {
            request.isReadByCustomer = true;
            this.saveToStorage();
        }

        return request;
    }

    // Close a support request
    closeRequest(requestId) {
        const request = this.getRequestById(requestId);

        if (request) {
            request.status = "Closed";

            // Add a system message about closure
            request.messages.push({
                id: request.messages.length + 1,
                sender: "system",
                message: "This support request has been marked as resolved and closed.",
                date: new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                })
            });

            this.saveToStorage();
        }

        return request;
    }

    // Get unread count for admin
    getUnreadCountForAdmin() {
        return this.supportRequests.filter(req => !req.isRead).length;
    }

    // Get unread count for a specific user
    getUnreadCountForUser(userId) {
        return this.supportRequests.filter(req =>
            req.userId === userId && !req.isReadByCustomer
        ).length;
    }
}

// Create a singleton instance
const supportService = new SupportService();

export default supportService;