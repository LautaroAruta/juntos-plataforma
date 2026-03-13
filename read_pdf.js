const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log("TEXT_START\n" + pdfParser.getRawTextContent() + "\nTEXT_END");
});

pdfParser.loadPDF("c:\\Users\\user\\Downloads\\JUNTOS\\juntos-plataforma\\Frontend para E-commerce con IA.pdf");
