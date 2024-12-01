import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../common/useToast";
import { UseUpdateData, UseUploadPhoto } from "../../services/service_api";

const Profile = ({ userData, fetchData }) => {
  const navigate = useNavigate();

  const { showToast, ToastComponent } = useToast();
  const fullname =
    userData?.first_name && userData?.last_name
      ? userData?.first_name + " " + userData?.last_name
      : userData?.username;

  const profileUrl = userData?.profile?.url
    ? `${import.meta.env.VITE_BASE_URL}${userData?.profile?.url}`
    : userData?.profile_url
    ? userData?.profile_url
    : userData?.jenis_kelamin == "woman"
    ? "/Images/user-woman.jpg"
    : "/Images/user-man.jpg";

  let formattedDate;
  if (userData) {
    const createAt = new Date(userData?.createdAt);
    // Format tanggal menjadi "Bergabung sejak [bulan] [tahun]"
    const options = { year: "numeric", month: "long" };
    const formatter = new Intl.DateTimeFormat("id-ID", options);

    formattedDate = `Bergabung sejak ${formatter.format(createAt)}`;
  }

  const SubmitedUpdate = async (e) => {
    e.preventDefault();
    try {
      const loadProfile = userData?.profile?.id ? [userData?.profile?.id] : [];
      const formData = new FormData(e.target);
      const profile = formData.get("profile");
      const first_name = formData.get("first_name");
      const last_name = formData.get("last_name");
      const phone_number = formData.get("phone_number");
      const jenis_kelamin = formData.get("jenis_kelamin");
      const tanggal_lahir = formData.get("tanggal_lahir");
      const id = formData.get("id");

      const payload = {
        first_name:
          first_name && first_name != "" ? first_name : userData.first_name,
        last_name:
          last_name && last_name != "" ? last_name : userData.last_name,
        phone_number:
          phone_number && phone_number != ""
            ? phone_number
            : userData.phone_number,
        jenis_kelamin:
          jenis_kelamin && jenis_kelamin != ""
            ? jenis_kelamin
            : userData.jenis_kelamin,
        tanggal_lahir:
          tanggal_lahir && tanggal_lahir != ""
            ? tanggal_lahir
            : userData.tanggal_lahir,
        profile: loadProfile,
      };

      const updateData = await UseUpdateData("api/users", id, payload);
      if (updateData.status == "success") {
        try {
          const formData = new FormData();
          formData.append("files", profile);
          formData.append("ref", "plugin::users-permissions.user");
          formData.append("refId", id);
          formData.append("field", "profile");
          if (
            profile.lastModified != "" &&
            profile.length == 0 &&
            profile.name != ""
          ) {
            const createFoto = await UseUploadPhoto(formData);
            if (createFoto.status == "success") {
              showToast("Profil berhasil diperbarui!", "success", 2000);
              fetchData();
            } else {
              showToast(
                `Profil Gagal diperbarui!, ${createFoto.message}`,
                "danger",
                5000
              );
            }
          } else {
            showToast("Profil berhasil diperbarui!", "success", 2000);
            fetchData();
          }
        } catch (error) {
          showToast(`Profil Gagal diperbarui!, ${error}`, "danger", 5000);
        }
      } else {
        showToast(
          `Profil Gagal diperbarui!, ${createFoto.message}`,
          "danger",
          5000
        );
      }
    } catch (error) {
      showToast(`Profil Gagal diperbarui!, ${error}`, "danger", 5000);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex-1 p-8 sm:p-0 w-full border ">
      {ToastComponent}
      <form onSubmit={SubmitedUpdate} className="bg-base rounded-lg p-6">
        <div className="flex items-center mb-6 sm:flex-col">
          <input
            type="text"
            name="id"
            defaultValue={userData?.id}
            className="hidden"
            readOnly
          />
          <input type="file" id="profile" name="profile" className="hidden" />
          <label htmlFor="profile">
            <img
              src={profileUrl}
              alt="User  Profile"
              className="rounded-full border-4 sm:border-2 border-accent shadow-lg w-[120px] h-[120px] sm:w-[95px] sm:h-[95px]"
            />
          </label>
          <div className="ml-4 sm:text-center">
            <h1 className="text-3xl sm:text-xl font-bold text-primary">
              {`${fullname}`}
            </h1>
            <p className="text-lg sm:text-sm">{userData?.email}</p>
            <p className="text-sm sm:text-xs mt-1">{formattedDate}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-primary mb-4">
          Informasi Profil
        </h2>
        <div className="flex flex-col gap-7 bg-neutral rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Username</div>
            <p>{userData?.username}</p>
          </div>
          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Nama Depan</div>
            <input
              type="text"
              name="first_name"
              className="w-[80%] h-[40px] mt-1 px-3 outline-none bg-neutral border border-gray-400 rounded-md"
              defaultValue={userData?.first_name}
            />
          </div>
          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Nama Belakang</div>
            <input
              type="text"
              name="last_name"
              className="w-[80%] h-[40px] mt-1 px-3 outline-none bg-neutral border border-gray-400 rounded-md"
              defaultValue={userData?.last_name}
            />
          </div>
          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Email</div>
            <p>{userData?.email}</p>
          </div>
          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Nomor Telepon</div>
            {!userData?.phone_number ? (
              <input
                type="text"
                name="phone_number"
                className="w-[80%] h-[40px] mt-1 px-3 outline-none bg-neutral border border-gray-400 rounded-md"
                defaultValue={userData?.phone_number}
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
              />
            ) : (
              <p>{userData?.phone_number}</p>
            )}
          </div>

          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Jenis Kelamin</div>
            <select
              name="jenis_kelamin"
              className="w-[80%] h-[40px] mt-1 px-3 outline-none bg-neutral border border-gray-400 rounded-md"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="man" selected={userData?.jenis_kelamin == "man"}>
                Laki-laki
              </option>
              <option
                value="woman"
                selected={userData?.jenis_kelamin == "woman"}
              >
                Perempuan
              </option>
            </select>
          </div>

          <div className="flex items-center gap-7">
            <div className="w-[20%] text-end">Tanggal Lahir</div>
            <input
              name="tanggal_lahir"
              type="date"
              className="w-[80%] h-[40px] mt-1 px-3 outline-none bg-neutral border border-gray-400 rounded-md"
              defaultValue={userData?.tanggal_lahir}
            />
          </div>
          <div className="flex gap-3">
            <button
              className="px-3 py-2 bg-secondary text-white rounded-md"
              type="submit"
            >
              Update Profile
            </button>
            <button
              className="px-3 py-2 bg-danger text-white rounded-md"
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default Profile;
