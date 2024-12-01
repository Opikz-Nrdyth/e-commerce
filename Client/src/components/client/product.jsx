import { useNavigate } from "react-router-dom";

const ProductItem = ({ setViewCart, item, setItemInCart }) => {
  const navigate = useNavigate();

  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const changeharga = (product_variant) => {
    const prices = product_variant.map((variant) =>
      parseInt(variant.price, 10)
    );

    // Mendapatkan harga terendah dan tertinggi
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);

    // Fungsi untuk mengecek apakah semua harga sama
    const allPricesSame = prices.every((price) => price === prices[0]);

    // Menampilkan harga terendah dan tertinggi
    if (allPricesSame) {
      return formatRupiah(prices[0]);
    } else if (prices.length === 1) {
      return formatRupiah(lowestPrice);
    } else {
      return `${formatRupiah(lowestPrice)} ~ ${formatRupiah(highestPrice)}`;
    }
  };

  function calculateProductRating(reviews) {
    // If no reviews, return 0
    if (!reviews || !reviews.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
      };
    }

    // Sum all ratings
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      averageRating: Number(averageRating.toFixed(1)), // Round to 1 decimal
      totalReviews: reviews.length,
    };
  }

  const { averageRating } = calculateProductRating(item.reviews);

  function getProductLabel(product) {
    // Check categories
    if (product.categories && product.categories.length > 0) {
      // First check for categories with discount
      const discountCategory = product.categories.find(
        (category) => category.discount_categories > 0
      );

      if (discountCategory) {
        return `${discountCategory.discount_categories}% OFF`;
      }

      // Then check for Flash Sale category
      const flashSaleCategory = product.categories.find(
        (category) =>
          category.name.toLowerCase().includes("flash") ||
          category.name.toLowerCase().includes("flash sale") ||
          category.name.toLowerCase().includes("flashsale")
      );

      if (flashSaleCategory) {
        return flashSaleCategory.name;
      }

      // If no special conditions, return the first category name
      return "";
    }

    // Check if product is new (less than a week old)
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const createdDate = new Date(product.createdAt);
    const now = new Date();

    if (now - createdDate < oneWeek) {
      return "New";
    }

    // If no categories exist
    return "";
  }

  return (
    <div className="bg-white h-[425px] rounded-lg overflow-hidden hover:shadow-lg">
      <div
        className="relative"
        onClick={() => {
          navigate(`/produk/${item.documentId}`);
        }}
      >
        <div className="w-[full] h-[250px]">
          <img
            alt="Wooden side table"
            className="w-full h-full aspect-square object-cover object-top"
            src={`${import.meta.env.VITE_BASE_URL}${item?.thumbnail?.[0]?.url}`}
          />
        </div>
        {getProductLabel(item) != "" ? (
          <span className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            {getProductLabel(item)}
          </span>
        ) : null}
      </div>
      <div className="pb-4 pt-2 flex flex-col justify-between border">
        <div className="px-4">
          <h2 className="mt-2 font-bold text-md text-gray-800 line-clamp-2 leading-tight">
            {item.name}
          </h2>
          <span className="text-secondary font-bold text-sm whitespace-nowrap">
            {changeharga(item.product_variants)}
          </span>
          <div className="flex items-center mt-2 h-[10px]">
            {averageRating && averageRating > 0
              ? Array.from({ length: 5 }, (_, index) => (
                  <i
                    key={index}
                    className={`fas fa-star ${
                      index < averageRating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  ></i>
                ))
              : null}
          </div>
        </div>
        <div className="px-2">
          <div className="grid grid-cols-4 gap-2 mt-4">
            <button
              className="text-accent p-1.5 sm:p-2 rounded-md hover:bg-accent hover:text-white"
              onClick={() => {
                setViewCart(true);
                setItemInCart(item);
              }}
            >
              <i className="fas fa-shopping-cart text-sm"></i>
            </button>
            <button
              className="col-span-3 text-white bg-accent hover:bg-secondary px-2 sm:px-3 py-1.5 sm:py-1 rounded-md text-md"
              onClick={() => {
                navigate(`/produk/${item.documentId}`);
              }}
            >
              Beli
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductItem;
