"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">General Settings</CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="city-name" className="text-xs">City Name</Label>
            <Input id="city-name" defaultValue="Metro City" className="h-9" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-email" className="text-xs">Admin Email</Label>
            <Input id="admin-email" defaultValue="admin@metrocity.gov" className="h-9" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="refresh-rate" className="text-xs">Data Refresh Rate (seconds)</Label>
            <Input id="refresh-rate" type="number" defaultValue="30" className="h-9" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
          <CardDescription>Configure alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-medium">Critical Bin Alerts</Label>
              <p className="text-[10px] text-muted-foreground">Notify when bins reach 85% capacity</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-medium">AQI Threshold Alerts</Label>
              <p className="text-[10px] text-muted-foreground">Notify when AQI exceeds safe levels</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-medium">Automation Failure Alerts</Label>
              <p className="text-[10px] text-muted-foreground">Notify on workflow failures</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-medium">Email Notifications</Label>
              <p className="text-[10px] text-muted-foreground">Send alerts via email</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">AI Configuration</CardTitle>
          <CardDescription>Configure AI prediction settings</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-medium">Enable AI Predictions</Label>
              <p className="text-[10px] text-muted-foreground">Use machine learning for waste and pollution forecasting</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="prediction-interval" className="text-xs">Prediction Interval (minutes)</Label>
            <Input id="prediction-interval" type="number" defaultValue="15" className="h-9" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Save Settings
        </Button>
      </div>
    </div>
  )
}
