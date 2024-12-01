import { useEffect, useState } from "react";
import Ulasan from "./ulasan";
import { useNavigate, useParams } from "react-router-dom";
import {
  UseCreateData,
  UseGetData,
  UseUpdateData,
} from "../../services/service_api";
import { useToast } from "../common/useToast";

const DetailProduk = ({ userData }) => {
  const navigate = useNavigate();
  const [viewBeli, setViewBeli] = useState("produk"); // mengatur tampilan detail produk
  const [products, setProducts] = useState({}); // tempat menyimpan data produk berdasarkan id
  const [cartSelected, setCartSelected] = useState({
    color: "",
    size: "",
    variant: "",
    quantity: 1,
    total: 0,
    productVariant: "",
    product_id: "",
  }); // tempat menyimpan pilihan variasi dan harga pada detail produk

  const { showToast, ToastComponent } = useToast();

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

  const [thubnail, setThubnail] = useState(null); //tempat menyimpan foto utama
  const path = useParams();
  const productId = path["*"];

  // mengambil data produk berdasarkan id dari server
  const FetchData = async () => {
    const { data } = await UseGetData(
      `api/products/${productId}?populate[reviews][populate]=*&populate[thumbnail]=*&populate[product_variants]=*&populate[categories]=*`
    );
    setProducts(data.data);
  };

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
      const discountCategories = products.categories?.map(
        (category) => category.discount_categories
      );

      const maxDiscount = Math.max(...discountCategories);

      return maxDiscount;
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

  const handleCheckout = async (status) => {
    if (!userData) {
      navigate("/auth/login");
      return;
    }

    let produkSelectedCheck = true;
    if (variantCheck().variant.length > 0) {
      if (cartSelected.variant == "") {
        produkSelectedCheck = false;
      }
    }
    if (variantCheck().color.length > 0) {
      if (cartSelected.color == "") {
        produkSelectedCheck = false;
      }
    }
    if (variantCheck().size.length > 0) {
      if (cartSelected.size == "") {
        produkSelectedCheck = false;
      }
    }

    if (
      cartSelected.color == "" &&
      cartSelected.size == "" &&
      cartSelected.variant == ""
    ) {
      produkSelectedCheck = false;
    }

    if (!produkSelectedCheck) {
      showToast("Pilih variasi produk", "warning", 5000);
      return;
    }

    if (
      !cartSelected.productVariant ||
      cartSelected.productVariant.length == 0
    ) {
      showToast("Pilih variasi produk", "warning", 5000);
      return;
    }
    let order_item = {
      data: {
        quantity: cartSelected.quantity,
        product_variant: {
          connect: [cartSelected.productVariant],
        },
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
        const idOrder = cekAlreadyData.data.data[0].documentId;
        postOrderItem = await UseCreateData("api/order-items", order_item);
        if (postOrderItem.status == "success") {
          if (status == "Cart") {
            showToast("Item berhasil ditambah di keranjang", "success", 2000);
          } else {
            navigate(`/checkout/${idOrder}`);
          }
        } else {
          showToast(postOrder.message, "danger", 5000);
        }
      } else {
        postOrderItem = await UseCreateData("api/order-items", order_item);
        if (postOrderItem.status == "success") {
          const idOrderItem = postOrderItem.data.data.documentId;
          if (!idOrderItem) {
            showToast(
              "Item Gagal Dibeli, Coba Refresh Dan Ulangi Pembelian.",
              "danger",
              8000
            );
            return;
          }

          if (!userData.id) {
            showToast("Silakan Login Terlebih Dahulu", "danger", 5000);
            return;
          }
          const order = {
            data: {
              user_id: {
                set: [userData.id],
              },
              order_status: status,
              order_items: {
                connect: [idOrderItem],
              },
              total_price: cartSelected.total,
              payment_status: "Unpaid",
              discount: [],
            },
          };

          const postOrder = await UseCreateData("api/orders", order);
          if (postOrder.status == "success") {
            const idOrder = postOrder.data.data.documentId;
            if (status == "Cart") {
              showToast(
                "Produk berhasil ditambah di keranjang",
                "success",
                2000
              );
            } else {
              navigate(`/checkout/${idOrder}`);
            }
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
    FetchData();
    setFirstSelected({
      name: "",
      value: "",
    });
    setCartSelected({
      color: "",
      size: "",
      variant: "",
      quantity: 1,
      total: 0,
      productVariant: "",
      product_id: "",
    });

    setVariantCheckData({
      color: [],
      size: [],
      variant: [],
    });
  }, [productId]);

  // Set Tubhnail yang tampil di utama
  useEffect(() => {
    setThubnail(products?.thumbnail?.[0]?.url);
    setDiscount(parseInt(getProductDiscount()));

    if (products && products.product_variants) {
      extractVariants(products.product_variants);
    }
  }, [products]);

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

  console.log(cartSelected);

  return (
    <nav className="flex xs:flex-col md:flex-row lg:flex-row gap-2 bg-white lg:p-3 rounded-md items-start">
      <nav className="flex gap-2 xs:flex-col-reverse lg:flex-row">
        <div className="flex xs:flex-row lg:flex-col xs:w-full lg:w-fit xs:p-3 lg:p-0 overflow-auto max-h-[400px] gap-1">
          {products?.thumbnail?.map((item, index) => (
            <img
              src={`${import.meta.env.VITE_BASE_URL}${item.url}`}
              className="xs:w-[55px] lg:w-[75px] lg:h-[75px] aspect-square rounded-md opacity-50 hover:opacity-100"
              alt="products"
              key={index}
              onClick={() => {
                setThubnail(`${item.url}`);
              }}
            />
          ))}
        </div>
        <div className="relative">
          <img
            src={`${import.meta.env.VITE_BASE_URL}${thubnail}`}
            className="md:h-auto lg:h-[410px] md:w-[1000px] lg:w-auto aspect-square md:rounded-md "
            alt="products"
          />
          {/* <div className="absolute top-2 right-2 bg-secondary px-2 py-1 font-bold text-white rounded-md">
            60%
          </div> */}
        </div>
      </nav>

      <div className="xs:w-full xs:p-3 lg:p-0 lg:w-[47%] flex flex-col justify-between">
        <div>
          <p className="text-2xl font-bold leading-tight">{products.name}</p>
          <div className="flex xs:flex-col lg:flex-row lg:items-center justify-between mt-2">
            <p>
              <span className="text-xl font-bold text-primary-subtle">
                {hargaVariant != 0
                  ? changeSingleHarga(hargaVariant)
                  : changeharga(products.product_variants)}
              </span>{" "}
              {!changeharga(products.product_variants)?.includes("~") ? (
                <span className="text-md opacity-50 line-through">
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
          <div className="flex justify-evenly mt-3 font-medium relative group overflow-auto w-full">
            {/* Garis underline yang hilang saat hover parent */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-opacity duration-300 group-hover:opacity-0"></div>
            {/* Container untuk Produk */}
            <div
              className="relative px-4 py-2 cursor-pointer group/item hover:text-primary"
              onClick={() => {
                setViewBeli("produk");
              }}
            >
              <div className="flex items-center gap-2  transition-colors duration-300">
                <i className="fas fa-box"></i>
                Produk
              </div>
              {/* Garis hover untuk item */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/item:w-full"></span>
            </div>

            {/* Container untuk Deskripsi */}
            <div
              className="relative px-4 py-2 cursor-pointer group/item hover:text-primary"
              onClick={() => {
                setViewBeli("deskripsi");
              }}
            >
              <div className="flex items-center gap-2  transition-colors duration-300">
                <i className="fas fa-file-alt"></i>
                Deskripsi
              </div>
              {/* Garis hover untuk item */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/item:w-full"></span>
            </div>
            {/* Container untuk Ulasan */}
            <div
              className="relative px-4 py-2 cursor-pointer group/item hover:text-primary"
              onClick={() => {
                setViewBeli("ulasan");
              }}
            >
              <div className="flex items-center gap-2  transition-colors duration-300">
                <i className="fa-solid fa-face-smile-beam"></i>
                Ulasan
              </div>
              {/* Garis hover untuk item */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/item:w-full"></span>
            </div>
          </div>
          {viewBeli == "produk" ? (
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
                          cartSelected.color == color
                            ? "bg-secondary"
                            : "bg-base"
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
          ) : viewBeli == "deskripsi" ? (
            <div className="mt-4">
              <p className="text-md font-bold text-accent">Deskripsi Produk:</p>
              <p className="text-justify hyphens-auto">
                {products.description}
              </p>
            </div>
          ) : viewBeli == "ulasan" ? (
            <nav className="h-[250px] overflow-auto">
              {products.reviews && products.reviews.length > 0 ? (
                products?.reviews?.map((item, index) => (
                  <Ulasan key={index} item={item} />
                ))
              ) : (
                <p className="text-center py-3 bg-neutral">Belum Ada Ulasan</p>
              )}
            </nav>
          ) : null}
        </div>
        <div className="flex gap-1 mt-1">
          <button
            className="bg-accent hover:bg-secondary text-white w-[12%] py-1 rounded-md"
            onClick={() => {
              handleCheckout("Cart");
            }}
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </button>
          <button
            className="bg-accent hover:bg-secondary text-white w-[88%] rounded-md"
            onClick={() => {
              handleCheckout("Pending");
            }}
          >
            Beli Sekarang
          </button>
        </div>
      </div>
      {ToastComponent}
    </nav>
  );
};
export default DetailProduk;
