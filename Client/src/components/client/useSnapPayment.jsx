import { useEffect, useState } from "react";
import { get_settings } from "../../services/fetch_settings";
import { DeckriptData } from "../../utils/decriptShopSettings";
const useSnapPayment = () => {
  const [snap, setSnap] = useState(null);
  const actionCallbacks = {}; // Penyimpanan callback berdasarkan embedId
  const [myMidtransClientKey, setMyMidtransClientKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await get_settings();

        const midtransClientId = DeckriptData(settings.midtrans_client);

        if (midtransClientId) {
          setMyMidtransClientKey(midtransClientId);
        } else {
          throw new Error("Midtrans Client ID tidak valid");
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  useEffect(() => {
    if (myMidtransClientKey) {
      const midtransScriptUrl = import.meta.env.VITE_MIDTRANS_URL;

      let scriptTag = document.createElement("script");
      scriptTag.src = midtransScriptUrl;
      scriptTag.setAttribute("data-client-key", myMidtransClientKey);
      scriptTag.onload = () => {
        setSnap(window.snap);
      };

      document.body.appendChild(scriptTag);

      return () => {
        document.body.removeChild(scriptTag);
      };
    } else {
      console.log("Tidak ada midtrans client key");
    }
  }, [myMidtransClientKey]);

  const SnapEmbed = (snap_token, embedId, action) => {
    // Simpan callback berdasarkan embedId
    actionCallbacks[embedId] = action;

    if (snap) {
      snap.embed(snap_token, {
        embedId,
        onSuccess: function (result) {
          console.log("Success", result);
          actionCallbacks[embedId]?.onSuccess?.(result);
        },
        onPending: function (result) {
          console.log("Pending", result);
          actionCallbacks[embedId]?.onPending?.(result);
        },
        onClose: function () {
          actionCallbacks[embedId]?.onClose?.();
        },
      });
    }
  };

  return SnapEmbed;
};

export default useSnapPayment;
