import axios from "axios";

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

export const useFetchRajaOngkir = async (pointing) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_RAJAONGKIR}${pointing}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          key: import.meta.env.VITE_APIKEY_RAJAONGKIR, // Ganti dengan API Key Anda
        },
      }
    );
    return response.data;
  } catch (error) {}
};

export const useCostOngkir = async (pointing, payload) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_RAJAONGKIR}${pointing}`,
      payload,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          key: import.meta.env.VITE_APIKEY_RAJAONGKIR, // Ganti dengan API Key Anda
        },
      }
    );
    return response.data;
  } catch (error) {}
};
