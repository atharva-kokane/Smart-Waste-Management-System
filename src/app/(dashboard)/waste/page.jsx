import { WasteBinTable } from "@/components/waste-bin-table"
import { WasteMapView } from "@/components/waste-map-view"
import { WasteAlertPanel } from "@/components/waste-alert-panel"

export default function WasteManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Waste Management</h1>
        <p className="text-sm text-muted-foreground">Monitor smart bin status, fill levels, and collection schedules</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WasteMapView />
        </div>
        <WasteAlertPanel />
      </div>
      <WasteBinTable />
    </div>
  )
}
