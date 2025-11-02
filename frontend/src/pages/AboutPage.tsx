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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl border bg-primary/10 border-primary/20">
            <img src="/logo.png" alt="Logo" className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Phase Diversity
        </h1>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <HugeiconsIcon
            icon={Telescope01Icon}
            className="h-4 w-4 text-accent-cyan"
          />
          Research Tool for Optical Wavefront Retrieval
        </p>
      </div>

      <Card className="border-accent-green/20">
        <CardHeader className="bg-accent-green/5">
          <CardTitle className="flex items-center gap-2 text-accent-green">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a research tool for astronomers and astrophysicists to
            perform phase retrieval from defocused focal plane images using
            Levenberg-Marquardt optimization to recover wavefront aberrations in
            optical systems.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <HugeiconsIcon
                  icon={ZapIcon}
                  className="h-4 w-4 text-accent-cyan"
                />
                Features
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Upload01Icon}
                    className="h-3 w-3 text-accent-cyan"
                  />
                  Upload and analyze FITS/NPY images
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Settings03Icon}
                    className="h-3 w-3 text-accent-purple"
                  />
                  Configure optical parameters
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Search02Icon}
                    className="h-3 w-3 text-accent-pink"
                  />
                  Run phase diversity analysis
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Chart03Icon}
                    className="h-3 w-3 text-accent-orange"
                  />
                  Interactive visualization
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={DatabaseIcon}
                    className="h-3 w-3 text-accent-green"
                  />
                  Session persistence
                </li>
                <li className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={ZapIcon}
                    className="h-3 w-3 text-primary"
                  />
                  Real-time logging
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <HugeiconsIcon
                  icon={SourceCodeIcon}
                  className="h-4 w-4 text-accent-purple"
                />
                Technology
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
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
          <CardTitle className="flex items-center gap-2 text-accent-cyan">
            <HugeiconsIcon icon={Atom02Icon} className="h-5 w-5" />
            Scientific Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The phase retrieval consists in iterating on the phase coefficients
            until the produced images become as close as possible to the user's
            data, in a (weighted) least-square sense. The minimization is
            performed using a Levenberg-Marquardt algorithm.
          </p>
          <div className="bg-accent-cyan/10 border border-accent-cyan/20 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-accent-cyan">
                Core Algorithm:
              </span>{" "}
              Based on the phase diversity implementation by Eric Gendron
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-semibold text-accent-cyan">
                Repository:
              </span>{" "}
              <a
                href="https://github.com/ricogendron/phase-diversity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-cyan hover:underline flex items-center gap-1"
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
          <CardTitle className="flex items-center gap-2 text-accent-purple">
            <HugeiconsIcon icon={UserMultipleIcon} className="h-5 w-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-accent-purple/10 border border-accent-purple/20 p-3 rounded-lg">
            <p className="text-sm font-semibold text-accent-purple">
              Core Phase Diversity Algorithm
            </p>
            <p className="text-xs text-muted-foreground mt-1">Eric Gendron</p>
          </div>
          <div className="bg-accent-purple/10 border border-accent-purple/20 p-3 rounded-lg">
            <p className="text-sm font-semibold text-accent-purple">
              Web Application
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Thomas Gendron (Monorepo, Frontend, Backend)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent-orange/20">
        <CardHeader className="bg-accent-orange/5">
          <CardTitle className="flex items-center gap-2 text-accent-orange">
            <HugeiconsIcon icon={IdeaIcon} className="h-5 w-5" />
            Philosophy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is a{" "}
            <span className="font-semibold text-accent-orange">
              research tool
            </span>
            , not a production application. It prioritizes{" "}
            <span className="font-semibold text-accent-orange">
              simplicity and flexibility
            </span>{" "}
            for trusted expert users working in local or controlled research
            environments.
          </p>
        </CardContent>
      </Card>

      <Card className="border-accent-pink/20">
        <CardHeader className="bg-accent-pink/5">
          <CardTitle className="flex items-center gap-2 text-accent-pink">
            <HugeiconsIcon icon={BookOpen01Icon} className="h-5 w-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Interactive API documentation is available when the backend is
            running:
          </p>
          <div className="space-y-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-accent-pink hover:underline bg-accent-pink/10 border border-accent-pink/20 p-2 rounded-lg"
            >
              <HugeiconsIcon icon={LinkSquare01Icon} className="h-3 w-3" />
              Interactive API docs (Swagger UI)
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-accent-pink hover:underline bg-accent-pink/10 border border-accent-pink/20 p-2 rounded-lg"
            >
              <HugeiconsIcon icon={LinkSquare01Icon} className="h-3 w-3" />
              Alternative API docs (ReDoc)
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} • Research tool for astronomers and
          astrophysicists
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
