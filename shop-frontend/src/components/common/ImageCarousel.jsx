import React, { useState } from 'react';
import { getImageSrc } from '../../utils/config';

const ImageCarousel = ({ images = [], mainImage = '' }) => {
  // 整合圖片來源：優先用 images 陣列，若為空則用 mainImage
  const allImages = images.length > 0 ? images : (mainImage ? [mainImage] : []);
  const [current, setCurrent] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-200 flex items-center justify-center">
        <span className="text-slate-400">No Image</span>
      </div>
    );
  }

  const prev = () => setCurrent(c => (c === 0 ? allImages.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === allImages.length - 1 ? 0 : c + 1));

  return (
    <div className="w-full">
      {/* 主圖區 */}
      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden group">
        <img
          src={getImageSrc(allImages[current])}
          alt={"Product image " + (current + 1)}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* 左右箭頭 (圖片超過 1 張才顯示) */}
        {allImages.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900 bg-opacity-50 text-white w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 bg-opacity-50 text-white w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 頁碼指示器 */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {allImages.map((_, idx) => (
              <button key={idx} onClick={() => setCurrent(idx)}
                className={"w-2.5 h-2.5 rounded-full transition-all " +
                  (idx === current ? "bg-amber-500 scale-125" : "bg-white bg-opacity-60 hover:bg-opacity-90")} />
            ))}
          </div>
        )}
      </div>

      {/* 縮圖列 (圖片超過 1 張才顯示) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)}
              className={"w-16 h-16 flex-shrink-0 border-2 overflow-hidden transition-all " +
                (idx === current ? "border-amber-500 opacity-100" : "border-transparent opacity-60 hover:opacity-90")}>
              <img src={getImageSrc(img)} alt={"thumb " + (idx + 1)} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
