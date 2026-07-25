import { MODEL_METRICS } from "@/lib/model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, TrendingUp, CheckCircle2, Database } from "lucide-react";

export default function Insights() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Model Diagnostics</h1>
        <p className="text-muted-foreground mt-2">
          Technical specifications and performance metrics of the zebra prediction model.
        </p>
      </div>

      <Card className="bg-card border-l-4 border-l-primary shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">Training Dataset</h2>
              <p className="text-muted-foreground font-mono text-sm mt-1">
                Trained on {MODEL_METRICS.trainingSamples.toLocaleString()} historical campaigns
              </p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none text-muted-foreground text-sm">
            <p>
              The model utilizes a distilled linear and logistic regression approach to predict campaign performance indicators in real-time. 
              The embedded coefficients were derived from a comprehensive dataset of {MODEL_METRICS.trainingSamples.toLocaleString()} campaigns across multiple 
              channels and industries, offering high-fidelity projections for CAC, Conversion Rates, and ROI.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">CAC Prediction</CardTitle>
            <Target className="w-4 h-4 text-[#F2637B]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono text-foreground font-bold">
              R² {MODEL_METRICS.cacR2.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Variance explained in Customer Acquisition Cost.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">Conversion Rate Prediction</CardTitle>
            <Activity className="w-4 h-4 text-[#2DD4BF]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono text-foreground font-bold">
              R² {MODEL_METRICS.conversionRateR2.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Variance explained in target action conversion rate.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">ROI Prediction</CardTitle>
            <TrendingUp className="w-4 h-4 text-[#E8A33D]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono text-foreground font-bold">
              R² {MODEL_METRICS.roiR2.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Variance explained in Return on Investment.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-t-4 border-t-[#10B981]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">Success Classifier</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono text-foreground font-bold text-[#10B981]">
              {(MODEL_METRICS.successAccuracy * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Accuracy on held-out test set for binary success classification.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}