import { Button, Modal } from "flowbite-react";

const ModalDelete = ({ openModal, setOpenModal, title, setReturnModal }) => {
  return (
    <div>
      {openModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-center items-center mb-4">
              <div className="text-red-500 text-4xl">
                <i className="fa-solid fa-triangle-exclamation fa-beat"></i>
              </div>
            </div>
            <p className="text-lg font-medium text-center mb-6">{title}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setReturnModal(true);
                  setOpenModal(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => {
                  setOpenModal(false);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Tidak jadi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ModalDelete;
