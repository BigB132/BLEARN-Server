const lueckentextData = {
    ids: [
        {
            id: '0001',
            module: 'L1',
            text: [
                { "type": "text", "content": "Die " },
                { "type": "gap", "id": "gap1", "options": ["Katze", "Hund", "Maus"] },
                { "type": "text", "content": " trinkt " },
                { "type": "gap", "id": "gap2", "options": ["Milch", "Wasser", "Saft"] },
                { "type": "text", "content": "." }
            ],
            solution: "{\"gap1\":\"Katze\",\"gap2\":\"Milch\"}"
        },
        
    ]
}

module.exports = lueckentextData