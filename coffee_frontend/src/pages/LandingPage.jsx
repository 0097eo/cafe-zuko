import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeroImage from '../assets/coffee.jpg';
import PropTypes from 'prop-types';


const ProductShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  image_url: PropTypes.string.isRequired,
  roast_type: PropTypes.string.isRequired,
  origin: PropTypes.string.isRequired,
  stock: PropTypes.number.isRequired,
  description: PropTypes.string,
  alt_text: PropTypes.string
});

const ProductCarousel = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState([]);

  useEffect(() => {
    // Show 3 products at a time on large screens, 1 on smaller screens
    const updateVisibleProducts = () => {
      const productsToShow = [];
      const productsToShowCount = window.innerWidth >= 1024 ? 3 : 1; // Adjust based on screen size

      for (let i = 0; i < productsToShowCount; i++) {
        const index = (currentIndex + i) % products.length;
        productsToShow.push(products[index]);
      }
      setVisibleProducts(productsToShow);
    };

    updateVisibleProducts();

    // Resize listener to update visible products on screen size change
    const handleResize = () => updateVisibleProducts();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentIndex, products]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative px-4 sm:px-8 lg:px-12">
      <h2 className="text-white text-3xl font-bold mb-8 text-center">Popular Right Now</h2>
      <div className="flex items-center justify-between relative">
        <button
          onClick={prevSlide}
          className="absolute left-0 z-10 text-amber-600 hover:text-amber-500 transition-colors"
          aria-label="Previous product"
        >
          <ChevronLeft size={40} />
        </button>

        <div className="flex justify-center gap-6 overflow-hidden w-full">
          {visibleProducts.map((product) => (
            <div key={product.id} className="transform transition-all duration-500 w-full max-w-xs sm:max-w-sm lg:max-w-md">
              <div className="bg-gray-900 p-0 rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
                <div className="relative mb-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                    loading="lazy"
                  />
                  <span className="absolute top-2 right-2 bg-amber-600 text-white px-2 py-1 rounded text-sm">
                    {product.roast_type}
                  </span>
                </div>

                <h3 className="text-white text-xl font-semibold mb-2 pl-3">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 pl-3">Origin: {product.origin}</p>
                <div className="flex justify-between items-center p-3">
                  <span className="text-amber-600 text-xl font-bold">Ksh {product.price}</span>
                  <div className="flex gap-2">
                    {product.stock > 0 ? (
                      <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition-colors">
                        Add to Cart
                      </button>
                    ) : (
                      <span className="text-red-500 text-sm">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-0 z-10 text-amber-600 hover:text-amber-500 transition-colors"
          aria-label="Next product"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
};

ProductCarousel.propTypes = {
  products: PropTypes.arrayOf(ProductShape).isRequired,
};

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/products/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          {/* Text Content */}
          <div className="max-w-xl">
            <h1 className="text-white text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Experience 
              <br />
              extraordinary coffee
            </h1>
            <p className="text-gray-400 text-xl mb-8">
              Choose and taste delicious coffee from the best beans.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-500 transition-colors">
                Order Now
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition-colors">
                Learn About Us
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative w-full h-full min-h-[400px] lg:min-h-[500px]">
            <div className="absolute -inset-4 bg-amber-600/20 rounded-full blur-xl"></div>
            <div className="relative h-full w-full">
              <img
                src={HeroImage}
                alt="Coffee cup with steam"
                className="rounded-lg object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Popular Products Section */}
        {loading ? (
          <div className="text-white text-center">Loading products...</div>
        ) : (
          <ProductCarousel products={products} />
        )}
      </main>
    </div>
  );
};

export default LandingPage;
