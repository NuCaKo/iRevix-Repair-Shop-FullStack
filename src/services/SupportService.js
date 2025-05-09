
class SupportService {
    constructor() {
        this.init();
    }

    init() {
        const storedRequests = localStorage.getItem('supportRequests');
        this.supportRequests = storedRequests ? JSON.parse(storedRequests) : [];
        this.lastId = this.supportRequests.length > 0
            ? Math.max(...this.supportRequests.map(req => req.id))
            : 0;
    }
    saveToStorage() {
        localStorage.setItem('supportRequests', JSON.stringify(this.supportRequests));
    }
    getAllRequests() {
        return this.supportRequests;
    }
    getUserRequests(userId) {
        return this.supportRequests.filter(req => req.userId === userId);
    }
    getRequestById(id) {
        return this.supportRequests.find(req => req.id === id);
    }
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
        if (senderType === "agent") {
            newMessage.agentName = senderName;
        }
        if (request.status !== "Closed") {
            if (senderType === "agent") {
                request.status = "In Progress";
            }
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
    markAsReadByAdmin(requestId) {
        const request = this.getRequestById(requestId);

        if (request) {
            request.isRead = true;
            this.saveToStorage();
        }

        return request;
    }
    markAsReadByCustomer(requestId) {
        const request = this.getRequestById(requestId);

        if (request) {
            request.isReadByCustomer = true;
            this.saveToStorage();
        }

        return request;
    }
    closeRequest(requestId) {
        const request = this.getRequestById(requestId);

        if (request) {
            request.status = "Closed";
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
    markAllAsReadByAdmin() {
        console.log('SupportService: Marking all support requests as read');

        // Find all unread requests
        const unreadRequests = this.supportRequests.filter(req => !req.isRead);
        console.log(`SupportService: Found ${unreadRequests.length} unread requests`);

        if (unreadRequests.length === 0) {
            console.log('SupportService: No unread requests to mark');
            return this.supportRequests;
        }

        // Update all requests to be marked as read
        this.supportRequests = this.supportRequests.map(req => {
            if (!req.isRead) {
                return { ...req, isRead: true };
            }
            return req;
        });

        // Save changes to localStorage
        this.saveToStorage();
        console.log(`SupportService: Marked ${unreadRequests.length} requests as read`);

        // Return the updated array
        return this.supportRequests;
    }
    getUnreadCountForAdmin() {
        return this.supportRequests.filter(req => !req.isRead).length;
    }
    getUnreadCountForUser(userId) {
        return this.supportRequests.filter(req =>
            req.userId === userId && !req.isReadByCustomer
        ).length;
    }
}
const supportService = new SupportService();

export default supportService;