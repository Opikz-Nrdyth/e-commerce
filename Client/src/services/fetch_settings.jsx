import { UseGetData } from "./service_api";

let settingsCache = null;

export const get_settings = () => {
  // Jika cache sudah ada, langsung kembalikan
  if (settingsCache) {
    return settingsCache;
  }

  // Fetch data jika cache belum ada
  const fetchData = async () => {
    try {
      const response = await UseGetData("api/shop-setting?populate=*");
      const proses_response = {
        ...response.data.data,
        thumbnail: `${import.meta.env.VITE_BASE_URL}${
          response.data.data.thumbnail.url
        }`,
      };

      settingsCache = proses_response; // Simpan hasil di cache
      return settingsCache;
    } catch {
      console.error("Error fetching data");
      return null;
    }
  };

  // Inisialisasi fetch jika cache kosong
  fetchData();
  return settingsCache; // Saat pertama kali, akan null sebelum data berhasil di-fetch
};
