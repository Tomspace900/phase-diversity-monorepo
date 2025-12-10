import { ArrowDown01Icon, Chart03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import { useSession } from "../../contexts/SessionContext";
import type { AnalysisRun } from "../../types/session";
import { DataTable, EmptyState, LoadingState, StatsGrid } from "../common";
import { Alert } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IlluminationPlot } from "./IlluminationPlot";
import { ImageComparisonGrid } from "./ImageComparisonGrid";
import { PhaseMapPlot } from "./PhaseMapPlot";
import { ZernikeBarChart } from "./ZernikeBarChart";

interface VisualizationPanelProps {
  run: AnalysisRun | null;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ run }) => {
  const { isAnalysisLoading } = useSession();
  const [showCoeffTable, setShowCoeffTable] = useState(false);

  if (isAnalysisLoading)
    return <LoadingState message="Analysis running..." className="h-full justify-center" />;

  if (!run) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={<HugeiconsIcon icon={Chart03Icon} className="text-muted-foreground/50 h-16 w-16" />}
          title="No analysis yet"
          description="Run your first analysis to see results here"
          accentColor="purple"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CardContent className="flex-1 overflow-hidden p-6">
        <Tabs defaultValue="phase" className="flex h-full flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="phase">Phase</TabsTrigger>
            <TabsTrigger value="pupil">Pupil</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="params">Parameters</TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-4 flex-1">
            <TabsContent value="phase" className="space-y-4 pr-4">
              <PhaseMapPlot results={run.response.results} configInfo={run.response.config_info} />

              <ZernikeBarChart
                coefficients={run.response.results.phase}
                basis={run.response.config_info.basis_type}
              />

              <Collapsible open={showCoeffTable} onOpenChange={setShowCoeffTable}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    Show Coefficient Table
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      className={`h-4 w-4 transition-transform ${showCoeffTable ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
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
                  />
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>

            <TabsContent value="pupil" className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-accent-cyan/20">
                  <CardHeader className="bg-accent-cyan/5 pb-3">
                    <CardTitle className="text-accent-cyan text-sm">Pupil</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <img
                      src={run.response.pupil_image}
                      alt="Pupil"
                      className="border-border w-full rounded-lg border"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </CardContent>
                </Card>
                <Card className="border-accent-green/20">
                  <CardHeader className="bg-accent-green/5 pb-3">
                    <CardTitle className="text-accent-green text-sm">Illumination</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <img
                      src={run.response.illumination_image}
                      alt="Illumination"
                      className="border-border w-full rounded-lg border"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </CardContent>
                </Card>
              </div>

              <IlluminationPlot
                results={run.response.results}
                configInfo={run.response.config_info}
              />

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
              <ImageComparisonGrid run={run} />
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
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
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
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
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
                <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
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
