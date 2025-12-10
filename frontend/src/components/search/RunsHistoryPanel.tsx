import React, { useState, useMemo } from "react";
import { CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useSession } from "../../contexts/SessionContext";
import { EmptyState, ConfirmDialog } from "../common";
import type { AnalysisRun } from "../../types/session";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock04Icon } from "@hugeicons/core-free-icons";
import { RunCard } from "./RunCard";
import { RunFilters } from "./RunFilters";
import { SessionStats } from "./SessionStats";
import {
  buildRunTree,
  flattenRunTree,
  filterRuns,
  sortRuns,
  calculateSessionStats,
  type RunFilters as RunFiltersType,
  type RunSortKey,
  type RunSortOrder,
} from "../../lib/runUtils";

interface RunsHistoryPanelProps {
  runs: AnalysisRun[];
  selectedRunId: string | null;
  onSelectRun: (id: string | null) => void;
}

export const RunsHistoryPanel: React.FC<RunsHistoryPanelProps> = ({
  runs,
  selectedRunId,
  onSelectRun,
}) => {
  const { continueFromRun, deleteRun } = useSession();

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<RunFiltersType>({
    searchTerm: "",
    status: "all",
    minChiSquared: null,
    maxChiSquared: null,
    minRMS: null,
    maxRMS: null,
    minDuration: null,
    maxDuration: null,
    activeFlags: [],
  });
  const [sortKey, setSortKey] = useState<RunSortKey>("time");
  const [sortOrder, setSortOrder] = useState<RunSortOrder>("desc");

  // Build hierarchy
  const runTree = useMemo(() => buildRunTree(runs), [runs]);
  const flatTree = useMemo(() => flattenRunTree(runTree), [runTree]);

  // Apply filters and sort
  const filteredNodes = useMemo(
    () => filterRuns(flatTree, filters),
    [flatTree, filters]
  );
  const sortedNodes = useMemo(
    () => sortRuns(filteredNodes, sortKey, sortOrder),
    [filteredNodes, sortKey, sortOrder]
  );

  // Calculate stats
  const sessionStats = useMemo(() => calculateSessionStats(runs), [runs]);

  // Handlers
  const handleDeleteRun = (runId: string) => {
    setRunToDelete(runId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (runToDelete) {
      await deleteRun(runToDelete);
      setRunToDelete(null);
    }
  };

  const handleSortChange = (key: RunSortKey, order: RunSortOrder) => {
    setSortKey(key);
    setSortOrder(order);
  };

  if (runs.length === 0) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-4">
        <EmptyState
          icon={<HugeiconsIcon icon={Clock04Icon} className="text-muted-foreground/50 h-16 w-16" />}
          title="No runs yet"
          description="Run your first analysis to see history"
          accentColor="pink"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Runs History</CardTitle>
      </CardHeader>

      <div className="space-y-2 px-4">
        <SessionStats
          stats={sessionStats}
          onClickBestChi={(runId) => onSelectRun(runId)}
          onClickBestRMS={(runId) => onSelectRun(runId)}
        />
        <RunFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 py-4">
          {sortedNodes.map((node, index) => {
            const isSelected = selectedRunId === node.run.id;
            // Calculate run number based on original position in runs array
            const runNumber = runs.findIndex((r) => r.id === node.run.id) + 1;

            return (
              <RunCard
                key={node.run.id}
                node={node}
                runNumber={runNumber}
                isSelected={isSelected}
                onSelect={() => onSelectRun(isSelected ? null : node.run.id)}
                onContinue={async () => await continueFromRun(node.run.id)}
                onDelete={() => handleDeleteRun(node.run.id)}
              />
            );
          })}
        </div>
      </ScrollArea>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Run?"
        description="Are you sure you want to delete this analysis run? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};
