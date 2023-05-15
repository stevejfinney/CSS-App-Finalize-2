import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { retry, catchError, map } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private httpClient: HttpClient,
        private _router: Router) { }

    handleError(error: HttpErrorResponse) {
        return throwError(error);
    }

    // User related properties
    public loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
    public isOnline = new BehaviorSubject<boolean>(this.checkIsOnline());
    public UserName = new BehaviorSubject<string>(sessionStorage.getItem('firstname') || '');
    public OnlineStatus = new BehaviorSubject<string>(this.checkOnlineStatus());

    public canView = new BehaviorSubject<boolean>(this.hasPagePermissions());

    // Get Authorization
    public doAuth(params: any) {
        // do processing here
        return this.httpClient.post(`/api/auth`, params).pipe(retry(3), catchError(this.handleError));
    }

    // Check Database
    public checkDb() {
        return this.httpClient.get(`/api/checkdb`).pipe(retry(3), catchError(this.handleError));
    }

    // Rebuild Database
    public rebuildDb() {
        return this.httpClient.get(`/api/rebuilddb`).pipe(retry(3), catchError(this.handleError));
    }

    // Update Database
    public checkDbVersion() {
        return this.httpClient.get(`/api/checkdbversion`).pipe(retry(3), catchError(this.handleError));
    }

    // get defintions
    public updateDefinitions(params: any) {
        return this.httpClient.post(`/api/updatedefinitions`, params).pipe(retry(3), catchError(this.handleError));
    }

    // update schema
    public updateSchema() {
        return this.httpClient.get(`/api/updateschema`).pipe(retry(3), catchError(this.handleError));
    }

    //
    logoutUser() {
        //Set LoginStatus to false and delete saved cookie
        this.loginStatus.next(false)
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('firstname')
        sessionStorage.setItem('loginStatus', '0');
        sessionStorage.removeItem('roles');
        sessionStorage.removeItem('scnum');
        sessionStorage.removeItem('contactid');
        this._router.navigate(['/login']);

        console.log("Logged Out Successfully");
    }

    getUserRoles() {
        // loop through roles list and return type
        var rolesArr = sessionStorage.getItem('roles')?.split(',');
        var rolesStr: string[] = [];

        rolesArr?.forEach((element) => {
            switch (element.toUpperCase()) { // should have at least one of the following
                case 'EA8F1678-C1BF-EB11-8236-000D3A9D1A93':
                    rolesStr.push('ds');
                    break;
                case 'CAD568F8-7672-E911-A980-000D3A1998FB':
                    rolesStr.push('official');
                    break;
            }
        });
        return rolesStr.toString();
    }

    getToken() {
        var accessToken = sessionStorage.getItem('accessToken');
        return accessToken;
    }

    hasPagePermissions(): boolean {
        var canView = true;

        // get online/offline
        var isOnline = sessionStorage.getItem("isOnline");
        //alert(isOnline);
        var loginCookie = sessionStorage.getItem("loginStatus");
        //alert(loginCookie);

        if (isOnline === "true") { // if online always require login
            // check login
            if (loginCookie === "1") {
                if (sessionStorage.getItem('accessToken') === null || sessionStorage.getItem('accessToken') === undefined) {
                    canView = false;
                }
                else {
                    canView = true;
                }
            }
            else {
                canView = false;
            }
        }

        if (isOnline === "false") { // if offline require login for specific pages
            //alert(this.actRoute.snapshot.url.toString());
        }

        return canView;
    }

    get canViewPage() {
        return this.canView.asObservable();
    }

    //Let's create the function that checks the login status 
    checkLoginStatus(): boolean {

        var loginCookie = sessionStorage.getItem("loginStatus");

        if (loginCookie === "1") {
            //If there is no token
            if (sessionStorage.getItem('accessToken') === null || sessionStorage.getItem('accessToken') === undefined) {
                return false;
            }
            else {
                return true;
            }
        }
        return false;

    }

    get isLoggedIn() {
        //return 0 or 1 to the session storage
        return this.loginStatus.asObservable();
    }

    get currentUserName() {
        //return the user first name 
        return this.UserName.asObservable();
    }



    //Let's create the function that checks the online status 
    checkOnlineStatus(): string {

        var isOnline = sessionStorage.getItem("isOnline");

        if (isOnline === "true") {
            return "online";
        }
        return "offline";
    }

    //Let's create the function that checks the login status 
    checkIsOnline(): boolean {

        var isOnline = sessionStorage.getItem("isOnline");

        if (isOnline === "true") {
            return true;
        }
        return false;
    }

    get getIsOnline() {
        //return 0 or 1 to the session storage
        return this.isOnline.asObservable();
    }

    // event functions
    public getEvents() {
        const params = { contactid: sessionStorage.getItem('contactid') };
        return this.httpClient.post(`/api/events`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getJudgeAssignments() {
        const params = { scnum: sessionStorage.getItem('scnum') };
        return this.httpClient.post(`/api/judgeassignments`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getEventById(params: any) {
        return this.httpClient.get(`/api/events/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public insertEvent(params: any) {
        params.contactname = sessionStorage.getItem('firstname') + ' ' + sessionStorage.getItem('lastname');
        params.contactid = sessionStorage.getItem('contactid');
        return this.httpClient.put(`/api/events`, params).pipe(retry(3), catchError(this.handleError));
    }

    public updateEvent(params: any) {
        params.contactid = sessionStorage.getItem('contactid');
        return this.httpClient.patch(`/api/events`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deleteEvent(params: any) {
        return this.httpClient.delete(`/api/events/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getEventClasses() {
        return this.httpClient.get(`/api/eventclasses`).pipe(retry(3), catchError(this.handleError));
    }

    public setSegmentInProgress(params: any) {
        return this.httpClient.post(`/api/togglesegment`, params).pipe(retry(3), catchError(this.handleError));
    }

    // public setRinkFeedLive(params: any) {
    //     return this.httpClient.post(`/api/togglelivefeed/`, params).pipe(retry(3), catchError(this.handleError));
    // }

    public getLiveFeedStatus(params: any) {
        return this.httpClient.get(`/api/getfeedstatus/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getCategories(params: any) {
        return this.httpClient.get(`/api/categories/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getPrograms() {
        return this.httpClient.get(`/api/categoryprograms`).pipe(retry(3), catchError(this.handleError));
    }

    public getDisciplines() {
        return this.httpClient.get(`/api/categorydisciplines`).pipe(retry(3), catchError(this.handleError));
    }

    public insertCategory(params: any) {
        // set default values for three checks
        params.hascompetitors = "N";
        params.hasofficials = "N";
        params.hasreadysegments = "N";
        return this.httpClient.post(`/api/categories`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getEventBySegmentid(params: any) {
        return this.httpClient.get(`/api/eventbysegmentid/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public updateCategory(params: any) {
        return this.httpClient.patch(`/api/categories`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deleteCategory(params: any) {
        return this.httpClient.delete(`/api/categories/${params.eventid}/${params.categoryid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getCategoryById(params: any) {
        return this.httpClient.get(`/api/category/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getCategoryDisciplineByParent(params: any) {
        return this.httpClient.get(`/api/categorydisciplinesbyparent/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getSegmentsByCategory(params: any) {
        return this.httpClient.get(`/api/segments/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getAvailableSegmentsByCategory(params: any) {
        return this.httpClient.get(`/api/availablesegments/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getRinksByEvent(params: any) {
        return this.httpClient.get(`/api/rinks/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public insertRink(params: any) {
        return this.httpClient.put(`/api/rinks`, params).pipe(retry(3), catchError(this.handleError));
    }

    public updateRink(params: any) {
        return this.httpClient.patch(`/api/rink`, params).pipe(retry(3), catchError(this.handleError));
    }

    public startRink(params: any) {
        return this.httpClient.patch(`/api/rink_start`, params).pipe(retry(3), catchError(this.handleError));
    }

    public stopRink(params: any) {
        return this.httpClient.patch(`/api/rink_stop`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deleteRink(params: any) {
        return this.httpClient.delete(`/api/rinks/${params.rinkid}/${params.eventid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getRinkById(params: any) {
        return this.httpClient.get(`/api/rink/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public updateSegmentOrder(params: any) {
        return this.httpClient.patch(`/api/updatesegmentorder`, params).pipe(retry(3), catchError(this.handleError));
    }

    public insertSegment(params: any) {
        return this.httpClient.post(`/api/segments`, params).pipe(retry(3), catchError(this.handleError));
    }

    public updateSegment(params: any) {
        return this.httpClient.patch(`/api/segments`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deleteSegment(params: any) {
        return this.httpClient.delete(`/api/segments/${params.segmentid}/${params.categoryid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getSegmentById(params: any) {
        return this.httpClient.get(`/api/segment/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getOfficialsBySegment(params: any) {
        return this.httpClient.get(`/api/getoffcials/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getSegmentCompetitors(params: any) {
        return this.httpClient.get(`/api/segmentcompetitors/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getSegmentOfficials(params: any) {
        return this.httpClient.get(`/api/segmentofficials/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public updateSegmentCompetitorOrder(params: any) {
        return this.httpClient.patch(`/api/updatesegmentcompetitororder`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getSegmentDefinitionDefaults(params: any) {
        return this.httpClient.get(`/api/segmentdefaults/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public viewPcFactors(params: any) {
        return this.httpClient.get(`/api/pcfactors/${params.definitionid}`).pipe(retry(3), catchError(this.handleError));
    }

    public viewStandardsCriteria(params: any) {
        return this.httpClient.get(`/api/standardscriteria/${params.definitionid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getPatternDances() {
        return this.httpClient.get(`/api/patterndances/`).pipe(retry(3), catchError(this.handleError));
    }

    public getCategoryDefinitionByParent(params: any) {
        return this.httpClient.get(`/api/categorydefinitions/${params.programid}/${params.disciplineid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getEventPermissions(params: any) {
        return this.httpClient.get(`/api/eventpermissions/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public getDataSpecialists(params: any) {
        return this.httpClient.post(`/api/dataspecs`, params).pipe(retry(3), catchError(this.handleError));
    }

    public insertPerms(params: any) {
        //console.log(params);
        return this.httpClient.put(`/api/insertperm`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deletePerm(params: any) {
        return this.httpClient.delete(`/api/deleteperm/${params.eventid}/${params.dspermissionsid}`).pipe(retry(3), catchError(this.handleError));
    }

    public configToTest() {
        return this.httpClient.get(`/api/scoringtotest`).pipe(retry(3), catchError(this.handleError));
    }

    public testToProd() {
        return this.httpClient.get(`/api/testtoprod`).pipe(retry(3), catchError(this.handleError));
    }

    public eventUpload(formData: any, eventid: any, online: any) {
        return this.httpClient.post(`/api/eventupload/${eventid}/${online}`, formData).pipe(retry(3), catchError(this.handleError));
    }

    public getSearchCompetitors(params: any) {
        return this.httpClient.post(`/api/searchcompetitors`, params).pipe(retry(3), catchError(this.handleError));
    }

    public randomStartOrder(params: any) {
        return this.httpClient.get(`/api/sortcompetitors/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public reverseStartOrder(params: any) {
        return this.httpClient.get(`/api/revsortcompetitors/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public prevStartOrder(params: any) {
        return this.httpClient.get(`/api/prevsortcompetitors/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public prevRankingStart(params: any) {
        return this.httpClient.get(`/api/prevrankcompetitors/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public setWarmupGroups(params: any) {
        return this.httpClient.get(`/api/sortwarmup/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public setPDGroups(params: any) {
        return this.httpClient.get(`/api/sortpdgroup/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public cyclePDGroups(params: any) {
        return this.httpClient.get(`/api/cyclepdgroup/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    public insertCompetitor(params: any) {
        return this.httpClient.post(`/api/addcompetitor`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deleteCompetitorEntry(params: any) {
        return this.httpClient.delete(`/api/deletecompetitorentry/${params.segmentid}/${params.competitorentryid}/`).pipe(retry(3), catchError(this.handleError));
    }

    public getCompetitorsByCategory(params: any) {
        return this.httpClient.get(`/api/competitorsbycategory/${params}`, params).pipe(retry(3), catchError(this.handleError));
    }

    public insertOfficial(params: any) {
        return this.httpClient.post(`/api/addofficial`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getSearchOfficialsLocal(params: any) {
        return this.httpClient.post(`/api/searchofficialslocal`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getSearchOfficials(params: any) {
        return this.httpClient.post(`/api/searchofficials`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getOfficialsByCategory(params: any) {
        return this.httpClient.get(`/api/officialsbycategory/${params}`, params).pipe(retry(3), catchError(this.handleError));
    }

    public deleteOfficalAssignment(params: any) {
        return this.httpClient.delete(`/api/deleteofficialassignment/${params.segmentid}/${params.officialassignmentid}/`).pipe(retry(3), catchError(this.handleError));
    }

    public getOfficialRoles() {
        return this.httpClient.get(`/api/officialroles`).pipe(retry(3), catchError(this.handleError));
    }

    public getOfficialPosition(params: any) {
        return this.httpClient.get(`/api/officialposition/${params.officialassignmentid}`).pipe(retry(3), catchError(this.handleError));
    }

    public updateOfficialAssignment(params: any) {
        return this.httpClient.patch(`/api/updateofficialposition`, params).pipe(retry(3), catchError(this.handleError));
    }

    public toggleSkater(params: any) {
        return this.httpClient.get(`/api/toggleskater/${params.competitorentryid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getCompetitorentry(params: any) {
        return this.httpClient.get(`/api/competitorentry/${params.competitorentryid}`).pipe(retry(3), catchError(this.handleError));
    }

    public getElementById(params: any) {
        return this.httpClient.get(`/api/element/${params}`).pipe(retry(3), catchError(this.handleError));
    }

    //kk
    public insertRating(params: any) {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$request coming in api servcice", params)
        return this.httpClient.post(`/api/rating_insert`, params).pipe(retry(3), catchError(this.handleError));
    }



    public httpCalculateSkateScore(params: any) {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$request coming in calculate skate score controller", params)
        return this.httpClient.get(`/api/calculateskatescore/${params}`).pipe(retry(3), catchError(this.handleError));
        //return this.httpClient.get(`/api/calculateskatescore`, params).pipe(retry(3), catchError(this.handleError));
    }

    public getTemplatedSegInfo(params: any) {
        console.log("request coming in get templated segment api servcice", params)
        return this.httpClient.post(`/api/tem_seg_skater_info`, params).pipe(retry(3), catchError(this.handleError));
    }


}