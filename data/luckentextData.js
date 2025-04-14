const lueckentextData = {
    ids: [
        {
            id: '0001',
            module: 'L1',
            text: [
                { "type": "text", "content": "Das Subjekt ist ein " },
                { "type": "gap", "id": "gap1", "options": ["Subjekt", "Nominativ", "Akkusativobjekt"] },
                { "type": "text", "content": ". Man nutzt es um anzugeben " },
                { "type": "gap", "id": "gap2", "options": ["Wer oder Was etwas tut", "Was geschieht", "Was die Folgen sind"] },
                { "type": "text", "content": ". Ein weiteres Satzglied ist das " },
                { "type": "gap", "id": "gap3", "options": ["Genus", "Makulinum", "Prädikat"]},
                { "type": "text", "content": "."}
            ],
            solution: "{\"gap1\":\"Subjekt\",\"gap2\":\"Wer oder Was etwas tut\",\"gap3\":\"Prädikat\"}"
        },
        
    ]
}

module.exports = lueckentextData