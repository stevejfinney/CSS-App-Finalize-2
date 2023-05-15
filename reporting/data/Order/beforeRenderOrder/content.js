
trustUserCode=true;
// Use the "beforeRender" or "afterRender" hook
// to manipulate and control the report generation

const axios = require('axios');
async function beforeRender (req, res) {
   const r = await axios.get('http://localhost:3000/api/reports/getstartingorderdata/20609501-fa39-4ba7-b8a1-1393ce0c5ce4');
    req.data = { ...req.data, ...r.data};
}