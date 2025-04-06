import React, { useEffect } from 'react';
import '../css/PolicyPages.css';

const ShippingPolicyPage = () => {
    // Sayfa yüklendiğinde en üste kaydırma işlemi
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-page-container">
            <div className="policy-header">
                <h1>Shipping Policy</h1>
                <p>Last Updated: March 7, 2025</p>
            </div>

            <div className="policy-content">
                <section className="policy-section">
                    <h2>1. Shipping Information</h2>
                    <p>
                        At iRevix, we are committed to providing fast, reliable, and secure shipping for all your purchases. This Shipping Policy outlines the terms and conditions for the delivery of products purchased through our website or store.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>2. Processing Time</h2>
                    <p>
                        All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation. If we are experiencing high volume or unusual circumstances, processing time may be affected, and we will notify you of any delays.
                    </p>
                    <p>
                        For custom orders or repair services, additional processing time may be required. You will be informed of the estimated processing time when you place your order.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>3. Shipping Methods and Delivery Times</h2>
                    <h3>3.1. Standard Shipping</h3>
                    <p>
                        Standard shipping typically takes 3-5 business days after your order has been processed. This service is available for all addresses within Turkey.
                    </p>

                    <h3>3.2. Express Shipping</h3>
                    <p>
                        Express shipping typically takes 1-2 business days after your order has been processed. This service is available for most city centers and may have limited availability in remote areas.
                    </p>

                    <h3>3.3. International Shipping</h3>
                    <p>
                        International shipping is available to select countries. Delivery times vary depending on the destination country, customs processing, and local delivery services. Typical delivery times range from 7-21 business days after your order has been processed.
                    </p>

                    <h3>3.4. Store Pickup</h3>
                    <p>
                        You can choose to pick up your order at our store locations. Orders are typically available for pickup within 24 hours of processing. You will receive a notification when your order is ready for pickup.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>4. Shipping Costs</h2>
                    <p>
                        Shipping costs are calculated based on the total weight of your order, the shipping method selected, and your delivery location.
                    </p>
                    <ul>
                        <li><strong>Standard Shipping:</strong> Free for orders over 500 TL within Turkey. Orders under 500 TL incur a shipping fee of 30 TL.</li>
                        <li><strong>Express Shipping:</strong> Available for an additional 50 TL within Turkey.</li>
                        <li><strong>International Shipping:</strong> Costs vary depending on destination country and package weight. The exact shipping cost will be calculated at checkout.</li>
                        <li><strong>Store Pickup:</strong> Free of charge.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>5. Order Tracking</h2>
                    <p>
                        Once your order has been shipped, you will receive a shipping confirmation email with a tracking number and instructions on how to track your package. You can also track your order by logging into your account on our website and viewing your order history.
                    </p>
                    <p>
                        Please note that tracking information may take up to 24 hours to update after your order has been shipped.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>6. Shipping Restrictions</h2>
                    <p>
                        Certain products cannot be shipped to specific locations due to legal restrictions or shipping carrier limitations. If a product cannot be shipped to your location, you will be notified during the checkout process.
                    </p>
                    <p>
                        Additionally, we do not ship to P.O. boxes for certain products, particularly those that require signature confirmation upon delivery.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>7. Delivery Issues</h2>
                    <h3>7.1. Failed Delivery Attempts</h3>
                    <p>
                        If a delivery attempt is unsuccessful, the carrier will typically leave a notice with instructions for rescheduling delivery or picking up the package from a local facility. If a package is returned to us due to failed delivery attempts, you may be responsible for additional shipping costs to reattempt delivery.
                    </p>

                    <h3>7.2. Lost or Damaged Packages</h3>
                    <p>
                        If your package appears to be lost or damaged during transit, please contact our customer service team within 7 days of the expected delivery date. We will work with the shipping carrier to resolve the issue and may require you to complete a claim form.
                    </p>

                    <h3>7.3. Incorrect Address</h3>
                    <p>
                        It is your responsibility to provide accurate shipping information. If a package is returned to us due to an incorrect address provided by you, you may be responsible for additional shipping costs to redeliver the package.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>8. International Orders</h2>
                    <p>
                        For international orders, please note the following:
                    </p>
                    <ul>
                        <li>You may be responsible for paying customs duties, taxes, and fees imposed by your country's customs authorities. These charges are not included in the purchase price or shipping costs.</li>
                        <li>Delivery times may be extended due to customs processing and local delivery services.</li>
                        <li>Some products may be restricted from import in certain countries. It is your responsibility to ensure that the items you order comply with your country's import regulations.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>9. Special Handling Items</h2>
                    <p>
                        Certain items, such as batteries, electronics with lithium-ion batteries, and fragile items, may require special handling and packaging. These items may have additional shipping restrictions or requirements and may incur additional shipping costs.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>10. Changes to Shipping Policy</h2>
                    <p>
                        We reserve the right to modify this Shipping Policy at any time. Changes will be effective immediately upon posting to our website. It is your responsibility to review this policy periodically for changes.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>11. Contact Us</h2>
                    <p>
                        If you have any questions about our Shipping Policy, please contact our customer service team:
                    </p>
                    <div className="contact-info">
                        <p>Email: <a href="mailto:shipping@irevix.com">shipping@irevix.com</a></p>
                        <p>Phone: +90 00000000</p>
                        <p>Address: Fatih, Istanbul, Turkey</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;