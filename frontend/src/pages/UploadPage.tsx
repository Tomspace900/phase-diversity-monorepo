import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
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

  if (isSessionLoading || !currentSession) {
    return <LoadingState message="Loading session..." />;
  }

  const handleUploadComplete = (images: ParsedImages) => {
    updateSessionImages(images);
    setUploadData(images);
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
          value: uploadData.stats.original_dtype,
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
      {!uploadData ? (
        <ImageUploader onUploadComplete={handleUploadComplete} />
      ) : (
        <div className="space-y-6">
          <Card className="border-accent-cyan/20">
            <CardHeader className="bg-accent-cyan/5">
              <CardTitle className="text-accent-cyan flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Uploaded Images
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadData.image_info.map(({ thumbnail }, index) => (
                  <div key={index} className="group">
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-2 border-border group-hover:border-accent-cyan/50 transition-all duration-300">
                      <img
                        src={thumbnail}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                        <span className="text-white text-sm font-semibold">
                          Image {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <StatsGrid title="Dataset Information" stats={stats} columns={3} />
        </div>
      )}
    </div>
  );
};

export default UploadPage;
