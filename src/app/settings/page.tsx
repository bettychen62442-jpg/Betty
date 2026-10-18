import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-muted-foreground">AI服务配置、存储配置、数据管理</p>
      </div>
      <Card>
        <CardHeader>
          <Settings className="h-8 w-8 text-muted-foreground mb-2" />
          <CardTitle>系统配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium">AI 服务</h3>
              <p className="text-sm text-muted-foreground mt-1">
                当前使用: Mock Provider（模拟模式）
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                在 .env 文件中设置 AI_PROVIDER=openai 并配置 API Key 即可切换到真实AI服务
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h3 className="font-medium">存储</h3>
              <p className="text-sm text-muted-foreground mt-1">
                当前使用: Local Storage（本地文件系统）
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                音频文件存储在 data/audio/ 目录
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
