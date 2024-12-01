import { useEffect, useRef, useState } from "react";
import { useToast } from "../common/useToast";
import { UseCreateData, UseGetData } from "../../services/service_api";
import { useNavigate } from "react-router-dom";

const CartBox = ({ viewCart, setViewCart, products, userData }) => {
  const navigate = useNavigate();
  if (!userData && viewCart) {
    navigate("/auth/login");
  }
  const cartBox = useRef(null);
  const { showToast, ToastComponent } = useToast();
  const [cartSelected, setCartSelected] = useState({
    color: "",
    size: "",
    variant: "",
    quantity: 1,
    total: 0,
    productVariant: "",
    product_id: "",
  });

  const [firstSelected, setFirstSelected] = useState({
    name: "",
    value: "",
  }); // tempat menyimpan pilihan pertama pada variant sebagai patokan variant lainnya

  const [hargaVariant, setHargaVariant] = useState(0); // menyimpan harga dari variasi yang dipilih

  const [filterHargaVariant, setFilterHargaVariant] = useState({
    size: "",
    variant: "",
    color: "",
  }); //tempat menyimpan variasi yang dipilih

  const [discount, setDiscount] = useState(0); //tempat menyimpan discount dari categories

  // Extract Product Variant
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [variants, setVariants] = useState([]);

  const [variantCheckData, setVariantCheckData] = useState({
    color: [],
    variant: [],
    size: [],
  }); // tempat menyimpan ketersediaan variasi berdasarkan variasi pertama

  useEffect(() => {
    if (cartBox.current) {
      if (viewCart) {
        cartBox.current.style.display = "flex";
      } else {
        cartBox.current.style.display = "none";
      }
    }
  }, [viewCart]);

  // format meubah angka ke format rupiah
  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Fungsi untuk mendapatkan harga dari products_variant baik range (~) atau satuan
  const changeharga = (product_variant, type = "discount") => {
    if (
      products &&
      products?.product_variants &&
      products?.product_variants.length > 0
    ) {
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
        let dicount =
          (parseInt(prices[0]) * parseInt(getProductDiscount())) / 100;
        let newPrice = parseInt(prices[0]) - parseInt(dicount);

        if (type == "real") {
          return formatRupiah(prices[0]);
        } else {
          return formatRupiah(newPrice);
        }
      } else if (prices.length === 1) {
        let dicount =
          (parseInt(lowestPrice) * parseInt(getProductDiscount())) / 100;
        let newPrice = parseInt(lowestPrice) - parseInt(dicount);

        if (type == "real") {
          return formatRupiah(lowestPrice);
        } else {
          return formatRupiah(newPrice);
        }
      } else {
        return `${formatRupiah(lowestPrice)} ~ ${formatRupiah(highestPrice)}`;
      }
    }
  };

  // Mengatur harga produk dengan discount dengan inputan angka
  const changeSingleHarga = (harga, type = "discount") => {
    let dicount = (parseInt(harga) * parseInt(getProductDiscount())) / 100;
    let newPrice = parseInt(harga) - parseInt(dicount);

    if (type == "real") {
      return formatRupiah(harga);
    } else {
      return formatRupiah(newPrice);
    }
  };

  // Fungsi untuk mendapatkan diskon dari categori
  function getProductDiscount() {
    // Check categories
    if (products.categories && products.categories.length > 0) {
      // First check for categories with discount
      const discountCategory = products.categories.find(
        (category) => category.discount_categories > 0
      );

      if (discountCategory) {
        return `${discountCategory.discount_categories}`;
      }

      return 0;
    }
    return 0;
  }

  // Fungsi untuk mengambil size, color, dan variant dari product_variants
  const extractVariants = (product_variants) => {
    const sizeSet = new Set();
    const colorSet = new Set();
    const variantSet = new Set();

    // Loop melalui setiap variant dan ambil value unik untuk size, color, dan variant
    product_variants.forEach((variant) => {
      if (variant.Size) sizeSet.add(variant.Size);
      if (variant.Color) colorSet.add(variant.Color);
      if (variant.Variant) variantSet.add(variant.Variant);
    });

    // Set ke state
    setSizes([...sizeSet]);
    setColors([...colorSet]);
    setVariants([...variantSet]);
  };

  // fungsi buat ngecek ketersediaan variant berdasarkan firstSelected
  function variantCheck() {
    // Objek hasil yang akan menyimpan variant dan size
    let result = {
      variant: [],
      size: [],
      color: [],
    };

    // Filter product variants berdasarkan firstSelected
    products.product_variants.forEach((item) => {
      if (firstSelected.name == "Color" && item.Color === firstSelected.value) {
        if (item.Variant && !result.variant.includes(item.Variant)) {
          result.variant.push(item.Variant); // Tambah variant ke result jika belum ada
        }

        if (item.Size && !result.size.includes(item.Size)) {
          result.size.push(item.Size); // Tambah size ke result jika belum ada
        }
        if (item.Color && !result.color.includes(item.Color)) {
          result.color.push(item.Color); // Tambah color ke result jika belum ada
        }
      }

      if (firstSelected.name == "Size" && item.Size === firstSelected.value) {
        if (item.Variant && !result.variant.includes(item.Variant)) {
          result.variant.push(item.Variant); // Tambah variant ke result jika belum ada
        }
        if (item.Color && !result.color.includes(item.Color)) {
          result.color.push(item.Color); // Tambah color ke result jika belum ada
        }
        if (item.Size && !result.size.includes(item.Size)) {
          result.size.push(item.Size); // Tambah size ke result jika belum ada
        }
      }

      if (
        firstSelected.name == "Variant" &&
        item.Variant === firstSelected.value
      ) {
        if (item.Variant && !result.variant.includes(item.Variant)) {
          result.variant.push(item.Variant); // Tambah variant ke result jika belum ada
        }
        if (item.Color && !result.color.includes(item.Color)) {
          result.color.push(item.Color); // Tambah color ke result jika belum ada
        }
        if (item.Size && !result.size.includes(item.Size)) {
          result.size.push(item.Size); // Tambah size ke result jika belum ada
        }
      }
    });

    return result;
  }

  // Fungsi untuk menghitung rating keseluruhan
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

  const { averageRating } = calculateProductRating(products?.reviews);

  const handleCheckout = async () => {
    let order_item = {
      data: {
        quantity: cartSelected.quantity,
        product_variant: [cartSelected.productVariant],
        order: [],
      },
    };

    const cekAlreadyData = await UseGetData(
      `api/orders?filters[user_id][username][$eq]=${userData.username}&filters[order_items][product_variant][product_id][documentId][$in]=${cartSelected.product_id}&populate[order_items][populate][product_variant][populate]=*`
    );

    let product_variantCek = true;
    let statusOrder = "";

    cekAlreadyData.data.data.map((order) => {
      statusOrder = order.order_status;
      order.order_items.map((order_item) => {
        if (
          order_item.product_variant == null ||
          order_item.product_variant == undefined ||
          order_item.product_variant == ""
        ) {
          product_variantCek = false;
        }
      });
    });

    let postOrderItem;
    if (product_variantCek) {
      if (cekAlreadyData.data.data.length > 0 && statusOrder == "Cart") {
        order_item.data.order.push(cekAlreadyData.data.data[0].documentId);
        postOrderItem = await UseCreateData("api/order-items", order_item);
        if (postOrderItem.status == "success") {
          showToast("Item berhasil ditambah di keranjang", "success", 2000);
        } else {
          showToast(postOrder.message, "danger", 5000);
        }
      } else {
        postOrderItem = await UseCreateData("api/order-items", order_item);
        if (postOrderItem.status == "success") {
          const idOrderItem = postOrderItem.data.data.documentId;
          const order = {
            data: {
              user_id: [userData.id],
              order_status: "Cart",
              order_items: [idOrderItem],
              total_price: cartSelected.total,
              payment_status: "Unpaid",
              discount: [],
            },
          };

          const postOrder = await UseCreateData("api/orders", order);
          if (postOrder.status == "success") {
            showToast("Produk berhasil ditambah di keranjang", "success", 2000);
          } else {
            showToast(postOrder.message, "danger", 5000);
          }
        } else {
          showToast(postOrderItem.message, "danger", 5000);
        }
      }
    } else {
      showToast(
        "Terdapat produk yang tidak valid!! harap pilih produk atau variasi produk lainnya.",
        "danger",
        7000
      );
    }
  };

  // Get data Sekaligus mengembalkan useState ke pengaturan default
  useEffect(() => {
    setFirstSelected({
      name: "",
      value: "",
    });
    setCartSelected({
      color: "",
      quantity: 1,
      size: "",
      total: 0,
      variant: "",
    });

    setVariantCheckData({
      color: [],
      size: [],
      variant: [],
    });
  }, []);

  // Mengatur variant pertama yang dipilih sebagai patokan untuk variant lainnya
  useEffect(() => {
    if (firstSelected.name != "") {
      setVariantCheckData(
        variantCheck(firstSelected.name, firstSelected.value)
      );
    }
  }, [firstSelected]);

  // Mengatur harga berdasarkan variasi yang dipilih
  useEffect(() => {
    if (products.product_variants && products.product_variants.length > 0) {
      // Menyaring produk berdasarkan filter yang dipilih
      const filteredVariants = products.product_variants.filter((item) => {
        const isSizeMatch = filterHargaVariant.size
          ? item.Size === filterHargaVariant.size
          : true;
        const isVariantMatch = filterHargaVariant.variant
          ? item.Variant === filterHargaVariant.variant
          : true;
        const isColorMatch = filterHargaVariant.color
          ? item.Color === filterHargaVariant.color
          : true;

        return isSizeMatch && isVariantMatch && isColorMatch;
      });

      if (filteredVariants.length == 1) {
        setCartSelected((prevState) => ({
          ...prevState,
          productVariant: filteredVariants[0].documentId,
          product_id: products.documentId,
        }));
        setHargaVariant(filteredVariants[0].price);
        let dicount =
          (parseInt(filteredVariants[0].price) *
            parseInt(getProductDiscount())) /
          100;
        let newPrice = parseInt(filteredVariants[0].price) - parseInt(dicount);

        setCartSelected((prevState) => ({
          ...prevState,
          total: parseInt(newPrice),
        }));
      } else {
        setHargaVariant(0);
      }
    }
  }, [filterHargaVariant]);

  useEffect(() => {
    let dicount =
      (parseInt(hargaVariant) * parseInt(getProductDiscount())) / 100;
    let newPrice = parseInt(hargaVariant) - parseInt(dicount);

    const newHarga = newPrice * cartSelected.quantity;
    setCartSelected((prevState) => ({
      ...prevState,
      total: parseInt(newHarga),
    }));
  }, [cartSelected.quantity, hargaVariant]);

  // Set Tubhnail yang tampil di utama
  useEffect(() => {
    setDiscount(parseInt(getProductDiscount()));

    if (products && products.product_variants) {
      extractVariants(products.product_variants);
    }
  }, [products]);
  return (
    <>
      <div
        ref={cartBox}
        className="flex-col justify-between fixed p-4 bg-neutral sm:w-[83%] lg:w-[40%] sm:h-[470px] lg:h-[450px] border top-[50%] left-[0%] -translate-y-[40%] sm:translate-x-[10%] lg:translate-x-[80%] z-10 shadow-custom rounded-md hidden"
      >
        <button
          className="absolute -right-3 -top-3 w-[30px] h-[30px] rounded-full bg-danger text-white"
          onClick={() => {
            setViewCart(false);
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div>
          <p className="text-xl font-bold leading-tight">{products.name}</p>
          <div className="flex xs:flex-col lg:flex-row lg:items-center justify-between">
            <p>
              <span className="mt-2 text-md font-bold">
                {hargaVariant != 0
                  ? changeSingleHarga(hargaVariant)
                  : changeharga(products.product_variants)}
              </span>{" "}
              {!changeharga(products.product_variants)?.includes("~") ? (
                <span className="text-sm opacity-50 line-through">
                  {changeharga(products.product_variants, "real")}
                </span>
              ) : hargaVariant != 0 ? (
                <span className="text-md opacity-50 line-through">
                  {changeSingleHarga(hargaVariant, "real")}
                </span>
              ) : null}
            </p>
            <div className="flex items-center mr-10">
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

          <div>
            {colors && colors.length > 0 ? (
              <div>
                <p className="mt-4 font-semibold text-md">Warna:</p>
                <div className="flex items-center gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      disabled={
                        variantCheckData.color != "" &&
                        firstSelected.name != "Color" &&
                        !variantCheckData?.color.includes(color)
                      }
                      className={`${
                        cartSelected.color == color ? "bg-secondary" : "bg-base"
                      } relative py-1 px-3 rounded-md disabled:hover:bg-base disabled:text-slate-400 hover:bg-secondary font-bold text-sm`}
                      onClick={() => {
                        setFilterHargaVariant((prevState) => ({
                          ...prevState,
                          color: color,
                        }));
                        if (
                          cartSelected.color != "" &&
                          cartSelected.color == color
                        ) {
                          setCartSelected((prevState) => ({
                            ...prevState,
                            color: "",
                          }));
                          setFirstSelected({
                            name: "",
                            value: "",
                          });
                          setVariantCheckData({
                            color: [],
                            size: [],
                            variant: [],
                          });
                          setFilterHargaVariant({
                            color: "",
                            size: "",
                            variant: "",
                          });
                        } else {
                          setCartSelected((prevState) => ({
                            ...prevState,
                            color: color,
                          }));
                          if (
                            firstSelected.name == "" ||
                            (firstSelected.name == "Color" &&
                              firstSelected.value != color)
                          ) {
                            setFirstSelected({
                              name: "Color",
                              value: color,
                            });
                            setCartSelected((prevState) => ({
                              ...prevState,
                              color: color,
                              size: "",
                              variant: "",
                            }));
                          }
                        }
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {sizes && sizes.length > 0 ? (
              <div>
                <p className="mt-4 font-semibold text-md">Ukuran:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {sizes.map((size, index) => (
                    <button
                      key={index}
                      disabled={
                        variantCheckData.size != "" &&
                        firstSelected.name != "Size" &&
                        !variantCheckData?.size.includes(size)
                      }
                      className={`${
                        cartSelected.size == size ? "bg-secondary" : "bg-base"
                      } py-1 px-3 rounded-md disabled:hover:bg-base disabled:text-slate-400 hover:bg-secondary font-bold text-sm`}
                      onClick={() => {
                        setFilterHargaVariant((prevState) => ({
                          ...prevState,
                          size: size,
                        }));
                        if (
                          cartSelected.size != "" &&
                          cartSelected.size == size
                        ) {
                          setCartSelected((prevState) => ({
                            ...prevState,
                            size: "",
                          }));
                          setFirstSelected({
                            name: "",
                            value: "",
                          });
                          setVariantCheckData({
                            color: [],
                            size: [],
                            variant: [],
                          });
                          setFilterHargaVariant({
                            color: "",
                            size: "",
                            variant: "",
                          });
                        } else {
                          setCartSelected((prevState) => ({
                            ...prevState,
                            size: size,
                          }));
                          if (
                            firstSelected.name == "" ||
                            (firstSelected.name == "Size" &&
                              firstSelected.value != size)
                          ) {
                            setFirstSelected({
                              name: "Size",
                              value: size,
                            });
                            setCartSelected((prevState) => ({
                              ...prevState,
                              color: "",
                              size: size,
                              variant: "",
                            }));
                          }
                        }
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {variants && variants.length > 0 ? (
              <div>
                <p className="mt-4 font-semibold text-md">Varian:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {variants.map((variant, index) => (
                    <button
                      disabled={
                        variantCheckData.variant != "" &&
                        firstSelected.name != "Variant" &&
                        !variantCheckData?.variant.includes(variant)
                      }
                      key={index}
                      className={`${
                        cartSelected.variant == variant
                          ? "bg-secondary"
                          : "bg-base"
                      } disabled:hover:bg-base disabled:text-slate-400 py-1 px-3 rounded-md hover:bg-secondary font-bold text-sm`}
                      onClick={() => {
                        setFilterHargaVariant((prevState) => ({
                          ...prevState,
                          variant: variant,
                        }));
                        if (
                          cartSelected.variant != "" &&
                          cartSelected.variant == variant
                        ) {
                          setCartSelected((prevState) => ({
                            ...prevState,
                            variant: "",
                          }));
                          setFirstSelected({
                            name: "",
                            value: "",
                          });
                          setFilterHargaVariant({
                            color: "",
                            size: "",
                            variant: "",
                          });
                        } else {
                          setCartSelected((prevState) => ({
                            ...prevState,
                            variant: variant,
                          }));
                          if (
                            firstSelected.name == "" ||
                            (firstSelected.name == "Variant" &&
                              firstSelected.value != variant)
                          ) {
                            setFirstSelected({
                              name: "Variant",
                              value: variant,
                            });
                            setCartSelected((prevState) => ({
                              ...prevState,
                              color: "",
                              size: "",
                              variant: variant,
                            }));
                          }
                        }
                      }}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="mt-4 font-semibold text-md">Kuantiti:</p>
            <div className="flex">
              <div
                className="bg-base hover:bg-secondary w-[30px] flex justify-center items-center rounded-l-md h-[30px]"
                onClick={() => {
                  setCartSelected((prevState) => ({
                    ...prevState,
                    quantity:
                      prevState.quantity != 1 ? prevState.quantity - 1 : 1,
                  }));
                }}
              >
                <i className="fa-solid fa-minus"></i>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={cartSelected.quantity}
                pattern="[0-9]*"
                className="bg-white text-black w-[60px] outline-none border-base border-2 px-1"
                onChange={(e) => {
                  setCartSelected((prevState) => ({
                    ...prevState,
                    quantity: e.target.value,
                  }));
                }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                // Tambahan untuk mencegah paste text
                onPaste={(e) => {
                  const pasteData = e.clipboardData.getData("text");
                  if (!/^\d+$/.test(pasteData)) {
                    e.preventDefault();
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value == 0 || e.target.value == "") {
                    setCartSelected((prevState) => ({
                      ...prevState,
                      quantity: 1,
                    }));
                    e.target.value = 1;
                  }
                }}
              />
              <div
                className="bg-base hover:bg-secondary w-[30px] flex justify-center items-center rounded-r-md h-[30px]"
                onClick={() => {
                  setCartSelected((prevState) => ({
                    ...prevState,
                    quantity: prevState.quantity + 1,
                  }));
                }}
              >
                <i className="fa-solid fa-plus"></i>
              </div>
            </div>
            <p className="text-md font-bold mt-4">
              <span className="text-accent">Total Produk:</span>{" "}
              <span className="text-secondary">
                {changeSingleHarga(cartSelected.total, "real")}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-1 mt-1">
          <button
            className="bg-accent hover:bg-secondary text-white w-full py-1 rounded-md"
            onClick={handleCheckout}
          >
            <i className="fa-solid fa-cart-shopping"></i> Masukan Keranjang
          </button>
        </div>
      </div>
      {ToastComponent}
    </>
  );
};
export default CartBox;
