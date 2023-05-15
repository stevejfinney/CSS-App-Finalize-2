
const {
    ClientSecretCredential,
    DefaultAzureCredential,
  } = require("@azure/identity");
  

const { StorageSharedKeyCredential,ContainerClient } = require('@azure/storage-blob');

const storageCredentials = new StorageSharedKeyCredential(process.env.AZURE_STORAGE_ACCOUNT_NAME, process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);

const {AzureMediaServices} = require('@azure/arm-mediaservices')


// Acquire credentialconst tokenCredential = new DefaultAzureCredential();

const tokenCredential = new DefaultAzureCredential();


let mediaServicesClient =  new AzureMediaServices(tokenCredential, process.env.AZURE_SUBSCRIPTION_ID)


// fucntion for creating an event
async function create_event(event_name) {
    try {
        
        let event_params = {
            'location':  "Canada Central",
            'description': "Sample Live Event from Node.js SDK sample",
            'encoding':{
                'encodingType':'Standard'
            },
            'input':{
                'streamingProtocol':'RTMP',
                'accessControl':{
                    'ip':{
                        'allow':[
                            {
                                name: "Allow all IPv4 addresses",
                                address: "0.0.0.0",
                                subnetPrefixLength: 0
                            },
                            {
                                name: "Allow all IPv6 addresses",
                                address: "::",
                                subnetPrefixLength: 0
                            }
                        ]
                    }
                }
            },
            preview: {
                'accessControl':{
                    'ip':{
                        'allow':[
                            {
                                name: "Allow all IPv4 addresses",
                                address: "0.0.0.0",
                                subnetPrefixLength: 0
                            },
                            {
                                name: "Allow all IPv6 addresses",
                                address: "::",
                                subnetPrefixLength: 0
                            }
                        ]
                    }
                }
            },
            'useStaticHostname':true,
            'streamOptions':["LowLatency"]
        };
    
        console.log("step 2");
    
        
        let output = await mediaServicesClient.liveEvents.beginCreateAndWait(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME,event_name,event_params,{
            autoStart: false,
            }
        )

        return {"completed":true,"output":output};

    } catch (err) {
      //console.error(JSON.stringify(err));

      //console.log("-------------------",err?.name,err?.statusCode,err?.details)
        
      return {"completed":false,"output":err};
        

    }
  }
  
  
// fucntion for getting all events
async function events_list() {
    try {
        

        const data = await mediaServicesClient.liveEvents.list(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME)

        const new_ouptut = await async_itarator(data)

        console.log("new data after calling function",new_ouptut)


        if(new_ouptut['completed'] == true)
        {
            return {"completed":true,"output":new_ouptut['output']};
        }
        else{
            return {"completed":false,"output":""};
        }

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// fucntion for getting single events
async function get_event(event_name) {
    try {
        

        const data = await mediaServicesClient.liveEvents.get(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME,event_name)

       
        return {"completed":true,"output":data};
        

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// fucntion for starting live events
async function start_event(event_name) {
    try {
        

        const data = await mediaServicesClient.liveEvents.beginStartAndWait(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            event_name
        )

       
        return {"completed":true,"output":data};
        

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// fucntion for stopping live events
async function stop_event(event_name) {
    try {
        

        const data = await mediaServicesClient.liveEvents.beginStopAndWait(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            event_name,
            {
                removeOutputsOnStop:true
            }
    
        )

       
        return {"completed":true,"output":data};
        

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// fucntion for itrating over async iterator
async function async_itarator(data) {
    try {
        
        var all_info = [];

        for await (const each of data) {
            //console.log("assasas",each)
            all_info.push(each);

        }

        //console.log("asd",all_info);


        return {"completed":true,"output":all_info};
    
    } catch (err) {
    
        return {"completed":false,"output":err};
        
    
    }
    }


// fucntion for deleting an event
async function delete_event(event_name) {
try {
    
    const data = await mediaServicesClient.liveEvents.beginDeleteAndWait(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME,event_name)

    console.log("asd",data);



    return {"completed":true,"output":data};

} catch (err) {

    return {"completed":false,"output":err};
    

}
}


// fucntion for creating an asset
async function create_asset(asset_name) {
    try {
        

        const data = await mediaServicesClient.assets.createOrUpdate(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME, asset_name,{});

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// fucntion for getting an asset
async function get_asset(asset_name) {
    try {
        

        const data = await mediaServicesClient.assets.get(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME, asset_name,{});

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// fucntion for access change permission to blob in container
async function setContainerAccessBlob(storageAccountName,container) {
    try {
        
       
        console.log("request coming for change",storageAccountName,container)

        var container_url = "https://" + storageAccountName+ ".blob.core.windows.net/" + container;

        console.log("access change url",container_url)
        
        const containerClient = new ContainerClient(container_url, storageCredentials);

        //console.log("--------",storageCredentials,containerClient)

        //const data = await containerClient.getAccessPolicy()

        const data2 = await containerClient.setAccessPolicy(
            'blob'
        )

        
        return {"completed":true,"output":data2};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}



// fucntion for deleting an asset
async function delete_asset(asset_name) {
    try {
        
        
        const data = await mediaServicesClient.assets.delete(process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME, asset_name,{});

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// fucntion for creating an output
async function create_output(event_name,output_name,asset_name) {
    try {
        
        
        const data = await mediaServicesClient.liveOutputs.beginCreateAndWait(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            event_name,
            output_name,
            {
                assetName: asset_name,
                manifestName: 'vfrt', // The HLS and DASH manifest file name. This is recommended to set if you want a deterministic manifest path up front.
                archiveWindowLength: "PT25H", // sets the asset archive window to 30 minutes. Uses ISO 8601 format string.
    
                hls: {
                    fragmentsPerTsSegment: 1 // Advanced setting when using HLS TS output only.
                },
            }
    
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// fucntion for creating an output
async function get_output() {
    try {
        
        
        const data = await mediaServicesClient.liveOutputs.get(
            process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME,'3bfd15bcc004fbbb392e4fa84baae928','output-20230320-092212',{}
    
        )

        console.log("data here",data);


        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}
  
  
// fucntion for deleting an output
async function delete_output(event_name,output_name) {
    try {
        
        
        const data = await mediaServicesClient.liveOutputs.beginDeleteAndWait(
			process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
			event_name,
			output_name
		)

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// function for creating streaming locators
async function create_locator(asset_name,locator_name) {
    try {
        
        const data = await mediaServicesClient.streamingLocators.create(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            locator_name,
            {
                assetName: asset_name,
                streamingPolicyName: "Predefined_ClearStreamingOnly"  // no DRM or AES128 encryption protection on this asset. Clear means un-encrypted.
            }
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

  
// fucntion for deleting a locator
async function delete_locator(locator_name) {
    try {
        
        
        const data = await mediaServicesClient.streamingLocators.delete(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            locator_name
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}




// function for getting all streaming locators
async function list_locators() {
    try {
        
        
        const data = await mediaServicesClient.streamingLocators.list(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            {}
        )

        const new_ouptut = await async_itarator(data)

        //console.log("new data after calling function",new_ouptut)


        if(new_ouptut['completed'] == true)
        {
            // var locators = [];

            // for await (const each of data) {
            //     //console.log("------------",each);

            //     locators.push([each?.name,each?.startTime,each?.endTime]);  
            // }
            return {"completed":true,"output":new_ouptut['output']};
        }
        else{
            return {"completed":false,"output":""};
        }

        


    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// function for getting all streaming locators
async function get_locator_details(locator_name) {
    try {
        
        
        const data = await mediaServicesClient.streamingLocators.get(
            process.env.AZURE_RESOURCE_GROUP_NAME,process.env.AZURE_ACCOUNT_NAME,
            locator_name,
            {}
        )


        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// function for getting all locator listpaths
async function locator_list_paths(locator_name) {
    try {
        
        
        const data = await mediaServicesClient.streamingLocators.listPaths(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            locator_name,
            {}
        )


        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// function for getting all streaming locators
async function get_streaming_endpoint() {
    try {
        
        
        const data = await mediaServicesClient.streamingEndpoints.get(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            'default',
            {}
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// function for starting streaming endpoint
async function start_streaming_endpoint() {
    try {
        
        const data =  await mediaServicesClient.streamingEndpoints.beginStartAndWait(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            'default'
    
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// function for stopping streaming endpoint
async function stop_streaming_endpoint() {
    try {
        
        const data =  await mediaServicesClient.streamingEndpoints.beginStopAndWait(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            'default'
    
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}

// function for creating job
async function create_job(source_asset,output_asset,start_time,end_time,job_name) {
    try {
        
        

        // var values = date_time_format();

        // const job_name =  process.env.AZURE_TRANSFORM_NAME + "_Job_" + values['date'] +"-"+values["time"]

        console.log("----------",job_name,source_asset,output_asset,Math.floor(start_time),Math.ceil(end_time))

        const data =  await mediaServicesClient.jobs.create(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            process.env.AZURE_TRANSFORM_NAME,
            job_name,
            {
                input: {
                    odataType: "#Microsoft.Media.JobInputAsset",
                    assetName: source_asset,
                    start:{
                        odataType: "#Microsoft.Media.AbsoluteClipTime",
                        time:"PT"+ Math.floor(start_time) +"S"
                    },
                    end:{
                        odataType: "#Microsoft.Media.AbsoluteClipTime",
                        time:"PT"+ Math.ceil(end_time) +"S"
                    },
                    // end:"PT80S"
                  },

                  outputs: [
                    {
                      odataType: "#Microsoft.Media.JobOutputAsset",
                      assetName: output_asset
                    },
                  ],
            },
    
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// function for getting job

async function get_job(job_name) {
    try {
        
        
        const data = await mediaServicesClient.jobs.get(
            process.env.AZURE_RESOURCE_GROUP_NAME,
            process.env.AZURE_ACCOUNT_NAME,
            process.env.AZURE_TRANSFORM_NAME,
            job_name,
            {}
        )

        return {"completed":true,"output":data};

    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


// function for progress check after job is created

async function job_progress_check(job_name) {
    try {
        
        
        var data = await get_job(job_name);
        var check = true;
        
        console.log("progree check",data['output']['state'],data['output']['outputs'],data['output']['outputs'][0]['state']);
        
        
        while (check == true) {

            console.log(`Job state: ${data['output'].state}`);

            if(data['output'].state == "Finished" || data['output'].state == "Error" || data['output'].state == "Canceled")
            {
                check = false;
                console.log("database should do something")

                return {"completed":true,"output":data['output']};
            }
            else
            {
                await new Promise(resolve => setTimeout(resolve, 5000));
                console.log('step 1');
    
                data = await get_job(job_name);
                console.log('step 2');
                
            }
            
            
            
          }
          
    } catch (err) {

        return {"completed":false,"output":err};
        

    }
}


var date_time_format = exports.date_time_format = () => {
    const now = new Date();

    // format date as YYYYMMDD
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // format time as HHMMSS
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}${minutes}${seconds}`;

    return {"date":dateStr,"time":timeStr};
}


module.exports.create_event = create_event;
module.exports.events_list = events_list;
module.exports.delete_event = delete_event;
module.exports.create_asset = create_asset;
module.exports.delete_asset = delete_asset;
module.exports.get_asset = get_asset;
module.exports.create_output = create_output;
module.exports.delete_output = delete_output;
module.exports.create_locator = create_locator;
module.exports.delete_locator = delete_locator;
module.exports.list_locators = list_locators;
module.exports.get_streaming_endpoint = get_streaming_endpoint;
module.exports.get_locator_details= get_locator_details;
module.exports.locator_list_paths = locator_list_paths;
module.exports.get_event = get_event;
module.exports.start_event = start_event;
module.exports.stop_event = stop_event;
module.exports.start_streaming_endpoint = start_streaming_endpoint;
module.exports.stop_streaming_endpoint = stop_streaming_endpoint;
module.exports.get_output = get_output;
module.exports.get_job= get_job;
module.exports.create_job = create_job;
module.exports.setContainerAccessBlob = setContainerAccessBlob;
module.exports.job_progress_check = job_progress_check;