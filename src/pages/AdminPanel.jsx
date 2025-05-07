import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import supportService from '../services/SupportService';
import axios from 'axios';
import ServicesTab from './ServicesTab';
import '../css/servicesTab.css';
import {
    getRepairs,
    getSupportRequests,
    getTrafficData,
    getRevenueData,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    updateRepair,
    updateSupportRequest,
    getDevicesAndModels,
    getInventoryParts,
    updateInventoryItem,
    deleteInventoryItem,
    fetchLowStockItems,
    createNotification,
    restockInventoryItem,
    createInventoryItem,
    adjustInventoryItemPrice
} from '../services/api';
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
    faRedo,
    faCheck,
    faHeadset, faClock
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import '../css/adminPanel.css';

function AdminPanel() {
    const navigate = useNavigate();
    const [revenuePeriod, setRevenuePeriod] = useState('7days');
    const [notifications, setNotifications] = useState([]);
    const [notificationFilter, setNotificationFilter] = useState('all');
    const [filteredInventoryItems, setFilteredInventoryItems] = useState([]);
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
    const [revenueData, setRevenueData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [devices, setDevices] = useState([]);
    const [deviceModels, setDeviceModels] = useState({});
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifiedLowStockItems, setNotifiedLowStockItems] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isPriceAdjustModalOpen, setIsPriceAdjustModalOpen] = useState(false);
    const [priceAdjustItem, setPriceAdjustItem] = useState(null);
    const [newPrice, setNewPrice] = useState(0);
    const [newItemData, setNewItemData] = useState({
        name: '',
        partNumber: '',
        description: '',
        stockLevel: 0,
        reorderPoint: 5,
        price: 0,
        supplier: '',
        deviceType: '',
        modelType: '',
        lastRestocked: new Date().toISOString().split('T')[0]
    });
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');

        if (!storedUser) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'admin') {
            navigate('/login');
        }
    }, [navigate]);
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setEditOrderData({...order});
        setIsEditModalOpen(true);
    };

    const handleSaveOrder = async () => {
        try {
            const originalOrder = repairOrders.find(order =>
                (order._id === editOrderData._id || order.id === editOrderData.id)
            );
            const orderId = editOrderData.id;
            const updateData = {
                problem: editOrderData.problem,
                status: editOrderData.status
            };
            const updatedOrder = await updateRepair(orderId, updateData);
            const updatedOrders = repairOrders.map(order =>
                order.id === orderId ? updatedOrder : order
            );

            setRepairOrders(updatedOrders);
            setIsEditModalOpen(false);
            if (originalOrder && originalOrder.status !== updatedOrder.status) {
                await createNotification({
                    type: 'order',
                    message: `Repair order for ${updatedOrder.customer}'s ${updatedOrder.device} status changed from "${originalOrder.status}" to "${updatedOrder.status}".`,
                    time: 'just now'
                });
                window.dispatchEvent(new Event('notification-update'));
                const notificationsData = await getNotifications();
                setNotifications(notificationsData);
                const unreadCount = notificationsData.filter(n => !n.isRead).length;
                setUnreadNotifications(unreadCount);
            }
            alert(`Repair order for ${updatedOrder.customer}'s ${updatedOrder.device} has been updated.`);
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order. Please try again.');
        }
    };

    const checkLowStockItems = async () => {
        try {
            const lowStockItems = await fetchLowStockItems();
            let newNotifications = false;
            const updatedNotifiedItems = [...notifiedLowStockItems];
            for (const item of lowStockItems) {
                const itemKey = `${item.id}-${item.stockLevel}`;
                if (!notifiedLowStockItems.includes(itemKey)) {
                    if (item.stockLevel <= item.reorderPoint * 0.5) {
                        await createNotification({
                            type: 'alert',
                            message: `CRITICAL: ${item.name} for ${item.deviceType} ${item.modelType} is critically low (${item.stockLevel} units remaining).`,
                            time: 'just now'
                        });
                        window.dispatchEvent(new Event('notification-update'));
                        newNotifications = true;
                    } else if (item.stockLevel <= item.reorderPoint) {
                        await createNotification({
                            type: 'alert',
                            message: `CRITICAL: ${item.name} for ${item.deviceType} ${item.modelType} is critically low (${item.stockLevel} units remaining).`,
                            time: 'just now'
                        });
                        window.dispatchEvent(new Event('notification-update'));
                        newNotifications = true;
                    }
                    updatedNotifiedItems.push(itemKey);
                    trackLowStockItem(itemKey);
                }
            }
            if (updatedNotifiedItems.length !== notifiedLowStockItems.length) {
                setNotifiedLowStockItems(updatedNotifiedItems);
                localStorage.setItem('notifiedLowStockItems', JSON.stringify(updatedNotifiedItems));
            }
            if (newNotifications) {
                const notificationsData = await getNotifications();
                setNotifications(notificationsData);
                const unreadCount = notificationsData.filter(n => !n.isRead).length;
                setUnreadNotifications(unreadCount);
            }
            cleanupNotificationTracking();
        } catch (error) {
            console.error('Error checking low stock items:', error);
        }
    };
    useEffect(() => {
        if (activeTab === 'inventory' && !isLoading) {
            checkLowStockItems();
        }
    }, [activeTab, isLoading]);
    const trackLowStockItem = (itemKey) => {
        const trackedKeys = JSON.parse(localStorage.getItem('notifiedLowStockItemsTimestamp') || '{}');
        trackedKeys[itemKey] = Date.now();
        localStorage.setItem('notifiedLowStockItemsTimestamp', JSON.stringify(trackedKeys));
    };
    const cleanupNotificationTracking = () => {
        try {
            const keysToKeep = [];
            inventoryItems.forEach(item => {
                if (item.stockLevel <= item.reorderPoint) {
                    const itemKey = `${item.id}-${item.stockLevel}`;
                    keysToKeep.push(itemKey);
                }
            });
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const trackedKeys = JSON.parse(localStorage.getItem('notifiedLowStockItemsTimestamp') || '{}');
            const currentTrackedKeys = {};
            const prunedNotifiedItems = notifiedLowStockItems.filter(key => {
                if (keysToKeep.includes(key)) {
                    currentTrackedKeys[key] = Date.now();
                    return true;
                }
                const timestamp = trackedKeys[key] || 0;
                if (timestamp > yesterday.getTime()) {
                    currentTrackedKeys[key] = timestamp;
                    return true;
                }
                return false;
            });
            if (prunedNotifiedItems.length !== notifiedLowStockItems.length) {
                setNotifiedLowStockItems(prunedNotifiedItems);
                localStorage.setItem('notifiedLowStockItems', JSON.stringify(prunedNotifiedItems));
                localStorage.setItem('notifiedLowStockItemsTimestamp', JSON.stringify(currentTrackedKeys));
            }
        } catch (error) {
            console.error('Error cleaning up notification tracking:', error);
        }
    };
    useEffect(() => {
        if (!isLoading) {
            cleanupNotificationTracking();
        }
    }, [isLoading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditOrderData({
            ...editOrderData,
            [name]: value
        });
    };
    const handleLowStockToggle = () => {
        console.log("Toggle low stock, current value:", showLowStockOnly);
        setShowLowStockOnly(!showLowStockOnly);
        checkLowStockItems();
    };
    const markSingleNotificationAsRead = async (notification) => {
        try {
            const notificationId = notification.id || notification._id;
            console.log('Marking notification as read:', notificationId);
            const updatedNotifications = notifications.map(notif =>
                notif.id === notificationId || notif._id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
            );

            setNotifications(updatedNotifications);
            const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
            console.log('Updated unread notifications count after marking one as read:', unreadCount);
            setUnreadNotifications(unreadCount);
            await markNotificationAsRead(notificationId);
            const freshNotifications = await getNotifications();
            setNotifications(freshNotifications);
            const freshUnreadCount = freshNotifications.filter(n => !n.isRead).length;
            console.log('Fresh unread notifications count after API call:', freshUnreadCount);
            setUnreadNotifications(freshUnreadCount);
            window.dispatchEvent(new Event('notification-update'));

        } catch (error) {
            console.error('Error marking notification as read:', error);
            const originalNotifications = await getNotifications();
            setNotifications(originalNotifications);
            const originalUnreadCount = originalNotifications.filter(n => !n.isRead).length;
            setUnreadNotifications(originalUnreadCount);
        }
    };
    const getFilteredNotifications = () => {
        if (notificationFilter === 'all') {
            return notifications.sort((a, b) => {
                if (a.isRead === false && b.isRead === true) return -1;
                if (a.isRead === true && b.isRead === false) return 1;
                return new Date(b.date) - new Date(a.date);
            });
        }
        return notifications
            .filter(notification => notification.type === notificationFilter)
            .sort((a, b) => {
                if (a.isRead === false && b.isRead === true) return -1;
                if (a.isRead === true && b.isRead === false) return 1;
                return new Date(b.date) - new Date(a.date);
            });
    };

    const exportInventoryReport = async () => {
        try {
            let reportItems = [];
            let reportTitle = "iRevix Full Inventory Report";
            if (selectedDevices.length > 0 && selectedModels.length > 0) {
                reportItems = inventoryItems;
                reportTitle = `iRevix Inventory Report - Selected Models (${selectedModels.length} models)`;
            } else {
                const allItems = [];
                for (const device of devices) {
                    for (const model of deviceModels[device.id]) {
                        try {
                            const deviceItems = await fetchReplacementParts(device.id, model);
                            const itemsWithInfo = deviceItems.map(item => ({
                                ...item,
                                deviceType: device.name,
                                modelType: model
                            }));
                            allItems.push(...itemsWithInfo);
                        } catch (error) {
                            console.error(`Error fetching parts for ${device.name} ${model}:`, error);
                        }
                    }
                }

                reportItems = allItems;
            }
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `${reportTitle}\r\n`;
            csvContent += `Generated on: ${new Date().toLocaleDateString()}\r\n\r\n`;
            csvContent += "Device,Model,Part Number,Part Name,Description,Stock Level,Reorder Point,Price,Supplier,Last Restocked\r\n";
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
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
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
    useEffect(() => {
        const savedNotifiedItems = localStorage.getItem('notifiedLowStockItems');
        if (savedNotifiedItems) {
            setNotifiedLowStockItems(JSON.parse(savedNotifiedItems));
        }
    }, []);
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const notificationsData = await getNotifications();
                setNotifications(notificationsData);
                const unreadNotificationCount = notificationsData.filter(n => !n.isRead).length;
                setUnreadNotifications(unreadNotificationCount);
                console.log('Initial unread notifications count:', unreadNotificationCount);
                const supportData = await getSupportRequests();
                setSupportRequests(supportData);
                const unreadSupportCount = supportData.filter(req => !req.isRead).length;
                setUnreadSupportRequests(unreadSupportCount);
                console.log('Initial unread support requests count:', unreadSupportCount);
                const trafficData = await getTrafficData(trafficPeriod);
                setWebsiteTraffic(trafficData);

                const repairsData = await getRepairs();
                setRepairOrders(repairsData);

                setIsLoading(false);
            } catch (error) {
                console.error('Error loading data:', error);
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);


    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                if (activeTab === 'revenue' || activeTab === 'dashboard') {
                    console.log('===== REVENUE DEBUG START =====');
                    console.log('Fetching revenue data for period:', revenuePeriod);
                    setIsLoading(true);
                    const timestamp = new Date().getTime();
                    console.log('Making API call with timestamp:', timestamp);

                    const data = await getRevenueData(revenuePeriod);
                    console.log('Raw API Response:', data);
                    console.log('Data type:', typeof data);
                    console.log('Has dailyRevenue:', data.hasOwnProperty('dailyRevenue'));
                    console.log('dailyRevenue type:', Array.isArray(data.dailyRevenue) ? 'array' : typeof data.dailyRevenue);
                    console.log('dailyRevenue length:', data.dailyRevenue ? data.dailyRevenue.length : 'N/A');
                    const expectedProps = ['dailyRevenue', 'deviceRevenue', 'repairsByType', 'today', 'thisWeek', 'thisMonth', 'lastMonth'];
                    expectedProps.forEach(prop => {
                        console.log(`Property ${prop} exists:`, data.hasOwnProperty(prop));
                        console.log(`Property ${prop} value:`, data[prop]);
                    });
                    const processedData = {
                        dailyRevenue: data.dailyRevenue || [],
                        deviceRevenue: data.deviceRevenue || [],
                        repairsByType: data.repairsByType || [],
                        today: data.today || 0,
                        thisWeek: data.thisWeek || 0,
                        thisMonth: data.thisMonth || 0,
                        lastMonth: data.lastMonth || 0,
                        repairSalesRatio: data.repairSalesRatio || '0:0',
                        periodLabel: data.periodLabel || revenuePeriod,
                        todayChange: data.todayChange || '0%',
                        weekChange: data.weekChange || '0%',
                        monthChange: data.monthChange || '0%'
                    };

                    console.log('Processed data:', processedData);
                    console.log('Setting revenueData state...');
                    setRevenueData(processedData);
                    setTimeout(() => {
                        console.log('Setting isLoading to false');
                        setIsLoading(false);
                        console.log('===== REVENUE DEBUG END =====');
                    }, 100);
                }
            } catch (error) {
                console.error('===== REVENUE ERROR =====');
                console.error('Error in revenue data fetch:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                const defaultData = {
                    dailyRevenue: [],
                    deviceRevenue: [],
                    repairsByType: [],
                    today: 0,
                    thisWeek: 0,
                    thisMonth: 0,
                    lastMonth: 0,
                    repairSalesRatio: '0:0',
                    periodLabel: revenuePeriod,
                    todayChange: '0%',
                    weekChange: '0%',
                    monthChange: '0%'
                };

                console.log('Setting default data due to error:', defaultData);
                setRevenueData(defaultData);
                console.log('Setting isLoading to false after error');
                setIsLoading(false);
                console.error('===== REVENUE ERROR END =====');
            }
        };

        if (activeTab === 'revenue' || activeTab === 'dashboard') {
            fetchRevenueData();
        }
    }, [revenuePeriod, activeTab]);
    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (activeTab === 'dashboard') {
                try {
                    let stats = {
                        todayVisitors: 0,
                        newOrders: 0,
                        repairsInProgress: 0,
                        todayRevenue: 0
                    };
                    const trafficData = await getTrafficData('7days');
                    if (trafficData && trafficData.length > 0) {
                        const todayData = trafficData[trafficData.length - 1];
                        stats.todayVisitors = todayData.visitors;
                    }
                    const repairsData = await getRepairs();
                    if (repairsData) {
                        const today = new Date().toISOString().split('T')[0];
                        stats.newOrders = repairsData.filter(order =>
                            order.date === today
                        ).length;
                        stats.repairsInProgress = repairsData.filter(order =>
                            order.status === 'In Progress'
                        ).length;
                    }
                    const revData = await getRevenueData('today');
                    if (revData) {
                        stats.todayRevenue = revData.today || 0;
                    }
                    setDashboardStats(stats);

                } catch (error) {
                    console.error('Error fetching dashboard stats:', error);
                    setDashboardStats(null);
                }
            }
        };
        fetchDashboardStats();
    }, [activeTab]); // This will trigger on tab changes and initial render
    const debugLog = (message, data) => {
        console.log(`DEBUG: ${message}`, data);
    };
    useEffect(() => {
        const fetchDevicesAndModels = async () => {
            try {
                const response = await axios.get('/api/inventory');
                const inventoryItems = response.data;

                debugLog("Raw inventory data (first 3 items):", inventoryItems.slice(0, 3));
                const uniqueDeviceTypes = [...new Set(
                    inventoryItems
                        .filter(item => item.deviceType) // Filter out null/undefined
                        .map(item => {
                            const deviceType = item.deviceType.charAt(0).toUpperCase() +
                                item.deviceType.slice(1).toLowerCase();
                            return deviceType;
                        })
                )];

                debugLog("Extracted unique device types:", uniqueDeviceTypes);
                const deviceIconMapping = {
                    'Iphone': faMobileAlt,
                    'iPhone': faMobileAlt,
                    'Ipad': faTabletScreenButton,
                    'iPad': faTabletScreenButton,
                    'Macbook': faLaptop,
                    'MacBook': faLaptop,
                    'Airpods': faHeadphones,
                    'AirPods': faHeadphones,
                    'Apple watch': faClock,
                    'Apple Watch': faClock,
                    'Applewatch': faClock
                };

                const extractedDevices = uniqueDeviceTypes
                    .map(deviceType => {
                        const id = deviceType.toLowerCase().replace(/\s+/g, '');
                        return {
                            id: id,
                            name: deviceType,
                            icon: deviceIconMapping[deviceType] || faMobileAlt
                        };
                    });

                debugLog("Mapped devices with IDs:", extractedDevices);
                setDevices(extractedDevices);
                const modelMapping = {};

                extractedDevices.forEach(device => {
                    const deviceInventory = inventoryItems.filter(item =>
                        item.deviceType &&
                        item.deviceType.toLowerCase() === device.name.toLowerCase()
                    );

                    debugLog(`Found ${deviceInventory.length} items for device ${device.name}`,
                        deviceInventory.slice(0, 2)); // Show just a couple items
                    const deviceModels = [...new Set(
                        deviceInventory
                            .filter(item => item.modelType) // Filter out null/undefined
                            .map(item => item.modelType)
                    )];

                    debugLog(`Models for ${device.name}:`, deviceModels);
                    modelMapping[device.id] = deviceModels;
                });

                setDeviceModels(modelMapping);
                debugLog("Final device models mapping:", modelMapping);

            } catch (error) {
                console.error('Error loading devices and models:', error);
                setDevices([
                    { id: 'iphone', name: 'iPhone', icon: faMobileAlt },
                    { id: 'ipad', name: 'iPad', icon: faTabletScreenButton },
                    { id: 'macbook', name: 'MacBook', icon: faLaptop },
                    { id: 'airpods', name: 'AirPods', icon: faHeadphones },
                    { id: 'applewatch', name: 'Apple Watch', icon: faClock }
                ]);
                setDeviceModels({
                    iphone: ['iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11 Pro', 'iPhone 11', 'iPhone XS', 'iPhone X'],
                    ipad: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad Mini', 'iPad'],
                    macbook: ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Pro 13"', 'MacBook Air'],
                    airpods: ['AirPods Pro', 'AirPods 3rd Gen', 'AirPods 2nd Gen', 'AirPods Max'],
                    applewatch: ['Apple Watch Series 7', 'Apple Watch Series 6', 'Apple Watch SE', 'Apple Watch Series 5']
                });
            }
        };

        fetchDevicesAndModels();
    }, []);

    const fetchReplacementParts = async (deviceId, model) => {
        if (!deviceId || !model) return [];

        try {
            console.log(`Fetching parts for device: ${deviceId}, model: ${model}`);
            const parts = await getInventoryParts(deviceId, model);
            console.log(`Received ${parts.length} parts for ${deviceId} ${model}`);
            return parts;
        } catch (error) {
            console.error(`Error fetching replacement parts for ${deviceId} ${model}:`, error);
            return []; // Return empty array on error
        }
    };
    useEffect(() => {
        if (!isLoading && activeTab === 'support') {
            const allRequests = supportService.getAllRequests();
            setSupportRequests(allRequests);
            const unreadCount = supportService.getUnreadCountForAdmin();
            setUnreadSupportRequests(unreadCount);
        }
    }, [isLoading, activeTab]);
    useEffect(() => {
        if (!isLoading && activeTab === 'support') {
            const interval = setInterval(() => {
                const allRequests = supportService.getAllRequests();
                setSupportRequests(allRequests);
                const unreadCount = supportService.getUnreadCountForAdmin();
                setUnreadSupportRequests(unreadCount);
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [isLoading, activeTab]);
    const forceRefreshNotifications = async () => {
        try {
            console.log('Force refreshing notifications...');
            const notificationsData = await getNotifications();
            setNotifications(notificationsData);
            const unreadCount = notificationsData.filter(n => !n.isRead).length;
            console.log(`Force refresh - unread count: ${unreadCount}`);
            setUnreadNotifications(unreadCount);

            return unreadCount;
        } catch (error) {
            console.error('Error force refreshing notifications:', error);
            return null;
        }
    };
    const fetchFilteredItems = async () => {
        try {
            debugLog("Starting filtering with:", {
                showLowStockOnly,
                selectedDevices,
                selectedModels,
                inventoryItemsCount: inventoryItems.length
            });

            let filteredItems = [];
            if (showLowStockOnly) {
                const lowStockItems = await fetchLowStockItems();
                debugLog("Fetched low stock items:", lowStockItems.length);
                filteredItems = lowStockItems.filter(item => {
                    const deviceMatch = selectedDevices.length === 0 ||
                        selectedDevices.some(deviceId => {
                            const device = devices.find(d => d.id === deviceId);
                            const deviceName = device ? device.name : deviceId;
                            const itemDeviceType = (item.deviceType || '').toLowerCase();
                            const selectedDeviceType = deviceName.toLowerCase();

                            const isMatch = itemDeviceType === selectedDeviceType;
                            if (isMatch) {
                                debugLog(`Device match: ${itemDeviceType} matches ${selectedDeviceType}`);
                            }
                            return isMatch;
                        });
                    const modelMatch = selectedModels.length === 0 ||
                        selectedModels.some(model => {
                            const itemModelType = (item.modelType || '').toLowerCase();
                            const selectedModelType = model.toLowerCase();

                            const isMatch = itemModelType === selectedModelType;
                            if (isMatch) {
                                debugLog(`Model match: ${itemModelType} matches ${selectedModelType}`);
                            }
                            return isMatch;
                        });

                    return deviceMatch && modelMatch;
                });

                debugLog(`Found ${filteredItems.length} filtered low stock items`);
            }
            else {
                if (selectedDevices.length === 0) {
                    filteredItems = inventoryItems;
                    debugLog(`Showing all ${filteredItems.length} inventory items`);
                }
                else if (selectedDevices.length > 0 && selectedModels.length === 0) {
                    filteredItems = inventoryItems.filter(item => {
                        return selectedDevices.some(deviceId => {
                            const device = devices.find(d => d.id === deviceId);
                            const deviceName = device ? device.name : deviceId;
                            const itemDeviceType = (item.deviceType || '').toLowerCase();
                            const selectedDeviceType = deviceName.toLowerCase();

                            return itemDeviceType === selectedDeviceType;
                        });
                    });

                    debugLog(`Found ${filteredItems.length} items for selected devices`);
                }
                else if (selectedDevices.length > 0 && selectedModels.length > 0) {
                    filteredItems = inventoryItems.filter(item => {
                        const deviceMatch = selectedDevices.some(deviceId => {
                            const device = devices.find(d => d.id === deviceId);
                            const deviceName = device ? device.name : deviceId;
                            const itemDeviceType = (item.deviceType || '').toLowerCase();
                            const selectedDeviceType = deviceName.toLowerCase();

                            return itemDeviceType === selectedDeviceType;
                        });
                        const modelMatch = selectedModels.some(model => {
                            const itemModelType = (item.modelType || '').toLowerCase();
                            const selectedModelType = model.toLowerCase();

                            return itemModelType === selectedModelType;
                        });

                        return deviceMatch && modelMatch;
                    });

                    debugLog(`Found ${filteredItems.length} items for selected devices and models`);
                }
            }
            if (selectedDevices.length > 0) {
                debugLog('Selected device IDs:', selectedDevices);
                debugLog('Selected device names:',
                    selectedDevices.map(id => devices.find(d => d.id === id)?.name));
            }
            if (selectedModels.length > 0) {
                debugLog('Selected models:', selectedModels);
            }
            if (filteredItems.length > 0) {
                debugLog('Sample filtered items:', filteredItems.slice(0, 2));
            }
            setFilteredInventoryItems(filteredItems);
        } catch (error) {
            console.error('Error fetching filtered inventory items:', error);
            setFilteredInventoryItems([]);
            alert(`Failed to fetch inventory items: ${error.message}`);
        }
    };
    useEffect(() => {
        fetchFilteredItems();
    }, [showLowStockOnly, selectedDevices, selectedModels, inventoryItems]);

    useEffect(() => {
        const fetchInventoryItems = async () => {
            try {
                if (selectedDevices.length > 0 && selectedModels.length > 0) {
                    console.log("Fetching inventory with selections:", {
                        devices: selectedDevices,
                        models: selectedModels
                    });

                    let allItems = [];
                    for (const deviceId of selectedDevices) {
                        const device = devices.find(d => d.id === deviceId);
                        const deviceName = device ? device.name : deviceId;

                        console.log(`Processing device: ${deviceId} -> ${deviceName}`);

                        for (const model of selectedModels) {
                            if (deviceModels[deviceId] && deviceModels[deviceId].includes(model)) {
                                try {
                                    console.log(`Fetching parts for device: ${deviceName}, model: ${model}`);
                                    const items = await getInventoryParts(deviceName, model);

                                    console.log(`Received ${items.length} parts from API for ${deviceName}/${model}`);
                                    const itemsWithDetails = items.map(item => ({
                                        ...item,
                                        deviceId: deviceId,
                                        deviceType: deviceName,
                                        modelType: model
                                    }));

                                    allItems = [...allItems, ...itemsWithDetails];
                                } catch (error) {
                                    console.error(`Error fetching items for ${deviceName} ${model}:`, error);
                                }
                            }
                        }
                    }

                    console.log('Total inventory items fetched:', allItems.length);

                    if (allItems.length > 0) {
                        console.log('Sample items:', allItems.slice(0, 2));
                    } else {
                        console.warn('No items found for the selected device/model combinations');
                    }
                    setInventoryItems(allItems);
                } else {
                    console.log("Not enough selections to fetch inventory", {
                        deviceCount: selectedDevices.length,
                        modelCount: selectedModels.length
                    });
                    setInventoryItems([]);
                }
            } catch (error) {
                console.error('Error fetching inventory items:', error);
                setInventoryItems([]);
            }
        };

        fetchInventoryItems();
    }, [selectedDevices, selectedModels, deviceModels, devices]);

    const handleDeviceSelect = (deviceId) => {
        debugLog("Device selection changed:", deviceId);

        if (selectedDevices.includes(deviceId)) {
            const updatedDevices = selectedDevices.filter(d => d !== deviceId);
            debugLog("Removing device from selection:", deviceId);
            debugLog("New device selection:", updatedDevices);
            setSelectedDevices(updatedDevices);
            const deviceModelsToRemove = deviceModels[deviceId] || [];
            debugLog("Models to potentially remove:", deviceModelsToRemove);

            const updatedModels = selectedModels.filter(model =>
                !deviceModelsToRemove.some(deviceModel =>
                    deviceModel.toLowerCase() === model.toLowerCase()
                )
            );

            debugLog("New model selection after device removal:", updatedModels);
            setSelectedModels(updatedModels);
        } else {
            const updatedDevices = [...selectedDevices, deviceId];
            debugLog("Adding device to selection:", deviceId);
            debugLog("New device selection:", updatedDevices);
            setSelectedDevices(updatedDevices);
        }
    };

    const handleModelSelect = (model, deviceId) => {
        debugLog("Model selection changed:", { model, deviceId });

        if (selectedModels.includes(model)) {
            debugLog("Removing model from selection:", model);
            const updatedModels = selectedModels.filter(m => m !== model);
            debugLog("New model selection:", updatedModels);
            setSelectedModels(updatedModels);
        } else {
            debugLog("Adding model to selection:", model);
            const updatedModels = [...selectedModels, model];
            debugLog("New model selection:", updatedModels);
            setSelectedModels(updatedModels);
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
    const handleRestockClick = (item) => {
        setRestockItem(item);
        setRestockQuantity(1);
        setIsRestockModalOpen(true);
    };

    const handleRestockSubmit = async () => {
        try {
            const updatedItem = await restockInventoryItem(restockItem.id, restockQuantity);
            console.log('Restock successful, received updated item:', updatedItem);
            const itemKeysToRemove = notifiedLowStockItems.filter(key =>
                key.startsWith(`${restockItem.id}-`)
            );

            if (itemKeysToRemove.length > 0) {
                const updatedNotifiedItems = notifiedLowStockItems.filter(key =>
                    !itemKeysToRemove.includes(key)
                );
                setNotifiedLowStockItems(updatedNotifiedItems);
                localStorage.setItem('notifiedLowStockItems', JSON.stringify(updatedNotifiedItems));
            }
            await createNotification({
                type: 'system',
                message: `${updatedItem.name} for ${updatedItem.deviceType} ${updatedItem.modelType} has been restocked (+${restockQuantity} units).`,
                time: 'just now'
            });
            window.dispatchEvent(new Event('notification-update'));
            const notificationsData = await getNotifications();
            setNotifications(notificationsData);
            if (selectedDevices.length > 0 && selectedModels.length > 0) {
                let allItems = [];

                for (const deviceId of selectedDevices) {
                    for (const model of selectedModels) {
                        if (deviceModels[deviceId]?.includes(model)) {
                            try {
                                console.log(`Refreshing inventory for ${deviceId} ${model}`);
                                const items = await getInventoryParts(deviceId, model);
                                const itemsWithDetails = items.map(item => ({
                                    ...item,
                                    deviceId: deviceId,
                                    deviceType: devices.find(d => d.id === deviceId)?.name || deviceId,
                                    modelType: model
                                }));

                                allItems = [...allItems, ...itemsWithDetails];
                            } catch (error) {
                                console.error(`Error refreshing items for ${deviceId} ${model}:`, error);
                            }
                        }
                    }
                }

                console.log('Refreshed inventory data with', allItems.length, 'items');
                setInventoryItems(allItems);
                if (showLowStockOnly) {
                    const lowStockItems = allItems.filter(item =>
                        item.stockLevel <= item.reorderPoint
                    );
                    setFilteredInventoryItems(lowStockItems);
                } else {
                    setFilteredInventoryItems(allItems);
                }
            }
            setIsRestockModalOpen(false);
            setRestockItem(null);
            setRestockQuantity(1);
            alert("Inventory item restocked successfully!");
        } catch (error) {
            console.error("Error restocking inventory item:", error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }

            alert("Failed to restock inventory item. Please try again.");
        }
    };
    const markAllAsRead = async () => {
        try {
            console.log('Marking all notifications as read');
            const updatedNotifications = notifications.map(notif => ({
                ...notif,
                isRead: true
            }));

            setNotifications(updatedNotifications);
            setUnreadNotifications(0);  // Set to 0 immediately
            await markAllNotificationsAsRead();
            const freshNotifications = await getNotifications();
            setNotifications(freshNotifications);
            const unreadCount = freshNotifications.filter(n => !n.isRead).length;
            console.log('Unread notifications count after marking all as read:', unreadCount);
            setUnreadNotifications(unreadCount);
            window.dispatchEvent(new Event('notification-update'));

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            const originalNotifications = await getNotifications();
            setNotifications(originalNotifications);
            const originalUnreadCount = originalNotifications.filter(n => !n.isRead).length;
            setUnreadNotifications(originalUnreadCount);
        }
    };
    const handleDeleteItem = async (itemId, e) => {
        e.stopPropagation(); // Prevent event bubbling

        if (window.confirm("Are you sure you want to delete this inventory item? This action cannot be undone.")) {
            try {
                await deleteInventoryItem(itemId);
                const itemKeysToRemove = notifiedLowStockItems.filter(key =>
                    key.startsWith(`${itemId}-`)
                );

                if (itemKeysToRemove.length > 0) {
                    const updatedNotifiedItems = notifiedLowStockItems.filter(key =>
                        !itemKeysToRemove.includes(key)
                    );
                    setNotifiedLowStockItems(updatedNotifiedItems);
                    localStorage.setItem('notifiedLowStockItems', JSON.stringify(updatedNotifiedItems));
                }
                const updatedItems = inventoryItems.filter(item => item.id !== itemId);
                setInventoryItems(updatedItems);
                if (filteredInventoryItems.length > 0) {
                    const updatedFilteredItems = filteredInventoryItems.filter(item => item.id !== itemId);
                    setFilteredInventoryItems(updatedFilteredItems);
                }
                alert("Inventory item deleted successfully.");
            } catch (error) {
                console.error("Error deleting inventory item:", error);
                alert("Failed to delete inventory item. Please try again.");
            }
        }
    };
    const handleOpenPriceAdjustModal = (item) => {
        setPriceAdjustItem(item);
        setNewPrice(item.price);
        setIsPriceAdjustModalOpen(true);
    };

    const handleSavePriceAdjustment = async () => {
        try {
            // Validate the new price
            const numericPrice = parseFloat(newPrice);
            if (isNaN(numericPrice) || numericPrice < 0) {
                alert('Please enter a valid price value.');
                return;
            }

            console.log('Sending price adjustment request for item:', priceAdjustItem.id);
            console.log('New price:', numericPrice);

            const updatedItem = await adjustInventoryItemPrice(priceAdjustItem.id, numericPrice);

            console.log('Received updated item:', updatedItem);

            // Update the item in the inventory items list
            const updatedItems = inventoryItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );

            setInventoryItems(updatedItems);
            setFilteredInventoryItems(updatedItems);
            setIsPriceAdjustModalOpen(false);

            alert(`Price for ${updatedItem.name} has been updated to $${updatedItem.price.toFixed(2)}.`);
        } catch (error) {
            console.error('Error in handleSavePriceAdjustment:', error);
            alert(`Failed to adjust price: ${error.message || 'Unknown error'}`);
        }
    };

    const handleNewItemInputChange = (e) => {
        const { name, value } = e.target;
        // Special handling for deviceType to reset modelType when device changes
        if (name === 'deviceType') {
            setNewItemData({ ...newItemData, deviceType: value, modelType: '' });
        } else {
            setNewItemData({ ...newItemData, [name]: value });
        }
    };

    const handleAddItemSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format the data for the API
            const itemData = {
                ...newItemData,
                stockLevel: parseInt(newItemData.stockLevel),
                reorderPoint: parseInt(newItemData.reorderPoint),
                price: parseFloat(newItemData.price),
                deviceType: newItemData.deviceType.toLowerCase() // Ensure lowercase for consistency
            };

            // Send data to the API
            await createInventoryItem(itemData);

            // Show success message
            alert("New inventory item added successfully!");

            // Close the modal and reset form
            setIsAddItemModalOpen(false);
            setNewItemData({
                name: '',
                partNumber: '',
                description: '',
                stockLevel: 0,
                reorderPoint: 5,
                price: 0,
                supplier: '',
                deviceType: '',
                modelType: '',
                lastRestocked: new Date().toISOString().split('T')[0]
            });

            // Refresh inventory data if appropriate selections are made
            if (selectedDevices.length > 0 && selectedModels.length > 0) {
                let deviceFound = false;
                let modelFound = false;

                // Check if the newly added item matches the current selection
                selectedDevices.forEach(deviceId => {
                    const device = devices.find(d => d.id === deviceId);
                    if (device && device.name.toLowerCase() === itemData.deviceType.toLowerCase()) {
                        deviceFound = true;
                    }
                });

                if (selectedModels.includes(itemData.modelType)) {
                    modelFound = true;
                }

                // If the new item matches the current selection, refresh the inventory
                if (deviceFound && modelFound) {
                    let allItems = [];
                    for (const deviceId of selectedDevices) {
                        for (const model of selectedModels) {
                            if (deviceModels[deviceId]?.includes(model)) {
                                try {
                                    const items = await getInventoryParts(deviceId, model);
                                    const itemsWithDetails = items.map(item => ({
                                        ...item,
                                        deviceId: deviceId,
                                        deviceType: devices.find(d => d.id === deviceId)?.name || deviceId,
                                        modelType: model
                                    }));
                                    allItems = [...allItems, ...itemsWithDetails];
                                } catch (error) {
                                    console.error(`Error refreshing items for ${deviceId} ${model}:`, error);
                                }
                            }
                        }
                    }
                    setInventoryItems(allItems);
                    setFilteredInventoryItems(
                        showLowStockOnly ? allItems.filter(item => item.stockLevel <= item.reorderPoint) : allItems
                    );
                }
            }
        } catch (error) {
            console.error("Error adding inventory item:", error);
            alert("Failed to add inventory item. Please try again.");
        }
    };

    const exportRevenueReport = () => {
        try {
            if (!revenueData) {
                alert("Revenue data is still loading. Please try again in a moment.");
                return;
            }
            const data = revenueData;
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `iRevix Revenue Report - ${data.periodLabel}\r\n`;
            csvContent += `Generated on: ${new Date().toLocaleDateString()}\r\n\r\n`;
            csvContent += "Revenue Summary\r\n";
            csvContent += "Period,Amount\r\n";
            csvContent += `Today's Revenue,$${data.today.toLocaleString()}\r\n`;
            csvContent += `This Week,$${data.thisWeek.toLocaleString()}\r\n`;
            csvContent += `This Month,$${data.thisMonth.toLocaleString()}\r\n`;
            csvContent += `Last Month,$${data.lastMonth.toLocaleString()}\r\n`;
            csvContent += `Repair to Sales Ratio,${data.repairSalesRatio}\r\n\r\n`;
            csvContent += "Revenue by Device Type\r\n";
            csvContent += "Device,Revenue,Percentage\r\n";
            data.deviceRevenue.forEach(item => {
                csvContent += `${item.device},$${item.revenue.toLocaleString()},${item.percent}%\r\n`;
            });
            csvContent += "\r\n";
            csvContent += "Popular Repair Services\r\n";
            csvContent += "Repair Type,Count,Revenue\r\n";
            data.repairsByType.forEach(item => {
                csvContent += `${item.type},${item.count},$${item.revenue.toLocaleString()}\r\n`;
            });
            csvContent += "\r\n";
            csvContent += `Revenue Data (${data.periodLabel})\r\n`;
            csvContent += "Date,Sales Revenue,Repair Revenue,Total Revenue\r\n";
            data.dailyRevenue.forEach(day => {
                csvContent += `${day.date},$${day.sales.toLocaleString()},$${day.repairs.toLocaleString()},$${day.total.toLocaleString()}\r\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `iRevix_Revenue_Report_${revenuePeriod}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("Revenue report has been downloaded successfully!");
        } catch (error) {
            console.error("Error exporting revenue report:", error);
            alert("There was an error exporting the revenue report. Please try again.");
        }
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
                        {dashboardStats ? (
                            <h3>{dashboardStats.todayVisitors}</h3>
                        ) : (
                            <h3><div className="loading-indicator-small"></div></h3>
                        )}
                        <p>Today's Visitors</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faTicketAlt} />
                    </div>
                    <div className="stat-content">
                        {dashboardStats ? (
                            <h3>{dashboardStats.newOrders}</h3>
                        ) : (
                            <h3><div className="loading-indicator-small"></div></h3>
                        )}
                        <p>New Orders</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faTools} />
                    </div>
                    <div className="stat-content">
                        {dashboardStats ? (
                            <h3>{dashboardStats.repairsInProgress}</h3>
                        ) : (
                            <h3><div className="loading-indicator-small"></div></h3>
                        )}
                        <p>Repairs in Progress</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                    </div>
                    <div className="stat-content">
                        {dashboardStats ? (
                            <h3>${dashboardStats.todayRevenue.toLocaleString()}</h3>
                        ) : (
                            <h3><div className="loading-indicator-small"></div></h3>
                        )}
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
                        {websiteTraffic.slice(0, 7).map((day, index) => (
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
                <div className="notification-actions">
                    <button
                        className="mark-read-btn"
                        onClick={markAllAsRead}  // Direct reference to the function
                    >
                        Mark All as Read
                    </button>
                    <select
                        className="notification-filter"
                        onChange={(e) => setNotificationFilter(e.target.value)}
                        value={notificationFilter}
                    >
                        <option value="all">All Notifications</option>
                        <option value="order">Order Updates</option>
                        <option value="system">System Messages</option>
                        <option value="user">User Notifications</option>
                        <option value="alert">Inventory Alerts</option>
                    </select>
                </div>
            </div>

            <div className="notification-list">
                {getFilteredNotifications().length === 0 ? (
                    <div className="empty-notifications">
                        <p>No notifications to display.</p>
                    </div>
                ) : (
                    getFilteredNotifications().map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''} notification-${notification.type}`}
                        >
                            <div className="notification-icon">
                                <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                <span className="notification-type">
                                    {notification.type === 'order' && 'Order Update'}
                                    {notification.type === 'system' && 'System Message'}
                                    {notification.type === 'user' && 'User Notification'}
                                    {notification.type === 'alert' && 'Inventory Alert'}
                                </span>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                                <p>{notification.message}</p>
                                {!notification.isRead && (
                                    <button
                                        className="mark-read-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Mark as Read button clicked for notification:', notification);
                                            markSingleNotificationAsRead(notification);
                                        }}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
    const loadInitialData = async () => {
        if (notifications.length > 0 && repairOrders.length > 0) {
            return;
        }

        try {
            setIsLoading(true);
            const [
                notificationsData,
                trafficData,
                repairsData,
                supportData,
                revenueData
            ] = await Promise.all([
                getNotifications(),
                getTrafficData(trafficPeriod),
                getRepairs(),
                getSupportRequests(),
                getRevenueData(revenuePeriod)
            ]);
            setNotifications(notificationsData);
            setWebsiteTraffic(trafficData);
            setRepairOrders(repairsData);
            setSupportRequests(supportData);
            setUnreadSupportRequests(supportData.filter(req => !req.isRead).length);
            setRevenueData(revenueData);
            if (activeTab === 'dashboard') {
                const stats = {
                    todayVisitors: trafficData[trafficData.length - 1]?.visitors || 0,
                    newOrders: repairsData.filter(order =>
                        order.date === new Date().toISOString().split('T')[0]
                    ).length,
                    repairsInProgress: repairsData.filter(order =>
                        order.status === 'In Progress'
                    ).length,
                    todayRevenue: revenueData.today || 0
                };
                setDashboardStats(stats);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (notifications.length === 0 || repairOrders.length === 0) {
            loadInitialData();
        }
    }, [activeTab]);

    const refreshNotifications = async () => {
        try {
            console.log('Refreshing notifications...');
            const notificationsData = await getNotifications();
            console.log('Refreshed notifications:', notificationsData.length, 'items');
            const processedNotifications = notificationsData.map(notification => ({
                ...notification,
                isRead: notification.isRead === true  // Explicitly convert to boolean
            }));
            const sortedNotifications = processedNotifications.sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

            setNotifications(sortedNotifications);
            const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
            console.log('Refreshed unread notifications count:', unreadCount);
            setUnreadNotifications(unreadCount);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        }
    };
    useEffect(() => {
        const fetchAndProcessNotifications = async () => {
            try {
                console.log('Fetching and processing notifications...');
                const notificationsData = await getNotifications();
                const sortedNotifications = notificationsData.sort((a, b) =>
                    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                );
                setNotifications(sortedNotifications);
                const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
                console.log('Updated unread notifications count:', unreadCount);
                setUnreadNotifications(unreadCount); // IMPORTANT: Fixed this line

            } catch (error) {
                console.error('Error refreshing notifications:', error);
            }
        };
        if (!isLoading && (activeTab === 'notifications' || activeTab === 'dashboard')) {
            fetchAndProcessNotifications();
        }
    }, [activeTab, isLoading]);

    useEffect(() => {
        if (!isLoading && inventoryItems.length > 0) {
            const checkForNewLowStockItems = async () => {
                try {
                    let newNotifications = false;
                    const updatedNotifiedItems = [...notifiedLowStockItems];
                    for (const item of inventoryItems) {
                        if (item.stockLevel <= item.reorderPoint) {
                            const itemKey = `${item.id}-${item.stockLevel}`;
                            if (!notifiedLowStockItems.includes(itemKey)) {
                                if (item.stockLevel <= item.reorderPoint * 0.5) {
                                    await createNotification({
                                        type: 'alert',
                                        message: `CRITICAL: ${item.name} for ${item.deviceType} ${item.modelType} is critically low (${item.stockLevel} units remaining).`,
                                        time: 'just now'
                                    });
                                    newNotifications = true;
                                } else if (item.stockLevel <= item.reorderPoint) {
                                    await createNotification({
                                        type: 'alert',
                                        message: `LOW STOCK: ${item.name} for ${item.deviceType} ${item.modelType} is running low (${item.stockLevel} units remaining).`,
                                        time: 'just now'
                                    });
                                    newNotifications = true;
                                }
                                updatedNotifiedItems.push(itemKey);
                            }
                        }
                    }
                    if (updatedNotifiedItems.length !== notifiedLowStockItems.length) {
                        setNotifiedLowStockItems(updatedNotifiedItems);
                        localStorage.setItem('notifiedLowStockItems', JSON.stringify(updatedNotifiedItems));
                    }
                    if (newNotifications) {
                        const notificationsData = await getNotifications();
                        setNotifications(notificationsData);
                    }
                } catch (error) {
                    console.error('Error checking for new low stock items:', error);
                }
            };
            if (activeTab === 'inventory') {
                checkForNewLowStockItems();
            }
        }
    }, [inventoryItems, isLoading, activeTab]);

    useEffect(() => {
        const POLLING_INTERVAL = 5000; // 5 seconds - shorter for more responsiveness
        if (!isLoading) {
            console.log('Setting up notification polling...');
            const interval = setInterval(async () => {
                try {
                    console.log('Polling for new notifications...');
                    const notificationsData = await getNotifications();
                    const unreadCount = notificationsData.filter(n => !n.isRead).length;
                    console.log(`Current unread count: ${unreadCount}`);
                    setUnreadNotifications(unreadCount);
                    if (JSON.stringify(notificationsData) !== JSON.stringify(notifications)) {
                        setNotifications(notificationsData);
                    }
                } catch (error) {
                    console.error('Error polling for notifications:', error);
                }
            }, POLLING_INTERVAL);
            return () => {
                console.log('Cleaning up notification polling...');
                clearInterval(interval);
            };
        }
    }, [isLoading]);

    const renderTraffic = () => {
        if (!websiteTraffic || websiteTraffic.length === 0) {
            return (
                <div className="traffic-container">
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Loading traffic data...</p>
                    </div>
                </div>
            );
        }
        const totalVisitors = websiteTraffic.reduce((sum, day) => sum + day.visitors, 0);
        const totalPageViews = websiteTraffic.reduce((sum, day) => sum + day.pageViews, 0);
        const totalConversions = websiteTraffic.reduce((sum, day) => sum + day.conversions, 0);
        const conversionRate = ((totalConversions / totalVisitors) * 100).toFixed(1);
        const firstDay = websiteTraffic[0];
        const lastDay = websiteTraffic[websiteTraffic.length - 1];

        const visitorGrowth = ((lastDay.visitors - firstDay.visitors) / firstDay.visitors) * 100;
        const pageViewGrowth = ((lastDay.pageViews - firstDay.pageViews) / firstDay.pageViews) * 100;
        const conversionGrowth = ((lastDay.conversions - firstDay.conversions) / firstDay.conversions) * 100;
        const formatGrowth = (growth) => {
            return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
        };
        const avgSessionSeconds = Math.floor((totalPageViews / totalVisitors) * 60);
        const avgSessionMinutes = Math.floor(avgSessionSeconds / 60);
        const avgSessionRemainingSeconds = avgSessionSeconds % 60;
        const formattedDuration = `${avgSessionMinutes}m ${avgSessionRemainingSeconds}s`;
        const summary = {
            visitors: totalVisitors,
            pageViews: totalPageViews,
            conversionRate: conversionRate,
            avgSessionDuration: formattedDuration,
            visitorChange: formatGrowth(visitorGrowth),
            pageViewChange: formatGrowth(pageViewGrowth),
            conversionChange: formatGrowth(conversionGrowth),
            durationChange: formatGrowth(visitorGrowth * 0.8) // Duration typically correlates with visitor growth
        };

        const handlePeriodChange = async (e) => {
            const newPeriod = e.target.value;
            setTrafficPeriod(newPeriod);
            setHoveredBar(null);

            try {
                setIsLoading(true);
                const trafficData = await getTrafficData(newPeriod);
                setWebsiteTraffic(trafficData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching traffic data:', error);
                setIsLoading(false);
            }
        };
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
                                {websiteTraffic.map((day, index) => (
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
                            {websiteTraffic.map((day, index) => (
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
    const renderInventory = () => (
        <div className="inventory-container">
            <div className="inventory-header">
                <h2>Inventory Management</h2>
                <div className="inventory-actions">
                    <button className="action-btn" onClick={exportInventoryReport}>
                        <FontAwesomeIcon icon={faListAlt} /> Generate Inventory Report
                    </button>
                    <button className="action-btn" onClick={() => setIsAddItemModalOpen(true)}>
                        <FontAwesomeIcon icon={faMicrochip} /> Add New Item
                    </button>
                    <button
                        className={`action-btn ${showLowStockOnly ? 'low-stock-active' : ''}`}
                        onClick={handleLowStockToggle}
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
                    {showLowStockOnly && filteredInventoryItems.length === 0 &&
                        ' (No low stock items found)'}
                </h3>

                {filteredInventoryItems.length > 0 ? (
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
                        {filteredInventoryItems.map(item => (
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
                                    {(() => {
                                        const stockNum = Number(item.stockLevel);
                                        const reorderNum = Number(item.reorderPoint);
                                        console.log(`Item ${item.name}: Stock=${stockNum}, Reorder=${reorderNum}`);
                                        return (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {/* Original element */}
                                                <span className="stock-level" style={{
                                                    backgroundColor: stockNum <= reorderNum * 0.9 ? '#dc3545' :
                                                        stockNum <= reorderNum ? '#ffc107' :
                                                            '#28a745'
                                                }}>
                    {stockNum}
                </span>

                                                {/* Diagnostic text element */}
                                                <div style={{ fontSize: '12px' }}>
                                                    <div>Stock: {stockNum}</div>
                                                    <div>Reorder: {reorderNum}</div>
                                                    <div>Ratio: {(stockNum / reorderNum).toFixed(2)}</div>
                                                    <div style={{
                                                        fontWeight: 'bold',
                                                        color: stockNum <= reorderNum * 0.9 ? '#dc3545' :
                                                            stockNum <= reorderNum ? '#ffc107' :
                                                                '#28a745'
                                                    }}>
                                                        {stockNum <= reorderNum * 0.9 ? 'CRITICAL' :
                                                            stockNum <= reorderNum ? 'LOW' :
                                                                'GOOD'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
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
                                            className="adjust-price-btn green-btn"
                                            onClick={() => handleOpenPriceAdjustModal(item)}
                                        >
                                            <FontAwesomeIcon icon={faMoneyBillWave} /> Adjust Price
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
            {/* Price Adjustment Modal */}
            {isPriceAdjustModalOpen && priceAdjustItem && (
                <div className="modal-overlay">
                    <div className="price-adjust-modal">
                        <div className="modal-header">
                            <h2>
                                <FontAwesomeIcon icon={faMoneyBillWave} /> Adjust Price
                            </h2>
                        </div>

                        <div className="modal-content">
                            <div className="item-details">
                                <p><strong>Item:</strong> {priceAdjustItem.name}</p>
                                <p><strong>Part Number:</strong> {priceAdjustItem.partNumber}</p>
                                <p><strong>Current Price:</strong> ${priceAdjustItem.price.toFixed(2)}</p>
                            </div>

                            <div className="price-input-group">
                                <label htmlFor="new-price">Enter New Price:</label>
                                <div className="price-input-wrapper">
                                    <input
                                        id="new-price"
                                        className="price-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={newPrice}
                                        onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Simple Price Difference Display */}
                            {newPrice !== priceAdjustItem.price && (
                                <div className={`price-difference ${newPrice > priceAdjustItem.price ? 'price-increase' : 'price-decrease'}`}>
                                    <p className="difference-text">
                                        Difference with current price is {newPrice > priceAdjustItem.price ? '+' : '-'}$
                                        {Math.abs(newPrice - priceAdjustItem.price).toFixed(2)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="cancel-btn"
                                onClick={() => setIsPriceAdjustModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn"
                                onClick={handleSavePriceAdjustment}
                                disabled={newPrice === priceAdjustItem.price}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isAddItemModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Add New Inventory Item</h2>
                            <button className="close-button" onClick={() => setIsAddItemModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <form onSubmit={handleAddItemSubmit}>
                                <div className="form-group">
                                    <label>Part Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newItemData.name}
                                        onChange={handleNewItemInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Part Number</label>
                                    <input
                                        type="text"
                                        name="partNumber"
                                        value={newItemData.partNumber}
                                        onChange={handleNewItemInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={newItemData.description}
                                        onChange={handleNewItemInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Stock Level</label>
                                        <input
                                            type="number"
                                            name="stockLevel"
                                            value={newItemData.stockLevel}
                                            onChange={handleNewItemInputChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="form-group half">
                                        <label>Reorder Point</label>
                                        <input
                                            type="number"
                                            name="reorderPoint"
                                            value={newItemData.reorderPoint}
                                            onChange={handleNewItemInputChange}
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={newItemData.price}
                                        onChange={handleNewItemInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Supplier</label>
                                    <input
                                        type="text"
                                        name="supplier"
                                        value={newItemData.supplier}
                                        onChange={handleNewItemInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Device Type</label>
                                    <select
                                        name="deviceType"
                                        value={newItemData.deviceType}
                                        onChange={handleNewItemInputChange}
                                        required
                                    >
                                        <option value="">Select Device Type</option>
                                        {devices.map(device => (
                                            <option key={device.id} value={device.name.toLowerCase()}>
                                                {device.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Model Type</label>
                                    <select
                                        name="modelType"
                                        value={newItemData.modelType}
                                        onChange={handleNewItemInputChange}
                                        disabled={!newItemData.deviceType}
                                        required
                                    >
                                        <option value="">Select Model Type</option>
                                        {newItemData.deviceType && deviceModels[newItemData.deviceType] &&
                                            deviceModels[newItemData.deviceType].map(model => (
                                                <option key={model} value={model}>
                                                    {model}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="modal-button secondary" onClick={() => setIsAddItemModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="modal-button primary">
                                        Add Item
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    const renderSupportRequests = () => {
        const markAsRead = async (id) => {
            try {
                const updatedRequest = await updateSupportRequest(id, { isRead: true });
                setSupportRequests(supportRequests.map(req =>
                    req.id === id ? updatedRequest : req
                ));
                const updatedUnreadCount = supportRequests
                    .filter(req => req.id !== id && !req.isRead)
                    .length;

                setUnreadSupportRequests(updatedUnreadCount);
            } catch (error) {
                console.error('Error marking request as read:', error);
            }
        };
        const markAllSupportAsRead = async () => {
            try {
                console.log('Marking all support requests as read');
                const unreadRequests = supportRequests.filter(req => !req.isRead);

                if (unreadRequests.length === 0) {
                    console.log('No unread support requests to mark');
                    return;
                }
                const updatedRequests = supportRequests.map(req => ({
                    ...req,
                    isRead: true
                }));

                setSupportRequests(updatedRequests);
                setUnreadSupportRequests(0);
                for (const req of unreadRequests) {
                    try {
                        await updateSupportRequest(req.id, { isRead: true });
                        console.log(`Marked support request ${req.id} as read`);
                    } catch (error) {
                        console.error(`Failed to mark support request ${req.id} as read:`, error);
                    }
                }
                const freshRequests = await getSupportRequests();
                setSupportRequests(freshRequests);
                const remainingUnread = freshRequests.filter(req => !req.isRead).length;
                setUnreadSupportRequests(remainingUnread);

                console.log('All support requests marked as read');
            } catch (error) {
                console.error('Error marking all support requests as read:', error);
                try {
                    const freshRequests = await getSupportRequests();
                    setSupportRequests(freshRequests);
                    setUnreadSupportRequests(freshRequests.filter(req => !req.isRead).length);
                } catch (refreshError) {
                    console.error('Error refreshing support requests:', refreshError);
                }
            }
        };

        const markAllAsRead = async () => {
            try {
                console.log('Marking all notifications as read - function called');
                const updatedNotifications = await markAllNotificationsAsRead();
                console.log('API call successful. Updated notifications:', updatedNotifications);
                if (Array.isArray(updatedNotifications)) {
                    console.log(`Setting state with ${updatedNotifications.length} notifications`);
                    setNotifications(updatedNotifications);
                } else {
                    console.error('Invalid response format:', updatedNotifications);
                    throw new Error('Invalid response format from server');
                }
                setTimeout(() => {
                    refreshNotifications();
                }, 500);

            } catch (error) {
                console.error('Error marking all notifications as read:', error);
                alert('There was an error marking all notifications as read. Please try again.');
            }
        };
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
        const getFilteredRequests = () => {
            if (supportFilter === 'all') {
                return supportRequests;
            }

            return supportRequests.filter(request =>
                request.status.toLowerCase() === supportFilter.toLowerCase()
            );
        };
        const viewRequestDetails = (request) => {
            setSelectedRequest(request);
            if (!request.isRead) {
                markAsRead(request.id);
            }
        };
        const closeRequestDetails = () => {
            setSelectedRequest(null);
        };

        const sendReply = async () => {
            if (!replyText.trim() || !selectedRequest) return;

            try {
                const newMessage = {
                    id: Date.now(), // Generate temporary ID
                    sender: 'agent',
                    agentName: 'Admin Support',
                    message: replyText,
                    date: new Date().toLocaleString()
                };
                const updatedMessages = [...selectedRequest.messages, newMessage];
                const updatedRequest = await updateSupportRequest(selectedRequest.id, {
                    messages: updatedMessages
                });
                setSupportRequests(supportRequests.map(req =>
                    req.id === updatedRequest.id ? updatedRequest : req
                ));
                setSelectedRequest(updatedRequest);
                setReplyText('');
            } catch (error) {
                console.error('Error sending reply:', error);
                alert('Failed to send reply. Please try again.');
            }
        };
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
                                                setSupportRequests(supportRequests.map(req =>
                                                    req.id === updatedRequest.id ? updatedRequest : req
                                                ));
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
                        <button className="mark-read-btn" onClick={markAllSupportAsRead}>
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


    const renderRevenue = () => {
        if (isLoading) {
            return (
                <div className="revenue-container">
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Loading revenue data...</p>
                    </div>
                </div>
            );
        }
        if (!revenueData || !revenueData.dailyRevenue || revenueData.dailyRevenue.length === 0) {
            return (
                <div className="revenue-container">
                    <div className="revenue-header">
                        <h2>Revenue Dashboard</h2>
                        <div className="revenue-controls">
                            <select
                                className="date-range-select"
                                value={revenuePeriod}
                                onChange={(e) => setRevenuePeriod(e.target.value)}
                            >
                                <option value="today">Today</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 90 Days</option>
                            </select>
                            <button className="export-btn" onClick={exportRevenueReport}>Export Report</button>
                        </div>
                    </div>
                    <div className="no-data-message" style={{
                        textAlign: 'center',
                        padding: '50px 20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        margin: '20px 0'
                    }}>
                        <p>No revenue data available for the selected period.</p>
                        <p>Please select a different period or add revenue data to the system.</p>
                    </div>
                </div>
            );
        }
        const {
            dailyRevenue = [],
            deviceRevenue = [],
            repairsByType = [],
            today = 0,
            thisWeek = 0,
            thisMonth = 0,
            repairSalesRatio = '0:0',
            periodLabel = '',
            todayChange = '0%',
            weekChange = '0%',
            monthChange = '0%'
        } = revenueData;
        const handleRevenuePeriodChange = async (e) => {
            const newPeriod = e.target.value;
            setRevenuePeriod(newPeriod);
            setHoveredRevenueBar(null);

            try {
                setIsLoading(true);
                const data = await getRevenueData(newPeriod);
                setRevenueData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching revenue data:', error);
                setIsLoading(false);
            }
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
                        <p className="summary-value">${(today || 0).toLocaleString()}</p>
                        <p className={`summary-change ${todayChange?.startsWith('+') ? 'positive' : 'negative'}`}>
                            {todayChange || '0%'} from yesterday
                        </p>
                    </div>

                    <div className="summary-card">
                        <h3>This Week</h3>
                        <p className="summary-value">${(thisWeek || 0).toLocaleString()}</p>
                        <p className={`summary-change ${weekChange?.startsWith('+') ? 'positive' : 'negative'}`}>
                            {weekChange || '0%'} from last week
                        </p>
                    </div>

                    <div className="summary-card">
                        <h3>This Month</h3>
                        <p className="summary-value">${(thisMonth || 0).toLocaleString()}</p>
                        <p className={`summary-change ${monthChange?.startsWith('+') ? 'positive' : 'negative'}`}>
                            {monthChange || '0%'} from last month
                        </p>
                    </div>

                    <div className="summary-card">
                        <h3>Repair to Sales Ratio</h3>
                        <p className="summary-value">{repairSalesRatio}</p>
                        <p className="summary-change neutral">Repairs vs Sales</p>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="revenue-chart-container">
                    <h3 style={{ marginBottom: '30px' }}>Revenue Data ({revenueData.periodLabel})</h3>
                    <div className="revenue-chart" style={{ marginTop: '50px' }}>
                        <div className={`chart-bars ${revenuePeriod === 'today' ? 'single-day-chart' : ''}`}>
                            {(() => {
                                const maxTotal = Math.max(...dailyRevenue.map(day => day.total || 0));
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
                                                <div className="revenue-repair" style={{ height: `${day.total > 0 ? (day.repairs/day.total)*100 : 0}%` }}></div>
                                                <div className="revenue-sales" style={{ height: `${day.total > 0 ? (day.sales/day.total)*100 : 0}%` }}></div>
                                            </div>
                                            {/* Tooltip that appears on hover */}
                                            {hoveredRevenueBar === index && (
                                                <div className="chart-tooltip">
                                                    <div><strong>Date:</strong> {day.date}</div>
                                                    <div><strong>Total Revenue:</strong> ${(day.total || 0).toLocaleString()}</div>
                                                    <div><strong>Repair Revenue:</strong> ${(day.repairs || 0).toLocaleString()} ({day.total > 0 ? ((day.repairs/day.total)*100).toFixed(1) : "0"}%)</div>
                                                    <div><strong>Sales Revenue:</strong> ${(day.sales || 0).toLocaleString()} ({day.total > 0 ? ((day.sales/day.total)*100).toFixed(1) : "0"}%)</div>
                                                </div>
                                            )}
                                        </div>
                                        <span className="chart-label">{day.date.substring(5)}</span>
                                        <span className="chart-value">${(day.total || 0).toLocaleString()}</span>
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
                            {(() => {
                                const totalRevenue = revenueData.deviceRevenue.reduce((sum, item) => sum + (item.revenue_amount || item.revenue || 0), 0);

                                return revenueData.deviceRevenue.map((item, index) => {
                                    const percentage = totalRevenue > 0 ?
                                        (((item.revenue_amount || item.revenue || 0) / totalRevenue) * 100).toFixed(1) : "0.0";

                                    return (
                                        <tr key={index}>
                                            <td>{item.device}</td>
                                            <td>${(item.revenue_amount || item.revenue || 0).toLocaleString()}</td>
                                            <td>
                                                <div className="percent-bar-container">
                                                    <div className="percent-bar" style={{ width: `${percentage}%` }}></div>
                                                    <span>{percentage}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
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
                                    <td>${(item.revenue_amount || item.revenue || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    useEffect(() => {
        const handleNotificationUpdate = async () => {
            console.log('Notification update event triggered');
            try {
                const notificationsData = await getNotifications();
                const unreadCount = notificationsData.filter(n => !n.isRead).length;
                setNotifications(notificationsData);
                setUnreadNotifications(unreadCount);
            } catch (error) {
                console.error('Error handling notification update:', error);
            }
        };
        window.addEventListener('notification-update', handleNotificationUpdate);
        return () => {
            window.removeEventListener('notification-update', handleNotificationUpdate);
        };
    }, []);

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
                                onClick={() => {
                                    setActiveTab('notifications');
                                    forceRefreshNotifications(); // Refresh notifications when clicking the tab
                                }}
                            >
                                <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
                                <span>Notifications</span>
                                {unreadNotifications > 0 && (
                                    <span className="badge">{unreadNotifications}</span>
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
                                className={`sidebar-menu-item ${activeTab === 'services' ? 'active' : ''}`}
                                onClick={() => setActiveTab('services')}
                            >
                                <FontAwesomeIcon icon={faTools} className="sidebar-icon" />
                                <span>Services</span>
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
                            {unreadNotifications > 0 && (
                                <span className="mobile-badge">{unreadNotifications}</span>
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
                            className={`mobile-nav-item ${activeTab === 'services' ? 'active' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            <FontAwesomeIcon icon={faTools} className="mobile-nav-icon" />
                            <span className="mobile-nav-label">Services</span>
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
                                {activeTab === 'services' && <ServicesTab />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;