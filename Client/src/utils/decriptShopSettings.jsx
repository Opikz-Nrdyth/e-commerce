import { Buffer } from "buffer";

export const DeckriptData = (EnskripData) => {
  const hexToBase64 = Buffer.from(EnskripData, "hex").toString("base64");
  const Base64ToBase64 = Buffer.from(hexToBase64, "base64").toString("utf-8");
  const OriginalData = Buffer.from(Base64ToBase64, "base64").toString("utf-8");

  return OriginalData;
};
