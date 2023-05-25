
exports.up = function(knex) {
    return knex.schema
    .createTable("css_sc_officials", tbl => {
        tbl.text("sc_officialid").notNullable().primary();
        tbl.text("sc_scnum");
        tbl.text("sc_fullname");
        tbl.text("sc_firstname");
        tbl.text("sc_middlename");
        tbl.text("sc_lastname");
        tbl.text("sc_email");
        tbl.text("sc_homeorg");
        tbl.text("sc_section");
        tbl.text("sc_registereduntil");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("css_sc_skatingofficialrole", tbl => {
        tbl.text("sc_skatingofficialroleid").unique().notNullable().primary();
        tbl.text("sc_type");
        tbl.text("sc_abbreviatedname");
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.text("sc_frenchabbreviatedname");
        tbl.integer("statecode");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("css_sc_dataspecialists", tbl => {
        tbl.text("sc_dataspecialistid").notNullable().primary();
        tbl.text("sc_fullname");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("css_sc_competitors", tbl => {
        tbl.text("sc_competitorid").notNullable().primary();
        tbl.text("sc_scnum");
        tbl.integer("sc_status");
        tbl.text("sc_name");
        tbl.text("sc_competitortype");
        tbl.text("sc_club");
        tbl.text("sc_region");
        tbl.text("sc_section");
        tbl.text("sc_biography");
        tbl.text("sc_account");
        tbl.text("sc_facebook");
        tbl.text("sc_instagram");
        tbl.text("sc_twitter");
        tbl.text("sc_websiteurl");
        tbl.text("sc_synchrocategory");
        tbl.text("sc_trainingsite");
        tbl.text("sc_competitorteam");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_categories", tbl => {
        tbl.text("categoryid").unique().notNullable().primary();
        tbl.text("eventid").notNullable().references("eventid").inTable("tbl_events").onDelete("CASCADE");
        tbl.text("enname");
        tbl.text("endescription");
        tbl.text("frname");
        tbl.text("frdescription");
        tbl.text("definitionid");
        tbl.integer("sortorder");
        tbl.text("status");
        tbl.text("hasreadysegments");
        tbl.text("hascompetitors");
        tbl.text("hasofficials");
        tbl.text("labels");
        tbl.text("startdate");
        tbl.text("enddate");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_events", tbl => {
        tbl.text("eventid").unique().notNullable().primary();
        tbl.text("sc_skatingeventclassid");
        tbl.integer("isoffline");
        tbl.text("enname");
        tbl.text("location");
        tbl.text("frname");
        tbl.integer("inprogress");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_segments", tbl => {
        tbl.text("segmentid").unique().notNullable().primary();
        tbl.text("categoryid").notNullable().references("categoryid").inTable("tbl_categories").onDelete("CASCADE");
        tbl.text("definitionid");
        tbl.text("enname");
        tbl.text("frname");
        tbl.text("status");
        tbl.integer("performanceorder");
        tbl.integer("programtime");
        tbl.integer("programhalftime");
        tbl.integer("warmuptime");
        tbl.integer("warmupnumber");
        tbl.integer("warmupgroupmaxsize");
        tbl.text("wellbalanced");
        tbl.integer("fallvalue");
        tbl.integer("reviewtime");
        tbl.real("totalsegmentfactor");
        tbl.text("patterndanceid");
        tbl.text("rinkid");
        tbl.integer("inprogress");
        tbl.text("startdate");
        tbl.text("enddate");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_rink", tbl => {
        tbl.text("rinkid").unique().notNullable().primary();
        tbl.text("eventid");
        tbl.text("name");
        tbl.integer("videofeed");
        tbl.integer("islive");
        tbl.text("injest_url");
        tbl.text("locator_url");
        tbl.text("assets");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_competitorentry", tbl => {
        tbl.text("competitorentryid").unique().notNullable().primary();
        tbl.text("segmentid");
        tbl.text("sc_competitorid");
        tbl.integer("sortorder");
        tbl.integer("warmupgroup");
        tbl.integer("subgroup");
        tbl.real("tes");
        tbl.real("pcs");
        tbl.real("adj");
        tbl.real("score");
        tbl.integer("onice");
        tbl.integer("skatestartvideotime");
        tbl.integer("skateendvideotime");
        tbl.text("createdon");
        tbl.text("modifiedon");
        tbl.text('video_url');
    })
    .createTable("tbl_officialassignment", tbl => {
        tbl.text("officialassignmentid").unique().notNullable().primary();
        tbl.text("segmentid");
        tbl.text("sc_officialid");
        tbl.text("role");
        tbl.integer("includescore");
        tbl.integer("position");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_skate_element", tbl => {
        tbl.text("skateelementid").unique().notNullable().primary();
        tbl.text("competitorentryid");
        tbl.text("sc_skatingelementdefinitionid");
        tbl.integer("programorder");
        tbl.integer("elementcount");
        tbl.text("multitype");
        tbl.integer("steporder");
        tbl.integer("rep_jump");
        tbl.integer("ratingtype");
        tbl.integer("halfwayflag"); // 1 = on, 0 = off
        tbl.text("notes");
        tbl.integer("invalid");
        tbl.integer("elementstart"); // seconds since start of program where element begins (for video timestamp)
        tbl.integer("elementend"); // seconds since start of program where element ends (for video timestamp)
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_goe", tbl => {
        tbl.text("goeid").unique().notNullable().primary();
        tbl.text("skateelementid");
        tbl.text("officialassignmentid");
        tbl.integer("goevalue");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_msg_log", tbl => {
        tbl.text("logid").unique().notNullable().primary();
        tbl.text("segmentid");
        tbl.text("competitorentryid");
        tbl.text("message");
        tbl.integer("timestamp");
    })
    .createTable("tbl_programcomponent", tbl => {
        tbl.text("programcomponentid").unique().notNullable().primary();
        tbl.text("competitorentryid");
        tbl.text("officialassignmentid");
        tbl.text("sc_skatingprogramcomponentdefinitionid");
        tbl.real("value");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_adjustments", tbl => {
        tbl.text("adjustmentid").unique().notNullable().primary();
        tbl.text("competitorentryid");
        tbl.text("officialassignmentid");
        tbl.text("sc_skatingadjustmentassociationid");
        tbl.integer("value");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("tbl_dspermissions", tbl => {
        tbl.text("dspermissionsid").unique().notNullable().primary();
        tbl.text("dscontactid"); // contactid from crm obtained at login
        tbl.text("dsname");
        tbl.text("eventid");
    })
    .createTable("tbl_version", tbl => {
        tbl.text("id").unique().notNullable().primary();
        tbl.integer("version");
    })
    .createTable("css_sc_skatingstandardscriteria", tbl => {
        tbl.text("sc_skatingstandardscriteriaid").unique().notNullable().primary();
        tbl.integer("sc_requiredcounttype");
        tbl.integer("sc_targetrating");
        tbl.integer("sc_criterionlevel");
        tbl.integer("sc_ruletype");
        tbl.text("sc_targetelement");
        tbl.text("sc_segment");
        tbl.integer("sc_requiredcount");
        tbl.text("sc_segmentname");
        tbl.text("sc_name");
    })
    .createTable("css_sc_skatingsegmentdefinitions", tbl => {
        tbl.text("sc_skatingsegmentdefinitionsid").unique().notNullable().primary();
        tbl.text("sc_elementconfiguration");
        tbl.text("sc_parentcategory");
        tbl.real("sc_totalsegmentfactor");
        tbl.text("sc_elementconfigurationname");
        tbl.text("sc_parentcategoryname");
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.integer("sc_order");
        tbl.integer("sc_reviewtime");
        tbl.integer("sc_programtime");
        tbl.integer("sc_warmuptime");
        tbl.integer("sc_programhalftime");
        tbl.integer("sc_warmupgroupmaximumsize");
        tbl.integer("sc_patterndancesegment");
        tbl.decimal("sc_halfwaybonusfactor", 38, 2);
        tbl.text("sc_halfwaybonuselementfamilytype");
        tbl.integer("sc_halfwaybonuselementlimit");

    })
    .createTable("css_sc_skatingprogramcomponenttype", tbl => {
        tbl.text("sc_skatingprogramcomponenttypeid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.integer("sc_order");
    })
    .createTable("css_sc_skatingprogramcomponentdefinition", tbl => {
        tbl.text("sc_skatingprogramcomponentdefinitionid").unique().notNullable().primary();
        tbl.text("sc_pctype");
        tbl.text("sc_parentsegment");
        tbl.text("sc_name");
        tbl.real("sc_pointvalue");
        tbl.integer("statecode");
    })
    .createTable("css_sc_skatingpatterndancedefinition", tbl => {
        tbl.text("sc_skatingpatterndancedefinitionid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.text("sc_elementcodeprefix");
    })
    .createTable("css_sc_skatingeventclass", tbl => {
        tbl.text("sc_skatingeventclassid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
    })
    .createTable("css_sc_skatingelementfamilytype", tbl => {
        tbl.text("sc_skatingelementfamilytypeid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.integer("sc_order");
        tbl.text("sc_modifiers");
        tbl.integer("sc_levelposition");
        tbl.integer("sc_showleveltojudges");
    })
    .createTable("css_sc_skatingelementfamily", tbl => {
        tbl.text("sc_skatingelementfamilyid").unique().notNullable().primary();
        tbl.text("sc_familytype");
        tbl.text("sc_familytype_entitytype");
        tbl.text("sc_code");
        tbl.text("sc_name");
        tbl.text("sc_familytypename");
        tbl.text("sc_internalnote");
        tbl.text("sc_frenchname");
        tbl.integer("sc_order");
        tbl.text("sc_abbreviatedname");
        tbl.text("sc_abbreviatednamefr");
    })
    .createTable("css_sc_skatingelementdefinition_sc_skatingd", tbl => {
        tbl.text("sc_skatingelementdefinition_sc_skatingdid").unique().notNullable().primary();
        tbl.text("sc_skatingdisciplinedefinitionid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_skatingelementconfiguration_sc_skati", tbl => {
        tbl.text("sc_skatingelementconfiguration_sc_skatiid").unique().notNullable().primary();
        tbl.text("sc_skatingelementconfigurationid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_skatingelementconfiguration", tbl => {
        tbl.text("sc_skatingelementconfigurationid").unique().notNullable().primary();
        tbl.integer("sc_mode");
        tbl.text("sc_name");
    })
    .createTable("css_sc_skatingdisciplinedefinition", tbl => {
        tbl.text("sc_skatingdisciplinedefinitionid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
    })
    .createTable("css_sc_skatingcategorylabeldefinition", tbl => {
        tbl.text("sc_skatingcategorylabeldefinitionid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
    })
    .createTable("css_sc_skatingcategorylabels", tbl => {
        tbl.text("sc_skatingcategorylabelsid").unique().notNullable().primary();
        tbl.int("sc_forced");
        tbl.text("sc_labeldefinition");
        tbl.text("sc_labeldefinition_entitytype");
        tbl.text("sc_parentcategory");
        tbl.text("sc_parentcategory_entitytype");
        tbl.text("sc_labeldefinitionname");
        tbl.text("sc_parentcategoryname");
        tbl.text("sc_name");
    })
    .createTable("css_sc_skatingcategorydefinition_sc_skating", tbl => {
        tbl.text("sc_skatingcategorydefinition_sc_skatingid").unique().notNullable().primary();
        tbl.text("sc_skatingcategorydefinitionid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_skatingcategorydefinition", tbl => {
        tbl.text("sc_skatingcategorydefinitionid").unique().notNullable().primary();
        tbl.integer("sc_scoringmethod");
        tbl.text("sc_skatingdisciplinedefinition");
        tbl.text("sc_parentprogram");
        tbl.text("sc_skatingdisciplinedefinitionname");
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.text("sc_parentprogramname");
    })
    .createTable("css_sc_skatingadjustmentdefinition", tbl => {
        tbl.text("sc_skatingadjustmentdefinitionid").unique().notNullable().primary();
        tbl.integer("sc_group");
        tbl.integer("sc_type");
        tbl.text("sc_name");
        tbl.text("sc_frenchname");
        tbl.integer("statecode");
    })
    .createTable("css_sc_skatingadjustmentassociation", tbl => {
        tbl.text("sc_skatingadjustmentassociationid").unique().notNullable().primary();
        tbl.text("sc_segmentdefinition");
        tbl.text("sc_adjustmentdefinition");
        tbl.integer("sc_maximumapplications");
        tbl.text("sc_name");
        tbl.real("sc_pointvalue");
        tbl.text("sc_segmentdefinitionname");
        tbl.text("sc_adjustmentdefinitionname");
        tbl.integer("sc_order");
    })
    .createTable("css_sc_programs", tbl => {
        tbl.text("sc_programsid").unique().notNullable().primary();
        tbl.text("sc_program_key");
        tbl.text("sc_programname");
        tbl.text("sc_description_fr");
        tbl.text("sc_description");
        tbl.text("sc_programname_fr");
    })
    .createTable("css_sc_skatingelementdefinition", tbl => {
        tbl.text("sc_skatingelementdefinitionid").unique().notNullable().primary();
        tbl.integer("sc_starratingtype");
        tbl.integer("sc_flying");
        tbl.integer("sc_change");
        tbl.integer("sc_valueadjustmentv");
        tbl.integer("sc_throw");
        tbl.text("sc_family");
        tbl.text("sc_longname");
        tbl.text("sc_longnamefrench");
        tbl.real("sc_goevalueminus5");
        tbl.real("sc_goevalueminus4");
        tbl.real("sc_goevalueminus3");
        tbl.real("sc_goevalueminus2");
        tbl.real("sc_goevalueminus1");
        tbl.real("sc_basevalue");
        tbl.real("sc_goevalue1");
        tbl.real("sc_goevalue2");
        tbl.real("sc_goevalue3");
        tbl.real("sc_goevalue4");
        tbl.real("sc_goevalue5");
        tbl.text("sc_takeoffflag");
        tbl.text("sc_familyname");
        tbl.text("sc_patterndancecode");
        tbl.text("sc_elementcodecalculated");
        tbl.text("sc_abbreviatedname");
        tbl.text("sc_synchrocombination");
        tbl.text("sc_level");
        tbl.text("sc_abbreviatednamefrench");
        tbl.text("sc_rotationflag");
        tbl.text("sc_elementcode");
        tbl.integer("statecode");
    })
    .createTable("css_sc_skatingelementnote", tbl => {
        tbl.text("sc_skatingelementnoteid").unique().notNullable().primary();
        tbl.text("sc_name");
        tbl.text("sc_namefr");
        tbl.text("sc_value");
        tbl.text("sc_enteredby");
        tbl.integer("sc_showonjudgescreens");
        tbl.text("sc_usertype");
    })
	.createTable("css_sc_skatingelementnote_sc_skatingdiscipl", tbl => {
        tbl.text("sc_skatingelementnote_sc_skatingdisciplid").unique().notNullable().primary();
        tbl.text("sc_skatingelementnoteid");
        tbl.text("sc_skatingdisciplinedefinitionid");
    })
    .createTable("css_sc_skatingcategoryqualificationlevel", tbl => {
        tbl.text("sc_skatingcategoryqualificationlevelid").unique().notNullable().primary();
        tbl.text("sc_namefr");
        tbl.text("sc_name");
    })
    .createTable("css_sc_skatingcategoryqualificationlevel_sc", tbl => {
        tbl.text("sc_skatingcategoryqualificationlevel_scid").unique().notNullable().primary();
        tbl.text("sc_skatingeventclassid");
        tbl.text("sc_skatingcategoryqualificationlevelid");
    })
    .createTable("css_sc_skatingprogramvalidation", tbl => {
        tbl.text("sc_skatingprogramvalidationid").unique().notNullable().primary();
        tbl.integer("sc_ruletype");
        tbl.text("sc_bonustoaward");
        tbl.text("sc_bonustoaward_entitytype");
        tbl.text("sc_skatingsegmentdefinitions");
        tbl.text("sc_skatingsegmentdefinitions_entitytype");
        tbl.text("sc_elementtocheck");
        tbl.text("sc_elementtocheck_entitytype");
        tbl.text("sc_frenchname");
        tbl.text("sc_elementleveltoevaluate");
        tbl.text("sc_elementtocheckname");
        tbl.text("sc_bonustoawardname");
        tbl.text("sc_name");
        tbl.integer("sc_minimumfamilies");
        tbl.integer("sc_bonusquantity");
        tbl.text("sc_skatingsegmentdefinitionsname");
        tbl.integer("sc_choicec");
        tbl.integer("sc_choicea");
        tbl.integer("sc_choiceb");
        tbl.integer("sc_truefalsea");
        tbl.text("sc_adjustmentassociationa");
        tbl.text("sc_adjustmentassociationa_entitytype");
        tbl.text("sc_elementnotea");
        tbl.text("sc_elementnotea_entitytype");
        tbl.text("sc_elementfamilyb");
        tbl.text("sc_elementfamilyb_entitytype");
        tbl.text("sc_elementfamilya");
        tbl.text("sc_elementfamilya_entitytype");
        tbl.text("sc_elementfamilytypeb");
        tbl.text("sc_elementfamilytypeb_entitytype");
        tbl.text("sc_elementfamilytypea");
        tbl.text("sc_elementfamilytypea_entitytype");
        tbl.text("sc_elementnoteaname");
        tbl.text("sc_elementfamilyaname");
        tbl.integer("sc_integera");
        tbl.integer("sc_integerb");
        tbl.integer("sc_integerc");
        tbl.integer("sc_integerd");
        tbl.text("sc_adjustmentassociationaname");
        tbl.integer("sc_order");
        tbl.text("sc_elementfamilytypeaname");
        tbl.text("sc_elementfamilybname");
        tbl.integer("sc_integere");
        tbl.text("sc_elementfamilytypebname");
        tbl.integer("statecode");
        tbl.integer("sc_integerf");
    })
    .createTable("css_sc_wbp_elementdefinitionsa", tbl => {
        tbl.text("sc_wbp_elementdefinitionsaid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_wbp_elementdefinitionsb", tbl => {
        tbl.text("sc_wbp_elementdefinitionsbid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_wbp_elementdefinitionsc", tbl => {
        tbl.text("sc_wbp_elementdefinitionscid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_wbp_elementdefinitionsd", tbl => {
        tbl.text("sc_wbp_elementdefinitionsdid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementdefinitionid");
    })
    .createTable("css_sc_wbp_skatingelementfamiliesa", tbl => {
        tbl.text("sc_wbp_skatingelementfamiliesaid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementfamilyid");
    })
    .createTable("css_sc_wbp_skatingelementfamiliesb", tbl => {
        tbl.text("sc_wbp_skatingelementfamiliesbid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementfamilyid");
    })
    .createTable("tbl_transform_job_request", tbl => {
        tbl.text("requestid").unique().notNullable().primary();
        tbl.text("competitorentryid");
        tbl.text("state");
        tbl.text("assets");
        tbl.text("createdon");
        tbl.text("modifiedon");
    })
    .createTable("css_sc_wbp_skatingelementfamilytypesa", tbl => {
        tbl.text("sc_wbp_skatingelementfamilytypesaid").unique().notNullable().primary();
        tbl.text("sc_skatingprogramvalidationid");
        tbl.text("sc_skatingelementfamilytypeid");
    });
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists("tbl_segments")
    .dropTableIfExists("tbl_categories")
    .dropTableIfExists("tbl_events")
    .dropTableIfExists("css_sc_officials")
    .dropTableIfExists("css_sc_skatingofficialrole")
    .dropTableIfExists("css_sc_competitors")
    .dropTableIfExists("css_sc_dataspecialists")
    .dropTableIfExists("css_sc_skatingstandardscriteria")
    .dropTableIfExists("css_sc_skatingsegmentdefinitions")
    .dropTableIfExists("css_sc_skatingprogramcomponenttype")
    .dropTableIfExists("css_sc_skatingprogramcomponentdefinition")
    .dropTableIfExists("css_sc_skatingpatterndancedefinition")
    .dropTableIfExists("css_sc_skatingeventclass")
    .dropTableIfExists("css_sc_skatingelementfamilytype")
    .dropTableIfExists("css_sc_skatingelementfamily")
    .dropTableIfExists("css_sc_skatingelementdefinition_sc_skatingd")
    .dropTableIfExists("css_sc_skatingelementconfiguration_sc_skati")
    .dropTableIfExists("css_sc_skatingelementconfiguration")
    .dropTableIfExists("css_sc_skatingelementnote")
    .dropTableIfExists("css_sc_skatingelementnote_sc_skatingdiscipl")
    .dropTableIfExists("css_sc_skatingdisciplinedefinition")
    .dropTableIfExists("css_sc_skatingcategorylabeldefinition")
    .dropTableIfExists("css_sc_skatingcategorydefinition_sc_skating")
    .dropTableIfExists("css_sc_skatingcategorydefinition")
    .dropTableIfExists("css_sc_skatingadjustmentdefinition")
    .dropTableIfExists("css_sc_skatingadjustmentassociation")
    .dropTableIfExists("css_sc_programs")
    .dropTableIfExists("css_sc_skatingelementdefinition")
    .dropTableIfExists("css_sc_skatingcategoryqualificationlevel")
    .dropTableIfExists("css_sc_skatingcategoryqualificationlevel_sc")
    .dropTableIfExists("tbl_competitorentry")
    .dropTableIfExists("tbl_skate_element")
    .dropTableIfExists("tbl_goe")
    .dropTableIfExists("tbl_dspermissions")
    .dropTableIfExists("tbl_version")
    .dropTableIfExists("tbl_officialassignment")
    .dropTableIfExists("tbl_programcomponent")
    .dropTableIfExists("css_sc_skatingprogramvalidation")
    .dropTableIfExists("css_sc_wbp_elementdefinitionsa")
    .dropTableIfExists("css_sc_wbp_elementdefinitionsb")
    .dropTableIfExists("css_sc_wbp_elementdefinitionsc")
    .dropTableIfExists("css_sc_wbp_skatingelementfamiliesa")
    .dropTableIfExists("css_sc_wbp_skatingelementfamilytypesa");
};
