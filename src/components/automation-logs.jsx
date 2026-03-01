"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { automationLogs } from "@/lib/data"

export function AutomationLogs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Automation Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {automationLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium text-foreground">{log.workflow}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{log.timestamp}</TableCell>
                <TableCell>
                  <Badge
                    className={`text-[10px] px-1.5 py-0 ${
                      log.status === "Success"
                        ? "bg-accent text-accent-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                  {log.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
