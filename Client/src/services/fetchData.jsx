import axios from "axios";

import { DeckriptData } from "../utils/decriptShopSettings";
import { useEffect, useState } from "react";
import { get_settings } from "./fetch_settings";

export const useFetchData = async () => {
  const token = localStorage.getItem("jwt");
  if (token) {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/users/me?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      localStorage.removeItem("jwt");
      window.location.reload();
      console.error("Token is invalid or expired:", error);
      throw error;
    }
  } else {
    console.log("No token found");
  }
};

export const useFetchOngkir = async (pointing) => {
  const settings = await get_settings(); // Mengambil pengaturan
  const BinderKey = DeckriptData(settings?.binderbyte); // Mendapatkan key API

  try {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${
        import.meta.env.VITE_BASE_BINDERBYTE
      }${pointing}&api_key=${BinderKey}`,
      headers: {},
    };

    // Menggunakan await agar lebih konsisten dengan async/await
    const response = await axios(config);
    return response.data; // Mengembalikan data dari response
  } catch (error) {
    console.log(error);
    return null; // Mengembalikan null jika ada error
  }
};

export const useFetchAddress = () => {
  const [address, setAddress] = useState({
    province: [],
    kota: [],
  });

  const [addressSelected, setAddressSelected] = useState({
    provinceId: 0,
    provinceName: "",
    kotaId: 0,
    kotaName: "",
  });

  const getProvince = async () => {
    const { value } = await useFetchOngkir("wilayah/provinsi?");

    setAddress((prevAddress) => ({
      ...prevAddress,
      province: value,
    }));
  };

  const getKota = async () => {
    if (addressSelected.provinceId !== 0) {
      const { value } = await useFetchOngkir(
        `wilayah/kabupaten?id_provinsi=${addressSelected.provinceId}&`
      );
      setAddress((prevAddress) => ({
        ...prevAddress,
        kota: value,
      }));
    }
  };

  const setProvinsi = (province) => {
    const parseString = province.split(",");
    setAddressSelected({
      ...addressSelected,
      provinceId: parseString[0],
      provinceName: parseString[1],
    });
  };

  const setKota = (kota) => {
    const parseString = kota.split(",");
    setAddressSelected({
      ...addressSelected,
      kotaId: parseString[0],
      kotaName: parseString[1],
    });
  };

  useEffect(() => {
    getProvince();
  }, []);

  useEffect(() => {
    getKota();
  }, [addressSelected.provinceId]);

  const getAddress = (address) => {
    if (address) {
      const parseAddress = JSON.parse(address);
      setAddressSelected({
        kotaId: parseAddress?.kotaId || 0,
        kotaName: parseAddress?.kotaName || "",
        provinceId: parseAddress?.provId || 0,
        provinceName: parseAddress?.provName || "",
      });
    }
  };

  const getProvinceDatabase = (province) => {
    if (province) {
      const parseProvince = JSON.parse(province);

      setAddressSelected((prevState) => ({
        ...prevState,
        provinceId: parseProvince?.id || 0,
        provinceName: parseProvince?.name || "",
      }));
    }
  };
  const getKotaDatabase = (kota) => {
    if (kota) {
      const parseKota = JSON.parse(kota);
      setAddressSelected((prevState) => ({
        ...prevState,
        kotaId: parseKota?.id || 0,
        kotaName: parseKota?.name || "",
      }));
    }
  };

  return {
    address,
    addressSelected,
    setKota,
    setProvinsi,
    getAddress,
    getProvince,
    getProvinceDatabase,
    getKotaDatabase,
  };
};
