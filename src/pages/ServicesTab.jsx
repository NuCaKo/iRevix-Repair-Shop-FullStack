import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTools,
    faEdit,
    faTrash,
    faPlus,
    faSave,
    faTimes,
    faMobileAlt,
    faTabletScreenButton,
    faLaptop,
    faHeadphones,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import {
    getServiceTypes,
    getServiceOptions,
    createServiceType,
    updateServiceType,
    deleteServiceType,
    createServiceOption,
    updateServiceOption,
    deleteServiceOption,
    getDevices
} from '../services/api';

function ServicesTab() {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [selectedServiceType, setSelectedServiceType] = useState(null);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [devices, setDevices] = useState([]);
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
    const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
    const [isEditOptionModalOpen, setIsEditOptionModalOpen] = useState(false);
    const [error, setError] = useState(null);

    // Form state
    const [newServiceType, setNewServiceType] = useState({
        title: '',
        deviceType: '',
        basePrice: 0,
        description: '',
        imageUrl: '',
        isActive: true
    });

    const [editServiceType, setEditServiceType] = useState(null);

    const [newServiceOption, setNewServiceOption] = useState({
        name: '',
        price: 0,
        description: '',
        isActive: true
    });

    const [editServiceOption, setEditServiceOption] = useState(null);

    // Initial data loading
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch service types
                const serviceTypesData = await getServiceTypes();
                setServiceTypes(serviceTypesData);

                if (serviceTypesData.length > 0) {
                    setSelectedServiceType(serviceTypesData[0]);
                    const optionsData = await getServiceOptions(serviceTypesData[0].id);
                    setServiceOptions(optionsData);
                }

                // Fetch devices with error handling
                try {
                    const devicesData = await getDevices();

                    // Check if the data is in the expected format
                    if (Array.isArray(devicesData)) {
                        setDevices(devicesData);
                    } else if (devicesData && typeof devicesData === 'object') {
                        // If it's an object, check if it has a devices property
                        if (Array.isArray(devicesData.devices)) {
                            setDevices(devicesData.devices);
                        } else {
                            // If it doesn't have a devices array, create a fallback
                            console.warn('Unexpected devices data format:', devicesData);
                            setDevices(createFallbackDevices());
                        }
                    } else {
                        // Fallback if the response is not as expected
                        console.warn('Unexpected devices data:', devicesData);
                        setDevices(createFallbackDevices());
                    }
                } catch (deviceError) {
                    console.error('Error fetching devices:', deviceError);
                    setDevices(createFallbackDevices());
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setError('Failed to load data. Please refresh the page or try again later.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Create fallback devices data
    const createFallbackDevices = () => {
        return [
            { id: 'iphone', name: 'iPhone' },
            { id: 'ipad', name: 'iPad' },
            { id: 'macbook', name: 'MacBook' },
            { id: 'airpods', name: 'AirPods' },
            { id: 'applewatch', name: 'Apple Watch' }
        ];
    };

    // Load service options when a service type is selected
    useEffect(() => {
        const fetchServiceOptions = async () => {
            if (selectedServiceType) {
                try {
                    setIsLoading(true);
                    const optionsData = await getServiceOptions(selectedServiceType.id);
                    setServiceOptions(optionsData);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error loading service options:', error);
                    setIsLoading(false);
                }
            }
        };

        fetchServiceOptions();
    }, [selectedServiceType]);

    const handleSelectServiceType = (serviceType) => {
        setSelectedServiceType(serviceType);
    };

    // Service Type CRUD operations
    const handleAddServiceType = async () => {
        try {
            setIsLoading(true);
            const createdType = await createServiceType(newServiceType);
            setServiceTypes([...serviceTypes, createdType]);
            setIsAddTypeModalOpen(false);
            setNewServiceType({
                title: '',
                deviceType: '',
                basePrice: 0,
                description: '',
                imageUrl: '',
                isActive: true
            });
            setIsLoading(false);
            alert('Service type added successfully');
        } catch (error) {
            console.error('Error adding service type:', error);
            setIsLoading(false);
            alert('Failed to add service type: ' + (error.message || 'Unknown error'));
        }
    };

    const handleUpdateServiceType = async () => {
        try {
            setIsLoading(true);
            const updatedType = await updateServiceType(editServiceType.id, editServiceType);
            setServiceTypes(serviceTypes.map(type =>
                type.id === updatedType.id ? updatedType : type
            ));

            if (selectedServiceType && selectedServiceType.id === updatedType.id) {
                setSelectedServiceType(updatedType);
            }

            setIsEditTypeModalOpen(false);
            setEditServiceType(null);
            setIsLoading(false);
            alert('Service type updated successfully');
        } catch (error) {
            console.error('Error updating service type:', error);
            setIsLoading(false);
            alert('Failed to update service type: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDeleteServiceType = async (id) => {
        if (window.confirm('Are you sure you want to delete this service type? This will also delete all associated service options.')) {
            try {
                setIsLoading(true);
                await deleteServiceType(id);

                const updatedServiceTypes = serviceTypes.filter(type => type.id !== id);
                setServiceTypes(updatedServiceTypes);

                if (selectedServiceType && selectedServiceType.id === id) {
                    if (updatedServiceTypes.length > 0) {
                        setSelectedServiceType(updatedServiceTypes[0]);
                    } else {
                        setSelectedServiceType(null);
                        setServiceOptions([]);
                    }
                }

                setIsLoading(false);
                alert('Service type deleted successfully');
            } catch (error) {
                console.error('Error deleting service type:', error);
                setIsLoading(false);
                alert('Failed to delete service type: ' + (error.message || 'Unknown error'));
            }
        }
    };

    // Service Option CRUD operations
    const handleAddServiceOption = async () => {
        try {
            setIsLoading(true);
            const optionData = {
                ...newServiceOption,
                serviceType: {
                    id: selectedServiceType.id
                }
            };

            const createdOption = await createServiceOption(optionData);
            setServiceOptions([...serviceOptions, createdOption]);
            setIsAddOptionModalOpen(false);
            setNewServiceOption({
                name: '',
                price: 0,
                description: '',
                isActive: true
            });
            setIsLoading(false);
            alert('Service option added successfully');
        } catch (error) {
            console.error('Error adding service option:', error);
            setIsLoading(false);
            alert('Failed to add service option: ' + (error.message || 'Unknown error'));
        }
    };

    const handleUpdateServiceOption = async () => {
        try {
            setIsLoading(true);
            const updatedOption = await updateServiceOption(editServiceOption.id, editServiceOption);
            setServiceOptions(serviceOptions.map(option =>
                option.id === updatedOption.id ? updatedOption : option
            ));
            setIsEditOptionModalOpen(false);
            setEditServiceOption(null);
            setIsLoading(false);
            alert('Service option updated successfully');
        } catch (error) {
            console.error('Error updating service option:', error);
            setIsLoading(false);
            alert('Failed to update service option: ' + (error.message || 'Unknown error'));
        }
    };

    const handleDeleteServiceOption = async (id) => {
        if (window.confirm('Are you sure you want to delete this service option?')) {
            try {
                setIsLoading(true);
                await deleteServiceOption(id);
                setServiceOptions(serviceOptions.filter(option => option.id !== id));
                setIsLoading(false);
                alert('Service option deleted successfully');
            } catch (error) {
                console.error('Error deleting service option:', error);
                setIsLoading(false);
                alert('Failed to delete service option: ' + (error.message || 'Unknown error'));
            }
        }
    };

    // Helper for getting device icon
    const getDeviceIcon = (deviceType) => {
        const deviceTypeMap = {
            'iphone': faMobileAlt,
            'ipad': faTabletScreenButton,
            'macbook': faLaptop,
            'airpods': faHeadphones,
            'applewatch': faClock
        };

        return deviceTypeMap[deviceType.toLowerCase()] || faTools;
    };

    // Form input handlers
    const handleNewTypeInputChange = (e) => {
        const { name, value } = e.target;
        setNewServiceType({
            ...newServiceType,
            [name]: name === 'basePrice' ? parseFloat(value) : value
        });
    };

    const handleEditTypeInputChange = (e) => {
        const { name, value } = e.target;
        setEditServiceType({
            ...editServiceType,
            [name]: name === 'basePrice' ? parseFloat(value) : value
        });
    };

    const handleNewOptionInputChange = (e) => {
        const { name, value } = e.target;
        setNewServiceOption({
            ...newServiceOption,
            [name]: name === 'price' ? parseFloat(value) : value
        });
    };

    const handleEditOptionInputChange = (e) => {
        const { name, value } = e.target;
        setEditServiceOption({
            ...editServiceOption,
            [name]: name === 'price' ? parseFloat(value) : value
        });
    };

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Refresh Page</button>
            </div>
        );
    }

    return (
        <div className="services-tab">
            <div className="services-header">
                <h2>Service Management</h2>
                <button
                    className="add-service-btn"
                    onClick={() => setIsAddTypeModalOpen(true)}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add New Service Type
                </button>
            </div>

            {isLoading ? (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="services-management">
                    <div className="service-types-section">
                        <h3>Repair Service Types</h3>
                        <div className="service-types-list">
                            {serviceTypes.length === 0 ? (
                                <div className="no-data-message">
                                    <p>No service types available. Add your first service type to get started.</p>
                                </div>
                            ) : (
                                serviceTypes.map(serviceType => (
                                    <div
                                        key={serviceType.id}
                                        className={`service-type-item ${selectedServiceType && selectedServiceType.id === serviceType.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectServiceType(serviceType)}
                                    >
                                        <div className="service-type-icon">
                                            <FontAwesomeIcon icon={getDeviceIcon(serviceType.deviceType)} />
                                        </div>
                                        <div className="service-type-details">
                                            <h4>{serviceType.title}</h4>
                                            <p>Base Price: ${serviceType.basePrice.toFixed(2)}</p>
                                            <p className="service-type-device">Device: {serviceType.deviceType}</p>
                                        </div>
                                        <div className="service-type-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditServiceType({...serviceType});
                                                    setIsEditTypeModalOpen(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteServiceType(serviceType.id);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {selectedServiceType && (
                        <div className="service-options-section">
                            <div className="service-options-header">
                                <h3>Service Options for: {selectedServiceType.title}</h3>
                                <button
                                    className="add-option-btn"
                                    onClick={() => setIsAddOptionModalOpen(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Add Service Option
                                </button>
                            </div>

                            {serviceOptions.length === 0 ? (
                                <div className="no-data-message">
                                    <p>No service options available for this service type. Add your first option to get started.</p>
                                </div>
                            ) : (
                                <table className="service-options-table">
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {serviceOptions.map(option => (
                                        <tr key={option.id}>
                                            <td>{option.name}</td>
                                            <td>${option.price.toFixed(2)}</td>
                                            <td>{option.description}</td>
                                            <td>
                                                    <span className={`status-badge ${option.isActive ? 'active' : 'inactive'}`}>
                                                        {option.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => {
                                                            setEditServiceOption({...option});
                                                            setIsEditOptionModalOpen(true);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteServiceOption(option.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Add Service Type Modal */}
            {isAddTypeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Add New Service Type</h2>
                            <button
                                className="close-button"
                                onClick={() => setIsAddTypeModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <form>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newServiceType.title}
                                        onChange={handleNewTypeInputChange}
                                        placeholder="e.g., Screen Repair"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Device Type</label>
                                    <select
                                        name="deviceType"
                                        value={newServiceType.deviceType}
                                        onChange={handleNewTypeInputChange}
                                        required
                                    >
                                        <option value="">Select Device Type</option>
                                        {Array.isArray(devices) && devices.length > 0 ? (
                                            devices.map(device => (
                                                <option key={device.id} value={device.id}>
                                                    {device.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No devices available</option>
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Base Price ($)</label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={newServiceType.basePrice}
                                        onChange={handleNewTypeInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={newServiceType.description}
                                        onChange={handleNewTypeInputChange}
                                        placeholder="Describe the service type"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={newServiceType.imageUrl}
                                        onChange={handleNewTypeInputChange}
                                        placeholder="URL to an image (optional)"
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={newServiceType.isActive}
                                            onChange={(e) => setNewServiceType({
                                                ...newServiceType,
                                                isActive: e.target.checked
                                            })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button
                                    className="modal-button secondary"
                                    onClick={() => setIsAddTypeModalOpen(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                </button>
                                <button
                                    className="modal-button primary"
                                    onClick={handleAddServiceType}
                                >
                                    <FontAwesomeIcon icon={faSave} /> Add Service Type
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Type Modal */}
            {isEditTypeModalOpen && editServiceType && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Edit Service Type</h2>
                            <button
                                className="close-button"
                                onClick={() => setIsEditTypeModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <form>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editServiceType.title}
                                        onChange={handleEditTypeInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Device Type</label>
                                    <select
                                        name="deviceType"
                                        value={editServiceType.deviceType}
                                        onChange={handleEditTypeInputChange}
                                        required
                                    >
                                        <option value="">Select Device Type</option>
                                        {Array.isArray(devices) && devices.length > 0 ? (
                                            devices.map(device => (
                                                <option key={device.id} value={device.id}>
                                                    {device.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No devices available</option>
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Base Price ($)</label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={editServiceType.basePrice}
                                        onChange={handleEditTypeInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={editServiceType.description}
                                        onChange={handleEditTypeInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={editServiceType.imageUrl}
                                        onChange={handleEditTypeInputChange}
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={editServiceType.isActive}
                                            onChange={(e) => setEditServiceType({
                                                ...editServiceType,
                                                isActive: e.target.checked
                                            })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button
                                    className="modal-button secondary"
                                    onClick={() => setIsEditTypeModalOpen(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                </button>
                                <button
                                    className="modal-button primary"
                                    onClick={handleUpdateServiceType}
                                >
                                    <FontAwesomeIcon icon={faSave} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Service Option Modal */}
            {isAddOptionModalOpen && selectedServiceType && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Add Service Option for {selectedServiceType.title}</h2>
                            <button
                                className="close-button"
                                onClick={() => setIsAddOptionModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <form>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newServiceOption.name}
                                        onChange={handleNewOptionInputChange}
                                        placeholder="e.g., Front Screen Replacement"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={newServiceOption.price}
                                        onChange={handleNewOptionInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={newServiceOption.description}
                                        onChange={handleNewOptionInputChange}
                                        placeholder="Describe the service option"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={newServiceOption.isActive}
                                            onChange={(e) => setNewServiceOption({
                                                ...newServiceOption,
                                                isActive: e.target.checked
                                            })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button
                                    className="modal-button secondary"
                                    onClick={() => setIsAddOptionModalOpen(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                </button>
                                <button
                                    className="modal-button primary"
                                    onClick={handleAddServiceOption}
                                >
                                    <FontAwesomeIcon icon={faSave} /> Add Service Option
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Option Modal */}
            {isEditOptionModalOpen && editServiceOption && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Edit Service Option</h2>
                            <button
                                className="close-button"
                                onClick={() => setIsEditOptionModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <form>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editServiceOption.name}
                                        onChange={handleEditOptionInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={editServiceOption.price}
                                        onChange={handleEditOptionInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={editServiceOption.description}
                                        onChange={handleEditOptionInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={editServiceOption.isActive}
                                            onChange={(e) => setEditServiceOption({
                                                ...editServiceOption,
                                                isActive: e.target.checked
                                            })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button
                                    className="modal-button secondary"
                                    onClick={() => setIsEditOptionModalOpen(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} /> Cancel
                                </button>
                                <button
                                    className="modal-button primary"
                                    onClick={handleUpdateServiceOption}
                                >
                                    <FontAwesomeIcon icon={faSave} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ServicesTab;