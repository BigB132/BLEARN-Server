const tabellen = {
    ids:[
        {
            id: '0001',
            module: 'L1',
            htmlTable: '<table><tr><th>Numerus</th><th>Kasus</th><th>m.</th><th>f.</th><th>n.</th></tr><tr><th>Singular</th><th>Nominativ</th><td><input type="text" id="SgNoM" /></td><td><input type="text" id="SgNoF" /></td><td><input type="text" id="SgNoN" /></td></tr><tr><th>Singular</th><th>Genitiv</th><td><input type="text" id="SgGeM" /></td><td><input type="text" id="SgGeF" /></td><td><input type="text" id="SgGeN" /></td></tr><tr><th>Singular</th><th>Dativ</th><td><input type="text" id="SgDaM" /></td><td><input type="text" id="SgDaF" /></td><td><input type="text" id="SgDaN" /></td></tr><tr><th>Singular</th><th>Akkusativ</th><td><input type="text" id="SgAkM" /></td><td><input type="text" id="SgAkF" /></td><td><input type="text" id="SgAkN" /></td></tr><tr><th>Singular</th><th>Ablativ</th><td><input type="text" id="SgAbM" /></td><td><input type="text" id="SgAbF" /></td><td><input type="text" id="SgAbN" /></td></tr><tr><th>Plural</th><th>Nominativ</th><td><input type="text" id="PlNoM" /></td><td><input type="text" id="PlNoF" /></td><td><input type="text" id="PlNoN" /></td></tr><tr><th>Plural</th><th>Genitiv</th><td><input type="text" id="PlGeM" /></td><td><input type="text" id="PlGeF" /></td><td><input type="text" id="PlGeN" /></td></tr><tr><th>Plural</th><th>Dativ</th><td><input type="text" id="PlDaM" /></td><td><input type="text" id="PlDaF" /></td><td><input type="text" id="PlDaN" /></td></tr><tr><th>Plural</th><th>Akkusativ</th><td><input type="text" id="PlAkM" /></td><td><input type="text" id="PlAkF" /></td><td><input type="text" id="PlAkN" /></td></tr><tr><th>Plural</th><th>Ablativ</th><td><input type="text" id="PlAbM" /></td><td><input type="text" id="PlAbF" /></td><td><input type="text" id="PlAbN" /></td></tr></table>',
            solutions: `
                {SgNoM: "hic",
                SgNoF: "haec",
                SgNoN: "hoc",
                SgGeM: "huius",
                SgGeF: "huius",
                SgGeN: "huius",
                SgDaM: "huic",
                SgDaF: "huic",
                SgDaN: "huic",
                SgAkM: "hunc",
                SgAkF: "hanc",
                SgAkN: "hoc",
                SgAbM: "hoc",
                SgAbF: "hac",
                SgAbN: "hoc",

                PlNoM: "hi",
                PlNoF: "hae",
                PlNoN: "haec",
                PlGeM: "horum",
                PlGeF: "harum",
                PlGeN: "horum",
                PlDaM: "his",
                PlDaF: "his",
                PlDaN: "his",
                PlAkM: "hos",
                PlAkF: "has",
                PlAkN: "haec",
                PlAbM: "his",
                PlAbF: "his",
                PlAbN: "his"}
        `
        },
        {
            id: '0002',
            module: 'L1',
            htmlTable: `
            <h1>Formen der 3. Person Singular Präsens konjugieren</h1>
    <p>
      Fülle die Tabelle mit den Wörtern "rogare", "videre", "audire" und "quaerere".
    </p>
    <table>
      <tbody>
        <tr>
          <th></th>
          <th>a-Konj.</th>
          <th>e-Konj.</th>
          <th>i-Konj.</th>
          <th>kons.-Konj.</th>
        </tr>
        <tr>
          <th>3. Person Singular Präsens</th>
          <td><input type="text" id="1" /></td>
          <td><input type="text" id="2" /></td>
          <td><input type="text" id="3" /></td>
          <td><input type="text" id="4" /></td>
        </tr>
      </tbody>
    </table>`,
            solutions: `
                {1: "rogat",
                2: "videt",
                3: "audit",
                4: "quaerit"}
        `
        }
    ]
};

module.exports = tabellen;