const fs = require('fs');

global.DOMMatrix = global.DOMMatrix || class {};
global.ImageData = global.ImageData || class {};
global.Path2D = global.Path2D || class {};

const pdfParse = require('pdf-parse');

async function testPdf() {
  try {
    const buffer = fs.readFileSync('package.json'); // Just reading any file to see if require works
    console.log("PDF parse loaded without crash!");
  } catch (e) {
    console.error(e);
  }
}
testPdf();
