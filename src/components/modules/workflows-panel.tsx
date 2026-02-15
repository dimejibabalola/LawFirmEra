"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowBuilder } from "@/components/workflows/workflow-builder"
import { Zap, Settings, History } from "lucide-react"

export function WorkflowsPanel() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Workflow Automation
          </h2>
          <p className="text-sm text-muted-foreground">Automate your CRM processes with triggers and actions</p>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 h-auto flex-wrap gap-1 rounded-xl border border-slate-200">
          <TabsTrigger value="workflows" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600">
            <Zap className="mr-2 h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600">
            <History className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="mt-0">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Execution history will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Workflow settings will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
