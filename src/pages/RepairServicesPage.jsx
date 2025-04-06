import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import ScrollToTop from '../components/ScrollToTop';
import RepairShowcase from '../components/RepairShowcase';
import '../css/mainPage.css';
import '../css/repairServices.css';
import { useCart } from '../CartContext'; // Import useCart hook

// All icons will use FontAwesome icons

// Import images for repair showcase
import repairImage1 from '../images/repair1.jpg'; // MacBook repair
import repairImage2 from '../images/repair2.jpg'; // Apple Watch repair
import repairImage3 from '../images/repair3.jpg'; // iPad repair
import repairImage4 from '../images/repair4.jpg'; // iPhone repair
import repairImage5 from '../images/repair5.jpg'; // AirPods repair

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
    faThumbsUp
} from '@fortawesome/free-solid-svg-icons';

import { motion, AnimatePresence } from 'framer-motion';

const repairTypes = [
    {
        title: "MacBook Repair",
        image: repairImage1,
        description: "Professional MacBook repair with genuine Apple parts and expert technicians.",
        services: [
            "Logic board repair",
            "Screen replacement",
            "Battery replacement",
            "Water damage recovery",
            "SSD/RAM upgrades"
        ]
    },
    {
        title: "Apple Watch Repair",
        image: repairImage2,
        description: "Specialized Apple Watch repair for all generations by certified technicians.",
        services: [
            "Screen replacement",
            "Battery service",
            "Button repair",
            "Water damage repair",
            "Sensor calibration"
        ]
    },
    {
        title: "iPad Repair",
        image: repairImage3,
        description: "Expert iPad repair services for all models with same-day service available.",
        services: [
            "Screen replacement",
            "Battery replacement",
            "Charging port repair",
            "Camera module repair",
            "Home button repair"
        ]
    },
    {
        title: "iPhone Repair",
        image: repairImage4,
        description: "Fast and reliable iPhone repair for all models with warranty on parts and labor.",
        services: [
            "Screen replacement",
            "Battery replacement",
            "Camera repair",
            "Charging port repair",
            "Motherboard repair"
        ]
    },
    {
        title: "AirPods Repair",
        image: repairImage5,
        description: "Specialized AirPods and AirPods Pro repair services for all issues.",
        services: [
            "Charging case repair",
            "Battery replacement",
            "Sound quality issues",
            "Connectivity problems",
            "Physical damage repair"
        ]
    }
];

function RepairServicesPage() {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [subProblems, setSubProblems] = useState({});
    const [issueDescription, setIssueDescription] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [numericPrice, setNumericPrice] = useState(0); // Store numeric price for adding to cart
    const { addToCart } = useCart(); // Get addToCart from context
    const navigate = useNavigate(); // Add useNavigate hook

    // Page load animation
    useEffect(() => {
        setIsVisible(true);
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    // Animation variants
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

    // Slide in from right animation
    const slideInRight = {
        hidden: { x: 100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    // Device information with icons - all using FontAwesome icons
    const deviceIcons = {
        Mac: {
            icon: null,
            style: "horizontal-device",
            displayName: "MacBook",
            faIcon: faLaptop
        },
        iPhone: {
            icon: null,
            style: "square-device",
            displayName: "iPhone",
            faIcon: faMobileAlt
        },
        AirPods: {
            icon: null,
            style: "square-device",
            displayName: "AirPods",
            faIcon: faHeadphones
        },
        "Apple Watch": {
            icon: null,
            style: "square-device",
            displayName: "Apple Watch",
            faIcon: faClock
        },
        iPad: {
            icon: null,
            style: "square-device",
            displayName: "iPad",
            faIcon: faTabletScreenButton
        }
    };

    const handleDeviceSelection = (device) => {
        setSelectedDevice(device);
        setSelectedModel('');
        setSelectedProblems([]);
        setSubProblems({});
        setIssueDescription('');
        setEstimatedPrice(null);
        setNumericPrice(0);
    };

    const handleModelSelection = (model) => {
        setSelectedModel(model);
    };

    const handleProblemSelection = (problem) => {
        setSelectedProblems((prevProblems) => {
            if (prevProblems.includes(problem)) {
                return prevProblems.filter((p) => p !== problem);
            } else {
                return [...prevProblems, problem];
            }
        });
    };

    const handleSubProblemSelection = (problem, subProblem) => {
        setSubProblems((prevSubProblems) => ({
            ...prevSubProblems,
            [problem]: subProblem,
        }));
    };

    const handleGetPrice = () => {
        // Simulated pricing logic
        let basePrice = 0;

        if (selectedProblems.includes('Battery') && subProblems['Battery']) {
            if (subProblems['Battery'] === 'Battery Replacement') {
                basePrice += 50;
            } else if (subProblems['Battery'] === 'Charging Port Issue') {
                basePrice += 40;
            }
        }

        if (selectedProblems.includes('Screen') && subProblems['Screen']) {
            if (subProblems['Screen'] === 'Front Screen Cracked') {
                basePrice += 100;
            } else if (subProblems['Screen'] === 'Back Glass Cracked') {
                basePrice += 80;
            }
        }

        if (selectedProblems.includes('Motherboard') && subProblems['Motherboard']) {
            if (subProblems['Motherboard'] === 'Device Not Powering On') {
                basePrice += 120;
            }
        }

        if (selectedProblems.includes('Other') && issueDescription.trim() !== '') {
            basePrice += 45; // Base price for other issues
        }

        if (basePrice === 0) {
            basePrice = 50;
        }

        // Set numeric price for cart
        setNumericPrice(basePrice);
        setEstimatedPrice(`$${basePrice} - $${basePrice + 50}`);
    };

    // Handle adding repair to cart and navigating to cart page
    const handleProceedWithRepair = () => {
        // Collect details for repair item description
        const problemDetails = selectedProblems.map(problem => {
            if (subProblems[problem]) {
                return `${problem}: ${subProblems[problem]}`;
            }
            return problem;
        }).join(', ');

        // Create repair service item
        const repairItem = {
            id: `repair-${Date.now()}`, // Unique ID using timestamp
            name: `${selectedDevice} ${selectedModel} Repair`,
            description: problemDetails + (issueDescription ? ` - ${issueDescription}` : ''),
            price: numericPrice,
            quantity: 1,
            type: 'service',
            icon: deviceIcons[selectedDevice]?.faIcon || faWrench
        };

        // Add to cart
        addToCart(repairItem);

        // Show success message
        alert(`Added ${repairItem.name} to your cart!`);

        // Navigate to cart page
        navigate('/cart');
    };

    // Icon color indicator
    const getIconColor = (device) => {
        return selectedDevice === device ? "#28a745" : "currentColor"; // Green if selected
    };

    // Get model options based on selected device
    const getModelOptions = (device) => {
        switch(device) {
            case 'Mac':
                return [
                    { value: "MacBook Pro 14\" (2023)", label: "MacBook Pro 14\" (2023)" },
                    { value: "MacBook Pro 16\" (2023)", label: "MacBook Pro 16\" (2023)" },
                    { value: "MacBook Air M2 (2022)", label: "MacBook Air M2 (2022)" },
                    { value: "MacBook Air M1 (2020)", label: "MacBook Air M1 (2020)" },
                    { value: "MacBook Pro 13\" (2020)", label: "MacBook Pro 13\" (2020)" },
                    { value: "iMac 24\" (2021)", label: "iMac 24\" (2021)" },
                    { value: "Mac Mini (2023)", label: "Mac Mini (2023)" },
                    { value: "Other Mac", label: "Other Mac" }
                ];
            case 'iPhone':
                return [
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
                ];
            case 'iPad':
                return [
                    { value: "iPad Pro 12.9\" (2022)", label: "iPad Pro 12.9\" (2022)" },
                    { value: "iPad Pro 11\" (2022)", label: "iPad Pro 11\" (2022)" },
                    { value: "iPad Air (2022)", label: "iPad Air (2022)" },
                    { value: "iPad 10th gen", label: "iPad 10th gen" },
                    { value: "iPad Mini 6th gen", label: "iPad Mini 6th gen" },
                    { value: "iPad 9th gen", label: "iPad 9th gen" },
                    { value: "Other iPad", label: "Other iPad" }
                ];
            case 'Apple Watch':
                return [
                    { value: "Apple Watch Ultra 2", label: "Apple Watch Ultra 2" },
                    { value: "Apple Watch Series 9", label: "Apple Watch Series 9" },
                    { value: "Apple Watch Series 8", label: "Apple Watch Series 8" },
                    { value: "Apple Watch SE (2nd gen)", label: "Apple Watch SE (2nd gen)" },
                    { value: "Apple Watch Series 7", label: "Apple Watch Series 7" },
                    { value: "Apple Watch Series 6", label: "Apple Watch Series 6" },
                    { value: "Apple Watch SE (1st gen)", label: "Apple Watch SE (1st gen)" },
                    { value: "Other Apple Watch", label: "Other Apple Watch" }
                ];
            case 'AirPods':
                return [
                    { value: "AirPods Pro (2nd gen)", label: "AirPods Pro (2nd gen)" },
                    { value: "AirPods Pro (1st gen)", label: "AirPods Pro (1st gen)" },
                    { value: "AirPods (3rd gen)", label: "AirPods (3rd gen)" },
                    { value: "AirPods (2nd gen)", label: "AirPods (2nd gen)" },
                    { value: "AirPods Max", label: "AirPods Max" },
                    { value: "Other AirPods", label: "Other AirPods" }
                ];
            default:
                return [];
        }
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

            {/* DEVICE SELECTION SECTION (NOW AT THE TOP) */}
            <div className="device-selection-section">
                <motion.div
                    className="device-selection-container"
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                    variants={fadeInUp}
                >
                    <h2>Get a Repair Quote</h2>
                    <p className="section-subtitle">Select your device and issue to get a quick price estimate</p>

                    <div className="device-selection-grid">
                        {/* Create device selection items dynamically */}
                        {Object.keys(deviceIcons).map((device) => (
                            <motion.div
                                key={device}
                                className={`device-item ${deviceIcons[device].style} ${selectedDevice === device ? 'selected-device' : ''}`}
                                onClick={() => handleDeviceSelection(device)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div
                                    className="device-placeholder"
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                >
                                    <FontAwesomeIcon
                                        icon={deviceIcons[device].faIcon}
                                        beat={isHovered && device === "Apple Watch"}
                                        className="placeholder-icon"
                                        color={getIconColor(device)}
                                    />
                                    <span>{deviceIcons[device].displayName}</span>
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
                                    <h3>Select Your {selectedDevice} Model</h3>
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

                <AnimatePresence>
                    {selectedModel && (
                        <motion.div
                            key={`${selectedDevice}-${selectedModel}`} // Add key to force remount
                            className="problem-selection-container"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={slideInRight}
                        >
                            <div className="problem-container">
                                <h3>What problems do you have with your {selectedDevice}?</h3>
                                <div className="problem-selection">
                                    <label className="problem-option">
                                        <input
                                            type="checkbox"
                                            value="Battery"
                                            checked={selectedProblems.includes('Battery')}
                                            onChange={() => handleProblemSelection('Battery')}
                                        />
                                        <span className="problem-text">Battery</span>
                                    </label>
                                    <label className="problem-option">
                                        <input
                                            type="checkbox"
                                            value="Screen"
                                            checked={selectedProblems.includes('Screen')}
                                            onChange={() => handleProblemSelection('Screen')}
                                        />
                                        <span className="problem-text">Screen</span>
                                    </label>
                                    <label className="problem-option">
                                        <input
                                            type="checkbox"
                                            value="Motherboard"
                                            checked={selectedProblems.includes('Motherboard')}
                                            onChange={() => handleProblemSelection('Motherboard')}
                                        />
                                        <span className="problem-text">Motherboard</span>
                                    </label>
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

                                <AnimatePresence>
                                    {selectedProblems.includes('Battery') && (
                                        <motion.div
                                            className="sub-problem-selection"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h4>Battery Issues</h4>
                                            <select
                                                value={subProblems['Battery'] || ''}
                                                onChange={(e) => handleSubProblemSelection('Battery', e.target.value)}
                                                className="issue-select"
                                            >
                                                <option value="">Select Issue</option>
                                                <option value="Battery Replacement">Battery Replacement</option>
                                                <option value="Charging Port Issue">Charging Port Issue</option>
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {selectedProblems.includes('Screen') && (
                                        <motion.div
                                            className="sub-problem-selection"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h4>Screen Issues</h4>
                                            <select
                                                value={subProblems['Screen'] || ''}
                                                onChange={(e) => handleSubProblemSelection('Screen', e.target.value)}
                                                className="issue-select"
                                            >
                                                <option value="">Select Issue</option>
                                                <option value="Front Screen Cracked">Front Screen Cracked</option>
                                                <option value="Back Glass Cracked">Back Glass Cracked</option>
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {selectedProblems.includes('Motherboard') && (
                                        <motion.div
                                            className="sub-problem-selection"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h4>Motherboard Issues</h4>
                                            <select
                                                value={subProblems['Motherboard'] || ''}
                                                onChange={(e) => handleSubProblemSelection('Motherboard', e.target.value)}
                                                className="issue-select"
                                            >
                                                <option value="">Select Issue</option>
                                                <option value="Device Not Powering On">Device Not Powering On</option>
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {selectedProblems.includes('Other') && (
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
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    className="get-price-button"
                                    onClick={handleGetPrice}
                                    whileHover={{ scale: 1.05, backgroundColor: "#0056b3" }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Price
                                </motion.button>
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
                                        <motion.button
                                            className="proceed-button"
                                            onClick={handleProceedWithRepair}
                                            whileHover={{ scale: 1.05, backgroundColor: "#28a745" }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Proceed with Repair
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* REPAIR SHOWCASE SECTION (NOW AT THE BOTTOM) */}
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

            {/* SERVICES OVERVIEW SECTION (NOW AT THE BOTTOM) */}
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