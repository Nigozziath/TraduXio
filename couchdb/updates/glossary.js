function (work, req) {
  try {
    if (!work) {
      throw {code:404,message:"not found"};
    }

    function languageOK(language) {
      if (language.length!=2) {
        throw {code:400,message:"language must be 2 characters long"};
      }
    }

    function validate() {
      if (["DELETE","PUT"].indexOf(req.method) == -1) {
        throw {code:405,message:"method not allowed "+req.method};
      }
      with (req.query) {
        if (src_language && src_sentence && target_language) {
          if (req.method=="PUT") {
            languageOK(src_language);
            languageOK(target_language);
            if (src_sentence.length <1 || src_sentence.length>50) {
              throw {code:400,message:"sentence must be between 1 and 50 characters"};
            }
            if (req.body==="undefined" && req.body.length>1) {
              throw {code:400,message:"You must provide a translation"};
            }
          }
        }
      }
    }

    function addEntry(src_language,src_sentence,target_language,target_sentence) {
      work.glossary[src_language]=
          work.glossary[src_language] || {};
      work.glossary[src_language][src_sentence]=
          work.glossary[src_language][src_sentence] || {};
      var old="";
      if (work.glossary[src_language][src_sentence][target_language]) {
        old=work.glossary[src_language][src_sentence][target_language];
      }
      if (old!=target_sentence) {
        work.glossary[src_language][src_sentence][target_language]=target_sentence;
      } else {
        throw {code:201,message:"not modified"};
      }
      return old;
    }

    function delEntry(src_language,src_sentence,target_language) {
      if (work.glossary && work.glossary[src_language] &&
          work.glossary[src_language][src_sentence] && work.glossary[src_language][src_sentence][target_language]) {
        var old=work.glossary[src_language][src_sentence][target_language];
        delete work.glossary[src_language][src_sentence][target_language];
        if (!Object.keys(work.glossary[src_language][src_sentence]).length) delete work.glossary[src_language][src_sentence];
        return old;
      } else {
        throw {code:404,message:"was not in the glossary"};
      }
    }

    //temporarily convert old glossary format into new one
    if (work.glossary && work.glossary.forEach) {
      work.glossary_old=work.glossary;
      work.glossary={};
      work.glossary_old.forEach(function(glossaryEntry) {
        with (glossaryEntry) {
          addEntry (src_language,src_sentence,target_language,target_sentence);
        }
      });
    }

    validate();
    with (req.query) {
      var r={ok:"OK"};
      switch(req.method) {
        case "PUT":
          var b=addEntry (src_language,src_sentence,target_language,req.body);
          break;
        case "DELETE":
          var b=delEntry(src_language,src_sentence,target_language);
          break;
      }
      if (b) r.old=b;
      return [work,JSON.stringify(r)];
    }
  } catch (e) {
    var r={};
    r.code=e.code || 500;
    var b={};
    if (r.code>=400)
      b.error=e.message || e;
    else
      b.ok=e.message || e;
    r.body=JSON.stringify(b);
    return [null,r];
  }
}
