import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faStar, faStarHalfAlt, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import '../css/ProductCard.css';
import { useCart } from '../CartContext';

function ProductCard({ product }) {
    const { addToCart, cartItems } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const handleAddToCart = () => {
        setIsAdding(true);

        try {
            const productWithDefaults = {
                ...product,
                quantity: 1,
                image: product.image || "https://source.unsplash.com/random/100x100/?apple",
                type: product.type || 'part'
            };
            const itemCountBefore = cartItems.reduce((total, item) => total + item.quantity, 0);
            addToCart(productWithDefaults);
            setTimeout(() => {
                const updatedCartItems = JSON.parse(localStorage.getItem('iRevixCart')) || [];
                const itemExists = updatedCartItems.some(item => item.id === product.id);

                if (itemExists) {
                    alert(`Added ${product.name} to cart!`);
                } else {
                    console.error("Failed to add item to cart");
                    alert("There was an issue adding the item to your cart. Please try again.");
                }
                setIsAdding(false);
            }, 100); // Small timeout to allow state update

        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("There was an error adding this item to your cart.");
            setIsAdding(false);
        }
    };
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={`star-${i}`} icon={faStar} className="star-icon" />);
        }
        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key="half-star" icon={faStarHalfAlt} className="star-icon" />);
        }

        return stars;
    };

    return (
        <div className="product-card">
            <div className="product-image">
                <img src={product.image} alt={product.name} />
                {product.discount > 0 && (
                    <div className="discount-badge">-{product.discount}%</div>
                )}
            </div>

            <div className="product-details">
                <h3 className="product-name">{product.name}</h3>

                <div className="product-rating">
                    {renderStars(product.rating)}
                    <span className="rating-count">({product.reviewCount})</span>
                </div>

                <div className="product-price">
                    {product.discount > 0 && (
                        <span className="original-price">
                            ${product.originalPrice.toFixed(2)}
                        </span>
                    )}
                    <span className="current-price">
                        ${product.price.toFixed(2)}
                    </span>
                </div>

                <div className="product-compatibility">
                    <span className="compatibility-label">Compatible with:</span>
                    <span className="compatibility-models">{product.compatibility.join(', ')}</span>
                </div>

                <div className="product-actions">
                    <button
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faCartPlus} />
                        )}
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;