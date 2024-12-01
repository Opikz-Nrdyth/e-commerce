import axios from "axios";

let responseData = {
  status: "error",
  message: "Invalid Token",
  data: [],
};

// Fungsi untuk mendapatkan data dari API
export const UseGetData = async (pointing) => {
  const token = localStorage.jwt;
  const publicEndpoints = [
    "api/categories",
    "api/discounts",
    "api/products",
    "api/product-variants",
    "api/reviews",
  ];

  const isPublicEndpoint = publicEndpoints.some((endpoint) =>
    pointing.startsWith(endpoint)
  );
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}${pointing}`,
      { headers }
    );

    responseData = {
      status: "success",
      message: `this pointing to ${pointing}`,
      data: response.data,
    };
  } catch (error) {
    responseData = {
      status: "error",
      data: [],
      message: error.response ? error.response.data.message : error.message,
    };
  }

  return responseData;
};

// Fungsi untuk menambah data (POST request)
export const UseCreateData = async (pointing, payload) => {
  const token = localStorage.jwt;
  if (token) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}${pointing}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      responseData = {
        status: "success",
        message: "Data successfully created",
        data: response.data,
      };
    } catch (error) {
      responseData = {
        status: "error",
        data: [],
        message: error.response ? error.response.data.message : error.message,
      };
    }
  } else {
    responseData = {
      status: "error",
      message: "Invalid Token",
      data: [],
    };
  }

  return responseData;
};

// Fungsi untuk memperbarui data (PUT request)
export const UseUpdateData = async (pointing, id, payload) => {
  const token = localStorage.jwt;
  if (token) {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}${pointing}/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      responseData = {
        status: "success",
        message: "Data successfully updated",
        data: response.data,
      };
    } catch (error) {
      responseData = {
        status: "error",
        data: [],
        message: error.response ? error.response.data.message : error.message,
      };
    }
  } else {
    responseData = {
      status: "error",
      message: "Invalid Token",
      data: [],
    };
  }

  return responseData;
};

// Fungsi untuk menghapus data (DELETE request)
export const UseDeleteData = async (pointing, id) => {
  const token = localStorage.jwt;
  if (token) {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}${pointing}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      responseData = {
        status: "success",
        message: "Data successfully deleted",
        data: response.data,
      };
    } catch (error) {
      responseData = {
        status: "error",
        data: [],
        message: error.response ? error.response.data.message : error.message,
      };
    }
  } else {
    responseData = {
      status: "error",
      message: "Invalid Token",
      data: [],
    };
  }

  return responseData;
};

export const UseUploadPhoto = async (formData) => {
  const token = localStorage.jwt;
  let responseData = {
    status: "error",
    message: "Invalid Token",
    data: [],
  };

  if (token) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      responseData = {
        status: "success",
        message: "Photo uploaded successfully",
        data: response.data,
      };
    } catch (error) {
      responseData = {
        status: "error",
        data: [],
        message: error.response ? error.response.data.message : error.message,
      };
    }
  }

  return responseData;
};
