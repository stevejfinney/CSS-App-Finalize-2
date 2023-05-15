import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminOptionsComponent } from './admin-options/admin-options.component';
import { LtsComponent } from './lts/lts.component';
import { EventsComponent } from './events/events.component';
import { ApiGuard } from './api.guard';
import { CategoriesComponent } from './categories/categories.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { SegmentsComponent } from './segments/segments.component';
import { CompetitorsComponent } from './competitors/competitors.component';
import { SegmentCompetitorsComponent } from './segment-competitors/segment-competitors.component';
import { OfficialsComponent } from './officials/officials.component';
import { SegmentOfficialsComponent } from './segment-officials/segment-officials.component';
import { MatTabsModule } from '@angular/material/tabs';
import { JudgescreenComponent } from './judgescreen/judgescreen.component';

import { RinksComponent } from './rinks/rinks.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { RefereescreenComponent } from './refereescreen/refereescreen.component';
import { VROScreenComponent } from './vroscreen/vroscreen.component';
import { MaterialDioScreenComponent } from './material-dio-screen/material-dio-screen.component'
import { VideoreplayComponent } from './videoreplay/videoreplay.component';
import { SegmentComponent } from './segment/segment.component';
import { SkateComponent } from './skate/skate.component';
import { AnnouncerscreenComponent } from './announcerscreen/announcerscreen.component';
import { BroadcasterscreenComponent } from './broadcasterscreen/broadcasterscreen.component';
import { MonitorscreenComponent } from './monitorscreen/monitorscreen.component';

const routes: Routes = [
    {
        path: 'admin',
        canActivate: [ApiGuard],
        component: AdminOptionsComponent,
        //data: { offlineLogin: 'true', requiresRoles: 'ds' } // Steve update to allow Norm online access to db copy functions.
    },
    {
        path: 'event',
        canActivate: [ApiGuard],
        component: EventsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'event/:eventid',
        canActivate: [ApiGuard],
        component: CategoriesComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'category/:categoryid',
        canActivate: [ApiGuard],
        component: SegmentsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'competitors/:categoryid',
        canActivate: [ApiGuard],
        component: CompetitorsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'segment-competitors/:segmentid',
        canActivate: [ApiGuard],
        component: SegmentCompetitorsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'rink/:categoryid',
        canActivate: [ApiGuard],
        component: RinksComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'officials/:categoryid',
        canActivate: [ApiGuard],
        component: OfficialsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'segment-officials/:segmentid',
        canActivate: [ApiGuard],
        component: SegmentOfficialsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'segment/:segmentid',
        canActivate: [ApiGuard],
        component: SegmentComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'skate/:competitorentryid',
        canActivate: [ApiGuard],
        component: SkateComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'event-permissions/:eventid',
        canActivate: [ApiGuard],
        component: PermissionsComponent,
        data: { requiresRoles: 'ds' }
    },
    {
        path: 'dashboard',
        canActivate: [ApiGuard],
        component: DashboardComponent
    },
    {
        path: 'lts/home',
        canActivate: [ApiGuard],
        component: LtsComponent
    },
    {
        path: 'lts/home/:judgeid',
        canActivate: [ApiGuard],
        component: LtsComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'refereescreen/:segmentid/:assignmentid',
        component: RefereescreenComponent
    },
    {
        path: 'vroscreen/:segmentid/:assignmentid',
        component: VROScreenComponent
    },
    {
        path: 'judgescreen/:segmentid/:assignmentid',
        component: JudgescreenComponent
    },
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {

        path: 'dioscreen/:segmentid/:assignmentid',
        component: MaterialDioScreenComponent
    },
    {
        path: 'video_replay',
        component: VideoreplayComponent
    },
    {
        path: 'announcerscreen/:segmentid/:assignmentid',
        component: AnnouncerscreenComponent
    },
    {
        path: 'broadcasterscreen/:segmentid/:assignmentid',
        component: BroadcasterscreenComponent
    },
    {
        path: 'monitorscreen/:segmentid/:assignmentid',
        component: MonitorscreenComponent
    },

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
