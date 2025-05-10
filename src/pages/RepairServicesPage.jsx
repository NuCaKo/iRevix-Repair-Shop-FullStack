import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import ScrollToTop from '../components/ScrollToTop';
// Removed RepairShowcase import since we're implementing it inline
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import '../css/mainPage.css';
import '../css/repairServices.css';
import { useCart } from '../CartContext';
// Remove API imports
// import {
//     getDevicesAndModels,
//     getServiceTypes,
//     getServiceOptions
// } from '../services/api';

// Keep the 5 static images
import repairImage1 from '../images/repair1.png';
import repairImage2 from '../images/repair2.jpeg';
import repairImage3 from '../images/repair3.png';
import repairImage4 from '../images/repair4.png';
import repairImage5 from '../images/repair5.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faWrench,
    faMobileAlt,
    faLaptop,
    faBatteryFull,
    faHeadphones,
    faTabletScreenButton,
    faHeart,
    faTools,
    faClock,
    faShield,
    faStar,
    faThumbsUp,
    faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

import { motion, AnimatePresence } from 'framer-motion';

function RepairServicesPage() {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [subProblems, setSubProblems] = useState({});
    const [issueDescription, setIssueDescription] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [numericPrice, setNumericPrice] = useState(0);
    const [hasCalculatedPrice, setHasCalculatedPrice] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Set to false since no API loading
    const [validationError, setValidationError] = useState('');
    const [priceBreakdown, setPriceBreakdown] = useState([]);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Static data instead of API calls
    const [devices] = useState([
        {
            id: 'macbook',
            name: 'MacBook',
            style: "horizontal-device",
            displayName: "MacBook",
            faIcon: faLaptop
        },
        {
            id: 'iphone',
            name: 'iPhone',
            style: "square-device",
            displayName: "iPhone",
            faIcon: faMobileAlt
        },
        {
            id: 'airpods',
            name: 'AirPods',
            style: "square-device",
            displayName: "AirPods",
            faIcon: faHeadphones
        },
        {
            id: 'applewatch',
            name: 'Apple Watch',
            style: "square-device",
            displayName: "Apple Watch",
            faIcon: faClock
        },
        {
            id: 'ipad',
            name: 'iPad',
            style: "square-device",
            displayName: "iPad",
            faIcon: faTabletScreenButton
        }
    ]);

    const [deviceModels] = useState({
        'macbook': [
            { value: "MacBook Pro 14\" (2023)", label: "MacBook Pro 14\" (2023)" },
            { value: "MacBook Pro 16\" (2023)", label: "MacBook Pro 16\" (2023)" },
            { value: "MacBook Air M2 (2022)", label: "MacBook Air M2 (2022)" },
            { value: "MacBook Air M1 (2020)", label: "MacBook Air M1 (2020)" },
            { value: "MacBook Pro 13\" (2020)", label: "MacBook Pro 13\" (2020)" },
            { value: "Other Mac", label: "Other Mac" }
        ],
        'iphone': [
            { value: "iPhone 15 Pro Max", label: "iPhone 15 Pro Max" },
            { value: "iPhone 15 Pro", label: "iPhone 15 Pro" },
            { value: "iPhone 15", label: "iPhone 15" },
            { value: "iPhone 14 Pro Max", label: "iPhone 14 Pro Max" },
            { value: "iPhone 14", label: "iPhone 14" },
            { value: "iPhone 13", label: "iPhone 13" },
            { value: "Other iPhone", label: "Other iPhone" }
        ],
        'ipad': [
            { value: "iPad Pro 12.9\" (2022)", label: "iPad Pro 12.9\" (2022)" },
            { value: "iPad Air (2022)", label: "iPad Air (2022)" },
            { value: "iPad 10th gen", label: "iPad 10th gen" },
            { value: "Other iPad", label: "Other iPad" }
        ],
        'applewatch': [
            { value: "Apple Watch Ultra 2", label: "Apple Watch Ultra 2" },
            { value: "Apple Watch Series 9", label: "Apple Watch Series 9" },
            { value: "Apple Watch Series 8", label: "Apple Watch Series 8" },
            { value: "Other Apple Watch", label: "Other Apple Watch" }
        ],
        'airpods': [
            { value: "AirPods Pro (2nd gen)", label: "AirPods Pro (2nd gen)" },
            { value: "AirPods (3rd gen)", label: "AirPods (3rd gen)" },
            { value: "AirPods Max", label: "AirPods Max" },
            { value: "Other AirPods", label: "Other AirPods" }
        ]
    });

    // Static repair types with the 5 static images
    const [repairTypes] = useState([
        {
            title: "MacBook Repair",
            image: repairImage1,
            description: "Professional MacBook repair with genuine Apple parts and expert technicians.",
            services: ["Screen Replacement", "Battery Replacement", "Keyboard Repair", "Logic Board Repair", "Water Damage"]
        },
        {
            title: "Apple Watch Repair",
            image: repairImage2,
            description: "Professional Apple Watch repair with genuine Apple parts and expert technicians.",
            services: ["Screen Replacement", "Battery Replacement", "Button Repair", "Water Damage", "Sensor Issues"]
        },
        {
            title: "iPad Repair",
            image: repairImage3,
            description: "Professional iPad repair with genuine Apple parts and expert technicians.",
            services: ["Screen Replacement", "Battery Replacement", "Home Button Repair", "Water Damage", "Charging Port"]
        },
        {
            title: "iPhone Repair",
            image: repairImage4,
            description: "Professional iPhone repair with genuine Apple parts and expert technicians.",
            services: ["Screen Replacement", "Battery Replacement", "Camera Repair", "Water Damage", "Face ID Repair"]
        },
        {
            title: "AirPods Repair",
            image: repairImage5,
            description: "Professional AirPods repair with genuine Apple parts and expert technicians.",
            services: ["Sound Issues", "Battery Replacement", "Charging Case Repair", "Connection Problems"]
        }
    ]);

    // Static service types by device
    const [serviceTypesByDevice] = useState({
        'macbook': [
            { id: 1, title: "Screen Repair", basePrice: 150, deviceType: "MacBook" },
            { id: 2, title: "Battery Replacement", basePrice: 100, deviceType: "MacBook" },
            { id: 3, title: "Keyboard Repair", basePrice: 120, deviceType: "MacBook" },
            { id: 4, title: "Logic Board Repair", basePrice: 200, deviceType: "MacBook" }
        ],
        'iphone': [
            { id: 5, title: "Screen Repair", basePrice: 80, deviceType: "iPhone" },
            { id: 6, title: "Battery Replacement", basePrice: 60, deviceType: "iPhone" },
            { id: 7, title: "Camera Repair", basePrice: 70, deviceType: "iPhone" },
            { id: 8, title: "Charging Port", basePrice: 50, deviceType: "iPhone" }
        ],
        'ipad': [
            { id: 9, title: "Screen Repair", basePrice: 100, deviceType: "iPad" },
            { id: 10, title: "Battery Replacement", basePrice: 80, deviceType: "iPad" },
            { id: 11, title: "Home Button Repair", basePrice: 60, deviceType: "iPad" }
        ],
        'applewatch': [
            { id: 12, title: "Screen Repair", basePrice: 90, deviceType: "Apple Watch" },
            { id: 13, title: "Battery Replacement", basePrice: 70, deviceType: "Apple Watch" },
            { id: 14, title: "Button Repair", basePrice: 50, deviceType: "Apple Watch" }
        ],
        'airpods': [
            { id: 15, title: "Sound Issues", basePrice: 60, deviceType: "AirPods" },
            { id: 16, title: "Battery Replacement", basePrice: 70, deviceType: "AirPods" },
            { id: 17, title: "Charging Case Repair", basePrice: 50, deviceType: "AirPods" }
        ]
    });

    // Static service options
    const [serviceOptions] = useState({
        1: [ // MacBook Screen Repair options
            { id: 101, name: "MacBook Pro 14-16\" Screen", price: 250 },
            { id: 102, name: "MacBook Pro 13\" Screen", price: 200 },
            { id: 103, name: "MacBook Air Screen", price: 180 }
        ],
        2: [ // MacBook Battery options
            { id: 104, name: "MacBook Pro Battery", price: 120 },
            { id: 105, name: "MacBook Air Battery", price: 100 }
        ],
        3: [ // MacBook Keyboard options
            { id: 106, name: "Full Keyboard Replacement", price: 150 },
            { id: 107, name: "Individual Key Repair", price: 40 }
        ],
        4: [ // MacBook Logic Board options
            { id: 108, name: "Full Logic Board Replacement", price: 350 },
            { id: 109, name: "Component-Level Repair", price: 200 }
        ],
        5: [ // iPhone Screen options
            { id: 110, name: "iPhone Pro/Pro Max Screen", price: 150 },
            { id: 111, name: "iPhone Standard Screen", price: 100 },
            { id: 112, name: "iPhone SE Screen", price: 80 }
        ],
        6: [ // iPhone Battery options
            { id: 113, name: "iPhone Pro/Pro Max Battery", price: 80 },
            { id: 114, name: "iPhone Standard Battery", price: 60 },
            { id: 115, name: "iPhone SE Battery", price: 50 }
        ],
        7: [ // iPhone Camera options
            { id: 116, name: "Rear Camera Module", price: 90 },
            { id: 117, name: "Front Camera Module", price: 70 }
        ],
        8: [ // iPhone charging port options
            { id: 118, name: "Lightning Port Replacement", price: 60 },
            { id: 119, name: "USB-C Port Replacement", price: 70 }
        ],
        9: [ // iPad Screen options
            { id: 120, name: "iPad Pro Screen", price: 180 },
            { id: 121, name: "iPad Air/Standard Screen", price: 130 },
            { id: 122, name: "iPad Mini Screen", price: 110 }
        ],
        10: [ // iPad Battery options
            { id: 123, name: "iPad Pro Battery", price: 100 },
            { id: 124, name: "iPad Air/Standard Battery", price: 80 },
            { id: 125, name: "iPad Mini Battery", price: 70 }
        ],
        11: [ // iPad Home Button options
            { id: 126, name: "Home Button Replacement", price: 60 },
            { id: 127, name: "Touch ID Sensor Repair", price: 80 }
        ],
        12: [ // Apple Watch Screen options
            { id: 128, name: "Apple Watch Ultra Screen", price: 150 },
            { id: 129, name: "Apple Watch Series 8/9 Screen", price: 120 },
            { id: 130, name: "Apple Watch SE Screen", price: 90 }
        ],
        13: [ // Apple Watch Battery options
            { id: 131, name: "Apple Watch Ultra Battery", price: 80 },
            { id: 132, name: "Apple Watch Series 8/9 Battery", price: 70 },
            { id: 133, name: "Apple Watch SE Battery", price: 60 }
        ],
        14: [ // Apple Watch Button options
            { id: 134, name: "Digital Crown Replacement", price: 60 },
            { id: 135, name: "Side Button Replacement", price: 50 }
        ],
        15: [ // AirPods Sound Issues options
            { id: 136, name: "Single AirPod Repair", price: 50 },
            { id: 137, name: "Both AirPods Repair", price: 90 }
        ],
        16: [ // AirPods Battery options
            { id: 138, name: "Single AirPod Battery", price: 40 },
            { id: 139, name: "Both AirPods Batteries", price: 70 },
            { id: 140, name: "Charging Case Battery", price: 50 }
        ],
        17: [ // AirPods Case options
            { id: 141, name: "Charging Port Repair", price: 40 },
            { id: 142, name: "Hinge Repair", price: 35 },
            { id: 143, name: "Full Case Replacement", price: 80 }
        ]
    });

    const [otherIssueBasePrice] = useState(45);

    useEffect(() => {
        setIsVisible(true);
        window.scrollTo(0, 0);
    }, []);

    // Remove API-related useEffects

    useEffect(() => {
        setValidationError('');
        if (selectedProblems.length === 0) {
            setEstimatedPrice(null);
            setNumericPrice(0);
            setHasCalculatedPrice(false);
            return;
        }

        // Check if any service type is missing a sub-option selection
        const hasIncompleteSelections = selectedProblems.some(problem => {
            if (problem === 'Other') {
                return issueDescription.trim() === '';
            }

            return !subProblems[problem] || subProblems[problem] === '';
        });

        if (hasIncompleteSelections) {
            setValidationError("Please select options for all issues or provide details for custom issues");
            setEstimatedPrice(null);
            setNumericPrice(0);
            setHasCalculatedPrice(false);
            return;
        }

        calculatePrice();
        setHasCalculatedPrice(true);
    }, [selectedProblems, subProblems, issueDescription]);

    useEffect(() => {
        setEstimatedPrice(null);
        setNumericPrice(0);
        setHasCalculatedPrice(false);
        setSelectedProblems([]);
        setSubProblems({});
        setIssueDescription('');
    }, [selectedDevice, selectedModel]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const slideInRight = {
        hidden: { x: 100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    const handleDeviceSelection = (device) => {
        setSelectedDevice(device);
        setSelectedModel('');
        setSelectedProblems([]);
        setSubProblems({});
        setIssueDescription('');
        setEstimatedPrice(null);
        setNumericPrice(0);
        setHasCalculatedPrice(false);
    };

    const handleModelSelection = (model) => {
        setSelectedModel(model);
        setEstimatedPrice(null);
        setNumericPrice(0);
        setHasCalculatedPrice(false);
    };

    const handleProblemSelection = (problem) => {
        setSelectedProblems((prevProblems) => {
            let newProblems;
            if (prevProblems.includes(problem)) {
                newProblems = prevProblems.filter((p) => p !== problem);
                setSubProblems((prev) => {
                    const newSubProblems = { ...prev };
                    delete newSubProblems[problem];
                    return newSubProblems;
                });
            } else {
                newProblems = [...prevProblems, problem];
            }
            return newProblems;
        });
    };

    const handleSubProblemSelection = (problem, subProblem) => {
        setSubProblems((prevSubProblems) => ({
            ...prevSubProblems,
            [problem]: subProblem,
        }));
    };

    // Fully dynamic price calculation with breakdown
    const calculatePrice = () => {
        if (selectedProblems.length === 0) {
            setEstimatedPrice(null);
            setNumericPrice(0);
            setPriceBreakdown([]);
            setHasCalculatedPrice(false);
            return;
        }

        const hasOtherSelected = selectedProblems.includes('Other');
        const regularProblems = selectedProblems.filter(problem => problem !== 'Other');
        const hasUnselectedRegularIssues = regularProblems.some(problem => {
            return !subProblems[problem] || subProblems[problem] === '';
        });

        if (hasUnselectedRegularIssues) {
            setEstimatedPrice(null);
            setNumericPrice(0);
            setPriceBreakdown([]);
            return;
        }

        let basePrice = 0;
        const breakdown = [];

        // Calculate price based on selected services and options from database
        regularProblems.forEach(problem => {
            // Find the service type that matches this problem
            const deviceTypes = serviceTypesByDevice[selectedDevice] || [];
            const serviceType = deviceTypes.find(type => type.title === problem);

            if (serviceType) {
                // Add base price for this service type
                const serviceBasePrice = serviceType.basePrice || 0;
                basePrice += serviceBasePrice;

                // Add to breakdown
                breakdown.push({
                    label: `${problem} (Base Service Fee)`,
                    price: serviceBasePrice
                });

                // Get selected option
                const selectedOption = subProblems[problem];
                if (selectedOption) {
                    // Find the matching option and its price
                    const typeOptions = serviceOptions[serviceType.id] || [];
                    const option = typeOptions.find(opt => opt.name === selectedOption);

                    if (option) {
                        const optionPrice = option.price || 0;
                        basePrice += optionPrice;

                        // Add to breakdown
                        breakdown.push({
                            label: selectedOption,
                            price: optionPrice
                        });
                    }
                }
            }
        });

        // Add default price for "Other" issues if selected
        if (hasOtherSelected && issueDescription.trim() !== '') {
            basePrice += otherIssueBasePrice;

            // Add to breakdown
            breakdown.push({
                label: 'Other Issue Fee',
                price: otherIssueBasePrice
            });
        }

        setNumericPrice(basePrice);
        setEstimatedPrice(`$${basePrice.toFixed(2)} - $${(basePrice + 50).toFixed(2)}`);
        setPriceBreakdown(breakdown);
    };

    const handleGetPrice = () => {
        setValidationError('');
        if (selectedProblems.length === 0) {
            setValidationError("Please select at least one problem to get a price estimate.");
            return;
        }

        const hasIncompleteIssues = selectedProblems.some(problem => {
            if (problem === 'Other') {
                return issueDescription.trim() === '';
            }
            return !subProblems[problem] || subProblems[problem] === '';
        });

        if (hasIncompleteIssues) {
            setValidationError("Please complete all selections to get an accurate price estimate");
            return;
        }

        calculatePrice();
        setHasCalculatedPrice(true);
    };

    const handleProceedWithRepair = () => {
        if (selectedProblems.length === 0) {
            // Use notification instead of alert
            window.showNotification('warning', "Please select at least one problem before proceeding with repair.");
            return;
        }
        if (!hasCalculatedPrice || numericPrice === 0) {
            // Use notification instead of alert
            window.showNotification('warning', "Please get a price estimate before proceeding.");
            return;
        }

        // Create a detailed description of selected services and options
        const problemDetails = selectedProblems.map(problem => {
            if (problem === 'Other') {
                return `Other Issue: ${issueDescription}`;
            }

            if (subProblems[problem]) {
                return `${problem}: ${subProblems[problem]}`;
            }

            return problem;
        }).join(', ');

        // Get the device icon
        const deviceInfo = devices.find(d => d.id === selectedDevice);
        const deviceIcon = deviceInfo ? deviceInfo.faIcon : faWrench;

        const repairItem = {
            id: `repair-${Date.now()}`, // Unique ID using timestamp
            name: `${selectedDevice} ${selectedModel} Repair`,
            description: problemDetails,
            price: numericPrice,
            quantity: 1,
            type: 'service',
            icon: deviceIcon
        };

        addToCart(repairItem);

        // Reset the form for a new repair quote
        setSelectedProblems([]);
        setSubProblems({});
        setIssueDescription('');
        setEstimatedPrice(null);
        setNumericPrice(0);
        setHasCalculatedPrice(false);
    }

    const getIconColor = (device) => {
        return selectedDevice === device ? "#28a745" : "currentColor"; // Green if selected
    };

    const getModelOptions = (device) => {
        if (!deviceModels[device]) {
            return [];
        }

        // Check if deviceModels[device] is an array of objects or strings
        if (typeof deviceModels[device][0] === 'object') {
            // If it's an array of objects with value/label properties
            return deviceModels[device];
        } else {
            // If it's an array of strings, convert to value/label objects
            return deviceModels[device].map(model => ({
                value: model,
                label: model
            }));
        }
    };

    // Render problem options based on static data
    const renderProblemOptions = () => {
        // Get service types for the selected device
        const deviceTypes = serviceTypesByDevice[selectedDevice] || [];

        if (deviceTypes.length === 0) {
            return (
                <div className="no-service-types">
                    <p>No service types available for this device. Please contact support.</p>
                </div>
            );
        }

        return (
            <div className="problem-selection">
                {deviceTypes.map(serviceType => (
                    <label key={serviceType.id} className="problem-option">
                        <input
                            type="checkbox"
                            value={serviceType.title}
                            checked={selectedProblems.includes(serviceType.title)}
                            onChange={() => handleProblemSelection(serviceType.title)}
                        />
                        <span className="problem-text">{serviceType.title}</span>
                    </label>
                ))}
                <label className="problem-option">
                    <input
                        type="checkbox"
                        value="Other"
                        checked={selectedProblems.includes('Other')}
                        onChange={() => handleProblemSelection('Other')}
                    />
                    <span className="problem-text">Other</span>
                </label>
            </div>
        );
    };

    // Render sub-problems based on static data
    const renderSubProblems = () => {
        return selectedProblems.map(problem => {
            if (problem === 'Other') {
                return (
                    <AnimatePresence key="other">
                        <motion.div
                            className="sub-problem-selection"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h4>Other Issues</h4>
                            <textarea
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                placeholder="Describe the issue with your device"
                                className="issue-textarea"
                            />
                        </motion.div>
                    </AnimatePresence>
                );
            }

            // Find the service type that matches this problem
            const deviceTypes = serviceTypesByDevice[selectedDevice] || [];
            const serviceType = deviceTypes.find(type => type.title === problem);

            if (!serviceType) return null;

            // Get options for this service type
            const typeOptions = serviceOptions[serviceType.id] || [];

            if (typeOptions.length === 0) return null;

            return (
                <AnimatePresence key={problem}>
                    <motion.div
                        className="sub-problem-selection"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h4>{problem} Options</h4>
                        <select
                            value={subProblems[problem] || ''}
                            onChange={(e) => handleSubProblemSelection(problem, e.target.value)}
                            className="issue-select"
                        >
                            <option value="">Select Option</option>
                            {typeOptions.map(option => (
                                <option key={option.id} value={option.name}>
                                    {option.name} - ${option.price.toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                </AnimatePresence>
            );
        });
    };

    // Render price breakdown component
    const renderPriceBreakdown = () => {
        if (!hasCalculatedPrice || priceBreakdown.length === 0) {
            return null;
        }

        return (
            <div className="price-breakdown">
                <h4 className="breakdown-title">
                    <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
                    Price Breakdown
                </h4>
                <ul className="breakdown-list">
                    {priceBreakdown.map((item, index) => (
                        <li key={index} className="breakdown-item">
                            <span className="breakdown-label">{item.label}</span>
                            <span className="breakdown-price">${item.price.toFixed(2)}</span>
                        </li>
                    ))}
                    <li className="breakdown-item breakdown-total">
                        <span className="breakdown-label">Total</span>
                        <span className="breakdown-price">${numericPrice.toFixed(2)}</span>
                    </li>
                </ul>
            </div>
        );
    };

    return (
        <div className="repair-services-page">
            <Navbar />

            <div className="page-header">
                <div className="header-content">
                    <h1>Apple Device Repair Services</h1>
                    <p>Professional repair solutions for all your Apple devices</p>
                </div>
            </div>

            {/* DEVICE SELECTION SECTION */}
            <div className="device-selection-section">
                {isLoading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Loading device information...</p>
                    </div>
                ) : (
                    <motion.div
                        className="device-selection-container"
                        initial="hidden"
                        animate={isVisible ? "visible" : "hidden"}
                        variants={fadeInUp}
                    >
                        <h2>Get a Repair Quote</h2>
                        <p className="section-subtitle">Select your device and issue to get a quick price estimate</p>

                        <div className="device-selection-grid">
                            {devices.map((device) => (
                                <motion.div
                                    key={device.id}
                                    className={`device-item ${device.style} ${selectedDevice === device.id ? 'selected-device' : ''}`}
                                    onClick={() => handleDeviceSelection(device.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div
                                        className="device-placeholder"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        <FontAwesomeIcon
                                            icon={device.faIcon}
                                            beat={isHovered && device.id === "applewatch"}
                                            className="placeholder-icon"
                                            color={getIconColor(device.id)}
                                        />
                                        <span>{device.displayName}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <AnimatePresence>
                            {selectedDevice && (
                                <motion.div
                                    className="model-selection-container"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="model-selection">
                                        <h3>Select Your {devices.find(d => d.id === selectedDevice)?.displayName || selectedDevice} Model</h3>
                                        <p className="model-instruction">Choose your specific model for an accurate repair quote</p>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => handleModelSelection(e.target.value)}
                                            className="model-select"
                                        >
                                            <option value="">-- Select a Model --</option>
                                            {getModelOptions(selectedDevice).map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                <AnimatePresence>
                    {selectedModel && (
                        <motion.div
                            key={`${selectedDevice}-${selectedModel}`}
                            className="problem-selection-container"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={slideInRight}
                        >
                            <div className="problem-container">
                                <h3>What problems do you have with your {devices.find(d => d.id === selectedDevice)?.displayName || selectedDevice}?</h3>
                                {renderProblemOptions()}
                                {renderSubProblems()}
                                {validationError && (
                                    <div className="validation-error">
                                        {validationError}
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {estimatedPrice && (
                                    <motion.div
                                        className="price-estimation"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <h3>Estimated Price: {estimatedPrice}</h3>
                                        {renderPriceBreakdown()}
                                        <motion.button
                                            className="proceed-button"
                                            onClick={handleProceedWithRepair}
                                            whileHover={{ scale: 1.05, backgroundColor: "#28a745" }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={!estimatedPrice || selectedProblems.length === 0}
                                        >
                                            Proceed with Repair
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!estimatedPrice && selectedProblems.length > 0 && (
                                <div className="get-price-button-container">
                                    <motion.button
                                        className="get-price-button"
                                        onClick={handleGetPrice}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Get Price Estimate
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* REPAIR SHOWCASE SECTION */}
            <div className="repair-showcase-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeInUp}
                >
                    <h2>Our Repair Services</h2>
                    <p className="section-subtitle">Expert repair services for all Apple products</p>
                    {/* Inline showcase instead of using component */}
                    <div className="repair-showcase">
                        <div style={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                            overflowX: 'auto',
                            gap: '20px',
                            padding: '10px 0',
                            justifyContent: 'center'
                        }}>
                            {repairTypes.map((repairType, index) => (
                                <motion.div
                                    key={index}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.1 }}
                                    variants={fadeInUp}
                                    style={{
                                        flex: '0 0 280px',
                                        maxWidth: '280px',
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        marginBottom: '20px'
                                    }}
                                >
                                    <div style={{
                                        height: '180px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <img
                                            src={repairType.image}
                                            alt={repairType.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease'
                                            }}
                                        />
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{
                                            fontSize: '1.4rem',
                                            marginBottom: '10px',
                                            color: '#2c3e50'
                                        }}>{repairType.title}</h3>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: '#6c757d',
                                            marginBottom: '15px',
                                            lineHeight: '1.5'
                                        }}>{repairType.description}</p>
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: '0',
                                            margin: '0'
                                        }}>
                                            {repairType.services.map((service, serviceIndex) => (
                                                <li
                                                    key={serviceIndex}
                                                    style={{
                                                        fontSize: '0.9rem',
                                                        marginBottom: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCheck}
                                                        style={{
                                                            color: '#28a745',
                                                            marginRight: '8px'
                                                        }}
                                                    />
                                                    {service}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* SERVICES OVERVIEW SECTION */}
            <div className="services-overview">
                <motion.div
                    className="service-cards-container"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={staggerContainer}
                >
                    <h2>Our Services</h2>
                    <p className="section-subtitle">Fast, reliable and professional device repair services</p>

                    <div className="service-cards">
                        <motion.div className="service-card" variants={fadeInUp}>
                            <div className="service-icon-container">
                                <FontAwesomeIcon icon={faWrench} className="service-icon-lg" />
                            </div>
                            <h3>Expert Repairs</h3>
                            <p>Our certified technicians provide high-quality repairs with genuine parts and warranty.</p>
                        </motion.div>

                        <motion.div className="service-card" variants={fadeInUp}>
                            <div className="service-icon-container">
                                <FontAwesomeIcon icon={faMobileAlt} className="service-icon-lg" />
                            </div>
                            <h3>All Apple Devices</h3>
                            <p>From iPhones and MacBooks to iPads and Apple Watches - we fix them all.</p>
                        </motion.div>

                        <motion.div className="service-card" variants={fadeInUp}>
                            <div className="service-icon-container">
                                <FontAwesomeIcon icon={faBatteryFull} className="service-icon-lg" />
                            </div>
                            <h3>Same-Day Service</h3>
                            <p>Most repairs are completed within 24 hours, getting you back up and running quickly.</p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <Footer />
            <ScrollToTop />
        </div>
    );
}

export default RepairServicesPage;