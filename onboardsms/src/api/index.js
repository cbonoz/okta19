
const BASE_URL = 'localhost:5000'
const axios = require('axios')

modules.exports = {
    getGuides: () => axios.get(`${BASE_URL}/guides`),
    



}