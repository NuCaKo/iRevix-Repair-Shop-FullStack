import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../css/Testimonials.css';

const Testimonials = () => {
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: "AYŞE",
            position: "iPhone User",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/women/46.jpg"
        },
        {
            id: 2,
            name: "MEHMET ",
            position: "iPhone User",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            rating: 5,
            image: "https://randomuser.me/api/portraits/men/91.jpg"
        },
        {
            id: 3,
            name: "ZEYNEP",
            position: "MacBook Customer",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            rating: 4,
            image: 'https://randomuser.me/api/portraits/women/91.jpg',
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [testimonials.length]);

    const renderStars = (rating) => {
        let stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
            );
        }
        return stars;
    };

    const nextTestimonial = () => {
        setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <h2 className="testimonials-title">What Our Customers Say</h2>

                <div className="testimonials-carousel">
                    <button className="arrow-btn prev-btn" onClick={prevTestimonial}>❮</button>

                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            className={`testimonial-card ${index === activeTestimonial ? 'active' : ''}`}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{
                                opacity: index === activeTestimonial ? 1 : 0,
                                x: index === activeTestimonial ? 0 : 100,
                                display: index === activeTestimonial ? 'flex' : 'none'
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="testimonial-image">
                                <img src={testimonial.image} alt={testimonial.name} />
                            </div>
                            <div className="testimonial-content">
                                <div className="testimonial-rating">
                                    {renderStars(testimonial.rating)}
                                </div>
                                <p className="testimonial-text">"{testimonial.content}"</p>
                                <div className="testimonial-author">
                                    <h4>{testimonial.name}</h4>
                                    <p>{testimonial.position}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <button className="arrow-btn next-btn" onClick={nextTestimonial}>❯</button>
                </div>

                <div className="testimonial-indicators">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === activeTestimonial ? 'active' : ''}`}
                            onClick={() => setActiveTestimonial(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;