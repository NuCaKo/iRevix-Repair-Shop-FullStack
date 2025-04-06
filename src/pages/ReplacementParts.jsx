import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
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
    faVolumeUp
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

function ReplacementParts() {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [partsData, setPartsData] = useState([]);
    const { addToCart } = useCart();
    const location = useLocation();

    // Sample device data
    const devices = [
        { id: 'iphone', name: 'iPhone', icon: faMobileAlt },
        { id: 'ipad', name: 'iPad', icon: faTabletScreenButton },
        { id: 'macbook', name: 'MacBook', icon: faLaptop },
        { id: 'airpods', name: 'AirPods', icon: faHeadphones },
        { id: 'applewatch', name: 'Apple Watch', icon: faClock }
    ];

    // Sample models based on device selection
    const deviceModels = {
        iphone: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 11 Pro', 'iPhone 11'],
        ipad: ['iPad Pro 12.9"', 'iPad Pro 11"', 'iPad Air', 'iPad Mini', 'iPad'],
        macbook: ['MacBook Pro 16"', 'MacBook Pro 14"', 'MacBook Pro 13"', 'MacBook Air M2', 'MacBook Air M1'],
        airpods: ['AirPods Pro 2nd Gen', 'AirPods Pro', 'AirPods 3rd Gen', 'AirPods 2nd Gen', 'AirPods Max'],
        applewatch: ['Apple Watch Ultra 2', 'Apple Watch Series 9', 'Apple Watch Series 8', 'Apple Watch SE 2nd Gen', 'Apple Watch Series 7']
    };

    // Common replacement parts categories by device type
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
            { icon: faClock, category: 'Heart Rate Sensor', prefix: 'Apple Watch' }
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
                partNumber: `${part.prefix}-${part.category.replace(/\s/g, '')}-${Math.floor(Math.random() * 10000)}`
            };
        });
    };

    // Set default parts data when device and model are selected
    useEffect(() => {
        if (selectedDevice && selectedModel) {
            const generatedParts = generateReplacementParts(selectedDevice, selectedModel);
            setPartsData(generatedParts);
        } else {
            setPartsData([]);
        }
    }, [selectedDevice, selectedModel]);

    const handleDeviceSelect = (deviceId) => {
        setSelectedDevice(deviceId);
        setSelectedModel('');
    };

    const handleModelSelect = (model) => {
        setSelectedModel(model);
    };

    const handleAddToCart = (part) => {
        // Make sure part has all required fields
        const partWithDefaults = {
            ...part,
            quantity: 1,
            // If image is missing, add a placeholder
            image: part.image || `https://source.unsplash.com/random/100x100/?${part.category || 'apple'}`,
            // Ensure type is specified
            type: 'part'
        };

        addToCart(partWithDefaults);
        alert(`Added ${part.name} to cart!`);
    };

    // Framer motion variants for animations
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
                                                <div className="part-price-row">
                                                    <span className="part-price">${part.price.toFixed(2)}</span>
                                                    <button
                                                        className="add-to-cart-btn"
                                                        onClick={() => handleAddToCart(part)}
                                                    >
                                                        <FontAwesomeIcon icon={faShoppingCart} />
                                                        Add to Cart
                                                    </button>
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
            </div>

            <ScrollToTop />
        </div>
    );
}

export default ReplacementParts;