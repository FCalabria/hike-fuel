import { forwardRef, useRef, useImperativeHandle, useState } from 'react';

type MaybeString = string | null | undefined;
export type ImageLoaderHandle = {
  loadImage(): void;
};

const ImageLoader = forwardRef<
  ImageLoaderHandle,
  { onChange: (s: MaybeString) => any }
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
    reader.onload = async ({ target }) => {
      onChange(target?.result as MaybeString);
    };
    reader.readAsDataURL(file);
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
export default ImageLoader;
