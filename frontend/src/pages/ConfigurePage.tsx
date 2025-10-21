import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { debounce } from "lodash";
import { useSession } from "../contexts/SessionContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { previewConfig } from "../api";
import {
  type OpticalConfig,
  type PreviewConfigResponse,
  DEFAULT_OPTICAL_CONFIG,
} from "../types/session";
import {
  validateWavelength,
  validatePixelSize,
  validateFratio,
  validateObscuration,
  validateComputationSize,
  validateDefocusArray,
  validateEdges,
  validateEdgeBlur,
  validateJmax,
  validateObjectFWHM,
  validateFlattening,
  checkShannonSampling,
} from "../utils/validation";
import {
  ImagesTab,
  PupilTab,
  OpticsTab,
  ObjectTab,
  PhaseTab,
  SetupPreview,
} from "./setup";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/scientific";

const ConfigurePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    isLoading: isSessionLoading,
    updateSessionConfig,
  } = useSession();

  // Configuration state with defaults
  const [config, setConfig] = useState<OpticalConfig>({
    ...DEFAULT_OPTICAL_CONFIG,
  });

  const [previewData, setPreviewData] = useState<PreviewConfigResponse | null>(
    null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
  }, [currentSession, isSessionLoading]);

  // Load session on mount if needed
  useEffect(() => {
    // Ce code reste inchangé, il se base déjà sur currentSession
    if (currentSession?.currentConfig) {
      setConfig(currentSession.currentConfig);
    }
  }, [currentSession]);

  // Si la session n'est pas encore chargée, on peut afficher un loader
  if (!currentSession) {
    return <LoadingState message="No active session..." />;
  }

  // Check if we have images
  const hasImages = currentSession?.images !== undefined;

  // Compute all validations (memoized for performance)
  const validations = useMemo(() => {
    return {
      wvl: validateWavelength(config.wvl),
      pixelSize: validatePixelSize(config.pixelSize),
      fratio: validateFratio(config.fratio),
      obscuration: validateObscuration(config.obscuration),
      N: validateComputationSize(config.N),
      defoc_z: validateDefocusArray(config.defoc_z),
      nedges: validateEdges(config.nedges),
      edgeblur: validateEdgeBlur(config.edgeblur_percent),
      Jmax: validateJmax(config.Jmax, config.basis),
      objectFWHM: validateObjectFWHM(config.object_fwhm_pix),
      flattening: validateFlattening(config.flattening),
      shannon: checkShannonSampling(
        config.wvl,
        config.fratio,
        config.pixelSize
      ),
    };
  }, [
    config.wvl,
    config.pixelSize,
    config.fratio,
    config.obscuration,
    config.N,
    config.defoc_z,
    config.nedges,
    config.edgeblur_percent,
    config.Jmax,
    config.basis,
    config.object_fwhm_pix,
    config.flattening,
  ]);

  // Update a single config value
  const updateConfig = <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ): void => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Update defoc_z array element
  const updateDefocZ = (index: number, value: number): void => {
    const newDefocZ = [...config.defoc_z];
    newDefocZ[index] = value;
    updateConfig("defoc_z", newDefocZ);
  };

  // Update spiderArms array
  const updateSpiderArms = (index: number, value: number): void => {
    const newArms = [...config.spiderArms];
    newArms[index] = value;
    updateConfig("spiderArms", newArms);
  };

  // Add spider arm
  const addSpiderArm = (): void => {
    updateConfig("spiderArms", [...config.spiderArms, 0.035]);
    updateConfig("spiderOffset", [...config.spiderOffset, 0.0]);
  };

  // Remove last spider arm
  const removeSpiderArm = (): void => {
    if (config.spiderArms.length > 0) {
      updateConfig("spiderArms", config.spiderArms.slice(0, -1));
      updateConfig("spiderOffset", config.spiderOffset.slice(0, -1));
    }
  };

  // Update illumination coefficients
  const updateIllum = (index: number, value: number): void => {
    const newIllum = [...config.illum];
    newIllum[index] = value;
    updateConfig("illum", newIllum);
  };

  const addIllumCoeff = (): void => {
    updateConfig("illum", [...config.illum, 0.0]);
  };

  const removeIllumCoeff = (): void => {
    if (config.illum.length > 1) {
      updateConfig("illum", config.illum.slice(0, -1));
    }
  };

  // Fetch preview from API
  const fetchPreview = useCallback(async (): Promise<void> => {
    if (!hasImages || !currentSession) {
      setError("No images available. Please upload images first.");
      setIsLoadingPreview(false);
      return;
    }

    setError(null);

    try {
      if (!currentSession.images) {
        throw new Error("No images in current session");
      }

      const result = await previewConfig({
        images: currentSession.images.images,
        config: config,
      });

      setPreviewData(result);
      updateSessionConfig(config);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Preview failed";
      setError(errorMessage);
      setPreviewData(null);
      console.error("❌ Preview error:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [hasImages, currentSession, config, updateSessionConfig]);

  // Auto-trigger preview on config change (debounced 500ms)
  useEffect(() => {
    if (!hasImages) {
      setIsLoadingPreview(false);
      return;
    }

    setIsLoadingPreview(true);

    const handler = debounce(() => {
      fetchPreview();
    }, 500);

    handler();

    return () => {
      handler.cancel();
    };
  }, [config, hasImages]);

  const handleNext = (): void => {
    if (!previewData) {
      setError("Please wait for preview to load before continuing");
      return;
    }

    if (!currentSession) {
      setError("No active session");
      return;
    }

    updateSessionConfig(config);

    navigate(`/search`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {!hasImages && (
        <Alert variant="warning" icon="⚠️" title="No Images" className="mb-6">
          <p>Please upload images first before configuring the setup.</p>
          <Button
            onClick={() => navigate("/upload")}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Go to Upload
          </Button>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="images">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="images">📸 Images</TabsTrigger>
                  <TabsTrigger value="pupil">🎯 Pupil</TabsTrigger>
                  <TabsTrigger value="optics">🔬 Optics</TabsTrigger>
                  <TabsTrigger value="object">⭐ Object</TabsTrigger>
                  <TabsTrigger value="phase">📊 Phase Basis</TabsTrigger>
                </TabsList>

                <TabsContent value="images">
                  <ImagesTab
                    config={config}
                    validations={{
                      N: validations.N,
                      defoc_z: validations.defoc_z,
                    }}
                    updateConfig={updateConfig}
                    updateDefocZ={updateDefocZ}
                  />
                </TabsContent>

                <TabsContent value="pupil">
                  <PupilTab
                    config={config}
                    validations={{
                      obscuration: validations.obscuration,
                      nedges: validations.nedges,
                      flattening: validations.flattening,
                      edgeblur: validations.edgeblur,
                    }}
                    updateConfig={updateConfig}
                    updateSpiderArms={updateSpiderArms}
                    addSpiderArm={addSpiderArm}
                    removeSpiderArm={removeSpiderArm}
                    updateIllum={updateIllum}
                    addIllumCoeff={addIllumCoeff}
                    removeIllumCoeff={removeIllumCoeff}
                  />
                </TabsContent>

                <TabsContent value="optics">
                  <OpticsTab
                    config={config}
                    validations={{
                      wvl: validations.wvl,
                      fratio: validations.fratio,
                      pixelSize: validations.pixelSize,
                      edgeblur: validations.edgeblur,
                      shannon: validations.shannon,
                    }}
                    updateConfig={updateConfig}
                  />
                </TabsContent>

                <TabsContent value="object">
                  <ObjectTab
                    config={config}
                    validations={{
                      objectFWHM: validations.objectFWHM,
                    }}
                    updateConfig={updateConfig}
                  />
                </TabsContent>

                <TabsContent value="phase">
                  <PhaseTab
                    config={config}
                    validations={{
                      Jmax: validations.Jmax,
                    }}
                    updateConfig={updateConfig}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            <SetupPreview
              previewData={previewData}
              isLoading={isLoadingPreview}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <Button
          onClick={() => navigate("/upload")}
          variant="outline"
          size="lg"
          className="group"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Upload
        </Button>

        <Button
          onClick={handleNext}
          disabled={!previewData || isLoadingPreview}
          variant="default"
          size="lg"
          className="group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:shadow-none"
        >
          Next: Phase Search
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default ConfigurePage;
