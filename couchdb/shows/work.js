function(o, req) {
  // !code lib/mustache.js
  // !code lib/hexapla.js
  // !code lib/path.js
  // !code localization.js
  if (o===null) {
      o={translations:{}};
  }

  function getTextLength() {
    if (o.text)
      return o.text.length;
    for each (version in o.translations)
      return version.text.length;
  }
  function getLines(text,version) {
    var lines=[];
    var line={};
    for (var lineNum in text) {
       if (text[lineNum]) {
         if (line) {
           line.space=lineNum-line.lineNum;
           lines[line.lineNum]=line;
         }
         line={
           text:text[lineNum],
           line:lineNum,
           version:version
         };
       }
    }
    if (line) {
      line.space=lineNum-line.lineNum;
      lines[line.lineNum]=line;
    }
    
  }

  var data = {
    id: o._id,
    work_title: o.title,
    work_creator: o.creator?o.creator:"Anonymus",
    work_language: o.language,
    lines: getTextLength(),
    headers: [],
    units: [],
    raw:[],
    rows:[],
    i18n: localized()
  };
  var hexapla = new Hexapla();
  var edited_versions=req.query.edit ? req.query.edit.split("|") : [];
  var opened_versions=req.query.open ? req.query.open.split("|") : [];
  if (o.text) {
    hexapla.addVersion({
      id: "original",
      text: o.text
    });
    data.raw["original"]=o.text;
    data.headers.push({
      id: "original",
      title: o.title,
      language: o.language,
      date: o.date,
      creativeCommons: o.creativeCommons,
    edited: (edited_versions.indexOf("original")!=-1),
    opened: (opened_versions.indexOf("original")!=-1)
    });
  }
  for (var t in o.translations) {
    var translation = o.translations[t];
    hexapla.addVersion({
      id: t,
      text: translation.text
    });
    data.raw[t]=translation.text;
    data.headers.push({
      id:t,
      title: translation.title,
	  work_creator: translation.creator ? translation.creator : "",
      creator: t,
      language: translation.language,
      date: translation.date,
      creativeCommons: translation.creativeCommons,
	  trad:data.i18n.i_trad,
	  edited: (edited_versions.indexOf(t)!== -1),
	  opened: (opened_versions.indexOf(t)!== -1)
    });
  }
  data.addtrad="Traduction :";
  data.send="Cr&eacute;er";
  data.deleteMsg="Supprimer le texte et toutes ses traductions";
  data.glossaryEntry="Ajouter une entrée du glossaire";
  data.rows=hexapla.getRows();
  data.name="work";
  data.css=true;
  data.script=true;
  data.scripts=["jquery.selection","jquery.highlight"];
  data.language=data.work_language;
  data.prefix="..";
  data.i_edit=data.i18n.i_edit;
  data.i_hide=data.i18n.i_hide;
  data.i_edit_license=data.i18n.i_edit_license;
  data.i_all_rights_reserved=data.i18n.i_all_rights_reserved;
  data.glossary=o.glossary?JSON.stringify(o.glossary):"[]";
 
  return Mustache.to_html(this.templates.work, data, this.templates.partials);
}
