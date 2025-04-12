import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faSearch, faClock } from '@fortawesome/free-solid-svg-icons';
import '../css/ContactPage.css';

function ContactPage() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [formStatus, setFormStatus] = useState({ message: '', isError: false });


    const faqContent = [
        { title: "Repair Times", content: "Most repairs are completed within 24-48 hours." },
        { title: "Warranty", content: "All repairs come with a 90-day warranty." },
        { title: "Payment Methods", content: "We accept cash, credit cards, and bank transfers." },
        { title: "Appointments", content: "Walk-ins are welcome, but appointments are recommended." },
        { title: "Data Protection", content: "We recommend backing up your device before repair." }
    ];



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            const results = faqContent.filter(item =>
                item.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
                item.content.toLowerCase().includes(e.target.value.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();


        if (!formData.name || !formData.email || !formData.message) {
            setFormStatus({ message: 'Please fill all required fields.', isError: true });
            return;
        }

        console.log('Form submitted:', formData);


        setFormStatus({ message: 'Message sent successfully! We will contact you soon.', isError: false });
        setFormData({ name: '', email: '', subject: '', message: '' });


        setTimeout(() => {
            setFormStatus({ message: '', isError: false });
        }, 5000);
    };


    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const pageTransition = {
        type: "tween",
        ease: "easeInOut",
        duration: 0.6
    };

    return (
        <div className="contact-page">
            <Navbar />

            <motion.div
                className="contact-content"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                <div className="contact-hero">
                    <h1>Contact Us</h1>
                    <p>Have questions or need assistance? We're here to help!</p>
                </div>

                <div className="contact-search-section">
                    <div className="search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h3>Quick Answers</h3>
                            {searchResults.map((result, index) => (
                                <div className="search-result-item" key={index}>
                                    <h4>{result.title}</h4>
                                    <p>{result.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="contact-main">
                    <div className="contact-info">
                        <h2>Get In Touch</h2>
                        <p>Feel free to get in touch with us through any of these channels.</p>

                        <div className="contact-methods">
                            <div className="contact-card">
                                <div className="contact-card-icon">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </div>
                                <h3>Email Us</h3>
                                <p>We'll respond within 24 hours</p>
                                <a href="mailto:support@irevix.com" className="contact-card-value">
                                    support@irevix.com
                                </a>
                            </div>

                            <div className="contact-card">
                                <div className="contact-card-icon">
                                    <FontAwesomeIcon icon={faPhone} />
                                </div>
                                <h3>Call Us</h3>
                                <p>Mon-Fri 9AM-6PM</p>
                                <a href="tel:+900000" className="contact-card-value">
                                    +90 0000
                                </a>
                            </div>

                            <div className="contact-card">
                                <div className="contact-card-icon">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                </div>
                                <h3>Visit Us</h3>
                                <p>Our service center location</p>
                                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="contact-card-value">
                                    İstanbul, Türkiye
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container">
                        <h2>Send Us A Message</h2>

                        {formStatus.message && (
                            <div className={`form-status ${formStatus.isError ? 'error' : 'success'}`}>
                                {formStatus.message}
                            </div>
                        )}

                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message *</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">Send Message</button>
                        </form>

                        {/* Business Hours - Yeni konumda */}
                        <div className="business-hours-form-footer">
                            <div className="hours-icon">
                                <FontAwesomeIcon icon={faClock} />
                            </div>
                            <div className="hours-content">
                                <h3>Business Hours</h3>
                                <div className="hours-grid">
                                    <div className="hours-day">Monday - Friday:</div>
                                    <div className="hours-time">9:00 AM - 6:00 PM</div>
                                    <div className="hours-day">Saturday:</div>
                                    <div className="hours-time">12:00 PM - 4:00 PM</div>
                                    <div className="hours-day">Sunday:</div>
                                    <div className="hours-time">Closed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="map-container">
                    <h2>Find Us</h2>
                    <div className="map-wrapper">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d192698.6596225687!2d28.872096970855338!3d41.00521533454886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1709922516329!5m2!1str!2str"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '8px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="iRevix Location Map"
                            className="google-map"
                        ></iframe>
                    </div>
                </div>
            </motion.div>


            <Footer />
        </div>
    );
}

export default ContactPage;