import { useState } from 'react';
import { createWorker } from 'tesseract.js';

export function PictureInput() {
  const [imageSrc, setImageSrc] = useState<string>();
  const [reading, setReading] = useState(false);
  const [readText, setReadText] = useState<string>();
  function readImage(image: string) {
    (async () => {
      setReading(true);
      const worker = await createWorker('spa');
      const {
        data: { text, confidence },
      } = await worker.recognize(
        image,
        { rotateAuto: true },
        { tsv: false, blocks: false, text: true }
      );
      console.log(confidence);
      console.log(text);
      if (confidence > 50) {
        setReadText(text);
      }

      await worker.terminate();
      setReading(false);
    })();
  }
  const loaderMarkdown = reading ? (
    <div className='bg-slate-50/50 absolute size-full flex items-center justify-center'>
      <svg
        className='animate-spin -ml-1 mr-3 h-5 w-5 text-black'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          stroke-width='4'
        ></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        ></path>
      </svg>
      <span>Interpretando</span>
    </div>
  ) : null;

  return (
    <>
      <label htmlFor='image' className='inline-block btn w-full mb-2'>
        Usar una imagen
      </label>
      <input
        className='hidden'
        type='file'
        accept='image/*'
        name='image'
        id='image'
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (onLoadEvent) => {
              if (typeof onLoadEvent.target?.result === 'string') {
                setImageSrc(onLoadEvent.target.result);
                readImage(onLoadEvent.target.result);
              }
            };
            reader.readAsDataURL(file);
          }
        }}
      />
      {imageSrc ? (
        <div className='overflow-hidden relative mb-2'>
          {loaderMarkdown}
          <img src={imageSrc} />
        </div>
      ) : null}
    </>
  );
}
