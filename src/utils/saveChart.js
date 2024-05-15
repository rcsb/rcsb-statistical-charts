import html2canvas from 'html2canvas'

export default async function saveTargetAsImage(targetElement, optionalName) {
    // Turn HTML into canvas
    const canvas = await html2canvas(targetElement);
    // Create Image Blob
    const base64image = canvas.toDataURL("image/png");
    // Name the file
    const fileName = `${optionalName || targetElement.id || targetElement.tagName}.png`;
    // Convert to file data
    const file = await urltoFile(fileName, base64image);
    // Download data
    downloadFile(fileName, file);
}

//return a promise that resolves with a File instance
function urltoFile(fileName, url, mimeType) {
    // set mime type
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    // fetch the data, return file
    return (fetch(url)
        .then(function (res) { return res.arrayBuffer(); })
        .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
    );
}

const DOWNLOAD_FILE_A_TAG = document.createElement("a");

function downloadFile(fileName, data) {
    // Turn data into Blob
    const file = new Blob([data], { type: 'text/plain' });
    // Create link
    DOWNLOAD_FILE_A_TAG.href = URL.createObjectURL(file);
    // Force download
    DOWNLOAD_FILE_A_TAG.download = fileName;
    // Trigger download on click
    DOWNLOAD_FILE_A_TAG.click();
    // Turn off link
    URL.revokeObjectURL(DOWNLOAD_FILE_A_TAG.href);
};