import React from 'react';
import { X, Download, Camera } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string | null;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  title,
  imageUrl,
}: ImagePreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-700 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-bold truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-4 flex items-center justify-center overflow-auto bg-slate-950 min-h-[350px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
