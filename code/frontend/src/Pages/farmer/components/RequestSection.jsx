import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { subscribeToFarmerRequests, respondToProductRequest } from '../../Customer/src/app/services/firestoreService';
import { FileText, Check, X, Package } from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function RequestsSection() {
    const { t } = useLanguage();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [farmerProfile, setFarmerProfile] = useState(null);

    // Respond modals/popups state
    const [respondingTo, setRespondingTo] = useState(null); // request object
    const [responseMessage, setResponseMessage] = useState('');
    const [actionStatus, setActionStatus] = useState(''); // 'accept' or 'decline'
    const [submitting, setSubmitting] = useState(false);

    const farmerId = auth.currentUser?.uid;

    useEffect(() => {
        if (!farmerId) return;

        // Load farmer profile to get name for response
        const fetchProfile = async () => {
            const docRef = doc(db, 'users', farmerId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setFarmerProfile(docSnap.data());
            }
        };
        fetchProfile();

        // Subscribe to requests targeting this farmer
        const unsub = subscribeToFarmerRequests(farmerId, (data) => {
            setRequests(data);
            setLoading(false);
        });

        return () => unsub();
    }, [farmerId]);

    const handleActionClick = (req, status) => {
        setRespondingTo(req);
        setActionStatus(status);
        setResponseMessage('');
    };

    const handleResponseSubmit = async () => {
        if (!respondingTo || !farmerId) return;
        setSubmitting(true);

        const farmerName = farmerProfile?.fullName || farmerProfile?.businessName || farmerProfile?.contactPersonName || 'Unknown Farmer';
        const status = actionStatus === 'accept' ? 'accepted' : 'declined';

        const success = await respondToProductRequest(respondingTo.id, farmerId, farmerName, status, responseMessage);

        if (success) {
            setRequests(prev => prev.map(req => {
                if (req.id === respondingTo.id) {
                    const newResponses = { ...req.responses };
                    newResponses[farmerId] = {
                        farmerName,
                        status: status === 'accept' ? 'accepted' : 'declined',
                        message: responseMessage,
                        updatedAt: new Date().toISOString()
                    };
                    return { ...req, responses: newResponses };
                }
                return req;
            }));
        }

        setRespondingTo(null);
        setSubmitting(false);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#115e59' }}>Loading requests...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{
                padding: '32px',
                background: 'linear-gradient(135deg, #115e59, #134e4a)',
                borderRadius: '16px',
                color: '#ffffff'
            }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>
                    <FileText size={32} /> {t('farmer.requests.title') || 'Incoming Product Requests'}
                </h1>
                <p style={{ fontSize: '16px', color: '#ccfbf1', margin: 0 }}>
                    {t('farmer.requests.subtitle') || 'Respond to requests from customers looking for products you can supply'}
                </p>
            </div>

            {/* Main List */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '20px', color: '#115e59', marginBottom: '20px' }}>{t('farmer.requests.activeRequests') || 'Active Customer Requests'}</h2>
                {requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Package size={64} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>{t('farmer.requests.noRequests') || 'No product requests are currently targeted at you.'}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {requests.map(req => {
                            const myResponse = req.responses?.[farmerId];
                            return (
                                <div key={req.id} style={{
                                    padding: '20px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 4px 0' }}>{req.productName}</h3>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                                {t('farmer.requests.requestedBy') || 'Requested by'} <strong style={{ color: '#115e59' }}>{req.customerName}</strong> {t('farmer.requests.on') || 'on'} {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            {myResponse ? (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '9999px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    backgroundColor: myResponse.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                                                    color: myResponse.status === 'accepted' ? '#065f46' : '#991b1b'
                                                }}>
                                                    {t('farmer.requests.yourResponse') || 'Your response'}: {myResponse.status}
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '9999px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e'
                                                }}>
                                                    {t('farmer.requests.pendingResponse') || 'Pending Response'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#374151' }}>
                                        <p style={{ margin: '0 0 8px 0' }}><strong>{t('farmer.requests.quantityNeeded') || 'Quantity Needed'}:</strong> {req.quantity || 'N/A'}</p>
                                        <p style={{ margin: 0 }}><strong>{t('farmer.requests.description') || 'Description'}:</strong> {req.description || t('farmer.requests.noDescription') || 'No description provided.'}</p>
                                    </div>

                                    {!myResponse && (
                                        <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end' }}>
                                            <button
                                                onClick={() => handleActionClick(req, 'accept')}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#16a34a',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Check size={16} /> {t('farmer.requests.acceptRequest') || 'Accept Request'}
                                            </button>
                                            <button
                                                onClick={() => handleActionClick(req, 'decline')}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dc2626',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <X size={16} /> {t('farmer.requests.decline') || 'Decline'}
                                            </button>
                                        </div>
                                    )}

                                    {myResponse && myResponse.message && (
                                        <div style={{ fontSize: '13px', color: '#4b5563', fontStyle: 'italic', marginTop: '4px' }}>
                                            {t('farmer.requests.yourMessage') || 'Your message'}: "{myResponse.message}"
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {respondingTo && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '16px'
                }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#115e59', marginBottom: '12px' }}>
                            {actionStatus === 'accept' ? (t('farmer.requests.acceptRequest') || 'Accept Request') : (t('farmer.requests.decline') || 'Decline Request')}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                            {actionStatus === 'accept'
                                ? (t('farmer.requests.acceptPrompt') || `Write a message to ${respondingTo.customerName} about availability, pricing, or delivery details.`)
                                : (t('farmer.requests.declinePrompt') || `Provide a reason to ${respondingTo.customerName} for declining this request.`)}
                        </p>

                        <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            placeholder={t('farmer.requests.typeMessage') || "Type your message here..."}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                resize: 'none',
                                marginBottom: '16px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setRespondingTo(null)}
                                disabled={submitting}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {t('farmer.requests.cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={handleResponseSubmit}
                                disabled={submitting}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: actionStatus === 'accept' ? '#16a34a' : '#dc2626',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                {submitting ? (t('farmer.requests.submitting') || 'Submitting...') : (t('farmer.requests.submit') || 'Submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}