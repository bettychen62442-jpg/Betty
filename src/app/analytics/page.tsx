import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">复盘分析</h1>
        <p className="text-muted-foreground">面试表现分析与薄弱点统计</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>即将推出</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>各项技术方向掌握率雷达图</li>
            <li>面试通过率趋势</li>
            <li>高频错题 Top N</li>
            <li>各公司常考题型分布</li>
            <li>根据薄弱点自动生成复习建议</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
