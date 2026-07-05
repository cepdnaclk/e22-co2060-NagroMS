import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  MapPin,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Star,
  X,
  AlertTriangle
} from 'lucide-react';
import { db } from '../../../../../utils/firebase.js';
import { 
  collection, addDoc, getDocs, query, 
  where, doc, updateDoc, onSnapshot 
} from 'firebase/firestore';

// ─── ENHANCED ORDERS SECTION ─────────────────────────────────────────────────
export function EnhancedOrdersSection({ pastOrders, uid }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviews, setReviews] = useState({}); // { orderId: review }
  const [orders, setOrders] = useState(pastOrders);

  // ── REAL-TIME ORDER STATUS via onSnapshot ──────────────────
  useEffect(() => {
    if (!uid) {
      setOrders(pastOrders);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Use live orders if available, otherwise fallback to pastOrders
      setOrders(liveOrders.length > 0 ? liveOrders : pastOrders);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, [uid]);

  // ── LOAD EXISTING REVIEWS ──────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const loadReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('customerId', '==', uid)
        );
        const snapshot = await getDocs(q);
        const reviewMap = {};
        snapshot.docs.forEach(doc => {
          reviewMap[doc.data().orderId] = { id: doc.id, ...doc.data() };
        });
        setReviews(reviewMap);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    loadReviews();
  }, [uid]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in transit':
      case 'out for delivery':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'packed':
      case 'confirmed':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'in transit':
      case 'out for delivery':
        return <Truck className="w-5 h-5" />;
      case 'packed':
      case 'confirmed':
        return <Package className="w-5 h-5" />;
      case 'cancelled':
        return <X className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      // Update local state immediately
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      setShowCancelModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
      // For mock orders (no Firestore doc), just update locally
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      setShowCancelModal(false);
      setSelectedOrder(null);
    }
  };

  const handleReviewSubmitted = (orderId, review) => {
    setReviews(prev => ({ ...prev, [orderId]: review }));
    setShowReviewModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">📦 My Orders</h1>
        <p className="text-blue-100 text-lg">Track and manage your orders in real-time</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-foreground font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Start shopping to see your orders here!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl text-primary font-bold mb-1">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Placed on {new Date(order.date || order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>

                {/* Order Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Items</p>
                    <p className="text-lg font-semibold text-foreground">{order.items?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-primary">LKR {order.total?.toLocaleString() || order.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <p className="text-sm font-semibold text-foreground">{order.paymentMethod}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Est. Delivery</p>
                    <p className="text-sm font-semibold text-foreground">
                      {order.estimatedDelivery 
                        ? new Date(order.estimatedDelivery).toLocaleDateString() 
                        : '2-3 days'}
                    </p>
                  </div>
                </div>

                {/* ── ACTION BUTTONS ROW ── */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {/* Cancel Button - only for pending/confirmed orders */}
                  {(order.status?.toLowerCase() === 'pending' || 
                    order.status?.toLowerCase() === 'confirmed') && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel Order
                    </button>
                  )}

                  {/* Leave Review - only for delivered orders without a review */}
                  {order.status?.toLowerCase() === 'delivered' && !reviews[order.id] && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowReviewModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors font-medium flex items-center gap-2 text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Leave Review
                    </button>
                  )}

                  {/* Review submitted badge */}
                  {order.status?.toLowerCase() === 'delivered' && reviews[order.id] && (
                    <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Review Submitted ⭐ {reviews[order.id].rating}/5
                    </div>
                  )}

                  {/* Cancelled badge */}
                  {order.status?.toLowerCase() === 'cancelled' && (
                    <div className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium flex items-center gap-2 text-sm">
                      <X className="w-4 h-4" />
                      Order Cancelled
                    </div>
                  )}
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full mt-4 py-2 text-primary hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {expandedOrder === order.id ? (
                    <><ChevronUp className="w-5 h-5" />Hide Details</>
                  ) : (
                    <><ChevronDown className="w-5 h-5" />View Details & Track Order</>
                  )}
                </button>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="p-6 bg-gray-50 space-y-6">

                  {/* Order Tracking Timeline */}
                  {order.trackingHistory && order.trackingHistory.length > 0 && (
                    <div>
                      <h4 className="text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Order Tracking
                      </h4>
                      <div className="bg-white rounded-xl p-6 border-2 border-green-100">
                        <div className="space-y-4">
                          {order.trackingHistory.map((track, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  track.completed 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-400'
                                }`}>
                                  {track.completed 
                                    ? <CheckCircle className="w-5 h-5" /> 
                                    : <Clock className="w-5 h-5" />}
                                </div>
                                {index < order.trackingHistory.length - 1 && (
                                  <div className={`w-0.5 h-12 ${track.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className={`font-semibold ${track.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {track.status}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{track.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h4 className="text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Items
                    </h4>
                    <div className="bg-white rounded-xl p-4 space-y-3 border-2 border-green-100">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-foreground font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} {item.unit} × LKR {item.price}
                            </p>
                          </div>
                          <p className="text-lg text-primary font-semibold">
                            LKR {(item.quantity * item.price).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div>
                      <h4 className="text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Delivery Address
                      </h4>
                      <div className="bg-white rounded-xl p-4 border-2 border-green-100">
                        <p className="text-foreground">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  <div>
                    <h4 className="text-lg text-primary font-semibold mb-4">💳 Payment Details</h4>
                    <div className="bg-white rounded-xl p-4 space-y-2 border-2 border-green-100">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="text-foreground font-medium">
                          LKR {((order.total || order.totalAmount) - (order.deliveryFee || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span className="text-foreground font-medium">
                          {(order.deliveryFee === 0) ? 'FREE' : `LKR ${(order.deliveryFee || 0).toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-foreground font-bold">Total:</span>
                        <span className="text-primary font-bold text-lg">
                          LKR {(order.total || order.totalAmount)?.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-muted-foreground">
                          Payment Method: <span className="font-semibold text-foreground">{order.paymentMethod}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submitted Review Display */}
                  {reviews[order.id] && (
                    <div>
                      <h4 className="text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Your Review
                      </h4>
                      <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-100">
                        <div className="flex gap-1 mb-2">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-5 h-5 ${star <= reviews[order.id].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-foreground">{reviews[order.id].comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Farmer
                    </button>
                    <button className="flex-1 px-4 py-3 bg-gray-100 text-foreground rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Download Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── REVIEW MODAL ── */}
      {showReviewModal && selectedOrder && (
        <ReviewModal
          order={selectedOrder}
          uid={uid}
          onSubmitted={handleReviewSubmitted}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* ── CANCEL CONFIRMATION MODAL ── */}
      {showCancelModal && selectedOrder && (
        <CancelModal
          order={selectedOrder}
          onConfirm={() => handleCancelOrder(selectedOrder.id)}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// ─── REVIEW MODAL ─────────────────────────────────────────────────────────────
function ReviewModal({ order, uid, onSubmitted, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      const reviewData = {
        orderId: order.id,
        customerId: uid,
        customerName: order.profile?.name || 'Customer',
        rating,
        comment,
        productIds: order.items?.map(i => i.productId) || [],
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      onSubmitted(order.id, reviewData);
    } catch (error) {
      console.error('Error submitting review:', error);
      // Still show success for demo purposes
      onSubmitted(order.id, { rating, comment, orderId: order.id });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl text-primary font-bold">⭐ Leave a Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Reviewing order</p>
            <p className="font-bold text-primary">#{order.id}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {order.items?.map(i => i.name).join(', ')}
            </p>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              How would you rate this order? *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-yellow-600 mt-2 font-medium">
                {rating === 1 && '😞 Poor'}
                {rating === 2 && '😐 Fair'}
                {rating === 3 && '🙂 Good'}
                {rating === 4 && '😊 Very Good'}
                {rating === 5 && '🤩 Excellent!'}
              </p>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with the products and delivery..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CANCEL CONFIRMATION MODAL ────────────────────────────────────────────────
function CancelModal({ order, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl text-red-600 font-bold">Cancel Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Are you sure?</p>
              <p className="text-sm text-red-600 mt-1">
                This will cancel order <strong>#{order.id}</strong>. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Order items:</p>
            {order.items?.map((item, index) => (
              <p key={index} className="text-sm text-foreground">
                • {item.name} × {item.quantity} {item.unit}
              </p>
            ))}
            <p className="text-primary font-bold mt-2">
              Total: LKR {(order.total || order.totalAmount)?.toLocaleString()}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Yes, Cancel Order
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Keep Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
