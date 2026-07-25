import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  try {
    // Fetch dashboard summary and channel performance views in parallel
    const [summaryRes, channelRes, recentPredRes] = await Promise.all([
      supabase.from("dashboard_summary").select("*").single(),
      supabase.from("channel_performance").select("*"),
      supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (summaryRes.error) {
      req.log.error({ err: summaryRes.error }, "Failed to fetch dashboard summary");
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
      return;
    }

    if (channelRes.error) {
      req.log.error({ err: channelRes.error }, "Failed to fetch channel performance");
      res.status(500).json({ error: "Failed to fetch channel performance" });
      return;
    }

    if (recentPredRes.error) {
      req.log.error({ err: recentPredRes.error }, "Failed to fetch recent predictions");
      res.status(500).json({ error: "Failed to fetch recent predictions" });
      return;
    }

    const raw = summaryRes.data as Record<string, unknown>;
    const summary = {
      totalCampaigns: Number(raw.total_campaigns ?? 0),
      avgRoi: Number(raw.avg_roi ?? 0),
      avgCac: Number(raw.avg_cac ?? 0),
      avgConversionRate: Number(raw.avg_conversion_rate ?? 0),
      overallSuccessRatePct: Number(raw.overall_success_rate_pct ?? 0),
      totalRevenue: Number(raw.total_revenue ?? 0),
      totalSpend: Number(raw.total_spend ?? 0),
    };

    const channelPerformance = (channelRes.data ?? []).map((row: Record<string, unknown>) => ({
      channel: String(row.channel ?? ""),
      campaignCount: Number(row.campaign_count ?? 0),
      avgRoi: Number(row.avg_roi ?? 0),
      avgCac: Number(row.avg_cac ?? 0),
      avgConversionRate: Number(row.avg_conversion_rate ?? 0),
      successRatePct: Number(row.success_rate_pct ?? 0),
    }));

    const recentPredictions = (recentPredRes.data ?? []).map((row: Record<string, unknown>) => ({
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
    }));

    res.json({ summary, channelPerformance, recentPredictions });
  } catch (err) {
    req.log.error({ err }, "Unexpected error in GET /dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
