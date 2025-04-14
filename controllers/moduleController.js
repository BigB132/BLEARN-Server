const User = require('../models/User');
const mainData = require('../data/mainModuleData');
const tableData = require('../data/tabellenData');
const lueckentextData = require('../data/luckentextData')

const main = (req, res) => {
    const {id, token, email} = req.body;
    const array = mainData.data.find(item => item.id === id);
    const user = User.findOne({email, token, module: array.module});

    if(!user) return;

    res.json({html: array.html});
}

const tabellen = (req, res) => {
    const {id, token, email} = req.body;
    const array = tableData.ids.find(item => item.id === id);
    const user = User.findOne({email, token, modules: array.module });

    if(!user) return;
    
    res.json({html: array.htmlTable, solution: array.solutions});
};

const lueckentexte = (req, res) => {
    const {id, token, email} = req.body;
    const array = lueckentextData.ids.find(item => item.id === id);
    const user = User.findOne({email, token, modules: array.module});

    if(!user) return;

    res.json({text: array.text, solution: array.solution});
}

module.exports = {
    main,
    tabellen,
    lueckentexte
};