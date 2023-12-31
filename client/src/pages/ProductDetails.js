import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import { useCart } from "../context/cart";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/ProductDetailsStyles.css";
import { serverURL } from "../utilis/serverURL";
const ProductDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useCart();
  //intial product details
  useEffect(() => {
    if (params?.slug) getProduct();
    //eslint-disable-next-line
  }, [params?.slug]);
  //get product
  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        // `${process.env.REACT_APP_API}/api/v1/product/get-product/${params.slug}`
        `${serverURL}/api/v1/product/get-product/${params.slug}`
      );
      setProduct(data?.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
    } catch (error) {
      console.log(error);
    }
  };

  //get similar product
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        // `${process.env.REACT_APP_API}/api/v1/product/related-product/${pid}/${cid}`
        `${serverURL}/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout title={"product-details"}>
      {/* for checking function working or not  */}
      {/* {JSON.stringify(product, null,4)} */}

      <div className="row container product-details">
        <div className="col-md-6 ">
          <img
            // src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${product._id}`}
            src={`${serverURL}/api/v1/product/product-photo/${product._id}`}
            className="card-img-top"
            alt={product.name}
            height="500"
          />
        </div>
        <div className="col-md-6 product-details-info">
          <h1 className="text-center">Product Details</h1>
          <hr />
          <h6>Name : {product.name}</h6>
          <h6>Description : {product.description}</h6>
          <h6>
            Price :
            {product?.price?.toLocaleString("de-EU", {
              style: "currency",
              currency: "EUR",
            })}
          </h6>
          <h6>Category : {product?.category?.name}</h6>
          {/* <button class="btn btn-secondary ms-1">ADD TO CART</button> */}

          {/* <p className="card-text">€ {p.price} </p> */}

          <button
            className="btn btn-secondary ms-1"
            onClick={() => {
              setCart([...cart, product]);
              localStorage.setItem("cart", JSON.stringify([...cart, product]));
              toast.success("Iteam added to Cart");
            }}
          >
            ADD TO CART
          </button>
        </div>
      </div>

      {/* Horizontal row */}
      <hr />
      <div className="row container similar-products">
        {/* for checking function working or not  */}
        {/* {JSON.stringify(relatedProducts, null,4)} */}
        <h4>Similar Products ➡️</h4>
        {relatedProducts.length < 1 && (
          <p className="text-center">No Similar Products Found</p>
        )}
        <div className="d-flex flex-wrap">
          {relatedProducts?.map((p) => (
            <div className="card m-2" style={{ width: "18rem" }}>
              <img
                // src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                src={`${serverURL}/api/v1/product/product-photo/${p._id}`}
                className="card-img-top"
                alt={p.name}
              />
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">
                  {/* substring function used to show maximum 30 character  */}
                  {p.description.substring(0, 30)}...{" "}
                </p>
                {/* <p className="card-text">€ {p.price} </p> */}
                <div className="card-name-price">
                  <h5 className="card-title">{p.name}</h5>
                  <h5 className="card-title card-price">
                    {p.price.toLocaleString("de-EU", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </h5>
                </div>

                {/* <button className="btn btn-secondary ms-1">ADD TO CART</button> */}
                <div className="card-name-price">
                  <button
                    className="btn btn-primary ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>
                  <button
                    className="btn btn-secondary ms-1"
                    onClick={() => {
                      setCart([...cart, p]);
                      localStorage.setItem(
                        "cart",
                        JSON.stringify([...cart, p])
                      );
                      toast.success("Iteam added to Cart");
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
