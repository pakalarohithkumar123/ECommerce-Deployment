
import { useState, type FormEvent } from "react";
import type { CartItem, User } from "../App";

interface CheckoutFormProps {
    cart: CartItem[];
    clearCart: () => void;
    user: User | null;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayFailureResponse {
    error?: {
        code?: string;
        description?: string;
        source?: string;
        step?: string;
        reason?: string;
    };
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;

    prefill: {
        name: string;
        email: string;
        contact: string;
    };

    notes: {
        address: string;
    };

    theme: {
        color: string;
    };

    handler: (
        response: RazorpayResponse
    ) => void;

    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayInstance {
    open: () => void;

    on: (
        event: string,
        callback: (
            response: RazorpayFailureResponse
        ) => void
    ) => void;
}

interface OrderResponse {
    success: boolean;
    message: string;
    orderId: number;
    userId: number;
    razorpayOrderId: string;
    paymentId: string;
    customerName: string;
    totalAmount: number;
    orderDate: string;
    estimatedDeliveryDate: string;
    status: string;
}

declare global {
    interface Window {
        Razorpay: new (
            options: RazorpayOptions
        ) => RazorpayInstance;
    }
}

function CheckoutForm({
    cart,
    clearCart,
    user,
}: CheckoutFormProps) {

    const [name, setName] =
        useState(user?.name || "");

    const [email, setEmail] =
        useState(user?.email || "");

    const [phone, setPhone] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [showSuccess, setShowSuccess] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [paymentId, setPaymentId] =
        useState("");

    const [orderDetails, setOrderDetails] =
        useState<OrderResponse | null>(null);

    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
                item.quantity,
        0
    );

    const formattedTotal =
        total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatPrice = (
        price: number
    ) => {

        return Number(price).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    const formatDate = (
        dateString: string
    ) => {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(dateString);

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSubmit = async (
        e: FormEvent
    ) => {

        e.preventDefault();

        if (!user?.userId) {

            alert(
                "User ID is missing. Please sign in again."
            );

            return;
        }

        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;
        }

        if (!name.trim()) {

            alert(
                "Please enter your full name."
            );

            return;
        }

        if (!email.trim()) {

            alert(
                "Please enter your email."
            );

            return;
        }

        if (!phone.trim()) {

            alert(
                "Please enter your phone number."
            );

            return;
        }

        if (!address.trim()) {

            alert(
                "Please enter your delivery address."
            );

            return;
        }

        if (total <= 0) {

            alert(
                "Invalid order amount."
            );

            return;
        }

        setLoading(true);

        try {

            /*
             * STEP 1
             * CREATE RAZORPAY ORDER
             */

            const orderResponse =
                await fetch(
                    `http://localhost:8081/api/payment/create-order?amount=${total}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                    }
                );

            const orderData =
                await orderResponse.json();

            if (!orderResponse.ok ||
                !orderData.success) {

                throw new Error(
                    orderData.message ||
                    "Unable to create payment order"
                );
            }

            /*
             * STEP 2
             * RAZORPAY OPTIONS
             */

            const options:
                RazorpayOptions = {

                key:
                    orderData.keyId ||
                    "rzp_test_TjKuUH5IgYw7cy",

                amount:
                    orderData.amount,

                currency:
                    orderData.currency ||
                    "INR",

                name:
                    "ECommerce",

                description:
                    "ECommerce Order Payment",

                order_id:
                    orderData.orderId,

                prefill: {

                    name:
                        name,

                    email:
                        email,

                    contact:
                        phone,
                },

                notes: {

                    address:
                        address,
                },

                theme: {

                    color:
                        "#4f46e5",
                },

                handler:
                    async function (
                        response:
                            RazorpayResponse
                    ) {

                        try {

                            /*
                             * STEP 3
                             * VERIFY PAYMENT
                             */

                            const verifyResponse =
                                await fetch(
                                    "http://localhost:8081/api/payment/verify",
                                    {
                                        method:
                                            "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json",
                                        },

                                        body:
                                            JSON.stringify(
                                                {
                                                    razorpay_order_id:
                                                        response.razorpay_order_id,

                                                    razorpay_payment_id:
                                                        response.razorpay_payment_id,

                                                    razorpay_signature:
                                                        response.razorpay_signature,

                                                    userId:
                                                        user.userId,

                                                    customerName:
                                                        name,

                                                    email:
                                                        email,

                                                    phone:
                                                        phone,

                                                    address:
                                                        address,

                                                    totalAmount:
                                                        total,
                                                }
                                            ),
                                    }
                                );

                            const verifyData =
                                await verifyResponse.json();

                            if (!verifyResponse.ok ||
                                !verifyData.success) {

                                throw new Error(
                                    verifyData.message ||
                                    "Payment verification failed"
                                );
                            }

                            /*
                             * STEP 4
                             * SHOW ORDER DETAILS
                             */

                            setPaymentId(
                                response.razorpay_payment_id
                            );

                            setOrderDetails(
                                verifyData
                            );

                            setShowSuccess(
                                true
                            );

                            setLoading(
                                false
                            );

                            /*
                             * CLEAR CART AFTER
                             * SUCCESSFUL PAYMENT
                             */

                            clearCart();

                            /*
                             * SCROLL TO ORDER
                             */

                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });

                            /*
                             * REDIRECT TO ACTUAL
                             * HOME PAGE AFTER 5 SECONDS
                             */

                            setTimeout(() => {

                                window.location.href =
                                    "/";

                            }, 5000);

                        } catch (error) {

                            console.error(
                                "Verification error:",
                                error
                            );

                            setLoading(
                                false
                            );

                            alert(
                                error instanceof Error
                                    ? error.message
                                    : "Payment verification failed"
                            );
                        }
                    },

                modal: {

                    ondismiss:
                        () => {

                            setLoading(
                                false
                            );
                        },
                },
            };

            /*
             * CHECK RAZORPAY
             */

            if (!window.Razorpay) {

                throw new Error(
                    "Razorpay is not loaded."
                );
            }

            /*
             * STEP 5
             * OPEN RAZORPAY
             */

            const razorpay =
                new window.Razorpay(
                    options
                );

            /*
             * PAYMENT FAILURE
             */

            razorpay.on(
                "payment.failed",
                function (
                    response:
                        RazorpayFailureResponse
                ) {

                    console.error(
                        "Payment failed:",
                        response
                    );

                    setLoading(
                        false
                    );

                    alert(
                        response.error?.description ||
                        "Payment failed"
                    );
                }
            );

            razorpay.open();

        } catch (error) {

            console.error(
                "Payment error:",
                error
            );

            setLoading(
                false
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Payment failed"
            );
        }
    };

    return (
        <section className="checkout-section">

            <div className="section-heading">

                <div>

                    <span className="section-label">
                        SECURE CHECKOUT
                    </span>

                    <h2>
                        Complete Your Order
                    </h2>

                    <p>
                        Enter your delivery details
                        and complete your payment securely.
                    </p>

                </div>

            </div>

            {showSuccess &&
            orderDetails ? (

                <div className="order-success-card">

                    <div className="order-success-icon">
                        ✓
                    </div>

                    <h2>
                        Order Placed Successfully!
                    </h2>

                    <p className="order-success-text">
                        Thank you,{" "}
                        <strong>
                            {orderDetails.customerName}
                        </strong>
                        . Your payment was successful
                        and your order has been confirmed.
                    </p>

                    <div className="order-details-grid">

                        <div className="order-detail-box">

                            <span>
                                ORDER ID
                            </span>

                            <strong>
                                #{orderDetails.orderId}
                            </strong>

                        </div>

                        <div className="order-detail-box">

                            <span>
                                PAYMENT STATUS
                            </span>

                            <strong className="paid-status">
                                ✓ PAID
                            </strong>

                        </div>

                        <div className="order-detail-box">

                            <span>
                                TOTAL AMOUNT
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    orderDetails.totalAmount
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits:
                                            2,
                                        maximumFractionDigits:
                                            2,
                                    }
                                )}
                            </strong>

                        </div>

                        <div className="order-detail-box">

                            <span>
                                ORDER DATE
                            </span>

                            <strong>
                                {formatDate(
                                    orderDetails.orderDate
                                )}
                            </strong>

                        </div>

                    </div>

                    <div className="delivery-box">

                        <div className="delivery-icon">
                            🚚
                        </div>

                        <div>

                            <span>
                                ESTIMATED DELIVERY
                            </span>

                            <h3>
                                {formatDate(
                                    orderDetails
                                        .estimatedDeliveryDate
                                )}
                            </h3>

                            <p>
                                Your order will be
                                delivered within
                                <strong>
                                    {" "}5 days
                                </strong>
                                .
                            </p>

                        </div>

                    </div>

                    <div className="payment-reference">

                        <span>
                            Payment ID
                        </span>

                        <strong>
                            {paymentId}
                        </strong>

                    </div>

                    <div className="order-thank-you">

                        <span>
                            🎉
                        </span>

                        <div>

                            <strong>
                                Thank you for shopping
                                with ECommerce!
                            </strong>

                            <p>
                                We will process your
                                order and deliver it
                                to your address.
                            </p>

                        </div>

                    </div>

                    <div className="receipt-actions">

                        <button
                            type="button"
                            className="print-receipt-button"
                            onClick={handlePrint}
                        >
                            🖨️ Print Receipt
                        </button>

                        <button
                            type="button"
                            className="pdf-receipt-button"
                            onClick={handlePrint}
                        >
                            📄 Save as PDF
                        </button>

                    </div>

                    <div className="redirect-message">

                        <span>
                            🏠
                        </span>

                        <div>

                            <strong>
                                Returning to Home Page
                            </strong>

                            <p>
                                You will be redirected
                                to the home page in
                                <strong>
                                    {" "}5 seconds...
                                </strong>
                            </p>

                        </div>

                    </div>

                </div>

            ) : (

                <div className="checkout-layout">

                    <div className="checkout-form-card">

                        <div className="checkout-card-title">

                            <div className="summary-icon">
                                🛍️
                            </div>

                            <div>

                                <h3>
                                    Delivery Details
                                </h3>

                                <p>
                                    Where should we
                                    deliver your order?
                                </p>

                            </div>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="input-row">

                                <div className="input-group">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your full name"
                                    />

                                </div>

                                <div className="input-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your email"
                                    />

                                </div>

                            </div>

                            <div className="input-row">

                                <div className="input-group">

                                    <label>
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your phone number"
                                    />

                                </div>

                            </div>

                            <div className="input-group">

                                <label>
                                    Delivery Address
                                </label>

                                <textarea
                                    value={address}
                                    onChange={(e) =>
                                        setAddress(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your complete delivery address"
                                    rows={4}
                                />

                            </div>

                            <button
                                className="pay-button"
                                type="submit"
                                disabled={
                                    loading ||
                                    cart.length === 0
                                }
                            >

                                {loading
                                    ? "Processing..."
                                    : `Pay ₹${formattedTotal}`}

                            </button>

                        </form>

                    </div>

                    <div className="order-summary">

                        <div className="checkout-card-title">

                            <div className="summary-icon">
                                📦
                            </div>

                            <div>

                                <h3>
                                    Order Summary
                                </h3>

                                <p>
                                    Your selected products
                                </p>

                            </div>

                        </div>

                        {cart.length === 0 ? (

                            <div className="no-order">

                                <p>
                                    Your cart is empty.
                                </p>

                            </div>

                        ) : (

                            <>

                                {cart.map(
                                    (item) => (

                                        <div
                                            className="summary-product"
                                            key={
                                                item.productId
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        item.productName
                                                    }
                                                </strong>

                                                <span>
                                                    ×{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                            </div>

                                            <strong>
                                                ₹
                                                {formatPrice(
                                                    Number(
                                                        item.price
                                                    ) *
                                                    item.quantity
                                                )}
                                            </strong>

                                        </div>

                                    )
                                )}

                                <div className="summary-divider" />

                                <div className="grand-total">

                                    <span>
                                        Grand Total
                                    </span>

                                    <strong>
                                        ₹
                                        {
                                            formattedTotal
                                        }
                                    </strong>

                                </div>

                                <div className="delivery-preview">

                                    🚚

                                    <div>

                                        <strong>
                                            Estimated Delivery
                                        </strong>

                                        <span>
                                            Within 5 days
                                        </span>

                                    </div>

                                </div>

                            </>
                        )}

                    </div>

                </div>
            )}

            <style>{`

                .order-success-card {
                    max-width: 900px;
                    margin: 30px auto;
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.10);
                    border: 1px solid #e5e7eb;
                }

                .order-success-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                    border-radius: 50%;
                    background: #dcfce7;
                    color: #16a34a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 42px;
                    font-weight: 800;
                }

                .order-success-card h2 {
                    margin: 0;
                    color: #111827;
                    font-size: 30px;
                    font-weight: 800;
                }

                .order-success-text {
                    margin: 12px auto 30px;
                    max-width: 650px;
                    color: #6b7280;
                    line-height: 1.7;
                }

                .order-details-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(2, 1fr);
                    gap: 15px;
                    text-align: left;
                    margin-bottom: 25px;
                }

                .order-detail-box {
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 14px;
                    padding: 18px;
                }

                .order-detail-box span {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    color: #6b7280;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }

                .order-detail-box strong {
                    color: #111827;
                    font-size: 17px;
                }

                .paid-status {
                    color: #16a34a !important;
                }

                .delivery-box {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    text-align: left;
                    padding: 22px;
                    border-radius: 18px;
                    background: #eef2ff;
                    border: 1px solid #c7d2fe;
                    margin-bottom: 20px;
                }

                .delivery-icon {
                    width: 58px;
                    height: 58px;
                    flex-shrink: 0;
                    border-radius: 16px;
                    background: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                .delivery-box span {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: #6366f1;
                }

                .delivery-box h3 {
                    margin: 5px 0;
                    color: #312e81;
                    font-size: 22px;
                }

                .delivery-box p {
                    margin: 0;
                    color: #6b7280;
                }

                .payment-reference {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    padding: 14px 18px;
                    background: #f9fafb;
                    border-radius: 12px;
                    text-align: left;
                    margin-bottom: 20px;
                }

                .payment-reference span {
                    color: #6b7280;
                    font-size: 13px;
                }

                .payment-reference strong {
                    color: #374151;
                    font-size: 12px;
                    word-break: break-all;
                }

                .order-thank-you {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-align: left;
                    padding: 18px;
                    background: #fff7ed;
                    border-radius: 14px;
                    border: 1px solid #fed7aa;
                }

                .order-thank-you > span {
                    font-size: 28px;
                }

                .order-thank-you strong {
                    color: #9a3412;
                }

                .order-thank-you p {
                    margin: 4px 0 0;
                    color: #78716c;
                    font-size: 13px;
                }

                .redirect-message {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-align: left;
                    margin-top: 20px;
                    padding: 16px 18px;
                    border-radius: 14px;
                    background: #f5f3ff;
                    border: 1px solid #ddd6fe;
                }

                .redirect-message > span {
                    font-size: 25px;
                }

                .redirect-message strong {
                    color: #4f46e5;
                }

                .redirect-message p {
                    margin: 4px 0 0;
                    color: #6b7280;
                    font-size: 13px;
                }

                .receipt-actions {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 25px;
                    margin-bottom: 20px;
                }

                .print-receipt-button,
                .pdf-receipt-button {
                    border: none;
                    padding: 13px 22px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .print-receipt-button {
                    background: #111827;
                    color: white;
                }

                .pdf-receipt-button {
                    background: #4f46e5;
                    color: white;
                }

                .print-receipt-button:hover,
                .pdf-receipt-button:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }

                @media print {

                    body * {
                        visibility: hidden;
                    }

                    .order-success-card,
                    .order-success-card * {
                        visibility: visible;
                    }

                    .order-success-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: none;
                        margin: 0;
                        padding: 25px;
                        box-shadow: none;
                        border: none;
                    }

                    .receipt-actions,
                    .redirect-message {
                        display: none !important;
                    }

                    .checkout-section {
                        background: white !important;
                        padding: 0 !important;
                    }

                    .order-success-icon,
                    .paid-status,
                    .delivery-icon {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }

                .delivery-preview {
                    margin-top: 20px;
                    padding: 14px;
                    border-radius: 12px;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #166534;
                }

                .delivery-preview > div {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .delivery-preview span {
                    font-size: 13px;
                    color: #4b5563;
                }

                @media (max-width: 700px) {

                    .order-success-card {
                        padding: 25px 18px;
                        margin: 20px 10px;
                    }

                    .order-success-card h2 {
                        font-size: 24px;
                    }

                    .order-details-grid {
                        grid-template-columns: 1fr;
                    }

                    .delivery-box {
                        align-items: flex-start;
                    }

                    .payment-reference {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .redirect-message {
                        align-items: flex-start;
                    }
                }

            `}</style>

        </section>
    );
}

export default CheckoutForm;

