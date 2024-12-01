const Ulasan = ({ item }) => {
  const formatedDateIndonesia = (dateString) => {
    const originalDate = new Date(dateString); // Format valid

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    // Menggunakan Intl.DateTimeFormat untuk memformat tanggal dalam bahasa Indonesia
    const formattedDate = new Intl.DateTimeFormat("id-ID", options).format(
      originalDate
    );

    return formattedDate;
  };
  return (
    <div className="max-w-2xl mx-auto bg-neutral rounded-lg shadow-md p-6 mb-3">
      <div className="flex items-start space-x-4">
        <img
          src={
            item?.user_id?.jenis_kelamin == "woman"
              ? "/Images/user-woman.jpg"
              : "/Images/user-man.jpg"
          }
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              {item?.user_id?.username}
            </h3>
            <span className="text-sm text-gray-500">
              {formatedDateIndonesia(item?.createdAt)}
            </span>
          </div>

          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }, (_, index) => (
              <i
                key={index}
                className={`fas fa-star ${
                  index < item.rating ? "text-yellow-500" : "text-gray-300"
                }`}
              ></i>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-gray-600 leading-relaxed">{item?.comment}</p>

      <div className="mt-4 grid lg:grid-cols-6 sm:grid-cols-4 gap-1">
        {item?.thumbnail?.map((thumbnail, index) => (
          <img
            key={index}
            src={`${import.meta.env.VITE_BASE_URL}${thumbnail.url}`}
            alt="Review Image 1"
            className="w-[64px] h-[64px] object-cover rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};
export default Ulasan;
