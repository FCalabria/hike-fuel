import { forwardRef, useRef, useImperativeHandle } from 'react';

type MaybeString = string | null | undefined;
export type ImageLoaderHandle = {
  loadImage(): void;
};

const ImageLoader = forwardRef<
  ImageLoaderHandle,
  { onChange: (s: MaybeString) => void }
>(({ onChange }, ref) => {
  const imgButtonRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    loadImage: () => {
      const imgButton = imgButtonRef.current;
      if (!imgButton) {
        // Early return for TS purposes
        return;
      }
      imgButton.click();
    },
  }));

  const handleGetImage = () => {
    const file = imgButtonRef.current?.files?.[0];
    if (!file || file?.size === 0) {
      return;
    }
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const dataUrl = target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIMENSION = 1024;
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onChange(dataUrl);
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to grayscale for contrast and smaller payload
        const imageData = ctx.getImageData(0, 0, width, height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          d[i] = gray;
          d[i + 1] = gray;
          d[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);

        // Compress as JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange(compressedDataUrl);
      };
      img.onerror = () => {
        onChange(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset value so re-selecting same file works
    if (imgButtonRef.current) {
      imgButtonRef.current.value = '';
    }
  };

  return (
    <input
      type='file'
      accept='image/*'
      className='hidden'
      ref={imgButtonRef}
      onChange={handleGetImage}
    />
  );
});
ImageLoader.displayName = 'ImageLoader';
export { ImageLoader };
