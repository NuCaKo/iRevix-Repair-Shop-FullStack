import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import ScrollToTop from '../components/ScrollToTop';
import RepairShowcase from '../components/RepairShowcase';
import '../css/mainPage.css';
import '../css/repairServices.css';
import { useCart } from '../CartContext';
import {
    getDevicesAndModels,
    getServiceTypes,
    getServiceOptions
} from '../services/api';
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
    const [isLoading, setIsLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [deviceModels, setDeviceModels] = useState({});
    const [validationError, setValidationError] = useState('');
    const [priceBreakdown, setPriceBreakdown] = useState([]);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Dynamic service data state variables
    const [repairTypes, setRepairTypes] = useState([]);
    const [serviceTypesByDevice, setServiceTypesByDevice] = useState({});
    const [serviceOptions, setServiceOptions] = useState({});
    const [otherIssueBasePrice, setOtherIssueBasePrice] = useState(45); // A configurable default

    useEffect(() => {
        setIsVisible(true);
        window.scrollTo(0, 0);
    }, []);

    // Fetch repair service types and options
    useEffect(() => {
        const fetchRepairTypes = async () => {
            try {
                setIsLoading(true);
                // Fetch active service types
                const serviceTypesData = await getServiceTypes(null, true);

                if (serviceTypesData && serviceTypesData.length > 0) {
                    // Process data for RepairShowcase component format
                    const processedTypes = serviceTypesData.map(serviceType => {
                        // Use provided image URL or fallback to repairImage based on device type
                        let imageSource;

                        switch(serviceType.deviceType.toLowerCase()) {
                            case 'macbook':
                                imageSource = repairImage1;
                                break;
                            case 'applewatch':
                                imageSource = repairImage2;
                                break;
                            case 'ipad':
                                imageSource = repairImage3;
                                break;
                            case 'iphone':
                                imageSource = repairImage4;
                                break;
                            case 'airpods':
                                imageSource = repairImage5;
                                break;
                            default:
                                imageSource = repairImage1;
                        }

                        return {
                            title: serviceType.title,
                            image: serviceType.imageUrl || imageSource,
                            description: serviceType.description || `Professional ${serviceType.title} with genuine Apple parts and expert technicians.`,
                            services: [], // Will be populated from service options
                            id: serviceType.id // Keep track of the ID for fetching options
                        };
                    });

                    setRepairTypes(processedTypes);

                    // Organize service types by device for the repair form
                    const typesByDevice = {};
                    serviceTypesData.forEach(serviceType => {
                        if (!typesByDevice[serviceType.deviceType]) {
                            typesByDevice[serviceType.deviceType] = [];
                        }
                        typesByDevice[serviceType.deviceType].push(serviceType);
                    });

                    setServiceTypesByDevice(typesByDevice);

                    // Fetch service options for each service type
                    const optionsPromises = serviceTypesData.map(serviceType =>
                        getServiceOptions(serviceType.id, true)
                    );

                    const optionsResults = await Promise.all(optionsPromises);

                    // Organize options by service type ID
                    const optionsByType = {};
                    serviceTypesData.forEach((serviceType, index) => {
                        optionsByType[serviceType.id] = optionsResults[index] || [];
                    });

                    setServiceOptions(optionsByType);

                    // Update repair types with their services
                    const updatedTypes = processedTypes.map(type => {
                        const typeOptions = optionsByType[type.id] || [];
                        return {
                            ...type,
                            services: typeOptions.map(option => option.name).slice(0, 5) // Get up to 5 services
                        };
                    });

                    setRepairTypes(updatedTypes);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching repair types:', error);
                setIsLoading(false);
                // Fallback to empty arrays instead of hardcoded data
                setRepairTypes([]);
                setServiceTypesByDevice({});
                setServiceOptions({});
            }
        };

        fetchRepairTypes();
    }, []);

    // Fetch devices and models from backend
    useEffect(() => {
        const fetchDevicesAndModels = async () => {
            try {
                setIsLoading(true);
                const response = await getDevicesAndModels();

                console.log('Fetched devices and models:', response);

                // Map the devices with icons
                const deviceIconMapping = {
                    'iPhone': faMobileAlt,
                    'iPad': faTabletScreenButton,
                    'MacBook': faLaptop,
                    'AirPods': faHeadphones,
                    'Apple Watch': faClock
                };

                // Format the devices for the UI
                const formattedDevices = response.devices.map(device => {
                    return {
                        id: device.id,
                        name: device.name,
                        icon: deviceIconMapping[device.name] || device.icon || faMobileAlt,
                        style: device.name === 'MacBook' ? 'horizontal-device' : 'square-device',
                        displayName: device.name,
                        faIcon: deviceIconMapping[device.name] || faMobileAlt
                    };
                });

                setDevices(formattedDevices);
                setDeviceModels(response.deviceModels);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching devices and models:', error);
                setIsLoading(false);

                // Fallback to static data if API fails
                const fallbackDevices = [
                    {
                        id: 'macbook',
                        name: 'MacBook',
                        icon: null,
                        style: "horizontal-device",
                        displayName: "MacBook",
                        faIcon: faLaptop
                    },
                    {
                        id: 'iphone',
                        name: 'iPhone',
                        icon: null,
                        style: "square-device",
                        displayName: "iPhone",
                        faIcon: faMobileAlt
                    },
                    {
                        id: 'airpods',
                        name: 'AirPods',
                        icon: null,
                        style: "square-device",
                        displayName: "AirPods",
                        faIcon: faHeadphones
                    },
                    {
                        id: 'applewatch',
                        name: 'Apple Watch',
                        icon: null,
                        style: "square-device",
                        displayName: "Apple Watch",
                        faIcon: faClock
                    },
                    {
                        id: 'ipad',
                        name: 'iPad',
                        icon: null,
                        style: "square-device",
                        displayName: "iPad",
                        faIcon: faTabletScreenButton
                    }
                ];

                setDevices(fallbackDevices);

                const fallbackModels = {
                    'macbook': [
                        { value: "MacBook Pro 14\" (2023)", label: "MacBook Pro 14\" (2023)" },
                        { value: "MacBook Pro 16\" (2023)", label: "MacBook Pro 16\" (2023)" },
                        { value: "MacBook Air M2 (2022)", label: "MacBook Air M2 (2022)" },
                        { value: "MacBook Air M1 (2020)", label: "MacBook Air M1 (2020)" },
                        { value: "MacBook Pro 13\" (2020)", label: "MacBook Pro 13\" (2020)" },
                        { value: "iMac 24\" (2021)", label: "iMac 24\" (2021)" },
                        { value: "Mac Mini (2023)", label: "Mac Mini (2023)" },
                        { value: "Other Mac", label: "Other Mac" }
                    ],
                    'iphone': [
                        { value: "iPhone 15 Pro Max", label: "iPhone 15 Pro Max" },
                        { value: "iPhone 15 Pro", label: "iPhone 15 Pro" },
                        { value: "iPhone 15 Plus", label: "iPhone 15 Plus" },
                        { value: "iPhone 15", label: "iPhone 15" },
                        { value: "iPhone 14 Pro Max", label: "iPhone 14 Pro Max" },
                        { value: "iPhone 14 Pro", label: "iPhone 14 Pro" },
                        { value: "iPhone 14 Plus", label: "iPhone 14 Plus" },
                        { value: "iPhone 14", label: "iPhone 14" },
                        { value: "iPhone 13", label: "iPhone 13" },
                        { value: "iPhone 12", label: "iPhone 12" },
                        { value: "iPhone 11", label: "iPhone 11" },
                        { value: "iPhone XR", label: "iPhone XR" },
                        { value: "iPhone SE", label: "iPhone SE" },
                        { value: "Other iPhone", label: "Other iPhone" }
                    ],
                    'ipad': [
                        { value: "iPad Pro 12.9\" (2022)", label: "iPad Pro 12.9\" (2022)" },
                        { value: "iPad Pro 11\" (2022)", label: "iPad Pro 11\" (2022)" },
                        { value: "iPad Air (2022)", label: "iPad Air (2022)" },
                        { value: "iPad 10th gen", label: "iPad 10th gen" },
                        { value: "iPad Mini 6th gen", label: "iPad Mini 6th gen" },
                        { value: "iPad 9th gen", label: "iPad 9th gen" },
                        { value: "Other iPad", label: "Other iPad" }
                    ],
                    'applewatch': [
                        { value: "Apple Watch Ultra 2", label: "Apple Watch Ultra 2" },
                        { value: "Apple Watch Series 9", label: "Apple Watch Series 9" },
                        { value: "Apple Watch Series 8", label: "Apple Watch Series 8" },
                        { value: "Apple Watch SE (2nd gen)", label: "Apple Watch SE (2nd gen)" },
                        { value: "Apple Watch Series 7", label: "Apple Watch Series 7" },
                        { value: "Apple Watch Series 6", label: "Apple Watch Series 6" },
                        { value: "Apple Watch SE (1st gen)", label: "Apple Watch SE (1st gen)" },
                        { value: "Other Apple Watch", label: "Other Apple Watch" }
                    ],
                    'airpods': [
                        { value: "AirPods Pro (2nd gen)", label: "AirPods Pro (2nd gen)" },
                        { value: "AirPods Pro (1st gen)", label: "AirPods Pro (1st gen)" },
                        { value: "AirPods (3rd gen)", label: "AirPods (3rd gen)" },
                        { value: "AirPods (2nd gen)", label: "AirPods (2nd gen)" },
                        { value: "AirPods Max", label: "AirPods Max" },
                        { value: "Other AirPods", label: "Other AirPods" }
                    ]
                };

                setDeviceModels(fallbackModels);
            }
        };

        fetchDevicesAndModels();
    }, []);

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
            alert("Please select at least one problem before proceeding with repair.");
            return;
        }
        if (!hasCalculatedPrice || numericPrice === 0) {
            alert("Please get a price estimate before proceeding.");
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
        alert(`Added ${selectedDevice} ${selectedModel} repair to cart!`);
    };

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

    // Render dynamic problem selection based on service types in the database
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

    // Render dynamic sub-problems based on service options in the database
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
                    <RepairShowcase repairTypes={repairTypes} />
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