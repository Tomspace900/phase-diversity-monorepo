import React from "react";

interface ImagePreviewProps {
  sessionId: string;
  numImages: number;
  imageShape: number[];
  thumbnails: string[];
  stats: {
    shape: number[];
    dtype: string;
    min: number;
    max: number;
    mean: number;
    std: number;
  };
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  sessionId,
  numImages,
  imageShape,
  thumbnails,
  stats,
}) => {
  // Parse dimensions from shape
  const dimensions = imageShape.length >= 3
    ? `${imageShape[1]} × ${imageShape[2]} px`
    : imageShape.length === 2
    ? `${imageShape[0]} × ${imageShape[1]} px`
    : "Unknown";

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✅</span>
        <h2 className="text-2xl font-semibold text-green-400">
          Upload Successful
        </h2>
      </div>

      {/* Dataset Information */}
      <div className="bg-gray-900 rounded-lg p-5 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
          Dataset Information
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Images</p>
            <p className="text-white font-semibold text-lg">{numImages}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Dimensions</p>
            <p className="text-white font-mono">{dimensions}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Dynamic Range</p>
            <p className="text-white font-mono text-sm">
              [{stats.min.toExponential(2)}, {stats.max.toExponential(2)}] ADU
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Mean Flux</p>
            <p className="text-white font-mono">
              {stats.mean.toExponential(3)} ADU
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Std Dev</p>
            <p className="text-white font-mono">
              {stats.std.toExponential(3)} ADU
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Data Type</p>
            <p className="text-white font-mono">{stats.dtype}</p>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {thumbnails && thumbnails.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-5 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            Image Previews
          </p>
          <div className="grid grid-cols-3 gap-4">
            {thumbnails.map((thumbnail, index) => (
              <div key={index} className="flex flex-col items-center">
                <img
                  src={thumbnail}
                  alt={`Image ${index + 1}`}
                  className="w-full h-auto rounded border border-gray-700 bg-gray-800"
                  style={{ imageRendering: "pixelated" }}
                />
                <p className="text-xs text-gray-500 mt-2">Image {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session ID - Secondary info, collapsible */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-400 select-none">
          Session details
        </summary>
        <div className="mt-2 pl-4 font-mono text-gray-600">ID: {sessionId}</div>
      </details>
    </div>
  );
};

export default ImagePreview;
