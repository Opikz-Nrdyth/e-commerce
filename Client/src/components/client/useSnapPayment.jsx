import { useEffect, useState } from "react";
const useSnapPayment = () => {
  const [snap, setSnap] = useState(null);
  const actionCallbacks = {}; // Penyimpanan callback berdasarkan embedId

  useEffect(() => {
    const midtransScriptUrl = import.meta.env.VITE_MIDTRANS_URL;

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;

    const myMidtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENTKEY;
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);
    scriptTag.onload = () => {
      setSnap(window.snap);
    };

    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

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
