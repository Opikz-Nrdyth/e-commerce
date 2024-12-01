import { useEffect, useState } from "react";
import InputData from "../../components/admin/inputData";
import { UseDeleteData, UseGetData } from "../../services/service_api";
import { Popover } from "flowbite-react";
import ModalDelete from "../../components/admin/modaldelete";
import { useToast } from "../../components/common/useToast";
const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [isInputData, setIsInputData] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [idDeleteProduct, setIdDeleteProduct] = useState(null);
  const { showToast, ToastComponent } = useToast();
  const [deleteVariant, setDeleteVariant] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [urlGet, setUrlGet] = useState("api/products?populate=*");
  const [sort, setSort] = useState("asc");

  const handleSort = (sortName) => {
    if (sort == "asc") {
      setUrlGet(`api/products?populate=*&sort=${sortName}:asc`);
      setSort("desc");
    } else {
      setUrlGet(`api/products?populate=*&sort=${sortName}:desc`);
      setSort("asc");
    }

    GetDataProduct();
  };

  const GetDataProduct = async () => {
    const response = await UseGetData(urlGet);
    setProducts(response.data.data);
  };

  useEffect(() => {
    GetDataProduct();
  }, []);

  const [dataInput, setDataInput] = useState({
    title: "Products",
    type: "add",
    data: [
      {
        name: "product_id",
        type: "id",
        defaultValue: "*****",
      },
      {
        name: "thumbnail",
        type: "file",
        accept: "images/jpeg, images/png, images/jpg",
        defaultValue: "",
        multipe: true,
      },
      {
        name: "name",
        type: "text",
        defaultValue: "",
      },
      {
        name: "description",
        type: "textarea",
        defaultValue: "",
      },
      {
        name: "categories",
        type: "select-slide",
        defaultValue: "",
      },
      {
        name: "product_variants",
        type: "table-input",
        header: ["Size", "Variant", "Color", "stock", "price"],
        defaultValue: "",
      },
    ],
  });

  const handleEditData = (item) => {
    const dataInput = {
      type: "Edit",
      data: [
        {
          name: "product_id",
          type: "id",
          defaultValue: item.documentId || "",
        },
        {
          name: "thumbnail",
          type: "file",
          accept: "images/jpeg, images/png, images/jpg",
          defaultValue: item.thumbnail || "",
          multipe: true,
          inputType: "foto",
        },
        {
          name: "name",
          type: "text",
          defaultValue: item.name || "",
        },
        {
          name: "categories",
          type: "select-slide",
          defaultValue: item.categories.map((category) => category.name),
        },
        {
          name: "product_variants",
          type: "table-input",
          header: ["id", "Size", "Variant", "Color", "stock", "price"],
          defaultValue: item.product_variants.map((variant) => ({
            id: variant.documentId || "",
            Size: variant.Size || "",
            Variant: variant.Variant || "",
            Color: variant.Color || "",
            stock: variant.stock || "",
            price: variant.price || "",
          })),
        },
      ],
    };

    setDataInput((prev) => ({
      ...prev,
      ...dataInput,
    }));

    setIsInputData(true);
  };

  const formattedDate = (dateString) => {
    const date = new Date(dateString);

    // Format tanggal Indonesia: hari/bulan/tahun
    const newFormattedDate = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${newFormattedDate} ${formattedTime}`;
  };

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (returnModal && idDeleteProduct) {
      // Fungsi async di dalam useEffect
      const handleDelete = async () => {
        // Fungsi untuk menghapus variant
        const deleteVariants = async () => {
          try {
            // Gunakan Promise.all untuk menunggu semua varian selesai dihapus
            await Promise.all(
              idDeleteProduct.product_variants.map((variant) =>
                UseDeleteData("api/product-variants", variant.documentId).then(
                  (response) => {
                    if (response.status == "error") {
                      setDeleteVariant(true);
                      showToast(
                        `Gagal Menghapus Product Variant: ${response.message}`,
                        "error",
                        5000
                      );
                    }
                  }
                )
              )
            );
          } catch (error) {
            showToast(
              `Gagal Menghapus Product Variant: ${error}`,
              "error",
              5000
            );
            throw error; // Jika terjadi error, hentikan eksekusi
          }
        };

        // Fungsi untuk menghapus produk setelah variant terhapus
        const deleteProduct = async () => {
          if (!deleteVariant) {
            try {
              const deleteProducts = await UseDeleteData(
                "api/products",
                idDeleteProduct.documentId
              );
              showToast("Produk berhasil dihapus", "success", 5000);
              GetDataProduct();
            } catch (error) {
              showToast(`Gagal Menghapus Product: ${error}`, "error", 5000);
            }
          }
        };

        // Panggil fungsi deleteVariants lalu deleteProduct setelahnya
        try {
          await deleteVariants();
          await deleteProduct();
          setDeleteVariant(false);
          setIdDeleteProduct(null);
          setReturnModal(false);
        } catch (error) {
          // console.error("Error dalam menghapus product variant:", error);
          showToast(`Error dalam menghapus variant: ${error}`, "danger", 5000);
        }
      };

      // Panggil fungsi handleDelete
      handleDelete();
    }
  }, [returnModal, idDeleteProduct]);

  return (
    <div className=" bg-white rounded-lg w-full shadow-lg sm:px-1 lg:px-6 py-4 ">
      <ModalDelete
        openModal={openModal}
        setOpenModal={setOpenModal}
        setReturnModal={setReturnModal}
        title={"Apakah Anda ingin menghapus produk ini?"}
      />
      <h1 className="text-2xl font-bold text-primary text-center mb-4">
        Daftar Produk
      </h1>
      {/* Search */}
      <div className="relative m-[2px] mb-3 mr-5 float-left">
        <label htmlFor="inputSearch" className="sr-only">
          Search{" "}
        </label>
        <input
          id="inputSearch"
          type="text"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search..."
          className="block w-64 rounded-lg border py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform">
          <i className="fa-solid fa-magnifying-glass"></i>
        </span>
      </div>

      <div className="relative m-[2px] mb-3 float-right hidden sm:block">
        <button
          className="px-2 py-1 bg-success rounded-md hover:bg-primary text-white"
          onClick={() => {
            setIsInputData(true);
          }}
        >
          <i className="fa-solid fa-plus"></i> Tambah Produk
        </button>
      </div>
      <div className="w-full overflow-auto">
        <table className="min-w-full border-b-2">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2 whitespace-nowrap">Product_id</th>
              <th className="px-4 py-2 whitespace-nowrap ">Thumbnail</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("name");
                }}
              >
                Nama Produk <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Deskripsi</th>
              <th className="px-4 py-2 whitespace-nowrap">Kategori</th>
              <th className="px-4 py-2 whitespace-nowrap">Variasi</th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("createdAt");
                }}
              >
                Terbuat <i className="fa-solid fa-sort"></i>
              </th>
              <th
                className="px-4 py-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  handleSort("updatedAt");
                }}
              >
                Update <i className="fa-solid fa-sort"></i>
              </th>
              <th className="px-4 py-2 whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, index) => (
                <tr className=" hover:bg-neutral" key={index}>
                  <td className="px-4 py-2">#{item.product_id}</td>
                  <td className="px-4 py-2">
                    {item?.thumbnail && item?.thumbnail.length > 1 ? (
                      <Popover
                        placement="auto"
                        title="Foto-foto"
                        content={
                          <div className="grid grid-cols-3 gap-2 p-2">
                            {item.thumbnail.map((photo, index) => (
                              <img
                                key={index}
                                src={`${import.meta.env.VITE_BASE_URL}${
                                  photo.url
                                }`}
                                alt={`foto-${index}`}
                                className="w-[150px] h-[150px] rounded-lg object-cover border border-gray-300 shadow-sm"
                              />
                            ))}
                          </div>
                        }
                        trigger="hover"
                      >
                        <div className="flex">
                          {item.thumbnail.slice(0, 5).map((photo, index) => (
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${
                                photo.url
                              }`}
                              key={index}
                              alt="foto"
                              className={`border-2 border-secondary w-[35px] h-[35px] ${
                                index > 0 ? "-ml-6" : ""
                              } cursor-pointer rounded-full border border-gray-300 shadow-sm`}
                            />
                          ))}
                        </div>
                      </Popover>
                    ) : (
                      <img
                        src={
                          item?.thumbnail?.[0]?.url
                            ? `${import.meta.env.VITE_BASE_URL}${
                                item?.thumbnail?.[0].url
                              }`
                            : "https://placehold.jp/3d4070/ffffff/150x150.png"
                        }
                        alt="foto"
                        className="w-[45px] h-[45px] rounded-full border border-gray-300 shadow-sm"
                      />
                    )}
                  </td>
                  <td className="px-4 line-clamp-2 leading-none">
                    {item.name}
                  </td>
                  <td className="px-4 py-2">
                    <Popover
                      placement="bottom"
                      title="Popover title"
                      className="max-w-[60%] z-20"
                      content={
                        <p className="bg-white p-3 text-sm ">
                          {item.description}
                        </p>
                      }
                      trigger="hover"
                    >
                      <button className="text-white bg-secondary rounded-md text-sm px-2 py-1 text-center">
                        Deskripsi
                      </button>
                    </Popover>
                  </td>
                  <td className="px-4 py-2 flex flex-wrap gap-1">
                    {item.categories.map((kategori, i) => (
                      <div
                        className="text-white text-nowrap bg-primary-subtle rounded-md text-sm px-2 py-1 text-center"
                        key={i}
                      >
                        {kategori.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Popover
                      placement="bottom"
                      title="Popover title"
                      content={
                        <table className="min-w-full bg-neutral-subtle">
                          <thead className="bg-primary">
                            <tr className="text-white">
                              <th className="px-4 py-2">Color</th>
                              <th className="px-4 py-2">Size</th>
                              <th className="px-4 py-2">Variasi</th>
                              <th className="px-4 py-2">Harga</th>
                              <th className="px-4 py-2">Stok</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.product_variants.map((variant, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-4 py-2">
                                  {variant.Color || "-"}
                                </td>
                                <td className="px-4 py-2">
                                  {variant.Size || "-"}
                                </td>
                                <td className="px-4 py-2">
                                  {variant.Variant || "-"}
                                </td>
                                <td className="px-4 py-2">
                                  {variant.price || "-"}
                                </td>
                                <td className="px-4 py-2">
                                  {variant.stock || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      }
                      trigger="hover"
                    >
                      <button className="text-white bg-secondary rounded-md text-sm px-2 py-1 text-center">
                        Variasi Produk
                      </button>
                    </Popover>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formattedDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formattedDate(item.updatedAt)}
                  </td>
                  <td className="px-4 py-2 flex gap-1 justify-center">
                    <button
                      className="bg-secondary px-2 py-1 rounded-md"
                      onClick={() => {
                        handleEditData(item);
                      }}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      className="bg-danger px-2 py-1 rounded-md text-white"
                      onClick={() => {
                        setOpenModal(true);
                        setIdDeleteProduct(item);
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  Tidak ada produk dalam database
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagenation */}
      {/* <nav
        className="mt-5 flex items-center sm:justify-center lg:justify-between text-sm"
        aria-label="Page navigation example"
      >
        <p className="sm:hidden lg:block">
          Menampilkan <strong>25</strong> data
        </p>

        <ul className="list-style-none flex">
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              Previous
            </a>
          </li>
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              1
            </a>
          </li>
          <li aria-current="page">
            <a
              className="relative block rounded bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all duration-300"
              href="#!"
            >
              2
              <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
                (current)
              </span>
            </a>
          </li>
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              3
            </a>
          </li>
          <li>
            <a
              className="relative block rounded bg-transparent px-3 py-1.5 text-sm text-neutral-600 transition-all duration-300 hover:bg-neutral-100"
              href="#!"
            >
              Next
            </a>
          </li>
        </ul>
      </nav> */}
      {isInputData ? (
        <InputData
          dataInput={dataInput}
          setIsInputData={setIsInputData}
          pointing={"api/products"}
          pointing_table_input={"api/product-variants"}
          loadData={GetDataProduct}
          refTarget={"api::product.product"}
        />
      ) : null}
      {ToastComponent}
    </div>
  );
};
export default ProductsManagement;
