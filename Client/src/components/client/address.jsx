import React, { useEffect, useState } from "react";
import { useFetchRajaOngkir } from "../../services/fetchData";
import { UseCreateData, UseUpdateData } from "../../services/service_api";
import { useToast } from "../common/useToast";

const Address = ({ userData }) => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const { showToast, ToastComponent } = useToast();

  const [dataAlamat, setDataAlamat] = useState({
    user: [],
    name: "",
    phone: "",
    addressDetail: "",
    postalCode: "",
    province: "",
    city: "",
  });

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    setDataAlamat((prevState) => ({
      ...prevState,
      user: userData?.id,
      name: `${userData?.first_name || ""} ${userData?.last_name || ""}`,
      phone: userData?.phone_number || "",
      city: userData?.address?.city || "",
      province: userData?.address?.province || "",
      postalCode: userData?.address?.postal_code || "",
      addressDetail: userData?.address?.complete_address || "",
    }));

    if (userData?.address?.province && userData?.address?.province != "") {
      fetchCities(userData?.address?.province);
    }
  }, [userData]);

  const fetchProvinces = async () => {
    const data = await useFetchRajaOngkir("province");
    setProvinces(data.rajaongkir.results);
  };

  const fetchCities = async (provinceId) => {
    const data = await useFetchRajaOngkir(`city?province=${provinceId}`);
    setCities(data.rajaongkir.results);
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setDataAlamat((prevState) => ({
      ...prevState,
      province: provinceId,
    }));
    fetchCities(provinceId);
    setCities([]);
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;

    cities.map((item) => {
      item.city_id == cityId
        ? setDataAlamat((prevState) => ({
            ...prevState,
            city: cityId,
            postalCode: item.postal_code,
          }))
        : null;
    });
  };

  const HandleSave = async () => {
    const payload = {
      data: {
        complete_address: dataAlamat.addressDetail,
        city: dataAlamat.city,
        province: dataAlamat.province,
        postal_code: dataAlamat.postalCode,
        user: dataAlamat.user,
      },
    };
    try {
      let response = {
        status: "error",
        message: "Error dalam pengiriman alamat",
      };

      if (userData.Address) {
        response = await UseUpdateData(
          "api/addresse",
          userData.address.documentId,
          payload
        );
      } else {
        response = await UseCreateData("api/addresses", payload);
      }
      if (response.status == "success") {
        showToast("Berhasil Menyimpan Alamat", "success", 2000);
      } else {
        showToast(
          `Gagal Menyimpan Alamat! ${response.message}`,
          "danger",
          5000
        );
      }
    } catch (error) {
      showToast(`Gagal Menyimpan Alamat! ${error}`, "danger", 5000);
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Tambah Alamat Baru</h1>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nama:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            readOnly
            required
            value={dataAlamat.name}
            onChange={(e) => {
              setDataAlamat((prevState) => ({
                ...prevState,
                name: e.target.value,
              }));
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Nomor Telepon:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            readOnly
            required
            value={dataAlamat.phone}
            onChange={(e) => {
              setDataAlamat((prevState) => ({
                ...prevState,
                phone: e.target.value,
              }));
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="province"
            className="block text-sm font-medium text-gray-700"
          >
            Provinsi:
          </label>
          <select
            id="province"
            name="province"
            required
            value={dataAlamat.province}
            onChange={handleProvinceChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Pilih Provinsi</option>
            {provinces?.map((province) => (
              <option
                key={province.province_id}
                value={province.province_id}
                selected={dataAlamat.province == province.province_id}
              >
                {province.province}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            Kabupaten/Kota:
          </label>
          <select
            id="city"
            name="city"
            required
            value={dataAlamat.city}
            onChange={handleCityChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Pilih Kabupaten/Kota</option>
            {cities?.map((city) => (
              <option
                key={city.city_id}
                value={city.city_id}
                selected={dataAlamat.province == city.city_id}
              >
                {city.city_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="addressDetail"
            className="block text-sm font-medium text-gray-700"
          >
            Detail Alamat:
          </label>
          <textarea
            id="addressDetail"
            name="addressDetail"
            rows="4"
            required
            value={dataAlamat.addressDetail}
            onChange={(e) => {
              setDataAlamat((prevState) => ({
                ...prevState,
                addressDetail: e.target.value,
              }));
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          ></textarea>
        </div>

        <div className="mb-4">
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium text-gray-700"
          >
            Kode Pos:
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            readOnly
            value={dataAlamat.postalCode}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <button
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          onClick={HandleSave}
        >
          Simpan Alamat
        </button>
      </div>
      {ToastComponent}
    </div>
  );
};

export default Address;
