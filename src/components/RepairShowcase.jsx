
import React from 'react';
import '../css/repairShowcase.css';
import { motion } from 'framer-motion';

const RepairShowcase = ({ repairTypes }) => {
    return (
        <div className="repair-showcase">
            {repairTypes.map((repair, index) => (
                <motion.div
                    key={index}
                    className="repair-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="repair-image-container">
                        <img
                            src={repair.image}
                            alt={repair.title}
                            className="repair-image"
                        />
                    </div>
                    <div className="repair-details">
                        <h3>{repair.title}</h3>
                        <p>{repair.description}</p>
                        <ul className="repair-services">
                            {repair.services.map((service, idx) => (
                                <li key={idx}>{service}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default RepairShowcase;