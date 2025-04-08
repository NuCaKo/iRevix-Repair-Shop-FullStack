import React, { useState, useEffect, useRef } from 'react';
import { FaClipboardList, FaTasks, FaWrench, FaBoxOpen, FaHistory, FaCalendarAlt, FaUsers, FaBook, FaChartBar, FaCamera, FaUpload, FaDownload, FaEye } from 'react-icons/fa';
import Footer from '../components/footer';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import '../css/ServicePage.css';
import ServiceReport from '../components/ServiceReport';
import axios from 'axios';

// Define API base URL
const API_BASE_URL = 'http://localhost:8080/api';

const ServicePanel = () => {
    // State declarations
    const [activeTab, setActiveTab] = useState('dashboard');
    const [repairs, setRepairs] = useState([]);
    const [selectedRepair, setSelectedRepair] = useState(null);
    const [parts, setParts] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [showStockRequestModal, setShowStockRequestModal] = useState(false);
    const [stockRequestItem, setStockRequestItem] = useState(null);
    const [repairNotes, setRepairNotes] = useState('');
    const [showReportForm, setShowReportForm] = useState(false);
    const [serviceReport, setServiceReport] = useState({
        technician: '',
        partsUsed: '',
        workPerformed: '',
        recommendations: '',
        cost: '',
        deviceCondition: '',
        diagnosisSummary: '',
        repairActions: '',
        partsReplaced: '',
        additionalNotes: ''
    });
    const [pdfReady, setPdfReady] = useState(false);
    const [kbSearchTerm, setKbSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [kbArticles, setKbArticles] = useState([]);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const [imageTab, setImageTab] = useState('before');
    const [selectedPart, setSelectedPart] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showHistory, setShowHistory] = useState(false);
    const [showAddRepairModal, setShowAddRepairModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newRepair, setNewRepair] = useState({
        customer: '',
        device: '',
        model: '',
        issue: '',
        priority: 'Medium',
        status: 'PENDING', // Using backend status format
        date: new Date().toISOString().split('T')[0]
    });

    // Refs
    const reportRef = useRef(null);
    const articleSectionRef = useRef(null);

    // Fetch data when component mounts
    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (selectedArticle && articleSectionRef.current) {
            articleSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedArticle]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            console.log("Fetching data from API...");

            const repairsResponse = await axios.get(`${API_BASE_URL}/repair-orders`);
            setRepairs(repairsResponse.data || []);

            // Fetch technicians
            const techniciansResponse = await axios.get(`${API_BASE_URL}/technicians`);
            setTechnicians(techniciansResponse.data || []);

            // Fetch parts/inventory
            const partsResponse = await axios.get(`${API_BASE_URL}/inventory`);
            setParts(partsResponse.data || []);

            // Fetch appointments
            const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments`);
            const transformedAppointments = (appointmentsResponse.data || []).map(apt => {
                const dateTime = new Date(apt.appointmentDateTime);
                return {
                    id: apt.id,
                    time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    customer: apt.customerName || apt.customer || '—',
                    device: apt.deviceType || apt.device || '—',
                    model: apt.deviceModel || apt.model || '—',
                    issue: apt.issueDescription || apt.issue || '—',
                    date: dateTime,
                    status: apt.status,
                    appointmentDateTime: apt.appointmentDateTime
                };
            });

            console.log("✅ Transformed Appointments:", JSON.stringify(transformedAppointments, null, 2));


            setAppointments(transformedAppointments);

            // Fetch knowledge base articles
            const kbResponse = await axios.get(`${API_BASE_URL}/knowledge-base`);
            setKbArticles(kbResponse.data || []);

        } catch (error) {
            console.error("Error loading data:", error);
            setError("Failed to load data from server. Please try again later.");
        } finally {
            setLoading(false);
        }
    };



    // Calculate derived values based on repairs state
    const pendingRepairsCount = repairs.filter(r => r.status === "PENDING").length;
    const inProgressRepairs = repairs.filter(r => r.status === "IN REPAIR" || r.status === "DIAGNOSING").length;
    const completedRepairs = repairs.filter(r => r.status === "COMPLETED").length;
    const awaitingParts = repairs.filter(r => r.status === "WAITING_FOR_PARTS").length;

    const pendingRepairs = repairs.filter(repair => {
        return repair.status === "PENDING" &&
            (searchTerm === "" ||
                repair.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.device?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.issue?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    });

    const activeTasks = repairs.filter(repair =>
        repair.status === "IN_REPAIR" ||
        repair.status === "DIAGNOSING" ||
        repair.status === "WAITING_FOR_PARTS"
    );



    // CRUD functions for repairs

    const handleAddRepair = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/repair-orders`, newRepair);

            // Refresh data after adding repair
            fetchAllData();

            // Reset form and close modal
            setShowAddRepairModal(false);
            setNewRepair({
                customer: '',
                device: '',
                model: '',
                issue: '',
                priority: 'Medium',
                status: 'PENDING',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Error creating repair:", error);
            alert("Failed to create new repair. Please try again.");
        }
    };

    const assignRepair = async (repair) => {
        try {
            console.log("🛠 Assigning repair:", repair);

            // Step 1: Status güncellemesi
            const statusResponse = await axios.put(`${API_BASE_URL}/repair-orders/${repair.id}/status`, {
                status: "IN_REPAIR"
            });
            console.log("✅ Status updated:", statusResponse.status);

            // Step 2: Teknisyen atama
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            console.log("👤 Current User from localStorage:", currentUser);

            if (currentUser && currentUser.id) {
                const techResponse = await axios.put(`${API_BASE_URL}/repair-orders/${repair.id}/technician/${currentUser.id}`);
                console.log("✅ Technician assigned:", techResponse.status);
            } else {
                console.warn("⚠️ No valid currentUser found in localStorage.");
            }

            // Step 3: Verileri yenile
            await fetchAllData();

            // Step 4: UI güncelle
            const updatedRepair = { ...repair, status: "IN_REPAIR" };
            setSelectedRepair(updatedRepair);
            setActiveTab('tasks');

        } catch (error) {
            console.error("❌ Error assigning repair:", error);
            alert("Failed to assign repair. Please try again.");
        }
    };


    const rejectRepair = async (repair) => {
        try {
            // You might want a specific status for rejected repairs
            await axios.put(`${API_BASE_URL}/repair-orders/${repair.id}/status`, {
                status: "PENDING"
            });

            // Refresh data
            fetchAllData();

            if (selectedRepair && selectedRepair.id === repair.id) {
                setSelectedRepair(null);
            }
        } catch (error) {
            console.error("Error rejecting repair:", error);
            alert("Failed to reject repair. Please try again.");
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            // Convert frontend status to backend status if needed
            const backendStatus = newStatus; // This function assumes you're passing the correct backend status

            await axios.put(`${API_BASE_URL}/repair-orders/${id}/status`, {
                status: backendStatus
            });

            // Refresh data
            fetchAllData();

            // Update selected repair if it's the one being modified
            if (selectedRepair && selectedRepair.id === id) {
                setSelectedRepair({ ...selectedRepair, status: backendStatus });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update repair status. Please try again.");
        }
    };

    const addRepairNote = async (repairId) => {
        if (!repairNotes.trim()) return;

        try {
            const newNote = {
                repairId: repairId,
                content: repairNotes,
                timestamp: new Date().toISOString()
            };

            await axios.post(`${API_BASE_URL}/repair-orders/${repairId}/notes`, newNote);

            // Refresh data
            fetchAllData();

            // Update local state if needed
            const updatedRepair = repairs.find(repair => repair.id === repairId);
            if (selectedRepair && selectedRepair.id === repairId && updatedRepair) {
                setSelectedRepair(updatedRepair);
            }

            setRepairNotes('');
        } catch (error) {
            console.error("Error adding note:", error);
            alert("Failed to add note. Please try again.");
        }
    };

    // Image handling functions

    const handleImageUpload = async (repairId, e, imageType = 'during') => {
        const file = e.target.files[0];
        if (!file) return;

        // Dosya boyutunu kontrol edelim (örneğin 20MB = 20 * 1024 * 1024)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("Dosya boyutu çok büyük! Lütfen 20MB'den küçük bir dosya seçin.");
            return;
        }

        // Devam eden upload işlemi...
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('type', imageType);

            const response = await axios.post(`${API_BASE_URL}/repair-orders/${repairId}/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const updated = await axios.get(`${API_BASE_URL}/repair-orders/${repairId}`);
            setSelectedRepair(updated.data);

            console.log("Image uploaded successfully:", response.data);
            fetchAllData(); // Görselleri tekrar çekmek
        } catch (error) {
            console.error("Error uploading image:", error.response ? error.response.data : error.message);
            alert("Failed to upload image. Please try again.");
        }
    };


    // PDF generation

    const generatePDF = async () => {
        if (!reportRef.current) return;

        try {
            setPdfReady(false);

            // Wait for images to load
            const images = reportRef.current.querySelectorAll('img');
            if (images.length > 0) {
                await Promise.all([...images].map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));
            }

            // Add a small delay to ensure rendering is complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create canvas with better settings
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 30;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Service_Report_${selectedRepair.id}.pdf`);

            setPdfReady(true);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Error generating PDF. Please try again.");
        }
    };

    // Utility functions

    const requestPart = async (itemId) => {
        try {
            await axios.post(`${API_BASE_URL}/inventory/${itemId}/request`, {
                quantity: 5, // Default quantity
                urgency: "NORMAL"
            });

            alert(`Part request submitted for item #${itemId}`);
        } catch (error) {
            console.error("Error requesting part:", error);
            alert("Failed to request part. Please try again.");
        }
    };

    const goToPrevDay = () => {
        const prevDay = new Date(currentDate);
        prevDay.setDate(currentDate.getDate() - 1);
        setCurrentDate(prevDay);
    };

    const goToNextDay = () => {
        const nextDay = new Date(currentDate);
        nextDay.setDate(currentDate.getDate() + 1);
        setCurrentDate(nextDay);
    };

    const getCategoryColor = (device) => {
        if (!device) return "var(--primary)";

        const deviceLower = device.toLowerCase();
        if (deviceLower.includes("iphone")) return "var(--primary)";
        if (deviceLower.includes("macbook")) return "var(--success)";
        if (deviceLower.includes("ipad")) return "var(--warning)";
        if (deviceLower.includes("watch")) return "#6a1b9a";
        if (deviceLower.includes("airpods")) return "#004d40";
        return "var(--primary)";
    };
    const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate.toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10);
    });

    //console.log("💡 Today Appointments:", todayAppointments);
    //console.log("📅 Current Date:", currentDate.toISOString().slice(0, 10));
    //console.log("🗓️ All Appointment Dates:", appointments.map(a => a.appointmentDateTime));

    useEffect(() => {
        if (selectedRepair && selectedRepair.images) {
            console.log("📷 selectedRepair images:", selectedRepair.images);
        }
    }, [selectedRepair]);

    useEffect(() => {
        if (enlargedImage) {
            console.log("📸 Modal image:", enlargedImage);
        }
    }, [enlargedImage]);

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div className="dashboard">
                        <h2>Service Dashboard</h2>
                        <div className="metric-cards">
                            <div className="metric-card pending">
                                <div className="metric-value">{pendingRepairsCount}</div>
                                <div className="metric-label">Pending Repairs</div>
                            </div>
                            <div className="metric-card in-progress">
                                <div className="metric-value">{inProgressRepairs}</div>
                                <div className="metric-label">In Progress</div>
                            </div>
                            <div className="metric-card awaiting">
                                <div className="metric-value">{awaitingParts}</div>
                                <div className="metric-label">Awaiting Parts</div>
                            </div>
                            <div className="metric-card completed">
                                <div className="metric-value">{completedRepairs}</div>
                                <div className="metric-label">Completed</div>
                            </div>
                        </div>


                        <div className="dashboard-sections">
                            <div className="recent-repairs">
                                <h3>Recent Repair Requests</h3>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Device</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {repairs.slice(0, 3).map(repair => (
                                        <tr key={repair.id} onClick={() => setSelectedRepair(repair)}>
                                            <td>{repair.id}</td>
                                            <td>{repair.customer}</td>
                                            <td>{repair.device}</td>
                                            <td>
                                                    <span
                                                        className={`status-badge ${repair.status.toLowerCase().replace(' ', '-')}`}>
                                                        {repair.status}
                                                    </span>
                                            </td>
                                            <td>
                                                    <span className={`priority-badge ${repair.priority.toLowerCase()}`}>
                                                        {repair.priority}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="today-appointments">
                                <h3>Today's Appointments</h3>
                                <div className="appointment-list">
                                    {todayAppointments.length > 0 ? (
                                        todayAppointments.slice(0, 3).map(app => (
                                            <div key={app.id} className="appointment-card">
                                                <div className="appointment-time">
                                                    {app.time}
                                                </div>
                                                <div className="appointment-details">
                                                    <span className="name">{app.customer}</span>
                                                    <span className="device">{app.device} {app.model && `- ${app.model}`}</span>
                                                    <span className="issue">{app.issue}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No appointments scheduled for today</p>
                                    )}
                                </div>
                            </div>

                            );
                        </div>
                    </div>
                );
            case 'repair-requests':
                // Determine which repairs to show based on showHistory flag
                const repairsToShow = showHistory
                    ? repairs.filter(repair => repair.status === "Completed")
                    : pendingRepairs;

                return (
                    <div className="repair-requests">
                        <h2>{showHistory ? "Completed Repairs" : "Repair Requests"}</h2>

                        {selectedRepair && showHistory ? (
                            // Show repair details when a repair is selected from history
                            <div>
                                <button
                                    className="back-btn"
                                    onClick={() => setSelectedRepair(null)}
                                    style={{ marginBottom: '15px' }}
                                >
                                    ← Back to Repair History
                                </button>

                                <div className="repair-detail-card">
                                    <div className="repair-header">
                                        <h3>Repair #{selectedRepair.id} Details</h3>
                                    </div>

                                    <div className="repair-info-grid">
                                        <div className="info-group">
                                            <label>Customer:</label>
                                            <div>{selectedRepair.customer}</div>
                                        </div>
                                        <div className="info-group">
                                            <label>Device:</label>
                                            <div>
                                                {selectedRepair.device} ({selectedRepair.model})
                                            </div>
                                        </div>
                                        <div className="info-group">
                                            <label>Issue:</label>
                                            <div>{selectedRepair.issue}</div>
                                        </div>
                                        <div className="info-group">
                                            <label>Status:</label>
                                            <div>{selectedRepair.status}</div>
                                        </div>
                                        <div className="info-group">
                                            <label>Date Completed:</label>
                                            <div>{selectedRepair.date}</div>
                                        </div>
                                    </div>

                                    {/* Images section */}
                                    <div className="repair-images-section">
                                        <div className="image-tabs">
                                            <button
                                                className={imageTab === 'before' ? 'active-tab' : ''}
                                                onClick={() => setImageTab('before')}
                                            >
                                                Before Repair
                                            </button>
                                            <button
                                                className={imageTab === 'during' ? 'active-tab' : ''}
                                                onClick={() => setImageTab('during')}
                                            >
                                                During Repair
                                            </button>
                                            <button
                                                className="service-report-btn"
                                                onClick={() => setShowReportForm(true)}
                                            >
                                                Service Report
                                            </button>
                                        </div>

                                        <div className="images-container">
                                            {selectedRepair.images &&
                                            selectedRepair.images.filter((img) => img.type === imageTab).length > 0 ? (
                                                <div className="image-gallery">
                                                    {selectedRepair.images
                                                        .filter((image) => image.type === imageTab)
                                                        .map((image) => (
                                                            <div key={image.id} className="image-item">
                                                                <img

                                                                    src={`http://localhost:8080${image.imageUrl}`}
                                                                    alt="Device"
                                                                    onClick={() => setEnlargedImage(image)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                                <div className="image-info">
                                                                    <span>{image.description}</span>
                                                                    <span>{image.date}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="no-images">
                                                    No {imageTab} repair images available.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="image-upload">
                                        <label
                                            htmlFor={`image-upload-${imageTab}-${selectedRepair.id}`}
                                            className="upload-btn"
                                        >
                                            <FaCamera /> Add {imageTab === 'before' ? 'Before' : 'During'} Repair Image
                                            <input
                                                id={`image-upload-${imageTab}-${selectedRepair.id}`}
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleImageUpload(selectedRepair.id, e, imageTab)}
                                            />
                                        </label>
                                    </div>

                                    {/* Enlarged Image Modal */}
                                    {enlargedImage && (
                                        <div
                                            className="image-modal-overlay"
                                            onClick={() => setEnlargedImage(null)}
                                        >
                                            <div className="image-modal-container">
                                                <img src={`http://localhost:8080${enlargedImage.imageUrl}`} alt="Enlarged view" />
                                                <div className="image-modal-info">
                                                    <p>{enlargedImage.description}</p>
                                                    <p>{enlargedImage.date}</p>
                                                </div>
                                                <button
                                                    className="close-modal-btn"
                                                    onClick={() => setEnlargedImage(null)}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}


                                    {/* Detailed problem description section */}
                                    <div className="repair-detail-section">
                                        <h4>Problem Details</h4>
                                        <div className="problem-description">
                                            <p>{selectedRepair.issue}</p>
                                            {selectedRepair.detailedDescription && (
                                                <p className="detailed-description">
                                                    {selectedRepair.detailedDescription}
                                                </p>
                                            )}
                                        </div>
                                    </div>


                                    {/* Display repair notes if available */}
                                    {selectedRepair.notes && selectedRepair.notes.length > 0 && (
                                        <div className="repair-notes-section">
                                            <h4>Repair Notes</h4>
                                            <div className="notes-list">
                                                {selectedRepair.notes.map((note) => (
                                                    <div key={note.id} className="note-item">
                                                        <div className="note-time">{new Date(note.timestamp).toLocaleString()}</div>
                                                        <div className="note-text">{note.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedRepair && selectedRepair.serviceReport && (
                                        <ServiceReport
                                            selectedRepair={selectedRepair}
                                            reportRef={reportRef}
                                            generatePDF={generatePDF}
                                        />
                                    )}

                                </div>

                                {/* Enlarged Image Modal */}
                                {enlargedImage && (
                                    // In the case 'repair-requests' section, update the image modal CSS and structure

                                    // Update the image modal to be smaller in the history view
                                    <div
                                        className="image-modal-overlay"
                                        onClick={() => setEnlargedImage(null)}

                                    >
                                        <div className="image-modal-container" style={{ maxWidth: '80%', maxHeight: '80vh' }}>
                                            <img
                                                src={`http://localhost:8080${enlargedImage.imageUrl}`}
                                                alt="Enlarged view"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '70vh',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                            <div className="image-modal-info">
                                                <p>{enlargedImage.description}</p>
                                                <p>{enlargedImage.date}</p>
                                            </div>
                                            <button
                                                className="close-modal-btn"
                                                onClick={() => setEnlargedImage(null)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Show repair list when no repair is selected
                            <>
                                <div className="filter-controls">
                                    <div className="search-box">
                                        <input
                                            type="text"
                                            placeholder="Search repairs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="search-filters">
                                        <button
                                            className={`history-btn ${showHistory ? 'active' : ''}`}
                                            onClick={() => setShowHistory(!showHistory)}
                                        >
                                            {showHistory ? "Current Requests" : "History"}
                                        </button>
                                    </div>
                                </div>
                                <table className="repair-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Device</th>
                                        <th>Issue</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {repairsToShow.length > 0 ? (
                                        repairsToShow.map(repair => (
                                            <tr key={repair.id}>
                                                <td>{repair.id}</td>
                                                <td>{repair.customer}</td>
                                                <td>{repair.device} {repair.model}</td>
                                                <td>{repair.issue}</td>
                                                <td>
                                        <span className={`status-badge ${repair.status.toLowerCase().replace(' ', '-')}`}>
                                            {repair.status}
                                        </span>
                                                </td>
                                                <td>
                                        <span className={`priority-badge ${repair.priority.toLowerCase()}`}>
                                            {repair.priority}
                                        </span>
                                                </td>
                                                <td>{repair.date}</td>
                                                <td>
                                                    {showHistory ? (
                                                        <button className="view-btn" onClick={() => setSelectedRepair(repair)}>
                                                            <FaEye /> View
                                                        </button>
                                                    ) : (
                                                        <button className="assign-btn" onClick={() => assignRepair(repair)}>
                                                            <FaWrench /> Assign
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="no-data">
                                                {showHistory ? "No completed repairs found." : "No pending repair requests."}
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                );
            case 'tasks':
                return (
                    <div className="tasks">
                        <h2>Active Repair Tasks</h2>
                        {activeTasks.length > 0 ? (
                            <div>
                                <table className="repair-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Device</th>
                                        <th>Model</th>
                                        <th>Issue</th>
                                        <th>Priority</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {activeTasks.map((repair) => (
                                        <tr
                                            key={repair.id}
                                            className={
                                                selectedRepair && selectedRepair.id === repair.id ? 'selected-row' : ''
                                            }
                                            onClick={() => setSelectedRepair(repair)}
                                        >
                                            <td>{repair.id}</td>
                                            <td>{repair.customer}</td>
                                            <td>{repair.device}</td>
                                            <td>{repair.model}</td>
                                            <td>{repair.issue}</td>
                                            <td>
                    <span className={`priority-badge ${repair.priority.toLowerCase()}`}>
                      {repair.priority}
                    </span>
                                            </td>
                                            <td>{repair.date}</td>
                                            <td>
                                                <button className="view-btn" onClick={() => setSelectedRepair(repair)}>
                                                    View Details
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {selectedRepair && (
                                    <div className="repair-detail-card">
                                        <div className="repair-header">
                                            <h3>Repair #{selectedRepair.id} Details</h3>
                                            <button onClick={() => setSelectedRepair(null)}>Close</button>
                                        </div>

                                        <div className="repair-info-grid">
                                            <div className="info-group">
                                                <label>Customer:</label>
                                                <div>{selectedRepair.customer}</div>
                                            </div>
                                            <div className="info-group">
                                                <label>Device:</label>
                                                <div>
                                                    {selectedRepair.device} ({selectedRepair.model})
                                                </div>
                                            </div>
                                            <div className="info-group">
                                                <label>Issue:</label>
                                                <div>{selectedRepair.issue}</div>
                                            </div>
                                            <div className="info-group">
                                                <label>Status:</label>
                                                <div>{selectedRepair.status}</div>
                                            </div>
                                            <div className="info-group">
                                                <label>Date Received:</label>
                                                <div>{selectedRepair.date}</div>
                                            </div>
                                        </div>

                                        {/* Images section */}
                                        <div className="repair-images-section">
                                            <div className="image-tabs">
                                                <button
                                                    className={imageTab === 'before' ? 'active-tab' : ''}
                                                    onClick={() => setImageTab('before')}
                                                >
                                                    Before Repair
                                                </button>
                                                <button
                                                    className={imageTab === 'during' ? 'active-tab' : ''}
                                                    onClick={() => setImageTab('during')}
                                                >
                                                    During Repair
                                                </button>
                                                <button
                                                    className="service-report-btn"
                                                    onClick={() => setShowReportForm(true)}
                                                >
                                                    Service Report
                                                </button>
                                            </div>

                                            <div className="images-container">
                                                {selectedRepair.images &&
                                                selectedRepair.images.filter((img) => img.type === imageTab).length > 0 ? (
                                                    <div className="image-gallery">
                                                        {selectedRepair.images
                                                            .filter((image) => image.type === imageTab)
                                                            .map((image) => (
                                                                <div key={image.id} className="image-item">
                                                                    <img
                                                                        src={`http://localhost:8080${image.imageUrl}`}
                                                                        alt="Device"
                                                                        onClick={() => setEnlargedImage(image)}
                                                                        style={{cursor: 'pointer'}}
                                                                    />
                                                                    <div className="image-info">
                                                                        <span>{image.description}</span>
                                                                        <span>{image.date}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="no-images">
                                                        No {imageTab} repair images available.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="image-upload">
                                            <label
                                                htmlFor={`image-upload-${imageTab}-${selectedRepair.id}`}
                                                className="upload-btn"
                                            >
                                                <FaCamera/> Add {imageTab === 'before' ? 'Before' : 'During'} Repair
                                                Image
                                                <input
                                                    id={`image-upload-${imageTab}-${selectedRepair.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{display: 'none'}}
                                                    onChange={(e) => handleImageUpload(selectedRepair.id, e, imageTab)}
                                                />
                                            </label>
                                        </div>

                                        {/* Enlarged Image Modal */}
                                        {enlargedImage && (
                                            <div
                                                className="image-modal-overlay"
                                                onClick={() => setEnlargedImage(null)}
                                            >
                                                <div className="image-modal-container">
                                                    <img src={enlargedImage.imageUrl} alt="Enlarged view"/>
                                                    <div className="image-modal-info">
                                                        <p>{enlargedImage.description}</p>
                                                        <p>{enlargedImage.date}</p>
                                                    </div>
                                                    <button
                                                        className="close-modal-btn"
                                                        onClick={() => setEnlargedImage(null)}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Detailed problem description section */}
                                        <div className="repair-detail-section">
                                            <h4>Problem Details</h4>
                                            <div className="problem-description">
                                                <p>{selectedRepair.issue}</p>
                                                {selectedRepair.detailedDescription && (
                                                    <p className="detailed-description">
                                                        {selectedRepair.detailedDescription}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Repair Notes Section */}
                                        <div className="repair-notes-section">
                                            <h4>Repair Process Notes</h4>
                                            <div className="notes-container">
                                                {selectedRepair.notes && selectedRepair.notes.length > 0 ? (
                                                    <div className="notes-list">
                                                        {selectedRepair.notes.map((note) => (
                                                            <div key={note.id} className="note-item">
                                                                <div className="note-time">{note.timestamp}</div>
                                                                <div className="note-text">{note.text}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="no-notes">No repair notes available.</div>
                                                )}
                                            </div>
                                            <div className="add-note">
                  <textarea
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      placeholder="Add repair process note..."
                      rows={3}
                  />
                                                <button onClick={() => addRepairNote(selectedRepair.id)}>
                                                    Add Note
                                                </button>
                                            </div>
                                        </div>

                                        {/* Service Report Form */}
                                        {showReportForm && (
                                            <div className="service-report-overlay">
                                                <div className="service-report-container">
                                                    <h3>Complete Service Report</h3>
                                                    <div className="report-form">
                                                        <div className="form-group">
                                                            <label>Technician Name</label>
                                                            <input
                                                                type="text"
                                                                value={serviceReport.technician}
                                                                onChange={(e) =>
                                                                    setServiceReport({
                                                                        ...serviceReport,
                                                                        technician: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Parts Used</label>
                                                            <textarea
                                                                value={serviceReport.partsUsed}
                                                                onChange={(e) =>
                                                                    setServiceReport({
                                                                        ...serviceReport,
                                                                        partsUsed: e.target.value,
                                                                    })
                                                                }
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Work Performed</label>
                                                            <textarea
                                                                value={serviceReport.workPerformed}
                                                                onChange={(e) =>
                                                                    setServiceReport({
                                                                        ...serviceReport,
                                                                        workPerformed: e.target.value,
                                                                    })
                                                                }
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Recommendations</label>
                                                            <textarea
                                                                value={serviceReport.recommendations}
                                                                onChange={(e) =>
                                                                    setServiceReport({
                                                                        ...serviceReport,
                                                                        recommendations: e.target.value,
                                                                    })
                                                                }
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Total Cost</label>
                                                            <input
                                                                type="text"
                                                                value={serviceReport.cost}
                                                                onChange={(e) =>
                                                                    setServiceReport({
                                                                        ...serviceReport,
                                                                        cost: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <div className="form-actions">
                                                            <button
                                                                onClick={() => {
                                                                    const updatedRepairs = repairs.map((repair) =>
                                                                        repair.id === selectedRepair.id
                                                                            ? {...repair, serviceReport}
                                                                            : repair
                                                                    );
                                                                    setRepairs(updatedRepairs);
                                                                    localStorage.setItem('repairData', JSON.stringify(updatedRepairs));
                                                                    setSelectedRepair({
                                                                        ...selectedRepair,
                                                                        serviceReport
                                                                    });
                                                                    setPdfReady(true);
                                                                    setShowReportForm(false);
                                                                }}
                                                            >
                                                                Complete Report
                                                            </button>
                                                            <button
                                                                className="cancel-btn"
                                                                onClick={() => setShowReportForm(false)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedRepair && selectedRepair.serviceReport && (
                                            <ServiceReport
                                                selectedRepair={selectedRepair}
                                                reportRef={reportRef}
                                                generatePDF={generatePDF}
                                            />
                                        )}


                                        <div className="repair-actions">
                                            <button
                                                className={
                                                    selectedRepair.status === 'In Progress' ? 'active-btn' : ''
                                                }
                                                onClick={() => updateStatus(selectedRepair.id, 'In Progress')}
                                            >
                                                Mark In Progress
                                            </button>
                                            <button
                                                className={
                                                    selectedRepair.status === 'Awaiting Parts' ? 'active-btn' : ''
                                                }
                                                onClick={() => updateStatus(selectedRepair.id, 'Awaiting Parts')}
                                            >
                                                Awaiting Parts
                                            </button>
                                            <button onClick={() => updateStatus(selectedRepair.id, 'Completed')}>
                                                Mark Completed
                                            </button>
                                            <button onClick={() => requestPart(selectedRepair.id)}>
                                                Request Parts
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => rejectRepair(selectedRepair)}
                                            >
                                                Reject Repair
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="no-selection">
                                <p>No active repair tasks. Please assign tasks from the Repair Requests tab.</p>
                                <button onClick={() => setActiveTab('repair-requests')}>
                                    Go to Repair Requests
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'inventory':
                return (() => {


                    // Apple device categories
                    const categories = [
                        {id: 'all', name: 'All Parts'},
                        {id: 'iphone', name: 'iPhone Parts'},
                        {id: 'macbook', name: 'MacBook Parts'},
                        {id: 'ipad', name: 'iPad Parts'},
                        {id: 'watch', name: 'Apple Watch Parts'},
                        {id: 'airpods', name: 'AirPods Parts'}
                    ];

                    // Filter parts based on search, category and stock level
                    const filteredParts = parts.filter(part => {
                        const matchesSearch =
                            part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            part.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            part.id?.toString().includes(searchTerm) ||
                            part.compatibleDevices?.some(device =>
                                device.toLowerCase().includes(searchTerm.toLowerCase())
                            );

                        const matchesCategory = categoryFilter === 'all' ||
                            part.category?.toLowerCase() === categoryFilter;

                        const matchesStock = !lowStockOnly || part.quantity < 5;

                        return matchesSearch && matchesCategory && matchesStock;
                    });

                    // Request stock for out-of-stock or low stock items
                    const openStockRequest = (part) => {
                        setStockRequestItem(part);
                        setShowStockRequestModal(true);
                    };

                    // Submit the stock request
                    const submitStockRequest = () => {
                        const quantity = document.getElementById('request-quantity').value;
                        const priority = document.getElementById('request-priority').value;
                        const notes = document.getElementById('request-notes').value;

                        alert(`Stock request created: ${quantity} units ${stockRequestItem.name} (Priority: ${priority})`);
                        setShowStockRequestModal(false);
                    };

                    return (
                        <div className="inventory">
                            <h2>Spare Parts Inventory</h2>

                            <div className="inventory-controls">
                                <div className="search-filters">
                                    <div className="search-box">
                                        <input
                                            type="text"
                                            placeholder="Search by track name, category or ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="category-filter">
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="stock-filter">
                                        <input
                                            type="checkbox"
                                            id="low-stock"
                                            checked={lowStockOnly}
                                            onChange={(e) => setLowStockOnly(e.target.checked)}
                                        />
                                        <label htmlFor="low-stock">Low Stock Only</label>
                                    </div>
                                </div>

                                <button className="order-btn"
                                        onClick={() => openStockRequest({name: 'New Part', quantity: 0})}>
                                    <FaBoxOpen/> Order New Part
                                </button>
                            </div>

                            {filteredParts.length > 0 ? (
                                <div className="inventory-table-container">
                                    <table className="inventory-table">
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Part Name</th>
                                            <th>Category</th>
                                            <th>Compatible Devices</th>
                                            <th>Stock</th>
                                            <th>Price</th>
                                            <th>Status</th>
                                            <th>Transactions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredParts.map(part => (
                                            <tr key={part.id} className={part.quantity === 0 ? 'out-of-stock-row' : ''}>
                                                <td>{part.id}</td>
                                                <td>{part.name}</td>
                                                <td>
                      <span className={`category-badge ${part.category?.toLowerCase()}`}>
                        {part.category}
                      </span>
                                                </td>
                                                <td>{part.compatibleDevices?.join(', ')}</td>
                                                <td className={part.quantity < 5 ? 'low-stock' : ''}>
                                                    {part.quantity}
                                                </td>
                                                <td>{part.price?.toFixed(2)} ₺</td>
                                                <td>
                      <span className={`stock-badge ${part.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {part.quantity > 0 ? 'In stock' : 'Out of Stock'}
                      </span>
                                                </td>
                                                <td>
                                                    <button className="order-part-btn"
                                                            onClick={() => openStockRequest(part)}>
                                                        {part.quantity === 0 ? 'Stock Request' : 'Order Now'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-parts">
                                    <p>No parts were found matching your search criteria.</p>
                                </div>
                            )}

                            {showStockRequestModal && (
                                <div className="modal-overlay">
                                    <div className="stock-request-modal">
                                        <h3>Stock Request</h3>
                                        <p><strong>Piece:</strong> {stockRequestItem.name}</p>
                                        <p><strong>Current Stock:</strong> {stockRequestItem.quantity}</p>

                                        <div className="form-group">
                                            <label>Quantity to be requested:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                defaultValue="5"
                                                id="request-quantity"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Öncelik:</label>
                                            <select id="request-priority">
                                                <option value="low">Low</option>
                                                <option value="medium" selected>Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Not:</label>
                                            <textarea
                                                placeholder="Ek notlar..."
                                                rows="3"
                                                id="request-notes"
                                            ></textarea>
                                        </div>

                                        <div className="modal-buttons">
                                            <button className="submit-btn" onClick={submitStockRequest}>
                                                Send Request
                                            </button>
                                            <button
                                                className="cancel-btn"
                                                onClick={() => setShowStockRequestModal(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })();

            case 'schedule':
                // Group appointments by hour for the chart
                const hourlyAppointments = Array(24).fill(0).map(() => []);

                todayAppointments.forEach(apt => {
                    // Parse the time string to get the hour
                    let hour = 0;
                    if (apt.time) {
                        const timeParts = apt.time.match(/(\d+):(\d+)\s*([AP]M)/);
                        if (timeParts) {
                            hour = parseInt(timeParts[1]);
                            if (timeParts[3] === 'PM' && hour < 12) hour += 12;
                            if (timeParts[3] === 'AM' && hour === 12) hour = 0;
                        }
                    } else if (apt.date) {
                        const aptDate = new Date(apt.date);
                        hour = aptDate.getHours();
                    }

                    hourlyAppointments[hour].push(apt);
                });

                return (
                    <div className="schedule">
                        <h2>Appointment Schedule</h2>
                        <div className="calendar-controls">
                            <button className="prev-btn" onClick={goToPrevDay}>Previous Day</button>
                            <div className="current-date">{currentDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</div>
                            <button className="next-btn" onClick={goToNextDay}>Next Day</button>
                        </div>

                        {/* Appointment Timeline Chart */}
                        <div className="appointment-chart">
                            <div className="timeline-hours">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <div key={i} className="hour-marker">
                                        <span>{i + 8}:00</span>
                                    </div>
                                ))}
                            </div>
                            <div className="timeline-content">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const hour = i + 8; // Start from 8 AM to 8 PM
                                    return (
                                        <div key={i} className="hour-slot">
                                            {hourlyAppointments[hour].map(apt => {
                                                // Calculate position
                                                let minutes = 0;
                                                if (apt.time) {
                                                    const timeParts = apt.time.match(/(\d+):(\d+)\s*([AP]M)/);
                                                    if (timeParts) {
                                                        minutes = parseInt(timeParts[2]);
                                                    }
                                                }
                                                const leftPosition = (minutes / 60) * 100;
                                                const width = 120; // Fixed width in pixels

                                                return (
                                                    <div
                                                        key={apt.id}
                                                        className="timeline-appointment"
                                                        style={{
                                                            left: `${leftPosition}%`,
                                                            backgroundColor: getCategoryColor(apt.device),
                                                            width: `${width}px`,
                                                        }}
                                                        title={`${apt.customer} - ${apt.device} - ${apt.issue}`}
                                                    >
                                            <span className="appointment-time-marker">
                                                {apt.time}
                                            </span>
                                                        <span className="appointment-customer">{apt.customer}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="appointment-list">
                            {todayAppointments.length > 0 ? (
                                todayAppointments.map(apt => (
                                    <div key={apt.id} className="appointment-card">
                                        <div className="appointment-time">
                                            {apt.time || new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div className="appointment-details">
                                            <h3>{apt.customer}</h3>
                                            <p><strong>Device:</strong> {apt.device}</p>
                                            <p><strong>Issue:</strong> {apt.issue}</p>
                                            <p>{apt.phone && <><strong>Phone:</strong> {apt.phone}</>}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-appointments">
                                    <p>No appointments scheduled for this day</p>
                                </div>
                            )}
                        </div>

                        <div style={{marginTop: '20px', textAlign: 'center'}}>
                            <button className="add-appointment-btn">+ Add New Appointment</button>
                        </div>
                    </div>
                );
            case 'knowledge-base':
                // Knowledge Base categories
                const kbCategories = [
                    { id: 'all', name: 'All Articles' },
                    { id: 'iphone', name: 'iPhone Repair' },
                    { id: 'macbook', name: 'MacBook Repair' },
                    { id: 'ipad', name: 'iPad Repair' },
                    { id: 'watch', name: 'Apple Watch Repair' },
                    { id: 'airpods', name: 'AirPods Repair' },
                    { id: 'general', name: 'General Information' }
                ];

                // Filter articles based on search term and category
                const filteredArticles = kbArticles?.filter(article => {
                    const matchesSearch = article.title.toLowerCase().includes(kbSearchTerm.toLowerCase());
                    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
                    return matchesSearch && matchesCategory;
                }) || [];

                // Get popular articles for featured section
                const popularArticles = kbArticles?.filter(article => article.popular) || [];

                // Function to handle article selection and scrolling
                const selectAndScrollToArticle = (article) => {
                    setSelectedArticle(article);
                    // Scroll to article section after selection
                    if (articleSectionRef.current) {
                        setTimeout(() => {
                            const yOffset = -140; // Add a 80px offset from the top
                            const y = articleSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                            window.scrollTo({top: y, behavior: 'smooth'});
                        }, 100);
                    }
                };

                return (
                    <div className="knowledge-base">
                        <h2>Repair Knowledge</h2>

                        <div className="kb-search">
                            <input
                                type="text"
                                className="kb-search-input"
                                placeholder="Search for repair manuals, articles or devices..."
                                value={kbSearchTerm}
                                onChange={(e) => setKbSearchTerm(e.target.value)}
                            />
                            <div className="kb-filters">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {kbCategories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Featured articles section - compact view */}
                        {popularArticles.length > 0 && (
                            <div className="kb-featured">
                                <h3>Featured Repair Guides</h3>
                                <div className="kb-featured-grid">
                                    {popularArticles.map(article => (
                                        <div
                                            key={article.id}
                                            className="kb-featured-item"
                                            onClick={() => selectAndScrollToArticle(article)}
                                        >
                                            <h4>{article.title}</h4>
                                            <div className="kb-featured-info">
                                    <span className={`category-badge ${article.category}`}>
                                        {article.category}
                                    </span>
                                                <span className="kb-date">{article.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categories and articles list - compact view */}
                        <div className="kb-categories">
                            {filteredArticles.length > 0 ? (
                                selectedCategory === 'all' ? (
                                    // Show all categories with their articles when "all" is selected
                                    kbCategories.filter(cat => cat.id !== 'all').map(category => {
                                        // Only include articles that belong to this specific category
                                        const categoryArticles = kbArticles.filter(
                                            article => article.category === category.id &&
                                                article.title.toLowerCase().includes(kbSearchTerm.toLowerCase())
                                        );

                                        if (categoryArticles.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <div key={category.id} className="kb-category">
                                                <h3>{category.name}</h3>
                                                <ul className="kb-list">
                                                    {categoryArticles.map(article => (
                                                        <li key={article.id}>
                                                            <a href="#" onClick={(e) => {
                                                                e.preventDefault();
                                                                selectAndScrollToArticle(article);
                                                            }}>
                                                                {article.title}
                                                            </a>
                                                            <span className="kb-date">{article.date}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // When a specific category is selected, only show that category
                                    <div className="kb-category">
                                        <h3>{kbCategories.find(cat => cat.id === selectedCategory)?.name}</h3>
                                        <ul className="kb-list">
                                            {filteredArticles.map(article => (
                                                <li key={article.id}>
                                                    <a href="#" onClick={(e) => {
                                                        e.preventDefault();
                                                        selectAndScrollToArticle(article);
                                                    }}>
                                                        {article.title}
                                                    </a>
                                                    <span className="kb-date">{article.date}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            ) : (
                                <div className="no-articles">
                                    <p>No articles found matching your search criteria.</p>
                                </div>
                            )}
                        </div>

                        {/* Article detail section with reference for scrolling */}
                        {selectedArticle && (
                            <div className="kb-article-slide" ref={articleSectionRef}>
                                <div className="kb-article">
                                    <div className="kb-article-header">
                                        <button
                                            className="back-btn"
                                            onClick={() => setSelectedArticle(null)}
                                        >
                                            ← Back to Articles
                                        </button>
                                        <h3>{selectedArticle.title}</h3>
                                        <div className="kb-article-meta">
                                <span className={`category-badge ${selectedArticle.category}`}>
                                    {selectedArticle.category}
                                </span>
                                            <span className="kb-date">{selectedArticle.date}</span>
                                        </div>
                                    </div>

                                    <div className="kb-article-content">
                                        <p>{selectedArticle.content}</p>

                                        {selectedArticle.steps && selectedArticle.steps.length > 0 && (
                                            <div className="kb-article-steps">
                                                <h4>Steps</h4>
                                                <ol>
                                                    {selectedArticle.steps.map((step, index) => (
                                                        <li key={index}>{step}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}

                                        {selectedArticle.tips && selectedArticle.tips.length > 0 && (
                                            <div className="kb-article-tips">
                                                <h4>Tips</h4>
                                                <ul>
                                                    {selectedArticle.tips.map((tip, index) => (
                                                        <li key={index}>{tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'add-repair':
                return (
                    <div className="add-repair-page">
                        <h2>Add New Repair</h2>
                        <form className="add-repair-form" onSubmit={handleAddRepair}>
                            <div className="form-group">
                                <label>Customer Name:</label>
                                <input
                                    type="text"
                                    required
                                    value={newRepair.customer}
                                    onChange={(e) => setNewRepair({...newRepair, customer: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Device Type:</label>
                                <input
                                    type="text"
                                    required
                                    value={newRepair.device}
                                    onChange={(e) => setNewRepair({...newRepair, device: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Model:</label>
                                <input
                                    type="text"
                                    value={newRepair.model}
                                    onChange={(e) => setNewRepair({...newRepair, model: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Issue:</label>
                                <textarea
                                    required
                                    value={newRepair.issue}
                                    onChange={(e) => setNewRepair({...newRepair, issue: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Priority:</label>
                                <select
                                    value={newRepair.priority}
                                    onChange={(e) => setNewRepair({...newRepair, priority: e.target.value})}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">Add Repair</button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setActiveTab('repair-requests')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                );
            default:
                return <div>Select a tab from the sidebar</div>;
        }
    };
    return (
        <div className="service-page">
            <Navbar />
            <div className="service-panel">
                <div className="panel-container">
                    <div className="panel-sidebar">
                        <ul className="sidebar-menu">
                            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                                <FaChartBar /> Dashboard
                            </li>
                            <li className={activeTab === 'repair-requests' ? 'active' : ''} onClick={() => setActiveTab('repair-requests')}>
                                <FaClipboardList /> Repair Requests
                                {pendingRepairsCount > 0 && <span className="badge_service">{pendingRepairsCount}</span>}
                            </li>
                            <li className={activeTab === 'add-repair' ? 'active' : ''} onClick={() => setActiveTab('add-repair')}>
                                <FaWrench /> Add Repair
                            </li>
                            <li className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
                                <FaTasks /> Active Tasks
                                {activeTasks.length > 0 && <span className="badge_service">{activeTasks.length}</span>}
                            </li>
                            <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
                                <FaBoxOpen /> Parts Inventory
                            </li>
                            <li className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
                                <FaCalendarAlt /> Schedule
                            </li>
                            <li className={activeTab === 'knowledge-base' ? 'active' : ''} onClick={() => setActiveTab('knowledge-base')}>
                                <FaBook /> Knowledge Base
                            </li>
                        </ul>
                    </div>
                    <div className="panel-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ServicePanel;