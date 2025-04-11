const User = require('../models/User');
const data = require('../data/tabellenData')

const tabellen = (req, res) => {
    const {id, token, email} = req.body;
    const array = data.ids.find(item => item.module === 'L1');
    const user = User.findOne({email, token, modules: array.module });

    if(!user) return;
    
    res.json({html: array.htmlTable, solution: array.solutions});
};

module.exports = {
    tabellen,
};