import { useEffect, useState } from "react";
import Navbar from "../components/client/Navbar";
import Sidebar from "../components/client/sidebar";
import CursorTrail from "../components/common/cursorTrail";
import {
  UseDeleteData,
  UseGetData,
  UseUpdateData,
} from "../services/service_api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/common/useToast";

const Cart = ({ categories, userData }) => {
  const [cart, setCart] = useState([]);
  const { showToast, ToastComponent } = useToast();
  const [minimize, setMinimize] = useState(true);
  const [cartSelected, setCartSelected] = useState([]);
  const navigate = useNavigate();
  if (!userData) {
    navigate("/auth/login");
  }

  const FetchData = async () => {
    const { data } = await UseGetData(
      `api/orders?filters[order_status][$eq]=Cart&filters[user_id][id][$eq]=${userData.id}&populate[user_id][populate][profile]=*&populate[user_id][populate][address]=*&populate[order_items][populate][product_variant][populate][product_id][populate]=thumbnail`
    );

    setCart(processOrderItems(data.data));
  };

  useEffect(() => {
    FetchData();
  }, []);

  const processOrderItems = (orders) => {
    return orders?.map((order) => {
      const groupedItems = {};
      let harga_total = 0;
      let name_product = "";

      order.order_items.forEach((item) => {
        const productId = item?.product_variant?.product_id?.documentId;

        if (!groupedItems[productId]) {
          name_product = item?.product_variant?.product_id?.name;

          groupedItems[productId] = {
            ...item,
            product_name: item?.product_variant?.product_id?.name,
            thumbnail: item?.product_variant?.product_id?.thumbnail[0],
            variasi_product: [
              {
                ...item?.product_variant,
                quantity: item?.quantity,
                orderItemId: item?.documentId,
              },
            ],
          };
        } else {
          groupedItems[productId].variasi_product.push({
            ...item?.product_variant,
            quantity: item?.quantity,
            orderItemId: item?.documentId,
          });
        }

        const harga_total_variant =
          item?.product_variant?.price * item?.quantity;
        harga_total += harga_total_variant;
      });

      return {
        ...order,
        name_product,
        total_price: harga_total,
        harga_akhir: order.total_price,
        discount: 0,
        order_items: Object.values(groupedItems),
      };
    });
  };

  const handleSelected = (item, type, dataType) => {
    let updatedCart = [...cartSelected];

    if (type === "add") {
      if (dataType === "order") {
        const existingOrderIndex = updatedCart.findIndex(
          (order) => order.data.id === item.id
        );

        if (existingOrderIndex === -1) {
          const newOrder = {
            data: {
              id: item.id,
              user_id: [userData.id],
              documentId: item.documentId,
              order_status: "Cart",
              order_items: item.order_items.map((order_item) => ({
                data: {
                  id: order_item.id,
                  quantity: order_item.quantity,
                  documentId: order_item.documentId,
                  product_variant: [
                    order_item.product_variant?.documentId || null,
                  ],
                  order: [],
                },
              })),
              total_price: item.total_price,
              payment_status: "Unpaid",
              discount: [],
            },
          };
          updatedCart.push(newOrder);
        }
      } else if (dataType === "order_item") {
        const existingOrderIndex = updatedCart.findIndex(
          (order) => order.data.id === item.orderId
        );

        if (existingOrderIndex !== -1) {
          const existingOrderItem = updatedCart[
            existingOrderIndex
          ].data.order_items.find((oi) => oi.data.id === item.id);

          if (!existingOrderItem) {
            updatedCart[existingOrderIndex].data.order_items.push({
              data: {
                id: item.id,
                quantity: 0,
                product_variant: [item.product_variant?.documentId || null],
                order: [],
              },
            });
          }
        }
      }
    } else if (type === "delete") {
      if (dataType === "order") {
        updatedCart = updatedCart.filter((order) => order.data.id !== item.id);
      } else if (dataType === "order_item") {
        const existingOrderIndex = updatedCart.findIndex(
          (order) => order.data.id === item.id
        );

        if (existingOrderIndex !== -1) {
          const updatedOrderItems = updatedCart[
            existingOrderIndex
          ].data.order_items.filter((oi) => oi.data.id !== item.id);

          // If no order_items remain, remove the order from cartSelected
          if (updatedOrderItems.length === 0) {
            updatedCart.splice(existingOrderIndex, 1);
          } else {
            updatedCart[existingOrderIndex].data.order_items =
              updatedOrderItems;
          }
        }
      }
    }

    setCartSelected(updatedCart);
  };

  const isItemSelected = (orderId) => {
    return cartSelected.some((order) => order.data.id === orderId);
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

  const total_harga = cartSelected.reduce(
    (acc, item) => acc + item.data.total_price,
    0
  );

  const documentIds = cartSelected.map((item) => item.data.documentId);
  const queryString = `filters[documentId][$in]=${documentIds.join(
    "&filters[documentId][$in]="
  )}`;

  const handleCheckout = async () => {
    if (cartSelected.length > 0) {
      cartSelected.map(async (order) => {
        const payload = {
          data: {
            order_status: order.data.order_status,
            payment_status: order.data.payment_status,
          },
        };

        try {
          const postOrder = await UseUpdateData(
            "api/orders",
            order.data.documentId,
            payload
          );
          order.data.order_items.map(async (order_item) => {
            const payloadOrderItem = {
              data: {
                order: [postOrder.data.data.documentId],
                product_variant: order_item.data.product_variant,
                quantity: order_item.data.quantity,
              },
            };
            const postItemOrder = await UseUpdateData(
              "api/order-items",
              order_item.data.documentId,
              payloadOrderItem
            );

            if (postItemOrder.status == "success") {
              FetchData();
              navigate(`/checkout/${queryString}`);
            }
          });
        } catch (error) {
          showToast(error, "danger", 5000);
        }
      });
    } else {
      showToast("Tidak ada produk yang di checkout", "danger", 5000);
    }
  };

  const deleteItem = async (id, type) => {
    if (type == "order_item") {
      try {
        UseDeleteData("api/order-items", id);
        showToast("Berhasil menghapus produk item", "success", 2000);
        FetchData();
      } catch (error) {
        showToast(error, "danger", 5000);
      }
    } else {
      const orderItemId = [];
      let statusSend = {
        status: "success",
        message: "Berhasil menghapus produk item",
      };
      cart
        .filter((order) => order.documentId == id)
        .map((order) =>
          order.order_items.map((order_item) =>
            order_item.variasi_product.map((variant) =>
              orderItemId.push(variant.orderItemId)
            )
          )
        );

      const deleteOrder = await UseDeleteData("api/orders", id);
      if (deleteOrder.status != "success") {
        statusSend = {
          status: "danger",
          message: "Gagal Menghapus Order",
        };
      }
      orderItemId.map(async (item) => {
        const deleteOrderItem = await UseDeleteData("api/order-items", item);
        if (deleteOrderItem.status != "success") {
          statusSend = {
            status: "danger",
            message: `${statusSend.message}, dan Gagal Menghapus Order Item ${item} `,
          };
        }
      });

      FetchData();

      showToast(statusSend.message, statusSend.status, 3000);
    }
  };

  return (
    <nav className="relative">
      <CursorTrail />
      {ToastComponent}
      <Navbar categories={categories} userData={userData} />
      <Sidebar categories={categories} />
      <main className="w-full md:w-[86%] lg:w-[77%] min-h-[100vh] h-fit md:ml-[12%] lg:ml-[22%] mt-[95px]">
        <div className="container mx-auto p-4 md:p-6 mb-[10px]">
          <h1 className="text-2xl md:text-3xl font-bold text-accent mb-4 md:mb-6">
            Keranjang Produk
          </h1>

          {cart.map((item, index) => (
            <div
              className="border-b p-4 mb-6 bg-neutral rounded-lg"
              key={index}
            >
              <div className="mb-4 flex justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`select-order-${item.id}`}
                    className="form-checkbox h-5 w-5 mr-2"
                    checked={isItemSelected(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleSelected(item, "add", "order");
                      } else {
                        handleSelected(item, "delete", "order");
                      }
                    }}
                  />
                  <label
                    htmlFor={`select-order-${item.id}`}
                    className="text-lg text-accent font-bold"
                  >
                    {item.name_product}
                  </label>
                </div>
                <button
                  className="bg-danger hover:bg-danger-subtle w-[30px] h-[30px] rounded-md text-white"
                  onClick={() => {
                    deleteItem(item.documentId, "order");
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              {item.order_items.map((order_item, index) => (
                <nav key={index}>
                  {order_item.variasi_product.map((variant, tdx) => (
                    <div
                      className="mb-1 bg-neutral-subtle rounded-md flex justify-between"
                      key={tdx}
                    >
                      <div className="border rounded-lg p-4 flex items-center w-full">
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}${
                            order_item?.thumbnail?.url
                          }`}
                          alt={variant.Color}
                          className="w-20 h-20 object-cover rounded-lg shadow-md mr-4"
                        />
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-accent">
                            {variant.Color || ""}{" "}
                            {variant.Size ? `- Ukuran ${variant.Size}` : ""}
                            {variant.Variant ? `- ${variant.Variant}` : ""}
                          </h3>
                          <p className="text-gray-600">
                            {formatRupiah(variant.price)}
                          </p>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={variant.quantity}
                            min="1"
                            className="w-16 p-1 rounded-md text-center mt-2 outline-none"
                            onInput={(e) =>
                              (e.target.value = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              ))
                            }
                          />
                        </div>
                        <button
                          className="bg-danger hover:bg-danger-subtle w-[30px] h-[30px] rounded-md text-white"
                          onClick={() => {
                            deleteItem(variant.orderItemId, "order_item");
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </nav>
              ))}
            </div>
          ))}
        </div>

        <div className="fixed bg-neutral border-secondary border w-[73%] p-3 bottom-2 right-10 rounded-md shadow-custom transition-all duration-300 ease-in-out">
          {minimize ? (
            <div className="flex justify-between items-center transition-all duration-300 ease-in-out">
              <p className="text-xl font-bold text-accent">
                Produk Dipilih: <span>{cartSelected.length} Item</span>
              </p>
              <button
                className="bg-primary hover:bg-primary-subtle text-white font-bold px-3 py-2 rounded-md"
                onClick={handleCheckout}
              >
                Checkout ({cartSelected.length} Item)
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center transition-all duration-300 ease-in-out">
                <div>
                  <p className="text-2xl font-bold text-accent">
                    Ringkasan Belanja
                  </p>
                  <p className=" text-gray-600">
                    Produk Dipilih:{" "}
                    <span className="font-bold text-accent">
                      {cartSelected.length} Item
                    </span>
                  </p>
                </div>
                <div className="text-xl font-bold text-accent">
                  Total Harga:{" "}
                  <span className="">{formatRupiah(total_harga)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  className="bg-primary hover:bg-primary-subtle text-white font-bold px-3 py-2 rounded-md"
                  onClick={handleCheckout}
                >
                  Checkout ({cartSelected.length} Item)
                </button>
                <button className="bg-danger hover:bg-danger-subtle text-white font-bold px-3 py-2 rounded-md">
                  Delete Pilihan
                </button>
              </div>
            </>
          )}

          <button
            className="absolute -right-3 -top-3 w-[30px] h-[30px] rounded-full bg-danger hover:bg-danger-subtle text-white"
            onClick={() => {
              setMinimize(!minimize);
            }}
          >
            <i className="fa-solid fa-expand-arrows-alt"></i>
          </button>
        </div>
      </main>
    </nav>
  );
};

export default Cart;
