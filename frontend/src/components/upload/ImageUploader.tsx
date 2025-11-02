import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Dropzone, DropzoneEmptyState } from "../ui/dropzone";
import { parseImages } from "../../api";
import { type ParsedImages } from "../../types/session";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  FileUploadIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";

interface ImageUploaderProps {
  onUploadComplete: (data: ParsedImages) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const parsedData = await parseImages(formData);

      onUploadComplete(parsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  const handleFilesSelected = (acceptedFiles: File[]): void => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setError(null);
  };

  const handleRemoveFile = (index: number): void => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (uploading) {
    return <LoadingState message="Parsing FITS images..." />;
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Upload Images</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-auto p-6">
        {error && (
          <Alert variant="error">
            <strong>Upload Error:</strong> {error}
          </Alert>
        )}

        {files.length === 0 && (
          <Alert variant="info" className="flex-shrink-0">
            <strong>NumPy arrays:</strong> If you're interested in importing or
            pasting NumPy arrays directly, let me know!
          </Alert>
        )}

        {files.length > 0 && (
          <Card className="border-accent-cyan/30 bg-accent-cyan/5 flex-shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-accent-cyan">
                Selected Files ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-card rounded-md border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="icon"
                    onClick={() => handleRemoveFile(index)}
                    color="error"
                    size="sm"
                    icon={Delete01Icon}
                    className="ml-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {files.length > 0 && (
          <Button
            onClick={handleUpload}
            color="primary"
            size="lg"
            icon={Upload01Icon}
            className="w-full flex-shrink-0"
          >
            Upload All ({files.length} file{files.length > 1 ? "s" : ""})
          </Button>
        )}

        <Dropzone
          onDrop={handleFilesSelected}
          onError={(err) => setError(err.message)}
          maxFiles={10}
          accept={{
            "application/fits": [".fits", ".fit"],
            "application/octet-stream": [".fits", ".fit"],
          }}
          src={undefined}
          className="flex-1 min-h-0"
        >
          <DropzoneEmptyState>
            <EmptyState
              icon={
                <HugeiconsIcon
                  icon={FileUploadIcon}
                  className="h-16 w-16 text-muted-foreground/50"
                />
              }
              title={files.length > 0 ? "Add more files" : "Upload images"}
              description="Click to browse or drag and drop FITS (.fits, .fit) files (2-10 images required)"
              accentColor="cyan"
            />
          </DropzoneEmptyState>
        </Dropzone>
      </CardContent>
    </Card>
  );
};

export default ImageUploader;
