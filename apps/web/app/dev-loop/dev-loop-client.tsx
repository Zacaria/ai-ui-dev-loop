"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TokenSpec = {
  label: string;
  cssVar: `--${string}`;
  styleKey: "backgroundColor" | "color" | "borderColor";
};

type NetworkProbeState = {
  phase: "idle" | "pending" | "success" | "error";
  summary: string;
};

const TOKENS: TokenSpec[] = [
  { label: "Background", cssVar: "--background", styleKey: "backgroundColor" },
  { label: "Foreground (text)", cssVar: "--foreground", styleKey: "color" },
  { label: "Primary", cssVar: "--primary", styleKey: "backgroundColor" },
  {
    label: "Primary Foreground (text)",
    cssVar: "--primary-foreground",
    styleKey: "color",
  },
  { label: "Border", cssVar: "--border", styleKey: "borderColor" },
  { label: "Ring", cssVar: "--ring", styleKey: "borderColor" },
];

const NETWORK_PROBE_PATH = "/api/health?probe=dev-loop";

function createNetworkProbeSummary(status: string, ok: string) {
  return `status=${status} ok=${ok} path=${NETWORK_PROBE_PATH}`;
}

function readComputedTokenValue(element: HTMLElement, token: TokenSpec) {
  const style = getComputedStyle(element);
  return style[token.styleKey];
}

export function DevLoopClient() {
  const [name, setName] = React.useState("Codex");
  const [lastAction, setLastAction] = React.useState<string | null>(null);
  const [computed, setComputed] = React.useState<Record<string, string>>({});
  const [counter, setCounter] = React.useState(0);
  const [networkProbe, setNetworkProbe] = React.useState<NetworkProbeState>({
    phase: "idle",
    summary: createNetworkProbeSummary("(idle)", "(unknown)"),
  });

  const refreshComputed = React.useCallback(() => {
    const next: Record<string, string> = {};
    for (const token of TOKENS) {
      const element = document.querySelector<HTMLElement>(
        `[data-token="${token.cssVar}"]`
      );
      if (element) next[token.cssVar] = readComputedTokenValue(element, token);
    }
    setComputed(next);
  }, []);

  React.useEffect(() => {
    refreshComputed();
  }, [refreshComputed]);

  const runNetworkProbe = React.useCallback(async () => {
    setNetworkProbe({
      phase: "pending",
      summary: createNetworkProbeSummary("(pending)", "(unknown)"),
    });

    try {
      const response = await fetch(NETWORK_PROBE_PATH, {
        method: "GET",
        cache: "no-store",
      });
      const body = (await response.json()) as { ok?: boolean };
      const ok = body.ok === true;
      const message = `dev-loop:network:probe:${response.status}:${ok}`;

      console.log(message);
      setLastAction(message);
      setNetworkProbe({
        phase: ok ? "success" : "error",
        summary: createNetworkProbeSummary(String(response.status), String(ok)),
      });

      if (ok) {
        toast.success("Network probe complete", {
          description: createNetworkProbeSummary(String(response.status), "true"),
        });
      } else {
        toast.error("Network probe failed", {
          description: createNetworkProbeSummary(String(response.status), String(ok)),
        });
      }
    } catch (error) {
      console.error("dev-loop:network:probe:error", error);
      setLastAction("dev-loop:network:probe:error");
      setNetworkProbe({
        phase: "error",
        summary: createNetworkProbeSummary("(error)", "(unknown)"),
      });
      toast.error("Network probe failed", {
        description: createNetworkProbeSummary("(error)", "(unknown)"),
      });
    }
  }, []);

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">/dev-loop</h1>
        <p className="text-sm text-muted-foreground">
          Deterministic UI surface for automation: stable selectors, console
          signals, and computed color inspection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interactions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dev-loop-name">Name</Label>
            <Input
              id="dev-loop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a name"
              aria-label="Name input"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              data-testid="btn-submit"
              onClick={() => {
                const message = `submit:name:${name}`;
                console.log(message);
                toast.success("Submitted", { description: message });
                setLastAction(message);
              }}
            >
              Submit
            </Button>

            <Button
              data-testid="btn-network-probe"
              variant="outline"
              onClick={() => {
                void runNetworkProbe();
              }}
            >
              Run network probe
            </Button>

            <Button
              data-testid="btn-console-signals"
              variant="outline"
              onClick={() => {
                console.log("dev-loop:console:log");
                console.warn("dev-loop:console:warn");
                try {
                  throw new Error("dev-loop:console:handled-error");
                } catch (error) {
                  console.error(error);
                }
                toast("Console signals emitted");
                setLastAction("console-signals");
              }}
            >
              Emit console signals
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="btn-open-dialog" variant="secondary">
                  Open dialog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dev Loop Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog exists for automation and UI event inspection.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <Button
                    data-testid="btn-dialog-action"
                    onClick={() => {
                      console.log("dev-loop:dialog:action");
                      toast.info("Dialog action clicked");
                      setLastAction("dialog-action");
                    }}
                  >
                    Dialog action
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border bg-card p-3 text-sm">
              <div className="text-muted-foreground">Last action</div>
              <div data-testid="last-action" className="font-mono">
                {lastAction ?? "(none)"}
              </div>
            </div>

            <div className="rounded-md border bg-card p-3 text-sm">
              <div className="text-muted-foreground">
                Network probe ({networkProbe.phase})
              </div>
              <div data-testid="network-probe-result" className="font-mono">
                {networkProbe.summary}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Counter</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-md border bg-card p-3 text-sm">
            <div className="text-muted-foreground">Value</div>
            <div data-testid="counter-value" className="font-mono text-lg">
              {counter}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              data-testid="counter-inc"
              onClick={() => {
                setCounter((v) => {
                  const next = v + 1;
                  console.log(`dev-loop:counter:set:${next}`);
                  return next;
                });
                setLastAction("counter-inc");
              }}
            >
              Increment
            </Button>
            <Button
              data-testid="counter-dec"
              variant="outline"
              onClick={() => {
                setCounter((v) => {
                  const next = v - 1;
                  console.log(`dev-loop:counter:set:${next}`);
                  return next;
                });
                setLastAction("counter-dec");
              }}
            >
              Decrement
            </Button>
            <Button
              data-testid="counter-reset"
              variant="secondary"
              onClick={() => {
                setCounter(0);
                console.log("dev-loop:counter:reset");
                toast("Counter reset");
                setLastAction("counter-reset");
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors / tokens</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-3">
            <Button
              data-testid="btn-refresh-colors"
              variant="outline"
              onClick={() => {
                refreshComputed();
                console.log("dev-loop:colors:refresh");
                setLastAction("colors-refresh");
              }}
            >
              Refresh computed colors
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {TOKENS.map((t) => (
              <div
                key={t.cssVar}
                className="rounded-lg border p-3"
                data-testid={`token-${t.cssVar.replaceAll("--", "")}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {t.cssVar}
                    </div>
                    <div className="text-xs font-mono" data-testid={`computed-${t.cssVar.replaceAll("--", "")}`}>
                      {computed[t.cssVar] ?? "(unread)"}
                    </div>
                  </div>
                  <div
                    data-token={t.cssVar}
                    className="flex h-10 w-10 items-center justify-center rounded-md border bg-[var(--background)] text-[var(--foreground)]"
                    aria-label={`${t.label} swatch`}
                    title={`${t.label} swatch`}
                    style={
                      t.styleKey === "backgroundColor"
                        ? { backgroundColor: `var(${t.cssVar})` }
                        : t.styleKey === "color"
                          ? { color: `var(${t.cssVar})` }
                          : { borderColor: `var(${t.cssVar})` }
                    }
                  >
                    Aa
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
