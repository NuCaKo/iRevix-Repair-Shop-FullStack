import React from 'react';
import { motion } from 'framer-motion';
import '../css/mainPage.css';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ContactSection = () => {
    return (
        <motion.div
            className="contact-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
        >
            <h2>Contact Us</h2>
            <p>Email: contact@irevix.com</p>
            <p>Phone: +00000000</p>
        </motion.div>
    );
};

export default ContactSection;