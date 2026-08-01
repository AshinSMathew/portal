"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

interface PosterUploadProps {
  value: string;
  onChange: (base64Url: string) => void;
  onRemove: () => void;
}

export function PosterUpload({ value, onChange, onRemove }: PosterUploadProps) {
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          onChange(compressed);
        }
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePosterChange}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={compressing}
          className="h-11 px-5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/25 text-white font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          {compressing ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#e8594c]" />
          ) : (
            <ImagePlus className="w-4 h-4 text-[#e8594c]" />
          )}
          <span>{value ? "Change Image" : "Choose Image"}</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={onRemove}
            className="h-11 px-4 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-medium text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {value && (
        <div className="relative mt-1 border border-white/15 rounded-2xl overflow-hidden w-full max-w-sm aspect-video bg-black/40 flex items-center justify-center p-1">
          <img
            src={value}
            alt="Poster Preview"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}