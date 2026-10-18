import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Database } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">导出</h1>
        <p className="text-muted-foreground">导出题目、面试记录和数据备份</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>导出题目</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              将题库导出为Markdown或PDF格式
            </p>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" /> 导出Markdown (即将推出)
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Database className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>数据备份</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              导出全部数据为JSON格式备份文件
            </p>
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" /> 下载备份 (即将推出)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
