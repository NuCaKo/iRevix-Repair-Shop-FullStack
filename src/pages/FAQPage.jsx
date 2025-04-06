import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronUp,
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
    faTools,
    faMobileAlt,
    faLaptop,
    faCreditCard,
    faShippingFast,
    faExchangeAlt,
    faUserShield,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import '../css/FAQPage.css';

const FAQPage = () => {
    // Sayfa yüklendiğinde en üste kaydırma işlemi
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Active category state
    const [activeCategory, setActiveCategory] = useState('general');

    // FAQ data organized by categories
    const faqData = {
        general: [
            {
                question: "What services does iRevix offer?",
                answer: "iRevix provides a comprehensive range of repair services for smartphones, tablets, laptops, and other electronic devices. Our services include screen replacements, battery replacements, water damage repair, motherboard repairs, software issues, and more. We also sell high-quality replacement parts and accessories for various devices."
            },
            {
                question: "How long does a typical repair take?",
                answer: "Most common repairs such as screen replacements and battery replacements can be completed within 1-2 hours. More complex repairs like motherboard issues may take 1-3 business days. We'll provide you with an estimated completion time when you drop off your device or schedule a repair."
            },
            {
                question: "Do you offer any warranty on repairs?",
                answer: "Yes, all our repairs come with a 90-day warranty covering both parts and labor. If the same issue recurs within the warranty period, we'll fix it at no additional cost. This warranty does not cover new damage, water damage, or physical damage that occurs after the repair."
            },
            {
                question: "Can I schedule a repair appointment in advance?",
                answer: "Yes, you can schedule an appointment through our website, by phone, or via email. While we do accept walk-ins, scheduling an appointment ensures that we'll have the necessary parts in stock and a technician available to assist you promptly."
            }
        ],
        devices: [
            {
                question: "Which device brands do you repair?",
                answer: "We repair a wide range of brands including Apple, Samsung, Huawei, Xiaomi, Google, OnePlus, LG, Sony, and many others. If you don't see your brand listed, please contact us to check if we can service your device."
            },
            {
                question: "Can you repair older model phones and devices?",
                answer: "Yes, we repair both current and older model devices. While parts availability might be limited for very old models, we have access to an extensive inventory of components and can often source parts for older devices. Contact us with your specific model for confirmation."
            },
            {
                question: "Do I need to back up my data before bringing in my device?",
                answer: "Yes, we strongly recommend backing up your data before any repair. While we take utmost care with your device, some repairs require resetting the device or may risk data loss. We are not responsible for data loss during the repair process. If you need assistance with backing up your data, we can provide this service for an additional fee."
            },
            {
                question: "Can you recover data from a damaged phone?",
                answer: "In many cases, we can recover data from damaged phones, depending on the type and extent of the damage. Data recovery from water-damaged or severely damaged devices is more challenging but often possible. Please note that data recovery services are charged separately from repair services."
            }
        ],
        payment: [
            {
                question: "What payment methods do you accept?",
                answer: "We accept credit/debit cards, cash, bank transfers, and major mobile payment platforms. For online orders, we support all major credit cards and secure payment gateways. Corporate customers may also apply for credit terms."
            },
            {
                question: "Do you offer repair financing options?",
                answer: "Yes, for repairs over 1,000 TL, we offer financing options through our partner financial institutions. These options include interest-free installments for up to 6 months with qualifying credit cards and consumer loans for larger repair costs."
            },
            {
                question: "How much does a typical repair cost?",
                answer: "Repair costs vary widely depending on the device, the specific issue, and whether genuine or aftermarket parts are used. We provide free diagnostics and will always provide a clear, upfront quote before proceeding with any repair. Common repairs range from 200-1,500 TL."
            },
            {
                question: "Is there a diagnostic fee?",
                answer: "We offer free diagnostics for most common issues. For complex problems requiring extensive testing or for devices with multiple issues, a diagnostic fee may apply, but this fee is typically credited toward the repair cost if you proceed with our service."
            }
        ],
        shipping: [
            {
                question: "Can I mail in my device for repair?",
                answer: "Yes, we offer a mail-in repair service. You can request a free shipping label through our website, securely package your device, and send it to our repair center. Once repaired, we'll ship it back to you. Typically, the entire process takes 3-5 business days depending on your location."
            },
            {
                question: "How do you ship repaired devices?",
                answer: "We ship repaired devices using insured courier services. All devices are carefully packaged to prevent damage during transit. For domestic shipments, we offer standard shipping (2-3 business days) and express shipping (1 business day) options."
            },
            {
                question: "Do you ship replacement parts internationally?",
                answer: "Yes, we ship replacement parts to most countries worldwide. International shipping times vary between 7-21 business days depending on the destination and customs processing. Please note that international customers are responsible for any customs duties or taxes."
            },
            {
                question: "Is shipping insured?",
                answer: "Yes, all shipments are insured for the full value of the device or parts being shipped. In the rare event that a device is damaged during shipping, we'll either repair the device at no cost or provide a replacement of equal value."
            }
        ],
        returns: [
            {
                question: "What is your return policy for parts and accessories?",
                answer: "We offer a 30-day return policy for unopened parts and accessories in original packaging. Used or installed parts cannot be returned unless they are defective. Defective parts can be returned within 90 days for replacement or refund."
            },
            {
                question: "How do I return an item?",
                answer: "To initiate a return, contact our customer service team through email, phone, or our website. We'll provide you with a Return Authorization Number and specific instructions. Please do not send items back without first obtaining a Return Authorization Number."
            },
            {
                question: "How long do refunds take to process?",
                answer: "Once we receive and inspect your return, refunds are typically processed within 3-5 business days. The time it takes for the refund to appear in your account depends on your payment method and financial institution, but usually takes an additional 2-10 business days."
            },
            {
                question: "Can I exchange a part for a different model?",
                answer: "Yes, we allow exchanges for different models or items of equivalent value within 30 days of purchase, provided the original item is unopened and in its original packaging. If the new item has a different price, the difference will either be charged or refunded accordingly."
            }
        ],
        business: [
            {
                question: "Do you offer business or corporate repair services?",
                answer: "Yes, we provide specialized repair services for businesses and corporate clients. This includes volume discounts, priority service, on-site repair options for larger organizations, and dedicated account management. Contact our business services department for more information."
            },
            {
                question: "Can you repair multiple devices for our company?",
                answer: "Absolutely. We have extensive experience handling bulk repairs for businesses. We can create a customized repair program for your company that minimizes downtime and provides consistent, quality service across all your devices."
            },
            {
                question: "Do you offer preventative maintenance services?",
                answer: "Yes, we offer preventative maintenance programs for businesses to keep your devices in optimal condition and prevent costly downtime. These programs can include regular check-ups, battery replacements, system optimization, and hardware upgrades."
            },
            {
                question: "Can we set up a corporate account?",
                answer: "Yes, we offer corporate accounts with benefits such as priority service, monthly billing, customized reporting, volume discounts, and a dedicated account manager. To set up a corporate account, please contact our business services team."
            }
        ],
        privacy: [
            {
                question: "How do you protect my personal data?",
                answer: "We take data privacy extremely seriously. We implement industry-standard security measures to protect your personal information. All customer data is stored on secure, encrypted servers. Our staff are trained in data protection procedures, and we never share your information with third parties without your consent. For complete details, please review our Privacy Policy."
            },
            {
                question: "Do you access personal data on my device during repair?",
                answer: "Our technicians access personal data only when necessary to test the device's functionality after repair. We never browse, copy, or store your personal files, photos, or messages. If you have sensitive data, we recommend backing up and erasing your device before sending it for repair, if possible."
            },
            {
                question: "What happens to my personal information after my repair is complete?",
                answer: "We retain basic customer and device information for warranty purposes and to improve our services. However, any diagnostic files or temporary access created during the repair process are permanently deleted once your repair is complete and your device is returned to you."
            },
            {
                question: "Can I request deletion of my personal information from your systems?",
                answer: "Yes, you have the right to request deletion of your personal information from our systems, subject to legal retention requirements. To initiate this process, please contact our privacy team in writing with your specific request."
            }
        ]
    };

    // State to track which questions are expanded
    const [expandedQuestions, setExpandedQuestions] = useState({});

    // Toggle question expansion
    const toggleQuestion = (category, index) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [`${category}-${index}`]: !prev[`${category}-${index}`]
        }));
    };

    return (
        <div className="faq-page-container">
            <div className="faq-header">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about our services, policies, and procedures.</p>
            </div>

            <div className="faq-content">
                <div className="faq-category-tabs">
                    <button
                        className={`category-tab ${activeCategory === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('general')}
                    >
                        <FontAwesomeIcon icon={faQuestionCircle} /> General
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'devices' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('devices')}
                    >
                        <FontAwesomeIcon icon={faLaptop} /> Devices
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('payment')}
                    >
                        <FontAwesomeIcon icon={faCreditCard} /> Payment
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'shipping' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('shipping')}
                    >
                        <FontAwesomeIcon icon={faShippingFast} /> Shipping
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'returns' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('returns')}
                    >
                        <FontAwesomeIcon icon={faExchangeAlt} /> Returns
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'business' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('business')}
                    >
                        <FontAwesomeIcon icon={faTools} /> Business
                    </button>
                    <button
                        className={`category-tab ${activeCategory === 'privacy' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('privacy')}
                    >
                        <FontAwesomeIcon icon={faUserShield} /> Privacy
                    </button>
                </div>

                <div className="faq-questions-container">
                    <h2 className="category-title">
                        <FontAwesomeIcon icon={
                            activeCategory === 'general' ? faQuestionCircle :
                                activeCategory === 'devices' ? faLaptop :
                                    activeCategory === 'payment' ? faCreditCard :
                                        activeCategory === 'shipping' ? faShippingFast :
                                            activeCategory === 'returns' ? faExchangeAlt :
                                                activeCategory === 'business' ? faTools :
                                                    faUserShield
                        } />
                        {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Questions
                    </h2>

                    <div className="faq-questions-list">
                        {faqData[activeCategory].map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-question-item ${expandedQuestions[`${activeCategory}-${index}`] ? 'expanded' : ''}`}
                            >
                                <div
                                    className="question-header"
                                    onClick={() => toggleQuestion(activeCategory, index)}
                                >
                                    <h3>{faq.question}</h3>
                                    <FontAwesomeIcon
                                        icon={expandedQuestions[`${activeCategory}-${index}`] ? faChevronUp : faChevronDown}
                                        className="toggle-icon"
                                    />
                                </div>
                                {expandedQuestions[`${activeCategory}-${index}`] && (
                                    <div className="question-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="faq-contact-section">
                <h2>Still Have Questions?</h2>
                <p>If you couldn't find the answer you're looking for, please contact us directly.</p>

                <div className="contact-methods">
                    <div className="contact-method">
                        <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                        <div className="contact-phone">
                            <h3>Call Us</h3>
                            <p className="phone-number">+90 00000000</p>
                            <p className="hours">Monday-Friday: 9am-6pm</p>
                            <p className="hours">Saturday: 10am-4pm</p>
                        </div>
                    </div>

                    <div className="contact-method">
                        <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                        <div className="contact-email">
                            <h3>Email Us</h3>
                            <p><a href="mailto:support@irevix.com">support@irevix.com</a></p>
                            <p className="response-time">We typically respond within 24 hours</p>
                        </div>
                    </div>

                    <div className="contact-method">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                        <div className="contact-address">
                            <h3>Visit Us</h3>
                            <p className="address">Fatih, Istanbul</p>
                            <p className="hours">Monday-Friday: 9am-6pm</p>
                            <p className="hours">Saturday: 10am-4pm</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;