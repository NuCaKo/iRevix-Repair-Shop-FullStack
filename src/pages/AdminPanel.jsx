import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import supportService from '../services/SupportService';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
    useNavigate,
    useLocation
} from 'react-router-dom';
import {
    faUsers,
    faBell,
    faChartLine,
    faTicketAlt,
    faTools,
    faListAlt,
    faSignOutAlt,
    faCog,
    faClipboardList,
    faMoneyBillWave,
    faMobileAlt,
    faTabletScreenButton,
    faLaptop,
    faHeadphones,
    faHeart,
    faScrewdriver,
    faMicrochip,
    faBatteryFull,
    faCamera,
    faVolumeUp,
    faCheck,
    faHeadset, faClock
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import '../css/adminPanel.css';

function AdminPanel() {
    const navigate = useNavigate();
    const [revenuePeriod, setRevenuePeriod] = useState('7days');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [websiteTraffic, setWebsiteTraffic] = useState([]);
    const [repairOrders, setRepairOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDevices, setSelectedDevices] = useState([]);  // This should be an array
    const [selectedModels, setSelectedModels] = useState([]);    // This should be an array
    const [inventoryItems, setInventoryItems] = useState([]);
    const [hoveredBar, setHoveredBar] = useState(null); // Track which traffic bar is being hovered
    const [hoveredRevenueBar, setHoveredRevenueBar] = useState(null); // Track which revenue bar is being hovered
    const [supportRequests, setSupportRequests] = useState([]);
    const [unreadSupportRequests, setUnreadSupportRequests] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [supportFilter, setSupportFilter] = useState('all');
    const [trafficPeriod, setTrafficPeriod] = useState('7days');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editOrderData, setEditOrderData] = useState(null);
    const [orderFilter, setOrderFilter] = useState('all');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockItem, setRestockItem] = useState(null);
    const [restockQuantity, setRestockQuantity] = useState(1);

    // User login check
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');

        if (!storedUser) {
            // Redirect to login if user is not logged in
            navigate('/login');
            return;
        }

        const user = JSON.parse(storedUser);

        // Redirect to login if user is not admin
        if (user.role !== 'admin') {
            navigate('/login');
        }
    }, [navigate]);

    // Device and models data
    const devices = [
        { id: 'iphone', name: 'iPhone', icon: faMobileAlt },
        { id: 'ipad', name: 'iPad', icon: faTabletScreenButton },
        { id: 'macbook', name: 'MacBook', icon: faLaptop },
        { id: 'airpods', name: 'AirPods', icon: faHeadphones },
        { id: 'applewatch', name: 'Apple Watch', icon: faClock }
    ];

    const deviceModels = {
        iphone: ['iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS', 'iPhone X'],
        ipad: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad Mini', 'iPad'],
        macbook: ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Pro 13"', 'MacBook Air'],
        airpods: ['AirPods Pro', 'AirPods 3rd Gen', 'AirPods 2nd Gen', 'AirPods Max'],
        applewatch: ['Apple Watch Series 7', 'Apple Watch Series 6', 'Apple Watch SE', 'Apple Watch Series 5']
    };

    // Function to generate different traffic data for different time periods
    const getTrafficDataForPeriod = (period) => {
        switch (period) {
            case '7days':
                return [
                    { date: '2025-02-23', visitors: 245, pageViews: 876, conversions: 12 },
                    { date: '2025-02-24', visitors: 312, pageViews: 1024, conversions: 18 },
                    { date: '2025-02-25', visitors: 290, pageViews: 956, conversions: 15 },
                    { date: '2025-02-26', visitors: 345, pageViews: 1122, conversions: 22 },
                    { date: '2025-02-27', visitors: 367, pageViews: 1245, conversions: 25 },
                    { date: '2025-02-28', visitors: 398, pageViews: 1345, conversions: 28 },
                    { date: '2025-03-01', visitors: 425, pageViews: 1456, conversions: 32 },
                ];
            case '30days':
                return [
                    { date: '2025-01-30', visitors: 190, pageViews: 645, conversions: 9 },
                    { date: '2025-02-02', visitors: 210, pageViews: 720, conversions: 11 },
                    { date: '2025-02-05', visitors: 230, pageViews: 790, conversions: 13 },
                    { date: '2025-02-08', visitors: 255, pageViews: 880, conversions: 15 },
                    { date: '2025-02-11', visitors: 275, pageViews: 940, conversions: 16 },
                    { date: '2025-02-14', visitors: 290, pageViews: 1000, conversions: 18 },
                    { date: '2025-02-17', visitors: 310, pageViews: 1080, conversions: 20 },
                    { date: '2025-02-20', visitors: 330, pageViews: 1150, conversions: 22 },
                    { date: '2025-02-23', visitors: 350, pageViews: 1200, conversions: 24 },
                    { date: '2025-02-26', visitors: 375, pageViews: 1300, conversions: 26 },
                    { date: '2025-03-01', visitors: 425, pageViews: 1456, conversions: 32 },
                ];
            case '90days':
                return [
                    { date: '2024-12-01', visitors: 150, pageViews: 520, conversions: 7 },
                    { date: '2024-12-10', visitors: 165, pageViews: 570, conversions: 8 },
                    { date: '2024-12-20', visitors: 175, pageViews: 610, conversions: 9 },
                    { date: '2024-12-30', visitors: 190, pageViews: 650, conversions: 10 },
                    { date: '2025-01-10', visitors: 205, pageViews: 710, conversions: 12 },
                    { date: '2025-01-20', visitors: 225, pageViews: 780, conversions: 14 },
                    { date: '2025-01-30', visitors: 250, pageViews: 850, conversions: 16 },
                    { date: '2025-02-10', visitors: 280, pageViews: 950, conversions: 19 },
                    { date: '2025-02-20', visitors: 330, pageViews: 1100, conversions: 23 },
                    { date: '2025-03-01', visitors: 425, pageViews: 1456, conversions: 32 },
                ];
            default:
                return getTrafficDataForPeriod('7days');
        }
    };

    // Function to calculate traffic summary data
    const getTrafficSummary = (data, period) => {
        // Calculate total visitors and page views
        const totalVisitors = data.reduce((sum, day) => sum + day.visitors, 0);
        const totalPageViews = data.reduce((sum, day) => sum + day.pageViews, 0);
        const totalConversions = data.reduce((sum, day) => sum + day.conversions, 0);

        // Calculate average time for each period
        const avgSessionDuration = period === '7days' ? '3m 42s' :
            period === '30days' ? '4m 15s' : '3m 58s';

        // Calculate percentage changes based on period
        const visitorChange = period === '7days' ? '+12.5%' :
            period === '30days' ? '+18.2%' : '+24.7%';

        const pageViewChange = period === '7days' ? '+8.2%' :
            period === '30days' ? '+15.4%' : '+21.3%';

        const conversionChange = period === '7days' ? '+1.2%' :
            period === '30days' ? '+2.5%' : '+3.1%';

        const durationChange = period === '7days' ? '-0.8%' :
            period === '30days' ? '+1.5%' : '+0.6%';

        return {
            visitors: totalVisitors,
            pageViews: totalPageViews,
            conversionRate: ((totalConversions / totalVisitors) * 100).toFixed(1),
            avgSessionDuration,
            visitorChange,
            pageViewChange,
            conversionChange,
            durationChange
        };
    };

    // Order handlers
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setEditOrderData({...order});
        setIsEditModalOpen(true);
    };

    const handleSaveOrder = () => {
        // Update the order in the orders list
        const updatedOrders = repairOrders.map(order =>
            order.id === editOrderData.id ? editOrderData : order
        );
        setRepairOrders(updatedOrders);
        setIsEditModalOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditOrderData({
            ...editOrderData,
            [name]: value
        });
    };

    const exportInventoryReport = () => {
        try {
            let reportItems = [];
            let reportTitle = "iRevix Full Inventory Report";

            // If specific devices and models are selected, use only those items
            if (selectedDevices.length > 0 && selectedModels.length > 0) {
                reportItems = inventoryItems;
                reportTitle = `iRevix Inventory Report - Selected Models (${selectedModels.length} models)`;
            } else {
                // Generate inventory for all devices and models
                for (const device of devices) {
                    for (const model of deviceModels[device.id]) {
                        const deviceItems = generateReplacementParts(device.id, model);
                        // Add device and model info to items
                        const itemsWithInfo = deviceItems.map(item => ({
                            ...item,
                            deviceType: device.name,
                            modelType: model
                        }));
                        reportItems = [...reportItems, ...itemsWithInfo];
                    }
                }
            }

            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";

            // Add header and date
            csvContent += `${reportTitle}\r\n`;
            csvContent += `Generated on: ${new Date().toLocaleDateString()}\r\n\r\n`;

            // Add headers
            csvContent += "Device,Model,Part Number,Part Name,Description,Stock Level,Reorder Point,Price,Supplier,Last Restocked\r\n";

            // Add inventory items
            reportItems.forEach(item => {
                csvContent += `${item.deviceType || ''},`;
                csvContent += `${item.modelType || ''},`;
                csvContent += `${item.partNumber},`;
                csvContent += `"${item.name}",`;
                csvContent += `"${item.description}",`;
                csvContent += `${item.stockLevel},`;
                csvContent += `${item.reorderPoint},`;
                csvContent += `$${item.price.toFixed(2)},`;
                csvContent += `"${item.supplier}",`;
                csvContent += `${item.lastRestocked}\r\n`;
            });

            // Create download link and trigger it
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);

            // Set filename
            const filename = `iRevix_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`;

            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("Inventory report has been downloaded successfully!");
        } catch (error) {
            console.error("Error exporting inventory report:", error);
            alert("There was an error exporting the inventory report. Please try again.");
        }
    };

    // Mock data for testing
    useEffect(() => {
        // Simulate data loading
        setTimeout(() => {
            setNotifications([
                { id: 1, type: 'order', message: 'New repair order #1234 received', time: '10 minutes ago', isRead: false },
                { id: 2, type: 'system', message: 'System update completed successfully', time: '1 hour ago', isRead: true },
                { id: 3, type: 'user', message: 'New user registration: john@example.com', time: '3 hours ago', isRead: false },
                { id: 4, type: 'order', message: 'Order #1230 status changed to "Completed"', time: '5 hours ago', isRead: true },
                { id: 5, type: 'alert', message: 'Low inventory alert: iPhone 12 screens', time: '1 day ago', isRead: true },
            ]);

            setWebsiteTraffic(getTrafficDataForPeriod('7days'));

            setRepairOrders([
                { id: 'RPR1234', customer: 'John Smith', device: 'iPhone 12', problem: 'Screen Replacement', status: 'In Progress', date: '2025-03-01' },
                { id: 'RPR1235', customer: 'Emma Johnson', device: 'MacBook Pro', problem: 'Battery Issue', status: 'Pending', date: '2025-03-01' },
                { id: 'RPR1236', customer: 'Michael Brown', device: 'Apple Watch', problem: 'Not Turning On', status: 'Completed', date: '2025-02-28' },
                { id: 'RPR1237', customer: 'Sarah Davis', device: 'iPad Pro', problem: 'Charging Port', status: 'Awaiting Parts', date: '2025-02-28' },
                { id: 'RPR1238', customer: 'David Wilson', device: 'AirPods Pro', problem: 'Sound Issue', status: 'Completed', date: '2025-02-27' },
            ]);

            // Support requests mock data
            const sampleSupportRequests = [
                {
                    id: 1,
                    title: "Device not turning on",
                    status: "Open",
                    priority: "High",
                    category: "Technical",
                    date: "March 1, 2024",
                    customer: "John Smith",
                    email: "john.smith@example.com",
                    isRead: false,
                    description: "My phone won't turn on even after charging overnight. I've tried different chargers and outlets but nothing seems to work.",
                    messages: [
                        {
                            id: 1,
                            sender: "system",
                            message: "Your request has been received. A support agent will contact you shortly.",
                            date: "March 1, 2024 10:30 AM"
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Question about my order #ORD-1234",
                    status: "In Progress",
                    priority: "Normal",
                    category: "Order",
                    date: "February 25, 2024",
                    customer: "Emma Johnson",
                    email: "emma.johnson@example.com",
                    isRead: true,
                    description: "I placed an order last week and I'm wondering when it will be delivered. The tracking information hasn't updated in 3 days.",
                    messages: [
                        {
                            id: 1,
                            sender: "system",
                            message: "Your request has been received. A support agent will contact you shortly.",
                            date: "February 25, 2024 3:45 PM"
                        },
                        {
                            id: 2,
                            sender: "agent",
                            agentName: "John Smith",
                            message: "Thank you for your patience. I've checked your order and it appears there was a slight delay in shipping. Your package is now on its way and should arrive within 2 business days.",
                            date: "February 26, 2024 11:15 AM"
                        }
                    ]
                },
                {
                    id: 3,
                    title: "Request for refund",
                    status: "Closed",
                    priority: "Normal",
                    category: "Billing",
                    date: "February 10, 2024",
                    customer: "Michael Brown",
                    email: "michael.brown@example.com",
                    isRead: true,
                    description: "I would like to request a refund for my purchase as the item arrived damaged.",
                    messages: [
                        {
                            id: 1,
                            sender: "system",
                            message: "Your request has been received. A support agent will contact you shortly.",
                            date: "February 10, 2024 9:20 AM"
                        },
                        {
                            id: 2,
                            sender: "agent",
                            agentName: "Sarah Johnson",
                            message: "I'm sorry to hear about the damaged item. We'll process your refund right away. Could you please provide a photo of the damaged item?",
                            date: "February 10, 2024 10:45 AM"
                        },
                        {
                            id: 3,
                            sender: "customer",
                            message: "I've attached photos of the damaged product.",
                            date: "February 10, 2024 11:30 AM"
                        },
                        {
                            id: 4,
                            sender: "agent",
                            agentName: "Sarah Johnson",
                            message: "Thank you for the photos. I've processed your refund and you should receive it within 3-5 business days.",
                            date: "February 11, 2024 9:15 AM"
                        }
                    ]
                }
            ];

            setSupportRequests(sampleSupportRequests);
            setUnreadSupportRequests(sampleSupportRequests.filter(req => !req.isRead).length);

            setIsLoading(false);
        }, 1000);
    }, []);

    // Inventory parts data
    const commonParts = {
        iphone: [
            { icon: faScrewdriver, category: 'Screen Assembly', prefix: 'iPhone' },
            { icon: faBatteryFull, category: 'Battery', prefix: 'iPhone' },
            { icon: faVolumeUp, category: 'Speaker Assembly', prefix: 'iPhone' },
            { icon: faCamera, category: 'Camera Module', prefix: 'iPhone' },
            { icon: faMicrochip, category: 'Logic Board', prefix: 'iPhone' }
        ],
        ipad: [
            { icon: faScrewdriver, category: 'Screen Assembly', prefix: 'iPad' },
            { icon: faBatteryFull, category: 'Battery', prefix: 'iPad' },
            { icon: faVolumeUp, category: 'Speaker Assembly', prefix: 'iPad' },
            { icon: faCamera, category: 'Camera Module', prefix: 'iPad' },
            { icon: faMicrochip, category: 'Logic Board', prefix: 'iPad' }
        ],
        macbook: [
            { icon: faScrewdriver, category: 'Display Assembly', prefix: 'MacBook' },
            { icon: faBatteryFull, category: 'Battery', prefix: 'MacBook' },
            { icon: faMicrochip, category: 'Logic Board', prefix: 'MacBook' },
            { icon: faVolumeUp, category: 'Speaker Assembly', prefix: 'MacBook' },
            { icon: faLaptop, category: 'Keyboard', prefix: 'MacBook' }
        ],
        airpods: [
            { icon: faBatteryFull, category: 'Battery', prefix: 'AirPods' },
            { icon: faVolumeUp, category: 'Speaker Driver', prefix: 'AirPods' },
            { icon: faMicrochip, category: 'Charging Case', prefix: 'AirPods' }
        ],
        applewatch: [
            { icon: faScrewdriver, category: 'Screen Assembly', prefix: 'Apple Watch' },
            { icon: faBatteryFull, category: 'Battery', prefix: 'Apple Watch' },
            { icon: faMicrochip, category: 'Logic Board', prefix: 'Apple Watch' },
            { icon: faHeart, category: 'Heart Rate Sensor', prefix: 'Apple Watch' }
        ]
    };

    // Function to generate replacement parts based on device and model
    const generateReplacementParts = (device, model) => {
        if (!device || !model || !commonParts[device]) return [];

        // Generate price based on device, model, and part type
        const getPriceForPart = (device, model, category) => {
            // Base prices by device type
            const basePrices = {
                iphone: { 'Screen Assembly': 149, 'Battery': 69, 'Speaker Assembly': 39, 'Camera Module': 89, 'Logic Board': 199 },
                ipad: { 'Screen Assembly': 199, 'Battery': 89, 'Speaker Assembly': 49, 'Camera Module': 79, 'Logic Board': 249 },
                macbook: { 'Display Assembly': 349, 'Battery': 129, 'Logic Board': 399, 'Speaker Assembly': 69, 'Keyboard': 149 },
                airpods: { 'Battery': 49, 'Speaker Driver': 39, 'Charging Case': 69 },
                applewatch: { 'Screen Assembly': 119, 'Battery': 49, 'Logic Board': 149, 'Heart Rate Sensor': 59 }
            };

            // Premium models have higher prices
            const isPremium = model.toLowerCase().includes('pro') || model.toLowerCase().includes('max');
            const modelIndex = deviceModels[device].indexOf(model);
            const isNewerModel = modelIndex < deviceModels[device].length / 2;

            let basePrice = basePrices[device][category] || 99;

            // Adjust price based on model
            if (isPremium) basePrice *= 1.3;
            if (isNewerModel) basePrice *= 1.2;

            return Math.round(basePrice * 100) / 100;
        };

        // Create parts for the selected device and model
        return commonParts[device].map((part, index) => {
            const price = getPriceForPart(device, model, part.category);
            const modelPrefix = model.replace(/"/g, ''); // Remove quotes from model name

            return {
                id: `${device}-${index}-${Math.floor(Math.random() * 1000)}`,
                name: `${part.category} for ${modelPrefix}`,
                price: price,
                icon: part.icon,
                description: `Genuine replacement ${part.category.toLowerCase()} for your ${modelPrefix}. Compatible with ${modelPrefix} models.`,
                compatibility: [model],
                partNumber: `${part.prefix}-${part.category.replace(/\s/g, '')}-${Math.floor(Math.random() * 10000)}`,
                stockLevel: Math.floor(Math.random() * 50) + 1, // Random stock level for demonstration
                reorderPoint: 10, // Sample reorder point
                supplier: 'iRevix Parts Co.', // Sample supplier
                lastRestocked: '2025-02-15' // Sample restock date
            };
        });
    };

    // Add these hooks for support request loading and polling

// Load support requests when the component mounts and when activeTab changes to 'support'
    useEffect(() => {
        if (!isLoading && activeTab === 'support') {
            // Get all requests from the service
            const allRequests = supportService.getAllRequests();
            setSupportRequests(allRequests);

            // Count unread messages
            const unreadCount = supportService.getUnreadCountForAdmin();
            setUnreadSupportRequests(unreadCount);
        }
    }, [isLoading, activeTab]);

// Poll for new support requests every 10 seconds, but only when on the support tab
    useEffect(() => {
        if (!isLoading && activeTab === 'support') {
            const interval = setInterval(() => {
                // Get all requests from the service
                const allRequests = supportService.getAllRequests();
                setSupportRequests(allRequests);

                // Count unread messages
                const unreadCount = supportService.getUnreadCountForAdmin();
                setUnreadSupportRequests(unreadCount);
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [isLoading, activeTab]);

    // Update inventory items when devices and models are selected
    useEffect(() => {
        if (selectedDevices.length > 0 && selectedModels.length > 0) {
            let allParts = [];
            // Generate parts for each selected device and model combination
            selectedDevices.forEach(deviceId => {
                const deviceModelsSelected = selectedModels.filter(model =>
                    deviceModels[deviceId].includes(model)
                );

                deviceModelsSelected.forEach(model => {
                    const parts = generateReplacementParts(deviceId, model);
                    // Add device and model info to each part
                    const partsWithInfo = parts.map(part => ({
                        ...part,
                        deviceType: devices.find(d => d.id === deviceId)?.name || deviceId,
                        modelType: model
                    }));
                    allParts = [...allParts, ...partsWithInfo];
                });
            });

            setInventoryItems(allParts);
        } else {
            setInventoryItems([]);
        }
    }, [selectedDevices, selectedModels]);

    const handleDeviceSelect = (deviceId) => {
        if (selectedDevices.includes(deviceId)) {
            // If already selected, remove it from selection
            const updatedDevices = selectedDevices.filter(d => d !== deviceId);
            setSelectedDevices(updatedDevices);

            // Also remove any models of this device from selected models
            const updatedModels = selectedModels.filter(model =>
                !deviceModels[deviceId].includes(model)
            );
            setSelectedModels(updatedModels);
        } else {
            // Add to selection
            setSelectedDevices([...selectedDevices, deviceId]);
        }
    };

    const handleModelSelect = (model, deviceId) => {
        if (selectedModels.includes(model)) {
            // If already selected, remove it
            setSelectedModels(selectedModels.filter(m => m !== model));
        } else {
            // Add to selection
            setSelectedModels([...selectedModels, model]);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return faTicketAlt;
            case 'system': return faCog;
            case 'user': return faUsers;
            case 'alert': return faBell;
            default: return faBell;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#28a745';
            case 'In Progress': return '#007bff';
            case 'Pending': return '#ffc107';
            case 'Awaiting Parts': return '#fd7e14';
            default: return '#6c757d';
        }
    };

    const getStockLevelColor = (stockLevel, reorderPoint) => {
        if (stockLevel <= reorderPoint * 0.5) return '#dc3545'; // Danger - below half of reorder point
        if (stockLevel <= reorderPoint) return '#ffc107'; // Warning - below reorder point
        return '#28a745'; // Good - above reorder point
    };
    // Function to generate revenue data for different time periods
    const getRevenueDataForPeriod = (period) => {
        // Base revenue data for 7 days
        const sevenDaysData = {
            today: 2450,
            thisWeek: 15680,
            thisMonth: 68450,
            lastMonth: 62340,
            repairsByType: [
                { type: 'Screen Replacements', count: 48, revenue: 7152 },
                { type: 'Battery Replacements', count: 36, revenue: 2484 },
                { type: 'Logic Board Repairs', count: 15, revenue: 4485 },
                { type: 'Water Damage', count: 12, revenue: 3600 },
                { type: 'Camera Modules', count: 9, revenue: 801 }
            ],
            deviceRevenue: [
                { device: 'iPhone', revenue: 32450, percent: 47.4 },
                { device: 'MacBook', revenue: 18700, percent: 27.3 },
                { device: 'iPad', revenue: 9800, percent: 14.3 },
                { device: 'Apple Watch', revenue: 4650, percent: 6.8 },
                { device: 'AirPods', revenue: 2850, percent: 4.2 }
            ],
            dailyRevenue: [
                { date: '2025-02-23', sales: 1930, repairs: 1480, total: 3410 },
                { date: '2025-02-24', sales: 2100, repairs: 1950, total: 4050 },
                { date: '2025-02-25', sales: 1820, repairs: 1350, total: 3170 },
                { date: '2025-02-26', sales: 2340, repairs: 1780, total: 4120 },
                { date: '2025-02-27', sales: 2560, repairs: 1840, total: 4400 },
                { date: '2025-02-28', sales: 2870, repairs: 2080, total: 4950 },
                { date: '2025-03-01', sales: 3060, repairs: 2450, total: 5510 }
            ],
            periodLabel: "Last 7 Days"
        };

        // Custom period data
        switch (period) {
            case 'today':
                return {
                    today: 2450,
                    thisWeek: 15680,
                    thisMonth: 68450,
                    lastMonth: 62340,
                    repairsByType: [
                        { type: 'Screen Replacements', count: 8, revenue: 1192 },
                        { type: 'Battery Replacements', count: 5, revenue: 345 },
                        { type: 'Logic Board Repairs', count: 2, revenue: 598 },
                        { type: 'Water Damage', count: 2, revenue: 600 },
                        { type: 'Camera Modules', count: 1, revenue: 89 }
                    ],
                    deviceRevenue: [
                        { device: 'iPhone', revenue: 1150, percent: 46.9 },
                        { device: 'MacBook', revenue: 680, percent: 27.8 },
                        { device: 'iPad', revenue: 350, percent: 14.3 },
                        { device: 'Apple Watch', revenue: 170, percent: 6.9 },
                        { device: 'AirPods', revenue: 100, percent: 4.1 }
                    ],
                    dailyRevenue: [
                        { date: '2025-03-01', sales: 3060, repairs: 2450, total: 5510 }
                    ],
                    periodLabel: "Today"
                };
            case '7days':
                return sevenDaysData;
            case '30days':
                return {
                    today: 2450,
                    thisWeek: 15680,
                    thisMonth: 72480,
                    lastMonth: 58340,
                    repairsByType: [
                        { type: 'Screen Replacements', count: 180, revenue: 26820 },
                        { type: 'Battery Replacements', count: 140, revenue: 9660 },
                        { type: 'Logic Board Repairs', count: 65, revenue: 19435 },
                        { type: 'Water Damage', count: 48, revenue: 14400 },
                        { type: 'Camera Modules', count: 42, revenue: 3738 }
                    ],
                    deviceRevenue: [
                        { device: 'iPhone', revenue: 45250, percent: 46.1 },
                        { device: 'MacBook', revenue: 28100, percent: 28.6 },
                        { device: 'iPad', revenue: 13800, percent: 14.1 },
                        { device: 'Apple Watch', revenue: 7050, percent: 7.2 },
                        { device: 'AirPods', revenue: 3950, percent: 4.0 }
                    ],
                    dailyRevenue: sevenDaysData.dailyRevenue.concat([
                        { date: '2025-01-31', sales: 2100, repairs: 1600, total: 3700 },
                        { date: '2025-02-01', sales: 2200, repairs: 1650, total: 3850 },
                        { date: '2025-02-02', sales: 1900, repairs: 1400, total: 3300 },
                        { date: '2025-02-03', sales: 2000, repairs: 1500, total: 3500 },
                        { date: '2025-02-04', sales: 2300, repairs: 1700, total: 4000 }
                        // Additional days could be added here
                    ]),
                    periodLabel: "Last 30 Days"
                };
            case '90days':
                return {
                    today: 2450,
                    thisWeek: 15680,
                    thisMonth: 72480,
                    lastMonth: 58340,
                    repairsByType: [
                        { type: 'Screen Replacements', count: 520, revenue: 77480 },
                        { type: 'Battery Replacements', count: 405, revenue: 27945 },
                        { type: 'Logic Board Repairs', count: 180, revenue: 53820 },
                        { type: 'Water Damage', count: 135, revenue: 40500 },
                        { type: 'Camera Modules', count: 120, revenue: 10680 }
                    ],
                    deviceRevenue: [
                        { device: 'iPhone', revenue: 98450, percent: 45.1 },
                        { device: 'MacBook', revenue: 62700, percent: 28.7 },
                        { device: 'iPad', revenue: 31800, percent: 14.6 },
                        { device: 'Apple Watch', revenue: 15650, percent: 7.2 },
                        { device: 'AirPods', revenue: 9850, percent: 4.5 }
                    ],
                    dailyRevenue: [
                        // For 90 days, we just show weekly aggregates to keep the chart readable
                        { date: '2024-12-01', sales: 12100, repairs: 9300, total: 21400 },
                        { date: '2024-12-15', sales: 13400, repairs: 10200, total: 23600 },
                        { date: '2024-12-31', sales: 15600, repairs: 11900, total: 27500 },
                        { date: '2025-01-15', sales: 14800, repairs: 11300, total: 26100 },
                        { date: '2025-01-31', sales: 16200, repairs: 12400, total: 28600 },
                        { date: '2025-02-15', sales: 17500, repairs: 13400, total: 30900 },
                        { date: '2025-03-01', sales: 19200, repairs: 14800, total: 34000 }
                    ],
                    periodLabel: "Last 90 Days"
                };
            default:
                return sevenDaysData;
        }
    };

    // Handler to open restock modal
    const handleRestockClick = (item) => {
        setRestockItem(item);
        setRestockQuantity(1);
        setIsRestockModalOpen(true);
    };

// Handler to submit restock form
    const handleRestockSubmit = () => {
        // Update the inventory item
        const updatedItems = inventoryItems.map(item => {
            if (item.id === restockItem.id) {
                return {
                    ...item,
                    stockLevel: item.stockLevel + parseInt(restockQuantity, 10),
                    lastRestocked: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
                };
            }
            return item;
        });

        setInventoryItems(updatedItems);
        setIsRestockModalOpen(false);
        setRestockItem(null);
        setRestockQuantity(1);
    };

// Handler to delete an inventory item
    const handleDeleteItem = (itemId, e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (window.confirm("Are you sure you want to delete this inventory item?")) {
            const updatedItems = inventoryItems.filter(item => item.id !== itemId);
            setInventoryItems(updatedItems);
        }
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    };

    // Function to export revenue report as CSV
    const exportRevenueReport = () => {
        try {
            // Get the current revenue data based on selected period
            const data = getRevenueDataForPeriod(revenuePeriod);

            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";

            // Add header and date
            csvContent += `iRevix Revenue Report - ${data.periodLabel}\r\n`;
            csvContent += `Generated on: ${new Date().toLocaleDateString()}\r\n\r\n`;

            // Add revenue summary
            csvContent += "Revenue Summary\r\n";
            csvContent += "Period,Amount\r\n";
            csvContent += `Today's Revenue,$${data.today.toLocaleString()}\r\n`;
            csvContent += `This Week,$${data.thisWeek.toLocaleString()}\r\n`;
            csvContent += `This Month,$${data.thisMonth.toLocaleString()}\r\n`;
            csvContent += `Last Month,$${data.lastMonth.toLocaleString()}\r\n`;
            csvContent += `Repair to Sales Ratio,65:35\r\n\r\n`;

            // Add revenue by device type
            csvContent += "Revenue by Device Type\r\n";
            csvContent += "Device,Revenue,Percentage\r\n";
            data.deviceRevenue.forEach(item => {
                csvContent += `${item.device},$${item.revenue.toLocaleString()},${item.percent}%\r\n`;
            });
            csvContent += "\r\n";

            // Add popular repair services
            csvContent += "Popular Repair Services\r\n";
            csvContent += "Repair Type,Count,Revenue\r\n";
            data.repairsByType.forEach(item => {
                csvContent += `${item.type},${item.count},$${item.revenue.toLocaleString()}\r\n`;
            });
            csvContent += "\r\n";

            // Add daily revenue data
            csvContent += `Revenue Data (${data.periodLabel})\r\n`;
            csvContent += "Date,Sales Revenue,Repair Revenue,Total Revenue\r\n";
            data.dailyRevenue.forEach(day => {
                csvContent += `${day.date},$${day.sales.toLocaleString()},$${day.repairs.toLocaleString()},$${day.total.toLocaleString()}\r\n`;
            });

            // Create a download link and trigger it
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `iRevix_Revenue_Report_${revenuePeriod}.csv`);
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Clean up
            document.body.removeChild(link);

            alert("Revenue report has been downloaded successfully!");
        } catch (error) {
            console.error("Error exporting revenue report:", error);
            alert("There was an error exporting the revenue report. Please try again.");
        }
    };

    // Function to get filtered inventory items
    const getFilteredInventoryItems = () => {
        // If checking low stock for all devices (no device selection)
        if (selectedDevices.length === 0 && showLowStockOnly) {
            let allLowStockItems = [];

            // Generate items for all devices and models
            for (const device of devices) {
                for (const model of deviceModels[device.id]) {
                    const deviceItems = generateReplacementParts(device.id, model);
                    // Only keep low stock items
                    const lowStockItems = deviceItems.filter(item => item.stockLevel <= item.reorderPoint);

                    // Add device and model info to items
                    const itemsWithDeviceInfo = lowStockItems.map(item => ({
                        ...item,
                        deviceType: device.name,
                        modelType: model
                    }));

                    allLowStockItems = [...allLowStockItems, ...itemsWithDeviceInfo];
                }
            }
            return allLowStockItems;
        }

        // If some devices are selected but no models, and showing low stock
        if (selectedDevices.length > 0 && selectedModels.length === 0 && showLowStockOnly) {
            let deviceLowStockItems = [];

            for (const deviceId of selectedDevices) {
                for (const model of deviceModels[deviceId]) {
                    const deviceItems = generateReplacementParts(deviceId, model);
                    // Only keep low stock items
                    const lowStockItems = deviceItems.filter(item => item.stockLevel <= item.reorderPoint);

                    // Add model info to items
                    const itemsWithModelInfo = lowStockItems.map(item => ({
                        ...item,
                        deviceType: devices.find(d => d.id === deviceId)?.name || deviceId,
                        modelType: model
                    }));

                    deviceLowStockItems = [...deviceLowStockItems, ...itemsWithModelInfo];
                }
            }
            return deviceLowStockItems;
        }

        // If specific devices and models selected
        if (selectedDevices.length > 0 && selectedModels.length > 0) {
            if (showLowStockOnly) {
                return inventoryItems.filter(item => item.stockLevel <= item.reorderPoint);
            }
            return inventoryItems;
        }

        // If no specific selection, return empty array
        return [];
    };

    const renderDashboard = () => (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome to the iRevix Admin Panel. Here's what's happening today.</p>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="stat-content">
                        <h3>425</h3>
                        <p>Today's Visitors</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faTicketAlt} />
                    </div>
                    <div className="stat-content">
                        <h3>12</h3>
                        <p>New Orders</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faTools} />
                    </div>
                    <div className="stat-content">
                        <h3>8</h3>
                        <p>Repairs in Progress</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                    <div className="stat-content">
                        <h3>$2,450</h3>
                        <p>Today's Revenue</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-recent">
                <div className="recent-notifications">
                    <h3>Recent Notifications</h3>
                    <div className="notification-list compact">
                        {notifications.slice(0, 3).map(notification => (
                            <div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                                <div className="notification-icon">
                                    <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                                </div>
                                <div className="notification-content">
                                    <p>{notification.message}</p>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                            </div>
                        ))}
                        <button className="view-all-btn" onClick={() => setActiveTab('notifications')}>View All Notifications</button>
                    </div>
                </div>

                <div className="recent-orders">
                    <h3>Recent Repair Orders</h3>
                    <div className="order-list compact">
                        {repairOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="order-item">
                                <div className="order-header">
                                    <h4>{order.id}</h4>
                                    <span className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>{order.status}</span>
                                </div>
                                <div className="order-details">
                                    <p>{order.customer} • {order.device}</p>
                                    <p>{order.problem}</p>
                                </div>
                            </div>
                        ))}
                        <button className="view-all-btn" onClick={() => setActiveTab('orders')}>View All Orders</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-traffic">
                <h3>Website Traffic (Last 7 Days)</h3>
                <div className="traffic-chart">
                    <div className="chart-bars">
                        {getTrafficDataForPeriod('7days').map((day, index) => (
                            <div key={index} className="chart-bar-container">
                                <div
                                    className="chart-bar stacked-bar"
                                    style={{ height: `${day.pageViews/10}px` }}
                                    onMouseEnter={() => setHoveredBar(index)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    {/* Inner bar showing visitors (blue portion) */}
                                    <div className="visitors-bar" style={{ height: `${(day.visitors/day.pageViews)*100}%` }}></div>

                                    {/* Tooltip that appears on hover */}
                                    {hoveredBar === index && (
                                        <div className="chart-tooltip">
                                            <div><strong>Date:</strong> {day.date}</div>
                                            <div><strong>Visitors:</strong> {day.visitors}</div>
                                            <div><strong>Page Views:</strong> {day.pageViews}</div>
                                            <div><strong>Conversions:</strong> {day.conversions}</div>
                                            <div><strong>Rate:</strong> {((day.conversions / day.visitors) * 100).toFixed(1)}%</div>
                                        </div>
                                    )}
                                </div>
                                <span className="chart-label">{day.date.substring(5)}</span>
                                <span className="chart-value">{day.visitors}</span>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-color visitors"></span>
                            <span>Visitors</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color page-views"></span>
                            <span>Page Views</span>
                        </div>
                    </div>
                    <div className="chart-note">
                        <p>Hover over bars to see detailed metrics</p>
                    </div>
                </div>
            </div>

            <div className="view-revenue-cta">
                <button className="view-revenue-btn" onClick={() => setActiveTab('revenue')}>
                    <FontAwesomeIcon icon={faMoneyBillWave} /> View Revenue Details
                </button>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2>Notifications</h2>
                <button className="mark-read-btn" onClick={markAllAsRead}>Mark All as Read</button>
            </div>

            <div className="notification-list">
                {notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                        <div className="notification-icon">
                            <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                        </div>
                        <div className="notification-content">
                            <p>{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTraffic = () => {
        // Get data for the current period
        const currentTrafficData = getTrafficDataForPeriod(trafficPeriod);

        // Get summary stats
        const summary = getTrafficSummary(currentTrafficData, trafficPeriod);

        const handlePeriodChange = (e) => {
            setTrafficPeriod(e.target.value);
            // Reset hovered bar when period changes
            setHoveredBar(null);
        };

        // Get the title based on period
        const getPeriodTitle = () => {
            switch (trafficPeriod) {
                case '7days': return 'Last 7 Days';
                case '30days': return 'Last 30 Days';
                case '90days': return 'Last 90 Days';
                default: return 'Last 7 Days';
            }
        };

        return (
            <div className="traffic-container">
                <div className="traffic-header">
                    <h2>Website Traffic</h2>
                    <div className="traffic-controls">
                        <select
                            className="date-range-select"
                            value={trafficPeriod}
                            onChange={handlePeriodChange}
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>
                </div>

                <div className="traffic-summary">
                    <div className="summary-card">
                        <h3>Total Visitors</h3>
                        <p className="summary-value">{summary.visitors.toLocaleString()}</p>
                        <p className={`summary-change ${summary.visitorChange.startsWith('+') ? 'positive' : 'negative'}`}>
                            {summary.visitorChange} from last period
                        </p>
                    </div>

                    <div className="summary-card">
                        <h3>Page Views</h3>
                        <p className="summary-value">{summary.pageViews.toLocaleString()}</p>
                        <p className={`summary-change ${summary.pageViewChange.startsWith('+') ? 'positive' : 'negative'}`}>
                            {summary.pageViewChange} from last period
                        </p>
                    </div>

                    <div className="summary-card">
                        <h3>Conversion Rate</h3>
                        <p className="summary-value">{summary.conversionRate}%</p>
                        <p className={`summary-change ${summary.conversionChange.startsWith('+') ? 'positive' : 'negative'}`}>
                            {summary.conversionChange} from last period
                        </p>
                    </div>

                    <div className="summary-card">
                        <h3>Avg. Session Duration</h3>
                        <p className="summary-value">{summary.avgSessionDuration}</p>
                        <p className={`summary-change ${summary.durationChange.startsWith('+') ? 'positive' : 'negative'}`}>
                            {summary.durationChange} from last period
                        </p>
                    </div>
                </div>

                {/* Enhanced Traffic Chart */}
                <div className="traffic-details">
                    <div className="traffic-chart-container">
                        <h3>Daily Traffic Overview ({getPeriodTitle()})</h3>
                        <div className="traffic-chart">
                            <div className="chart-bars">
                                {currentTrafficData.map((day, index) => (
                                    <div key={index} className="chart-bar-container">
                                        <div
                                            className="chart-bar stacked-bar"
                                            style={{ height: `${day.pageViews/10}px` }}
                                            onMouseEnter={() => setHoveredBar(index)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        >
                                            {/* Inner bar showing visitors (blue portion) */}
                                            <div className="visitors-bar" style={{ height: `${(day.visitors/day.pageViews)*100}%` }}></div>

                                            {/* Tooltip that appears on hover */}
                                            {hoveredBar === index && (
                                                <div className="chart-tooltip">
                                                    <div><strong>Date:</strong> {day.date}</div>
                                                    <div><strong>Visitors:</strong> {day.visitors}</div>
                                                    <div><strong>Page Views:</strong> {day.pageViews}</div>
                                                    <div><strong>Conversions:</strong> {day.conversions}</div>
                                                    <div><strong>Rate:</strong> {((day.conversions / day.visitors) * 100).toFixed(1)}%</div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="chart-label">{day.date.substring(5)}</span>
                                        <span className="chart-value">{day.visitors}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <span className="legend-color visitors"></span>
                                    <span>Visitors</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color page-views"></span>
                                    <span>Page Views</span>
                                </div>
                            </div>
                            <div className="chart-note">
                                <p>Hover over bars to see detailed metrics</p>
                            </div>
                        </div>
                    </div>
                    <div className="traffic-table-container">
                        <h3>Daily Traffic</h3>
                        <table className="traffic-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Visitors</th>
                                <th>Page Views</th>
                                <th>Conversions</th>
                                <th>Conversion Rate</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentTrafficData.map((day, index) => (
                                <tr key={index}>
                                    <td>{day.date}</td>
                                    <td>{day.visitors}</td>
                                    <td>{day.pageViews}</td>
                                    <td>{day.conversions}</td>
                                    <td>{((day.conversions / day.visitors) * 100).toFixed(2)}%</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrders = () => {
        // Function to filter orders based on selected filter
        const getFilteredOrders = () => {
            if (orderFilter === 'all') return repairOrders;
            return repairOrders.filter(order =>
                order.status.toLowerCase() === orderFilter.toLowerCase()
            );
        };

        return (
            <div className="orders-container">
                <div className="orders-header">
                    <h2>Repair Orders</h2>
                    <div className="orders-controls">
                        <select
                            className="filter-select"
                            value={orderFilter}
                            onChange={(e) => setOrderFilter(e.target.value)}
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="awaiting parts">Awaiting Parts</option>
                        </select>
                    </div>
                </div>

                <div className="orders-list">
                    <table className="orders-table">
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Device</th>
                            <th>Problem</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {getFilteredOrders().map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.device}</td>
                                <td>{order.problem}</td>
                                <td>
                                <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                {order.status}
                                </span>
                                </td>
                                <td>{order.date}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn view-btn" onClick={() => handleViewOrder(order)}>View</button>
                                        <button className="action-btn edit-btn" onClick={() => handleEditOrder(order)}>Edit</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* View Order Modal */}
                {isViewModalOpen && selectedOrder && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h2>Repair Order Details</h2>
                                <button className="close-button" onClick={() => setIsViewModalOpen(false)}>×</button>
                            </div>
                            <div className="modal-content">
                                <div className="order-detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Order ID:</span>
                                        <span className="detail-value">{selectedOrder.id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Customer:</span>
                                        <span className="detail-value">{selectedOrder.customer}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Device:</span>
                                        <span className="detail-value">{selectedOrder.device}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Problem:</span>
                                        <span className="detail-value">{selectedOrder.problem}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                                        {selectedOrder.status}
                                    </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Date:</span>
                                        <span className="detail-value">{selectedOrder.date}</span>
                                    </div>
                                </div>

                                <div className="additional-info">
                                    <h3>Additional Information</h3>
                                    <p>This repair order was created on {selectedOrder.date}. The customer has reported the following issue: {selectedOrder.problem}.</p>
                                    <p>The device is a {selectedOrder.device} and is currently marked as <strong>{selectedOrder.status}</strong>.</p>
                                </div>

                                <div className="modal-footer">
                                    <button className="modal-button secondary" onClick={() => setIsViewModalOpen(false)}>Close</button>
                                    <button className="modal-button primary" onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleEditOrder(selectedOrder);
                                    }}>Edit Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Order Modal */}
                {isEditModalOpen && editOrderData && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h2>Edit Repair Order</h2>
                                <button className="close-button" onClick={() => setIsEditModalOpen(false)}>×</button>
                            </div>
                            <div className="modal-content">
                                <form>
                                    <div className="form-group">
                                        <label>Order ID</label>
                                        <input type="text" name="id" value={editOrderData.id} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label>Customer Name</label>
                                        <input
                                            type="text"
                                            name="customer"
                                            value={editOrderData.customer}
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Device</label>
                                        <input
                                            type="text"
                                            name="device"
                                            value={editOrderData.device}
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Problem</label>
                                        <textarea
                                            name="problem"
                                            value={editOrderData.problem}
                                            onChange={handleInputChange}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            name="status"
                                            value={editOrderData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Awaiting Parts">Awaiting Parts</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="text"
                                            name="date"
                                            value={editOrderData.date}
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                </form>

                                <div className="modal-footer">
                                    <button className="modal-button secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button className="modal-button primary" onClick={handleSaveOrder}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Inventory tab
    const renderInventory = () => (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Inventory Management</h2>
                <div className="inventory-actions">
                    <button className="action-btn" onClick={exportInventoryReport}>
                        <FontAwesomeIcon icon={faListAlt} /> Generate Inventory Report
                    </button>
                    <button
                        className={`action-btn ${showLowStockOnly ? 'active' : ''}`}
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    >
                        <FontAwesomeIcon icon={faClipboardList} /> Check Low Stock
                    </button>
                </div>
            </div>

            <div className="inventory-selection">
                <div className="selection-section">
                    <h3>Select Devices</h3>
                    <div className="device-grid">
                        {devices.map(device => (
                            <div
                                key={device.id}
                                className={`device-card ${selectedDevices.includes(device.id) ? 'selected' : ''}`}
                                onClick={() => handleDeviceSelect(device.id)}
                            >
                                <FontAwesomeIcon icon={device.icon} className="device-icon" />
                                <p>{device.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedDevices.length > 0 && (
                    <div className="selection-section">
                        <h3>Select Models</h3>
                        <div className="model-selection-container">
                            {selectedDevices.map(deviceId => (
                                <div key={deviceId} className="device-models">
                                    <h4>{devices.find(d => d.id === deviceId)?.name} Models:</h4>
                                    <div className="model-buttons">
                                        {deviceModels[deviceId]?.map(model => (
                                            <button
                                                key={model}
                                                className={`model-button ${selectedModels.includes(model) ? 'selected' : ''}`}
                                                onClick={() => handleModelSelect(model, deviceId)}
                                            >
                                                <span className="model-name">{model}</span>
                                                <span className="model-selection-indicator">
                                        {selectedModels.includes(model) && (
                                            <FontAwesomeIcon icon={faCheck} size="xs" style={{ color: '#fff' }} />
                                        )}
                                    </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="inventory-items">
                <h3>
                    {showLowStockOnly ?
                        (selectedDevices.length > 0 && selectedModels.length > 0 ?
                            `Low Stock Items for Selected Models (${selectedModels.length} models)` :
                            'All Low Stock Items') :
                        (selectedDevices.length > 0 && selectedModels.length > 0 ?
                            `Inventory Items for Selected Models (${selectedModels.length} models)` :
                            'All Inventory Items')}
                    {showLowStockOnly && getFilteredInventoryItems().length === 0 &&
                        ' (No low stock items found)'}
                </h3>

                {getFilteredInventoryItems().length > 0 ? (
                    <table className="inventory-table">
                        <thead>
                        <tr>
                            {(selectedDevices.length === 0 || selectedModels.length === 0) && (
                                <>
                                    <th>Device</th>
                                    <th>Model</th>
                                </>
                            )}
                            <th>Part Number</th>
                            <th>Part Name</th>
                            <th>Description</th>
                            <th>Stock Level</th>
                            <th>Price</th>
                            <th>Supplier</th>
                            <th>Last Restocked</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {getFilteredInventoryItems().map(item => (
                            <tr key={item.id}>
                                {(selectedDevices.length === 0 || selectedModels.length === 0) && (
                                    <>
                                        <td>{item.deviceType}</td>
                                        <td>{item.modelType}</td>
                                    </>
                                )}
                                <td>{item.partNumber}</td>
                                <td>
                                    <div className="part-info">
                                        <FontAwesomeIcon icon={item.icon} />
                                        <span>{item.name}</span>
                                    </div>
                                </td>
                                <td>{item.description}</td>
                                <td>
                                    <span className="stock-level" style={{
                                        backgroundColor: getStockLevelColor(item.stockLevel, item.reorderPoint)
                                    }}>
                                    {item.stockLevel}
                                    </span>
                                </td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>{item.supplier}</td>
                                <td>{item.lastRestocked}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn restock-btn"
                                            onClick={() => handleRestockClick(item)}
                                        >
                                            Restock
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={(e) => handleDeleteItem(item.id, e)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-inventory-message">
                        {showLowStockOnly ?
                            "No low stock items found. All inventory levels are good!" :
                            selectedDevices.length > 0 ?
                                "No inventory items found for the selected device and model." :
                                "Please select a device and model to view inventory items, or use Check Low Stock to see all low inventory across all devices."}
                    </div>
                )}
            </div>

            {/* Restock Modal */}
            {isRestockModalOpen && restockItem && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Restock Inventory Item</h2>
                            <button className="close-button" onClick={() => setIsRestockModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <p><strong>Item:</strong> {restockItem.name}</p>
                            <p><strong>Current Stock:</strong> {restockItem.stockLevel}</p>
                            <div className="form-group">
                                <label>Add Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={restockQuantity}
                                    onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="form-summary">
                                <p>New Stock Level: <strong>{restockItem.stockLevel + parseInt(restockQuantity || 0, 10)}</strong></p>
                            </div>
                            <div className="modal-footer">
                                <button className="modal-button secondary" onClick={() => setIsRestockModalOpen(false)}>Cancel</button>
                                <button
                                    className="modal-button primary"
                                    onClick={handleRestockSubmit}
                                    disabled={!restockQuantity || restockQuantity <= 0}
                                >
                                    Confirm Restock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    const renderSupportRequests = () => {
        const markAsRead = (id) => {
            const updatedRequest = supportService.markAsReadByAdmin(id);

            if (updatedRequest) {
                // Update in the state
                setSupportRequests(supportRequests.map(req =>
                    req.id === id ? updatedRequest : req
                ));

                // Update unread count
                setUnreadSupportRequests(prev => Math.max(0, prev - 1));
            }
        };

        // Function to mark all as read
        const markAllAsRead = () => {
            const updatedRequests = [...supportRequests];

            updatedRequests.forEach(req => {
                if (!req.isRead) {
                    supportService.markAsReadByAdmin(req.id);
                }
            });

            // Update all requests as read in state
            setSupportRequests(updatedRequests.map(req => ({...req, isRead: true})));
            setUnreadSupportRequests(0);
        };

        // Status and priority badge helpers
        const getStatusBadgeClass = (status) => {
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

        // Get filtered requests
        const getFilteredRequests = () => {
            if (supportFilter === 'all') {
                return supportRequests;
            }

            return supportRequests.filter(request =>
                request.status.toLowerCase() === supportFilter.toLowerCase()
            );
        };

        // View request details
        const viewRequestDetails = (request) => {
            setSelectedRequest(request);
            if (!request.isRead) {
                markAsRead(request.id);
            }
        };

        // Close request details
        const closeRequestDetails = () => {
            setSelectedRequest(null);
        };

        const sendReply = () => {
            if (!replyText.trim() || !selectedRequest) return;

            const updatedRequest = supportService.addMessage(
                selectedRequest.id,
                'agent',
                'Admin Support',
                replyText
            );

            if (updatedRequest) {
                // Update in the state
                setSupportRequests(supportRequests.map(req =>
                    req.id === updatedRequest.id ? updatedRequest : req
                ));

                // Update selected request
                setSelectedRequest(updatedRequest);

                // Clear reply text
                setReplyText('');
            }
        };

        // Render request details modal
        const renderRequestDetails = () => {
            if (!selectedRequest) return null;

            return (
                <div className="request-details-overlay">
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

                            <div className="detail-item">
                                <span className="detail-label">Customer:</span>
                                <span>{selectedRequest.customer}</span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <span>{selectedRequest.email}</span>
                            </div>
                        </div>

                        <div className="request-description-full">
                            <h3>Description</h3>
                            <p>{selectedRequest.description}</p>
                        </div>

                        <div className="messages-container">
                            <h3>Conversation</h3>
                            {selectedRequest.messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.sender === 'customer' ? 'customer-message' : message.sender === 'agent' ? 'agent-message' : 'system-message'}`}
                                >
                                    {message.sender === 'agent' && (
                                        <div className="message-sender">
                                            <strong>{message.agentName}</strong> (Support Agent)
                                        </div>
                                    )}

                                    {message.sender === 'customer' && (
                                        <div className="message-sender">
                                            <strong>{selectedRequest.customer}</strong> (Customer)
                                        </div>
                                    )}

                                    <div className="message-content">{message.message}</div>
                                    <div className="message-date">{message.date}</div>
                                </div>
                            ))}
                        </div>

                        {selectedRequest.status !== 'Closed' && (
                            <div className="reply-container">
                                <h3>Reply to Customer</h3>
                                <textarea
                                    placeholder="Type your reply to the customer here..."
                                    className="reply-textarea"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                ></textarea>
                                <div className="reply-actions">
                                    <button
                                        className="send-reply-button"
                                        onClick={sendReply}
                                        disabled={!replyText.trim()}
                                    >
                                        Send Reply
                                    </button>
                                    <button
                                        className="close-request-button"
                                        onClick={() => {
                                            const updatedRequest = supportService.closeRequest(selectedRequest.id);

                                            if (updatedRequest) {
                                                // Update in the state
                                                setSupportRequests(supportRequests.map(req =>
                                                    req.id === updatedRequest.id ? updatedRequest : req
                                                ));

                                                // Update selected request
                                                setSelectedRequest(updatedRequest);
                                            }
                                        }}
                                    >
                                        Mark as Resolved
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        return (
            <div className="support-container admin-support">
                {selectedRequest && renderRequestDetails()}

                <div className="support-header">
                    <h2>Customer Support Requests</h2>
                    <div className="support-actions">
                        <button className="mark-read-btn" onClick={markAllAsRead}>
                            Mark All as Read
                        </button>
                        <div className="filter-container">
                            <select
                                className="filter-select"
                                value={supportFilter}
                                onChange={(e) => setSupportFilter(e.target.value)}
                            >
                                <option value="all">All Requests</option>
                                <option value="open">Open</option>
                                <option value="in progress">In Progress</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {supportRequests.length === 0 ? (
                    <div className="empty-state">
                        <h3>No support requests found</h3>
                        <p>There are currently no customer support requests.</p>
                    </div>
                ) : (
                    <div className="requests-list">
                        {getFilteredRequests().map(request => (
                            <div
                                key={request.id}
                                className={`request-card ${!request.isRead ? 'unread' : ''}`}
                                onClick={() => viewRequestDetails(request)}
                            >
                                <div className="request-header">
                                    <h3 className="request-title">
                                        {!request.isRead && <span className="unread-indicator"></span>}
                                        {request.title}
                                    </h3>
                                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                                    {request.status}
                                </span>
                                </div>

                                <div className="request-meta">
                                    <div className="request-date">{request.date}</div>
                                    <div className={`priority-badge ${getPriorityBadgeClass(request.priority)}`}>
                                        {request.priority} Priority
                                    </div>
                                    <div className="request-category">{request.category}</div>
                                    <div className="request-customer">
                                        <strong>Customer:</strong> {request.customer}
                                    </div>
                                </div>

                                <p className="request-description">
                                    {request.description.length > 100
                                        ? `${request.description.substring(0, 100)}...`
                                        : request.description}
                                </p>

                                <div className="request-footer">
                                <span className="message-count">
                                    {request.messages.length} message{request.messages.length !== 1 ? 's' : ''}
                                </span>
                                    <button className="view-details-button">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };


// Revenue Tab
    const renderRevenue = () => {
        // Get the revenue data for the selected period
        const revenueData = getRevenueDataForPeriod(revenuePeriod);

        // Handle period change
        const handleRevenuePeriodChange = (e) => {
            setRevenuePeriod(e.target.value);
            // Reset hovered bar when period changes
            setHoveredRevenueBar(null);
        };

        return (
            <div className="revenue-container">
                <div className="revenue-header">
                    <h2>Revenue Dashboard</h2>
                    <div className="revenue-controls">
                        <select
                            className="date-range-select"
                            value={revenuePeriod}
                            onChange={handleRevenuePeriodChange}
                        >
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                        <button className="export-btn" onClick={exportRevenueReport}>Export Report</button>
                    </div>
                </div>

                <div className="revenue-summary">
                    <div className="summary-card">
                        <h3>Today's Revenue</h3>
                        <p className="summary-value">${revenueData.today.toLocaleString()}</p>
                        <p className="summary-change positive">+14.2% from yesterday</p>
                    </div>

                    <div className="summary-card">
                        <h3>This Week</h3>
                        <p className="summary-value">${revenueData.thisWeek.toLocaleString()}</p>
                        <p className="summary-change positive">+8.5% from last week</p>
                    </div>

                    <div className="summary-card">
                        <h3>This Month</h3>
                        <p className="summary-value">${revenueData.thisMonth.toLocaleString()}</p>
                        <p className="summary-change positive">+9.8% from last month</p>
                    </div>

                    <div className="summary-card">
                        <h3>Repair to Sales Ratio</h3>
                        <p className="summary-value">65:35</p>
                        <p className="summary-change neutral">No change from last month</p>
                    </div>
                </div>
                {/* Revenue Chart */}
                <div className="revenue-chart-container">
                    <h3 style={{ marginBottom: '30px' }}>Revenue Data ({revenueData.periodLabel})</h3>
                    <div className="revenue-chart" style={{ marginTop: '50px' }}>
                        <div className={`chart-bars ${revenuePeriod === 'today' ? 'single-day-chart' : ''}`}>
                            {(() => {
                                // Calculate maximum value to determine scaling factor
                                const maxTotal = Math.max(...revenueData.dailyRevenue.map(day => day.total));
                                // Adjust scaling factor to ensure maximum height is around 220px
                                const scalingFactor = Math.max(maxTotal / 220, 10);

                                return revenueData.dailyRevenue.map((day, index) => (
                                    <div key={index} className="chart-bar-container revenue-bar-container">
                                        <div
                                            className="chart-bar revenue-total-bar"
                                            style={{
                                                height: `${day.total/scalingFactor}px`,
                                                maxHeight: '220px',
                                                width: revenuePeriod === 'today' ? '150px' : '100%' // Make the single bar wider
                                            }}
                                            onMouseEnter={() => setHoveredRevenueBar(index)}
                                            onMouseLeave={() => setHoveredRevenueBar(null)}
                                        >
                                            <div className="revenue-bar-inner">
                                                <div className="revenue-repair" style={{ height: `${(day.repairs/day.total)*100}%` }}></div>
                                                <div className="revenue-sales" style={{ height: `${(day.sales/day.total)*100}%` }}></div>
                                            </div>

                                            {/* Tooltip that appears on hover */}
                                            {hoveredRevenueBar === index && (
                                                <div className="chart-tooltip">
                                                    <div><strong>Date:</strong> {day.date}</div>
                                                    <div><strong>Total Revenue:</strong> ${day.total.toLocaleString()}</div>
                                                    <div><strong>Repair Revenue:</strong> ${day.repairs.toLocaleString()} ({((day.repairs/day.total)*100).toFixed(1)}%)</div>
                                                    <div><strong>Sales Revenue:</strong> ${day.sales.toLocaleString()} ({((day.sales/day.total)*100).toFixed(1)}%)</div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="chart-label">{day.date.substring(5)}</span>
                                        <span className="chart-value">${day.total.toLocaleString()}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-color repairs"></span>
                                <span>Repair Revenue</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color sales"></span>
                                <span>Parts Sales</span>
                            </div>
                        </div>
                        <div className="chart-note">
                            <p>Hover over bars to see detailed revenue breakdown</p>
                        </div>
                    </div>
                </div>

                <div className="revenue-charts">
                    <div className="chart-container">
                        <h3>Revenue by Device Type</h3>
                        <table className="revenue-table">
                            <thead>
                            <tr>
                                <th>Device</th>
                                <th>Revenue</th>
                                <th>Percentage</th>
                            </tr>
                            </thead>
                            <tbody>
                            {revenueData.deviceRevenue.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.device}</td>
                                    <td>${item.revenue.toLocaleString()}</td>
                                    <td>
                                        <div className="percent-bar-container">
                                            <div className="percent-bar" style={{ width: `${item.percent}%` }}></div>
                                            <span>{item.percent}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="chart-container">
                        <h3>Popular Repair Services</h3>
                        <table className="revenue-table">
                            <thead>
                            <tr>
                                <th>Repair Type</th>
                                <th>Count</th>
                                <th>Revenue</th>
                            </tr>
                            </thead>
                            <tbody>
                            {revenueData.repairsByType.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.type}</td>
                                    <td>{item.count}</td>
                                    <td>${item.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-page">
            <Navbar />
            <div className="admin-panel">
                <div className="admin-container">
                    <div className="admin-sidebar">
                        <div className="sidebar-header">
                            <h2>Admin Panel</h2>
                        </div>

                        <ul className="sidebar-menu">
                            <li
                                className={`sidebar-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dashboard')} // Navigate to dashboard tab when clicked
                            >
                                <FontAwesomeIcon icon={faChartLine} className="sidebar-icon" />
                                <span>Dashboard</span>
                            </li>

                            <li
                                className={`sidebar-menu-item ${activeTab === 'revenue' ? 'active' : ''}`}
                                onClick={() => setActiveTab('revenue')}
                            >
                                <FontAwesomeIcon icon={faMoneyBillWave} className="sidebar-icon" />
                                <span>Revenue</span>
                            </li>

                            <li
                                className={`sidebar-menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
                                <span>Notifications</span>
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="badge">{notifications.filter(n => !n.isRead).length}</span>
                                )}
                            </li>

                            <li
                                className={`sidebar-menu-item ${activeTab === 'traffic' ? 'active' : ''}`}
                                onClick={() => setActiveTab('traffic')}
                            >
                                <FontAwesomeIcon icon={faUsers} className="sidebar-icon" />
                                <span>Traffic</span>
                            </li>

                            <li
                                className={`sidebar-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <FontAwesomeIcon icon={faTicketAlt} className="sidebar-icon" />
                                <span>Repair Orders</span>
                            </li>

                            <li
                                className={`sidebar-menu-item ${activeTab === 'inventory' ? 'active' : ''}`}
                                onClick={() => setActiveTab('inventory')}
                            >
                                <FontAwesomeIcon icon={faListAlt} className="sidebar-icon" />
                                <span>Inventory</span>
                            </li>

                            <li
                                className={`sidebar-menu-item ${activeTab === 'support' ? 'active' : ''}`}
                                onClick={() => setActiveTab('support')}
                            >
                                <FontAwesomeIcon icon={faHeadset} className="sidebar-icon" />
                                <span>Support Requests</span>
                                {unreadSupportRequests > 0 && (
                                    <span className="badge">{unreadSupportRequests}</span>
                                )}
                            </li>
                        </ul>


                    </div>

                    {/* Mobile Navigation */}
                    <div className="mobile-nav">
                        <div
                            className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <FontAwesomeIcon icon={faChartLine} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Dashboard</span>
                        </div>
                        <div
                            className={`mobile-nav-item ${activeTab === 'revenue' ? 'active' : ''}`}
                            onClick={() => setActiveTab('revenue')}
                        >
                            <FontAwesomeIcon icon={faMoneyBillWave} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Revenue</span>
                        </div>
                        <div
                            className={`mobile-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notifications')}
                        >
                            <FontAwesomeIcon icon={faBell} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Alerts</span>
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="mobile-badge">{notifications.filter(n => !n.isRead).length}</span>
                            )}
                        </div>
                        <div
                            className={`mobile-nav-item ${activeTab === 'traffic' ? 'active' : ''}`}
                            onClick={() => setActiveTab('traffic')}
                        >
                            <FontAwesomeIcon icon={faUsers} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Traffic</span>
                        </div>
                        <div
                            className={`mobile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <FontAwesomeIcon icon={faTicketAlt} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Orders</span>
                        </div>
                        <div
                            className={`mobile-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
                            onClick={() => setActiveTab('inventory')}
                        >
                            <FontAwesomeIcon icon={faListAlt} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Inventory</span>
                        </div>
                        <div
                            className={`mobile-nav-item ${activeTab === 'support' ? 'active' : ''}`}
                            onClick={() => setActiveTab('support')}
                        >
                            <FontAwesomeIcon icon={faHeadset} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Support</span>
                            {unreadSupportRequests > 0 && (
                                <span className="mobile-badge">{unreadSupportRequests}</span>
                            )}
                        </div>
                    </div>

                    <div className="admin-content">
                        {isLoading ? (
                            <div className="loading-indicator">
                                <div className="spinner"></div>
                                <p>Loading...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'dashboard' && renderDashboard()}
                                {activeTab === 'revenue' && renderRevenue()}
                                {activeTab === 'notifications' && renderNotifications()}
                                {activeTab === 'traffic' && renderTraffic()}
                                {activeTab === 'orders' && renderOrders()}
                                {activeTab === 'inventory' && renderInventory()}
                                {activeTab === 'support' && renderSupportRequests()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;