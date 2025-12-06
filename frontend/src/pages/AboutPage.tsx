import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Atom02Icon,
  BookOpen01Icon,
  Chart03Icon,
  DatabaseIcon,
  IdeaIcon,
  LinkSquare01Icon,
  Search02Icon,
  Settings03Icon,
  SourceCodeIcon,
  SparklesIcon,
  Telescope01Icon,
  Upload01Icon,
  UserMultipleIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons";

const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-primary/10 border-primary/20 rounded-xl border p-3">
            <img src="/logo.png" alt="Logo" className="h-12 w-12" />
          </div>
        </div>
        <h1 className="from-primary to-primary/80 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Phase Diversity
        </h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <HugeiconsIcon icon={Telescope01Icon} className="text-accent-cyan h-4 w-4" />
          Research Tool for Optical Wavefront Retrieval
        </p>
      </div>

      <Card className="border-accent-green/20">
        <CardHeader className="bg-accent-green/5">
          <CardTitle className="text-accent-green flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This is a research tool for astronomers and astrophysicists to perform phase retrieval
            from defocused focal plane images using Levenberg-Marquardt optimization to recover
            wavefront aberrations in optical systems.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <HugeiconsIcon icon={ZapIcon} className="text-accent-cyan h-4 w-4" />
                Features
              </h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Upload01Icon} className="text-accent-cyan h-3 w-3" />
                  Upload and analyze FITS/NPY images
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Settings03Icon} className="text-accent-purple h-3 w-3" />
                  Configure optical parameters
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Search02Icon} className="text-accent-pink h-3 w-3" />
                  Run phase diversity analysis
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={Chart03Icon} className="text-accent-orange h-3 w-3" />
                  Interactive visualization
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={DatabaseIcon} className="text-accent-green h-3 w-3" />
                  Session persistence
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon icon={ZapIcon} className="text-primary h-3 w-3" />
                  Real-time logging
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <HugeiconsIcon icon={SourceCodeIcon} className="text-accent-purple h-4 w-4" />
                Technology
              </h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• React 18.3 + TypeScript 5.7</li>
                <li>• FastAPI + Python 3.13</li>
                <li>• Plotly.js for visualization</li>
                <li>• TailwindCSS + shadcn/ui</li>
                <li>• WebSocket for real-time logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent-cyan/20">
        <CardHeader className="bg-accent-cyan/5">
          <CardTitle className="text-accent-cyan flex items-center gap-2">
            <HugeiconsIcon icon={Atom02Icon} className="h-5 w-5" />
            Scientific Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            The phase retrieval consists in iterating on the phase coefficients until the produced
            images become as close as possible to the user&apos;s data, in a (weighted) least-square
            sense. The minimization is performed using a Levenberg-Marquardt algorithm.
          </p>
          <div className="bg-accent-cyan/10 border-accent-cyan/20 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">
              <span className="text-accent-cyan font-semibold">Core Algorithm:</span> Based on the
              phase diversity implementation by Eric Gendron
            </p>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <span className="text-accent-cyan font-semibold">Repository:</span>{" "}
              <a
                href="https://github.com/ricogendron/phase-diversity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan flex items-center gap-1 hover:underline"
              >
                github.com/ricogendron/phase-diversity
                <HugeiconsIcon icon={LinkSquare01Icon} className="h-3 w-3" />
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent-purple/20">
        <CardHeader className="bg-accent-purple/5">
          <CardTitle className="text-accent-purple flex items-center gap-2">
            <HugeiconsIcon icon={UserMultipleIcon} className="h-5 w-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-accent-purple/10 border-accent-purple/20 rounded-lg border p-3">
            <p className="text-accent-purple text-sm font-semibold">
              Core Phase Diversity Algorithm
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Eric Gendron</p>
          </div>
          <div className="bg-accent-purple/10 border-accent-purple/20 rounded-lg border p-3">
            <p className="text-accent-purple text-sm font-semibold">Web Application</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Thomas Gendron (Monorepo, Frontend, Backend)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent-orange/20">
        <CardHeader className="bg-accent-orange/5">
          <CardTitle className="text-accent-orange flex items-center gap-2">
            <HugeiconsIcon icon={IdeaIcon} className="h-5 w-5" />
            Philosophy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This is a <span className="text-accent-orange font-semibold">research tool</span>, not a
            production application. It prioritizes{" "}
            <span className="text-accent-orange font-semibold">simplicity and flexibility</span> for
            trusted expert users working in local or controlled research environments.
          </p>
        </CardContent>
      </Card>

      <Card className="border-accent-pink/20">
        <CardHeader className="bg-accent-pink/5">
          <CardTitle className="text-accent-pink flex items-center gap-2">
            <HugeiconsIcon icon={BookOpen01Icon} className="h-5 w-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Interactive API documentation is available when the backend is running:
          </p>
          <div className="space-y-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-pink bg-accent-pink/10 border-accent-pink/20 flex items-center gap-2 rounded-lg border p-2 text-xs hover:underline"
            >
              <HugeiconsIcon icon={LinkSquare01Icon} className="h-3 w-3" />
              Interactive API docs (Swagger UI)
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-pink bg-accent-pink/10 border-accent-pink/20 flex items-center gap-2 rounded-lg border p-2 text-xs hover:underline"
            >
              <HugeiconsIcon icon={LinkSquare01Icon} className="h-3 w-3" />
              Alternative API docs (ReDoc)
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-2">
        <p className="text-muted-foreground text-center text-xs">
          © {new Date().getFullYear()} • Research tool for astronomers and astrophysicists
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
