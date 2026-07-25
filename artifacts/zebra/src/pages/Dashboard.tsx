import { useGetDashboard, useListPredictions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboard();
  const { data: predictions, isLoading: isPredictionsLoading } = useListPredictions();

  if (isDashboardLoading || isPredictionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-mono text-sm">CALCULATING METRICS...</p>
        </div>
      </div>
    );
  }

  if (!dashboard || !predictions) return null;

  const { summary, channelPerformance } = dashboard;

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (val: number) => `${(val * 100).toFixed(1)}%`;
  const formatNumber = (val: number) => val.toLocaleString();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Campaign Intelligence</h1>
        <p className="text-muted-foreground mt-2">Aggregated performance across all modeled campaigns.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-foreground font-bold">
              {formatNumber(summary.totalCampaigns)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-t-4 border-t-[#E8A33D]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-[#E8A33D] uppercase tracking-wider font-medium">Avg ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-foreground font-bold">
              {formatPercent(summary.avgRoi)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-t-4 border-t-[#F2637B]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-[#F2637B] uppercase tracking-wider font-medium">Avg CAC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-foreground font-bold">
              {formatCurrency(summary.avgCac)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-t-4 border-t-[#2DD4BF]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-[#2DD4BF] uppercase tracking-wider font-medium">Avg Conv Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-foreground font-bold">
              {formatPercent(summary.avgConversionRate)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono text-foreground font-bold">
              {summary.overallSuccessRatePct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">Avg ROI by Channel</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="channel" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                  itemStyle={{ color: '#E8A33D', fontFamily: 'var(--app-font-mono)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '4px' }}
                  formatter={(value: number) => [formatPercent(value), 'ROI']}
                />
                <Bar dataKey="avgRoi" fill="#E8A33D" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">Avg CAC by Channel</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="channel" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                  itemStyle={{ color: '#F2637B', fontFamily: 'var(--app-font-mono)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '4px' }}
                  formatter={(value: number) => [formatCurrency(value), 'CAC']}
                />
                <Bar dataKey="avgCac" fill="#F2637B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-display tracking-wide uppercase text-muted-foreground">Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No predictions recorded yet. Run a prediction to see data here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Campaign</th>
                    <th className="px-4 py-3 font-medium">Channel</th>
                    <th className="px-4 py-3 font-medium text-right">Budget</th>
                    <th className="px-4 py-3 font-medium text-right">CAC</th>
                    <th className="px-4 py-3 font-medium text-right">Conv. Rate</th>
                    <th className="px-4 py-3 font-medium text-right">ROI</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[13px]">
                  {predictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-sans text-foreground truncate max-w-[150px]">
                        {pred.campaignName || "Untitled Campaign"}
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {format(new Date(pred.createdAt), "MMM d, yyyy HH:mm")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-sans">{pred.channel}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(pred.budget)}</td>
                      <td className="px-4 py-3 text-right text-[#F2637B]">{formatCurrency(pred.predictedCac)}</td>
                      <td className="px-4 py-3 text-right text-[#2DD4BF]">{formatPercent(pred.predictedConversionRate)}</td>
                      <td className="px-4 py-3 text-right text-[#E8A33D]">{formatPercent(pred.predictedRoi)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          pred.willSucceed ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F2637B]/10 text-[#F2637B]'
                        }`}>
                          {pred.willSucceed ? 'SUCCESS' : 'AT RISK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}