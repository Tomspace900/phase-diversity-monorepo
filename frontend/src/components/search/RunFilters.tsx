import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import type { RunFilters as RunFiltersType, RunSortKey, RunSortOrder } from "../../lib/runUtils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface RunFiltersProps {
  filters: RunFiltersType;
  onFiltersChange: (filters: RunFiltersType) => void;
  sortKey: RunSortKey;
  sortOrder: RunSortOrder;
  onSortChange: (key: RunSortKey, order: RunSortOrder) => void;
}

export const RunFilters: React.FC<RunFiltersProps> = ({
  filters,
  onFiltersChange,
  sortKey,
  sortOrder,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onFiltersChange({
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
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          Filters & Sort
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card>
          <CardContent className="space-y-3 p-3">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-xs">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Filter by timestamp..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-xs">
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    status: value as RunFiltersType["status"],
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="improved">Improved</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RMS Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minRMS" className="text-xs">
                  Min RMS (nm)
                </Label>
                <Input
                  id="minRMS"
                  type="number"
                  placeholder="Min"
                  value={filters.minRMS ?? ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      minRMS: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="maxRMS" className="text-xs">
                  Max RMS (nm)
                </Label>
                <Input
                  id="maxRMS"
                  type="number"
                  placeholder="Max"
                  value={filters.maxRMS ?? ""}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      maxRMS: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            {/* Sort */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="sortKey" className="text-xs">
                  Sort By
                </Label>
                <Select
                  value={sortKey}
                  onValueChange={(value) => onSortChange(value as RunSortKey, sortOrder)}
                >
                  <SelectTrigger id="sortKey">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="chi_squared">Chi²</SelectItem>
                    <SelectItem value="rms">RMS</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder" className="text-xs">
                  Order
                </Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value) => onSortChange(sortKey, value as RunSortOrder)}
                >
                  <SelectTrigger id="sortOrder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
