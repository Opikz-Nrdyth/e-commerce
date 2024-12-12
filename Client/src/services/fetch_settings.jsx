import { UseGetData } from "./service_api";

let settingsCache = null;

export const get_settings = async () => {
  // Jika cache sudah ada, langsung kembalikan
  if (settingsCache) {
    return settingsCache;
  }

  // Fetch data jika cache belum ada
  try {
    const response = await UseGetData("api/shop-setting?populate=*");

    const proses_response = {
      ...response.data.data,
      thumbnail: response.data.data.thumbnail
        ? `${import.meta.env.VITE_BASE_URL}${response.data.data.thumbnail.url}`
        : null,
    };

    settingsCache = proses_response; // Simpan hasil di cache

    return settingsCache;
  } catch {
    console.error("Error fetching data");
    return null;
  }
};
