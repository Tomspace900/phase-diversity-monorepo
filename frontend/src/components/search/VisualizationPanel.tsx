import React from "react";
import { BarChart2 } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { EmptyState, StatsGrid, DataTable } from "../common";
import { ScrollArea } from "../ui/scroll-area";
import { useSession } from "../../contexts/SessionContext";
import { PhaseMapPlot } from "./PhaseMapPlot";
import { ImageComparisonGrid } from "./ImageComparisonGrid";
import type { AnalysisRun } from "../../types/session";

interface VisualizationPanelProps {
  run: AnalysisRun | null;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  run,
}) => {
  const { currentSession } = useSession();

  if (!run) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <EmptyState
          icon={<BarChart2 className="h-16 w-16 text-muted-foreground/50" />}
          title="No analysis yet"
          description="Run your first analysis to see results here"
          accentColor="purple"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Results</CardTitle>
          <div className="text-sm text-muted-foreground">
            {new Date(run.timestamp).toLocaleString()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="phase" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="phase">Phase</TabsTrigger>
            <TabsTrigger value="pupil">Pupil</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="params">Parameters</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="phase" className="space-y-4 pr-4">
              <PhaseMapPlot
                phaseMap={run.response.results.phase_map}
                title="Retrieved Phase Map"
              />

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Modal Coefficients
                </h3>
                <DataTable
                  columns={[
                    {
                      key: "mode",
                      label: "Mode",
                      type: "number",
                      precision: 0,
                    },
                    {
                      key: "coefficient",
                      label: "Coefficient",
                      type: "scientific",
                      precision: 3,
                      unit: "rad",
                    },
                  ]}
                  data={run.response.results.phase.map((coef, idx) => ({
                    mode: idx + 1,
                    coefficient: coef,
                  }))}
                  compact
                  className="max-h-64"
                />
              </div>
            </TabsContent>

            <TabsContent value="pupil" className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    Pupil
                  </h3>
                  <img
                    src={run.response.pupil_image}
                    alt="Pupil"
                    className="w-full border rounded"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    Illumination
                  </h3>
                  <img
                    src={run.response.illumination_image}
                    alt="Illumination"
                    className="w-full border rounded"
                  />
                </div>
              </div>

              <StatsGrid
                stats={[
                  {
                    label: "Pupil diameter",
                    value: run.response.config_info.pdiam,
                    unit: "px",
                    precision: 1,
                  },
                  {
                    label: "Phase points",
                    value: run.response.config_info.nphi,
                    precision: 0,
                  },
                  {
                    label: "Basis type",
                    value: run.response.config_info.basis_type,
                  },
                  {
                    label: "Phase modes",
                    value: run.response.config_info.phase_modes,
                    precision: 0,
                  },
                ]}
                columns={2}
              />
            </TabsContent>

            <TabsContent value="images" className="space-y-4 pr-4">
              {currentSession?.images && (
                <ImageComparisonGrid
                  run={run}
                  observedImages={currentSession.images.images}
                />
              )}
            </TabsContent>

            <TabsContent value="params" className="space-y-4 pr-4">
              <StatsGrid
                title="Fitted Parameters"
                stats={[
                  {
                    label: "Focal scale",
                    value: run.response.results.focscale,
                    precision: 4,
                  },
                  {
                    label: "Object FWHM",
                    value: run.response.results.object_fwhm_pix,
                    unit: "px",
                    precision: 2,
                  },
                ]}
                columns={2}
              />

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Defocus Values
                </h3>
                <DataTable
                  columns={[
                    {
                      key: "index",
                      label: "Image",
                      type: "number",
                      precision: 0,
                    },
                    {
                      key: "defocus",
                      label: "Defocus",
                      type: "number",
                      precision: 2,
                      unit: "mm",
                    },
                  ]}
                  data={run.response.results.defoc_z.map((d, idx) => ({
                    index: idx + 1,
                    defocus: d * 1000,
                  }))}
                  compact
                />
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Amplitude & Background
                </h3>
                <DataTable
                  columns={[
                    {
                      key: "index",
                      label: "Image",
                      type: "number",
                      precision: 0,
                    },
                    {
                      key: "amplitude",
                      label: "Amplitude",
                      type: "number",
                      precision: 3,
                    },
                    {
                      key: "background",
                      label: "Background",
                      type: "number",
                      precision: 3,
                    },
                  ]}
                  data={run.response.results.amplitude.map((a, idx) => ({
                    index: idx + 1,
                    amplitude: a,
                    background: run.response.results.background[idx],
                  }))}
                  compact
                />
              </div>

              <StatsGrid
                title="Analysis Info"
                stats={[
                  {
                    label: "Duration",
                    value: run.response.duration_ms / 1000,
                    unit: "s",
                    precision: 2,
                  },
                ]}
                columns={2}
              />

              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  Active Search Flags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(run.flags)
                    .filter(([, value]) => typeof value === "boolean" && value)
                    .map(([key]) => (
                      <Badge key={key} variant="outline">
                        {key.replace("_flag", "").replace("_", " ")}
                      </Badge>
                    ))}
                </div>
              </div>

              {run.response.warnings && run.response.warnings.length > 0 && (
                <Alert variant="warning" title="Warnings" size="sm">
                  <ul className="space-y-1">
                    {run.response.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </div>
  );
};
