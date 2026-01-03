import axios from "axios";
import * as pdfParse from "pdf-parse";

export const readPdfFromUrl = async (url) => {
  const response = await axios.get(url, {
    responseType: "arraybuffer"
  });

  const data = await pdfParse.default(response.data);
  return data.text.slice(0, 6000); // giới hạn để AI không quá tải
};
