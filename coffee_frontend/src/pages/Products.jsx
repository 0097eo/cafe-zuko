import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    vendor: '',
    roast: '',
    search: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = '/api/products/products/?';
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.vendor) params.append('vendor', filters.vendor);
        if (filters.roast) params.append('roast', filters.roast);
        
        const response = await fetch(url + params.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    product.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-white text-4xl font-bold mb-4">Our Coffee Selection</h1>
          <p className="text-gray-400 text-xl">Discover our carefully curated coffee collection</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search coffee..."
                className="w-full bg-gray-900 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-amber-600 focus:outline-none"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            {/* Roast Type Filter */}
            <select
              className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-amber-600 focus:outline-none"
              value={filters.roast}
              onChange={(e) => setFilters(prev => ({ ...prev, roast: e.target.value }))}
            >
              <option value="*">All Roast Types</option>
              <option value="LIGHT">Light</option>
              <option value="MEDIUM">Medium</option>
              <option value="DARK">Dark</option>
            </select>

            {/* Category Filter */}
            <select
              className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-amber-600 focus:outline-none"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="*">All Categories</option>
              <option value="4">Single Origin</option>
              <option value="3">Blend</option>
              <option value="2">Espresso</option>
              <option value="1">Capuccino</option>
            </select>

            {/* Vendor Filter */}
            <select
              className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-amber-600 focus:outline-none"
              value={filters.vendor}
              onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
            >
              <option value="">All Vendors</option>
              <option value="1">Vendor 1</option>
              <option value="2">Vendor 2</option>
              <option value="3">Vendor 3</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-white text-center text-xl">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-900 rounded-xl shadow-xl hover:shadow-2xl transition-shadow">
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

                <div className="p-4">
                  <h3 className="text-white text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">Origin: {product.origin}</p>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
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
        )}

        {/* No Results Message */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-white text-center mt-8">
            <p className="text-xl">No products found matching your criteria</p>
            <button
              className="mt-4 text-amber-600 hover:text-amber-500"
              onClick={() => setFilters({ category: '', vendor: '', roast: '', search: '' })}
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductsPage;