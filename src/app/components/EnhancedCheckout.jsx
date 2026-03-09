import { useState } from 'react';
import { 
  MapPin, 
  Check, 
  Upload, 
  CreditCard, 
  Smartphone,
  Wallet,
  ImageIcon,
  X,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

// Enhanced Checkout Section with Payment Receipt Upload
export function EnhancedCheckoutSection({ cart, profile, getCartTotal, getTotalDeliveryFee, setActiveSection, setCart, PRODUCTS }) {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'bank-transfer', 'mobile-payment'
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [contactNumber, setContactNumber] = useState(profile.phone || '');
  const [errors, setErrors] = useState({});

  const deliveryFee = getTotalDeliveryFee();
  const totalAmount = getCartTotal() + deliveryFee;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors({ ...errors, receipt: 'File size must be less than 5MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, receipt: 'Please upload an image file' });
        return;
      }
      setPaymentReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
      setErrors({ ...errors, receipt: '' });
    }
  };

  const handlePlaceOrder = () => {
    // Validation
    const newErrors = {};
    
    if (!contactNumber) {
      newErrors.contact = 'Contact number is required';
    }
    
    if (paymentMethod === 'bank-transfer' && !paymentReceipt) {
      newErrors.receipt = 'Please upload payment receipt for bank transfer';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save order with payment details
    const orderData = {
      cart,
      profile,
      paymentMethod,
      paymentReceipt: paymentReceipt?.name,
      deliveryNotes,
      contactNumber,
      totalAmount,
      deliveryFee,
      orderDate: new Date().toISOString()
    };
    
    console.log('Order placed:', orderData);
    
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setOrderPlaced(false);
      setActiveSection('orders');
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl text-primary font-bold mb-4">Order Placed Successfully!</h2>
          <p className="text-lg text-muted-foreground mb-2">Thank you for your order</p>
          <p className="text-muted-foreground">Your order will be delivered to your address soon.</p>
          <p className="text-sm text-muted-foreground mt-4">You can track your order in the Orders section</p>
        </div>
      </div>
    );
  }

  const isAddressComplete = profile.addressLine1 && profile.city && profile.district && profile.postalCode;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl mb-2">✅ Checkout</h1>
        <p className="text-purple-100 text-lg">Review your order and confirm delivery details</p>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-primary">📍 Delivery Address</h2>
          <button
            onClick={() => setActiveSection('profile')}
            className="text-primary hover:text-green-700 text-sm font-medium"
          >
            Edit Address
          </button>
        </div>
        
        {isAddressComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-foreground font-medium">{profile.name}</p>
                <p className="text-muted-foreground">{profile.phone}</p>
                <p className="text-muted-foreground mt-2">{profile.addressLine1}</p>
                {profile.addressLine2 && <p className="text-muted-foreground">{profile.addressLine2}</p>}
                <p className="text-muted-foreground">{profile.city}, {profile.district}</p>
                <p className="text-muted-foreground">{profile.postalCode}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-800 mb-3">⚠️ Please complete your delivery address to proceed</p>
            <button
              onClick={() => setActiveSection('profile')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Address
            </button>
          </div>
        )}
      </div>

      {/* Contact Number Confirmation */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-4">📞 Contact Number</h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Contact Number for Delivery *
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => {
              setContactNumber(e.target.value);
              setErrors({ ...errors, contact: '' });
            }}
            placeholder="+94 77 123 4567"
            className={`w-full px-4 py-3 bg-gray-50 rounded-lg border-2 ${
              errors.contact ? 'border-red-500' : 'border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-primary text-foreground`}
          />
          {errors.contact && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.contact}
            </p>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">💳 Payment Method</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Cash on Delivery */}
          <button
            onClick={() => {
              setPaymentMethod('cod');
              setErrors({ ...errors, receipt: '' });
            }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'cod'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${paymentMethod === 'cod' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when you receive</p>
              </div>
            </div>
            {paymentMethod === 'cod' && (
              <div className="mt-2 flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </button>

          {/* Bank Transfer */}
          <button
            onClick={() => setPaymentMethod('bank-transfer')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'bank-transfer'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${paymentMethod === 'bank-transfer' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Bank Transfer</p>
                <p className="text-xs text-muted-foreground">Upload receipt required</p>
              </div>
            </div>
            {paymentMethod === 'bank-transfer' && (
              <div className="mt-2 flex items-center gap-2 text-blue-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </button>

          {/* Mobile Payment */}
          <button
            onClick={() => {
              setPaymentMethod('mobile-payment');
              setErrors({ ...errors, receipt: '' });
            }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'mobile-payment'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${paymentMethod === 'mobile-payment' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Mobile Payment</p>
                <p className="text-xs text-muted-foreground">eZ Cash / FriMi</p>
              </div>
            </div>
            {paymentMethod === 'mobile-payment' && (
              <div className="mt-2 flex items-center gap-2 text-purple-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Selected</span>
              </div>
            )}
          </button>
        </div>

        {/* Bank Transfer Details */}
        {paymentMethod === 'bank-transfer' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-foreground mb-3">Bank Account Details</h3>
            <div className="space-y-2 text-sm text-foreground">
              <p><span className="font-medium">Bank:</span> Bank of Ceylon</p>
              <p><span className="font-medium">Account Name:</span> NagroMS Platform</p>
              <p><span className="font-medium">Account Number:</span> 1234567890</p>
              <p><span className="font-medium">Branch:</span> Colombo</p>
            </div>
            <p className="mt-3 text-xs text-blue-700">
              ⚠️ Please upload payment receipt after making the transfer
            </p>
          </div>
        )}

        {/* Mobile Payment Details */}
        {paymentMethod === 'mobile-payment' && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-foreground mb-3">Mobile Payment Details</h3>
            <div className="space-y-2 text-sm text-foreground">
              <p><span className="font-medium">eZ Cash:</span> 0771234567</p>
              <p><span className="font-medium">FriMi:</span> 0771234567</p>
              <p><span className="font-medium">Account Name:</span> NagroMS</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Receipt Upload (for Bank Transfer) */}
      {paymentMethod === 'bank-transfer' && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <h2 className="text-2xl text-primary mb-4">📄 Payment Receipt</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Payment Receipt *
            </label>
            
            {!receiptPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-foreground font-medium mb-1">Click to upload receipt</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                </label>
              </div>
            ) : (
              <div className="relative border-2 border-green-300 rounded-lg p-4 bg-green-50">
                <button
                  onClick={() => {
                    setPaymentReceipt(null);
                    setReceiptPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <img 
                    src={receiptPreview} 
                    alt="Receipt preview" 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Receipt uploaded successfully
                    </p>
                    <p className="text-sm text-muted-foreground">{paymentReceipt?.name}</p>
                  </div>
                </div>
              </div>
            )}
            
            {errors.receipt && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.receipt}
              </p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Delivery Notes */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-4">📝 Delivery Notes (Optional)</h2>
        <textarea
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          placeholder="Any special instructions for delivery? (e.g., Gate code, delivery time preference)"
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
        />
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">🛒 Order Items</h2>
        <div className="space-y-3">
          {cart.map(item => {
            const product = PRODUCTS.find(p => p.id === item.id);
            if (!product) return null;
            
            // Get price based on selected unit
            let itemPrice = product.price;
            if (product.availableUnits && item.unit) {
              const unitInfo = product.availableUnits.find(u => u.unit === item.unit);
              if (unitInfo) itemPrice = unitInfo.price;
            }
            const itemUnit = item.unit || product.unit;
            
            return (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity} {itemUnit}</p>
                  </div>
                </div>
                <p className="text-lg text-primary font-semibold">
                  LKR {(itemPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <h2 className="text-2xl text-primary mb-6">💰 Payment Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground font-medium">LKR {getCartTotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Delivery Fee:</span>
            <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-foreground'}`}>
              {deliveryFee === 0 ? 'FREE' : `LKR ${deliveryFee.toLocaleString()}`}
            </span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-xs text-muted-foreground">* Based on distance from farmer location</p>
          )}
          <div className="border-t-2 border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-2xl">
              <span className="text-foreground font-bold">Total Amount:</span>
              <span className="text-primary font-bold">LKR {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={handlePlaceOrder}
            disabled={!isAddressComplete}
            className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Confirm & Place Order
          </button>
          <button
            onClick={() => setActiveSection('cart')}
            className="w-full px-6 py-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}