import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('generalInfo');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [userProfile, setUserProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        address: '',
        serviceLocations: '',
        specialties: [],
        experience: '',
        certification: '',
        twoFactorEnabled: false
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [contactPreferences, setContactPreferences] = useState({
        email: true,
        sms: true,
        marketing: false
    });
    const [errors, setErrors] = useState({});
    const [editableProfile, setEditableProfile] = useState({...userProfile});

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'customer',
                address: user.address || '',
                serviceLocations: user.serviceLocations || '',
                specialties: user.specialties || [],
                experience: user.experience || '',
                certification: user.certification || '',
                twoFactorEnabled: false
            });
            setEditableProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'customer',
                address: user.address || '',
                serviceLocations: user.serviceLocations || '',
                specialties: user.specialties || [],
                experience: user.experience || '',
                certification: user.certification || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleEditClick = () => {
        setEditableProfile({...userProfile});
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setErrors({});
    };

    const handleProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditableProfile({
            ...editableProfile,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handlePreferenceChange = (e) => {
        const { name, checked } = e.target;
        setContactPreferences({
            ...contactPreferences,
            [name]: checked
        });
    };

    const validateProfileForm = () => {
        const newErrors = {};

        if (!editableProfile.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!editableProfile.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!editableProfile.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(editableProfile.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (editableProfile.phone && !/^[0-9]{10}$/.test(editableProfile.phone.replace(/\s+/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number (10 digits)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!validateProfileForm()) {
            return;
        }

        setShowPasswordConfirmation(true);
    };

    const confirmProfileUpdate = async () => {
        setIsSaving(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setUserProfile({...editableProfile});
            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            const updatedUser = {
                ...storedUser,
                firstName: editableProfile.firstName,
                lastName: editableProfile.lastName,
                email: editableProfile.email,
                phone: editableProfile.phone,
                address: editableProfile.address,
                serviceLocations: editableProfile.serviceLocations,
                specialties: editableProfile.specialties,
                experience: editableProfile.experience,
                certification: editableProfile.certification
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            setIsEditing(false);
            setShowPasswordConfirmation(false);
            setConfirmPassword('');
            setPasswordError('');
        } catch (error) {
            setPasswordError('Password verification failed or an error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({
            ...passwordForm,
            [name]: value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validatePasswordForm = () => {
        const newErrors = {};

        if (!passwordForm.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!passwordForm.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(passwordForm.newPassword)) {
            newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }

        if (!passwordForm.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Password confirmation is required';
        } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        setIsSaving(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });

            setErrors({});
            window.showNotification('success', 'Your password has been successfully changed!');
        } catch (error) {
            setErrors({
                passwordGeneral: 'An error occurred while changing the password. Please check your current password and try again.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteConfirmation(true);
    };

    const confirmAccountDeletion = async () => {
        setIsSaving(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            window.showNotification('success', 'Your account has been successfully deleted!');
            localStorage.removeItem('currentUser');
            navigate('/');
        } catch (error) {
            setPasswordError('Password verification failed or an error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleContactPreferencesSubmit = (e) => {
        e.preventDefault();
        window.showNotification('success', 'Your contact preferences have been successfully updated!');
    };
    const renderGeneralInfoView = () => {
        if (isEditing) {
            return renderProfileEdit();
        }

        return (
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2 className="profile-section-title">General Information</h2>
                    <button
                        className="edit-button"
                        onClick={handleEditClick}
                    >
                        Edit
                    </button>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <span className="detail-label">First Name:</span>
                        <span className="detail-value">{userProfile.firstName}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Last Name:</span>
                        <span className="detail-value">{userProfile.lastName}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{userProfile.email}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{userProfile.phone || 'Not specified'}</span>
                    </div>

                    {userProfile.role === 'customer' && (
                        <div className="detail-item">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value">{userProfile.address || 'Not specified'}</span>
                        </div>
                    )}

                    {userProfile.role === 'admin' && (
                        <div className="detail-item">
                            <span className="detail-label">Service Locations:</span>
                            <span className="detail-value">{userProfile.serviceLocations || 'Not specified'}</span>
                        </div>
                    )}

                    {userProfile.role === 'tamirci' && (
                        <>
                            <div className="detail-item">
                                <span className="detail-label">Service Locations:</span>
                                <span className="detail-value">{userProfile.serviceLocations || 'Not specified'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Specialties:</span>
                                <span className="detail-value">
                                    {userProfile.specialties && userProfile.specialties.length > 0
                                        ? userProfile.specialties.join(', ')
                                        : 'Not specified'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Experience:</span>
                                <span className="detail-value">{userProfile.experience || 'Not specified'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Certifications:</span>
                                <span className="detail-value">{userProfile.certification || 'Not specified'}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };
    const renderProfileEdit = () => {
        return (
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2 className="profile-section-title">Edit Profile Information</h2>
                </div>

                <form className="profile-form" onSubmit={handleProfileSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={editableProfile.firstName}
                            onChange={handleProfileChange}
                            className={errors.firstName ? 'error' : ''}
                        />
                        {errors.firstName && <div className="input-error">{errors.firstName}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={editableProfile.lastName}
                            onChange={handleProfileChange}
                            className={errors.lastName ? 'error' : ''}
                        />
                        {errors.lastName && <div className="input-error">{errors.lastName}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={editableProfile.email}
                            onChange={handleProfileChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <div className="input-error">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={editableProfile.phone}
                            onChange={handleProfileChange}
                            className={errors.phone ? 'error' : ''}
                            placeholder="5XX XXX XX XX"
                        />
                        {errors.phone && <div className="input-error">{errors.phone}</div>}
                    </div>

                    {userProfile.role === 'customer' && (
                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                name="address"
                                value={editableProfile.address}
                                onChange={handleProfileChange}
                                rows="3"
                                className={errors.address ? 'error' : ''}
                            ></textarea>
                            {errors.address && <div className="input-error">{errors.address}</div>}
                        </div>
                    )}

                    {userProfile.role === 'admin' && (
                        <div className="form-group">
                            <label htmlFor="serviceLocations">Service Locations</label>
                            <input
                                type="text"
                                id="serviceLocations"
                                name="serviceLocations"
                                value={editableProfile.serviceLocations}
                                onChange={handleProfileChange}
                                className={errors.serviceLocations ? 'error' : ''}
                                placeholder="E.g.: New York, Chicago, Los Angeles"
                            />
                            {errors.serviceLocations && <div className="input-error">{errors.serviceLocations}</div>}
                        </div>
                    )}

                    {userProfile.role === 'tamirci' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="serviceLocations">Service Locations</label>
                                <input
                                    type="text"
                                    id="serviceLocations"
                                    name="serviceLocations"
                                    value={editableProfile.serviceLocations}
                                    onChange={handleProfileChange}
                                    className={errors.serviceLocations ? 'error' : ''}
                                    placeholder="E.g.: New York, Chicago, Los Angeles"
                                />
                                {errors.serviceLocations && <div className="input-error">{errors.serviceLocations}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="specialties">Specialties</label>
                                <input
                                    type="text"
                                    id="specialties"
                                    name="specialties"
                                    value={Array.isArray(editableProfile.specialties) ? editableProfile.specialties.join(', ') : editableProfile.specialties}
                                    onChange={(e) => {
                                        const specialtiesArray = e.target.value.split(',').map(item => item.trim());
                                        setEditableProfile({
                                            ...editableProfile,
                                            specialties: specialtiesArray
                                        });
                                    }}
                                    className={errors.specialties ? 'error' : ''}
                                    placeholder="E.g.: Phone Repair, Tablet Repair"
                                />
                                {errors.specialties && <div className="input-error">{errors.specialties}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="experience">Experience</label>
                                <input
                                    type="text"
                                    id="experience"
                                    name="experience"
                                    value={editableProfile.experience}
                                    onChange={handleProfileChange}
                                    className={errors.experience ? 'error' : ''}
                                    placeholder="E.g.: 5 years"
                                />
                                {errors.experience && <div className="input-error">{errors.experience}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="certification">Certifications</label>
                                <input
                                    type="text"
                                    id="certification"
                                    name="certification"
                                    value={editableProfile.certification}
                                    onChange={handleProfileChange}
                                    className={errors.certification ? 'error' : ''}
                                    placeholder="E.g.: Electronics Repair Certification"
                                />
                                {errors.certification && <div className="input-error">{errors.certification}</div>}
                            </div>
                        </>
                    )}

                    <div className="form-buttons">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={handleCancelEdit}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-button"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };
    const renderPasswordForm = () => {
        return (
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2 className="profile-section-title">Change Password</h2>
                </div>

                {errors.passwordGeneral && (
                    <div className="error-message general-error">
                        {errors.passwordGeneral}
                    </div>
                )}

                <form className="password-form" onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className={errors.currentPassword ? 'error' : ''}
                        />
                        {errors.currentPassword && <div className="input-error">{errors.currentPassword}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className={errors.newPassword ? 'error' : ''}
                        />
                        {errors.newPassword && <div className="input-error">{errors.newPassword}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmNewPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={passwordForm.confirmNewPassword}
                            onChange={handlePasswordChange}
                            className={errors.confirmNewPassword ? 'error' : ''}
                        />
                        {errors.confirmNewPassword && <div className="input-error">{errors.confirmNewPassword}</div>}
                    </div>

                    <div className="form-buttons">
                        <button
                            type="submit"
                            className="save-button"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };
    const renderContactPreferences = () => {
        return (
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2 className="profile-section-title">Contact Preferences</h2>
                </div>

                <form className="preferences-form" onSubmit={handleContactPreferencesSubmit}>
                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            name="email"
                            checked={contactPreferences.email}
                            onChange={handlePreferenceChange}
                        />
                        <label htmlFor="emailNotifications">Email notifications</label>
                        <p className="preference-description">Receive emails for orders, repair status, and important notifications</p>
                    </div>

                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="smsNotifications"
                            name="sms"
                            checked={contactPreferences.sms}
                            onChange={handlePreferenceChange}
                        />
                        <label htmlFor="smsNotifications">SMS notifications</label>
                        <p className="preference-description">Receive SMS for orders, repair status, and important notifications</p>
                    </div>

                    <div className="form-group checkbox-group">
                        <input
                            type="checkbox"
                            id="marketingNotifications"
                            name="marketing"
                            checked={contactPreferences.marketing}
                            onChange={handlePreferenceChange}
                        />
                        <label htmlFor="marketingNotifications">Marketing notifications</label>
                        <p className="preference-description">Receive notifications about promotions, discounts, and new services</p>
                    </div>

                    <div className="form-buttons">
                        <button
                            type="submit"
                            className="save-button"
                        >
                            Save Preferences
                        </button>
                    </div>
                </form>
            </div>
        );
    };
    const renderAccountDeletion = () => {
        return (
            <div className="profile-section">
                <div className="profile-section-header">
                    <h2 className="profile-section-title">Account Deletion</h2>
                </div>

                <div className="danger-zone">
                    <div className="warning-box">
                        <h3>Warning: Account Deletion</h3>
                        <p>
                            When you delete your account, all your personal information, service history, and preferences will be permanently deleted.
                            This action cannot be undone.
                        </p>

                        <div className="delete-account-actions">
                            <button
                                className="delete-button"
                                onClick={handleDeleteAccount}
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const renderPasswordConfirmationModal = () => {
        if (!showPasswordConfirmation) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="modal-header">
                        <h3 className="modal-title">Password Verification</h3>
                        <p className="modal-description">
                            Please verify your password to update your profile information.
                        </p>
                    </div>

                    <div className="modal-content">
                        {passwordError && (
                            <div className="error-message">
                                {passwordError}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Your Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div className="modal-buttons">
                        <button
                            className="modal-cancel"
                            onClick={() => {
                                setShowPasswordConfirmation(false);
                                setConfirmPassword('');
                                setPasswordError('');
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-confirm"
                            onClick={confirmProfileUpdate}
                            disabled={!confirmPassword || isSaving}
                        >
                            {isSaving ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const renderDeleteConfirmationModal = () => {
        if (!showDeleteConfirmation) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-container">
                    <div className="modal-header">
                        <h3 className="modal-title">Account Deletion Confirmation</h3>
                        <p className="modal-description">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
                        </p>
                    </div>

                    <div className="modal-content">
                        {passwordError && (
                            <div className="error-message">
                                {passwordError}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="deleteConfirmPassword">Enter your password</label>
                            <input
                                type="password"
                                id="deleteConfirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div className="modal-buttons">
                        <button
                            className="modal-cancel"
                            onClick={() => {
                                setShowDeleteConfirmation(false);
                                setConfirmPassword('');
                                setPasswordError('');
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-confirm modal-delete"
                            onClick={confirmAccountDeletion}
                            disabled={!confirmPassword || isSaving}
                        >
                            {isSaving ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="profile-container">
            <Navbar />
            <div className="profile-content">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                    </div>
                    <div className="profile-info">
                        <h1>{userProfile.firstName} {userProfile.lastName}</h1>
                        <p>{userProfile.email}</p>
                    </div>
                </div>

                <div className="profile-tabs">
                    <div
                        className={`profile-tab ${activeSection === 'generalInfo' ? 'active' : ''}`}
                        onClick={() => setActiveSection('generalInfo')}
                    >
                        General Information
                    </div>

                    <div
                        className={`profile-tab ${activeSection === 'passwordChange' ? 'active' : ''}`}
                        onClick={() => setActiveSection('passwordChange')}
                    >
                        Change Password
                    </div>

                    <div
                        className={`profile-tab ${activeSection === 'contactPreferences' ? 'active' : ''}`}
                        onClick={() => setActiveSection('contactPreferences')}
                    >
                        Contact Preferences
                    </div>

                    <div
                        className={`profile-tab danger ${activeSection === 'accountDeletion' ? 'active' : ''}`}
                        onClick={() => setActiveSection('accountDeletion')}
                    >
                        Delete Account
                    </div>
                </div>

                <div className="profile-main">
                    {activeSection === 'generalInfo' && renderGeneralInfoView()}
                    {activeSection === 'passwordChange' && renderPasswordForm()}
                    {activeSection === 'contactPreferences' && renderContactPreferences()}
                    {activeSection === 'accountDeletion' && renderAccountDeletion()}
                </div>
            </div>

            {renderPasswordConfirmationModal()}
            {renderDeleteConfirmationModal()}
        </div>
    );
};

export default ProfilePage;