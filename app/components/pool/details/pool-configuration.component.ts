import { Component, Input } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { List } from "immutable";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { EditMetadataFormComponent } from "app/components/common/edit-metadata-form";
import { StartTaskEditFormComponent } from "app/components/pool/start-task";
import { ApplicationPackageReference, CertificateReference, Metadata, Pool, StartTask } from "app/models";
import { PoolDecorator } from "app/models/decorators";
import { PoolPatchDto } from "app/models/dtos";
import { PoolService } from "app/services";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-pool-configuration",
    templateUrl: "pool-configuration.html",
})
export class PoolConfigurationComponent {
    @Input()
    public set pool(value: Pool) {
        this._pool = value;
        this._refresh(this._pool);
    }
    public get pool() { return this._pool; }

    public decorator: PoolDecorator;
    public startTask: StartTask;
    public certificates: List<CertificateReference>;
    public appPackages: List<ApplicationPackageReference>;
    public metadata: List<Metadata> = List([]);

    private _pool: Pool;

    constructor(private sidebarManager: SidebarManager, private poolService: PoolService) {

    }

    @autobind()
    public editMetadata() {
        const id = this.pool.id;
        const ref = this.sidebarManager.open(`edit-pool-metadata-${id}`, EditMetadataFormComponent);
        ref.component.metadata = this.pool.metadata;
        ref.component.save = (metadata) => {
            const data = new PoolPatchDto({ metadata });
            return this.poolService.patch(id, data).cascade(() => this.poolService.get(id));
        };
    }

    @autobind()
    public editStartTask() {
        const ref = this.sidebarManager.open(`edit-start-task-${this._pool.id}`, StartTaskEditFormComponent);
        ref.component.pool = this.pool;
    }

    public get startTaskItemCount() {
        return Object.keys(this.startTask).length;
    }

    public get containerConfiguration() {
        const vmConfig = this.decorator.virtualMachineConfiguration;
        return  vmConfig && vmConfig.containerConfiguration;
    }

    public get poolEndpointConfiguration() {
        const poolEndpointConfig = this.decorator.poolEndpointConfiguration;
        return  poolEndpointConfig && poolEndpointConfig.inboundNATPools;
    }

    private _refresh(pool: Pool) {
        if (pool) {
            this.decorator = new PoolDecorator(this._pool);
            this.appPackages = this.decorator.applicationPackageReferences;
            this.certificates = this.decorator.certificateReferences;
            this.metadata = pool.metadata;
            // Quick fix to make sure it stops crashing the UI
            this.startTask = pool.startTask || {} as any;
        }
    }

}
