import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SupportRequestsPage.css';
import Navbar from '../components/Navbar';
import supportService from '../services/SupportService';

const SupportRequestsPage = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supportRequests, setSupportRequests] = useState([]);
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filter, setFilter] = useState('all');
    const [replyText, setReplyText] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState(null);
    const [newRequest, setNewRequest] = useState({
        title: '',
        priority: 'normal',
        category: 'technical',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser'); // Fixed typo here
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                if (user.role !== 'customer') {
                    navigate('/');
                    return;
                }
                loadUserRequests(user.id);
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(() => {
            loadUserRequests(currentUser.id);
        }, 10000);

        return () => clearInterval(interval);
    }, [currentUser]);

    const loadUserRequests = async (userId) => {
        try {
            setIsLoading(true);
            setError(null);

            // Get user requests asynchronously
            const userRequests = await supportService.getUserRequests(userId);

            // Ensure we get an array back
            if (Array.isArray(userRequests)) {
                setSupportRequests(userRequests);
            } else {
                console.error('Expected array of requests but got:', userRequests);
                setSupportRequests([]);
            }

            // Get unread count asynchronously
            const count = await supportService.getUnreadCountForUser(userId);
            setUnreadCount(typeof count === 'number' ? count : 0);
        } catch (error) {
            console.error('Error loading support requests:', error);
            setError('Failed to load your support requests. Please try again later.');
            setSupportRequests([]);
            setUnreadCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNewRequest({
            ...newRequest,
            [name]: value
        });
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!newRequest.title.trim()) {
            errors.title = 'Title is required';
        }

        if (!newRequest.description.trim()) {
            errors.description = 'Description is required';
        } else if (newRequest.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Create request asynchronously
            const createdRequest = await supportService.createRequest(
                currentUser.id,
                currentUser.name || currentUser.username || 'Customer',
                newRequest
            );

            if (createdRequest) {
                setSupportRequests([createdRequest, ...supportRequests]);
                setNewRequest({
                    title: '',
                    priority: 'normal',
                    category: 'technical',
                    description: ''
                });
                setShowNewRequestForm(false);
                window.showNotification && window.showNotification('success', 'Support request created successfully');
            } else {
                throw new Error('Failed to create request');
            }
        } catch (error) {
            console.error('Error creating support request:', error);
            window.showNotification && window.showNotification('error', 'Failed to create support request');
        }
    };

    const getFilteredRequests = () => {
        // Ensure supportRequests is an array
        if (!Array.isArray(supportRequests)) {
            console.error('supportRequests is not an array:', supportRequests);
            return [];
        }

        if (filter === 'all') {
            return supportRequests;
        }

        return supportRequests.filter(request =>
            request && request.status && request.status.toLowerCase() === filter.toLowerCase()
        );
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return '';

        switch (status.toLowerCase()) {
            case 'open':
                return 'status-open';
            case 'in progress':
                return 'status-in-progress';
            case 'closed':
                return 'status-closed';
            default:
                return '';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        if (!priority) return '';

        switch (priority.toLowerCase()) {
            case 'high':
                return 'priority-high';
            case 'normal':
                return 'priority-normal';
            case 'low':
                return 'priority-low';
            default:
                return '';
        }
    };

    const viewRequestDetails = async (request) => {
        setSelectedRequest(request);

        if (!request.isReadByCustomer) {
            try {
                // Mark as read asynchronously
                const updatedRequest = await supportService.markAsReadByCustomer(request.id);

                if (updatedRequest) {
                    setSupportRequests(supportRequests.map(req =>
                        req.id === request.id ? {...req, isReadByCustomer: true} : req
                    ));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            } catch (error) {
                console.error('Error marking request as read:', error);
            }
        }
    };

    const closeRequestDetails = () => {
        setSelectedRequest(null);
        setReplyText('');
    };

    const sendReply = async () => {
        if (!replyText.trim() || !selectedRequest) return;

        try {
            // Add message asynchronously
            const updatedRequest = await supportService.addMessage(
                selectedRequest.id,
                'customer',
                currentUser.name || currentUser.username || 'Customer',
                replyText
            );

            if (updatedRequest) {
                setSupportRequests(supportRequests.map(req =>
                    req.id === updatedRequest.id ? updatedRequest : req
                ));
                setSelectedRequest(updatedRequest);
                setReplyText('');
                window.showNotification && window.showNotification('success', 'Reply sent successfully');
            } else {
                throw new Error('Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            window.showNotification && window.showNotification('error', 'Failed to send reply');
        }
    };

    const hasUnreadMessages = (request) => {
        return request && !request.isReadByCustomer;
    };

    const renderRequestDetails = () => {
        if (!selectedRequest) return null;

        return (
            <div className="request-details-overlay">
                <Navbar/>
                <div className="request-details-modal">
                    <div className="request-details-header">
                        <h2>{selectedRequest.title}</h2>
                        <button
                            className="close-button"
                            onClick={closeRequestDetails}
                        >
                            ×
                        </button>
                    </div>

                    <div className="request-details-info">
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`status-badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                                {selectedRequest.status}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Priority:</span>
                            <span className={`priority-badge ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                                {selectedRequest.priority}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Category:</span>
                            <span>{selectedRequest.category}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span>{selectedRequest.date}</span>
                        </div>
                    </div>

                    <div className="request-description-full">
                        <h3>Description</h3>
                        <p>{selectedRequest.description}</p>
                    </div>

                    <div className="messages-container">
                        <h3>Conversation</h3>
                        {Array.isArray(selectedRequest.messages) && selectedRequest.messages.length > 0 ? (
                            selectedRequest.messages.map(message => (
                                <div
                                    key={message.id || `msg-${Math.random()}`}
                                    className={`message ${message.sender === 'customer' ? 'customer-message' : message.sender === 'agent' ? 'agent-message' : 'system-message'}`}
                                >
                                    {message.sender === 'agent' && (
                                        <div className="message-sender">
                                            <strong>{message.agentName}</strong> (Support Agent)
                                        </div>
                                    )}

                                    {message.sender === 'customer' && (
                                        <div className="message-sender">
                                            <strong>You</strong>
                                        </div>
                                    )}

                                    <div className="message-content">{message.message}</div>
                                    <div className="message-date">{message.date}</div>
                                </div>
                            ))
                        ) : (
                            <p className="no-messages">No messages yet.</p>
                        )}
                    </div>

                    {selectedRequest.status !== 'Closed' && (
                        <div className="reply-container">
                            <h3>Reply</h3>
                            <textarea
                                placeholder="Type your reply here..."
                                className="reply-textarea"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            ></textarea>
                            <button
                                className="send-reply-button"
                                onClick={sendReply}
                                disabled={!replyText.trim()}
                            >
                                Send Reply
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderNewRequestForm = () => {
        return (
            <div className="new-request-container">
                <div className="form-header">
                    <h2>Create New Support Request</h2>
                    <button
                        className="cancel-button"
                        onClick={() => setShowNewRequestForm(false)}
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title <span className="required">*</span></label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={newRequest.title}
                            onChange={handleInputChange}
                            placeholder="Brief summary of your issue"
                            className={formErrors.title ? 'error' : ''}
                        />
                        {formErrors.title && <div className="error-message">{formErrors.title}</div>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={newRequest.category}
                                onChange={handleInputChange}
                            >
                                <option value="technical">Technical</option>
                                <option value="billing">Billing</option>
                                <option value="order">Order</option>
                                <option value="account">Account</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={newRequest.priority}
                                onChange={handleInputChange}
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description <span className="required">*</span></label>
                        <textarea
                            id="description"
                            name="description"
                            value={newRequest.description}
                            onChange={handleInputChange}
                            placeholder="Please provide details about your issue"
                            rows="5"
                            className={formErrors.description ? 'error' : ''}
                        ></textarea>
                        {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                    </div>

                    <div className="form-buttons">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => setShowNewRequestForm(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">Submit Request</button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="support-page">
            <Navbar />
            <div className="support-container">
                {selectedRequest && renderRequestDetails()}

                {showNewRequestForm ? (
                    renderNewRequestForm()
                ) : (
                    <>
                        <div className="support-header">
                            <h1>Support Requests</h1>
                            <button
                                className="new-request-button"
                                onClick={() => setShowNewRequestForm(true)}
                            >
                                Create New Request
                            </button>
                        </div>

                        <div className="filter-container">
                            <label htmlFor="filter-select">Filter by status:</label>
                            <select
                                id="filter-select"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Requests</option>
                                <option value="open">Open</option>
                                <option value="in progress">In Progress</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {isLoading ? (
                            <div className="loading-message">
                                <p>Loading support requests...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message-container">
                                <p>{error}</p>
                                <button
                                    className="retry-button"
                                    onClick={() => currentUser && loadUserRequests(currentUser.id)}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : !Array.isArray(getFilteredRequests()) || getFilteredRequests().length === 0 ? (
                            <div className="empty-state">
                                <h3>No support requests found</h3>
                                <p>
                                    {filter !== 'all'
                                        ? `You don't have any ${filter.toLowerCase()} requests.`
                                        : "You haven't created any support requests yet."}
                                </p>
                                <button
                                    className="new-request-button-center"
                                    onClick={() => setShowNewRequestForm(true)}
                                >
                                    Create New Request
                                </button>
                            </div>
                        ) : (
                            <div className="requests-list">
                                {getFilteredRequests().map(request => (
                                    <div
                                        key={request.id || `req-${Math.random()}`}
                                        className={`request-card ${hasUnreadMessages(request) ? 'has-new-messages' : ''}`}
                                    >
                                        <div className="request-header">
                                            <h3 className="request-title">
                                                {hasUnreadMessages(request) && (
                                                    <span className="new-message-indicator"
                                                          title="New messages">•</span>
                                                )}
                                                {request.title}
                                            </h3>
                                            <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>

                                        <div className="request-meta">
                                            <div className="request-date">{request.date}</div>
                                            <div
                                                className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}>
                                                {request.priority} Priority
                                            </div>
                                            <div className="request-category">{request.category}</div>
                                        </div>

                                        <p className="request-description">
                                            {request.description && request.description.length > 100
                                                ? `${request.description.substring(0, 100)}...`
                                                : request.description || 'No description provided'}
                                        </p>
                                        <div className="request-footer">
                                            <span className="message-count">
                                                {Array.isArray(request.messages) ? request.messages.length : 0} message{(!Array.isArray(request.messages) || request.messages.length !== 1) ? 's' : ''}
                                            </span>
                                            <button
                                                className="view-details-button"
                                                onClick={() => viewRequestDetails(request)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SupportRequestsPage;