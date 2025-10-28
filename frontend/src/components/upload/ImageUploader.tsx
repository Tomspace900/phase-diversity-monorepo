import React, { useState, useRef, useEffect } from "react";
import { Upload, CheckCircle2, FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { parseImages } from "../../api";
import { type ParsedImages } from "../../types/session";
import { LoadingState, EmptyState } from "../common";

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

      const parsedData = await parseImages(formData);

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
    <Card className="shadow-lg border-accent-cyan/20">
      <CardHeader className="bg-accent-cyan/5">
        <CardTitle className="flex items-center gap-2 text-accent-cyan">
          <Upload className="h-5 w-5" />
          Upload Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Instructions */}
        <Alert variant="info" icon="💡" size="sm">
          <p className="text-sm">
            <strong>Accepted formats:</strong> Single FITS file with 2-10 image
            extensions, multiple FITS files, or NumPy array (.npy) with shape
            (N, H, W)
          </p>
        </Alert>

        {/* Show existing images if present */}
        {uploadData && !uploading && (
          <Thumbnails
            uploadData={uploadData}
            handleSelectNew={handleSelectNew}
          />
        )}

        {/* Drag & Drop Zone */}
        {!uploading && !uploadData && (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`border-2 border-dashed rounded-lg py-12 cursor-pointer transition-all ${
              isDragging
                ? "border-accent-cyan bg-accent-cyan/10 scale-[1.02]"
                : "border-border hover:border-accent-cyan/50 hover:bg-accent-cyan/5"
            }`}
          >
            <EmptyState
              icon={
                <FileUp
                  className={`h-16 w-16 ${
                    isDragging ? "text-accent-cyan" : "text-muted-foreground/50"
                  }`}
                />
              }
              title={isDragging ? "Drop files here" : "Upload images"}
              description={
                isDragging
                  ? "Release to upload"
                  : "Click to browse or drag and drop FITS (.fits, .fit) or NumPy (.npy) files"
              }
              accentColor="cyan"
            />
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
          <Alert variant="error" icon="❌" title="Upload Failed" size="sm">
            <p className="mb-3">{error}</p>
            <Button
              onClick={handleSelectNew}
              color="error"
              size="md"
              icon={Upload}
            >
              Try Again
            </Button>
          </Alert>
        )}

        {/* Data info display */}
        {uploadData && (
          <Alert variant="default" size="xs">
            <p className="font-mono text-xs">
              {uploadData.stats.shape[0]} images loaded (
              {uploadData.stats.original_dtype})
            </p>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const Thumbnails = ({
  uploadData,
  handleSelectNew,
}: {
  uploadData: ParsedImages;
  handleSelectNew: () => void;
}) => {
  const { shape, original_dtype, min, max, mean, std } = uploadData.stats;

  return (
    <Card className="border-success/30 bg-success/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-success">
          <CheckCircle2 className="h-4 w-4" />
          Images Loaded ({shape[0]} images)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Image stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-card rounded-md p-2 border border-border">
            <span className="text-muted-foreground">Shape:</span>{" "}
            <span className="font-mono text-foreground">
              {shape.join(" × ")}
            </span>
          </div>
          <div className="bg-card rounded-md p-2 border border-border">
            <span className="text-muted-foreground">Type:</span>{" "}
            <span className="font-mono text-foreground">{original_dtype}</span>
          </div>
          <div className="bg-card rounded-md p-2 border border-border">
            <span className="text-muted-foreground">Range:</span>{" "}
            <span className="font-mono text-foreground">
              [{min.toExponential(2)}, {max.toExponential(2)}]
            </span>
          </div>
          <div className="bg-card rounded-md p-2 border border-border">
            <span className="text-muted-foreground">Mean ± Std:</span>{" "}
            <span className="font-mono text-foreground">
              {mean.toExponential(2)} ± {std.toExponential(2)}
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        {uploadData.image_info.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-semibold">
              Image Previews:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {uploadData.image_info.map(({ thumbnail }, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={thumbnail}
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

        {/* Action button */}
        <Button
          onClick={handleSelectNew}
          color="secondary"
          size="md"
          icon={Upload}
          className="w-full"
        >
          Upload Different Images
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
