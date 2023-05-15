export class Wbp_rules {


    // variable for string old and new array
    
    comparision_array:any=[];
    
    validation_rules(initializationObj: any,input_data:any,dataSource:any) {
    
        var bonuses_increment:any = [];
        var protection_index :any= []
        var errors:any = [];
    
        this.protection_flag_insert(input_data);
    
        this.master_element_code(input_data,"","","");
        
        
        console.log("initializationObj coming in file",initializationObj);
        
        console.log("input data",input_data);
         
        console.log("dataSource",JSON.parse(JSON.stringify(dataSource)));
    
        //console.log("bonuses",JSON.parse(JSON.stringify(bonuses)));
    
        console.log("validation rules",initializationObj["segmentid"]["definitionid"]["well_balanced"])
        
    
        // making array same like input data but with defination id
    
        var elements_def: any = [];
    
        for(let a=0;a<input_data.length;a++)
        {
    
            var type = "default";
            var elements:any = [];
    
            // logic for finding type of master element
    
            var check = true;
            var seq = false;
            
            for(let b=0;b<input_data[a]["elements"].length;b++)
            {
                
                var code = this.element_defination(input_data[a]["elements"][b]);
               
            
                // Making Defination array
                var element_availability = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_elementcode == code);
    
                if (element_availability.length >= 1) {
                    
                    elements.push(element_availability[0].sc_skatingelementdefinitionid.sc_skatingelementdefinitionid);
                    
                }
                else
                {
                    elements.push("");
                }
            }
    
    
            elements_def.push({"type":input_data[a]["type"],"elements":elements});
            
        }
    
        console.log("Element definations",JSON.parse(JSON.stringify(elements_def)));
    
        // Finding type of master elements
    
        for(let x=0;x<elements_def.length;x++)
        {
            var check = true;
            var seq = false;
    
            for(let y=0;y<elements_def[x]["elements"].length;y++)
            {
                var element_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[x]["elements"][y]);
    
                if(element_data.length>=1)
                {
                    if (element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "A" || element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "1A" || element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "2A" || element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "3A" || element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "4A" || element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "W" || element_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] == "1W") 
                    {
                        
                        if (y >= 1 && check == true) {
    
                            check = false;
    
                            var first_element = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[x]["elements"][y-1]);
    
                        
                            if (first_element.length >= 1) {
                                if (first_element[0].sc_skatingelementdefinitionid.famtype_sc_skatingelementfamilytypeid == "7BFAB449-4C8B-EB11-A812-000D3A8DCA86") {
    
                                    elements_def[x]["type"] = "SEQ";
                                        seq = true;
                  
                                  }
                            }
    
                        }          
                    }
                   
                }
                
            }
    
            if (seq == false) {
                var family_type_info = [];
      
    
                for(let z=0;z<elements_def[x]["elements"].length;z++)
                {
                    var element_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[x]["elements"][z]);
    
                    if(element_data.length>=1)
                    {
                        family_type_info.push(element_data[0].sc_skatingelementdefinitionid.famtype_sc_skatingelementfamilytypeid);
                    }
                }
    
            
      
                var combo_check = true;
      
                if (family_type_info.length >= 2) {
                  for (let j = 0; j < family_type_info.length; j++) {
                    if (family_type_info[j] != "7BFAB449-4C8B-EB11-A812-000D3A8DCA86") {
                      combo_check = false;
                      break;
                    }
      
                  }
                }
                else {
                  combo_check = false;
                }
      
                if (combo_check == true) {
                 
                  elements_def[x]["type"] = "COMBO";
                }
      
              }
        }
    
        console.log("Element definations after seq and combo -",elements_def);
    
        // all rules array based on order
        for(let i=0; i<initializationObj["segmentid"]["definitionid"]["well_balanced"].length;i++)
        {
            switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"]) {
                
                // 01 - Maximum of [Integer A] master elements with at least one [Element Family Type A] sub-element.
                case 947960000: 
                    //console.log('947960000',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"]);
                    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960000," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    
                    var error_in_rule:any = false;
    
                 
                    // Error reporting 
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        //errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"error":"sc_integera value is null"})
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
                    
                    //console.log("error in rule",error_in_rule);
    
                    if(error_in_rule == false)
                    {
                        var count:any = 0;
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            
                           var family_type_a_avialable = false;
        
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                            
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) {
                                    
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false &&  input_data[c]["elements"][d]["Throw"] == false)
                                        {
                                            family_type_a_avialable = true;
                                        }
                                    }
        
                                }
        
                            }
        
                            if(family_type_a_avialable == true)
                            {
                                count++;
        
                                if(count >initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                {
                                    
                                    for(let e=0;e<input_data[c]["elements"].length;e++)
                                    {    
                                       if(input_data[c]["elements"][e]["protection"] == false)
                                       {
                                            input_data[c]["elements"][e]["invalid"] = true;
                                       }
                                        
                                    }
        
                                }
                            }
        
                            
                         
        
                        } 
        
                    }
                    
                    this.master_element_code(input_data,947960000,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   // console.log("element count containging with this rule",count,input_data);
                 
                   
    
                    break;
                
                // 02 - Maximum of [Integer A] sub-elements from [Element Family Type(s) A]
                case 947960001: 
                    
                    
                    //console.log('947960001',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamilytypesa"].length);
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960001," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                  
                    var error_in_rule:any = false;
    
                    // Error reporting 
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamilytypesa"].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamilytypesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamilytypesa' table.")
                        error_in_rule = true;
                    }
    
    
                    if(error_in_rule == false)
                    {
    
                        var possible_family_types:any = [];
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamilytypesa"].length;a++)
                        {
                            possible_family_types.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamilytypesa"][a]["sc_skatingelementfamilytypeid"])
        
                        }
        
                        //console.log("family types array", possible_family_types);
        
                        var count:any = 0;
        
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) {
                                    
        
                                    if(possible_family_types.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"]) == true)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false )
                                        {
                                            
                                            count++;
                                            if(count >initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                            {
                                                if(input_data[c]["elements"][d]["protection"] == false)
                                                {
                                                    //console.log("rules applied");
        
                                                    input_data[c]["elements"][d]["invalid"] = true;
                                                }                                         
                                            }
                                        }
        
                                       
        
                                    }
        
                                }
        
                            }
                        }
    
                    }
    
                    this.master_element_code(input_data,947960001,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
    
                  
    
                    break;
                
                // 02a - Maximum of [Integer A] sub-elements from [Element Famil(ies) A].
                case 947960002: 
                    //console.log('947960002');
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960002," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamiliesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamiliesa' table.")
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
                        var possible_families:any = [];
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
        
                        }
        
                        //console.log("families array", possible_families);
        
        
                        var count:any = 0;
        
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) {
                                    
                                    
                                    if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false )
                                        {
                                            
                                            count++;
                                            if(count >initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                            {
                                                if(input_data[c]["elements"][d]["protection"] == false)
                                                {
                                                    //console.log("rules applied");
        
                                                    input_data[c]["elements"][d]["invalid"] = true;
                                                }                                         
                                            }
                                        }
        
                                       
        
                                    }
        
                                }
        
                            }
                        }
        
                    }
                    
                    
                   
                    
    
                    this.master_element_code(input_data,947960002,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
    
                // 04 - Minimum of [Integer A] sub-elements from [Element Famil(ies) A] (combined), with elements invalidated chosen [Element Family Type A].
                case 947960004: 
                    //console.log('947960004');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960004," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    var error_in_rule:any = false;
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamiliesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamiliesa' table.")
                        error_in_rule = true;
                        
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var possible_families:any = [];
                        var count:any = 0;
                        var invalidation_applied = false;
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
    
                        }
    
                        console.log("possible_families list",possible_families);
    
                        
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true && input_data[c]["elements"][d]["invalid"] == false)
                                    {
                                        
                                        count = count+1;
                                          
                                    }
    
                                }
                            }
                        }
    
                
    
                        if(count< initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] )
                        {
                            invalidation_applied = true;
    
                        }
                        
                        console.log("count",count,invalidation_applied);
                       
    
                        if(invalidation_applied == true)
                        {
                            
                            var invalidation_total = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - count;
                            //console.log("count",count,invalidation_applied,invalidation_total);
    
                            for(let c=input_data.length-1;c>=0;c--)
                            {
                                
                                var master_invalid_eligibility = false;
    
                                for(let d=input_data[c]["elements"].length-1;d>=0;d--)
                                {
                                    
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                    if (element_def_data.length >= 1) 
                                    {
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                        {
                                            master_invalid_eligibility = true;
                                        }
                                    }
                                }
    
                                //console.log("master element eligible",master_invalid_eligibility,c);
    
                                
                                if(master_invalid_eligibility == true)
                                {
                                    
                                    var invalidated = false;

                                    for(let d=input_data[c]["elements"].length-1;d>=0;d--)
                                    {
                                        if(input_data[c]["elements"][d]["protection"] == false && invalidation_total>0 && input_data[c]["elements"][d]["invalid"] == false)
                                        {

                                            input_data[c]["elements"][d]["invalid"] = true;
                                            invalidated = true;
                                            
                                            
                                        }
                                    }

                                    if(invalidated == true)
                                    {
                                        invalidation_total = invalidation_total - 1;
                                    }
                                   
                                }

                                //console.log("invalidation remaining",invalidation_total)
                            }
                        }
    
                    }
                    
                    this.master_element_code(input_data,947960004,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
                    break;
    
                // 05 - Maximum of [Integer A] sub-elements from [Element Family A] within master elements that have at least [Integer B] sub-elements.
                case 947960005: 
                    //console.log('947960005');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960005," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilya value is null"})
                        console.log("Error : sc_elementfamilya value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var eligible_master_element:any = [];
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            if(input_data[c]["elements"].length >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] )
                            {
                                eligible_master_element.push(c);
                            }
                        }
    
                        //console.log("eligible_master_element index",eligible_master_element);
    
                        var count:any = 0;
    
                        for(let d=0;d<input_data.length;d++)
                        {
                            
                            if(eligible_master_element.includes(d) == true)
                            {
                                for(let e=0;e<input_data[d]["elements"].length;e++)
                                {
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[d]["elements"][e]);
    
                                    if (element_def_data.length >= 1) 
                                    {
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] && input_data[d]["elements"][e]["invalid"] == false)
                                        {
                                            count++;
    
                                            if(count >initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                            {
                                                if(input_data[d]["elements"][e]["protection"] == false )
                                                {
                                                    input_data[d]["elements"][e]["invalid"] = true;
                                                }
                                            }
                                        }
                                    }
    
                                }
                            }
                        }
                        
                    }
    
                    
                    this.master_element_code(input_data,947960005,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
                    break;
    
                
                // 06 - Minimum of [Integer A] sub-elements from [Element Family Type A] at minimum of [Integer B] level, with [Integer C] number of different families, with a maximum invalidation level of [Integer D].
                case 947960006: 
                  
                    //console.log('947960006',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"]);
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960006," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerc value is null"})
                        console.log("Error : sc_integerc value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerd value is null"})
                        console.log("Error : sc_integerd value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_truefalsea value is null"})
                        console.log("Error : sc_truefalsea value is null");
                        error_in_rule = true;
                    }


                    if(error_in_rule == false)
                    {
    
                        var invalidation_applied = false;
    
                        var count:any = 0;
                        var covered_families:any = [];
                        var invalid_count:any = 0;
                
    
    
                        var family_count:any = [];
                        // new code
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                        {
    
                                            var family_data = family_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] );
                                            if(family_data.length>=1)
                                            {
                                                //console.log("increase count")
                                                for(let z=0;z<family_count.length;z++)
                                                {
                                                    if(family_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] )
                                                    {
                                                        //console.log("increase count updated")
                                                        family_count[z]["count"] = family_count[z]["count"] +1;
                                                        
                                                    }
                                                }   
                                            }
                                            else
                                            {
                                                //console.log("pushed value")
                                                family_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"count":1,"name":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_name"]});
                                                
                                            }
    
                                        }
    
    
                                    }
    
                                }
    
                            }
                        }
    
    
                        console.log("###################",family_count);
    
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] == 0 )
                        {
                            console.log("false");
 
                            
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"]  == 1)
                        {
                            console.log("true");

                            const axelExists = family_count.findIndex((element:any) => element.family === "1D4648BF-9B90-EB11-B1AC-000D3A1BBD52");
                            const waltzExists = family_count.findIndex((element:any) => element.family === "114648BF-9B90-EB11-B1AC-000D3A1BBD52");
                            

                            if (axelExists != -1 && waltzExists != -1) {
                                console.log("Axel and waltz exists",axelExists,waltzExists);

                                var tem =  family_count[waltzExists]["count"];

                                family_count[axelExists]["count"] = family_count[axelExists]["count"] + tem;

                                family_count.splice(waltzExists, 1);


                            } else {
                                console.log("Axel and waltz does not exist");
                            }


                            console.log("new family count",family_count);

                        }

                        var eligible_elements_count:any = 0;
    
                        for(let z=0;z<family_count.length;z++)
                        {
                            eligible_elements_count = family_count[z]["count"] +eligible_elements_count;     
                        }   
    
                        // Case 1: Min A elements at min int b
                        // Case 2: int c different families
    
                        // Case 1 true and Case 2 false
    
                        if(eligible_elements_count >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] && family_count.length < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                        {
                            invalidation_applied = true;
                            invalid_count = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] - family_count.length;
    
                            //console.log("Case 1 true and Case 2 false", initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] - family_count.length)
                        }
    
                        // Case 1 false and case 2 true
    
                        if(eligible_elements_count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] && family_count.length >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                        {
                            invalidation_applied = true;
                            invalid_count = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - eligible_elements_count;
    
                            //console.log("Case 1 false and Case 2 true",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - eligible_elements_count)
                        }
    
                        // Case 1 false and Case 2 false
                        if(eligible_elements_count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] && family_count.length < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                        {
                            invalidation_applied = true;
                            invalid_count = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] - family_count.length;
    
                            //console.log("Case 1 false and Case 2 false",);
                        }
    
    
                        //console.log("###################",eligible_elements_count);
                        //console.log("###################",family_count.length);
    
    
                        // // old code 
    
                        // for(let c=0;c<input_data.length;c++)
                        // {
                        //     for(let d=0;d<input_data[c]["elements"].length;d++)
                        //     {
                        //         var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                        //         if (element_def_data.length >= 1) 
                        //         {
                        //             if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                        //             {
                        //                 if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                        //                 {
                        //                     count++;
                                            
                        //                     if(covered_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == false)
                        //                     {
                        //                         covered_families.push(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]);
                        //                     }
                                            
                        //                 }
                        //             }
    
                        //         }
                        //     }
                        // }
    
                        
    
                        // if(count< initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] || covered_families.length < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                        // {
                        //     invalidation_applied = true;
                        //     invalid_count = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - count;
    
                        // }
    
                        //console.log("middle",count,invalidation_applied, covered_families,invalid_count);
    
                        if(invalidation_applied == true)
                        {
                            for(let c=input_data.length-1;c>=0;c--)
                            {
                                for(let d=input_data[c]["elements"].length-1;d>=0;d--)
                                {
                                    
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                    if (element_def_data.length >= 1) 
                                    {
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                        {
                                            if(input_data[c]["elements"][d]["protection"] == false && invalid_count>0 && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] <= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"])
                                            {
                                                input_data[c]["elements"][d]["invalid"] = true;
                                                invalid_count--;
    
                                            }
                                        }
                                    }
    
                                }
                            }              
                        }
    
    
                        
                    }
    
                                   
                   
                    this.master_element_code(input_data,947960006,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
                // 07 - Maximum of [Integer A] sub-elements from same element family [T/F A "and level"] [opt Integer B particular level] within [Element Family Type A] starting with the [Integer C] repeated family.
                case 947960007: 
                    //console.log('947960007');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960007," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    //console.log('abc',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"]);
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerc value is null"})
                        console.log("Error : sc_integerc value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_truefalsea value is null"})
                        console.log("Error : sc_truefalsea value is null");
                        error_in_rule = true;
                    }
                    
                    if(error_in_rule == false)
                    {
                        switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"]) {
                
                            
                            // 01 - Maximum of [Integer A] master elements with at least one [Element Family Type A] sub-element.
                            case 0:
        
                                //console.log("case 0 = false");
        
                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                                {
                                    console.log("case = 0, int b is null")

                                    var family_count:any = [];
                                    var repeat_family_order:any = [];
                                    //var invalid_index:any = [];
            
                                    for(let c=0;c<input_data.length;c++)
                                    {
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            var invalid:any = false;
                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
            
                                            if (element_def_data.length >= 1) {
            
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false)
                                                {
                                                    var family_data = family_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                    if(family_data.length>=1)
                                                    {
                                                        //console.log("increase count")
                                                        for(let z=0;z<family_count.length;z++)
                                                        {
                                                            if(family_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_count[z]["fly"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && family_count[z]["change"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"])
                                                            {
                                                                //console.log("increase count updated")
                                                                family_count[z]["count"] = family_count[z]["count"] +1;
                                                                if(family_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                                {
                                                                    //console.log("index of before ",c,d,repeat_family_order.indexOf(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]))
                                                                    
                                                                    var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                                    if(tem_data.length<1)
                                                                    {
                                                                        repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
                                                                    }
        
                                                                    let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                    
                                                                    if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                                    {
                                                                        invalid = true;
                                                                    }
        
                                                                
                                                                    
                                                                }
                                                            }
                                                        }   
                                                    }
                                                    else
                                                    {
                                                        //console.log("pushed value")
                                                        family_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"count":1,"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
                                                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                        {
        
                                                            var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                            if(tem_data.length<1)
                                                            {
                                                                repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
                                                            }
        
                                                            let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
            
                                                            if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                            {
                                                                invalid = true;
                                                            }
            
                                                        }
                                                    }
            
                                                    if(invalid == true)
                                                    {
                                                        //console.log("invalid happen");
                                                        //invalid_index.push([c,d]);
                                                        if(input_data[c]["elements"][d]["protection"] == false)
                                                        {
                                                            input_data[c]["elements"][d]["invalid"] = true;
                                                        }       
                                                    }
            
                                                }
                                            }
                                        }
                                    }
            
                                    console.log("at end of case 0",family_count)
                                    console.log("repeat family order",repeat_family_order);
            
                                    
                                }
                                else
                                {
                                    console.log("case 0 and int b is on");

                                    var family_count:any = [];
                                    var repeat_family_order:any = [];
                                    //var invalid_index:any = [];
            
                                    for(let c=0;c<input_data.length;c++)
                                    {
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            var invalid:any = false;
                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
            
                                            if (element_def_data.length >= 1) {
            
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                                {
                                                    var family_data = family_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"] );
                                                    if(family_data.length>=1)
                                                    {
                                                        //console.log("increase count")
                                                        for(let z=0;z<family_count.length;z++)
                                                        {
                                                            if(family_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_count[z]["fly"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && family_count[z]["change"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"])
                                                            {
                                                                //console.log("increase count updated")
                                                                family_count[z]["count"] = family_count[z]["count"] +1;
                                                                if(family_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                                {
                                                                    //console.log("index of before ",c,d,repeat_family_order.indexOf(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]))
                                                                    
                                                                    var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                                    if(tem_data.length<1)
                                                                    {
                                                                        repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
                                                                    }
        
                                                                    let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                    
                                                                    if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                                    {
                                                                        invalid = true;
                                                                    }
        
                                                                
                                                                    
                                                                }
                                                            }
                                                        }   
                                                    }
                                                    else
                                                    {
                                                        //console.log("pushed value")
                                                        family_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"count":1,"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
                                                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                        {
        
                                                            var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                            if(tem_data.length<1)
                                                            {
                                                                repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
                                                            }
        
                                                            let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
            
                                                            if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                            {
                                                                invalid = true;
                                                            }
            
                                                        }
                                                    }
            
                                                    if(invalid == true)
                                                    {
                                                        //console.log("invalid happen");
                                                        //invalid_index.push([c,d]);
                                                        if(input_data[c]["elements"][d]["protection"] == false)
                                                        {
                                                            input_data[c]["elements"][d]["invalid"] = true;
                                                        }       
                                                    }
            
                                                }
                                            }
                                        }
                                    }
            
                                    console.log("at end of case 0",family_count)
                                    console.log("repeat family order",repeat_family_order);
            
                                    

                                }

                                
                                break;
                            
                            case 1:
                                
                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                                {
                                    console.log("case 1 = true and B is null");
        
                                    var family_count:any = [];
                                    var repeat_family_order:any = [];
                                   
        
                                    for(let c=0;c<input_data.length;c++)
                                    {
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            var invalid:any = false;
                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                            if (element_def_data.length >= 1) {
        
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false)
                                                {
                                                    var family_data = family_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                    if(family_data.length>=1)
                                                    {
                                                        
                                                        for(let z=0;z<family_count.length;z++)
                                                        {
                                                            if(family_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_count[z]["level"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && family_count[z]["fly"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && family_count[z]["change"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"])
                                                            {
                                                                
                                                                family_count[z]["count"] = family_count[z]["count"] +1;
    
                                                                if(family_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                                {
                                                                    var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                            
                                                                    if(tem_data.length<1)
                                                                    {
                                                                        repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]});
                                                                    }
    
                                                                    let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
    
                                                                    if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                                    {
                                                                        invalid = true;
                                                                    }
    
                                                                }
    
                                                              
                                                            }
                                                        }   
                                                    }
                                                    else
                                                    {
                                                       
                                                        family_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1,"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
         
                                                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                        {
                                                            var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                            
                                                            if(tem_data.length<1)
                                                            {
                                                                repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]});
                                                            }
    
                                                            let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
    
                                                            if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                            {
                                                                invalid = true;
                                                            }
                                                        }
    
                                                       
                                                    }
        
                                                    if(invalid == true)
                                                    {
                                                       
                                                        if(input_data[c]["elements"][d]["protection"] == false)
                                                        {
                                                            input_data[c]["elements"][d]["invalid"] = true;
                                                        }       
                                                    }
        
                                                }
                                            }
                                        }
                                    }
        
                                    console.log("at end of case 1",family_count)
                                    console.log("repeat family order",repeat_family_order);
                                    
                                }
        
                                else 
                                {
                                    console.log("case 1 = true and B is not null");
        
                                    var family_count:any = [];
                                    var repeat_family_order:any = [];
                                   
        
                                    for(let c=0;c<input_data.length;c++)
                                    {
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            var invalid:any = false;
                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                            if (element_def_data.length >= 1) {
        
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                                {
    
                                                    var family_data = family_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                                    if(family_data.length>=1)
                                                    {
                                                        
                                                        for(let z=0;z<family_count.length;z++)
                                                        {
                                                            if(family_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_count[z]["level"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && family_count[z]["fly"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && family_count[z]["change"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"] )
                                                            {
                                                                
                                                                family_count[z]["count"] = family_count[z]["count"] +1;
                                                                
                                                                if(family_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                                {
                                                                    var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                
                                                                    if(tem_data.length<1)
                                                                    {
                                                                        repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]});
                                                                    }
            
                                                                    let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
            
                                                                    if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                                    {
                                                                        invalid = true;
                                                                    }
                                                                }
        
                                                                
                                                            }
                                                        }   
                                                    }
                                                    else
                                                    {
                                                       
                                                        family_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1,"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]});
    
                                                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                        {
                                                            var tem_data = repeat_family_order.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"]);
                                
                                                            if(tem_data.length<1)
                                                            {
                                                                repeat_family_order.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"fly":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"],"change":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]});
                                                            }
    
                                                            let index = repeat_family_order.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] &&  record.fly == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_flying"] && record.change == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_change"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
    
                                                            if(index +1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                                                            {
                                                                invalid = true;
                                                            }
                                                        }
    
                                                        
                                                    }
        
                                                    if(invalid == true)
                                                    {
                                                       
                                                        if(input_data[c]["elements"][d]["protection"] == false)
                                                        {
                                                            input_data[c]["elements"][d]["invalid"] = true;
                                                        }       
                                                    }
        
                                                }
                                            }
                                        }
                                    }
        
                                    console.log("at end of case 1",family_count)
                                    console.log("repeat family order",repeat_family_order);
                                    
                                }
        
                                break;
                            
                            default:
                                console.log('you shouldn\'t see this');
                                break;
                        }
    
                          
                    }
    
                    
    
                    this.master_element_code(input_data,947960007,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
                // 07a - Maximum of [Integer A] sub-elements from same element family and level (exception of Lz and F considered the same family within the context of this rule) within the Throw variants of [Element Family Type A].
                case 947960008: 
                    //console.log('947960008');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960008," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    var error_in_rule:any = false;
    
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
                    
                    if(error_in_rule == false)
                    {
                        var family_level_count:any = [];
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                var invalid:any = false;
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false)
                                    {
    
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == 'DDFBE3D9-4830-ED11-9DB1-0022482D319B' || element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == 'D9477DC1-4830-ED11-9DB1-0022482D319B' )
                                        {
                                            let lz_f_index = family_level_count.findIndex((record:any) => (record.family ==  'DDFBE3D9-4830-ED11-9DB1-0022482D319B' || record.family == 'D9477DC1-4830-ED11-9DB1-0022482D319B') && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
                                            
                                            //console.log("lz index",lz_f_index)
                                            
                                            if(lz_f_index != -1)
                                            {
                                                family_level_count[lz_f_index]["count"] = family_level_count[lz_f_index]["count"] +1;
                                                if(family_level_count[lz_f_index]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                {
                                                    
                                                    invalid = true;
                                                }
                                            }
                                            else
                                            {
                                                family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                
                                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                {
                                                    
                                                    invalid = true;
                                                }
                                            }
                                        }
                                        else
                                        {
                                            let index = family_level_count.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
                
                                            
                                            if(index != -1)
                                            {
                                               
                                                family_level_count[index]["count"] = family_level_count[index]["count"] +1; 
    
                                                if(family_level_count[index]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                {
                                                    
                                                    invalid = true;
                                                }
                                            }
                                            else
                                            {
                                                family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                {
                                                   
                                                    invalid = true;
                                                }
                                            }
                                        }
    
                                        if(invalid == true)
                                        {
                                            
                                            if(input_data[c]["elements"][d]["protection"] == false)
                                            {
                                                input_data[c]["elements"][d]["invalid"] = true;
                                            }       
                                        }
                                        
                                    }
                                }
    
                            }
                        }
    
                        console.log("family count",family_level_count);
                    }
    
                    this.master_element_code(input_data,947960008,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
                // 08 - Maximum of [Integer A] master elements with [Integer B] or more sub-elements.
                case 947960009: 
                    //console.log('947960009');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960009," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    console.log("protection applied index",protection_index);

                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var allowed_master_element_count:any = 0;
                    
                        for(let z = 0;z<protection_index.length;z++)
                        {
                            console.log("inside z loop",z)
                            allowed_master_element_count++;
                        }
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            
                            //var rep_jump_applied: any = false;
                            if(input_data[c]["elements"].length >=  initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                            {
                                if(protection_index.includes(c+1) == false)
                                {
                                    allowed_master_element_count++;
                                    //console.log("allowed_master_element_count",allowed_master_element_count)
        
                                    if(allowed_master_element_count > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                    {
                                        console.log("limit is crosserd",c+1)
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            if(d+1 >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                            {
                                                if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["protection"] == false)
                                                {
        
                                                    input_data[c]["elements"][d]["invalid"] = true;   
                                                    // input_data[c]["rep_jump"] = true;
                                                    
                                                    // rep_jump_applied = true;
        
        
                                                }
                                            }
                                        }        
                                    }
                                }

                                
                            }
                            
                            // if(rep_jump_applied ==  true)
                            // {
                            //     console.log("---> Rep Jump applied on index:",c+1);
                            // }
                            
                        }    
                        
                        //console.log("allowed_master_element_count",allowed_master_element_count)
                        
                        
                    }
    
                   
    
                    this.master_element_code(input_data,947960009,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
                    break;
    
                // 09 - Maximum of [Integer A] sequences permitted.
                case 947960010: 
                    //console.log('947960010');
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960010," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_choicea value is null"})
                        console.log("Error : sc_choicea value is null");
                        error_in_rule = true;
                    }  

                    if(error_in_rule == false)
                    {
                      
                        var count:any = 0;
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            var rep_jump_applied: any = false;

                            if(elements_def[c]["type"] == "SEQ")
                            {
                                count++;
        
                                if(count >initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                {
                                   
                                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == 947960000)
                                    {
                                        console.log("choice is A");

                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
            
                                            if(d>0)
                                            {
                                                if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["protection"] == false)
                                                {
        
                                                    input_data[c]["rep_jump"] = true;
                                                
                                                    rep_jump_applied = true;

                                                    input_data[c]["elements"][d]["invalid"] = true;   
                                                }
                                            }
                                            
                                        }

                                    } 
                                    else
                                    {
                                        console.log("choice is B"); 

                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
            
                                            if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["protection"] == false)
                                            {
    
                                            
                                                input_data[c]["elements"][d]["invalid"] = true;   
                                            }
                                            
                                            
                                        }

                                    }
                                    
                                }
                            }

                            if(rep_jump_applied ==  true)
                            {
                                console.log("---> Rep Jump applied on index:",c+1);
                            }

        
                           
                        }
        
                    }
    
                       
    
                    this.master_element_code(input_data,947960010,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
    
                // 10  Maximum of [Integer A] sub-elements at [Integer B] level or higher within each of [Element Famili(ies) A].
                case 947960011: 
                    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960011," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    //console.log('947960011',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"]);
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamiliesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamiliesa' table.")
                        error_in_rule = true;
                    }
    
    
                    if(error_in_rule == false)
                    {

                        var possible_families:any = [];
                        var family_count:any = [];

                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
                            family_count.push({"family":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"],"count":0});
                        }
        
                        console.log("families array", possible_families,family_count);
                        


                        //var count:any = 0;
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) {
        
                                    

                                    if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true && input_data[c]["elements"][d]["invalid"] == false)
                                    {
                                        
            
                                        
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                        {
                                            let index = family_count.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] );
                    
                                            if(index != -1)
                                            {
                                                family_count[index]["count"] = family_count[index]["count"] + 1;
                                            }

                                            //count++;
                                            if(family_count[index]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                            {
                                                if(input_data[c]["elements"][d]["protection"] == false)
                                                {
                                                    input_data[c]["elements"][d]["invalid"] = true;
                                                }
                                            
                                            }
                                            // console.log("level",element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"],element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]) 
                                        }
                                        
                                    }
        
                                   
                                }
                            }
                        }
        
                        console.log("count",family_count) 
                    }
    
                    
                    
    
                    
                    this.master_element_code(input_data,947960011,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
                    break;
    
                // 11 - Maximum level of [Integer A] and minimum level of [Integer B] for elements in combo/seq (master element has more than one sub-element) from [Element Family Type A].
                case 947960012: 
                    
                    //console.log('947960012',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"]);
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960012," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if((initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" ) && (initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" ))
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera and sc_integerb both are null"})
                        console.log("Error : sc_integera and sc_integerb both are null");
                        error_in_rule = true;
                    }
    
              
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "" ) 
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
    
                    if(error_in_rule == false)
                    {
                        for(let c=0;c<input_data.length;c++)
                        {
                            if(input_data[c]["elements"].length>1)
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
            
                                    if (element_def_data.length >= 1) {
            
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false)
                                        {
                            
                                            if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] !== "")
                                            {
                                                
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                {
                                                    if(input_data[c]["elements"][d]["protection"] == false)
                                                    {
                                                        input_data[c]["elements"][d]["invalid"] = true;
                                                    }
                                            
                                                }
        
                                                
                                            }
                                            
                                            if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] !== "")
                                            {
                                                
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                                {
                                                    if(input_data[c]["elements"][d]["protection"] == false)
                                                    {
                                                        input_data[c]["elements"][d]["invalid"] = true;
                                                    }
                                                    
                                                }
        
                                                
                                            }
        
                                            
                                        }
                                    }
                                }
                            }
        
                            
                        }
                    }
    
                    
    
    
                    
                    this.master_element_code(input_data,947960012,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
                    
                    break;
    
    
                // 12 - Maximum of [Integer A] sub-elements from same family and level at [Integer B] level and higher.
                case 947960013: 
    
                    //console.log('947960013',initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"]);
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960013," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
                    
    
                    if(error_in_rule == false)
                    {
                        //console.log(" values",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"]);             
    
                        var family_level_count:any = [];
                        //var invalid_index:any = [];
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var invalid:any = false;
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) {
    
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] && input_data[c]["elements"][d]["invalid"] == false)
                                    {
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                        {
                                            var family_data = family_level_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]);
                                            if(family_data.length>=1)
                                            {
                                                //console.log("increase count")
                                                for(let z=0;z<family_level_count.length;z++)
                                                {
                                                    if(family_level_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_level_count[z]["level"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"])
                                                    {
                                                        //console.log("increase count updated")
                                                        family_level_count[z]["count"] = family_level_count[z]["count"] +1;
                                                        if(family_level_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                        {
                                                            invalid = true;
                                                        }
                                                    }
                                                }   
                                            }
                                            else
                                            {
                                                //console.log("pushed value")
                                                family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                {
                                                    invalid = true;
                                                }
                                            }
    
                                            if(invalid == true)
                                            {
                                                //console.log("invalid happen");
                                                //invalid_index.push([c,d]);
                                                if(input_data[c]["elements"][d]["protection"] == false)
                                                {
                                                    input_data[c]["elements"][d]["invalid"] = true;
                                                }       
                                            }
                                        }
                                        
                                    }
                                }
                            }
                        }
    
                        //console.log("abcdefgh",family_level_count);
                        //console.log("abcdefgh invalid index",invalid_index);
                    }
                   
                    
                    
    
                    
    
                    this.master_element_code(input_data,947960013,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
    
                    
                    //console.log('947960013');
                    break;
    
                // 13 - Maximum of [Integer A] identical sub-elements (in master elements with only 1 sub-element) (on the basis of family and level of component sub-elements only) from [Integer B] level and higher.
                case 947960014: 
                    //console.log('947960014');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960014," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                                    
                  
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_choicea value is null"})
                        console.log("Error : sc_choicea value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamiliesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamiliesa' table.");
                        error_in_rule = true;
                        
                    }
    
    
                    if(error_in_rule == false)
                    {
    
                        var eligible_master_element:any = [];
                        var family_level_count:any = [];
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            if(input_data[c]["elements"].length == 1 )
                            {
                                eligible_master_element.push(c);
                            }
                        }
    
                        //console.log("eligible master elements",eligible_master_element);
    
                        var possible_families:any = [];
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
    
                        }
    
                        console.log("possible_families list",possible_families);
    
    
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == 947960000)
                        {
                            //console.log("choice A is A")
    
                            for(let c=0;c<input_data.length;c++)
                            {
                                var rep_jump_applied:any = false;
    
                                if(eligible_master_element.includes(c) == true)
                                {
                                    
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] && possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true )
                                            {
                                                var family_data = family_level_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]);
                                                
                                                if(family_data.length>=1)
                                                {
                                                    //console.log("increase count")
                                                    for(let z=0;z<family_level_count.length;z++)
                                                    {
                                                        if(family_level_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_level_count[z]["level"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"])
                                                        {
                                                            //console.log("increase count updated")
                                                            family_level_count[z]["count"] = family_level_count[z]["count"] +1;
                                                            
                                                            if(family_level_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                            {
                                                    
                                                                input_data[c]["rep_jump"] = true;
                                                                rep_jump_applied = true;
                                                            }
                                                        }
                                                    } 
                                                }
                                                else
                                                {
                                                    //console.log("pushed updated",c,d)
                                                    family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                    
                                                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                    {
                                                        input_data[c]["rep_jump"] = true;
                                                        rep_jump_applied = true;
                                                    }
    
                                                }
                                            }
                                        }
                                    }
    
                                    
                                }
    
                                if(rep_jump_applied == true)
                                {
                                    console.log("---> Rep Jump applied on index:",c+1);
                                }
                            }
    
                            console.log("family count",family_level_count);
                            
                        }
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == 947960001)
                        {
                            //console.log("choice A is B")   
    
                            for(let c=0;c<input_data.length;c++)
                            {
                            
    
                                if(eligible_master_element.includes(c) == true)
                                {
                                    
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        var invalid:any = false;
                                    
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] && possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true )
                                            {
                                                var family_data = family_level_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"]);
                                                
                                                if(family_data.length>=1)
                                                {
                                                    //console.log("increase count")
                                                    for(let z=0;z<family_level_count.length;z++)
                                                    {
                                                        if(family_level_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_level_count[z]["level"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"])
                                                        {
                                                            //console.log("increase count updated")
                                                            family_level_count[z]["count"] = family_level_count[z]["count"] +1;
                                                            
                                                            if(family_level_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                            {
                                                    
                                                                invalid = true;
                                                            
                                                            }
                                                        }
                                                    } 
                                                }
                                                else
                                                {
                                                    //console.log("pushed updated",c,d)
                                                    family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                    
                                                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                                    {
                                                        invalid = true;
                                                        
                                                    }
    
                                                }
    
                                                if(invalid == true)
                                                {
                                                    
                                                    if(input_data[c]["elements"][d]["protection"] == false)
                                                    {
                                                        input_data[c]["elements"][d]["invalid"] = true;
                                                    }       
                                                }
                                            }
                                        }
    
                                        
                                    }
    
                                    
                                }
    
                            
                            }
    
                            console.log("family count",family_level_count);
    
                        }
    
                        
                    }
    
                    
    
                    this.master_element_code(input_data,947960014,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
               
    
                // 15 - Must do combination element with exactly [Element Family A] at [Integer A] level, and [Element Family B] at [Integer B] level. Invalidate all master elements of two or more sub-elements that do not match this criteria.
                case 947960016: 
                    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960016," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilya value is null"})
                        console.log("Error : sc_elementfamilya value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilyb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilyb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilyb value is null"})
                        console.log("Error : sc_elementfamilyb value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
                        
                        for(let c=0;c<input_data.length;c++)
                        {
                        // invalidate all with more than 2 elements
        
                        if(input_data[c]["elements"].length >2)
                        {
                            //console.log("greater than 2 ")
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) {
                                    
                                        if(input_data[c]["elements"][d]["protection"] == false)
                                        {
                                            input_data[c]["elements"][d]["invalid"] = true;
                                        }
                                    
                                }
                            }
        
                        }
                        if(input_data[c]["elements"].length == 2)
                        {
                            //console.log("equal to 2 ");
        
                            var rule_meet = false;
                        
                            var first_element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][0]);
        
                            if (first_element_def_data.length >= 1) {
                                
                                if(first_element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] && input_data[c]["elements"][0]["invalid"] == false && first_element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                {
                                    // console.log("Rule 1 satisfied")
        
                                    var second_element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][1]);
        
                                    if (second_element_def_data.length >= 1) {
                                        
                                        if(second_element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilyb"] && input_data[c]["elements"][1]["invalid"] == false && second_element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                        {
                                            //console.log("Rule 2 satisfied")
                                            rule_meet = true; 
                                        }
                                    }
                                }
        
                            }
        
                            if(rule_meet == false)
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                    if (element_def_data.length >= 1) {
                                            if(input_data[c]["elements"][d]["protection"] == false)
                                            {
                                                input_data[c]["elements"][d]["invalid"] = true;
                                            }
                                        
                                    }
                                }
                            }
                            
        
                        }
                        }
               
                    }
    
                    
    
                    this.master_element_code(input_data,947960016,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
    
                    //console.log('947960016');
                    break;
                
                /* 
    
                    -------------------------------------------------------------------
                                            PROTECTION RULES:
                    -------------------------------------------------------------------
                */
    
                // 16 - If a combination element containing a sub-element from [Element Family A] at [Integer A] level and also a distinct sub-element from [Element Family B] at [Integer B] level and in this order, with exactly [Integer C] sub-elements, then protect it from invalidation by other rules.
                case 947960017: 
    
                    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960017," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }

                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerc value is null"})
                        console.log("Error : sc_integerc value is null");
                        error_in_rule = true;
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilya value is null"})
                        console.log("Error : sc_elementfamilya value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilyb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilyb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilyb value is null"})
                        console.log("Error : sc_elementfamilyb value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
                        for(let c=0;c<input_data.length;c++)
                        {
                            if(input_data[c]["elements"].length >1 && input_data[c]["elements"].length == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                            {
                                
                                //console.log("in master element",c+1);
                                var element_family_a_avialable = false;
                                var element_family_b_avialable = false;
                                
                                var first_occurance_family_index = -1;
    
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                    if (element_def_data.length >= 1) 
                                    {
        
        
                                            if(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                            {
                                                if(input_data[c]["elements"][d]["invalid"] == false)
                                                {
                                                    element_family_a_avialable = true;
                                                    first_occurance_family_index = d;
                                                    break;
                                                }
                                                
                                            }
                                            
                                    }
                                }

                                console.log("--------",first_occurance_family_index,element_family_a_avialable,c);
    
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    
                                    if(d != first_occurance_family_index && d>first_occurance_family_index) 
                                    {
                                        
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            
                                            if(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilyb"] && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                            {       
                                               
                                                if(input_data[c]["elements"][d]["invalid"] == false)
                                                {
                                                    
                                                    element_family_b_avialable = true;  
                                                }
                                                                                    
                                            }
                                                
                                        }
                                    }
                                
                                }
    
                            
    
                                console.log("middle",c+1,element_family_a_avialable,element_family_b_avialable);
                                if(element_family_a_avialable == true && element_family_b_avialable == true)
                                {
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["protection"] == false)
                                        {
                                            input_data[c]["elements"][d]["protection"] = true;
                                            
                                        }
                                    }
                                    protection_index.push(c+1);
                                    console.log("---> Protection applied on index:",c+1);
    
                                }
    
                                //console.log("comin into check for rule 17",JSON.parse(JSON.stringify(input_data)));
                            }
                        }
                    }
    
                    
    
                    this.master_element_code(input_data,947960017,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
                    //console.log('947960017');
                    break;
    
                // 17 - Protect up to [Integer A] Master elements with exactly [Integer B] sub-elements from [Element Family Type A].
                case 947960018: 
                    //console.log('947960018');
    
                   
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960018," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
                        var protection_master_element_count:any = 0;
                        for(let c=0;c<input_data.length;c++)
                        {
                            var family_type_count:any= 0;
        
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) 
                                {
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                    {      
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {
                                            family_type_count++;  
                                        }
                                                                             
                                    }
                                }
                            }
        
                            if(protection_master_element_count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                            {
                                if(family_type_count == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                {
                                    var protection_any_element_in_master = false;

                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["protection"] == false)
                                        {
                                            input_data[c]["elements"][d]["protection"] = true;
                                            protection_any_element_in_master = true;
                                        }
                                        
                                    }
        
                                    if(protection_any_element_in_master == true)
                                    {        
                                        protection_master_element_count++;
            
                                        console.log("---> Protection applied on index:",c+1);

                                    }
                                }
                            }
        
                        }
        
                    }
    
                    
                     
                    this.master_element_code(input_data,947960018,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
                    break;
    
                // 18 -  Protect up to [Integer A] sub-elements [Choice A "in order of entry"(A) / "in order from highest base value to lowest"(B)] from [Element Famil(ies) A] at a level of [Integer B] to [Integer C] within master elements that contain a minimum of [Integer D] and a maximum of [Integer E] sub-elements.
                case 947960019: 
                    //console.log('947960019');
    
    
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960019," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerc value is null"})
                        console.log("Error : sc_integerc value is null");
                        error_in_rule = true;
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_choicea value is null"})
                        console.log("Error : sc_choicea value is null");
                        error_in_rule = true;
                    }   
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_elementdefinitionsa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_elementdefinitionsa' table.")   
                        error_in_rule = true; 
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_truefalsea value is null"})
                        console.log("Error : sc_truefalsea value is null");
                        error_in_rule = true;
                    }
                   
                    if(error_in_rule == false)
                    {
                        var eligible_sub_elements:any= [];     
                    
                        var possible_definitions:any = [];
        
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_elementdefinitionsaid"].length;a++)
                        {
                            possible_definitions.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_elementdefinitionsaid"][a]["sc_skatingelementdefinitionid"])
        
                        }
        
                        console.log("possible_definitions list",possible_definitions);
        
        
                        for(let c=0;c<input_data.length;c++)
                        {
                            //console.log("_______________",elements_def[c]["type"]);

                            // if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] == 0)
                            // {
                            //     console.log("false");
                            // }
                            // else
                            // {
                            //     console.log("true"); 
                            // }

                            if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"]<= input_data[c]["elements"].length && input_data[c]["elements"].length <= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                            {
                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_truefalsea"] == 0)
                                {
                                    //console.log("false");

                                    
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {
                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
            
                                            if (element_def_data.length >= 1) 
                                            {
                                                
                                                if(possible_definitions.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"]) == true && input_data[c]["elements"][d]["protection"] == false)
                                                {
                                                    //console.log(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"])
                                                    //console.log(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"])
                                                    
                                                    eligible_sub_elements.push([c,d,element_def_data[0]["sc_skatingelementdefinitionid"]["sc_basevalue"]]);
                                                    
                                                }
                                            }
                                        }
                                        
                                    }

                                }
                                else
                                {
                                    //console.log("true"); 
                                    

                                    if(elements_def[c]["type"] == "COMBO")
                                    {
                                        //console.log("ass",c);

                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false)
                                            {
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                
                                                if (element_def_data.length >= 1) 
                                                {
                                                    
                                                    if(possible_definitions.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"]) == true && input_data[c]["elements"][d]["protection"] == false)
                                                    {
                                                        //console.log(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"])
                                                        //console.log(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"])
                                                        
                                                        eligible_sub_elements.push([c,d,element_def_data[0]["sc_skatingelementdefinitionid"]["sc_basevalue"]]);
                                                        
                                                    }
                                                }
                                            }
                                            
                                        }

                                    }
                                }

                            }
                            
                        }
        
                        console.log("eligible_sub_elements list",eligible_sub_elements);
        
                        
        
        
                        switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"]) {
                    
                            // 01 - Maximum of [Integer A] master elements with at least one [Element Family Type A] sub-element.
                            case 947960000:
                                console.log("choice is A");
        
                                var protection_count:any = 0;
                                for(let x=0;x<eligible_sub_elements.length;x++)
                                {
                                    
                                    if(protection_count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                    {   
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[eligible_sub_elements[x][0]]["elements"][eligible_sub_elements[x][1]]);
        
                                        if (element_def_data.length >= 1 && input_data[eligible_sub_elements[x][0]]["elements"][eligible_sub_elements[x][1]]["protection"] == false) 
                                        {
                                            
                                            protection_count++;
                                            //console.log("name",element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                            input_data[eligible_sub_elements[x][0]]["elements"][eligible_sub_elements[x][1]]["protection"] = true;
        
                                            console.log("---> Protection applied on index:",eligible_sub_elements[x][0]+1,"at position",eligible_sub_elements[x][1]+1);
                                        }
                                    }
                                }
        
                                break;
        
                            case 947960001:
                                console.log("choice is B");
        
                                const sortedDsc = eligible_sub_elements.sort((a:any, b:any,c:any) => {
                                    if (a[2] === null) {
                                      return 1;
                                    }
                                  
                                    if (b[2] === null) {
                                      return -1;
                                    }
                                  
                                    if (a[2] === b[2]) {
                                      return 0;
                                    }
                                  
                                    return a[2] > b[2] ? -1 : 1;
                                  });
                
                                //console.log("sortedDsc",sortedDsc)
        
                                var protection_count:any = 0;
                                          
                                for(let x=0;x<sortedDsc.length;x++)
                                {
                                    
                                    
                                    if(protection_count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                    {   
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[eligible_sub_elements[x][0]]["elements"][eligible_sub_elements[x][1]]);
        
                                        if (element_def_data.length >= 1 && input_data[sortedDsc[x][0]]["elements"][sortedDsc[x][1]]["protection"] == false) 
                                        {
                                            protection_count++;
                                            //console.log("name",element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                            input_data[sortedDsc[x][0]]["elements"][sortedDsc[x][1]]["protection"] = true;
        
                                            console.log("---> Protection applied on index:",sortedDsc[x][0]+1,"at position",sortedDsc[x][1]+1);
                                        }
                                    }
                                }
                                    
                                break;
        
                            default:
                                console.log('you shouldn\'t see this');
                                break;
        
                        }
        
        
        
                    }
    
                    this.master_element_code(input_data,947960019,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
    
                    break;
                
    
                /* 
    
                    -------------------------------------------------------------------
                                            INVALIDATION RULES:
                    -------------------------------------------------------------------
                */
    
                
                // 19 - Minimum of [Integer A] sub-elements from [Element Family A] between [Integer B] and [Integer C] level.
                case 947960020: 
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960020," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerd value is null"})
                        console.log("Error : sc_integerd value is null");
                        error_in_rule = true;
                    }
    
                    if((initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] === "" ) && (initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" ))
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb and sc_integerc both are null"})
                        console.log("Error : sc_integerb and sc_integerc both are null");
                        error_in_rule = true;
                    }
    
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilya value is null"})
                        console.log("Error : sc_elementfamilya value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var invalidation_applied = false;
                        var count:any = 0;
    
                        var int_b = 0;
                        var int_c = 99;
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] !== "")
                        {
                            int_b = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"];
                        }
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] !== "")
                        {
                            int_c = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"];
                        }
    
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"])
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= int_b && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] <= int_c)
                                        {
                                            count++;
                                            
                                        }
                                    }
    
                                }
                            }
                        }
    
                        if(count< initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] )
                        {
                            invalidation_applied = true;
                        }
                    
                        //console.log("invalidation applied",invalidation_applied)
    
                        // should be checked once confusion is clear
    
                        if(invalidation_applied == true)
                        {
                            var invalidation_total = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - count;
                            
                            var invalidation_family_type = "";
                            var families = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.fam_sc_skatingelementfamilyid == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilya"]);
                            
                            if (families.length >= 1) 
                            {
                                invalidation_family_type = families[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"];
                            }
    
                            for(let c=input_data.length-1;c>=0;c--)
                            {
                                if(input_data[c]["elements"].length <= initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"])
                                {
                                    for(let d=input_data[c]["elements"].length-1;d>=0;d--)
                                    {
                                        
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
            
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(invalidation_family_type != "")
                                            {
                                                if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == invalidation_family_type)
                                                {
                                                    if(input_data[c]["elements"][d]["protection"] == false && invalidation_total >0)
                                                    {
                                                        input_data[c]["elements"][d]["invalid"] = true;
                                                        invalidation_total --;
                                                        
                                                    }
                                                }
                                            }
                                        
                                        }
                                    }
                                }
                                
                            }
                        }
    
                    }
    
    
                    this.master_element_code(input_data,947960020,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
    
                    //console.log('947960020');
                    break;
                
                // 20 - Minimum of [Integer A] sub-elements from [Element Family Type A] between [Integer B] and [Integer C] level.     
                case 947960021: 
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960021," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if((initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] === "" ) && (initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" ))
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb and sc_integerc both are null"})
                        console.log("Error : sc_integerb and sc_integerc both are null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var invalidation_applied = false;
                        var count:any = 0;
    
                        var int_b = 0;
                        var int_c = 99;
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] !== "")
                        {
                            int_b = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"];
                        }
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] !== "")
                        {
                            int_c = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"];
                        }
    
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >= int_b && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] <= int_c)
                                        {
                                            count++;
                                            
                                        }
                                    }
    
                                }
                            }
                        }
    
                
    
                        if(count< initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] )
                        {
                            invalidation_applied = true;
    
                        }
    
                        
                       
    
                        // should be checked once confusion is clear
                        
                        if(invalidation_applied == true)
                        {
                            
                            var invalidation_total = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - count;
                            
                            for(let c=input_data.length-1;c>=0;c--)
                            {
                                
                                for(let d=input_data[c]["elements"].length-1;d>=0;d--)
                                {
                                    
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                    if (element_def_data.length >= 1) 
                                    {
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                        {
                                            if(input_data[c]["elements"][d]["protection"] == false && invalidation_total>0 )
                                            {
                                                input_data[c]["elements"][d]["invalid"] = true;
                                                invalidation_total = invalidation_total -1;
                                            }
                                        }
                                    }
                                }
                                
                                
                            }
                        }
                        
                    }
    
                    
    
                    
    
                    this.master_element_code(input_data,947960021,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
    
                    //console.log('947960021');
                    break;
                
                // 21 -  [Choice A protect(A)/invalidate(B)] [Integer A] Sub-Element(s) from [Element Famil(ies) A] with Fly [Choice B May(A)/Must(B)/Must Not(C)], and Change [Choice C May(A)/Must(B)/Must Not(C)]
                case 947960022: 
                    //console.log('947960022');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960022," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_skatingelementfamiliesaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamiliesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamiliesa' table.") 
                        error_in_rule = true;   
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_choicea value is null"})
                        console.log("Error : sc_choicea value is null");
                        error_in_rule = true;
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choiceb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choiceb"] === "")
                    {

                        initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choiceb"] =  947960000;                       
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_choiceb value is null"})
                        console.log("Error : sc_choiceb value is null");
                        
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicec"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicec"] === "")
                    {
                        initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicec"] =  947960000;
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_choicec value is null"})
                        console.log("Error : sc_choicec value is null");
                        
                    }
    
    
    
                    if(error_in_rule == false)
                    {
    
                        var possible_families:any = [];
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
    
                        }
    
                        //console.log("possible_families list",possible_families);
    
    
                        var eligible_sub_elements:any = [];
    
                        switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choiceb"]) {
                
                            case 947960000:
    
                                //console.log("May b")
                                
                                switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicec"]) {
                
                                    case 947960000:
                                        //console.log("May c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false )
                                                    {
                                                        
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                
                                    case 947960001:
                                        //console.log("Must c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false  && input_data[c]["elements"][d]["Change"] == true )
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                
                                    
                                    case 947960002:
                                        //console.log("Must not c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false  && input_data[c]["elements"][d]["Change"] == false )
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                    
                                    default:
                                        break;
                
                                }
    
                                break;
    
                            case 947960001:
                                //console.log("Must B")
                                
                                switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicec"]) {
                
                                    case 947960000:
                                        //console.log("May c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Flying"] == true)
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
    
                                        break;
                
                                    case 947960001:
                                        //console.log("Must c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Flying"] == true && input_data[c]["elements"][d]["Change"] == true)
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                
                                    
                                    case 947960002:
                                        //console.log("Must not c")
    
                                        
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Flying"] == true && input_data[c]["elements"][d]["Change"] == false)
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                    
                                    default:
                                        break;
                
                                }
    
                                break;
    
                            
                            case 947960002:
                                //console.log("Must not B")
                                
                                switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicec"]) {
                
                                    case 947960000:
                                        //console.log("May c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Flying"] == false)
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                
                                    case 947960001:
                                        //console.log("Must c")
    
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Flying"] == false && input_data[c]["elements"][d]["Change"] == true)
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                
                                    
                                    case 947960002:
                                        //console.log("Must not c")
                                        for(let c=0;c<input_data.length;c++)
                                        {
    
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {                                    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                        
                                                if (element_def_data.length >= 1)
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Flying"] == false && input_data[c]["elements"][d]["Change"] == false)
                                                    {
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                        {
                                                            eligible_sub_elements.push([c,d]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
    
                                        break;
                    
                                    default:
                                        break;
                
                                }
    
                                break;
            
                            default:
                                break;
    
                        }
    
    
                        console.log("elegible sub elements",eligible_sub_elements)
                        
                        // protection or invalidation
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] !== "")
                        {
                            switch(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_choicea"]) {
                
                                case 947960000:
                                    //console.log("apply protection")
            
                                    var count:any = 0;
                                    for(var m=0;m<eligible_sub_elements.length;m++)
                                    {
                                        
                                        if(count<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] && input_data[eligible_sub_elements[m][0]]["elements"][eligible_sub_elements[m][1]]["protection"] == false)
                                        {
                                            count++;
                                            input_data[eligible_sub_elements[m][0]]["elements"][eligible_sub_elements[m][1]]["protection"] = true; 
                                            console.log("protection applied on row -",eligible_sub_elements[m][0] +1,"and position - ",eligible_sub_elements[m][1] +1);  
                                        }
                                    }
                                    break;
            
                                case 947960001:
                                    //console.log("apply invalidation")
    
                                    var count:any = 0;
                                    for(var m=0;m<eligible_sub_elements.length;m++)
                                    {
                                        count++;
                                        if(count > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                        {
                                            if(input_data[eligible_sub_elements[m][0]]["elements"][eligible_sub_elements[m][1]]["protection"] == false )
                                            {
                                                input_data[eligible_sub_elements[m][0]]["elements"][eligible_sub_elements[m][1]]["invalid"] = true;
                                                
                                            }   
                                            
                                            
                                        }
                                    }
    
                                    break;
                
                                default:
                                    break;
            
                            }
            
                        }
    
                    }
                    
                      
                    
                    this.master_element_code(input_data,947960022,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
    
                    break;
                
    
            
                /* 
    
                    -------------------------------------------------------------------
                                            Bonus RULES:
                    -------------------------------------------------------------------
                */
    
                // 22 -  Master elements that contain a sub-element from [Element Definition(s) A], which is immediately succeeded by a sub-element from [Element Definition(s) B], increments [Skating Adjustment Association A] by [Integer A], to be applied a maximum of [Integer B] times within a Skate.
                case 947960023: 
    
                    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960023," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true; 
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_adjustmentassociationa value is null"})
                        console.log("Error : sc_adjustmentassociationa value is null");
                        error_in_rule = true; 
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":" Rule has no relative entry in css_sc_wbp_elementdefinitionsa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_elementdefinitionsa' table.")   
                        error_in_rule = true; 
                    }
                    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsbid'].length < 1 && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsdid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in sc_wbp_elementdefinitionsbid or sc_wbp_elementdefinitionsdid table."})
                        console.log("Error : Rule has no relative entry in 'sc_wbp_elementdefinitionsbid' or 'sc_wbp_elementdefinitionsdid' table.")   
                        error_in_rule = true;
                        
                    }
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsbid'].length >= 1)
                    {
                        
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionscid'].length < 1)
                        {
                            errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in sc_wbp_elementdefinitionscid table."})
                            console.log("Error : Rule has no relative entry in 'sc_wbp_elementdefinitionscid' table.")   
                            error_in_rule = true; 
                        }
                    }
    
                    
    
                    if(error_in_rule == false)
                    {
    
                        var sc_inta:any=0;
                        var sc_intb:any=200;
    
                        var bonus_total:any=0;
                        var bonus_increment_count:any=0;
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] !== "")
                        {
                            sc_inta = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"]
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] !== "")
                        {
                            sc_intb = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"]
                        }
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            var bonus_added = false;
                            // case when b is available
                            if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsbid'].length >= 1 )
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false)
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            var def_a_data = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsaid'].filter((record: any) => record.sc_skatingelementdefinitionid == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"] );
                
                                            if(def_a_data.length>=1)
                                            {
                                                if(d>=2)
                                                {
                                                    if(input_data[c]["elements"][d-1]["invalid"] == false)
                                                    {
                                                        var element_def_data_1 = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d-1]);
        
                                                        if (element_def_data_1.length >= 1) 
                                                        {
                                                            
                                                            var def_b_data = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsbid'].filter((record: any) => record.sc_skatingelementdefinitionid == element_def_data_1[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"] );
                                                            //console.log("step 2",def_d_data,element_def_data_1)
                                                            if(def_b_data.length>=1)
                                                            {
    
                                                                //console.log("def b avialable")
    
                                                                if(input_data[c]["elements"][d-2]["invalid"] == false)
                                                                {
                                                                    var element_def_data_2 = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d-2]);
                    
                                                                    if (element_def_data_2.length >= 1) 
                                                                    {
                                                                        
                                                                        var def_c_data = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionscid'].filter((record: any) => record.sc_skatingelementdefinitionid == element_def_data_2[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"] );
                                                                        //console.log("step 2",def_d_data,element_def_data_1)
                                                                        if(def_c_data.length>=1)
                                                                        {
                                                                            bonus_increment_count++;
                                                                            bonus_added = true;
    
                                                                            if(bonus_increment_count <=Number(sc_intb))
                                                                            {
                                                                                
                                                                                bonus_total = bonus_total + Number(sc_inta);
                                
                                                                                console.log("increment adjusment using b and c def",c,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] )
                                                                            }
                                                                        }
                                                                    }
                                                                }
    
    
                                                            }
                                                        }
                                                    }
                                                }
    
                                            }
    
                                        }
                                    }
                                }
                            }
                            if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsdid'].length >= 1 ) 
                            {
    
                                // case when b is not then d should
                                if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsdid'].length >= 1 )
                                {
                                    if(bonus_added == false)
                                    {
    
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false)
                                            {
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                                if (element_def_data.length >= 1) 
                                                {
                                                    var def_a_data = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsaid'].filter((record: any) => record.sc_skatingelementdefinitionid == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"] );
                    
                                                    if(def_a_data.length>=1)
                                                    {
                                                        //console.log("def A",c,d,def_a_data)
                                                        if(d!=0)
                                                        {
                                                            //console.log("step 1",c,d)
                                                            if(input_data[c]["elements"][d-1]["invalid"] == false)
                                                            {
                                                                var element_def_data_1 = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d-1]);
                
                                                                if (element_def_data_1.length >= 1) 
                                                                {
                                                                    
                                                                    var def_d_data = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsdid'].filter((record: any) => record.sc_skatingelementdefinitionid == element_def_data_1[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"] );
                                                                    //console.log("step 2",def_d_data,element_def_data_1)
                                                                    if(def_d_data.length>=1)
                                                                    {
                                                                        //console.log("def c got",c,d-1);
        
                                                                        bonus_increment_count++;
        
                                                                        if(bonus_increment_count <=Number(sc_intb))
                                                                        {
                                                                            
                                                                            bonus_total = bonus_total + Number(sc_inta);
                            
                                                                            console.log("increment adjusment using only d def",c,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] )
                                                                        }
        
        
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
    
                                }
                            }
    
                        }
                        
                        
    
                        if(bonus_total != 0)
                        {
                            bonuses_increment.push({"sc_adjustmentassociationa":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"],"bonus_total":bonus_total})
                        }
                    }
    
                    this.master_element_code(input_data,947960023,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
                    //console.log('947960023');
                    break;
                
                // 23 - If a sub-element from [Element Definition(s) A] is executed, increment [Skating Adjustment Association A] by [Integer A], up to [Integer B] times within a Skate, only applied to sub-elements that appear within Master elements than have no more than [Integer C] sub-elements.
                case 947960024: 
                    //console.log('947960024');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960024," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_elementdefinitionsa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_elementdefinitionsa' table.");
                        error_in_rule = true;   
                    }
    
                
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_adjustmentassociationa value is null"})
                        console.log("Error : sc_adjustmentassociationa value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var bonus_total:any=0;
                        var bonus_increment_count:any=0;
    
                        var sc_inta:any=0;
                        var sc_intb:any=1000;
                        var sc_intc:any=100;
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] !== "")
                        {
                            sc_inta = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"];
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] !== "")
                        {
                            sc_intb = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"];
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] !== "")
                        {
                            sc_intc = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"];
                        }
    
                        var eligible_master_element:any = [];
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            if(input_data[c]["elements"].length <= sc_intc )
                            {
                                eligible_master_element.push(c);
                            }
                        }
    
                        //console.log("eligible_master_element index",eligible_master_element);
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            
                            if(eligible_master_element.includes(c) == true)
                            {
                                //console.log("performing",c)
    
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false)
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                
                                                var def_a_data = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_elementdefinitionsaid'].filter((record: any) => record.sc_skatingelementdefinitionid == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_skatingelementdefinitionid"] );
                    
                                                if(def_a_data.length>=1)
                                                {
                                                bonus_increment_count++;
                            
                                                if(bonus_increment_count <=Number(sc_intb))
                                                {
                                                    //console.log("def a avialable",c,d);
                                                    bonus_total = bonus_total + Number(sc_inta);
    
                                                    console.log("increment adjusment",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] )
                                                }
                                                }
                                        }
                                    }
                                }
                            }
                        }
    
                        if(bonus_total != 0)
                        {
                            bonuses_increment.push({"sc_adjustmentassociationa":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"],"bonus_total":bonus_total})
                        }
    
                    }
    
                    
                   
    
                    this.master_element_code(input_data,947960024,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
    
    
                    break;
                
                // 24 - If sub-elements are executed from at least [Integer A] of [Element Famil(ies) A] within a skate between levels [Integer B] and [Integer C], increment [Skating Adjustment Association A] by [Integer D], do not count sub-elements that are underrotated, downgraded, or edge.
                case 947960025: 
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960025," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_skatingelementfamiliesaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in sc_wbp_skatingelementfamiliesaid table."})
                        console.log("Error : Rule has no relative entry in 'sc_wbp_skatingelementfamiliesaid' table.") ;
                        error_in_rule = true;   
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerd value is null"})
                        console.log("Error : sc_integerd value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_adjustmentassociationa value is null"})
                        console.log("Error : sc_adjustmentassociationa value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var sc_inta:any=1;
                        var sc_intb:any=-1;
                        var sc_intc:any=-1;
                        var sc_intd:any=0;
    
                        var family_occurance_count:any=0;
                        var bonus_applied:any = false;
                        
    
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] !== "")
                        {
                            sc_inta = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"]
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] !== "")
                        {
                            sc_intb = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"]
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"] !== "")
                        {
                            sc_intc = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"]
                        }
                        if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] != null && initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"] !== "")
                        {
                            sc_intd = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"]
                        }
    
                        var possible_families:any = [];
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
    
                        }
    
                        //console.log("possible_families list",possible_families);
    
                        // b and c not avialable
                        if(sc_intb ==-1 && sc_intc ==-1)
                        { 
                            //console.log("b and c not avialbale")
                            for(let c=0;c<input_data.length;c++)
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Edge"] !='e' && input_data[c]["elements"][d]["Rotation"] !='<' && input_data[c]["elements"][d]["Rotation"] !='<<' )
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                            {
                                                const index = possible_families.indexOf(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]);

                                                //console.log("index info",index);
                                                if(index !=-1)
                                                {
                                                    const x = possible_families.splice(index, 1);
                    
                                                }
                                                
                                                family_occurance_count++;
                                            }
    
                                        
                                        }
                                    }
                                    
                                }
                            }
                        }
    
                        // if b only avialable and c is not available
                        if(sc_intb !=-1 && sc_intc ==-1)
                        {
                            //console.log("only b available")
                            for(let c=0;c<input_data.length;c++)
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Edge"] !='e' && input_data[c]["elements"][d]["Rotation"] !='<' && input_data[c]["elements"][d]["Rotation"] !='<<' )
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] >=sc_intb)
                                            {
                                                
                                                if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                {
                                                    const index = possible_families.indexOf(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]);

                                                    //console.log("index info",index);
                                                    if(index !=-1)
                                                    {
                                                        const x = possible_families.splice(index, 1);
                        
                                                    }

                                                    family_occurance_count++;
                                                }
                                            }
    
                                        
                                        }
                                    }
                                    
                                }
                            }
                        }
    
                        // if b not avialable and c is available
                        if(sc_intb ==-1 && sc_intc !=-1)
                        {
                            //console.log("only c available")
                            for(let c=0;c<input_data.length;c++)
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Edge"] !='e' && input_data[c]["elements"][d]["Rotation"] !='<' && input_data[c]["elements"][d]["Rotation"] !='<<' )
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] <=sc_intc)
                                            {
                                                
                                                if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                {
                                                    const index = possible_families.indexOf(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]);

                                                    //console.log("index info",index);
                                                    if(index !=-1)
                                                    {
                                                        const x = possible_families.splice(index, 1);
                        
                                                    }

                                                    family_occurance_count++;
                                                }
                                            }
    
                                        
                                        }
                                    }
                                    
                                }
                            }
                        }
    
    
                        // if b avialable and c is also available
                        if(sc_intb !=-1 && sc_intc !=-1)
                        {
                            //console.log(" b and c available")

                            for(let c=0;c<input_data.length;c++)
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false && input_data[c]["elements"][d]["Edge"] !='e' && input_data[c]["elements"][d]["Rotation"] !='<' && input_data[c]["elements"][d]["Rotation"] !='<<' )
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(sc_intb <= element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] <=sc_intc)
                                            {
                                                
                                                if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                {
                                                    const index = possible_families.indexOf(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]);

                                                    //console.log("index info",index);
                                                    if(index !=-1)
                                                    {
                                                        const x = possible_families.splice(index, 1);
                        
                                                    }
                                                    
                                                    //console.log("new array after splice",possible_families);

                                                    //console.log("int c and d value",c,d)
                                                    family_occurance_count++;
                                                }
                                            }
    
                                        
                                        }
                                    }
                                    
                                }
                            }
                        }
    
    
                        console.log("family_occurance_count",family_occurance_count);
    
                        if(family_occurance_count >= sc_inta)
                        {
                            bonus_applied = true;
                        }
    
                        if(bonus_applied == true)
                        {
                            bonuses_increment.push({"sc_adjustmentassociationa":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"],"bonus_total":Number(sc_intd)})
                            console.log("increment adjusment",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_adjustmentassociationa"] )
                        }
                        
                    }
    
                    
                    
                    this.master_element_code(input_data,947960025,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                   
                    //console.log('947960025');
                    break;
    
                /* 
    
                    -------------------------------------------------------------------
                                            INVALIDATION RULES:
                    -------------------------------------------------------------------
                */
    
                // 25 - Invalidate everything.
                case 947960026: 
                    //console.log('947960026');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960026," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    
                    for(let c=0;c<input_data.length;c++)
                    {
                        for(let d=0;d<input_data[c]["elements"].length;d++)
                        {
                            if(input_data[c]["elements"][d]["protection"] == false && input_data[c]["elements"][d]["invalid"] == false )
                            {
                                input_data[c]["elements"][d]["invalid"] = true;
                                
                            }
                        }
                    }
    
                    this.master_element_code(input_data,947960026,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
    
                    break;
    
    
                // 26 - Maximum of [Integer A] sub-elements from the same family and level in the skate, for sub-elements from [Element Famil(ies) A] occurring in master elements with a maximum of [Integer B] sub-elements.
                case 947960027: 
                    //console.log('947960027');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960027," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    //console.log("@@@@@@@@@@@@@@@",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_skatingelementfamiliesbid'].length)
                    
                    
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_skatingelementfamiliesaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in sc_wbp_skatingelementfamiliesaid table."})
                        console.log("Error : Rule has no relative entry in 'sc_wbp_skatingelementfamiliesaid' table.")
                        error_in_rule = true;    
                    }
    
                    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    
                    if(error_in_rule == false)
                    {
                        // possible families A

                        var possible_families_a:any = [];

                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families_a.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])

                        }

                        console.log("possible_families_a list",possible_families_a);


                        // possible families B 

                        var possible_families_b:any = [];

                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesbid"].length;a++)
                        {
                            possible_families_b.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesbid"][a]["sc_skatingelementfamilyid"])

                        }

                        console.log("possible_families_b list",possible_families_b);

                        // step 1
                        console.log(" step 1 ");

                        var extant_permutations_list:any = [];

                        for(let c=0;c<input_data.length;c++)
                        {
                            
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);

                                if (element_def_data.length >= 1) 
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false)
                                    {    
                                        if(possible_families_b.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                        {
                                            var tem_data = extant_permutations_list.filter((record: any) => record.element == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"] );
                                            
                                            if(tem_data.length<1)
                                            {
                                                //console.log("we have to isnert",c+1,d+1);
                                                extant_permutations_list.push({'element':element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"],"count":0,"family_type":element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"]})
                                            }   

                                        }
                                    }
                                }

                                
                            }
                        }
                        
                        //console.log("list of extant elements",extant_permutations_list);


                        //adding count of non-combo master elements containing the permutation

                        for(let a=0;a<extant_permutations_list.length;a++)
                        {

                            for(let c=0;c<input_data.length;c++)
                            {
                                //console.log("-------",elements_def[c]["type"])
                                if(elements_def[c]["type"] != "COMBO" )
                                {
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {

                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);

                                            if (element_def_data.length >= 1) 
                                            {
                                            
                                                if(extant_permutations_list[a]["element"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                {
                                                    console.log("index",a,c,d);
                                                    extant_permutations_list[a]["count"] = extant_permutations_list[a]["count"] + 1;
                                                    break;
                                                }
                                                

                                            }

                                        }
                                        
                                    }
                                }

                                
                            }

                        }
                       

                        console.log("list of extant elements after",extant_permutations_list);

                        //step 2:

                        console.log(" step 2 ");

                        
                        for(let a=0;a<extant_permutations_list.length;a++)
                        {

                            var occured_in_combo = false; 

                            for(let c=0;c<input_data.length;c++)
                            {
                                

                                if(elements_def[c]["type"] == "COMBO")
                                {
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {
                                        
                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);

                                            if (element_def_data.length >= 1) 
                                            {
                                                if(extant_permutations_list[a]["element"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                {
                                                    occured_in_combo = true;
                                                    // each_permutations_count++;

                                                    // if(each_permutations_count > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"])
                                                    // {
                                                    //     if(input_data[c]["elements"][d]["protection"] == false)
                                                    //     {
                                                    //             console.log("invaliteed based on step 2 - index is ",c+1,d+1);
                                                    //             input_data[c]["elements"][d]["invalid"] = true;
                                                    //     }

                                                    // }
                                                }
                                            }

                                        }

                                       
                                    }
                                }
                            }

                            console.log("occured_in_combo value = ",occured_in_combo);

                            if(occured_in_combo == true)
                            {
                                
                                for(let c=0;c<input_data.length;c++)
                                {
                                    var each_permutations_count = 0;

                                    if(elements_def[c]["type"] == "COMBO" )
                                    {
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false)
                                            {
                                            
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                                if (element_def_data.length >= 1) 
                                                {
                                                    if(extant_permutations_list[a]["element"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                    {
                                                        each_permutations_count++;
    
                                                        if(each_permutations_count > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"])
                                                        {
                                                            if(input_data[c]["elements"][d]["protection"] == false)
                                                            {
                                                                    console.log("invaliteed based on step 2 - index is ",c+1,d+1);
                                                                    input_data[c]["elements"][d]["invalid"] = true;
                                                            }
    
                                                        }
                                                    }
                                                }
    
                                            }
    
                                           
                                        }
                                    }
                                }
                            }
                        }

                        // step 3

                        console.log(" step 3 ");
                        
                        for(let a=0;a<extant_permutations_list.length;a++)
                        {
                            if(extant_permutations_list[a]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerc"])
                            {
                                console.log("limit is crossed");
                                var permutations_count = 0;
                                for(let c=0;c<input_data.length;c++)
                                {
                                    //console.log("-------",elements_def[c]["type"])
                                    if(elements_def[c]["type"] != "COMBO" )
                                    {
                                        for(let d=0;d<input_data[c]["elements"].length;d++)
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false)
                                            {
    
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                                if (element_def_data.length >= 1) 
                                                {
                                                
                                                    if(extant_permutations_list[a]["element"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                    {
                                                        permutations_count++;
                                                        
                                                        if(permutations_count > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerd"])
                                                        {
                                                            console.log("index",a,c,d);
                                                            if(input_data[c]["elements"][d]["protection"] == false)
                                                            {
                                                                    console.log("invalited based on step 3 - index is ",c+1,d+1);
                                                                    input_data[c]["elements"][d]["invalid"] = true;
                                                            }
                                                            
                                                        }
                                                        
    
                                                    }
                                                    
    
                                                }
    
                                            }
                                            
                                        }
                                        
                                    }
                                    
                                    
                                    
                                }
                            }
                        }

                        // step 4

                        console.log(" step 4 ");

                        for(let a=0;a<extant_permutations_list.length;a++)
                        {
                            var count_in_combo = 0;
                            var count_in_non_combo = 0;

                            for(let c=0;c<input_data.length;c++)
                            {
                                //console.log("-------",elements_def[c]["type"])
                                if(elements_def[c]["type"] == "COMBO" )
                                {
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {

                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);

                                            if (element_def_data.length >= 1) 
                                            {
                                                if(extant_permutations_list[a]["element"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                {
                                                    count_in_combo++;
                                                    
                                                }
                                            }
                                        }
                                    }
                                }
                               
                                else
                                {
                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {

                                            var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);

                                            if (element_def_data.length >= 1) 
                                            {
                                                if(extant_permutations_list[a]["element"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                {
                                                    count_in_non_combo++;
                                                    
                                                }
                                            }
                                        }
                                    }
                                }


                            }

                            console.log("total count for each permutation",count_in_combo,"---",count_in_non_combo);

                            if(count_in_combo == 1 && count_in_non_combo == 0)
                            {
                                console.log("invalidation should happen");

                                var invalidation_did = false;

                                for(let c=input_data.length-1;c>=0;c--)
                                {
                                    if(invalidation_did == false)
                                    {
                                        if(input_data[c]["elements"].length == 1 )
                                        {
                                            for(let d=0;d<input_data[c]["elements"].length;d++)
                                            {
                                                if(input_data[c]["elements"][d]["invalid"] == false)
                                                {
                                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                                    if (element_def_data.length >= 1) 
                                                    {
                                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == extant_permutations_list[a]["family_type"] )
                                                        {
                                                            if(input_data[c]["elements"][d]["protection"] == false)
                                                            {
                                                                console.log("invalited based on step 4 - index is ",c+1,d+1);
                                                                input_data[c]["elements"][d]["invalid"] = true;
                                                                invalidation_did = true;
                                                                break;
                                                                
                                                            }
                                                        } 
                                                    }
                                                    
                                                }
                                            }
                                        }
                                    }
                                    
                                }

                            }
                        }
                        
                        // step 5 and 6

                        console.log(" step 5 & step 6 ");
                        
                        var family_level_count:any = [];
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);

                                var invalid:any = false;

                                if (element_def_data.length >= 1) 
                                {
                                    
                                    if(input_data[c]["elements"][d]["invalid"] == false)
                                    {
                                        if(possible_families_a.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true )
                                        {
                                            let index = family_level_count.findIndex((record:any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );

                                            
                                            if(index != -1)
                                            {
                                            
                                                family_level_count[index]["count"] = family_level_count[index]["count"] +1; 

                                                
                                            }
                                            else
                                            {
                                                //family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"element_code":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                
                                                var excluded_index = extant_permutations_list.findIndex((record:any) => record.element == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"]);

                                                if(excluded_index == -1)
                                                {
                                                    family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"element_code":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1});
                                                
                                                }
                                                
                                            }
                                        }

                                    }  
                                    
                                }

                            }
                        }

                        console.log("family count",family_level_count);


                        // have to code

                        console.log(" step 7 and step 8");
                        
                        for(let b=0;b<family_level_count.length;b++)
                        {
                            var occurnace_count = 0;

                            for(let c=0;c<input_data.length;c++)
                            {
                                
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                    var invalid:any = false;
    
                                    if (element_def_data.length >= 1) 
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false)
                                        {
                                            if(family_level_count[b]["element_code"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                            {
                                                occurnace_count++;

                                                break;
                                            }   
                                        }
                                    }
                                }

                                

                                //console.log("occurnace_count",occurnace_count);

                                // based on step 7
                                if(occurnace_count>1)
                                {
                                    //console.log("coming here index is ",c+1);

                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                        var invalid:any = false;
        
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false)
                                            {
                                                if(family_level_count[b]["element_code"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                {
                                                    
                                                    if(input_data[c]["elements"][d]["protection"] == false)
                                                    {
                                                            console.log("invalited based on step 7 - index is ",c+1,d+1);
                                                            input_data[c]["elements"][d]["invalid"] = true;
                                                    }
                                                }   
                                            }
                                        }
                                    }

                                }

                                // based on step 8
                                if(occurnace_count ==1)
                                {
                                    //console.log("inside of step 8");

                                    var same_repeat = 0;

                                    for(let d=0;d<input_data[c]["elements"].length;d++)
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                        var invalid:any = false;
        
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(input_data[c]["elements"][d]["invalid"] == false)
                                            {
                                                if(family_level_count[b]["element_code"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_elementcode"])
                                                {
                                                    same_repeat++;

                                                    if(same_repeat > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                    {
                                                        console.log("index",b+1,c+1,d+1);
                                                        if(input_data[c]["elements"][d]["protection"] == false)
                                                        {
                                                                console.log("invalited based on step 8 - index is ",c+1,d+1);
                                                                input_data[c]["elements"][d]["invalid"] = true;
                                                        }
                                                        
                                                    }

                                                }   
                                            }
                                        }
                                    }   
                                }


                            }
                        }


                        
                    }
    
                       
                    this.master_element_code(input_data,947960027,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
                    
                    break;
    
                // 27 - Minimum of [Integer A] master elements with [Integer B] or more sub-elements. For the difference of required vs. actual, add [Skate Element Note A] to the last sub-element within master elements in reverse chronological order except for sub-elements from [Element Famil(ies) A].
                case 947960028: 
                    //console.log('947960028');
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960028," : ( ",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]," ) ==========")
    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementnotea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementnotea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementnotea value is null"})
                        console.log("Error : sc_elementnotea value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]['sc_wbp_skatingelementfamiliesaid'].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in sc_wbp_skatingelementfamiliesaid table."})
                        console.log("Error : Rule has no relative entry in 'sc_wbp_skatingelementfamiliesaid' table.")
                        error_in_rule = true;    
                    }
    
    
                    if(error_in_rule == false)
                    {
                        var count:any = 0;
    
                        for(let c=0;c<input_data.length;c++)
                        {

                            var jump_sub_elements:any = 0;
    
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
        
                                if (element_def_data.length >= 1) 
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false)
                                    {    
                                        if(element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                        {
                                            jump_sub_elements++;
                                        }
                                    }
                                }
                            }
    
                            console.log("sub count",jump_sub_elements,elements_def[c]["type"]);

                            if(jump_sub_elements >=  initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] || elements_def[c]["type"] == 'COMBO')
                            {
                                count++;
                            }


                        }
    
                        console.log("count",count);
    
                        if(count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                        {
                            var difference:any = initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] - count;
    
                            //console.log("difference",difference);
    
                            var possible_families:any = [];
    
                            for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                            {
                                possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
    
                            }
    
                            //console.log("possible families",possible_families)
    
                            for(let c=input_data.length-1;c>=0;c--)
                            {
                                //console.log("inside c loop",c);
                                var notes_added = false;
    
                                if(difference >0)
                                {
                                    var families_a_exist = false;
    
                                    for(let e=input_data[c]["elements"].length-1;e>=0;e--)
                                    {
                                        var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][e]);
                
                                        if (element_def_data.length >= 1) 
                                        {
                                            if(input_data[c]["elements"][e]["invalid"] == false)
                                            {    
                                                if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true)
                                                {
                                                    families_a_exist = true; 
                                                } 
                                            }
                                            
                                        }
    
                                    }
    
                                    if(families_a_exist == false)
                                    {
                                        for(let d=input_data[c]["elements"].length-1;d>=0;d--)
                                        {
                                            //console.log("inside d loop",d);
                                            if(notes_added == false)
                                            {
                                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
                    
                                                if (element_def_data.length >= 1) 
                                                {
                                                    if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"])
                                                    {    
            
                                                        if(possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == false)
                                                        {
                                                            
                                                           
                                                            var notes = initializationObj["segmentid"]["categoryid"]["definitionid"]["sc_skatingdisciplinedefinition"]["notes"].filter((record: any) => record.sc_skatingelementnoteid.sc_skatingelementnoteid == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementnotea"])
            
                                                            //console.log("notes",notes);
                                                            if(notes.length >=1)
                                                            {
                                                                input_data[c]["elements"][d]["notes"].push(notes[0]["sc_skatingelementnoteid"]["sc_value"])
                                                                notes_added = true;
                                                                
                                                                difference = difference -1;
                                                                break;
                                                            }
                                                            
                                                        }
                                                    
                                                    }
                                                }
            
                                            }
                                        }
                                    }
                                    
                                }
                                
    
                            }
                        }
                    }
    
                    this.master_element_code(input_data,947960028,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
    
    
                    break;
    
                
                // 28 - Maximum of [Integer A] sub-elements in different master elements from the same family and level from [Element Famil(ies) A] at [Integer B] level.
                case 947960029:
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960029," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                                    
                  
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length < 1)
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"Rule has no relative entry in css_sc_wbp_skatingelementfamiliesa table."})
                        console.log("Error : Rule has no relative entry in 'css_sc_wbp_skatingelementfamiliesa' table.");
                        error_in_rule = true;
                        
                    }
    
    
                    if(error_in_rule == false)
                    {
    
                        var family_level_count:any = [];
    
                        
    
                        //console.log("eligible master elements",eligible_master_element);
    
                        var possible_families:any = [];
    
                        for(let a=0;a<initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"].length;a++)
                        {
                            possible_families.push(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_wbp_skatingelementfamiliesaid"][a]["sc_skatingelementfamilyid"])
    
                        }
    
                        console.log("possible_families list",possible_families);
    
    
    
                        for(let c=0;c<input_data.length;c++)
                        {
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                var invalid:any = false;
                            
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] && possible_families.includes(element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"]) == true )
                                    {
                                        var family_data = family_level_count.filter((record: any) => record.family == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && record.level == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] );
                                        
                                        if(family_data.length>=1)
                                        {
                                            
                                            //console.log("increase count")
                                            for(let z=0;z<family_level_count.length;z++)
                                            {
                                                if(family_level_count[z]["family"] == element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"] && family_level_count[z]["level"] == element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"] )
                                                {
                                                    if(family_level_count[z]["master_element_index"] != c )
                                                    {
    
                                                        //console.log("increase count updated")
                                                        family_level_count[z]["count"] = family_level_count[z]["count"] +1;
                                                        family_level_count[z]["master_element_index"] = c;
                                                        
                                                        if(family_level_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                        {
                                                
                                                            invalid = true;
                                                        
                                                        }
    
                                                    }
    
                                                    if(family_level_count[z]["master_element_index"] == c && family_level_count[z]["count"] > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                                                    {
                                                        invalid = true; 
                                                    }
    
                                                    
                                                }
                                            } 
                                        }
                                        else
                                        {
                                            //console.log("pushed updated",c,d)
                                            family_level_count.push({"family":element_def_data[0]["sc_skatingelementdefinitionid"]["fam_sc_skatingelementfamilyid"],"level":element_def_data[0]["sc_skatingelementdefinitionid"]["sc_level"],"count":1,"master_element_index":c});
                                            
                                            if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == 0)
                                            {
                                                invalid = true;
                                                
                                            }
    
                                        }
    
                                        if(invalid == true)
                                        {
                                            
                                            if(input_data[c]["elements"][d]["protection"] == false)
                                            {
                                                input_data[c]["elements"][d]["invalid"] = true;
                                            }       
                                        }
                                    }
                                }
    
                                
                            }
                        
                        }
    
                        console.log("family count",family_level_count);
                        
                    }
    
                    
    
                    this.master_element_code(input_data,947960029,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
                    break;
    
            
                // 29 - Maximum of [Integer A] master elements containing less than [integer B] sub-elements from [Element Family Type A]
    
                case 947960030:
    
                    console.log("=========  Started Applying rule (Order -",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],") : ",947960030," : (",initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"],") ==========")
                    
                    
                    var error_in_rule:any = false;
    
                    // Error reporting 
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integera value is null"})
                        console.log("Error : sc_integera value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"] === "" )
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_integerb value is null"})
                        console.log("Error : sc_integerb value is null");
                        error_in_rule = true;
                    }
    
                    if(initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] == null || initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] === "")
                    {
                        errors.push({"rule_type":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_ruletype"],"order":initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],"error":"sc_elementfamilytypea value is null"})
                        console.log("Error : sc_elementfamilytypea value is null");
                        error_in_rule = true;
                    }
    
                    if(error_in_rule == false)
                    {
    
                        var allowed_master_element_count:any = 0;
                        
                        
                        for(let c=0;c<input_data.length;c++)
                        {
                            var rep_jump_applied: any = false;
                            var family_type_count:any = 0;
    
                            for(let d=0;d<input_data[c]["elements"].length;d++)
                            {
                                
                                var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                if (element_def_data.length >= 1) 
                                {
                                    if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] )
                                    {
                                        family_type_count++; 
                                        
                                    }
                                }
    
                            }
    
                            console.log("family type count",family_type_count,c)
    
                            if(family_type_count >=1)
                            {
                                if(family_type_count < initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integerb"])
                                {
                                    allowed_master_element_count++;
                                }
                            }
    
                            if(allowed_master_element_count > initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_integera"])
                            {
                                for(let d=0;d<input_data[c]["elements"].length;d++)
                                {
                                    
                                    var element_def_data = initializationObj["segmentid"]["definitionid"]["sc_elementconfiguration"]["elements"].filter((record: any) => record.sc_skatingelementdefinitionid.sc_skatingelementdefinitionid == elements_def[c]["elements"][d]);
    
                                    if (element_def_data.length >= 1) 
                                    {
                                        if(input_data[c]["elements"][d]["invalid"] == false && element_def_data[0]["sc_skatingelementdefinitionid"]["famtype_sc_skatingelementfamilytypeid"] == initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_elementfamilytypea"] )
                                        {
                                            if(input_data[c]["elements"][d]["protection"] == false)
                                            {
                                               
                                                input_data[c]["rep_jump"] = true;
                                                
                                                rep_jump_applied = true;
    
    
                                            } 
                                            
                                        }
                                    }
                                }
    
                            }
    
                            if(rep_jump_applied ==  true)
                            {
                                console.log("---> Rep Jump applied on index:",c+1);
                            }
    
                        }
    
                        console.log("index for count of master crossing limit",allowed_master_element_count)
    
                    }
                    
    
                    this.master_element_code(input_data,947960030,initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_order"],initializationObj["segmentid"]["definitionid"]["well_balanced"][i]["sc_name"]);
                    
    
                    break;
    
                default:
                    console.log('you shouldn\'t see this');
                    break;
            }
        }
    
       
        this.protection_flag_remove(input_data);
    
        console.log("----------------------- ERRORS ------------------------",errors);

        return {"input_data":input_data,"bonuses_increment":bonuses_increment,"elements_def":elements_def,'errors':errors};

        //return {"input_data":input_data,"bonuses_increment":bonuses_increment,"elements_def":elements_def};

    }
    
    // Finding element defination based on button pressed
    element_defination(data:any)
    {
        
        var string_element_code = "";
    
        if (data['Pattern_dance_code'] != "") {
        string_element_code = string_element_code + data['Pattern_dance_code'];
        }
    
        if (data['Flying'] == true) {
        string_element_code = string_element_code + "F";
        }
    
        if (data['Change'] == true) {
        string_element_code = string_element_code + "C";
        }
    
        if (data['Element_code'] != "") {
        string_element_code = string_element_code + data['Element_code'];
        }
    
        if (data['Synchro_element_suffix'].length >= 1) {
        var tem = "";
        for (let c = 0; c < data['Synchro_element_suffix'].length; c++) {
            tem = tem + data['Synchro_element_suffix'][c];
        }
        string_element_code = string_element_code + "+" + tem;
        }
    
        if (data['Throw'] == true) {
        string_element_code = string_element_code + "Th";
        }
    
        if (data['Edge'] != "") {
        string_element_code = string_element_code + data['Edge'];
        }
    
        if (data['Rotation'] != "") {
        string_element_code = string_element_code + data['Rotation'];
        }
    
        if (data['V'] == true) {
        string_element_code = string_element_code + "V";
        }
        
       return string_element_code;
    
    }
    
    
     // function for what have changed after each rule
     master_element_code(data:any,rule:any,order:any,name:any)
     {
         var elements_definations: any = [];
     
         for(let a=0;a<data.length;a++)
         {
             var elements:any = [];
             
             for(let b=0;b<data[a]["elements"].length;b++)
             {
                 
                 
                 var string_element_code = "";
     
                 if (data[a]["elements"][b]['Pattern_dance_code'] != "") {
                 string_element_code = string_element_code + data[a]["elements"][b]['Pattern_dance_code'];
                 }
     
                 if (data[a]["elements"][b]['Flying'] == true) {
                 string_element_code = string_element_code + "F";
                 }
     
                 if (data[a]["elements"][b]['Change'] == true) {
                 string_element_code = string_element_code + "C";
                 }
     
                 if (data[a]["elements"][b]['Element_code'] != "") {
                 string_element_code = string_element_code + data[a]["elements"][b]['Element_code'];
                 }
     
                 if (data[a]["elements"][b]['Synchro_element_suffix'].length >= 1) {
                 var tem = "";
                 for (let c = 0; c < data[a]["elements"][b]['Synchro_element_suffix'].length; c++) {
                     tem = tem + data[a]["elements"][b]['Synchro_element_suffix'][c];
                 }
                 string_element_code = string_element_code + "+" + tem;
                 }
     
                 if (data[a]["elements"][b]['Throw'] == true) {
                 string_element_code = string_element_code + "Th";
                 }
     
                 if (data[a]["elements"][b]['Edge'] != "") {
                 string_element_code = string_element_code + data[a]["elements"][b]['Edge'];
                 }
     
                 if (data[a]["elements"][b]['Rotation'] != "") {
                 string_element_code = string_element_code + data[a]["elements"][b]['Rotation'];
                 }
     
                 if (data[a]["elements"][b]['V'] == true) {
                 string_element_code = string_element_code + "V";
                 }
     
                 if (data[a]["elements"][b]['invalid'] == true) {
                     string_element_code = string_element_code + "*";
                }
    
                if (data[a]["elements"][b]['notes'].length >= 1)
                {
                    for (let c = 0; c < data[a]["elements"][b]['notes'].length; c++) {
    
                        string_element_code = string_element_code + "[" + data[a]["elements"][b]['notes'][c] + "]";
                    }
    
                  }
                   
                
                 elements.push(string_element_code)
     
     
             }
             
            
    
             elements_definations.push({"rep_jump":data[a]["rep_jump"],"elements":elements});
         }
     
        
        
        
        if(this.comparision_array.length>=2)
        {
            this.comparision_array.splice(0, 1);
            this.comparision_array.push(elements_definations);  
            
        }
        else
        {
            this.comparision_array.push(elements_definations);
        }
    
        //console.log("comariosion length",this.comparision_array.length);
        
        //console.log("comparision array",this.comparision_array)
    
        if(this.comparision_array.length>=2)
        {
            if(rule != 947960017 && rule != 947960018 && rule != 947960019 && rule!=947960000 && rule !=947960001 && rule !=947960002 && rule !=947960003 && rule != 947960004 && rule !=947960005 && rule != 947960006 && rule!= 947960007 && rule!= 947960008 && rule!= 947960009 && rule!= 947960010 && rule != 947960011 && rule != 947960012 && rule!= 947960013 && rule!=947960014 && rule != 947960016 && rule != 947960020 && rule != 947960021 && rule!= 947960022 &&rule != 947960023 && rule != 947960024 && rule != 947960025 && rule!= 947960027 && rule != 947960028 && rule != 947960029 && rule!=947960030) 
            {
                console.log("=========  Started Applying rule (Order -",order,") : ",rule," : (",name,") ==========")
            }
            
    
            for(var a =0;a<this.comparision_array[0].length;a++)
            {
                var changed = false;
    
                // var false_checked = false;
    
                for(var b=0;b<this.comparision_array[0][a]["elements"].length;b++)
                {
                    if(this.comparision_array[0][a]["elements"][b] != this.comparision_array[1][a]["elements"][b])
                    {
                        changed = true;
                        //false_checked = true;
                        
                    }
                }
    
                if(changed == true)
                {
                    console.log("Following index - ",a+1," has changed : ",this.comparision_array[0][a]["elements"].join("+")," To ",this.comparision_array[1][a]["elements"].join("+"));
                }
                
                // if(false_checked == false)
                // {
                //     if(this.comparision_array[0][a]["rep_jump"] != this.comparision_array[1][a]["rep_jump"])
                //     {
                //         console.log("rep factor added index",a+1);
                //         //console.log("Following index - ",a+1," has changed : ",this.comparision_array[0][a]["elements"].join("+")," To ",this.comparision_array[1][a].join("+"));
                //     }
                // }
    
            }
    
            console.log("=========  End of rule : ",rule," ==========")
        }
    
        
        //console.log("elements",JSON.parse(JSON.stringify(this.comparision_array)))
        
     }
    
     // adding protection default flag = false to coming data
    
     protection_flag_insert(data:any)
     {
        for(let a=0;a<data.length;a++)
        {   
            for(let b=0;b<data[a]["elements"].length;b++)
            {
                data[a]["elements"][b]["protection"] = false;
            }
        }
    
        //console.log("data protection",JSON.parse(JSON.stringify(data)));
    
     }
    
     // remove protection flag from object
     protection_flag_remove(data:any)
     {
        for(let a=0;a<data.length;a++)
        {   
            for(let b=0;b<data[a]["elements"].length;b++)
            {
                delete data[a]["elements"][b]["protection"];
                
            }
        }
    
        //console.log("data protection deleted",JSON.parse(JSON.stringify(data)));
    
     }
    
    }
      
      
      