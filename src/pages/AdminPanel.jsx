import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import supportService from '../services/SupportService';
import axios from 'axios';
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
    restockInventoryItem
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

    const handleSaveOrder = async () => {
        try {
            // Store the original order to compare status change
            const originalOrder = repairOrders.find(order =>
                (order._id === editOrderData._id || order.id === editOrderData.id)
            );

            // Call API to update the order
            const orderId = editOrderData.id;

            // Only send fields that can be updated - problem and status
            const updateData = {
                problem: editOrderData.problem,
                status: editOrderData.status
            };

            // Call the API
            const updatedOrder = await updateRepair(orderId, updateData);

            // Update local state
            const updatedOrders = repairOrders.map(order =>
                order.id === orderId ? updatedOrder : order
            );

            setRepairOrders(updatedOrders);
            setIsEditModalOpen(false);

            // If status has changed, create a notification
            // If status has changed, create a notification
            if (originalOrder && originalOrder.status !== updatedOrder.status) {
                await createNotification({
                    type: 'order',
                    message: `Repair order for ${updatedOrder.customer}'s ${updatedOrder.device} status changed from "${originalOrder.status}" to "${updatedOrder.status}".`,
                    time: 'just now'
                });
                window.dispatchEvent(new Event('notification-update'));


                // Update the notifications in state
                const notificationsData = await getNotifications();
                setNotifications(notificationsData);
                const unreadCount = notificationsData.filter(n => !n.isRead).length;
                setUnreadNotifications(unreadCount);
            }

            // Show success message
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

            // Create a deep copy of the current notified items array
            const updatedNotifiedItems = [...notifiedLowStockItems];

            // Check each low stock item
            for (const item of lowStockItems) {
                // Create a unique identifier for this item
                const itemKey = `${item.id}-${item.stockLevel}`;

                // Check if we've already notified about this item at this stock level
                if (!notifiedLowStockItems.includes(itemKey)) {
                    // This is a new low stock item or its stock level has changed
                    if (item.stockLevel <= item.reorderPoint * 0.5) {
                        await createNotification({
                            type: 'alert',
                            message: `CRITICAL: ${item.name} for ${item.deviceType} ${item.modelType} is critically low (${item.stockLevel} units remaining).`,
                            time: 'just now'
                        });
// Add this line
                        window.dispatchEvent(new Event('notification-update'));
                        newNotifications = true;
                    } else if (item.stockLevel <= item.reorderPoint) {
                        await createNotification({
                            type: 'alert',
                            message: `CRITICAL: ${item.name} for ${item.deviceType} ${item.modelType} is critically low (${item.stockLevel} units remaining).`,
                            time: 'just now'
                        });
// Add this line
                        window.dispatchEvent(new Event('notification-update'));
                        newNotifications = true;
                    }

                    // Add this item to the notified items list with timestamp
                    updatedNotifiedItems.push(itemKey);
                    trackLowStockItem(itemKey);
                }
            }

            // Update the list of notified items
            if (updatedNotifiedItems.length !== notifiedLowStockItems.length) {
                setNotifiedLowStockItems(updatedNotifiedItems);
                localStorage.setItem('notifiedLowStockItems', JSON.stringify(updatedNotifiedItems));
            }

            // Update the notifications in state only if we created new notifications
            // Update the notifications in state only if we created new notifications
            if (newNotifications) {
                const notificationsData = await getNotifications();
                setNotifications(notificationsData);

                // Add these lines to update the unread counter
                const unreadCount = notificationsData.filter(n => !n.isRead).length;
                setUnreadNotifications(unreadCount);
            }

            // Periodically clean up old notification tracking
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
        // Get the current timestamp tracking
        const trackedKeys = JSON.parse(localStorage.getItem('notifiedLowStockItemsTimestamp') || '{}');

        // Add/update this item's timestamp
        trackedKeys[itemKey] = Date.now();

        // Save back to localStorage
        localStorage.setItem('notifiedLowStockItemsTimestamp', JSON.stringify(trackedKeys));
    };
    const cleanupNotificationTracking = () => {
        try {
            // Get items that are no longer in low stock but are in our tracking list
            const keysToKeep = [];

            // For each inventory item that's in low stock, keep its tracking key
            inventoryItems.forEach(item => {
                if (item.stockLevel <= item.reorderPoint) {
                    const itemKey = `${item.id}-${item.stockLevel}`;
                    keysToKeep.push(itemKey);
                }
            });

            // Filter the notification list to only include items that are still in low stock
            // or items that were added in the last 24 hours
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const trackedKeys = JSON.parse(localStorage.getItem('notifiedLowStockItemsTimestamp') || '{}');
            const currentTrackedKeys = {};

            // Keep only keys that are current low stock items or recent notifications
            const prunedNotifiedItems = notifiedLowStockItems.filter(key => {
                // Always keep current low stock items
                if (keysToKeep.includes(key)) {
                    currentTrackedKeys[key] = Date.now();
                    return true;
                }

                // Check if this notification is recent (less than 24 hours old)
                const timestamp = trackedKeys[key] || 0;
                if (timestamp > yesterday.getTime()) {
                    currentTrackedKeys[key] = timestamp;
                    return true;
                }

                // Otherwise remove it from tracking
                return false;
            });

            // Update the notified items list if it changed
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

        // Check for low stock items and create notifications if needed
        checkLowStockItems();
    };
    const markSingleNotificationAsRead = async (notification) => {
        try {
            const notificationId = notification.id || notification._id;
            console.log('Marking notification as read:', notificationId);

            // Optimistically update the local state first
            const updatedNotifications = notifications.map(notif =>
                notif.id === notificationId || notif._id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
            );

            setNotifications(updatedNotifications);

            // Update unread notifications count
            const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
            console.log('Updated unread notifications count after marking one as read:', unreadCount);
            setUnreadNotifications(unreadCount);

            // Call API to mark as read
            await markNotificationAsRead(notificationId);

            // Refresh notifications to ensure consistency
            const freshNotifications = await getNotifications();
            setNotifications(freshNotifications);

            // Update unread notifications count
            const freshUnreadCount = freshNotifications.filter(n => !n.isRead).length;
            console.log('Fresh unread notifications count after API call:', freshUnreadCount);
            setUnreadNotifications(freshUnreadCount);

            // Dispatch notification update event
            window.dispatchEvent(new Event('notification-update'));

        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert the optimistic update if API call fails
            const originalNotifications = await getNotifications();
            setNotifications(originalNotifications);
            const originalUnreadCount = originalNotifications.filter(n => !n.isRead).length;
            setUnreadNotifications(originalUnreadCount);
        }
    };
    const getFilteredNotifications = () => {
        if (notificationFilter === 'all') {
            // Sort notifications, with unread notifications first
            return notifications.sort((a, b) => {
                // Prioritize unread notifications
                if (a.isRead === false && b.isRead === true) return -1;
                if (a.isRead === true && b.isRead === false) return 1;

                // Then sort by date
                return new Date(b.date) - new Date(a.date);
            });
        }

        // Filter by type and sort
        return notifications
            .filter(notification => notification.type === notificationFilter)
            .sort((a, b) => {
                // Prioritize unread notifications
                if (a.isRead === false && b.isRead === true) return -1;
                if (a.isRead === true && b.isRead === false) return 1;

                // Then sort by date
                return new Date(b.date) - new Date(a.date);
            });
    };

    const exportInventoryReport = async () => {
        try {
            let reportItems = [];
            let reportTitle = "iRevix Full Inventory Report";

            // If specific devices and models are selected, use only those items
            if (selectedDevices.length > 0 && selectedModels.length > 0) {
                reportItems = inventoryItems;
                reportTitle = `iRevix Inventory Report - Selected Models (${selectedModels.length} models)`;
            } else {
                // Fetch all inventory items
                const allItems = [];

                // Loop through all devices and models
                for (const device of devices) {
                    for (const model of deviceModels[device.id]) {
                        try {
                            const deviceItems = await fetchReplacementParts(device.id, model);
                            // Add device and model info to items
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
    useEffect(() => {
        const savedNotifiedItems = localStorage.getItem('notifiedLowStockItems');
        if (savedNotifiedItems) {
            setNotifiedLowStockItems(JSON.parse(savedNotifiedItems));
        }
    }, []);

    // Load initial data from API
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch notifications
                const notificationsData = await getNotifications();
                setNotifications(notificationsData);

                // Count unread notifications separately
                const unreadNotificationCount = notificationsData.filter(n => !n.isRead).length;
                setUnreadNotifications(unreadNotificationCount);
                console.log('Initial unread notifications count:', unreadNotificationCount);

                // Fetch support requests
                const supportData = await getSupportRequests();
                setSupportRequests(supportData);

                // Only count unread support requests for the support badge
                const unreadSupportCount = supportData.filter(req => !req.isRead).length;
                setUnreadSupportRequests(unreadSupportCount);
                console.log('Initial unread support requests count:', unreadSupportCount);

                // Other data fetching...
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

                    // Add a timestamp to avoid caching issues
                    const timestamp = new Date().getTime();
                    console.log('Making API call with timestamp:', timestamp);

                    const data = await getRevenueData(revenuePeriod);
                    console.log('Raw API Response:', data);
                    console.log('Data type:', typeof data);
                    console.log('Has dailyRevenue:', data.hasOwnProperty('dailyRevenue'));
                    console.log('dailyRevenue type:', Array.isArray(data.dailyRevenue) ? 'array' : typeof data.dailyRevenue);
                    console.log('dailyRevenue length:', data.dailyRevenue ? data.dailyRevenue.length : 'N/A');

                    // Check all expected properties
                    const expectedProps = ['dailyRevenue', 'deviceRevenue', 'repairsByType', 'today', 'thisWeek', 'thisMonth', 'lastMonth'];
                    expectedProps.forEach(prop => {
                        console.log(`Property ${prop} exists:`, data.hasOwnProperty(prop));
                        console.log(`Property ${prop} value:`, data[prop]);
                    });

                    // Process data but always set it even if dailyRevenue is empty
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

                    // Always set the data, even if empty
                    setRevenueData(processedData);

                    // Add slight delay to ensure state is updated before isLoading is set to false
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

                // Set a default data structure rather than null
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
    // In AdminPanel.jsx, update the useEffect for dashboard stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            // Ensure we only fetch when on dashboard tab
            if (activeTab === 'dashboard') {
                try {
                    // Create an object to hold all dashboard stats
                    let stats = {
                        todayVisitors: 0,
                        newOrders: 0,
                        repairsInProgress: 0,
                        todayRevenue: 0
                    };

                    // Fetch traffic data for today's visitors
                    const trafficData = await getTrafficData('7days');
                    if (trafficData && trafficData.length > 0) {
                        // Get the most recent day's data
                        const todayData = trafficData[trafficData.length - 1];
                        stats.todayVisitors = todayData.visitors;
                    }

                    // Fetch repair orders
                    const repairsData = await getRepairs();
                    if (repairsData) {
                        // Get today's date in YYYY-MM-DD format
                        const today = new Date().toISOString().split('T')[0];

                        // Count new orders from today
                        stats.newOrders = repairsData.filter(order =>
                            order.date === today
                        ).length;

                        // Count repairs in progress
                        stats.repairsInProgress = repairsData.filter(order =>
                            order.status === 'In Progress'
                        ).length;
                    }

                    // Fetch revenue data
                    const revData = await getRevenueData('today');
                    if (revData) {
                        stats.todayRevenue = revData.today || 0;
                    }

                    // Update dashboard stats state
                    setDashboardStats(stats);

                } catch (error) {
                    console.error('Error fetching dashboard stats:', error);
                    // Optionally set some default or error state
                    setDashboardStats(null);
                }
            }
        };

        // Always attempt to fetch stats when dashboard tab is active
        fetchDashboardStats();
    }, [activeTab]); // This will trigger on tab changes and initial render
    const debugLog = (message, data) => {
        console.log(`DEBUG: ${message}`, data);
    };

    // Replace the fetchDevicesAndModels function with this improved version
    useEffect(() => {
        const fetchDevicesAndModels = async () => {
            try {
                // Fetch inventory items to extract device and model info
                const response = await axios.get('/api/inventory');
                const inventoryItems = response.data;

                debugLog("Raw inventory data (first 3 items):", inventoryItems.slice(0, 3));

                // Extract unique device types and standardize them
                const uniqueDeviceTypes = [...new Set(
                    inventoryItems
                        .filter(item => item.deviceType) // Filter out null/undefined
                        .map(item => {
                            // Standardize capitalization (first letter uppercase, rest lowercase)
                            const deviceType = item.deviceType.charAt(0).toUpperCase() +
                                item.deviceType.slice(1).toLowerCase();
                            return deviceType;
                        })
                )];

                debugLog("Extracted unique device types:", uniqueDeviceTypes);

                // Create device objects with appropriate icons
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

                // Extract unique models for each device type
                const modelMapping = {};

                extractedDevices.forEach(device => {
                    // KEY FIX: Use case-insensitive comparison for device type
                    const deviceInventory = inventoryItems.filter(item =>
                        item.deviceType &&
                        item.deviceType.toLowerCase() === device.name.toLowerCase()
                    );

                    debugLog(`Found ${deviceInventory.length} items for device ${device.name}`,
                        deviceInventory.slice(0, 2)); // Show just a couple items

                    // Extract all models for this device
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
                // Fall back to hardcoded values if API fails
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
    const forceRefreshNotifications = async () => {
        try {
            console.log('Force refreshing notifications...');
            const notificationsData = await getNotifications();

            // Update notifications state
            setNotifications(notificationsData);

            // Update unread count
            const unreadCount = notificationsData.filter(n => !n.isRead).length;
            console.log(`Force refresh - unread count: ${unreadCount}`);
            setUnreadNotifications(unreadCount);

            return unreadCount;
        } catch (error) {
            console.error('Error force refreshing notifications:', error);
            return null;
        }
    };

    // Replace the fetchFilteredItems function with this improved version
    const fetchFilteredItems = async () => {
        try {
            debugLog("Starting filtering with:", {
                showLowStockOnly,
                selectedDevices,
                selectedModels,
                inventoryItemsCount: inventoryItems.length
            });

            let filteredItems = [];

            // If showing low stock items only
            if (showLowStockOnly) {
                // Fetch low stock items from API
                const lowStockItems = await fetchLowStockItems();
                debugLog("Fetched low stock items:", lowStockItems.length);

                // Filter low stock items based on selected devices and models
                filteredItems = lowStockItems.filter(item => {
                    // Case-insensitive device matching
                    const deviceMatch = selectedDevices.length === 0 ||
                        selectedDevices.some(deviceId => {
                            // Find the corresponding device
                            const device = devices.find(d => d.id === deviceId);
                            const deviceName = device ? device.name : deviceId;

                            // Convert both to lowercase for comparison
                            const itemDeviceType = (item.deviceType || '').toLowerCase();
                            const selectedDeviceType = deviceName.toLowerCase();

                            const isMatch = itemDeviceType === selectedDeviceType;
                            if (isMatch) {
                                debugLog(`Device match: ${itemDeviceType} matches ${selectedDeviceType}`);
                            }
                            return isMatch;
                        });

                    // Case-insensitive model matching
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
            // If not showing low stock only, filter from loaded inventory items
            else {
                // If no devices are selected, show all items
                if (selectedDevices.length === 0) {
                    filteredItems = inventoryItems;
                    debugLog(`Showing all ${filteredItems.length} inventory items`);
                }
                // If devices are selected but no models
                else if (selectedDevices.length > 0 && selectedModels.length === 0) {
                    filteredItems = inventoryItems.filter(item => {
                        return selectedDevices.some(deviceId => {
                            // Find the corresponding device
                            const device = devices.find(d => d.id === deviceId);
                            const deviceName = device ? device.name : deviceId;

                            // Convert both to lowercase for comparison
                            const itemDeviceType = (item.deviceType || '').toLowerCase();
                            const selectedDeviceType = deviceName.toLowerCase();

                            return itemDeviceType === selectedDeviceType;
                        });
                    });

                    debugLog(`Found ${filteredItems.length} items for selected devices`);
                }
                // If both devices and models are selected
                else if (selectedDevices.length > 0 && selectedModels.length > 0) {
                    filteredItems = inventoryItems.filter(item => {
                        // Case-insensitive device matching
                        const deviceMatch = selectedDevices.some(deviceId => {
                            // Find the corresponding device
                            const device = devices.find(d => d.id === deviceId);
                            const deviceName = device ? device.name : deviceId;

                            // Convert both to lowercase for comparison
                            const itemDeviceType = (item.deviceType || '').toLowerCase();
                            const selectedDeviceType = deviceName.toLowerCase();

                            return itemDeviceType === selectedDeviceType;
                        });

                        // Case-insensitive model matching
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

            // Add debug logging to show what we're filtering by
            if (selectedDevices.length > 0) {
                debugLog('Selected device IDs:', selectedDevices);
                debugLog('Selected device names:',
                    selectedDevices.map(id => devices.find(d => d.id === id)?.name));
            }
            if (selectedModels.length > 0) {
                debugLog('Selected models:', selectedModels);
            }

            // Show some sample results
            if (filteredItems.length > 0) {
                debugLog('Sample filtered items:', filteredItems.slice(0, 2));
            }

            // Set the filtered items
            setFilteredInventoryItems(filteredItems);
        } catch (error) {
            console.error('Error fetching filtered inventory items:', error);
            setFilteredInventoryItems([]);
            alert(`Failed to fetch inventory items: ${error.message}`);
        }
    };

// Update the useEffect to trigger filtering whenever necessary
    useEffect(() => {
        fetchFilteredItems();
    }, [showLowStockOnly, selectedDevices, selectedModels, inventoryItems]);

    useEffect(() => {
        const fetchInventoryItems = async () => {
            try {
                // If both devices and models are selected
                if (selectedDevices.length > 0 && selectedModels.length > 0) {
                    console.log("Fetching inventory with selections:", {
                        devices: selectedDevices,
                        models: selectedModels
                    });

                    let allItems = [];

                    // Fetch items for each device-model combination
                    for (const deviceId of selectedDevices) {
                        // Find the actual device object from our devices array
                        const device = devices.find(d => d.id === deviceId);
                        const deviceName = device ? device.name : deviceId;

                        console.log(`Processing device: ${deviceId} -> ${deviceName}`);

                        for (const model of selectedModels) {
                            // Check if this model belongs to this device
                            if (deviceModels[deviceId] && deviceModels[deviceId].includes(model)) {
                                try {
                                    console.log(`Fetching parts for device: ${deviceName}, model: ${model}`);

                                    // Pass the device NAME (not device ID) and model to the API
                                    const items = await getInventoryParts(deviceName, model);

                                    console.log(`Received ${items.length} parts from API for ${deviceName}/${model}`);

                                    // If we got items back, add device/model info to them
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

                    // Set inventory items and trigger filtering
                    setInventoryItems(allItems);
                } else {
                    // Reset inventory items if devices or models are not fully selected
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
            // If already selected, remove it from selection
            const updatedDevices = selectedDevices.filter(d => d !== deviceId);
            debugLog("Removing device from selection:", deviceId);
            debugLog("New device selection:", updatedDevices);
            setSelectedDevices(updatedDevices);

            // Also remove any models of this device from selected models
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
            // Add to selection
            const updatedDevices = [...selectedDevices, deviceId];
            debugLog("Adding device to selection:", deviceId);
            debugLog("New device selection:", updatedDevices);
            setSelectedDevices(updatedDevices);
        }
    };

    const handleModelSelect = (model, deviceId) => {
        debugLog("Model selection changed:", { model, deviceId });

        if (selectedModels.includes(model)) {
            // If already selected, remove it
            debugLog("Removing model from selection:", model);
            const updatedModels = selectedModels.filter(m => m !== model);
            debugLog("New model selection:", updatedModels);
            setSelectedModels(updatedModels);
        } else {
            // Add to selection
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

    // Handler to open restock modal
    const handleRestockClick = (item) => {
        setRestockItem(item);
        setRestockQuantity(1);
        setIsRestockModalOpen(true);
    };

    const handleRestockSubmit = async () => {
        try {
            // Call the dedicated restock API endpoint
            const updatedItem = await restockInventoryItem(restockItem.id, restockQuantity);
            console.log('Restock successful, received updated item:', updatedItem);

            // Remove this item from the notified low stock items list
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

            // Create a notification for the restock action
            await createNotification({
                type: 'system',
                message: `${updatedItem.name} for ${updatedItem.deviceType} ${updatedItem.modelType} has been restocked (+${restockQuantity} units).`,
                time: 'just now'
            });
            window.dispatchEvent(new Event('notification-update'));

            // Get fresh notifications
            const notificationsData = await getNotifications();
            setNotifications(notificationsData);

            // IMPORTANT: Refresh inventory data based on current selections
            // Refetch all inventory items for currently selected device/model
            if (selectedDevices.length > 0 && selectedModels.length > 0) {
                let allItems = [];

                for (const deviceId of selectedDevices) {
                    for (const model of selectedModels) {
                        // Ensure the model belongs to the selected device
                        if (deviceModels[deviceId]?.includes(model)) {
                            try {
                                console.log(`Refreshing inventory for ${deviceId} ${model}`);
                                // Fetch fresh inventory data
                                const items = await getInventoryParts(deviceId, model);

                                // Add device and model information
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

                // Also update filtered inventory
                if (showLowStockOnly) {
                    const lowStockItems = allItems.filter(item =>
                        item.stockLevel <= item.reorderPoint
                    );
                    setFilteredInventoryItems(lowStockItems);
                } else {
                    setFilteredInventoryItems(allItems);
                }
            }

            // Reset UI state
            setIsRestockModalOpen(false);
            setRestockItem(null);
            setRestockQuantity(1);

            // Show success message
            alert("Inventory item restocked successfully!");
        } catch (error) {
            console.error("Error restocking inventory item:", error);

            // Enhanced error logging
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }

            alert("Failed to restock inventory item. Please try again.");
        }
    };

// Handler to delete an inventory item - updated for database persistence
    const markAllAsRead = async () => {
        try {
            console.log('Marking all notifications as read');

            // Optimistically mark all as read locally
            const updatedNotifications = notifications.map(notif => ({
                ...notif,
                isRead: true
            }));

            setNotifications(updatedNotifications);
            setUnreadNotifications(0);  // Set to 0 immediately

            // Call API to mark all as read
            await markAllNotificationsAsRead();

            // Refresh notifications to ensure consistency
            const freshNotifications = await getNotifications();
            setNotifications(freshNotifications);

            // Update unread count
            const unreadCount = freshNotifications.filter(n => !n.isRead).length;
            console.log('Unread notifications count after marking all as read:', unreadCount);
            setUnreadNotifications(unreadCount);

            // Dispatch notification update event
            window.dispatchEvent(new Event('notification-update'));

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Revert to original state if API call fails
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
                // Call API to delete the item from the database
                await deleteInventoryItem(itemId);

                // Remove this item from the notified low stock items list
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

                // Update local state to remove the item
                const updatedItems = inventoryItems.filter(item => item.id !== itemId);
                setInventoryItems(updatedItems);

                // If we're also showing filtered items, update those too
                if (filteredInventoryItems.length > 0) {
                    const updatedFilteredItems = filteredInventoryItems.filter(item => item.id !== itemId);
                    setFilteredInventoryItems(updatedFilteredItems);
                }

                // Show success message
                alert("Inventory item deleted successfully.");
            } catch (error) {
                console.error("Error deleting inventory item:", error);
                alert("Failed to delete inventory item. Please try again.");
            }
        }
    };
    // Function to export revenue report as CSV
    const exportRevenueReport = () => {
        try {
            // Use the revenue data from state
            if (!revenueData) {
                alert("Revenue data is still loading. Please try again in a moment.");
                return;
            }
            const data = revenueData;

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
            csvContent += `Repair to Sales Ratio,${data.repairSalesRatio}\r\n\r\n`;

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
        // If data is already loaded, don't show loading
        if (notifications.length > 0 && repairOrders.length > 0) {
            return;
        }

        try {
            // Minimal loading state
            setIsLoading(true);

            // Parallel data fetching
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

            // Update states
            setNotifications(notificationsData);
            setWebsiteTraffic(trafficData);
            setRepairOrders(repairsData);
            setSupportRequests(supportData);
            setUnreadSupportRequests(supportData.filter(req => !req.isRead).length);
            setRevenueData(revenueData);

            // Dashboard specific calculations
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
            // Ensure loading state is always turned off
            setIsLoading(false);
        }
    };

// Optimize useEffect for smoother tab switching
    useEffect(() => {
        // Only load if data is not already present
        if (notifications.length === 0 || repairOrders.length === 0) {
            loadInitialData();
        }
    }, [activeTab]);

    const refreshNotifications = async () => {
        try {
            console.log('Refreshing notifications...');
            const notificationsData = await getNotifications();
            console.log('Refreshed notifications:', notificationsData.length, 'items');

            // Ensure the isRead property is correctly set and processed
            const processedNotifications = notificationsData.map(notification => ({
                ...notification,
                isRead: notification.isRead === true  // Explicitly convert to boolean
            }));

            // Sort notifications by date, most recent first
            const sortedNotifications = processedNotifications.sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

            setNotifications(sortedNotifications);

            // Update the unread notifications count
            const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
            console.log('Refreshed unread notifications count:', unreadCount);
            setUnreadNotifications(unreadCount);
        } catch (error) {
            console.error('Error refreshing notifications:', error);
        }
    };
    // In the fetchAndProcessNotifications function, change this:
    useEffect(() => {
        const fetchAndProcessNotifications = async () => {
            try {
                console.log('Fetching and processing notifications...');
                const notificationsData = await getNotifications();

                // Sort notifications by date, most recent first
                const sortedNotifications = notificationsData.sort((a, b) =>
                    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                );

                // Update state with sorted notifications
                setNotifications(sortedNotifications);

                // Update unread notifications count
                const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
                console.log('Updated unread notifications count:', unreadCount);
                setUnreadNotifications(unreadCount); // IMPORTANT: Fixed this line

            } catch (error) {
                console.error('Error refreshing notifications:', error);
            }
        };

        // Run on initial load and when switching to notifications tab
        if (!isLoading && (activeTab === 'notifications' || activeTab === 'dashboard')) {
            fetchAndProcessNotifications();
        }
    }, [activeTab, isLoading]);

    useEffect(() => {
        // This useEffect runs when inventoryItems changes
        if (!isLoading && inventoryItems.length > 0) {
            const checkForNewLowStockItems = async () => {
                try {
                    let newNotifications = false;
                    const updatedNotifiedItems = [...notifiedLowStockItems];

                    // Check each inventory item
                    for (const item of inventoryItems) {
                        // Only process items that are at or below their reorder point
                        if (item.stockLevel <= item.reorderPoint) {
                            // Create a unique identifier for this item
                            const itemKey = `${item.id}-${item.stockLevel}`;

                            // Check if we've already notified about this item at this stock level
                            if (!notifiedLowStockItems.includes(itemKey)) {
                                // This is a new low stock condition
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

                                // Add this item to the notified items list
                                updatedNotifiedItems.push(itemKey);
                            }
                        }
                    }

                    // Update the list of notified items
                    if (updatedNotifiedItems.length !== notifiedLowStockItems.length) {
                        setNotifiedLowStockItems(updatedNotifiedItems);
                        // Save to localStorage for persistence
                        localStorage.setItem('notifiedLowStockItems', JSON.stringify(updatedNotifiedItems));
                    }

                    // Update the notifications in state only if we created new notifications
                    if (newNotifications) {
                        const notificationsData = await getNotifications();
                        setNotifications(notificationsData);
                    }
                } catch (error) {
                    console.error('Error checking for new low stock items:', error);
                }
            };

            // Only run this when in the inventory tab to avoid excessive checks
            if (activeTab === 'inventory') {
                checkForNewLowStockItems();
            }
        }
    }, [inventoryItems, isLoading, activeTab]);

    useEffect(() => {
        // Polling interval for checking notifications (in milliseconds)
        const POLLING_INTERVAL = 5000; // 5 seconds - shorter for more responsiveness

        // Always poll regardless of current tab
        if (!isLoading) {
            console.log('Setting up notification polling...');

            // Set up periodic polling
            const interval = setInterval(async () => {
                try {
                    // Fetch latest notifications
                    console.log('Polling for new notifications...');
                    const notificationsData = await getNotifications();

                    // Calculate unread count
                    const unreadCount = notificationsData.filter(n => !n.isRead).length;

                    // Always update to ensure state is fresh
                    console.log(`Current unread count: ${unreadCount}`);
                    setUnreadNotifications(unreadCount);

                    // Also update the notifications array if different
                    if (JSON.stringify(notificationsData) !== JSON.stringify(notifications)) {
                        setNotifications(notificationsData);
                    }
                } catch (error) {
                    console.error('Error polling for notifications:', error);
                }
            }, POLLING_INTERVAL);

            // Clean up interval on component unmount
            return () => {
                console.log('Cleaning up notification polling...');
                clearInterval(interval);
            };
        }
    }, [isLoading]);

    const renderTraffic = () => {
        // Check if traffic data is loaded
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

        // Calculate summary statistics from actual data
        const totalVisitors = websiteTraffic.reduce((sum, day) => sum + day.visitors, 0);
        const totalPageViews = websiteTraffic.reduce((sum, day) => sum + day.pageViews, 0);
        const totalConversions = websiteTraffic.reduce((sum, day) => sum + day.conversions, 0);
        const conversionRate = ((totalConversions / totalVisitors) * 100).toFixed(1);

        // Calculate growth trends based on first vs last day
        const firstDay = websiteTraffic[0];
        const lastDay = websiteTraffic[websiteTraffic.length - 1];

        const visitorGrowth = ((lastDay.visitors - firstDay.visitors) / firstDay.visitors) * 100;
        const pageViewGrowth = ((lastDay.pageViews - firstDay.pageViews) / firstDay.pageViews) * 100;
        const conversionGrowth = ((lastDay.conversions - firstDay.conversions) / firstDay.conversions) * 100;

        // Format growth percentages
        const formatGrowth = (growth) => {
            return growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
        };

        // Calculate session duration
        const avgSessionSeconds = Math.floor((totalPageViews / totalVisitors) * 60);
        const avgSessionMinutes = Math.floor(avgSessionSeconds / 60);
        const avgSessionRemainingSeconds = avgSessionSeconds % 60;
        const formattedDuration = `${avgSessionMinutes}m ${avgSessionRemainingSeconds}s`;

        // Create summary object with dynamic calculated values
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
            // Reset hovered bar when period changes
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
                        className={`action-btn ${showLowStockOnly ? 'low-stock-active' : ''}`}
                        onClick={handleLowStockToggle} // Use the new function instead
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
                                        // Convert and log values for debugging
                                        const stockNum = Number(item.stockLevel);
                                        const reorderNum = Number(item.reorderPoint);
                                        console.log(`Item ${item.name}: Stock=${stockNum}, Reorder=${reorderNum}`);

                                        // Show both elements side by side for diagnosis
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
        const markAsRead = async (id) => {
            try {
                // Assuming you have an API endpoint for marking support requests as read
                const updatedRequest = await updateSupportRequest(id, { isRead: true });

                // Update in the state
                setSupportRequests(supportRequests.map(req =>
                    req.id === id ? updatedRequest : req
                ));

                // Update unread count - only count support requests
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

                // Create a copy of all unread support requests
                const unreadRequests = supportRequests.filter(req => !req.isRead);

                if (unreadRequests.length === 0) {
                    console.log('No unread support requests to mark');
                    return;
                }

                // Optimistically update UI first
                const updatedRequests = supportRequests.map(req => ({
                    ...req,
                    isRead: true
                }));

                setSupportRequests(updatedRequests);
                setUnreadSupportRequests(0);

                // Now call the API to update each unread request
                for (const req of unreadRequests) {
                    try {
                        await updateSupportRequest(req.id, { isRead: true });
                        console.log(`Marked support request ${req.id} as read`);
                    } catch (error) {
                        console.error(`Failed to mark support request ${req.id} as read:`, error);
                    }
                }

                // Refresh the support requests to ensure data consistency
                const freshRequests = await getSupportRequests();
                setSupportRequests(freshRequests);

                // Update unread count
                const remainingUnread = freshRequests.filter(req => !req.isRead).length;
                setUnreadSupportRequests(remainingUnread);

                console.log('All support requests marked as read');
            } catch (error) {
                console.error('Error marking all support requests as read:', error);
                // If there's an error, refresh the data to make sure UI is consistent
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

                // Call the API to update all notifications in the database
                const updatedNotifications = await markAllNotificationsAsRead();
                console.log('API call successful. Updated notifications:', updatedNotifications);

                // Make sure we got a proper response
                if (Array.isArray(updatedNotifications)) {
                    console.log(`Setting state with ${updatedNotifications.length} notifications`);
                    // Update the state with the response from the server
                    setNotifications(updatedNotifications);
                } else {
                    console.error('Invalid response format:', updatedNotifications);
                    throw new Error('Invalid response format from server');
                }

                // Force a refresh of notifications to ensure we have the latest data
                setTimeout(() => {
                    refreshNotifications();
                }, 500);

            } catch (error) {
                console.error('Error marking all notifications as read:', error);
                alert('There was an error marking all notifications as read. Please try again.');
            }
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

                // Add message to the request
                const updatedMessages = [...selectedRequest.messages, newMessage];

                // Update request with new message
                const updatedRequest = await updateSupportRequest(selectedRequest.id, {
                    messages: updatedMessages
                });

                // Update in the state
                setSupportRequests(supportRequests.map(req =>
                    req.id === updatedRequest.id ? updatedRequest : req
                ));

                // Update selected request
                setSelectedRequest(updatedRequest);

                // Clear reply text
                setReplyText('');
            } catch (error) {
                console.error('Error sending reply:', error);
                alert('Failed to send reply. Please try again.');
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
        // Check if data is still loading
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

        // Check if we have data structure but it's empty
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

        // Destructure with fallback values
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

        // Handle period change
        const handleRevenuePeriodChange = async (e) => {
            const newPeriod = e.target.value;
            setRevenuePeriod(newPeriod);
            // Reset hovered bar when period changes
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
                                // Calculate maximum value to determine scaling factor
                                const maxTotal = Math.max(...dailyRevenue.map(day => day.total || 0));
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
                                // Calculate total revenue
                                const totalRevenue = revenueData.deviceRevenue.reduce((sum, item) => sum + (item.revenue_amount || item.revenue || 0), 0);

                                return revenueData.deviceRevenue.map((item, index) => {
                                    // Calculate percentage for each device
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
        // Create a function to handle notification updates
        const handleNotificationUpdate = async () => {
            console.log('Notification update event triggered');
            try {
                const notificationsData = await getNotifications();
                const unreadCount = notificationsData.filter(n => !n.isRead).length;

                // Update states
                setNotifications(notificationsData);
                setUnreadNotifications(unreadCount);
            } catch (error) {
                console.error('Error handling notification update:', error);
            }
        };

        // Add the event listener
        window.addEventListener('notification-update', handleNotificationUpdate);

        // Clean up
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