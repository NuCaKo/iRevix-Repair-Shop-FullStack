import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        // We'll show the button after 200px of scrolling
        if (window.pageYOffset > 200) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="scroll-to-top-btn"
                    aria-label="Scroll to top"
                >
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}
        </>
    );
};

export default ScrollToTop;