import React, { useEffect, useRef, useState } from "react";
import {
  UseCreateData,
  UseGetData,
  UseUpdateData,
  UseUploadPhoto,
} from "../../services/service_api";
import { useToast } from "../common/useToast";
import useSpinner from "../common/spinner";
import { Datepicker } from "flowbite-react";

const InputData = ({
  dataInput,
  setIsInputData,
  pointing,
  pointing_table_input = null,
  loadData,
  refTarget,
}) => {
  const { spinner, showSpinner, hideSpinner } = useSpinner();
  const tabelInput = dataInput.data
    .filter((item) => item.type === "table-input")
    .map((item) => item.name);

  const [avaliableCategories, setAvaliableCategories] = useState([]);

  const { showToast, ToastComponent } = useToast();

  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    availableItems: [],
    selectedItems: [],
  });

  const [dataId, setDataId] = useState(null);

  const FetchCategories = async () => {
    const response = await UseGetData("api/categories");

    const newAvailableItems = response.data.data.map((item) => ({
      key: item.id,
      name: item.name,
    }));

    setFormData((prevFormData) => ({
      ...prevFormData,
      availableItems: newAvailableItems,
    }));
  };

  useEffect(() => {
    FetchCategories();
  }, []);

  useEffect(() => {
    dataInput.data.forEach((input) => {
      const timeout = setTimeout(() => {
        if (input.type === "select-slide" && input.defaultValue) {
          const defaultValues = Array.isArray(input.defaultValue)
            ? input.defaultValue
            : [input.defaultValue];

          setFormData((prev) => {
            const newSelectedItems = [...prev.selectedItems];
            const newAvailableItems = [...prev.availableItems];

            defaultValues.forEach((value) => {
              const item = newAvailableItems.find(
                (item) => item.key === value || item.name === value
              );
              if (
                item &&
                !newSelectedItems.some((selected) => selected.key === item.key)
              ) {
                newSelectedItems.push(item);
                const index = newAvailableItems.findIndex(
                  (avail) => avail.key === item.key
                );
                if (index !== -1) {
                  newAvailableItems.splice(index, 1);
                }
              }
            });

            return {
              ...prev,
              selectedItems: newSelectedItems,
              availableItems: newAvailableItems,
            };
          });
        }
      }, 1000);

      if (input.type === "table-input" && input.defaultValue) {
        setFormData((prev) => ({
          ...prev,
          [input.name]: input.defaultValue,
        }));
      }

      if (input.type === "id" && input.defaultValue) {
        function generateProductId(length = 8) {
          let result = "";
          for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10); // menghasilkan angka acak antara 0 dan 9
          }
          return result;
        }

        if (dataInput.type != "Edit") {
          setFormData((prev) => ({
            ...prev,
            product_id: generateProductId(),
          }));
        }

        if (input.type == "id" && dataInput.type == "Edit") {
          setDataId(input.defaultValue);
        }
      }

      if (input.type === "select" && input.selected) {
        setFormData((prev) => ({
          ...prev,
          [input.name]: input.selected,
        }));
      }

      if (
        input.type != "table-input" &&
        input.type != "select-slide" &&
        input.type != "id" &&
        input.type != "select"
      ) {
        if (input.inputType) {
          if (input.inputType != "foto") {
            if (input.defaultValue) {
              setFormData((prev) => ({
                ...prev,
                [input.name]: input.defaultValue,
              }));
            }
          }
        } else {
          if (input.defaultValue) {
            setFormData((prev) => ({
              ...prev,
              [input.name]: input.defaultValue,
            }));
          }
        }
      }
    });
  }, [dataInput]);

  const [searchTermAvailable, setSearchTermAvailable] = useState("");
  const [searchTermSelected, setSearchTermSelected] = useState("");

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addRow = () => {
    const emptyFieldsObject = dataInput.data
      .filter((item) => item.type === "table-input")
      .map((item) => item.header)
      .reduce((acc, field) => {
        acc[field];
        return acc;
      }, {});
    setFormData({
      ...formData,
      [tabelInput]: [...(formData[tabelInput] || []), emptyFieldsObject],
    });
  };

  const handleRowChange = (index, key, value) => {
    const newVariasi = [...(formData[tabelInput] || [])];
    newVariasi[index][key] = value;
    setFormData({
      ...formData,
      [tabelInput]: newVariasi,
    });
  };

  const handleItemClick = (itemId, listType) => {
    setFormData((prevData) => {
      const sourceList =
        listType === "available"
          ? prevData.availableItems
          : prevData.selectedItems;
      const targetList =
        listType === "available"
          ? prevData.selectedItems
          : prevData.availableItems;

      const itemToMove = sourceList.find((item) => item.key === itemId);
      if (!itemToMove) return prevData;

      const updatedSourceList = sourceList.filter(
        (item) => item.key !== itemId
      );
      const updatedTargetList = [...targetList, itemToMove];

      return {
        ...prevData,
        availableItems:
          listType === "available" ? updatedSourceList : updatedTargetList,
        selectedItems:
          listType === "available" ? updatedTargetList : updatedSourceList,
      };
    });
  };

  // Fungsi untuk menangani perubahan pencarian
  const handleSearchChange = (e, source) => {
    if (source === "available") {
      setSearchTermAvailable(e.target.value);
    } else {
      setSearchTermSelected(e.target.value);
    }
  };

  const filteredAvailableItems = formData.availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchTermAvailable.toLowerCase())
  );

  const filteredSelectedItems = formData.selectedItems.filter((item) =>
    item.name.toLowerCase().includes(searchTermSelected.toLowerCase())
  );

  const HandleSubmit = async (e) => {
    e.preventDefault();

    showSpinner();

    let payload = {};

    dataInput.data.forEach((item) => {
      const key = item.name;

      if (
        formData[key] !== undefined &&
        item.type != "table-input" &&
        item.type != "file"
      ) {
        payload = {
          ...payload,
          [key]: formData[key],
        }; // Menambahkan nilai dari json2 berdasarkan nama dari json1
      }

      if (item.type == "file" && !formData?.thumbnail?.[0]?.lastModified) {
        let idFile = [];
        item.defaultValue.map((item) => idFile.push(item.id));
        payload = {
          ...payload,
          [key]: idFile,
        };
      }

      if (item.type == "table-input") {
        if (item.defaultValue) {
          let idTabel = [];
          item?.defaultValue?.map((item) => idTabel.push(item.id));
          payload = {
            ...payload,
            [key]: {
              connect: idTabel,
            },
          };
        }
      }

      if (item.type == "select-slide") {
        payload = {
          ...payload,
          [key]: { connect: formData.selectedItems.map((item) => item.key) },
        };
      }
    });

    payload = {
      data: payload,
    };

    // if (!formData.thumbnail || formData.thumbnail.length == 0) {
    //   delete payload.data.thumbnail;
    // }

    let postData;
    if (dataInput.type == "Edit") {
      postData = await UseUpdateData(pointing, dataId, payload);
    } else {
      postData = await UseCreateData(pointing, payload);
    }

    if (postData.status == "success") {
      const dataId = postData.data.data.id || postData.data.id;

      let statusUpload = {
        status: "success",
        message: "",
      };

      if (pointing_table_input) {
        const payloadVariant = formData[tabelInput].map((item, index) => ({
          product_id: {
            connect: [dataId],
          },
          ...item,
        }));

        try {
          payloadVariant.forEach((item, index) => {
            const newItem = {
              data: item,
            };

            let responseVariant;
            if (item.id && item.id != "") {
              const variantId = item.id;
              delete newItem.data.id;
              responseVariant = UseUpdateData(
                "api/product-variants",
                variantId,
                newItem
              );
            } else {
              responseVariant = UseCreateData("api/product-variants", newItem);
            }
          });
        } catch (error) {
          statusUpload = {
            status: "error",
            message: `input-table Error: ${error}`,
          };
        }
      }

      if (
        formData.thumbnail &&
        formData.thumbnail.length > 0 &&
        formData.thumbnail[0].lastModified
      ) {
        try {
          const formImages = new FormData();

          // Tambahkan gambar yang dipilih
          for (let i = 0; i < formData.thumbnail.length; i++) {
            formImages.append("files", formData.thumbnail[i]);
          }

          // Menambahkan informasi relasi dengan produk
          formImages.append("ref", refTarget);
          formImages.append("refId", dataId); // dataId adalah ID produk yang ingin dikaitkan
          formImages.append("field", "thumbnail");

          const uploadImages = await UseUploadPhoto(formImages);
        } catch (error) {
          statusUpload = {
            status: "error",
            message: `fotoError: ${error}`,
          };
        }
      }

      if (statusUpload.status == "success") {
        if (dataInput.type == "Edit") {
          showToast("Data berhasil diperbarui!", "success", 2000);
        } else {
          showToast("Data berhasil ditambah!", "success", 2000);
        }

        setFormData({
          availableItems: [],
          selectedItems: [],
        });
        loadData();
        if (modalRef.current) {
          modalRef.current.setAttribute("disabled", "");
        }
        const timeout = setTimeout(() => {
          setIsInputData(false);
          clearTimeout(timeout);
        }, 2000);
      } else {
        showToast(
          `Data gagal diperbarui! ${statusUpload.message}`,
          "danger",
          5000
        );
      }
    }

    hideSpinner();
  };

  function NameFormat(text) {
    return text
      .replace("_", " ")
      .split(" ") // Membagi teks menjadi array berdasarkan spasi
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi huruf pertama setiap kata
      .join(" "); // Menggabungkan kembali menjadi string
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/20 z-20">
      {ToastComponent}
      {spinner}
      <div className="bg-white shadow-custom rounded-lg p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-primary">
          {dataInput.title}
        </h1>
        <form onSubmit={HandleSubmit}>
          <div className="max-h-[400px] overflow-auto">
            {dataInput.data.map((input, index) => {
              if (input.type === "file") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    {input.multipe ? (
                      <input
                        className="w-full p-2 border-b-2 border-primary"
                        type="file"
                        id={input.name}
                        accept={input.accept}
                        multiple
                        onChange={(e) =>
                          handleInputChange(input.name, e.target.files)
                        }
                      />
                    ) : (
                      <input
                        className="w-full p-2 border-b-2 border-primary"
                        type="file"
                        id={input.name}
                        accept={input.accept}
                        onChange={(e) =>
                          handleInputChange(input.name, e.target.files)
                        }
                      />
                    )}
                  </div>
                );
              } else if (input.type === "text") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <input
                      className="w-full p-2 border-b-2 border-primary outline-none"
                      placeholder={`Masukan ${NameFormat(input.name)}`}
                      type="text"
                      id={input.name}
                      defaultValue={input.defaultValue}
                      onInput={(e) => {
                        e.target.value = input?.uppercase
                          ? e.target.value.toUpperCase()
                          : e.target.value;
                      }}
                      onChange={(e) =>
                        handleInputChange(
                          input.name,
                          input?.uppercase
                            ? e.target.value.toUpperCase()
                            : e.target.value
                        )
                      }
                    />
                  </div>
                );
              } else if (input.type === "select") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <select
                      className="w-full p-2 border-b-2 border-primary outline-none"
                      id={input.name}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                    >
                      {input.defaultValue.map((option) => (
                        <option
                          value={option}
                          selected={input.selected == option}
                        >
                          {NameFormat(option)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              } else if (input.type === "datetime") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <input
                      className="w-full p-2 border border-primary outline-none rounded-md bg-neutral-subtle"
                      placeholder={`Masukan ${NameFormat(input.name)}`}
                      type="date"
                      id={input.name}
                      defaultValue={input.defaultValue}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                    />
                  </div>
                );
              } else if (input.type === "id") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <input
                      className="w-full p-2 border-b-2 border-primary outline-none"
                      placeholder={`Masukan ${NameFormat(input.name)}`}
                      type="text"
                      readOnly
                      id={input.name}
                      defaultValue={input.defaultValue}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                    />
                  </div>
                );
              } else if (input.type === "textarea") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <textarea
                      className="w-full p-2 border border-primary outline-none"
                      placeholder={`Masukan ${NameFormat(input.name)}`}
                      type="text"
                      id={input.name}
                      defaultValue={input.defaultValue}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                    ></textarea>
                  </div>
                );
              } else if (input.type === "number") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <input
                      className="w-full p-2 border-b-2 border-primary outline-none"
                      placeholder={`Masukan ${NameFormat(input.name)}`}
                      type="text"
                      inputMode="numeric"
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      // Tambahan untuk mencegah paste text
                      onPaste={(e) => {
                        const pasteData = e.clipboardData.getData("text");
                        if (!/^\d+$/.test(pasteData)) {
                          e.preventDefault();
                        }
                      }}
                      id={input.name}
                      defaultValue={input.defaultValue}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                    />
                  </div>
                );
              } else if (input.type === "select-slide") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <div className="flex">
                      <div className="w-1/2 mr-2">
                        <h2 className="text-md font-semibold mb-2">Tersedia</h2>
                        <div className="border border-primary rounded p-2">
                          <input
                            className="w-full py-1 px-2 rounded-md border outline-none"
                            placeholder={`Masukan ${input.name} Tersedia`}
                            type="text"
                            onChange={(e) => handleSearchChange(e, "available")}
                          />
                          <ul className="h-32 overflow-y-auto">
                            {filteredAvailableItems.map((item) => (
                              <li
                                key={item.key}
                                className="p-2 my-1 bg-neutral-subtle hover:bg-secondary hover:text-white cursor-pointer"
                                onClick={() =>
                                  handleItemClick(item.key, "available")
                                }
                              >
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="w-1/2 ml-2">
                        <h2 className="text-md font-semibold mb-2">Dipilih</h2>
                        <div className="border border-primary rounded p-2">
                          <input
                            className="w-full py-1 px-2 rounded-md border outline-none"
                            placeholder={`Masukan ${input.name} Dipilih`}
                            type="text"
                            onChange={(e) => handleSearchChange(e, "selected")}
                          />
                          <ul className="border border-neutral-subtle rounded p-2 h-32 overflow-y-auto">
                            {filteredSelectedItems.map((item) => (
                              <li
                                key={item.key}
                                className="p-2 my-1 bg-neutral-subtle hover:bg-secondary hover:text-white cursor-pointer"
                                onClick={() =>
                                  handleItemClick(item.key, "selected")
                                }
                              >
                                {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else if (input.type === "table-input") {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <table className="w-full mb-4 border-collapse border border-neutral-subtle">
                      <thead>
                        <tr className="bg-neutral-subtle">
                          {input.header.map((headerItem, headerIndex) => (
                            <th
                              key={headerIndex}
                              className="border border-neutral-subtle p-2"
                            >
                              {headerItem}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(formData[tabelInput] || []).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {input.header.map((headerItem, headerIndex) => (
                              <td
                                key={headerIndex}
                                className="border border-neutral-subtle p-2"
                              >
                                <input
                                  type="text"
                                  className="w-full p-2 border border-neutral-subtle rounded"
                                  defaultValue={row[headerItem] || ""}
                                  readOnly={headerItem == "id"}
                                  onChange={(e) =>
                                    handleRowChange(
                                      rowIndex,
                                      headerItem,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-subtle"
                      onClick={addRow}
                    >
                      Tambah Data
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="mb-4" key={index}>
                    <label
                      className="block text-sm font-medium mb-2 text-accent"
                      htmlFor={input.name}
                    >
                      {NameFormat(input.name)}
                    </label>
                    <input
                      className="w-full p-2 border-b-2 border-primary outline-none"
                      placeholder={`Masukan ${NameFormat(input.name)}`}
                      type={input.type}
                      id={input.name}
                      defaultValue={input.defaultValue}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.value)
                      }
                    />
                  </div>
                );
              }
            })}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="bg-danger text-white px-4 py-2 rounded hover:bg-secondary"
              onClick={() => {
                setIsInputData(false);
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              ref={modalRef}
              className="bg-success text-white px-4 py-2 rounded hover:bg-primary-subtle"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputData;
