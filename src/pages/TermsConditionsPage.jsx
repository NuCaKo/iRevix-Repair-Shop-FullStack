import React, { useEffect } from 'react';
import '../css/PolicyPages.css';

const TermsConditionsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-page-container">
            <div className="policy-header">
                <h1>Terms & Conditions</h1>
                <p>Last Updated: March 7, 2025</p>
            </div>

            <div className="policy-content">
                <section className="policy-section">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to iRevix. These Terms and Conditions ("Terms") govern your use of our website, mobile application, and services (collectively, our "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
                    </p>
                    <p>
                        Please read these Terms carefully. They contain important information about your legal rights, remedies, and obligations. By using our Services, you agree to these Terms and our Privacy Policy.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>2. Definitions</h2>
                    <p>
                        In these Terms:
                    </p>
                    <ul>
                        <li><strong>"iRevix,"</strong> "we," "our," or "us" refers to iRevix and its subsidiaries and affiliates.</li>
                        <li><strong>"You"</strong> or "your" refers to any individual or entity using our Services.</li>
                        <li><strong>"Services"</strong> refers to our website, mobile application, repair services, products, and any other services we provide.</li>
                        <li><strong>"Content"</strong> refers to text, graphics, images, music, software, audio, video, information, or other materials.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>3. Account Registration</h2>
                    <p>
                        To access certain features of our Services, you may need to register for an account. When you register, you agree to:
                    </p>
                    <ul>
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your account and password</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                    <p>
                        We reserve the right to suspend or terminate your account if any information provided is inaccurate, false, or no longer current.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>4. Products and Services</h2>
                    <h3>4.1. Product Information</h3>
                    <p>
                        We strive to provide accurate product descriptions, pricing, and availability information. However, we do not warrant that product descriptions, pricing, or other content on our Services is accurate, complete, reliable, current, or error-free. If a product offered through our Services is not as described, your sole remedy is to return it in unused condition.
                    </p>

                    <h3>4.2. Repair Services</h3>
                    <p>
                        Repair services are subject to the following conditions:
                    </p>
                    <ul>
                        <li>We will provide a diagnosis and estimate before proceeding with repairs.</li>
                        <li>Estimated completion times are not guaranteed and may vary based on parts availability and workload.</li>
                        <li>We are not responsible for data loss during repair. We recommend backing up your device before submitting it for repair.</li>
                        <li>Parts replaced during repair become our property unless otherwise agreed upon.</li>
                        <li>Repairs come with a limited warranty as specified in our warranty policy.</li>
                    </ul>

                    <h3>4.3. Pricing and Payment</h3>
                    <p>
                        All prices are shown in the local currency and do not include taxes or shipping costs unless otherwise specified. Payment must be made in full before products are shipped or services are completed. We accept various payment methods as indicated on our website.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>5. Orders and Shipping</h2>
                    <p>
                        When you place an order through our Services:
                    </p>
                    <ul>
                        <li>Your order constitutes an offer to purchase the products or services.</li>
                        <li>We reserve the right to accept or decline your order for any reason.</li>
                        <li>We are not responsible for delays caused by carriers, customs, or other third parties.</li>
                        <li>Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>6. Returns and Refunds</h2>
                    <p>
                        Our return and refund policy is as follows:
                    </p>
                    <ul>
                        <li>Products may be returned within 30 days of receipt if they are in unused, original condition with all packaging and accessories.</li>
                        <li>Custom-ordered or special-order items are non-returnable unless defective.</li>
                        <li>Refunds will be issued to the original payment method within 10 business days of receiving the returned item.</li>
                        <li>Shipping costs for returns are the customer's responsibility unless the return is due to our error or a defective product.</li>
                    </ul>
                    <p>
                        For more details, please refer to our Returns & Refunds Policy.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>7. Intellectual Property</h2>
                    <p>
                        All content included on our Services, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the Services, is our property or the property of our suppliers and protected by copyright and intellectual property laws.
                    </p>
                    <p>
                        You may not reproduce, duplicate, copy, sell, resell, or exploit any portion of our Services without our express written permission.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>8. User Content and Conduct</h2>
                    <p>
                        If you submit content to our Services (such as reviews, comments, or feedback):
                    </p>
                    <ul>
                        <li>You retain ownership of your content.</li>
                        <li>You grant us a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, store, display, reproduce, modify, and distribute your content on our Services.</li>
                        <li>You represent and warrant that you have all necessary rights to grant us this license.</li>
                    </ul>
                    <p>
                        You agree not to use our Services to:
                    </p>
                    <ul>
                        <li>Violate any applicable law or regulation</li>
                        <li>Infringe the rights of any third party</li>
                        <li>Submit false, misleading, or inaccurate information</li>
                        <li>Distribute viruses or any other malicious code</li>
                        <li>Interfere with the proper working of our Services</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>9. Disclaimers and Limitations of Liability</h2>
                    <p>
                        OUR SERVICES ARE PROVIDED "AS IS" WITHOUT ANY WARRANTIES, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                    <p>
                        IN NO EVENT SHALL WE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF OUR SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
                    </p>
                    <p>
                        SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES OR LIMITATION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS OR EXCLUSIONS MAY NOT APPLY TO YOU.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>10. Indemnification</h2>
                    <p>
                        You agree to indemnify, defend, and hold harmless iRevix and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) that arise from or relate to:
                    </p>
                    <ul>
                        <li>Your use of our Services</li>
                        <li>Your violation of these Terms</li>
                        <li>Your violation of any rights of another person or entity</li>
                        <li>Your content submitted to our Services</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>11. Governing Law and Dispute Resolution</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of Turkey, without regard to its conflict of law provisions.
                    </p>
                    <p>
                        Any dispute arising out of or relating to these Terms or our Services shall be resolved exclusively through final and binding arbitration in Istanbul, Turkey. The arbitration shall be conducted in accordance with the rules of the Istanbul Arbitration Center.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>12. Changes to These Terms</h2>
                    <p>
                        We may revise these Terms from time to time. The most current version will always be posted on our website. By continuing to use our Services after revisions become effective, you agree to be bound by the revised Terms.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>13. Severability</h2>
                    <p>
                        If any provision of these Terms is held to be invalid, illegal, or unenforceable, such provision shall be struck from these Terms, and the remaining provisions shall remain in full force and effect.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>14. Entire Agreement</h2>
                    <p>
                        These Terms, together with our Privacy Policy and any other legal notices published by us on the Services, constitute the entire agreement between you and us concerning the Services.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>15. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at:
                    </p>
                    <div className="contact-info">
                        <p>Email: <a href="mailto:terms@irevix.com">terms@irevix.com</a></p>
                        <p>Phone: +90 00000000</p>
                        <p>Address: Fatih, Istanbul, Turkey</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TermsConditionsPage;