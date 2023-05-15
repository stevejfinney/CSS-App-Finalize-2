
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import angular material modules for styling.
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AdminOptionsComponent } from './admin-options/admin-options.component';
import { ApiService } from './api.service';
import { LtsComponent } from './lts/lts.component';
import { ApiGuard } from './api.guard';
import { TokenInterceptorService } from './token-interceptor.service';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { EventsComponent, eventsForm } from './events/events.component';
import { CategoriesComponent, categoriesForm } from './categories/categories.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { MatTabsModule } from '@angular/material/tabs';

import {
  SegmentsComponent,
  pcFactors,
  standardsCriteria,
  FormaCriterionLevelPipe,
  FormaRuleTypePipe,
  FormatCountTypePipe,
  segmentsForm
} from './segments/segments.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CompetitorsComponent } from './competitors/competitors.component';
import { SegmentCompetitorsComponent } from './segment-competitors/segment-competitors.component';
import { OfficialsComponent } from './officials/officials.component';
import { SegmentOfficialsComponent, changeOfficialPosition } from './segment-officials/segment-officials.component';
import { ServerEnvService } from './init.envservice';
import { LayoutModule } from '@angular/cdk/layout';

import { MatGridListModule } from '@angular/material/grid-list';

import { JudgescreenComponent, JudgeScreenScoreSummary, JudgeScreenViolation, JudgeScreenProgramComponent,JudgeConfirmationDialog } from './judgescreen/judgescreen.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MaterialDioScreenComponent, dio_video } from './material-dio-screen/material-dio-screen.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatService } from './chat_service';
import { VideoreplayComponent } from './videoreplay/videoreplay.component';
import { RinksComponent } from './rinks/rinks.component';
import { SegmentComponent, FormatTimePipe, SegmentSummary } from './segment/segment.component';
import { SkateComponent } from './skate/skate.component';
import { RefereescreenComponent, refereeMessage, refJudgeStatusScreen, RefereeScreenScoreSummary, RefereeScreenViolation, RefereeScreenProgramComponent,ConfirmationDialog } from './refereescreen/refereescreen.component';

import { VROScreenComponent } from './vroscreen/vroscreen.component';
import { AnnouncerscreenComponent, score_dialog } from './announcerscreen/announcerscreen.component';
import { BroadcasterscreenComponent, MonitorOfficialSummary1 } from './broadcasterscreen/broadcasterscreen.component';
import { MonitorscreenComponent, MonitorOfficialSummary } from './monitorscreen/monitorscreen.component';

import { MSAL_INSTANCE, MsalModule, MsalService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId:'ddafb0b8-61fd-4c09-a59f-f1625844b0aa',
      redirectUri: 'http://localhost:4200/login'
    }
  })
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminOptionsComponent,
    LtsComponent,
    NavMenuComponent,
    EventsComponent,
    eventsForm,
    CategoriesComponent,
    categoriesForm,
    PermissionsComponent,
    SegmentsComponent,
    pcFactors,
    standardsCriteria,
    segmentsForm,
    CompetitorsComponent,
    SegmentCompetitorsComponent,
    OfficialsComponent,
    SegmentOfficialsComponent,
    changeOfficialPosition,
    DashboardComponent,
    JudgescreenComponent,
    JudgeScreenScoreSummary,
    JudgeScreenViolation,
    JudgeScreenProgramComponent,
    JudgeConfirmationDialog,
    RinksComponent,
    SegmentComponent,
    FormatTimePipe,
    SegmentSummary,
    SkateComponent,
    FormaCriterionLevelPipe,
    FormaRuleTypePipe,
    FormatCountTypePipe,
    MaterialDioScreenComponent,
    VideoreplayComponent,
    RefereescreenComponent,
    RefereeScreenScoreSummary,
    refereeMessage,
    RefereeScreenViolation,
    RefereeScreenProgramComponent,
    ConfirmationDialog,
    VROScreenComponent,
    dio_video,
    refJudgeStatusScreen,
    AnnouncerscreenComponent,
    score_dialog,
    BroadcasterscreenComponent,
    MonitorscreenComponent,
    MonitorOfficialSummary,
    MonitorOfficialSummary1
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatSelectModule,
    MatListModule,
    MatMenuModule,
    MatDatepickerModule,
    MatGridListModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    DragDropModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatGridListModule,
    LayoutModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    ScrollingModule,
    MatSortModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MsalModule
  ],
  providers: [
    ApiService,
    ChatService,
    ApiGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    ServerEnvService,
    {
      provide: APP_INITIALIZER,
      useFactory: initFunction,
      deps: [ServerEnvService],
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }

export function initFunction(config: ServerEnvService) {
  return () => config.init();
}