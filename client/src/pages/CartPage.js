import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import { useNavigate } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";
import { serverURL } from "../utilis/serverURL";

const CartPage = () => {
  const navigate = useNavigate();
  //eslint-disable-next-line
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate Total Price

  const totalPrice = () => {
    try {
      let total = 0;
      // eslint-disable-next-line
      cart?.map((item) => {
        total = total + item.price;
      });
      return total.toLocaleString("de-EU", {
        style: "currency",
        currency: "EUR",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Delete  cart item
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  // get payment gateway token
  const getToken = async () => {
    try {
      const { data } = await axios.get(
        // `${process.env.REACT_APP_API}/api/v1/product/braintree/token`,
        `${serverURL}/api/v1/product/braintree/token`
      );
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getToken();
  }, [auth?.token]);

  //handle Payment
  const handlePayment = async () => {
    try {
      setLoading(true);
      const { nonce } = await instance.requestPaymentMethod();
      //eslint-disable-next-line
      const { data } = await axios.post(
        // `${process.env.REACT_APP_API}/api/v1/product/braintree/payment`,
        `${serverURL}/api/v1/product/braintree/payment`,
        {
          nonce,
          cart,
        }
      );
      setLoading(false);
      //NOTE - remove cart from locla storage
      localStorage.removeItem("cart");
      setCart([]);
      navigate("/dashboard/user/orders");
      toast.success(" Payment completed Successfully ");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {`Hello ${auth?.token && auth?.user.name}`}
            </h1>

            <h4 className="text-center ">
              {cart?.length
                ? `You Have ${cart.length} items in your cart ${
                    auth?.token ? "" : "Please login to Checkout"
                  }`
                : "Your Cart is Empty"}
            </h4>
          </div>
        </div>
        <div className="container ">
          <div className="row">
            <div className="col-md-7  p-0 m-0">
              {cart?.map((p) => (
                <div className="row m-2 p-2 card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      // src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                      src={`${serverURL}/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                    />
                  </div>
                  <div className="col-md-4 card-price">
                    <p>{p.name}</p>
                    <p>{p.description.substring(0, 50)}...</p>
                    <p>
                      {/* Price : {p.price} € */}
                      Price:
                      {p.price.toLocaleString("de-EU", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary">
              <h2> Cart Summary</h2>
              <p>Total |Checkout | Payment</p>
              <hr />
              <h4> Total: {totalPrice()} </h4>
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Current Address :</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className=" btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className=" btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  ) : (
                    <button
                      className=" btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Please Login First to checkout
                    </button>
                  )}
                </div>
              )}

              {/* //NOTE - for payment options */}
              <div className="mt-2">
                {!clientToken || !cart?.length ? (
                  ""
                ) : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: {
                          flow: "vault",
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />

                    <button
                      className="btn btn-primary mb-2"
                      onClick={handlePayment}
                      disabled={loading || !instance || !auth?.user?.address}
                    >
                      {loading ? "Processing ...." : "Make Payment"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
