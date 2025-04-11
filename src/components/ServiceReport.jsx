import React from 'react';
import { FaDownload, FaEye } from 'react-icons/fa';
import logo from '../icons/logo.png';

const ServiceReport = ({ selectedRepair, reportRef, generatePDF }) => {
    if (!selectedRepair) return null;

    const report = selectedRepair.serviceReport;

    return (
        <div className="service-report-section">
            <h4>Service Report</h4>

            {selectedRepair.serviceReportUrl ? (
                <div className="existing-service-report">
                    <iframe
                        src={`http://localhost:8080${selectedRepair.serviceReportUrl}`}
                        width="100%"
                        height="600px"
                        title="Service Report PDF"
                    />
                    <div className="pdf-actions">
                        <a
                            href={`http://localhost:8080${selectedRepair.serviceReportUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="download-link"
                        >
                            <FaDownload /> Download PDF
                        </a>
                        <a
                            href={`http://localhost:8080${selectedRepair.serviceReportUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-link"
                        >
                            <FaEye /> View PDF
                        </a>
                    </div>
                </div>
            ) : (
                <div className="report-preview" ref={reportRef}>
                    {/* Header */}
                    <div className="report-header">
                        <div className="company-branding">
                            <div className="company-logo">
                                <img src={logo} alt="iRevix Logo" />
                            </div>
                            <div className="company-info">
                                <h2>iRevix</h2>
                                <p>Professional Apple Device Repair Services</p>
                            </div>
                        </div>
                        <div className="invoice-details">
                            <h3>SERVICE INVOICE</h3>
                            <p><strong>Invoice #:</strong> RVX-{selectedRepair.id}</p>
                            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Payment Due:</strong> Paid</p>
                        </div>
                    </div>

                    {/* Client & service info */}
                    <div className="report-info-grid">
                        <div className="client-info">
                            <h3>CLIENT</h3>
                            <p className="client-name">{selectedRepair.customer}</p>
                            <p>Device: {selectedRepair.device} ({selectedRepair.model})</p>
                        </div>
                        <div className="service-info">
                            <h3>SERVICE DETAILS</h3>
                            <p><strong>Technician:</strong> {report?.technician || '-'}</p>
                            <p><strong>Service Date:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Status:</strong> <span className="status-completed">Completed</span></p>
                            <p><strong>Warranty:</strong> 90 days</p>
                        </div>
                    </div>

                    {/* Services performed table */}
                    <div className="service-details-table">
                        <h3>SERVICES PROVIDED</h3>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Details</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><strong>Issue Reported</strong></td>
                                    <td>{selectedRepair.issue}</td>
                                </tr>
                                <tr>
                                    <td><strong>Work Performed</strong></td>
                                    <td>{report?.workPerformed || '-'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Parts Used</strong></td>
                                    <td>{report?.partsUsed || '-'}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total cost */}
                    <div className="invoice-totals">
                        <div className="totals-wrapper">
                            <table className="total-table">
                                <tbody>
                                <tr>
                                    <td>Labor</td>
                                    <td>₺{(parseFloat(report?.cost || 0) * 0.6).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Parts</td>
                                    <td>₺{(parseFloat(report?.cost || 0) * 0.4).toFixed(2)}</td>
                                </tr>
                                <tr className="total-row">
                                    <td>Total</td>
                                    <td>₺{report?.cost || '0.00'}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="recommendations-section">
                        <h3>RECOMMENDATIONS</h3>
                        <p>{report?.recommendations || "No additional recommendations"}</p>
                    </div>

                    {/* Product images */}
                    {selectedRepair.images && selectedRepair.images.length > 0 && (
                        <div className="report-images">
                            <h3>REPAIR DOCUMENTATION</h3>
                            <div className="image-grid">
                                {selectedRepair.images.map((image) => (
                                    <div key={image.id} className="report-image-item">
                                        <img
                                            src={`http://localhost:8080${image.imageUrl}`}
                                            alt={image.description}
                                            crossOrigin="anonymous"
                                        />
                                        <div className="image-caption">
                                            <small>{image.description} ({image.date})</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terms and conditions */}
                    <div className="terms-section">
                        <h3>TERMS & CONDITIONS</h3>
                        <ul>
                            <li>All repairs carry a 90-day warranty on parts and labor</li>
                            <li>Payment is due upon delivery of the repaired device</li>
                            <li>Unclaimed devices will be subject to storage fees after 30 days</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="report-footer">
                        <p>Thank you for choosing Repair Tech Solutions</p>
                        <p>Istanbul | Phone: +90 00000000 | support@irevix.com</p>
                        <p>Tax ID: 123456789 | www.irevix.com</p>
                    </div>

                    <div className="pdf-actions">
                        <button onClick={generatePDF}>
                            <FaDownload /> Download PDF
                        </button>
                        <button onClick={generatePDF}>
                            <FaEye /> View PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceReport;
