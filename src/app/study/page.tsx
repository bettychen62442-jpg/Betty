import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Shuffle } from "lucide-react";

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">复习计划</h1>
        <p className="text-muted-foreground">基于间隔重复的复习系统</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/study">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>每日复习</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                基于SM-2算法的间隔重复，科学安排每日复习任务
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/study/mock">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <Shuffle className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>模拟面试</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                随机抽题组成模拟面试，一次一题，自评打分
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
