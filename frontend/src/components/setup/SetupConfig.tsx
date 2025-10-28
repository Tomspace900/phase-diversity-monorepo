import { useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { type OpticalConfig } from "../../types/session";
import { useSession } from "../../contexts/SessionContext";
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
} from "../../utils/validation";
import {
  ImagesTab,
  PupilTab,
  OpticsTab,
  ObjectTab,
  PhaseTab,
} from "../setup";

const SetupConfig = ({
  config,
  updateConfig,
}: {
  config: OpticalConfig;
  updateConfig: <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ) => void;
}) => {
  const { currentSession } = useSession();
  const expectedImagesCount = currentSession?.images?.images.length ?? 0;

  // Compute all validations (memoized for performance)
  const validations = useMemo(() => {
    return {
      wvl: validateWavelength(config.wvl),
      pixelSize: validatePixelSize(config.pixelSize),
      fratio: validateFratio(config.fratio),
      obscuration: validateObscuration(config.obscuration),
      N: validateComputationSize(config.N),
      defoc_z: validateDefocusArray(config.defoc_z, expectedImagesCount),
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
    expectedImagesCount,
  ]);

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

  return (
    <div className="h-full overflow-auto p-6">
      <Tabs defaultValue="images">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="pupil">Pupil</TabsTrigger>
          <TabsTrigger value="optics">Optics</TabsTrigger>
          <TabsTrigger value="object">Object</TabsTrigger>
          <TabsTrigger value="phase">Phase Basis</TabsTrigger>
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
    </div>
  );
};

export default SetupConfig;
