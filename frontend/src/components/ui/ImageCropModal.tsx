import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

/* ── Canvas helper: produce a cropped base64 JPEG from the source image URL ── */
async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── Props ── */
interface ImageCropModalProps {
  imageSrc: string;           // raw data URL from FileReader
  onComplete: (croppedBase64: string) => void;
  onCancel: () => void;
  aspectRatio?: number;       // default 1:1 (square)
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  onComplete,
  onCancel,
  aspectRatio = 1,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onComplete(cropped);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-none shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Crop Photo</h3>
            <p className="text-xs text-slate-400 mt-0.5">Drag to reposition · Pinch or scroll to zoom</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-none hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full bg-slate-900" style={{ height: 340 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={false}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: {
                border: '2px solid #008B2E',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 space-y-3 border-t border-slate-100">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 accent-[#008B2E] cursor-pointer"
            />
            <button
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {/* Rotation */}
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-none hover:bg-slate-100 text-slate-500 transition-colors ml-1"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-none bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-none bg-[#008B2E] text-white text-sm font-bold hover:bg-[#006B22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {processing ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {processing ? 'Applying…' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
