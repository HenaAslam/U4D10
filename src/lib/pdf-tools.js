import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";

export const getPDFReadableStream = async (media) => {
  const fonts = {
    Courier: {
      normal: "Courier",
      bold: "Courier-Bold",
      italics: "Courier-Oblique",
      bolditalics: "Courier-BoldOblique",
    },
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);
  const posterBase64 = await imageToBase64(media.poster);
  const content = [
    { text: media.title, style: "header" },
    { text: media.year, style: "subheader" },
    { text: media.type, style: "subheader" },

    { image: `data:image/jpeg;base64,${posterBase64}`, width: 150 },

    "\n\n",
  ];

  const docDefinition = {
    content: [...content],
    defaultStyle: {
      font: "Helvetica",
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        font: "Courier",
      },
      subheader: {
        fontSize: 15,
        bold: false,
      },
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
  pdfReadableStream.end();

  return pdfReadableStream;
};
