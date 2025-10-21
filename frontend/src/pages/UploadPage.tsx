import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSession } from "../contexts/SessionContext";
import ImageUploader from "../components/ImageUploader";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { StatsGrid, type Stat } from "../components/scientific";
import { type ParsedImages } from "../types/session";

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSession, updateSessionImages } = useSession();

  const [uploadData, setUploadData] = useState<ParsedImages | null>(null);

  // Restore upload data from existing session if available
  useEffect(() => {
    if (currentSession?.images) {
      setUploadData(currentSession.images);
    }
  }, [currentSession]);

  const handleUploadComplete = async (data: ParsedImages): Promise<void> => {
    if (!currentSession) {
      console.error("Upload complete but no active session found.");
      alert("Error: No active session. Please create a new session first.");
      return;
    }

    try {
      updateSessionImages(data);
      setUploadData(data);
    } catch (error) {
      console.error("Failed to update session with images:", error);
    }
  };

  const handleNextStep = (): void => {
    if (currentSession) {
      navigate(`/configure`);
    }
  };

  const handleNewSession = async (): Promise<void> => {
    setUploadData(null);
  };

  // Prepare stats for StatsGrid
  const stats: Stat[] = uploadData
    ? [
        {
          label: "Images",
          value: uploadData.stats.shape[0],
          precision: 0,
          color: "cyan",
        },
        {
          label: "Dimensions",
          value: uploadData.stats.shape[1],
          unit: "× " + uploadData.stats.shape[2] + " px",
          precision: 0,
          color: "green",
        },
        {
          label: "Dynamic Range",
          value: uploadData.stats.max - uploadData.stats.min,
          unit: "ADU",
          notation: "scientific",
          precision: 2,
          color: "purple",
        },
        {
          label: "Mean Flux",
          value: uploadData.stats.mean,
          unit: "ADU",
          notation: "scientific",
          precision: 3,
          color: "orange",
        },
        {
          label: "Std Dev",
          value: uploadData.stats.std,
          unit: "ADU",
          notation: "scientific",
          precision: 3,
        },
        {
          label: "Data Type",
          value: uploadData.original_dtype as any,
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto">
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
                  <CardTitle className="text-accent-green">
                    Uploaded Images
                  </CardTitle>
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

          {/* Next Button */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleNewSession}>
              Upload New Images
            </Button>
            <Button
              onClick={handleNextStep}
              size="lg"
              className="group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Next: Configure Setup
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
