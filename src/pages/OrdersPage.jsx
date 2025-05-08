import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react";
import '../css/OrdersPage.css';
import Navbar from '../components/Navbar';

const OrdersPage = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState('current');
    const [userProfile, setUserProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [currentOrders, setCurrentOrders] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role !== 'customer') {
                navigate('/');
                return;
            }

            setUserProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.role || ''
            });

            const fetchOrders = async () => {
                try {
                    const token = await getToken();
                    const currentRes = await fetch("http://localhost:8080/api/orders/current", {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const currentData = await currentRes.json();
                    setCurrentOrders(currentData);

                    const pastRes = await fetch("http://localhost:8080/api/orders/past", {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const pastData = await pastRes.json();
                    setPastOrders(pastData);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                }
            };

            fetchOrders();
        } else {
            navigate('/');
        }
    }, [navigate, getToken]);

    const viewOrderDetails = (order, e) => {
        if (e) e.stopPropagation();
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedOrder(null);
    };

    const downloadInvoice = (order, e) => {
        if (e) e.stopPropagation();
        setInvoiceOrder(order);
        setShowInvoiceModal(true);
    };

    const printInvoice = () => {
        const printWindow = window.open('', '_blank');
        const invoiceContent = document.querySelector('.invoice-content').cloneNode(true);
        const headerH1 = invoiceContent.querySelector('.invoice-header h1');
        if (headerH1) headerH1.textContent = 'iRevix Repair Shop';
        const footerP = invoiceContent.querySelectorAll('.invoice-footer p');
        if (footerP && footerP.length > 1) footerP[1].textContent = 'iRevix Repair Shop © 2024 - All Rights Reserved';

        const style = document.createElement('style');
        style.textContent = `
            body { font-family: Arial, sans-serif; padding: 20mm; margin: 0; color: #000; }
            .print-only-header { text-align: right; margin-bottom: 10px; font-size: 12px; }
            .invoice-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1976d2; padding-bottom: 10px; }
            .invoice-header h1 { color: #1976d2; margin: 0 0 5px 0; font-size: 24px; }
            .invoice-number { font-size: 16px; font-weight: bold; }
            .invoice-section { margin-bottom: 20px; }
            .invoice-section h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 0; font-size: 16px; color: #333; }
            .detail-row { margin-bottom: 5px; display: flex; }
            .detail-label { font-weight: bold; width: 150px; color: #555; }
            .detail-value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; }
            .invoice-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        `;
        printWindow.document.write('<html><head><title>Invoice - iRevix Repair Shop</title></head><body>');
        printWindow.document.head.appendChild(style);
        printWindow.document.body.appendChild(invoiceContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.addEventListener('load', () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.addEventListener('afterprint', () => {
                    printWindow.close();
                });
            }, 500);
        });
    };

    const requestSupport = (orderId, e) => {
        if (e) e.stopPropagation();
        navigate(`/support?orderId=${orderId}`);
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'completed';
            case 'processing': return 'processing';
            case 'in repair': return 'in-progress';
            case 'pending': return 'pending';
            case 'cancelled': return 'cancelled';
            default: return '';
        }
    };


    return (
        <div className="orders-page">
            <Navbar />
            <div className="orders-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>You can track your repair services and order history here.</p>
                </div>

                <div className="orders-tabs">
                    <div
                        className={`orders-tab ${activeTab === 'current' ? 'active' : ''}`}
                        onClick={() => setActiveTab('current')}
                    >
                        Current Orders
                        {currentOrders.length > 0 && (
                            <span className="orders-count">{currentOrders.length}</span>
                        )}
                    </div>
                    <div
                        className={`orders-tab ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Order History
                        {pastOrders.length > 0 && (
                            <span className="orders-count">{pastOrders.length}</span>
                        )}
                    </div>
                </div>

                <div className="orders-content">
                    {activeTab === 'current' && (
                        <div className="orders-section">
                            {currentOrders.length > 0 ? (
                                <div className="orders-list">
                                    {currentOrders.map(order => (
                                        <div key={order.id} className="order-card" onClick={() => viewOrderDetails(order)}>
                                            <div className="order-header">
                                                <div className="order-id">Order #{order.id}</div>
                                                <div className={`order-status ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="order-details">
                                                <div className="order-info">
                                                    <div className="order-device">{order.deviceType}</div>
                                                    <div className="order-issue">{order.issue}</div>
                                                </div>
                                                <div className="order-dates">
                                                    <div className="order-date">
                                                        <span>Order Date:</span> {order.date}
                                                    </div>
                                                    <div className="completion-date">
                                                        <span>Estimated Completion:</span> {order.estimatedCompletion}
                                                    </div>
                                                </div>
                                                <div className="order-cost">
                                                    <span>Amount:</span> ${order.cost}
                                                </div>
                                            </div>
                                            <div className="order-actions">
                                                <button
                                                    className="view-details-button"
                                                    onClick={(e) => viewOrderDetails(order, e)}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    className="contact-support-button"
                                                    onClick={(e) => requestSupport(order.id, e)}
                                                >
                                                    Request Support
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-orders">
                                    <p>You don't have any active orders at the moment.</p>
                                    <button className="create-order-button" onClick={() => navigate('/services')}>
                                        Get New Repair Service
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'past' && (
                        <div className="orders-section">
                            {pastOrders.length > 0 ? (
                                <div className="orders-list">
                                    {pastOrders.map(order => (
                                        <div key={order.id} className="order-card" onClick={() => viewOrderDetails(order)}>
                                            <div className="order-header">
                                                <div className="order-id">Order #{order.id}</div>
                                                <div className={`order-status ${getStatusClass(order.status)}`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="order-details">
                                                <div className="order-info">
                                                    <div className="order-device">{order.deviceType}</div>
                                                    <div className="order-issue">{order.issue}</div>
                                                </div>
                                                <div className="order-dates">
                                                    <div className="order-date">
                                                        <span>Order Date:</span> {order.date}
                                                    </div>
                                                    <div className="completion-date">
                                                        <span>Completion Date:</span> {order.completionDate}
                                                    </div>
                                                </div>
                                                <div className="order-cost">
                                                    <span>Amount:</span> ${order.cost}
                                                </div>
                                                <div className="invoice-no">
                                                    <span>Invoice No:</span> {order.invoiceNo}
                                                </div>
                                            </div>
                                            <div className="order-actions">
                                                <button
                                                    className="view-details-button"
                                                    onClick={(e) => viewOrderDetails(order, e)}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    className="download-invoice-button"
                                                    onClick={(e) => downloadInvoice(order, e)}
                                                >
                                                    Download Invoice
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-orders">
                                    <p>You don't have any completed orders yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Order Details Modal */}
                {showDetailsModal && selectedOrder && (
                    <div className="modal-overlay" onClick={closeDetailsModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Order Details - #{selectedOrder.id}</h2>
                                <button className="modal-close" onClick={closeDetailsModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-section">
                                    <h3>Device Information</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">Device:</span>
                                        <span className="detail-value">{selectedOrder.deviceType}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Service:</span>
                                        <span className="detail-value">{selectedOrder.issue}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Order Information</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">Status:</span>
                                        <span className={`detail-value status-pill ${getStatusClass(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Order Date:</span>
                                        <span className="detail-value">{selectedOrder.date}</span>
                                    </div>
                                    {selectedOrder.completionDate ? (
                                        <div className="detail-row"><span className="detail-label">Completion Date:</span>
                                            <span className="detail-value">{selectedOrder.completionDate}</span>
                                        </div>
                                    ) : (
                                        <div className="detail-row">
                                            <span className="detail-label">Estimated Completion:</span>
                                            <span className="detail-value">{selectedOrder.estimatedCompletion}</span>
                                        </div>
                                    )}
                                    {selectedOrder.invoiceNo && (
                                        <div className="detail-row">
                                            <span className="detail-label">Invoice No:</span>
                                            <span className="detail-value">{selectedOrder.invoiceNo}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="detail-section">
                                    <h3>Payment Information</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">Total Amount:</span>
                                        <span className="detail-value price">${selectedOrder.cost}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Payment Status:</span>
                                        <span className="detail-value status-pill completed">Paid</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                {selectedOrder.status === 'Completed' ? (
                                    <button
                                        className="download-invoice-button"
                                        onClick={() => downloadInvoice(selectedOrder)}
                                    >
                                        Download Invoice
                                    </button>
                                ) : (
                                    <button
                                        className="contact-support-button"
                                        onClick={() => requestSupport(selectedOrder.id)}
                                    >
                                        Request Support
                                    </button>
                                )}
                                <button className="modal-close-button" onClick={closeDetailsModal}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invoice Viewing Modal */}
                {showInvoiceModal && invoiceOrder && (
                    <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
                        <div className="modal-content invoice-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Invoice - #{invoiceOrder.id}</h2>
                                <button className="modal-close" onClick={() => setShowInvoiceModal(false)}>×</button>
                            </div>
                            <div className="modal-body invoice-content">
                                {/* Print-only header */}
                                <div className="print-only-header">
                                    <p className="print-date">{new Date().toLocaleDateString('en-US')}</p>
                                </div>

                                <div className="invoice-header">
                                    <h1>iRevix Repair Shop</h1>
                                    <div className="invoice-number">Invoice No: {invoiceOrder.invoiceNo}</div>
                                </div>

                                <div className="invoice-details">
                                    <div className="invoice-section">
                                        <h3>Invoice Information</h3>
                                        <div className="detail-row">
                                            <span className="detail-label">Date:</span>
                                            <span className="detail-value">{invoiceOrder.completionDate || invoiceOrder.date}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Order No:</span>
                                            <span className="detail-value">#{invoiceOrder.id}</span>
                                        </div>
                                    </div>

                                    <div className="invoice-section">
                                        <h3>Customer Information</h3>
                                        <div className="detail-row">
                                            <span className="detail-label">Name:</span>
                                            <span className="detail-value">{userProfile.firstName} {userProfile.lastName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{userProfile.email}</span>
                                        </div>
                                    </div>

                                    <div className="invoice-section">
                                        <h3>Device Information</h3>
                                        <div className="detail-row">
                                            <span className="detail-label">Device:</span>
                                            <span className="detail-value">{invoiceOrder.deviceType}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Service:</span>
                                            <span className="detail-value">{invoiceOrder.issue}</span>
                                        </div>
                                    </div>

                                    <div className="invoice-table">
                                        <h3>Payment Details</h3>
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Total</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>{invoiceOrder.issue}</td>
                                                <td>1</td>
                                                <td>${invoiceOrder.cost}</td>
                                                <td>${invoiceOrder.cost}</td>
                                            </tr>
                                            </tbody>
                                            <tfoot>
                                            <tr>
                                                <td colSpan="3" className="text-right">Subtotal:</td>
                                                <td>${invoiceOrder.cost}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" className="text-right">Tax (18%):</td>
                                                <td>${(invoiceOrder.cost * 0.18).toFixed(2)}</td>
                                            </tr>
                                            <tr className="total-row">
                                                <td colSpan="3" className="text-right">Grand Total:</td>
                                                <td>${(invoiceOrder.cost * 1.18).toFixed(2)}</td>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="invoice-footer">
                                    <p>This invoice was computer generated and does not require a signature.</p>
                                    <p>iRevix Repair Shop © 2024 - All Rights Reserved</p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="print-invoice-button"
                                    onClick={printInvoice}
                                >
                                    Print
                                </button>
                                <button className="modal-close-button" onClick={() => setShowInvoiceModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;