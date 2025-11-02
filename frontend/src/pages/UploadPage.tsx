import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import ImageUploader from "../components/upload/ImageUploader";
import { LoadingState, StatsGrid, type Stat } from "../components/common";
import { type ParsedImages } from "../types/session";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable";
import { Button } from "../components/ui/button";
import { ImagePlotGrid } from "../components/upload/ImagePlotGrid";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { CardHeader, CardTitle } from "@/components/ui/card";
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

  const handleUploadComplete = async (images: ParsedImages) => {
    await updateSessionImages(images);
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
    <div className="h-[calc(100vh-8rem)]">
      {!uploadData ? (
        <ImageUploader onUploadComplete={handleUploadComplete} />
      ) : (
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg border"
        >
          <ResizablePanel defaultSize={70} minSize={50} maxSize={85}>
            <div className="h-full flex flex-col">
              <CardHeader className="pb-0 flex-shrink-0">
                <CardTitle className="text-lg">Uploaded Images</CardTitle>
              </CardHeader>
              <div className="flex-1 p-6 min-h-0">
                <ImagePlotGrid
                  images={uploadData.images}
                  imageInfo={uploadData.image_info}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
            <div className="h-full flex flex-col">
              <div className="p-4 flex-1 overflow-auto">
                <StatsGrid
                  title="Dataset Information"
                  stats={stats}
                  columns={1}
                />
              </div>

              <div className="p-4 border-t">
                <Button
                  icon={ArrowRight01Icon}
                  color="primary"
                  size="lg"
                  onClick={() => navigate("/setup")}
                  className="w-full"
                >
                  Continue to Setup
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
};

export default UploadPage;
