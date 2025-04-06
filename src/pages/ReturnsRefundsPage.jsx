import React, { useEffect } from 'react';
import '../css/PolicyPages.css';

const ReturnsRefundsPage = () => {
    // Sayfa yüklendiğinde en üste kaydırma işlemi
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-page-container">
            <div className="policy-header">
                <h1>Returns & Refunds Policy</h1>
                <p>Last Updated: March 7, 2025</p>
            </div>

            <div className="policy-content">
                <section className="policy-section">
                    <h2>1. Introduction</h2>
                    <p>
                        At iRevix, we want you to be completely satisfied with your purchase. We understand that sometimes a product may not meet your expectations. This Returns & Refunds Policy outlines the terms and conditions for returning products and obtaining refunds for purchases made through our website or store.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>2. Return Eligibility</h2>
                    <h3>2.1. Products</h3>
                    <p>
                        Products purchased from iRevix may be returned within 30 days of the delivery date, provided they meet the following conditions:
                    </p>
                    <ul>
                        <li>The product is in new, unused condition</li>
                        <li>The product is in its original packaging with all accessories, manuals, and warranty cards</li>
                        <li>The product has not been damaged after delivery</li>
                        <li>You have the original receipt or proof of purchase</li>
                    </ul>

                    <h3>2.2. Non-Returnable Items</h3>
                    <p>
                        The following items are generally not eligible for return or refund:
                    </p>
                    <ul>
                        <li>Custom-ordered or specially manufactured products</li>
                        <li>Software, digital products, or downloaded content</li>
                        <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                        <li>Gift cards</li>
                        <li>Consumable items (once opened)</li>
                        <li>Products with broken or removed security seals</li>
                    </ul>

                    <h3>2.3. Repair Services</h3>
                    <p>
                        For repair services:
                    </p>
                    <ul>
                        <li>If you are not satisfied with a repair service, please contact us within 7 days of receiving your repaired device</li>
                        <li>We offer a 90-day warranty on all repairs unless otherwise specified</li>
                        <li>If the same issue recurs within the warranty period, we will repair it at no additional cost</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>3. Return Process</h2>
                    <h3>3.1. Initiating a Return</h3>
                    <p>
                        To initiate a return, please follow these steps:
                    </p>
                    <ol>
                        <li>Contact our customer service team at <a href="mailto:returns@irevix.com">returns@irevix.com</a> or call +90 00000000</li>
                        <li>Provide your order number, the items you wish to return, and the reason for the return</li>
                        <li>Our team will provide you with a Return Authorization Number (RAN) and return instructions</li>
                        <li>Package the item securely with all original components and include the RAN in your package</li>
                    </ol>

                    <h3>3.2. Return Shipping</h3>
                    <p>
                        You are responsible for the cost of return shipping unless:
                    </p>
                    <ul>
                        <li>The product was received damaged or defective</li>
                        <li>We sent you the wrong product</li>
                        <li>The return is the result of our error</li>
                    </ul>
                    <p>
                        We recommend using a trackable shipping service and purchasing shipping insurance for your return, as we cannot be responsible for items lost or damaged during return shipping.
                    </p>

                    <h3>3.3. In-Store Returns</h3>
                    <p>
                        Products purchased online can also be returned to any of our physical store locations. Please bring your receipt or order confirmation and the items you wish to return in their original condition and packaging.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>4. Refund Process</h2>
                    <h3>4.1. Refund Timing</h3>
                    <p>
                        Once we receive and inspect your return, we will notify you of the status of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within:
                    </p>
                    <ul>
                        <li>3-5 business days for credit card purchases</li>
                        <li>5-10 business days for bank transfers</li>
                        <li>1-2 business days for store credit or gift cards</li>
                    </ul>
                    <p>
                        Please note that your bank or credit card company may require additional time to process and post the refund to your account.
                    </p>

                    <h3>4.2. Refund Methods</h3>
                    <p>
                        Refunds will be issued using the same payment method used for the original purchase:
                    </p>
                    <ul>
                        <li>Credit card purchases will be refunded to the same credit card</li>
                        <li>Bank transfers will be returned to the originating bank account</li>
                        <li>Cash purchases will be refunded in cash (for in-store returns) or by bank transfer</li>
                    </ul>
                    <p>
                        In some cases, we may offer store credit or gift cards as an alternative refund method, especially for returns without a receipt or returns after the standard return period.
                    </p>

                    <h3>4.3. Partial Refunds</h3>
                    <p>
                        We may issue partial refunds in the following situations:
                    </p>
                    <ul>
                        <li>The returned item shows signs of use or wear</li>
                        <li>Components or accessories are missing from the returned item</li>
                        <li>The product was on sale or purchased with a discount code</li>
                        <li>Late returns (beyond 30 days but within 45 days)</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>5. Damaged or Defective Items</h2>
                    <p>
                        If you receive a damaged or defective item:
                    </p>
                    <ol>
                        <li>Contact us within 48 hours of receiving the item</li>
                        <li>Provide details and photos of the damage or defect</li>
                        <li>We will arrange for a replacement or refund at our discretion</li>
                        <li>Return shipping for damaged or defective items will be covered by iRevix</li>
                    </ol>
                    <p>
                        For items damaged during shipping, we may require you to complete a carrier damage claim form.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>6. Warranty Claims</h2>
                    <p>
                        Many products sold by iRevix come with a manufacturer's warranty. Warranty claims are handled differently from standard returns:
                    </p>
                    <ul>
                        <li>Warranty periods vary by product and manufacturer</li>
                        <li>Warranty claims must be submitted with proof of purchase</li>
                        <li>Some warranty claims may need to be processed directly with the manufacturer</li>
                        <li>Our team can assist you in initiating warranty claims and navigating the process</li>
                    </ul>
                    <p>
                        Please note that misuse, accidents, or normal wear and tear are typically not covered under warranty.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>7. Exchanges</h2>
                    <p>
                        If you wish to exchange an item for a different size, color, or model:
                    </p>
                    <ol>
                        <li>Follow the standard return process</li>
                        <li>Indicate that you want an exchange rather than a refund</li>
                        <li>Specify the item you want in exchange</li>
                    </ol>
                    <p>
                        If the exchange item is of higher value, you will need to pay the difference. If it is of lower value, we will refund the difference using your original payment method.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>8. Promotional Items and Gifts</h2>
                    <p>
                        For items received as part of a promotion or as a gift:
                    </p>
                    <ul>
                        <li>Free promotional items must be returned if the qualifying purchase is returned</li>
                        <li>Gift recipients can return items for store credit or exchange (no cash refunds without the original purchaser's involvement)</li>
                        <li>Gift receipts allow for returns or exchanges but will not show pricing information</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>9. Cancellations</h2>
                    <p>
                        You may cancel an order before it has been shipped:
                    </p>
                    <ul>
                        <li>Contact our customer service team as soon as possible to request cancellation</li>
                        <li>Orders that have already been shipped cannot be cancelled and must go through the standard return process</li>
                        <li>Refunds for cancelled orders will be processed within 3-5 business days</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>10. Changes to this Policy</h2>
                    <p>
                        We reserve the right to modify this Returns & Refunds Policy at any time. Changes will be effective immediately upon posting to our website. It is your responsibility to review this policy periodically for changes.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>11. Contact Us</h2>
                    <p>
                        If you have any questions about our Returns & Refunds Policy, please contact our customer service team:
                    </p>
                    <div className="contact-info">
                        <p>Email: <a href="mailto:returns@irevix.com">returns@irevix.com</a></p>
                        <p>Phone: +90 00000000</p>
                        <p>Address: Fatih, Istanbul, Turkey</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ReturnsRefundsPage;