import { useState } from 'react';
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
  Download
} from 'lucide-react';

// Enhanced Orders Section with Order Tracking
export function EnhancedOrdersSection({ pastOrders }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'in transit':
      case 'out for delivery':
        return <Truck className="w-5 h-5" />;
      case 'packed':
      case 'confirmed':
        return <Package className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">📦 My Orders</h1>
        <p className="text-blue-100 text-lg">Track and manage your orders</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {pastOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-foreground font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Start shopping to see your orders here!</p>
          </div>
        ) : (
          pastOrders.map((order) => (
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
                      Placed on {new Date(order.date).toLocaleDateString('en-US', { 
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
                    <p className="text-lg font-semibold text-foreground">{order.items.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-primary">LKR {order.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <p className="text-sm font-semibold text-foreground">{order.paymentMethod}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                    <p className="text-sm font-semibold text-foreground">
                      {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full mt-4 py-2 text-primary hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {expandedOrder === order.id ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View Details & Track Order
                    </>
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
                              {/* Timeline Line */}
                              <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  track.completed 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-400'
                                }`}>
                                  {track.completed ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <Clock className="w-5 h-5" />
                                  )}
                                </div>
                                {index < order.trackingHistory.length - 1 && (
                                  <div className={`w-0.5 h-12 ${
                                    track.completed ? 'bg-green-500' : 'bg-gray-200'
                                  }`} />
                                )}
                              </div>
                              
                              {/* Timeline Content */}
                              <div className="flex-1 pb-4">
                                <p className={`font-semibold ${
                                  track.completed ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {track.status}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {track.date}
                                </p>
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
                      {order.items.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                        >
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
                  <div>
                    <h4 className="text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Address
                    </h4>
                    <div className="bg-white rounded-xl p-4 border-2 border-green-100">
                      <p className="text-foreground">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="text-lg text-primary font-semibold mb-4">💳 Payment Details</h4>
                    <div className="bg-white rounded-xl p-4 space-y-2 border-2 border-green-100">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="text-foreground font-medium">
                          LKR {(order.total - order.deliveryFee).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee:</span>
                        <span className="text-foreground font-medium">
                          {order.deliveryFee === 0 ? 'FREE' : `LKR ${order.deliveryFee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-foreground font-bold">Total:</span>
                        <span className="text-primary font-bold text-lg">
                          LKR {order.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-muted-foreground">
                          Payment Method: <span className="font-semibold text-foreground">{order.paymentMethod}</span>
                        </p>
                      </div>
                    </div>
                  </div>

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
    </div>
  );
}
