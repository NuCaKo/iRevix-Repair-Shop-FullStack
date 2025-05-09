import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

function QuantitySelector({ maxQuantity, onQuantityChange, initialQuantity = 1 }) {
    const [quantity, setQuantity] = useState(initialQuantity);

    // Update quantity if initialQuantity prop changes
    useEffect(() => {
        setQuantity(initialQuantity);
    }, [initialQuantity]);

    // Update quantity if maxQuantity changes and current quantity exceeds it
    useEffect(() => {
        if (quantity > maxQuantity) {
            setQuantity(maxQuantity);
            onQuantityChange(maxQuantity);
        }
    }, [maxQuantity, quantity, onQuantityChange]);

    const increaseQuantity = () => {
        if (quantity < maxQuantity) {
            const newQuantity = quantity + 1;
            setQuantity(newQuantity);
            onQuantityChange(newQuantity);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            onQuantityChange(newQuantity);
        }
    };

    const handleInputChange = (e) => {
        let value = parseInt(e.target.value, 10);

        // Handle non-numeric input
        if (isNaN(value)) {
            value = 1;
        }

        // Enforce min/max constraints
        if (value < 1) {
            value = 1;
        } else if (value > maxQuantity) {
            value = maxQuantity;
        }

        setQuantity(value);
        onQuantityChange(value);
    };

    return (
        <div className="quantity-selector">
            <button
                className="quantity-btn"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                type="button"
            >
                <FontAwesomeIcon icon={faMinus} />
            </button>

            <input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={handleInputChange}
                className="quantity-input"
            />

            <button
                className="quantity-btn"
                onClick={increaseQuantity}
                disabled={quantity >= maxQuantity}
                type="button"
            >
                <FontAwesomeIcon icon={faPlus} />
            </button>

            <span className="max-quantity-info">
                {maxQuantity === 1 ? '(Last item)' : `(Max: ${maxQuantity})`}
            </span>
        </div>
    );
}

export default QuantitySelector;