import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { parseImages } from "../../api";
import { type ParsedImages } from "../../types/session";
import { LoadingState } from "../common";

interface ImageUploaderProps {
  onUploadComplete: (data: ParsedImages) => void;
  existingData?: ParsedImages | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  existingData = null,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadData, setUploadData] = useState<ParsedImages | null>(
    existingData
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update uploadData when existingData changes
  useEffect(() => {
    if (existingData) {
      setUploadData(existingData);
    }
  }, [existingData]);

  // Auto-upload when files are selected
  useEffect(() => {
    if (files.length > 0 && !uploading) {
      handleUpload();
    }
  }, [files]);

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await parseImages(formData);

      // Convert response to ParsedImages format
      const parsedData: ParsedImages = {
        images: response.images,
        thumbnails: response.thumbnails,
        stats: response.stats,
        original_dtype: response.original_dtype,
      };

      setUploadData(parsedData);
      setUploading(false);
      onUploadComplete(parsedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const fileList = e.target.files;
    if (fileList) {
      setFiles(Array.from(fileList));
      setError(null);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    setError(null);
  };

  // Reset and select new files
  const handleSelectNew = (): void => {
    setFiles([]);
    setUploadData(null);
    setUploading(false);
    setError(null);
    fileInputRef.current?.click();
  };

  // Trigger file input click
  const handleBrowseClick = (): void => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Upload className="h-5 w-5" />
          Upload Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert variant="info" icon="💡" size="sm">
          <ul className="space-y-1">
            <li>
              <strong>Accepted formats:</strong>
            </li>
            <li>• Single FITS file with 2+ image extensions</li>
            <li>• Multiple separate FITS files</li>
            <li>• NumPy array (.npy) with shape (N, H, W)</li>
          </ul>
        </Alert>

        {/* Show existing images if present */}
        {uploadData && !uploading && (
          <Card className="border-success/30 bg-success/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                Images Loaded ({uploadData.stats.shape[0]} images)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Image stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-card rounded-md p-2 border border-border">
                  <span className="text-muted-foreground">Shape:</span>{" "}
                  <span className="font-mono text-foreground">
                    {uploadData.stats.shape.join(" × ")}
                  </span>
                </div>
                <div className="bg-card rounded-md p-2 border border-border">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-mono text-foreground">
                    {uploadData.stats.dtype}
                  </span>
                </div>
                <div className="bg-card rounded-md p-2 border border-border">
                  <span className="text-muted-foreground">Range:</span>{" "}
                  <span className="font-mono text-foreground">
                    [{uploadData.stats.min.toExponential(2)},{" "}
                    {uploadData.stats.max.toExponential(2)}]
                  </span>
                </div>
                <div className="bg-card rounded-md p-2 border border-border">
                  <span className="text-muted-foreground">Mean ± Std:</span>{" "}
                  <span className="font-mono text-foreground">
                    {uploadData.stats.mean.toExponential(2)} ±{" "}
                    {uploadData.stats.std.toExponential(2)}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {uploadData.thumbnails && uploadData.thumbnails.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">
                    Image Previews:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadData.thumbnails.map((thumb, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={thumb}
                          alt={`Image ${idx + 1}`}
                          className="w-full rounded border border-border bg-muted"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            Image {idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSelectNew}
                  color="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Different Images
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drag & Drop Zone */}
        {!uploading && !uploadData && (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-accent-cyan bg-accent-cyan/10 scale-[1.02]"
                : "border-border hover:border-primary hover:bg-muted/50"
            }`}
          >
            <div className="flex flex-col items-center">
              <ImageIcon className="h-12 w-12 mb-3 text-muted-foreground" />
              <p className="text-sm text-foreground">
                <span className="text-primary font-semibold">
                  Click to browse
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                FITS (.fits, .fit) or NumPy (.npy)
              </p>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".fits,.fit,.npy"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Uploading State */}
        {uploading && <LoadingState message="Processing images..." />}

        {/* Error Display */}
        {error && !uploading && (
          <Alert
            variant="error"
            icon={<XCircle className="h-4 w-4" />}
            title="Upload Failed"
            size="sm"
          >
            <p className="mb-3">{error}</p>
            <Button onClick={handleSelectNew} color="secondary" size="sm">
              Select New Files
            </Button>
          </Alert>
        )}

        {/* Data info display */}
        {uploadData && (
          <Alert variant="default" size="xs">
            <p className="font-mono text-xs">
              {uploadData.stats.shape[0]} images loaded (
              {uploadData.original_dtype})
            </p>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
