import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import { CreatePredictionBody } from "@workspace/api-zod";

const router: IRouter = Router();

function rowToPrediction(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    campaignName: row.campaign_name != null ? String(row.campaign_name) : null,
    channel: String(row.channel ?? ""),
    industry: String(row.industry ?? ""),
    targetAudience: String(row.target_audience ?? ""),
    objective: String(row.objective ?? ""),
    budget: Number(row.budget ?? 0),
    durationDays: Number(row.duration_days ?? 0),
    targetAudienceSize: Number(row.target_audience_size ?? 0),
    creativeQualityScore: Number(row.creative_quality_score ?? 0),
    pastEngagementScore: Number(row.past_engagement_score ?? 0),
    seasonalityIndex: Number(row.seasonality_index ?? 0),
    predictedCac: Number(row.predicted_cac ?? 0),
    predictedConversionRate: Number(row.predicted_conversion_rate ?? 0),
    predictedRoi: Number(row.predicted_roi ?? 0),
    successProbability: Number(row.success_probability ?? 0),
    willSucceed: Boolean(row.will_succeed),
    estimatedConversions: row.estimated_conversions != null ? Number(row.estimated_conversions) : null,
    estimatedRevenue: row.estimated_revenue != null ? Number(row.estimated_revenue) : null,
    createdAt: String(row.created_at ?? ""),
  };
}

// GET /predictions — last 10, newest first
router.get("/predictions", async (req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      req.log.error({ err: error }, "Failed to fetch predictions");
      res.status(500).json({ error: "Failed to fetch predictions" });
      return;
    }

    res.json((data ?? []).map((row) => rowToPrediction(row as Record<string, unknown>)));
  } catch (err) {
    req.log.error({ err }, "Unexpected error in GET /predictions");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /predictions — save a prediction result
router.post("/predictions", async (req, res): Promise<void> => {
  const parsed = CreatePredictionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const body = parsed.data;

  try {
    const { data, error } = await supabase
      .from("predictions")
      .insert({
        campaign_name: body.campaignName ?? null,
        channel: body.channel,
        industry: body.industry,
        target_audience: body.targetAudience,
        objective: body.objective,
        budget: body.budget,
        duration_days: body.durationDays,
        target_audience_size: body.targetAudienceSize,
        creative_quality_score: body.creativeQualityScore,
        past_engagement_score: body.pastEngagementScore,
        seasonality_index: body.seasonalityIndex,
        predicted_cac: body.predictedCac,
        predicted_conversion_rate: body.predictedConversionRate,
        predicted_roi: body.predictedRoi,
        success_probability: body.successProbability,
        will_succeed: body.willSucceed,
        estimated_conversions: body.estimatedConversions ?? null,
        estimated_revenue: body.estimatedRevenue ?? null,
      })
      .select()
      .single();

    if (error) {
      req.log.error({ err: error }, "Failed to insert prediction");
      res.status(500).json({ error: "Failed to save prediction" });
      return;
    }

    res.status(201).json(rowToPrediction(data as Record<string, unknown>));
  } catch (err) {
    req.log.error({ err }, "Unexpected error in POST /predictions");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
