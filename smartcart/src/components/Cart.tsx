import type { CartItem } from "../App";

interface CartProps {
  cart: CartItem[];
  updateQuantity: (
    productId: number,
    quantity: number
  ) => void;
  removeFromCart: (productId: number) => void;
}

function Cart({
  cart,
  updateQuantity,
  removeFromCart,
}: CartProps) {
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <section id="cart" className="cart-section">

      <div className="section-heading">
        <div>
          <span className="section-label">
            YOUR SHOPPING
          </span>

          <h2>Shopping Cart</h2>

          <p>
            Review your selected products.
          </p>
        </div>

        <div className="cart-total-small">
          {cart.length} Items
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h3>Your cart is empty</h3>

          <p>
            Add some products to your cart to continue
            shopping.
          </p>

        </div>
      ) : (
        <div className="cart-box">

          <div className="cart-items">

            {cart.map((item) => (
              <div
                className="cart-item"
                key={item.productId}
              >

                <img
                  src={
                    item.imageUrl ||
                    "https://via.placeholder.com/100x100?text=Product"
                  }
                  alt={item.productName}
                />

                <div className="cart-item-info">
                  <h3>{item.productName}</h3>

                  <p>{item.category}</p>

                  <strong>
                    ₹
                    {Number(item.price).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div className="quantity-control">

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.quantity - 1
                      )
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>

                </div>

                <div className="item-total">
                  ₹
                  {(
                    Number(item.price) * item.quantity
                  ).toLocaleString("en-IN")}
                </div>

                <button
                  className="remove-button"
                  onClick={() =>
                    removeFromCart(item.productId)
                  }
                >
                  🗑
                </button>

              </div>
            ))}

          </div>

          <div className="cart-summary">

            <div>
              <span>Total Items</span>
              <strong>
                {cart.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
              </strong>
            </div>

            <div className="summary-total">
              <span>Cart Total</span>

              <strong>
                ₹{total.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default Cart;