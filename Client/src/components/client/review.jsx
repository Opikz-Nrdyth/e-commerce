import React, { useEffect, useState } from "react";
import { UseCreateData, UseUploadPhoto } from "../../services/service_api";

const ReviewPage = ({ show, setShow, dataReview, setData }) => {
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState("");
  const [payload, setPayload] = useState({
    data: {},
  });

  const emojis = [
    {
      src: "https://em-content.zobj.net/source/twitter/408/slightly-frowning-face_1f641.png",
      label: "Terrible",
    },
    {
      src: "https://em-content.zobj.net/source/twitter/408/pensive-face_1f614.png",
      label: "Bad",
    },
    {
      src: "https://em-content.zobj.net/source/twitter/408/neutral-face_1f610.png",
      label: "Okay",
    },
    {
      src: "https://em-content.zobj.net/source/twitter/408/winking-face_1f609.png",
      label: "Good",
    },
    {
      src: "https://em-content.zobj.net/source/twitter/408/hugging-face_1f917.png",
      label: "Amazing",
    },
  ];

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages(files);
  };

  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        user_id: dataReview.user_id,
        product_id: [dataReview.product_id],
        rating: selected + 1,
        comment: comments,
        thumbnail: [],
      },
    }));
  }, [selected, images, comments]);

  const handlePostData = async () => {
    const postRating = await UseCreateData("api/reviews", payload);
    if (postRating.status == "success") {
      const postId = postRating.data.data.documentId;

      const formImages = new FormData();
      // Tambahkan gambar yang dipilih
      for (let i = 0; i < images.length; i++) {
        formImages.append("files", images[i]);
      }
      // Menambahkan informasi relasi dengan produk
      formImages.append("ref", "api::review.review");
      formImages.append("refId", postId); // dataId adalah ID produk yang ingin dikaitkan
      formImages.append("field", "thumbnail");

      const uploadImages = await UseUploadPhoto(formImages);
      if (uploadImages.status == "success") {
        let imagesId = [];
        uploadImages.data.map((id_images) =>
          imagesId.push(id_images.documentId)
        );
        const updatedPayload = {
          ...payload,
          data: {
            ...payload.data,
            thumbnail: imagesId,
          },
        };

        console.log(updatedPayload);
      }
    }
  };
  return (
    <div
      className="fixed left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] shadow-custom lg:w-[40%] sm:w-[80%] max-h-[95vh] overflow-auto z-50 bg-white p-4 rounded-md"
      hidden={!show}
    >
      <h1 className="text-2xl font-bold mb-4">
        Berikan Review {dataReview.product_name}
      </h1>
      <p className="text-gray-600 mb-6">
        Bagaimana pendapat Anda tentang produk {dataReview.product_name} yang
        anda beli?
      </p>
      <div className="flex justify-center items-center space-x-4 mb-6">
        {emojis.map((emoji, index) => (
          <div
            key={index}
            className={`cursor-pointer w-[70px] flex flex-col items-center ${
              selected === index ? "selected" : ""
            }`}
            onClick={() => setSelected(index)}
          >
            <img
              src={emoji.src}
              alt={emoji.label}
              className="emoji mb-2 h-[30px] w-[30px]"
            />
            <p
              className={`text-sm text-center w-[70px] ${
                selected === index ? "text-red-500 font-bold" : "text-gray-600"
              }`}
            >
              {emoji.label}
            </p>
          </div>
        ))}
      </div>
      <div className="text-left mb-6">
        <label className="block text-gray-700 font-bold mb-2">
          Apa alasan utama untuk penilaian Anda?
        </label>
        <textarea
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Tuliskan pengalaman anda"
          onChange={(e) => {
            setComments(e.target.value);
          }}
        ></textarea>
      </div>
      <div className="text-left mb-6">
        <label className="block text-gray-700 font-bold mb-2">
          Bagikan foto anda
        </label>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={URL.createObjectURL(image)}
              alt={`Uploaded ${index}`}
              className="w-full h-auto rounded-lg"
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          className="bg-black text-white py-2 px-4 rounded-lg"
          onClick={handlePostData}
        >
          Kirim
        </button>
        <button
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
          onClick={() => {
            setData({
              product_id: "",
              product_name: "",
            });
            setShow(false);
          }}
        >
          Membatalkan
        </button>
      </div>
    </div>
  );
};

export default ReviewPage;
