import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">知识库</h1>
        <p className="text-muted-foreground">整理常见考点的标准答案与模板</p>
      </div>
      <Card>
        <CardHeader>
          <Library className="h-8 w-8 text-green-600 mb-2" />
          <CardTitle>即将推出</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>常见考点标准答案模板</li>
            <li>系统设计模板（短链、秒杀、消息队列等）</li>
            <li>行为面试STAR故事库</li>
            <li>支持Markdown富文本编辑</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
