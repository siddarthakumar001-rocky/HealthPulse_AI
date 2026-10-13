import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  Layers,
  LineChart,
  ShieldCheck,
  Cpu,
  Activity,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResearchEvaluation() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-wider text-foreground">
                  RESEARCH EVALUATION BENCHMARK
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                  IEEE Paper Empirical Validation Suite • HealthPulse AI Digital Twin
                </p>
              </div>
            </div>

            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 px-3 py-1 font-mono text-xs">
              BENCHMARK EVALUATION ENVIRONMENT
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border border-border/50">
            <strong>Mandatory Scientific Disclosure:</strong> In strict alignment with IEEE publication standards, experimental metrics are only presented when verified from physical benchmark datasets. Pending empirical runs are explicitly identified as <span className="font-semibold text-amber-600 dark:text-amber-400">EXPERIMENT PENDING</span>.
          </p>
        </div>

        {/* Status Legend Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>EXPERIMENTALLY VALIDATED RESULT</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Empirically measured from dataset benchmark runs. Populated with verifiable numerical accuracy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>IMPLEMENTED SYSTEM FEATURE</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Active production architectural component (e.g. SQI calculation, hardware telemetry, fail-safe rules).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>RESEARCH EXPERIMENT PENDING</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Formulated research experiment currently scheduled for benchmark execution. Zero synthetic data.
            </p>
          </div>
        </div>

        {/* Tabbed Evaluation Sections */}
        <Tabs defaultValue="baseline" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/60">
            <TabsTrigger value="baseline" className="text-xs py-2">A. Baseline Classification</TabsTrigger>
            <TabsTrigger value="csdi" className="text-xs py-2">B. CSDI Reconstruction</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs py-2">C. Activity Recognition</TabsTrigger>
            <TabsTrigger value="sentinel" className="text-xs py-2">D. Alert Evaluation</TabsTrigger>
            <TabsTrigger value="ablation" className="text-xs py-2">E. Ablation Study</TabsTrigger>
          </TabsList>

          {/* Section A: Baseline Classification (VERIFIED BASELINE RESULT) */}
          <TabsContent value="baseline" className="space-y-4">
            <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>Section A: Baseline Multi-Model Risk Classifier</span>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                        EXPERIMENTALLY VALIDATED RESULT
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ensemble ML baseline evaluated on the HealthPulse cohort dataset (Decision Tree, Naive Bayes, Random Forest, Soft Voting)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-border/50 bg-background/60">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Voting Classifier Accuracy</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">95.2%</div>
                    <span className="text-[10px] text-muted-foreground font-mono">Acc = 0.952</span>
                  </div>

                  <div className="p-3 rounded-lg border border-border/50 bg-background/60">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Voting Macro-F1 Score</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">0.948</div>
                    <span className="text-[10px] text-muted-foreground font-mono">Macro-F1 = 0.948</span>
                  </div>

                  <div className="p-3 rounded-lg border border-border/50 bg-background/60">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Random Forest Standalone</span>
                    <div className="text-2xl font-black text-foreground mt-1">94.1%</div>
                    <span className="text-[10px] text-muted-foreground font-mono">Acc = 0.941</span>
                  </div>

                  <div className="p-3 rounded-lg border border-border/50 bg-background/60">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Gaussian Naive Bayes</span>
                    <div className="text-2xl font-black text-foreground mt-1">89.4%</div>
                    <span className="text-[10px] text-muted-foreground font-mono">Acc = 0.894</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Baseline Result Attribution:</strong> The Voting Classifier aggregates probabilistic outputs from Random Forest, Decision Tree, and Gaussian Naive Bayes to classify physiological triage risk.
                  </p>
                  <p className="text-[11px]">
                    *These baseline numbers represent the verified benchmark of the primary classifier. They do not constitute CSDI diffusion or full context-sentinel metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section B: CSDI Reconstruction Evaluation */}
          <TabsContent value="csdi" className="space-y-4">
            <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>Section B: CSDI Physiological Reconstruction Evaluation</span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                        EXPERIMENT PENDING
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Conditional Score-Based Diffusion Imputation benchmarks across missingness ratios (10% to 50%)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 text-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">
                    EXPERIMENT PENDING — BENCHMARK VALIDATION IN PROGRESS
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                    Empirical metrics for Mean Absolute Error (MAE), Root Mean Square Error (RMSE), and Continuous Ranked Probability Score (CRPS) across synthetic packet-drop masks are currently pending execution on the physical dataset.
                  </p>
                  <div className="pt-2 flex justify-center gap-4 text-xs font-mono text-muted-foreground">
                    <span>MAE: <strong className="text-amber-500">Pending</strong></span>
                    <span>RMSE: <strong className="text-amber-500">Pending</strong></span>
                    <span>CRPS: <strong className="text-amber-500">Pending</strong></span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/40 bg-muted/20 text-xs text-muted-foreground flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                  <p>
                    HealthPulse AI integrates CSDI (Tashiro et al., NeurIPS 2021) into the edge wearable architecture. Synthetic curves are strictly withheld until benchmark inference results are completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section C: Activity Recognition Evaluation */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>Section C: Activity Recognition Engine Evaluation</span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                        EXPERIMENT PENDING
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      MPU6050 kinetic classification (Resting, Walking, Running, Sleeping, Exercise)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 text-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">
                    ACTIVITY CONFUSION MATRIX: EXPERIMENT PENDING
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                    The 5-class kinematic confusion matrix and Macro-F1 across ambulatory cohorts will be populated upon completion of physical IMU validation experiments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section D: Context-Aware Alert Evaluation */}
          <TabsContent value="sentinel" className="space-y-4">
            <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>Section D: Context-Aware Alert & False Alarm Reduction</span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                        EXPERIMENT PENDING
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Empirical evaluation of False Positive Rate (FPR) reduction vs True Positive Escalation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-8 text-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 space-y-2">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-sm text-foreground">
                    ALERT SUPPRESSION BENCHMARK: EXPERIMENT PENDING
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                    Controlled trial comparing static threshold alert rates against the context-aware sentinel across exercise and motion artifact conditions.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/40 text-[11px] text-muted-foreground">
                  *Scientific Note: Specific claims such as “False alerts reduced from 38% to 4%” are strictly withheld until experimentally verified across the complete validation dataset.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Section E: Ablation Study */}
          <TabsContent value="ablation" className="space-y-4">
            <Card className="border-border/70 bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>Section E: Ablation Study Architectures</span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                        ARCHITECTURAL SPECIFICATION
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Formal definitions of the four ablation variants evaluated in the IEEE study
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">A1: Baseline</span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600">
                        Acc: 95.2% (Baseline)
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Direct raw sensor telemetry passed directly to static threshold alerts and Voting Classifier.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">A2: Baseline + CSDI</span>
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                        Experiment Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Observation masking (M_c) and diffusion-based temporal reconstruction for missing telemetry windows.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">A3: Baseline + CSDI + Activity Context</span>
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                        Experiment Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Adds MPU6050 kinetic activity engine to contextualize exertional vs resting vital changes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-primary">A4: Full System (HealthPulse AI)</span>
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                        Experiment Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      CSDI Reconstruction + Kinetic Activity + Signal Quality Index (SQI) + Temporal Persistence + Provenance Gating.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Paper Figures Panels (Figure 5 to Figure 8) */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">IEEE Paper Figure Placeholders (Figures 5–8)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold">Figure 5: CSDI Reconstruction under Dropout</CardTitle>
                <CardDescription className="text-[11px]">Observed vs Missing vs Imputed segments</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-28 rounded-lg border border-dashed border-border/80 flex items-center justify-center bg-muted/20 text-xs text-muted-foreground italic">
                  Experiment pending — no validated result available.
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold">Figure 6: Activity Recognition Confusion Matrix</CardTitle>
                <CardDescription className="text-[11px]">5-class IMU classification performance</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-28 rounded-lg border border-dashed border-border/80 flex items-center justify-center bg-muted/20 text-xs text-muted-foreground italic">
                  Experiment pending — no validated result available.
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold">Figure 7: Context-Aware Alert Escalation Behavior</CardTitle>
                <CardDescription className="text-[11px]">Static Threshold vs Context Sentinel Triage</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-28 rounded-lg border border-dashed border-border/80 flex items-center justify-center bg-muted/20 text-xs text-muted-foreground italic">
                  Experiment pending — no validated result available.
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/60">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold">Figure 8: Ablation Study Comparison (A1 to A4)</CardTitle>
                <CardDescription className="text-[11px]">Systematic ablation performance breakdown</CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-28 rounded-lg border border-dashed border-border/80 flex items-center justify-center bg-muted/20 text-xs text-muted-foreground italic">
                  Experiment pending — no validated result available.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
