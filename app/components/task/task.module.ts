import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { PoolBaseModule } from "app/components/pool/base";
import { TaskBaseModule } from "app/components/task/base";
import { TaskBrowseModule } from "app/components/task/browse";
import { TaskDetailsModule } from "app/components/task/details";
import { TaskHomeComponent } from "app/components/task/home";

import {
    DeleteTaskDialogComponent,
    RerunTaskFormComponent,
    TaskCreateBasicDialogComponent,
    TerminateTaskDialogComponent,
} from "app/components/task/action";

const components = [
    TaskHomeComponent, DeleteTaskDialogComponent, RerunTaskFormComponent, TaskCreateBasicDialogComponent,
    TerminateTaskDialogComponent,
];

const modules = [
    DataSharedModule, PoolBaseModule, TaskBaseModule, TaskBrowseModule, TaskDetailsModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
    entryComponents: [
        DeleteTaskDialogComponent,
        RerunTaskFormComponent,
        TaskCreateBasicDialogComponent,
        TerminateTaskDialogComponent,
    ],
})
export class TaskModule {
}
