import React, { useEffect } from 'react';
import '../css/PolicyPages.css';

const PrivacyPolicyPage = () => {
    // Sayfa yüklendiğinde en üste kaydırma işlemi
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-page-container">
            <div className="policy-header">
                <h1>Privacy Policy</h1>
                <p>Last Updated: March 7, 2025</p>
            </div>

            <div className="policy-content">
                <section className="policy-section">
                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to iRevix ("we," "our," or "us"). We are committed to protecting your privacy and handling your personal information with transparency and care. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, purchase our products, or use our repair services.
                    </p>
                    <p>
                        By accessing or using our services, you agree to this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                    </p>
                </section>

                {/* Diğer bölümler aynı kalacak */}
                <section className="policy-section">
                    <h2>2. Information We Collect</h2>

                    <h3>2.1. Personal Information</h3>
                    <p>
                        We may collect the following types of personal information:
                    </p>
                    <ul>
                        <li><strong>Contact information:</strong> Name, email address, phone number, and postal address.</li>
                        <li><strong>Account information:</strong> Username, password, and account preferences.</li>
                        <li><strong>Payment information:</strong> Credit card details, billing address, and other payment details.</li>
                        <li><strong>Device information:</strong> Information about your devices when you send them for repair, including serial numbers, device models, and issues reported.</li>
                        <li><strong>Support information:</strong> Information provided when you contact our customer support.</li>
                    </ul>

                    <h3>2.2. Automatically Collected Information</h3>
                    <p>
                        When you visit our website or use our app, we automatically collect certain information, including:
                    </p>
                    <ul>
                        <li><strong>Usage data:</strong> Information about how you interact with our website, app, and services.</li>
                        <li><strong>Device data:</strong> IP address, browser type, operating system, device information, and mobile device identifiers.</li>
                        <li><strong>Location data:</strong> General location information based on your IP address.</li>
                        <li><strong>Cookies and similar technologies:</strong> Information collected through cookies, web beacons, and similar technologies.</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>3. How We Use Your Information</h2>
                    <p>
                        We use your personal information for the following purposes:
                    </p>
                    <ul>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Manage your account and provide customer support</li>
                        <li>Communicate with you about products, services, promotions, and events</li>
                        <li>Personalize your experience and deliver content relevant to your interests</li>
                        <li>Analyze and understand how our services are used</li>
                        <li>Develop new products and services</li>
                        <li>Protect against fraud, unauthorized transactions, and other liability issues</li>
                        <li>Enforce our terms and conditions and comply with legal obligations</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2>4. Disclosure of Your Information</h2>
                    <p>
                        We may share your personal information with the following categories of recipients:
                    </p>
                    <ul>
                        <li><strong>Service providers:</strong> Companies that provide services on our behalf, such as payment processing, website hosting, data analysis, customer service, and marketing assistance.</li>
                        <li><strong>Business partners:</strong> Companies with whom we partner to offer certain products, services, or promotions.</li>
                        <li><strong>Legal authorities:</strong> Law enforcement, government entities, or private parties when required by law, legal process, or to protect our rights or the rights of others.</li>
                        <li><strong>Corporate transactions:</strong> In connection with a corporate transaction, such as a merger, acquisition, or sale of assets.</li>
                    </ul>
                    <p>
                        We do not sell your personal information to third parties.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>5. Your Rights and Choices</h2>
                    <p>
                        Depending on your location, you may have certain rights regarding your personal information, including:
                    </p>
                    <ul>
                        <li>Access to your personal information</li>
                        <li>Correction of inaccurate or incomplete information</li>
                        <li>Deletion of your personal information</li>
                        <li>Restriction or objection to processing</li>
                        <li>Data portability</li>
                        <li>Withdrawal of consent</li>
                    </ul>
                    <p>
                        To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>6. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>7. International Data Transfers</h2>
                    <p>
                        We may transfer your personal information to countries other than the one in which you reside. When we transfer personal information internationally, we take steps to ensure that the information receives the same level of protection as if it remained in your country of residence.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>8. Children's Privacy</h2>
                    <p>
                        Our services are not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn we have collected or received personal information from a child under 13 without verification of parental consent, we will delete that information.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>9. Changes to Our Privacy Policy</h2>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section className="policy-section">
                    <h2>10. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                    </p>
                    <div className="contact-info">
                        <p>Email: <a href="mailto:privacy@irevix.com">privacy@irevix.com</a></p>
                        <p>Phone: +90 00000000</p>
                        <p>Address: Fatih, Istanbul, Turkey</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;