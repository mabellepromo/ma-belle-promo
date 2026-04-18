/**
 * Compresse et redimensionne une image avant stockage.
 * Réduit une photo de ~3 Mo à ~25 Ko pour éviter de saturer le localStorage.
 */
export function compressImage(file, maxW = 300, quality = 0.72) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxW / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
