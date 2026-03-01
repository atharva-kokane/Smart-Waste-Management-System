import { AqiDisplay } from "@/components/aqi-display"
import { PollutantCards } from "@/components/pollutant-cards"
import { AqiTrendChart } from "@/components/aqi-trend-chart"
import { AreaPollutionTable } from "@/components/area-pollution-table"

export default function PollutionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Air Pollution Monitoring</h1>
        <p className="text-sm text-muted-foreground">Real-time air quality data and pollutant analysis across city zones</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <AqiDisplay />
        <div className="lg:col-span-3">
          <PollutantCards />
        </div>
      </div>
      <AqiTrendChart />
      <AreaPollutionTable />
    </div>
  )
}
