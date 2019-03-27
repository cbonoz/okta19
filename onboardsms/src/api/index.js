
const BASE_URL = 'localhost:5000'
const GUIDE_URL = `${BASE_URL}/guides`
const axios = require('axios')

modules.exports = {
    getGuides: () => axios.get(GUIDE_URL),
    createGuide: (guide) => axios.post(GUIDE_URL, guide),
    getGuidesByAuthor: (author) => axios.get(`${GUIDE_URL}/${author}`),
    deleteGuideByName: (name) => axios.delete(`${GUIDE_URL}/${name}`),
}