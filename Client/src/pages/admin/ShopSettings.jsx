import { useEffect, useState } from "react";
import {
  UseCreateData,
  UseGetData,
  UseUpdateData,
  UseUploadPhoto,
} from "../../services/service_api";
import { useToast } from "../../components/common/useToast";
import { useFetchRajaOngkir } from "../../services/fetchData";
import { Accordion } from "flowbite-react";
import { Link } from "react-router-dom";

const ShopSettings = () => {
  const { showToast, ToastComponent } = useToast();
  const [data, setData] = useState({});

  const FetchData = async () => {
    const { data } = await UseGetData("api/shop-setting?populate=*");
    setData(data?.data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prevState) => ({
          ...prevState,
          new_thumbnail: reader.result,
          thumbnail: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    FetchData();
  }, []);

  const FormSubmit = async (e) => {
    e.preventDefault();

    let statusUpdate = true;
    let fotoId = [];
    if (data?.new_thumbnail) {
      const newFormData = new FormData();
      newFormData?.append("files", data?.thumbnail);
      newFormData?.append("ref", "api::shop-setting.shop-setting");
      newFormData?.append("refId", data?.id);
      newFormData?.append("field", "thumbnail");
      newFormData?.append("source", "company");

      const uploadImages = await UseUploadPhoto(newFormData);
      if (uploadImages.status != "success") {
        statusUpdate = false;
        console.log(uploadImages);

        showToast(
          `Gagal Memperbarui Foto Perusahaan!! ${postdata?.message}`,
          "success",
          2000
        );
        return;
      } else {
        fotoId.push(uploadImages.data[0].id);
      }
    }

    const payload = {
      data: {
        shop_name: data?.shop_name,
        shop_description: data?.shop_description,
        thumbnail: fotoId || [],
        shop_address: null,
        binderbyte: data?.binderbyte,
        midtrans_client: data?.midtrans_client,
        midtrans_server: data?.midtrans_server,
        google_client_id: data?.google_client_id,
        google_secret_id: data?.google_secret_id,
      },
    };

    const postData = await UseUpdateData("api/shop-setting", "", payload);

    if (postData?.status != "success") {
      console.log(postData);

      statusUpdate = false;
      showToast(
        `Gagal Memperbarui Data Perusahaan!! ${postdata?.message}`,
        "success",
        2000
      );
    }

    if (statusUpdate) {
      showToast("Berhasil Memperbarui Data Perusahaan", "success", 2000);
      FetchData();
    }
  };

  const getAddress = async () => {};
  useEffect(() => {}, [data]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {ToastComponent}
      <h1 className="text-3xl font-bold mb-4 text-primary">Shop Settings</h1>
      <form onSubmit={FormSubmit}>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2 text-accent"
            htmlFor="shop-name"
          >
            Shop Name
          </label>
          <input
            className="w-full p-2 border border-neutral-subtle rounded"
            type="text"
            id="shop-name"
            placeholder="Enter your shop name"
            value={data?.shop_name}
            onChange={(event) => {
              setData((prevState) => ({
                ...prevState,
                shop_name: event.target.value,
              }));
            }}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2 text-accent"
            htmlFor="shop-description"
          >
            Shop Description
          </label>
          <textarea
            className="w-full p-2 border border-neutral-subtle rounded"
            id="shop-description"
            rows="4"
            placeholder="Enter your shop description"
            value={data?.shop_description}
            onChange={(event) => {
              setData((prevState) => ({
                ...prevState,
                shop_description: event.target.value,
              }));
            }}
          ></textarea>
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2 text-accent"
            htmlFor="province"
          >
            Provinsi
          </label>
          <select
            id="province"
            name="province"
            onChange={""}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="1">Pilih Provinsi</option>
            {/* {provinces?.map((province) => (
              <option
                key={province.province_id}
                value={province.province_id}
                selected={dataAlamat.province == province.province_id}
              >
                {province.province}
              </option>
            ))} */}
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2 text-accent"
            htmlFor="city"
          >
            Kota / Kabupaten
          </label>
          <select
            id="city"
            name="city"
            value={null}
            onChange={""}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="1">Pilih Kabupaten/Kota</option>
            {/* {cities?.map((city) => (
              <option
                key={city.city_id}
                value={city.city_id}
                selected={dataAlamat.province == city.city_id}
              >
                {city.city_name}
              </option>
            ))} */}
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2 text-accent"
            htmlFor="shop-logo"
          >
            Shop Logo
          </label>
          <div className="border border-accent w-fit relative rounded-md bg-neutral hover:bg-neutral-subtle">
            <label htmlFor="shop-logo">
              <div
                type="button"
                className="absolute bottom-0 w-full bg-primary hover:bg-primary-subtle p-1 rounded-sm text-xs text-white text-center"
              >
                <i className="fa-solid fa-file-pen"></i> Edit Profil
              </div>
            </label>
            <img
              src={
                data?.new_thumbnail ||
                `${import.meta.env.VITE_BASE_URL}${data?.thumbnail?.url}`
              }
              alt="Logo Company"
              width="120px"
              height="120px"
            />
          </div>
          <input
            className="w-full p-2 border border-neutral-subtle rounded hidden"
            type="file"
            id="shop-logo"
            onChange={(event) => {
              handleFileChange(event);
            }}
          />
        </div>

        <Accordion className="bg-white mb-4" collapseAll>
          {/* Byte Key */}
          <Accordion.Panel className="bg-white border-b border-gray-200">
            <Accordion.Title className="dark:text-black dark:hover:bg-neutral dark:focus:ring-0 focus:ring-0 focus:ring-gray-200 outline-none hover:bg-gray-50">
              Cek Ongkir
            </Accordion.Title>
            <Accordion.Content className="p-4 bg-white content-acc">
              <div className="space-y-4 mb-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-accent"
                    htmlFor="binderbyte"
                  >
                    Binder Byte Key
                  </label>
                  <input
                    className="w-full p-2 border border-neutral-subtle rounded"
                    type="text"
                    id="binderbyte"
                    placeholder="Enter key of binderbyte"
                    value={data?.binderbyte}
                    onChange={(event) => {
                      setData((prevState) => ({
                        ...prevState,
                        binderbyte: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              <Link
                to="https://dashboard.binderbyte.com/profile"
                target="_blank"
                className="bg-primary hover:bg-primary-subtle px-2 py-1 text-white rounded-md"
              >
                Cek Binder Byte Key
              </Link>
            </Accordion.Content>
          </Accordion.Panel>
          {/* Midtrans */}
          <Accordion.Panel className="bg-white border-b border-gray-200">
            <Accordion.Title className="dark:text-black dark:hover:bg-neutral dark:focus:ring-0 focus:ring-0 focus:ring-gray-200 outline-none hover:bg-gray-50">
              Midtrans
            </Accordion.Title>
            <Accordion.Content className="p-4 bg-white content-acc">
              <div className="space-y-4 mb-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-accent"
                    htmlFor="midtrans_client"
                  >
                    Midtrans Client Key
                  </label>
                  <input
                    className="w-full p-2 border border-neutral-subtle rounded"
                    type="text"
                    id="midtrans_client"
                    placeholder="Enter Midtrans Client Key"
                    value={data?.midtrans_client}
                    onChange={(event) => {
                      setData((prevState) => ({
                        ...prevState,
                        midtrans_client: event.target.value,
                      }));
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-accent"
                    htmlFor="midtrans_server"
                  >
                    Midtrans Server Key
                  </label>
                  <input
                    className="w-full p-2 border border-neutral-subtle rounded"
                    type="text"
                    id="midtrans_server"
                    placeholder="Enter Midtrans Server Key"
                    value={data?.midtrans_server}
                    onChange={(event) => {
                      setData((prevState) => ({
                        ...prevState,
                        midtrans_server: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              <Link
                to="https://dashboard.midtrans.com/settings/access-keys"
                target="_blank"
                className="bg-primary hover:bg-primary-subtle px-2 py-1 text-white rounded-md"
              >
                Cek Midtrans Access Key
              </Link>
            </Accordion.Content>
          </Accordion.Panel>
          {/* Google */}
          <Accordion.Panel className="bg-white border-b border-gray-200">
            <Accordion.Title className="dark:text-black dark:hover:bg-neutral dark:focus:ring-0 focus:ring-0 focus:ring-gray-200 outline-none hover:bg-gray-50">
              Login With Google
            </Accordion.Title>
            <Accordion.Content className="p-4 bg-white content-acc">
              <div className="space-y-4 mb-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-accent"
                    htmlFor="google_client_id"
                  >
                    Google Client Id
                  </label>
                  <input
                    className="w-full p-2 border border-neutral-subtle rounded"
                    type="text"
                    id="google_client_id"
                    placeholder="Enter Google Client Id"
                    value={data?.google_client_id}
                    onChange={(event) => {
                      setData((prevState) => ({
                        ...prevState,
                        google_client_id: event.target.value,
                      }));
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-accent"
                    htmlFor="google_secret_id"
                  >
                    Google Secret Id
                  </label>
                  <input
                    className="w-full p-2 border border-neutral-subtle rounded"
                    type="text"
                    id="google_secret_id"
                    placeholder="Enter Google Secret Id"
                    value={data?.google_secret_id}
                    onChange={(event) => {
                      setData((prevState) => ({
                        ...prevState,
                        google_secret_id: event.target.value,
                      }));
                    }}
                  />
                </div>
              </div>
              <Link
                to="https://console.cloud.google.com/apis/dashboard"
                target="_blank"
                className="bg-primary hover:bg-primary-subtle px-2 py-1 text-white rounded-md"
              >
                Cek Google Credentials
              </Link>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-subtle"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
export default ShopSettings;
