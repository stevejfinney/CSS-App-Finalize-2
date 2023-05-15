const express = require('express');
const app = express();
const jsreport = require('jsreport')()
const http = require('http');

const server = http.createServer(app);

console.log(" ---- JSREPORT_CLI ----",process.env.JSREPORT_CLI);




if (process.env.JSREPORT_CLI) {
  // export jsreport instance to make it possible to use jsreport-cli
  module.exports = jsreport
} else {
  jsreport.init().then(() => {

    console.log(" ^^^^^^^^^^^^^^^^^ js report initialization is done ^^^^^^^^^^^^^")

    // running
  }).catch((e) => {
    // error during startup
    console.error("------------ error during jsinit ----",e.stack)
    
  })
}


app.get('/abc', (req, res) => {

  console.log("------ abc endpoint is called -----")

  res.send({"done":"assa"});

})


app.get('/generate-report', (req, res) => {
  console.log("--------------------")

  jsreport.render({
    template: {
      name: 'reportcard',
      engine: 'handlebars',
      recipe: 'chrome-pdf'
    },
    data: {
      "eventenname": "Generic PcJudge Event",
      "eventlocation": "Orleans, Ontario, Canada",
      "startdate": "2023-03-23T13:28:18.585Z",
      "enddate": "2023-03-25T13:28:18.585Z",
      "discenname": "Star 1",
      "reportLanguage": "EN",
      "logoDataURI": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NDQo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTcuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+DQ0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjAvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQiPg0NCjxzdmcgdmVyc2lvbj0iMS4wIiBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0NCgkgd2lkdGg9Ijc3NC41cHgiIGhlaWdodD0iMzE3LjNweCIgdmlld0JveD0iMCAwIDc3NC41IDMxNy4zIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA3NzQuNSAzMTcuMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQ0KCT4NDQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0NCgkuc3Qwe2ZpbGw6IzAwNDY4Nzt9DQ0KCS5zdDF7ZmlsbDojRjBCNjAwO30NDQo8L3N0eWxlPg0NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00NzMuNCwzMTcuM2MtOC4xLDAtMTItMS41LTE3LjEtNy41Yy0zLjksMS41LTguMiwyLjItMTIuNSwyLjJjLTE0LjcsMC0yOS45LTguNC0yOS45LTI2LjUNDQoJYzAtMTcsMTIuNi0yNy4xLDI5LjktMjcuMWMxNy4zLDAsMjkuOSwxMC4xLDI5LjksMjcuMWMwLDEwLjUtNSwxNy42LTEyLjIsMjEuOWMxLjgsMiw0LDQuMSwxMS45LDQuMVYzMTcuM3ogTTQ0NC42LDI5Mi44DQ0KCWM2LjUsMS4yLDkuOCwzLjQsMTMuMywxMGM1LjctMy4zLDkuNC05LjMsOS40LTE4LjVjMC0xMS40LTguOC0yMC44LTIzLjYtMjAuOGMtMTQuOCwwLTIzLjYsOS40LTIzLjYsMjAuOGMwLDE1LjUsMTEsMjIuMSwyMy42LDIyLjENDQoJYzMuMiwwLDYuMy0wLjQsOS4yLTEuM2MtMi4yLTMuNi00LjEtNS40LTguNC02LjVWMjkyLjh6Ii8+DQ0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTUzNi4zLDI4OS43YzAsMTguNS0xNC40LDIyLjMtMjYuMywyMi4zYy0xMS45LDAtMjYuMy0zLjgtMjYuMy0yMi4zdi0zMGg2LjJ2MzBjMCwxMS43LDcuNSwxNy4xLDIwLjEsMTcuMQ0NCgljMTIuNiwwLDIwLjEtNS4zLDIwLjEtMTcuMXYtMzBoNi4yVjI4OS43eiIvPg0NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NDkuOCwyNTkuN2g0NS41djUuNUg1NTZ2MTYuM2gzMi45djUuNUg1NTZ2MTguM2g0MC4xdjUuNWgtNDYuM1YyNTkuN3oiLz4NDQo8cG9seWdvbiBjbGFzcz0ic3QwIiBwb2ludHM9IjU5MC4zLDI0Ni41IDU3NS4xLDI1NS4zIDU2Ni40LDI1NS4zIDU3Ny42LDI0Ni41ICIvPg0NCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NDkuOCwyNTkuN2g0NS41djUuNUg1NTZ2MTYuM2gzMi45djUuNUg1NTZ2MTguM2g0MC4xdjUuNWgtNDYuM1YyNTkuN3oiLz4NDQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjA0LjQsMjU5LjdINjM0YzUuOCwwLDE5LjgsMCwxOS44LDEzLjNjMCw3LTQuNiw5LjItNy44LDEwLjdjMy4xLDEuMyw5LjUsNC4xLDkuNSwxMi42DQ0KCWMwLDEzLjgtMTQuNCwxNC4zLTI1LDE0LjNoLTI2LjFWMjU5Ljd6IE02MTAuNiwyODEuNGgyMS43YzcuMiwwLDE1LjMtMS4yLDE1LjMtOC40YzAtOC4xLTguMy04LjItMTcuNC04LjJoLTE5LjZWMjgxLjR6DQ0KCSBNNjEwLjYsMzA1LjJoMjMuOWM3LjQsMCwxNC43LTEuMywxNC43LTkuMWMwLTcuMS01LjYtOS42LTE0LTkuNmgtMjQuNlYzMDUuMnoiLz4NDQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjY2LjgsMjU5LjdoNDUuNXY1LjVINjczdjE2LjNoMzIuOXY1LjVINjczdjE4LjNoNDAuMnY1LjVoLTQ2LjNWMjU5Ljd6Ii8+DQ0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTc3NC41LDI5Ny4xYy01LjUsMTAuNi0xNSwxNC44LTI3LjQsMTQuOGMtMTkuOCwwLTI5LjEtMTEuOS0yOS4xLTI2LjdjMC0xNy41LDExLjktMjYuOSwyOS4xLTI2LjkNDQoJYzExLDAsMjIuMSw0LjIsMjYuNywxNC42bC01LjMsMi41Yy0zLjYtOC40LTExLjUtMTEuOS0yMS4zLTExLjljLTE0LjYsMC0yMi44LDcuOS0yMi44LDIyLjVjMCwxMS43LDcuOSwyMC40LDIzLjQsMjAuNA0NCgljMTAuMSwwLDE3LjEtNC4yLDIxLjMtMTJMNzc0LjUsMjk3LjF6Ii8+DQ0KPHBhdGggY2xhc3M9InN0MCIgZD0iTTUxLjYsMjc1LjljMC0xNi40LTE1LjEtMTYuNC0yMy4xLTE2LjRIMHY1MS40aDEyLjZ2LTE4LjdoMTUuOUMzNi41LDI5Mi4yLDUxLjYsMjkyLjIsNTEuNiwyNzUuOXogTTMwLjUsMjgwLjkNDQoJaC0xOHYtMTAuMmgxOGM2LDAsOC41LDAuNyw4LjUsNS4xQzM5LDI4MC4yLDM2LjUsMjgwLjksMzAuNSwyODAuOXogTTgyLjcsMjYwLjRsLTAuNC0wLjlINjkuNWwtMC40LDAuOWwtMjMuOCw0OC4zbC0xLjEsMi4zaDEzLjUNDQoJbDAuNC0wLjlsNC43LTEwLjJoMjUuOGw0LjYsMTAuMmwwLjQsMC45aDEzLjVsLTEuMS0yLjNMODIuNywyNjAuNHogTTY4LjIsMjg4LjZsNy42LTE2LjNsNy42LDE2LjNINjguMnogTTk2LjQsMjcwLjdIMTE4djQwLjJoMTIuNg0NCgl2LTQwLjJoMjEuNnYtMTEuMkg5Ni40VjI3MC43eiBNMTU2LjYsMzEwLjloMTIuNnYtNTEuNGgtMTIuNlYzMTAuOXogTTIyMC4zLDI5MS45TDE5MC44LDI2MGwtMC41LTAuNWgtMTIuMnY1MS40aDEyLjJ2LTMzLjcNDQoJbDMwLjksMzMuMmwwLjUsMC41aDEwLjl2LTUxLjRoLTEyLjJWMjkxLjl6IE0yNzMuMSwyNjAuNGwtMC40LTAuOWgtMTIuN2wtMC40LDAuOWwtMjMuOCw0OC4zbC0xLjEsMi4zaDEzLjVsMC40LTAuOWw0LjctMTAuMmgyNS44DQ0KCWw0LjYsMTAuMmwwLjQsMC45aDEzLjVsLTEuMS0yLjNMMjczLjEsMjYwLjR6IE0yNTguNywyODguNmw3LjYtMTYuM2w3LjYsMTYuM0gyNTguN3ogTTMyMy44LDI5My43SDM0MGMtMi40LDQuNy02LjksNi45LTE0LjQsNi45DQ0KCWMtMTAuMiwwLTE2LjQtNS45LTE2LjQtMTUuN2MwLTMuNiwxLjItMTUuNCwxNy4yLTE1LjRjMTAsMCwxMi4zLDQuOSwxMy40LDcuMmwwLjQsMC45aDEyLjVsLTAuNC0xLjljLTIuMS0xMS0xMi4yLTE3LjUtMjcuMS0xNy41DQ0KCWMtMjEuMSwwLTI4LjYsMTQuNS0yOC42LDI3YzAsMTkuOCwxNC45LDI2LjgsMjguOSwyNi44YzguNSwwLDEzLjctMi42LDE3LjMtNC44bDEuMiwzLjJsMC40LDFoOC40VjI4M2gtMjguOVYyOTMuN3ogTTM3MS40LDI5OS43DQ0KCVYyOTBoMjkuMnYtMTEuMmgtMjkuMnYtOC4xaDMzLjl2LTExLjJoLTQ2LjR2NTEuNEg0MDZ2LTExLjJIMzcxLjR6Ii8+DQ0KPHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSI1OTAuMywyNDYuNSA1NzUuMSwyNTUuMyA1NjYuNCwyNTUuMyA1NzcuNiwyNDYuNSAiLz4NDQo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzgzLjEsNzEuN2MtNTguNSw0NC0xMTYuNCwxMDEuNy0xNjIuNiwxNTRjODEtNzYuMywxNDAuMS0xMjYuMiwxODYuMS0xNTYuOGMtMC42LDAtMS4yLDAtMS45LDANDQoJQzM5Ny45LDY4LjksMzkwLjcsNjkuOCwzODMuMSw3MS43eiBNNTQzLjQsMGMtMzcuNywwLTgxLjEsMTguNS0xMjUuMyw0Ny4xYzQuNy0wLjcsOS40LTEsMTQtMWM0LjEsMCw3LjgsMC40LDExLjIsMQ0NCglDNDY5LDM0LjEsNDkwLjEsMjguNSw1MDksMjguNWM1Ni4yLDAsMjYsOTEuNS00OC43LDE5OC44aDU3QzU3OC43LDE1NS4yLDY0MC44LDAsNTQzLjQsMHoiLz4NDQo8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTc0LjYsMjI2YzcyLjItODEuNiwxNzkuOS0xNzkuOSwyNTcuNS0xNzkuOWM3Ny42LDAsMjguMSwxMjMuNy0yMC43LDE4MS4yaC00NS41DQ0KCWM1OS41LTg1LjYsODMuNi0xNTguNSwzOC44LTE1OC41QzM1OS44LDY4LjksMzAwLjMsMTA3LjcsMTc0LjYsMjI2eiIvPg0NCjwvc3ZnPg0NCg==",
      "revised": false, 
      "gold":[
          {
              "competitorName":"Krishna Patel",
              "competitorLocation":"ON"
          }
      ],
       "silver":[
          {
              "competitorName":"Krishna Patel",
              "competitorLocation":"ON"
          }
      ],
       "bronze":[
          {
              "competitorName":"Krishna Patel",
              "competitorLocation":"ON"
          }
      ],
       "merit":[
          {
              "competitorName":"Krishna Patel",
              "competitorLocation":"ON"
          }
      ]
  }

  }).then((result) => {

    res.contentType('application/pdf');
    console.log("-------------------------------------------------------",result);
    //return result.content
    res.send(result.content);
  }).catch((e) => {
    // error during startup
    console.error("error in rendering",e.stack)
    
  }); 

})

const port = process.env.PORT || 5000;

server.listen(port, () => {

  console.log(`API running on ${process.env.PORT} at ${port}!`)

  

});


