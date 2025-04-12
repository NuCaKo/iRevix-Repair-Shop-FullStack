import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/mainPage.css';
import vd1 from '../videos/welcome_video.mp4';
import Footer from '../components/footer';
import Testimonials from '../components/Testimonials';
import macIcon from '../images/devices/mac-icon.svg';
import RepairShowcase from '../components/RepairShowcase';
import airpodsIcon from '../images/devices/airpods-icon.png';
import ScrollToTop from '../components/ScrollToTop';
import repairImage1 from '../images/repair1.png'; // MacBook repair
import repairImage2 from '../images/repair2.jpeg'; // Apple Watch repair
import repairImage3 from '../images/repair3.png'; // iPad repair (corrected)
import repairImage4 from '../images/repair4.png'; // iPhone repair
import repairImage5 from '../images/repair5.png'; // AirPods repair

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faWrench,
    faMobileAlt,
    faLaptop,
    faBatteryFull,
    faHeadphones,
    faTabletScreenButton,
    faHeart,
    faClipboardList,
    faTools,
    faCheckCircle,
    faShippingFast
} from '@fortawesome/free-solid-svg-icons';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

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

function MainPage() {
    const [selectedDevice, setSelectedDevice] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [subProblems, setSubProblems] = useState({});
    const [issueDescription, setIssueDescription] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        setIsVisible(true);
        if (location.state && location.state.scrollTo) {
            const section = document.getElementById(location.state.scrollTo);
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth' });
                }, 500); // Small delay to ensure the page is loaded
            }
            window.history.replaceState({}, document.title);
        }
    }, [location]);
    useEffect(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
        if (isMobile) {
            const cpuCores = navigator.hardwareConcurrency || 4;
            if (cpuCores <= 4 || /iPhone|iPad|iPod/.test(navigator.userAgent)) {
                document.body.classList.add('low-performance');
            }
            const videoElement = document.querySelector('.fullscreen-video');
            if (videoElement) {
                videoElement.setAttribute('playsinline', '');
                videoElement.addEventListener('error', () => {
                    document.body.classList.add('low-performance');
                });
                const observerOptions = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1
                };

                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            videoElement.play().catch(err => {
                                document.body.classList.add('low-performance');
                            });
                        } else {
                            videoElement.pause();
                        }
                    });
                }, observerOptions);

                videoObserver.observe(videoElement);
                return () => {
                    if (videoElement) {
                        videoObserver.unobserve(videoElement);
                    }
                };
            }
        }
    }, []);
    useEffect(() => {
        const lazyElements = document.querySelectorAll('.how-it-works-image-container, .about-commitment, .values-grid');
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    lazyObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '100px' });
        lazyElements.forEach(element => {
            element.classList.add('lazy-loaded');
            lazyObserver.observe(element);
        });
        return () => {
            lazyElements.forEach(element => {
                lazyObserver.unobserve(element);
            });
        };
    }, []);
    const navigateToRepairServices = () => {
        navigate('/repair-services');
    };
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
    const deviceIcons = {
        Mac: {
            icon: macIcon,
            style: "horizontal-device",
            displayName: "MacBook"
        },
        iPhone: {
            icon: null,
            style: "square-device",
            displayName: "iPhone"
        },
        AirPods: {
            icon: airpodsIcon,
            style: "square-device",
            displayName: "AirPods"
        },
        "Apple Watch": {
            icon: null,
            style: "square-device",
            displayName: "Apple Watch"
        },
        iPad: {
            icon: null,
            style: "square-device",
            displayName: "iPad"
        }
    };

    const handleDeviceSelection = (device) => {
        setSelectedDevice(device);
        setSelectedModel('');
        setSelectedProblems([]);
        setSubProblems({});
        setIssueDescription('');
        setEstimatedPrice(null);
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
            basePrice += 45; // Diger sorunlar için temel fiyat
        }

        if (basePrice === 0) {
            basePrice = 50;
        }

        setEstimatedPrice(`$${basePrice} - $${basePrice + 50}`);
    };
    const getIconColor = (device) => {
        return selectedDevice === device ? "#28a745" : "currentColor"; // Seçilirse yešil
    };

    return (
        <div className="main-page">
            <Navbar />

            {/* Fullscreen Hero Section */}
            <motion.div
                className="fullscreen-hero"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeInUp}
            >
                {/* Video background with overlay */}
                <video
                    src={vd1}
                    className="fullscreen-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                />

                {/* Darkening overlay for entire video */}
                <div className="video-overlay"></div>

                {/* Centered content container */}
                <motion.div
                    className="hero-centered-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <h1 className="hero-title">Welcome iRevix</h1>
                    <p className="hero-subtitle">Your device repair specialists</p>

                    {/* Decorative divider */}
                    <div className="hero-divider">
                        <span className="divider-line"></span>
                        <span className="divider-circle"></span>
                        <span className="divider-line"></span>
                    </div>

                    <div className="hero-sections">
                        <div>
                            <h2 className="hero-section-title">Who We Are</h2>
                            <p className="hero-section-text">Professional repair service dedicated to bringing your devices back to life quickly and reliably.</p>
                        </div>

                        <div>
                            <h2 className="hero-section-title">Our Story</h2>
                            <p className="hero-section-text">Founded with a passion for technology and service, iRevix has been helping customers since 2018.</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* How It Works Section */}
            <motion.div
                className="how-it-works-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                <h2>How It Works</h2>
                <p className="section-subtitle">Fixing your Apple devices has never been easier</p>

                <div className="steps-container">
                    <motion.div
                        className="step-card"
                        variants={fadeInUp}
                        custom={1}
                        onClick={navigateToRepairServices}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="step-number">1</div>
                        <div className="step-icon">
                            <FontAwesomeIcon icon={faMobileAlt} />
                        </div>
                        <h3>Select Your Device</h3>
                        <p>Choose your device type and model from our extensive selection of Apple products</p>
                    </motion.div>

                    <motion.div
                        className="step-card"
                        variants={fadeInUp}
                        custom={2}
                        onClick={navigateToRepairServices}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="step-number">2</div>
                        <div className="step-icon">
                            <FontAwesomeIcon icon={faWrench} />
                        </div>
                        <h3>Identify the Problem</h3>
                        <p>Let us know what's wrong with your device through our simple diagnostic tool</p>
                    </motion.div>

                    <motion.div
                        className="step-card"
                        variants={fadeInUp}
                        custom={3}
                        onClick={navigateToRepairServices}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="step-number">3</div>
                        <div className="step-icon">
                            <FontAwesomeIcon icon={faClipboardList} />
                        </div>
                        <h3>Get a Quote</h3>
                        <p>Receive an instant price estimate for your repair needs with no obligations</p>
                    </motion.div>

                    <motion.div
                        className="step-card"
                        variants={fadeInUp}
                        custom={4}
                        onClick={navigateToRepairServices}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="step-number">4</div>
                        <div className="step-icon">
                            <FontAwesomeIcon icon={faTools} />
                        </div>
                        <h3>Professional Repair</h3>
                        <p>Our certified technicians will fix your device with quality parts and expert care</p>
                    </motion.div>
                </div>

                <div
                    className="how-it-works-image-container"
                    onClick={navigateToRepairServices}
                    style={{ cursor: 'pointer' }}
                >
                    <svg
                        className="how-it-works-image"
                        viewBox="0 0 1200 600"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0062E6" />
                                <stop offset="100%" stopColor="#33A7FF" />
                            </linearGradient>
                            <linearGradient id="tableGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#4B5563" />
                                <stop offset="100%" stopColor="#1F2937" />
                            </linearGradient>
                        </defs>

                        {/* Background */}
                        <rect width="100%" height="100%" fill="url(#bgGradient)" />

                        {/* Repair Shop Interior */}
                        <rect x="100" y="150" width="1000" height="400" rx="10" fill="#ffffff" opacity="0.9" />

                        {/* Repair Table */}
                        <rect x="150" y="200" width="450" height="300" rx="5" fill="url(#tableGradient)" />

                        {/* Devices on Table */}
                        <rect x="200" y="250" width="120" height="80" rx="5" fill="#111827" stroke="#4B5563" strokeWidth="2" /> {/* iPhone */}
                        <rect x="360" y="240" width="180" height="120" rx="5" fill="#111827" stroke="#4B5563" strokeWidth="2" /> {/* MacBook */}
                        <circle cx="480" cy="300" r="30" fill="#111827" stroke="#4B5563" strokeWidth="2" /> {/* Apple Watch */}

                        {/* Tools */}
                        <rect x="200" y="380" width="350" height="40" rx="5" fill="#374151" /> {/* Tools Organizer */}
                        <circle cx="230" cy="400" r="10" fill="#FCD34D" /> {/* Tool 1 */}
                        <circle cx="270" cy="400" r="10" fill="#FBBF24" /> {/* Tool 2 */}
                        <circle cx="310" cy="400" r="10" fill="#F59E0B" /> {/* Tool 3 */}
                        <circle cx="350" cy="400" r="10" fill="#D97706" /> {/* Tool 4 */}
                        <circle cx="390" cy="400" r="10" fill="#B45309" /> {/* Tool 5 */}

                        {/* Technician */}
                        <circle cx="700" cy="320" r="70" fill="#6B7280" /> {/* Head */}
                        <rect x="670" y="390" width="60" height="110" fill="#1E40AF" /> {/* Body */}
                        <rect x="630" y="390" width="40" height="80" fill="#1E40AF" rx="10" /> {/* Left Arm */}
                        <rect x="730" y="390" width="40" height="100" fill="#1E40AF" rx="10" /> {/* Right Arm */}

                        {/* Magnifying Glass */}
                        <circle cx="770" cy="490" r="25" fill="none" stroke="#CBD5E1" strokeWidth="3" />
                        <line x1="785" y1="505" x2="810" y2="530" stroke="#CBD5E1" strokeWidth="5" />

                        {/* Customer */}
                        <circle cx="950" cy="320" r="60" fill="#9CA3AF" /> {/* Head */}
                        <rect x="925" y="380" width="50" height="120" fill="#3B82F6" /> {/* Body */}

                        {/* Device in customer's hand */}
                        <rect x="880" y="420" width="45" height="70" rx="5" fill="#E5E7EB" />

                        {/* Counter/Desk */}
                        <rect x="650" y="500" width="400" height="50" rx="5" fill="#1F2937" />

                        {/* Text labels - hidden in image but useful for identification */}
                        <text x="600" y="580" fill="#ffffff" fontSize="24" opacity="0" fontFamily="Arial">iRevix Repair Shop</text>
                    </svg>
                    <div className="image-overlay">
                        <h3>Expert Repairs for All Apple Devices</h3>
                        <p>Our technicians have years of experience fixing iPhones, MacBooks, iPads, Apple Watches, and more</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                id="about-section"
                className="about-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
            >
                

                <div className="about-values">
                    <h3>Our Values</h3>
                    <div className="values-grid">
                        <div className="value-item">
                            <div className="value-icon">
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <h4>Quality</h4>
                            <p>We use only premium-grade parts and components that match or exceed Apple's specifications, ensuring your device performs like new after repair.</p>
                        </div>

                        <div className="value-item">
                            <div className="value-icon">
                                <FontAwesomeIcon icon={faShippingFast} />
                            </div>
                            <h4>Speed</h4>
                            <p>We understand how important your devices are to your daily life. Most repairs are completed within 24-48 hours, with many same-day services available.</p>
                        </div>

                        <div className="value-item">
                            <div className="value-icon">
                                <FontAwesomeIcon icon={faTools} />
                            </div>
                            <h4>Expertise</h4>
                            <p>Our technicians undergo rigorous training and certification processes. With years of combined experience, we've seen and fixed virtually every Apple device issue.</p>
                        </div>

                        <div className="value-item">
                            <div className="value-icon">
                                <FontAwesomeIcon icon={faHeart} />
                            </div>
                            <h4>Care</h4>
                            <p>We treat every device as if it were our own, handling each repair with meticulous attention to detail and genuine care for the outcome.</p>
                        </div>
                    </div>
                </div>

                <div className="about-commitment">
                    <div className="commitment-icon">
                        <FontAwesomeIcon icon={faLeaf} />
                    </div>
                    <div className="commitment-content">
                        <h3>Our Commitment to Sustainability</h3>
                        <p>At iRevix, we're committed to reducing electronic waste. By repairing devices rather than replacing them, we help extend the lifecycle of technology products and reduce their environmental impact. We also responsibly recycle all electronic components and packaging materials.</p>
                    </div>
                </div>

                {/* Repair Showcase component remains here */}
                <h2>Our Repair Services</h2>
                <RepairShowcase repairTypes={repairTypes} />
            </motion.div>
            <Testimonials />
            <Footer />
            <ScrollToTop />
        </div>
    );
}

export default MainPage;