import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { BaseModule } from "@batch-flask/ui";
import { NodesHeatmapComponent, NodesHeatmapLegendComponent } from "./heatmap";
import { HistoryGraphComponent } from "./history-graph";
import {
    CpuUsageGraphComponent, DiskUsageGraphComponent, EnableAppInsightsDocComponent,
    MemoryUsageGraphComponent, NetworkUsageGraphComponent, PerformanceGraphComponent,
} from "./performance-graph";
import { PoolGraphsComponent } from "./pool-graphs.component";
import { PoolStandaloneGraphsComponent } from "./standalone";

const components = [NodesHeatmapComponent,
    NodesHeatmapLegendComponent, PoolGraphsComponent, HistoryGraphComponent,
    PerformanceGraphComponent, CpuUsageGraphComponent,
    MemoryUsageGraphComponent, DiskUsageGraphComponent,
    NetworkUsageGraphComponent, EnableAppInsightsDocComponent,
    PoolStandaloneGraphsComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, BaseModule, FormsModule, ReactiveFormsModule],
})
export class PoolGraphsModule {

}
