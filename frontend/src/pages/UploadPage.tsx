import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import ImageUploader from "../components/upload/ImageUploader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LoadingState, StatsGrid, type Stat } from "../components/common";
import { type ParsedImages } from "../types/session";

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    updateSessionImages,
    isLoading: isSessionLoading,
  } = useSession();

  const [uploadData, setUploadData] = useState<ParsedImages | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
  }, [currentSession, isSessionLoading]);

  useEffect(() => {
    if (currentSession?.images) {
      setUploadData(currentSession.images);
    }
  }, [currentSession]);

  if (!currentSession) {
    return <LoadingState message="No active session..." />;
  }

  const handleUploadComplete = (images: ParsedImages) => {
    try {
      updateSessionImages(images);
      setUploadData(images);
    } catch (error) {
      console.error("Failed to update session with images:", error);
    }
  };

  const stats: Stat[] = uploadData
    ? [
        {
          label: "Images",
          value: uploadData.stats.shape[0],
          precision: 0,
        },
        {
          label: "Dimensions",
          value: `${uploadData.stats.shape[1]} × ${uploadData.stats.shape[2]}`,
          unit: "px",
        },
        {
          label: "Data Type",
          value: uploadData.original_dtype as any,
        },
        {
          label: "Dynamic Range",
          value: uploadData.stats.max - uploadData.stats.min,
          unit: "ADU",
          notation: "scientific",
          precision: 2,
        },
        {
          label: "Mean Flux",
          value: uploadData.stats.mean,
          unit: "ADU",
          notation: "scientific",
          precision: 3,
        },
        {
          label: "Std Dev",
          value: uploadData.stats.std,
          unit: "ADU",
          notation: "scientific",
          precision: 3,
        },
      ]
    : [];

  return (
    <div className="h-[calc(100vh-8rem)] max-w-5xl mx-auto">
      {/* Upload or Preview */}
      {!uploadData ? (
        <ImageUploader onUploadComplete={handleUploadComplete} />
      ) : (
        <div className="space-y-6">
          {uploadData && (
            <>
              {/* Thumbnails */}
              <Card className="border-accent-green/20">
                <CardHeader className="bg-accent-green/5">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-accent-green">
                      Uploaded Images
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {uploadData.thumbnails.map((thumbnail, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center group"
                      >
                        <div className="relative w-full aspect-square">
                          <img
                            src={thumbnail}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border-2 border-border group-hover:border-accent-cyan transition-all duration-300"
                            style={{ imageRendering: "pixelated" }}
                          />
                          <div className="absolute inset-0 bg-accent-cyan/0 group-hover:bg-accent-cyan/10 rounded-lg transition-all duration-300" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dataset Stats */}
              <StatsGrid
                title="Dataset Information"
                stats={stats}
                columns={3}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
