import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePrediction, getListPredictionsQueryKey } from "@workspace/api-client-react";
import { predictCampaign, CampaignInput, PredictionResult } from "@/lib/model";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CircularGauge from "@/components/CircularGauge";
import { Loader2 } from "lucide-react";

const CHANNELS = ["Affiliate", "Content/SEO", "Display Ads", "Email", "Influencer", "Search Ads", "Social Media"] as const;
const INDUSTRIES = ["E-commerce", "Education", "Finance", "Food & Beverage", "Healthcare", "SaaS", "Travel"] as const;
const OBJECTIVES = ["App Installs", "Brand Awareness", "Direct Sales", "Lead Generation", "Retention"] as const;
const AUDIENCES = ["Boomers (57+)", "Gen X (41-56)", "Gen Z (18-24)", "Millennials (25-40)"] as const;

const formSchema = z.object({
  campaignName: z.string().optional(),
  channel: z.enum(CHANNELS),
  industry: z.enum(INDUSTRIES),
  objective: z.enum(OBJECTIVES),
  targetAudience: z.enum(AUDIENCES),
  budget: z.coerce.number().min(300).max(92000),
  durationDays: z.coerce.number().min(7).max(90),
  targetAudienceSize: z.coerce.number().min(5000).max(4000000),
  creativeQualityScore: z.coerce.number().min(1).max(10),
  pastEngagementScore: z.coerce.number().min(0).max(10),
  seasonalityIndex: z.coerce.number().min(0.6).max(1.6),
});

export default function Predictor() {
  const queryClient = useQueryClient();
  const createPrediction = useCreatePrediction();
  const [result, setResult] = useState<PredictionResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignName: "",
      channel: "Social Media",
      industry: "E-commerce",
      objective: "Direct Sales",
      targetAudience: "Millennials (25-40)",
      budget: 10000,
      durationDays: 30,
      targetAudienceSize: 50000,
      creativeQualityScore: 7,
      pastEngagementScore: 5,
      seasonalityIndex: 1.0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // 1. Run local model
    const campaignInput: CampaignInput = {
      channel: values.channel,
      industry: values.industry,
      objective: values.objective,
      targetAudience: values.targetAudience,
      budget: values.budget,
      durationDays: values.durationDays,
      targetAudienceSize: values.targetAudienceSize,
      creativeQualityScore: values.creativeQualityScore,
      pastEngagementScore: values.pastEngagementScore,
      seasonalityIndex: values.seasonalityIndex,
    };
    
    const predictionResult = predictCampaign(campaignInput);
    setResult(predictionResult);

    // 2. Save to database
    createPrediction.mutate({
      data: {
        ...values,
        ...predictionResult,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPredictionsQueryKey() });
      }
    });
  };

  const getGuidanceSentence = (res: PredictionResult) => {
    if (res.predictedRoi < 0) {
      return "CRITICAL WARNING: The projected return on investment is negative. Reconsider budget allocation, target audience, or channel strategy before execution.";
    }
    if (res.successProbability < 0.4) {
      return "HIGH RISK: The model indicates a low probability of achieving campaign objectives. Consider improving creative assets or targeting a more engaged audience.";
    }
    if (res.predictedCac > 200) {
      return "CAUTION: Acquisition costs are unusually high for this configuration. While the campaign may succeed, efficiency could be improved.";
    }
    return "OPTIMAL CONFIGURATION: The parameters indicate a strong likelihood of success with positive returns. Proceed with confidence.";
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;
  const formatNumber = (val: number) => val.toLocaleString();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4 pb-20">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Campaign Predictor</h1>
        <p className="text-muted-foreground mt-2">Enter campaign parameters to forecast performance and success probability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Input Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="campaignName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground font-mono text-xs uppercase">Campaign Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Q3 Fall Launch" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase">Channel</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select channel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase">Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase">Objective</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select objective" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OBJECTIVES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase">Target Audience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase flex justify-between">
                            <span>Budget ($)</span>
                            <span className="text-primary font-mono">${field.value.toLocaleString()}</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={300} max={92000} className="bg-background font-mono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetAudienceSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase flex justify-between">
                            <span>Audience Size</span>
                            <span className="text-primary font-mono">{field.value.toLocaleString()}</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={5000} max={4000000} className="bg-background font-mono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6 pt-4">
                    <FormField
                      control={form.control}
                      name="durationDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase flex justify-between">
                            <span>Duration (Days)</span>
                            <span className="text-primary font-mono">{field.value} days</span>
                          </FormLabel>
                          <FormControl>
                            <Slider 
                              min={7} max={90} step={1} 
                              value={[field.value]} 
                              onValueChange={(vals) => field.onChange(vals[0])} 
                              className="py-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="creativeQualityScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase flex justify-between">
                            <span>Creative Quality Score</span>
                            <span className="text-primary font-mono">{field.value} / 10</span>
                          </FormLabel>
                          <FormControl>
                            <Slider 
                              min={1} max={10} step={1} 
                              value={[field.value]} 
                              onValueChange={(vals) => field.onChange(vals[0])} 
                              className="py-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pastEngagementScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase flex justify-between">
                            <span>Past Engagement Score</span>
                            <span className="text-primary font-mono">{field.value} / 10</span>
                          </FormLabel>
                          <FormControl>
                            <Slider 
                              min={0} max={10} step={1} 
                              value={[field.value]} 
                              onValueChange={(vals) => field.onChange(vals[0])} 
                              className="py-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seasonalityIndex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground font-mono text-xs uppercase flex justify-between">
                            <span>Seasonality Index</span>
                            <span className="text-primary font-mono">{field.value.toFixed(1)}x</span>
                          </FormLabel>
                          <FormControl>
                            <Slider 
                              min={0.6} max={1.6} step={0.1} 
                              value={[field.value]} 
                              onValueChange={(vals) => field.onChange(vals[0])} 
                              className="py-4"
                            />
                          </FormControl>
                          <p className="text-[10px] text-muted-foreground">1.0 is average. &gt;1.0 represents high season.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-md font-display uppercase tracking-wider" disabled={createPrediction.isPending}>
                    {createPrediction.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Run Prediction Model
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 space-y-6">
            {!result ? (
              <div className="h-[600px] border border-dashed border-muted rounded-lg flex items-center justify-center p-8 text-center bg-card/30">
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground font-mono text-xl">?</span>
                  </div>
                  <p className="text-muted-foreground font-mono text-sm uppercase tracking-wide">Awaiting input parameters</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <Card className="bg-card border-none ring-1 ring-border shadow-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-[#F2637B] via-[#E8A33D] to-[#2DD4BF]"></div>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                      Analysis Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center pt-4 pb-8 space-y-8">
                    <CircularGauge value={result.successProbability} size={220} strokeWidth={16} />
                    
                    <div className="w-full bg-background/50 p-4 rounded border border-border/50 text-center">
                      <p className="font-mono text-sm leading-relaxed text-foreground">
                        {getGuidanceSentence(result)}
                      </p>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center p-3 bg-background rounded-md border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Proj. CAC</span>
                        <span className="text-lg font-mono font-bold text-[#F2637B]">{formatCurrency(result.predictedCac)}</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-background rounded-md border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Conv Rate</span>
                        <span className="text-lg font-mono font-bold text-[#2DD4BF]">{formatPercent(result.predictedConversionRate)}</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-background rounded-md border border-border/50">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider mb-1">Proj. ROI</span>
                        <span className="text-lg font-mono font-bold text-[#E8A33D]">{formatPercent(result.predictedRoi)}</span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                      <div>
                        <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Est. Conversions</span>
                        <span className="text-2xl font-mono text-foreground font-semibold">{formatNumber(result.estimatedConversions)}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Est. Revenue</span>
                        <span className="text-2xl font-mono text-foreground font-semibold">{formatCurrency(result.estimatedRevenue)}</span>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}