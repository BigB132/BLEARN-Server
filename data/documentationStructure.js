const documentationData = {
    categories: [
      {
        id: 'deutsch',
        name: 'Deutsch',
        subcategories: [
          {
            id: 'DGe',
            name: 'Berichten & Argumentieren',
            chapters: [
              { id: 'bericht-verfassen', name: 'Einen Bericht verfassen' },
              { id: 'brief-schreiben', name: 'Ein Brief schreiben' },
              { id: 'wegbeschreibung-schreiben', name: 'Eine Wegbeschreibung schreiben' },
              { id: 'meinung-begründen', name: 'Meinungen Begründen'}
            ]
          },
          {
            id: 'spannend-erzaehlen',
            name: 'Spannend Erzählen',
            chapters: [
              { id: 'aufbau-einer-erzählung', name: 'Aufbau einer spannenden Erzählung' },
              { id: 'spannende-einleitung-schreiben', name: 'Eine spannende Einleitung schreiben' },
              { id: 'hauptteil-schreiben', name: 'Den Hauptteil schreiben'},
              { id: 'spannenden-schluss-schreiben', name: 'Einen guten Schlussteil schreiben'},
              { id: 'tipps-für-eine-spannende-erzählung', name: 'Weitere wichtige Tipps'}
            ]
          }
        ]
      },
      {
        id: 'latein',
        name: 'Latein',
        subcategories: [
          {
            id: 'L1',
            name: 'Einführung',
            chapters: [
              { id: 'l1.1', name: 'Satzglieder, Wortarten, Formen' },
              { id: 'l1.2', name: 'Akkusative und Deklinationen' },
              { id: 'l1.3', name: 'Das Genus' },
              { id: 'l1.4', name: 'Konjugieren'}
            ]
          },
        ]
      },
    ]
  };
  
  module.exports = documentationData;