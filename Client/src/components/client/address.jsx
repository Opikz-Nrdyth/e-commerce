import React, { useEffect, useState } from "react";
import { useFetchAddress, useFetchOngkir } from "../../services/fetchData";
import { UseCreateData, UseUpdateData } from "../../services/service_api";
import { useToast } from "../common/useToast";

const Address = ({ userData }) => {
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

  const {
    address,
    addressSelected,
    setProvinsi,
    setKota,
    getAddress,
    getProvince,
    getKotaDatabase,
    getProvinceDatabase,
  } = useFetchAddress();

  useEffect(() => {
    setDataAlamat((prevState) => ({
      ...prevState,
      user: userData?.id,
      name: `${userData?.first_name || ""} ${userData?.last_name || ""}`,
      phone: userData?.phone_number || "",
      postalCode: userData?.address?.postal_code || "",
      addressDetail: userData?.address?.complete_address || "",
    }));

    if (userData?.address) {
      getProvinceDatabase(userData?.address?.province);
      getKotaDatabase(userData?.address?.city);
    }
  }, [userData]);

  // console.log(userData, addressSelected);

  const HandleSave = async () => {
    const cityData = `{"id":${addressSelected.kotaId}, "name":"${addressSelected.kotaName}"}`;
    const provinceData = `{"id":${addressSelected.provinceId}, "name":"${addressSelected.provinceName}"}`;
    const payload = {
      data: {
        complete_address: dataAlamat.addressDetail,
        city: cityData,
        province: provinceData,
        postal_code: dataAlamat.postalCode,
        user: [dataAlamat.user],
        user_id: `${dataAlamat.user}`,
      },
    };
    try {
      let response = {
        status: "error",
        message: "Error dalam pengiriman alamat",
      };

      if (userData.address) {
        response = await UseUpdateData(
          "api/addresses",
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
        {/* Name */}
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
        {/* Telephone */}
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
        {/* Provinsi */}
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
            value={
              addressSelected.provinceId
                ? `${addressSelected.provinceId},${addressSelected.provinceName}`
                : ""
            }
            onChange={(e) => {
              setProvinsi(e.target.value);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="" className="hidden">
              Pilih Provinsi
            </option>
            {address?.province?.map((province) => (
              <option
                key={province.id}
                value={`${province.id},${province.name}`}
                selected={addressSelected.provinceId == province.id}
              >
                {province.name}
              </option>
            ))}
          </select>
        </div>
        {/* Kota */}
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
            value={
              addressSelected.kotaId
                ? `${addressSelected.kotaId},${addressSelected.kotaName}`
                : ""
            }
            onChange={(e) => {
              setKota(e.target.value);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Pilih Kabupaten/Kota</option>
            {address.kota?.map((kota) => (
              <option
                key={kota.id}
                value={`${kota.id},${kota.name}`}
                selected={addressSelected.kotaId == kota.id}
              >
                {kota.name}
              </option>
            ))}
          </select>
        </div>
        {/* Address detail */}
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
        {/* Kode Pos */}
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
            onChange={(e) => {
              setDataAlamat((prevState) => ({
                ...prevState,
                postalCode: e.target.value,
              }));
            }}
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
