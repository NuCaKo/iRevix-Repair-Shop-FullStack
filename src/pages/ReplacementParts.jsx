import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import QuantitySelector from '../components/QuantitySelector';
import '../css/replacementParts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCart } from '../CartContext';
import {
    faMobileAlt,
    faLaptop,
    faTabletScreenButton,
    faHeadphones,
    faClock,
    faShoppingCart,
    faChevronRight,
    faScrewdriver,
    faMicrochip,
    faBatteryFull,
    faCamera,
    faVolumeUp,faSync
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { getDevicesAndModels, getInventoryParts } from '../services/api';

function ReplacementParts() {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [partsData, setPartsData] = useState([]);
    const [devices, setDevices] = useState([]);
    const [deviceModels, setDeviceModels] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [partQuantities, setPartQuantities] = useState({});
    const [reloadKey, setReloadKey] = useState(0);
    const { addToCart, refreshCart } = useCart();
    const location = useLocation();

    // Category to icon mapping for parts
    const categoryToIcon = {
        'Screen Assembly': faScrewdriver,
        'Battery': faBatteryFull,
        'Speaker Assembly': faVolumeUp,
        'Camera Module': faCamera,
        'Logic Board': faMicrochip,
        'Display Assembly': faScrewdriver,
        'Keyboard': faLaptop,
        'Speaker Driver': faVolumeUp,
        'Charging Case': faHeadphones,
        'Heart Rate Sensor': faClock
    };

    // Fetch devices and models from backend
    useEffect(() => {
        const fetchDevicesAndModels = async () => {
            try {
                setIsLoading(true);
                const response = await getDevicesAndModels();

                console.log('Fetched devices and models:', response);

                setDevices(response.devices);
                setDeviceModels(response.deviceModels);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching devices and models:', error);
                setIsLoading(false);
                // Fallback to static data if API fails
                setDevices([
                    { id: 'iphone', name: 'iPhone', icon: faMobileAlt },
                    { id: 'ipad', name: 'iPad', icon: faTabletScreenButton },
                    { id: 'macbook', name: 'MacBook', icon: faLaptop },
                    { id: 'airpods', name: 'AirPods', icon: faHeadphones },
                    { id: 'applewatch', name: 'Apple Watch', icon: faClock }
                ]);
                setDeviceModels({
                    iphone: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11 Pro', 'iPhone 11'],
                    ipad: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad Mini', 'iPad'],
                    macbook: ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Pro 13"', 'MacBook Air M2', 'MacBook Air M1'],
                    airpods: ['AirPods Pro 2nd Gen', 'AirPods Pro', 'AirPods 3rd Gen', 'AirPods 2nd Gen', 'AirPods Max'],
                    applewatch: ['Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch Series 8', 'Apple Watch SE 2nd Gen', 'Apple Watch Series 7']
                });
            }
        };

        fetchDevicesAndModels();
    }, []);
    useEffect(() => {
        // Only refetch if device and model are selected
        if (selectedDevice && selectedModel) {
            const fetchParts = async () => {
                try {
                    setIsLoading(true);
                    console.log(`Refreshing parts data for ${selectedDevice} ${selectedModel}`);

                    // Get the device name from the selected device id
                    const deviceObject = devices.find(d => d.id === selectedDevice);
                    const deviceName = deviceObject ? deviceObject.name : selectedDevice;

                    // Fetch parts from backend using the device name and selected model
                    const parts = await getInventoryParts(deviceName, selectedModel);

                    console.log('Refreshed parts data:', parts);

                    // Format parts data with icons based on categories
                    const formattedParts = parts.map(part => {
                        // Determine icon based on part category or name
                        let icon = faScrewdriver; // Default icon

                        // Try to match part name with category
                        for (const [category, categoryIcon] of Object.entries(categoryToIcon)) {
                            if (part.name.toLowerCase().includes(category.toLowerCase())) {
                                icon = categoryIcon;
                                break;
                            }
                        }

                        return {
                            id: part.id,
                            name: part.name,
                            price: part.price,
                            icon: icon,
                            description: part.description || `Genuine replacement part for your ${selectedModel}. Original quality with warranty.`,
                            compatibility: [selectedModel],
                            partNumber: part.partNumber,
                            stockLevel: part.stockLevel,
                            image: part.imageUrl || `https://source.unsplash.com/random/100x100/?${part.name}`
                        };
                    });

                    setPartsData(formattedParts);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching parts:', error);
                    setIsLoading(false);
                }
            };

            fetchParts();
        }
    }, [selectedDevice, selectedModel, devices, reloadKey]);

    // Fetch parts data when device and model are selected
    useEffect(() => {
        if (selectedDevice && selectedModel) {
            const fetchParts = async () => {
                try {
                    setIsLoading(true);
                    console.log(`Fetching parts for ${selectedDevice} ${selectedModel}`);

                    // Get the device name from the selected device id
                    const deviceObject = devices.find(d => d.id === selectedDevice);
                    const deviceName = deviceObject ? deviceObject.name : selectedDevice;

                    // Fetch parts from backend using the device name and selected model
                    const parts = await getInventoryParts(deviceName, selectedModel);

                    console.log('Fetched parts:', parts);

                    // Initialize quantities for all parts
                    const initialQuantities = {};
                    parts.forEach(part => {
                        initialQuantities[part.id] = 1;
                    });
                    setPartQuantities(initialQuantities);

                    // Format parts data with icons based on categories
                    const formattedParts = parts.map(part => {
                        // Determine icon based on part category or name
                        let icon = faScrewdriver; // Default icon

                        // Try to match part name with category
                        for (const [category, categoryIcon] of Object.entries(categoryToIcon)) {
                            if (part.name.toLowerCase().includes(category.toLowerCase())) {
                                icon = categoryIcon;
                                break;
                            }
                        }

                        return {
                            id: part.id,
                            name: part.name,
                            price: part.price,
                            icon: icon,
                            description: part.description || `Genuine replacement part for your ${selectedModel}. Original quality with warranty.`,
                            compatibility: [selectedModel],
                            partNumber: part.partNumber,
                            stockLevel: part.stockLevel,
                            image: part.imageUrl || `https://source.unsplash.com/random/100x100/?${part.name}`
                        };
                    });

                    setPartsData(formattedParts);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching parts:', error);
                    setIsLoading(false);
                    setPartsData([]); // Clear parts data on error
                }
            };

            fetchParts();
        } else {
            setPartsData([]);
        }
    }, [selectedDevice, selectedModel, devices]);

    const handleDeviceSelect = (deviceId) => {
        setSelectedDevice(deviceId);
        setSelectedModel('');
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
    };

    const handleQuantityChange = (partId, quantity) => {
        setPartQuantities(prev => ({
            ...prev,
            [partId]: quantity
        }));
    };

    const handleAddToCart = async (item) => {
        try {
            // Check if user is logged in
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) {
                window.showNotification('warning', "Please log in to add items to cart");
                return;
            }

            // Get the selected quantity
            const quantity = partQuantities[item.id] || 1;

            // Check if item is in stock and quantity is valid
            if (item.stockLevel <= 0) {
                window.showNotification('error', "This item is out of stock");
                return;
            }

            // Check if requested quantity exceeds available stock
            if (quantity > item.stockLevel) {
                window.showNotification('warning', `Only ${item.stockLevel} units available. You cannot add more.`);
                return;
            }

            const user = JSON.parse(currentUser);

            console.log(`Adding to cart: partId=${item.id}, quantity=${quantity}, name=${item.name}`);

            // 1. First update the inventory to reserve the items
            const inventoryData = {
                partId: item.id,
                decreaseAmount: quantity
            };

            console.log("Updating inventory with data:", inventoryData);

            const inventoryResponse = await fetch('http://localhost:8080/api/inventory/update', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(inventoryData)
            });

            console.log("Inventory update response status:", inventoryResponse.status);

            if (!inventoryResponse.ok) {
                const errorData = await inventoryResponse.json();
                console.error("Inventory update failed:", errorData);
                throw new Error(errorData.message || "Failed to update inventory");
            }

            const inventoryResult = await inventoryResponse.json();
            console.log("Inventory update result:", inventoryResult);

            // 2. Now add to cart
            const formData = new URLSearchParams({
                'userId': user.id,
                'partId': String(item.id),
                'quantity': String(quantity),
                'type': 'part',
                'name': item.name,
                'price': String(item.price),
                'description': item.description || ''
            });

            const cartResponse = await fetch('http://localhost:8080/api/cart/add', {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            if (!cartResponse.ok) {
                const errorText = await cartResponse.text();
                console.error("Cart add response:", cartResponse.status, errorText);
                throw new Error(`Failed to add to cart: ${errorText}`);
            }

            console.log("Successfully added to cart");

            // Reset quantity back to 1
            setPartQuantities(prev => ({
                ...prev,
                [item.id]: 1
            }));

            // Update the UI to reflect the new stock level from the response
            if (inventoryResult.success) {
                setPartsData(prevParts => {
                    return prevParts.map(part => {
                        if (part.id === item.id) {
                            console.log(`Updating stock level for part ${part.name} from ${part.stockLevel} to ${inventoryResult.newStockLevel}`);
                            return {
                                ...part,
                                stockLevel: inventoryResult.newStockLevel
                            };
                        }
                        return part;
                    });
                });
            }

            // Refresh cart
            refreshCart();

            // Show success notification
            window.showNotification('success', `Added ${item.name} to cart!`);

        } catch (error) {
            console.error('Error adding to cart:', error);
            window.showNotification('error', error.message || 'Failed to add item to cart');
        }
    };
    const refreshPartsData = () => {
        setReloadKey(prevKey => prevKey + 1);
        setIsLoading(true);
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="replacement-parts-page">
            <Navbar />

            {/* Blue header section similar to repair page */}
            <div className="page-header">
                <div className="header-content">
                    <h1>Apple Device Replacement Parts</h1>
                    <p>Genuine replacement parts for all your Apple devices</p>
                </div>
            </div>

            <div className="parts-container">
                {isLoading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <div className="selection-flow">
                        {/* Step 1: Device Selection */}
                        <motion.div
                            className="selection-section"
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                        >
                            <h2>Select Your Device</h2>
                            <div className="device-grid">
                                {devices.map(device => (
                                    <div
                                        key={device.id}
                                        className={`device-card ${selectedDevice === device.id ? 'selected' : ''}`}
                                        onClick={() => handleDeviceSelect(device.id)}
                                    >
                                        <FontAwesomeIcon icon={device.icon} className="device-icon" />
                                        <h3>{device.name}</h3>
                                        {selectedDevice === device.id && (
                                            <div className="selected-check"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Step 2: Model Selection */}
                        {selectedDevice && (
                            <motion.div
                                className="selection-section"
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                            >
                                <h2>Select Your Model</h2>
                                <div className="model-grid">
                                    {deviceModels[selectedDevice]?.map(model => (
                                        <div
                                            key={model}
                                            className={`model-card ${selectedModel === model ? 'selected' : ''}`}
                                            onClick={() => handleModelSelect(model)}
                                        >
                                            <h3>{model}</h3>
                                            <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Parts Selection */}
                        {selectedModel && (
                            <motion.div
                                className="selection-section"
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                            >
                                <h2>Available Replacement Parts for {selectedModel}</h2>
                                <div className="parts-grid">
                                    {partsData.length > 0 ? (
                                        partsData.map(part => (
                                            <div key={part.id} className="part-card">
                                                <div className="part-image">
                                                    <div className="placeholder-image">
                                                        <FontAwesomeIcon icon={part.icon || faMobileAlt} className="placeholder-producst-icon" />
                                                    </div>
                                                </div>
                                                <div className="part-details">
                                                    <h3>{part.name}</h3>
                                                    <p className="part-number">Part #: {part.partNumber}</p>
                                                    <p className="part-description">{part.description}</p>
                                                    <div className="part-inventory-status">
                                                        <span className={`stock-status ${part.stockLevel > 5 ? 'in-stock' : part.stockLevel > 0 ? 'low-stock' : 'out-of-stock'}`}>
                                                            {part.stockLevel > 5 ? 'In Stock' : part.stockLevel > 0 ? `Low Stock: ${part.stockLevel} left` : 'Out of Stock'}
                                                        </span>
                                                    </div>
                                                    <div className="part-price-row">
                                                        <span className="part-price">${part.price.toFixed(2)}</span>
                                                        {part.stockLevel > 0 ? (
                                                            <div className="cart-controls">
                                                                <QuantitySelector
                                                                    maxQuantity={part.stockLevel}
                                                                    onQuantityChange={(quantity) => handleQuantityChange(part.id, quantity)}
                                                                    initialQuantity={partQuantities[part.id] || 1}
                                                                />
                                                                <button
                                                                    className="add-to-cart-btn"
                                                                    onClick={() => handleAddToCart(part)}
                                                                >
                                                                    <FontAwesomeIcon icon={faShoppingCart} />
                                                                    Add to Cart
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="add-to-cart-btn disabled"
                                                                disabled
                                                            >
                                                                <FontAwesomeIcon icon={faShoppingCart} />
                                                                Out of Stock
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-parts">
                                            <p>No replacement parts available for this model.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            <ScrollToTop />
        </div>
    );
}

export default ReplacementParts;