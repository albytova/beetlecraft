$(document).on('click', '#draftA', function () {
    document.getElementById("draftTab").style.display = "block";
    document.getElementById("bottleTab").style.display = "none";
    document.getElementById("contactTab").style.display = "none";
    document.getElementById("foodTab").style.display = "none";
    document.getElementById("korzinaTab").style.display = "none";    
});

$(document).on('click', '#bottleA', function () {
    document.getElementById("draftTab").style.display = "none";
    document.getElementById("bottleTab").style.display = "block";
    document.getElementById("contactTab").style.display = "none";
    document.getElementById("foodTab").style.display = "none";    
    document.getElementById("korzinaTab").style.display = "none";    
});

$(document).on('click', '#contactA', function () {
    document.getElementById("draftTab").style.display = "none";
    document.getElementById("bottleTab").style.display = "none";
    document.getElementById("contactTab").style.display = "block";
    document.getElementById("foodTab").style.display = "none";    
    document.getElementById("korzinaTab").style.display = "none";    
});

$(document).on('click', '#foodA', function () {
    document.getElementById("draftTab").style.display = "none";
    document.getElementById("bottleTab").style.display = "none";
    document.getElementById("contactTab").style.display = "none";
    document.getElementById("foodTab").style.display = "block"; 
    document.getElementById("korzinaTab").style.display = "none";
});

$(document).on('click', '#korzinaA', function () {
    document.getElementById("draftTab").style.display = "none";
    document.getElementById("bottleTab").style.display = "none";
    document.getElementById("contactTab").style.display = "none";
    document.getElementById("foodTab").style.display = "none";   
    document.getElementById("korzinaTab").style.display = "block"; 
});

var 
  DraftDataAll,
  DraftDataFilter = [],
  BottleDataAll,
  BottleDataFilter = [],
  Foods = {},
  currentClick = {
    bottle: null,
    draft: null
  },
  korzina = {
    draft: {},
    bottle: {},
    food: {},
    summa: 0
  };

function init () { 
    getDraftGoogle();
    getBottleGoogle();
    getFoodGoogle();
}

function getDraftGoogle () {    
    var 
        result = [],
        filters = [];

    $.ajax({
     url : "getgoogle.php",
     type : 'POST',
     data: { 
      query: "getDraft"
    },
     success : function (res) {  

          var 
            data = JSON.parse(res);

            for (var i = 0; i < data.length; i++) {
                if (data[i][1].length == 0)
                  continue;

                var obj = getFormatDraftRow(data[i]);

                result.push(obj);

                if (filters.indexOf(obj.filter_names[0]) == -1)
                    filters.push(obj.filter_names[0]);
                if (obj.filter_names[1] && filters.indexOf(obj.filter_names[1]) == -1)
                    filters.push(obj.filter_names[1]);
                if (obj.filter_names[2] && filters.indexOf(obj.filter_names[2]) == -1)
                    filters.push(obj.filter_names[2]);
            } 

            showDraft({
                draftData: result,
                filters: filters,
                filters_choose: filters
            });  
       },
       error : function () {
          console.log ('error');
       }
   });
}


function getFormatDraftRow(data) {

  var TYPES = [
      "0,5л",
      "1л",
      "1,5л"
    ],
    obj = {
          NUM_TAP: data[0],
          brewery_name: data[1],
          id_brewery: null,
          id: data[0],
          beer_id: null,
          name: data[2],
          name_text: null,
          style: data[3],
          abv: data[7],
          ibu: +data[8],
          filter_names: [data[4]],
          untuppd: null
      };
    
    if (!!data[5])
        obj.filter_names.push(data[5]);

    if (!!data[6])
        obj.filter_names.push(data[6]);

    obj.name_text = getDraftRowText(obj);
              //obj.id_filter = _FILTERS[obj.filter_name];

    var type_rub = device.mobile()? "р" : " руб.";
        obj[ TYPES[0] ] = data[10] + type_rub;
        obj[ TYPES[1] ] = data[11] + type_rub;
        obj[ TYPES[2] ] = data[12] + type_rub;
        obj[ "info-"+TYPES[0] ] = {cost: data[10], cost_id: 0};
        obj[ "info-"+TYPES[1] ] = {cost: data[11], cost_id: 1};
        obj[ "info-"+TYPES[2] ] = {cost: data[12], cost_id: 2};
        obj[ "type-cost-"+TYPES[0] ] = TYPES[0];
        obj[ "type-cost-"+TYPES[1] ] = TYPES[1];
        obj[ "type-cost-"+TYPES[2] ] = TYPES[2];

  return obj;
} 

function getDraftRowText (obj) {

  var text =  "";

  if (device.mobile()) {
    
    text = "<table width=\"100%\" cellspacing=\"0\"><tr>"+
      "<td rowspan=\"4\" align=\"center\" width=\"45px\" style=\"border-right:1px solid grey;\"><span class=\"draft-numtap\">"+ obj.NUM_TAP +"</span></td>"+
      "<td colspan=\"2\"><span class=\"draft-name\" >" + obj.name + "</span></td>"+
    "</tr>"+
    "<tr>"+
      "<td><span class=\"draft-style\">[" + obj.style + "]</span></td>"+
      "<td width=\"80px\"><span class=\"draft-typecost-mbl\">0,5л: </span><span>" + obj["0,5л"] + "</span></td>"+ //в универсальной модели переделать
    "</tr>"+
    "<tr>"+
      "<td><span class=\"draft-brewery\" onclick=\"filterDraftByBrewery('"+ obj.brewery_name +"')\" >"+ obj.brewery_name +"</span></td>"+
      "<td><span class=\"draft-typecost-mbl\">1,0л: </span><span>" + obj["1л"] + "</span></td>"+
    "</tr>"+
    "<tr>"+
      "<td><span class=\"draft-abv\">"+ (obj.abv.length > 0? "abv " + obj.abv + "%" : "") + 
                  (obj.abv.length > 0 && obj.ibu > 0? " | " : "") + 
                  (obj.ibu > 0? "ibu " + obj.ibu : "") + "</span></td>"+      
      "<td><span class=\"draft-typecost-mbl\">1,5л: </span><span>" + obj["1,5л"] + "</span></td>"+
    "</tr></table>";
  } 
  else { 
    text = "<table><tr>"+
              "<td rowspan=\"2\"><span class=\"draft-numtap\">"+ obj.NUM_TAP +"</span></td>"+
              "<td colspan=\"2\" width=\"100%\"><span class=\"draft-name\">" + obj.name + "</span>" +
                "<span class=\"draft-style\">  [" + 
                obj.style + "]</span>"+
            "</td>"+
          "</tr><tr>"+
              "<td width=\"70%\"><span class=\"draft-abv\">" + 
              (obj.abv.length > 0? "abv " + obj.abv + "%" : "") + 
            (obj.abv.length > 0 && obj.ibu > 0? " | " : "") +  
              (obj.ibu > 0? "ibu " + obj.ibu : "") + 
            "</span></td>"+
              "<td align=\"left\"><span class=\"draft-brewery\" onclick=\"filterDraftByBrewery('"+ obj.brewery_name +"')\" >"+ obj.brewery_name +"</span></td>"+
          "</tr></table>";
  }
  return text;
}

function filterDraftByBrewery(brewery) {
  $("#btn-draft-brewery").show();	
	$("#spn-draft-brewery").html(brewery);
	document.getElementById("btn-draft-brewery").style.display = "block";

  filterDraft();
}

function cancelFilterDraftByBrewery() {
  $("#btn-draft-brewery").hide();	
  $("#spn-draft-brewery").html("");
  document.getElementById("btn-draft-brewery").style.display = "none";

  filterDraft(true);
}

function showDraft (data) {  
  if (!data) return;

  var 
    draftData = data.draftData,
    filters = data.filters,
    filters_choose = data.filters_choose;

  var fields = [
            { name: "name_text", title: "", type: "text", width: "100%" }
    ];

    $("#btn-draft-brewery").hide();

    if (draftData && draftData.length > 0) {
      
      for (var key in draftData[0]) {
        if (key.indexOf("type-cost") > -1) { 
            if (!device.mobile()) {
              fields.push({ name: key, type: "text", align: "center", width: 20, title: "" });

              var type = draftData[0][key];
              for (var key2 in draftData[0]) {
                if (key2.indexOf(type) > -1) {
                  fields.push({ name: key2, title: "Цена/" + key2, type: "text", align: "center" });
                  fields.push({ name: "btns-"+key, type: "text", align: "center", title: "", width: 35 });
                  break;
                }   
              }
          }
        }     
      }
    }

    showDraftFilters(filters, filters_choose);

    for (var i = 0; i < draftData.length; i++) {
      var name_text = getDraftRowText(draftData[i]);
        for (var key in draftData[i]) {
          if (key.indexOf("type-cost") > -1) {
            draftData[i][key] = "<div class=\"tdTypeCost rotate\">"+ draftData[i][key] + "</div>";
            draftData[i]["btns-"+key] = "<div class=\"tdBtns\"></div>";
          }
        } 
      draftData[i].name_text = name_text;
    }

  $("#draftGrid").jsGrid({
    width: "100%",
        sorting: true,
        noDataContent: "Нет данных",
        data: draftData, 
        fields: fields,
        heading: false,
        // rowClick: function(item) {
        //   if (currentClick.draft && (currentClick.draft.item.id == item.item.id)) {
        //     return;
        //   }

        //   var data = item.item;
        //   for (var key in data) {
        //     if (key.indexOf("btns-") > -1) {
        //       item.item[key] = "<div class=\"tdBtns\"><button type=\"button\" class=\"btn btn-success\" onclick=adddrafttokorzina(\""+ key +"\")><i class=\"fa fa-plus\" aria-hidden=\"true\"></i></button><br>"+
        //                    "<button type=\"button\" class=\"btn btn-danger\" onclick=deldraftfromkorzina(\""+ key +"\")><i class=\"fa fa-minus\" aria-hidden=\"true\"></i></button></div>";
        //     }
        //   }
        //   if (currentClick.draft) {
        //     for (var key in currentClick.draft.item) {
        //       if (key.indexOf("btns-") > -1) {
        //         currentClick.draft.item[key] = "<div class=\"tdBtns\"></div>";
        //       }
        //     }
        //   }
        //   // item.item.btns = 
        //   //   "<button type=\"button\" class=\"btn btn-success\" ><i class=\"fa fa-plus\" aria-hidden=\"true\"></i></button>  <button type=\"button\" onclick=delbottlefromkorzina() class=\"btn btn-danger\"><i class=\"fa fa-minus\" aria-hidden=\"true\"></i></button>";
        //   $("#draftGrid").jsGrid("refresh");
        //   currentClick.draft = item;
        // } 
    });

    DraftDataAll = draftData;
}

/* нажатие на добавление розлива в корзину */
function adddrafttokorzina(keyname) {
  if (!currentClick.draft)
    return;
  var 
    item = currentClick.draft,
    typecost = keyname.replace("btns-type-cost-", ""),
    cost = item.item["info-"+typecost]["cost"],
    cost = +(cost),
    id = item.item["id"];

    if (!korzina.draft[ id ])
      korzina.draft[ id ] = {};
    
    if (!korzina.draft[ id ][typecost]) {
      korzina.draft[ id ][typecost]= 1;
    }
    else
      korzina.draft[ id ][typecost] = korzina.draft[ id ][typecost] + 1;

    item.item[typecost] = "<b>" + cost + " руб.</b><br><font color=\"green\" size=1>[в корзине: "+ korzina.draft[ id ][typecost] + " шт]</font>";
    $("#draftGrid").jsGrid("refresh");

    korzina.summa += cost;
    $("#korzinaSum").html(": " + korzina.summa + " руб");
}

/* нажатие на удаление розлива из корзины */
function deldraftfromkorzina(keyname) {
  if (!currentClick.draft)
    return;

  var 
    item = currentClick.draft,
    typecost = keyname.replace("btns-type-cost-", ""),
    cost = item.item["info-"+typecost]["cost"],
    cost = +(cost),
    id = item.item["id"];

    if (!korzina.draft[ id ] || !korzina.draft[ id ][typecost] || korzina.draft[ id ][typecost] == 0 )
      return;
    
    korzina.draft[ id ][typecost] = korzina.draft[ id ][typecost] - 1;

    if (korzina.draft[ id ][typecost] == 0)
      item.item[typecost] = cost + " руб.";
    else
      item.item[typecost] = "<b>" + cost + " руб.</b><br><font color=\"green\" size=1>[в корзине: "+ korzina.draft[ id ][typecost] + " шт]</font>";
    $("#draftGrid").jsGrid("refresh");

    korzina.summa -= cost;
    if (korzina.summa == 0)
      $("#korzinaSum").html("");
    else
      $("#korzinaSum").html(": " + korzina.summa + " руб");
}

function setVisibleFilterBtn (filters, filters_choose, text, name) {
  if (filters.indexOf(text) == -1)
    $("[name="+name+"]").hide();
  else {
    if (!$("[name="+name+"]").is(':visible'))
      $("[name="+name+"]").show();   
  } 
}

function showDraftFilters (filters, filters_choose) {
  if (!filters)
    return;

    setVisibleFilterBtn (filters, filters_choose, "APA/IPA/DIPA", "btn-draft-ipa");
    setVisibleFilterBtn (filters, filters_choose, "стаут/портер", "btn-draft-stout");
    setVisibleFilterBtn (filters, filters_choose, "крепче 10%", "btn-draft-hard");
    setVisibleFilterBtn (filters, filters_choose, "фруктовое/ягодное", "btn-draft-fruit");
    setVisibleFilterBtn (filters, filters_choose, "классика", "btn-draft-classic");
    setVisibleFilterBtn (filters, filters_choose, "сидр", "btn-draft-cider");
    setVisibleFilterBtn (filters, filters_choose, "особое", "btn-draft-other");
    setVisibleFilterBtn (filters, filters_choose, "sour ale/gose", "btn-draft-sour");
    setVisibleFilterBtn (filters, filters_choose, "пшеничное", "btn-draft-weizen");
    setVisibleFilterBtn (filters, filters_choose, "томатное/суп", "btn-draft-tomato");
    setVisibleFilterBtn (filters, filters_choose, "медовуха", "btn-draft-mead");
    setVisibleFilterBtn (filters, filters_choose, "иностранное", "btn-draft-inostr");
    setVisibleFilterBtn (filters, filters_choose, "смузи", "btn-draft-smoothie");
    setVisibleFilterBtn (filters, filters_choose, "безалкогольное", "btn-draft-notalko");
    setVisibleFilterBtn (filters, filters_choose, "бельгия", "btn-draft-belgia");
    setVisibleFilterBtn (filters, filters_choose, "wild ale", "btn-draft-wild");
    setVisibleFilterBtn (filters, filters_choose, "европейская классика", "btn-draft-europa");
    setVisibleFilterBtn (filters, filters_choose, "исторические", "btn-draft-history");
    setVisibleFilterBtn (filters, filters_choose, "лимонад", "btn-draft-limonad");

}

function clickByFilterDraftBtn (btn) { 
  btn = $(btn);
  var text = btn[0].textContent;
  text = text.replace('✔', '').trim();

  if (btn.hasClass("btn-success")) {
    btn.removeClass("btn-success");
    btn.addClass("btn-default");
  }
  else {
    btn.removeClass("btn-default");
    btn.addClass("btn-success");
  }

  filterDraft();
}

function getFiltersChooseDraft () {
  var 
    filters_choose = [];

    if ($("[name=btn-draft-ipa]").is(':visible') & $("[name=btn-draft-ipa]").hasClass("btn-success"))
        filters_choose.push("APA/IPA/DIPA");
    if ($("[name=btn-draft-stout]").is(':visible') & $("[name=btn-draft-stout]").hasClass("btn-success"))
        filters_choose.push("стаут/портер");
    if ($("[name=btn-draft-hard]").is(':visible') & $("[name=btn-draft-hard]").hasClass("btn-success"))
        filters_choose.push("крепче 10%");
    if ($("[name=btn-draft-fruit]").is(':visible') & $("[name=btn-draft-fruit]").hasClass("btn-success"))
        filters_choose.push("фруктовое/ягодное");
    if ($("[name=btn-draft-classic]").is(':visible') & $("[name=btn-draft-classic]").hasClass("btn-success"))
        filters_choose.push("классика");
    if ($("[name=btn-draft-cider]").is(':visible') & $("[name=btn-draft-cider]").hasClass("btn-success"))
        filters_choose.push("сидр");
    if ($("[name=btn-draft-sour]").is(':visible') & $("[name=btn-draft-sour]").hasClass("btn-success"))
        filters_choose.push("sour ale/gose");
    if ($("[name=btn-draft-other]").is(':visible') & $("[name=btn-draft-other]").hasClass("btn-success"))
        filters_choose.push("особое");
    if ($("[name=btn-draft-weizen]").is(':visible') & $("[name=btn-draft-weizen]").hasClass("btn-success"))
        filters_choose.push("пшеничное");
    if ($("[name=btn-draft-tomato]").is(':visible') & $("[name=btn-draft-tomato]").hasClass("btn-success"))
        filters_choose.push("томатное/суп");
    if ($("[name=btn-draft-mead]").is(':visible') & $("[name=btn-draft-mead]").hasClass("btn-success"))
        filters_choose.push("медовуха");
    if ($("[name=btn-draft-inostr]").is(':visible') & $("[name=btn-draft-inostr]").hasClass("btn-success"))
        filters_choose.push("иностранное");
    if ($("[name=btn-draft-smoothie]").is(':visible') & $("[name=btn-draft-smoothie]").hasClass("btn-success"))
        filters_choose.push("смузи");
    if ($("[name=btn-draft-notalko]").is(':visible') & $("[name=btn-draft-notalko]").hasClass("btn-success"))
        filters_choose.push("безалкогольное");
    if ($("[name=btn-draft-belgia]").is(':visible') & $("[name=btn-draft-belgia]").hasClass("btn-success"))
        filters_choose.push("бельгия");
    if ($("[name=btn-draft-wild]").is(':visible') & $("[name=btn-draft-wild]").hasClass("btn-success"))
        filters_choose.push("wild ale");
    if ($("[name=btn-draft-europa]").is(':visible') & $("[name=btn-draft-europa]").hasClass("btn-success"))
        filters_choose.push("европейская классика");
    if ($("[name=btn-draft-history]").is(':visible') & $("[name=btn-draft-history]").hasClass("btn-success"))
        filters_choose.push("исторические");
    if ($("[name=btn-draft-limonad]").is(':visible') & $("[name=btn-draft-limonad]").hasClass("btn-success"))
        filters_choose.push("лимонад");

    return filters_choose;
}

function filterDraft (isclearfilterbrewery) {
  var 
    draftData = DraftDataAll, //todo добавить анализ инпута
    filters_choose = getFiltersChooseDraft(),
    filterData = [],
    brewery = isclearfilterbrewery? null : $("#spn-draft-brewery").html();

  for (var i = 0; i < draftData.length; i++) {

    if (filters_choose.indexOf(draftData[i].filter_names[0]) > -1 || filters_choose.indexOf(draftData[i].filter_names[1]) > -1 || filters_choose.indexOf(draftData[i].filter_names[2]) > -1) {
    	if (brewery) {
    		if (brewery == draftData[i].brewery_name) {
    			filterData.push(draftData[i]);
    		}
    	}
    	else {
      		filterData.push(draftData[i]);
    	}
    }
    else if (filters_choose.length == 0 && brewery) { 
    	if (brewery == draftData[i].brewery_name) {
    		filterData.push(draftData[i]);    		
    	}
    }
  }

  DraftDataFilter = filterData.length > 0? filterData : DraftDataAll;

  var valueInput = $("#inputSearchDraft").val();
  if (valueInput.length > 0) {
    searchDraft(valueInput, DraftDataFilter);
  }
  else {
    $("#draftGrid").jsGrid({
      data: DraftDataFilter
    })
  }
}

function searchDraft (value, sourcedata) { 
  var 
    value = (value && value.length > 0)? value : $("#inputSearchDraft").val(),
    currentData,
    searchDraft;

  if (value.length == 0) {
    $("#draftGrid").jsGrid({
      data: (DraftDataFilter.length > 0)? DraftDataFilter : DraftDataAll
    })
    return;
  }

  currentData = DraftDataFilter.length > 0? DraftDataFilter : DraftDataAll;
  searchDraft = getDraftSearchData(currentData);

  $("#draftGrid").jsGrid({
    data: searchDraft
  })      
}

function getDraftSearchData (currentData) {

  var 
    value = $("#inputSearchDraft").val(),
    searchDraft = [];

  var words = value.split(" ");
  
  words = words.filter(function (el) {
    return el != '';
  });
  
  for (var i = 0; i < currentData.length; i++) {
    var k_words = words.length;

    for (var k = 0; k < words.length; k++) {
      var search_word = words[k].trim().toLowerCase();
      if (search_word.length == 0)
        break;

      for (var key in currentData[i]) {
        var curr = "" + currentData[i][key];
        curr = curr.toLowerCase();
        if (curr.indexOf(search_word) > -1) {
          k_words = k_words - 1;
          break;
        }
      }
    }

    if (k_words == 0)
     searchDraft.push(currentData[i])  
  }

  return searchDraft;
}

function getBottleGoogle () {
  var 
    result = [],
    filters = [];

  $.ajax({
     url : "getgoogle.php",
     type : 'POST',
     data: { 
      query: "getBottle"
    },
     success : function (res) {  

          var 
            data = JSON.parse(res);

            for (var i = 0; i < data.length; i++) {
                if (data[i][1].length == 0)
                  continue;

              var obj = getFormatBottleRow(data[i]);
              result.push(obj);

              if (filters.indexOf(obj.filter_names[0]) == -1)
                filters.push(obj.filter_names[0]);
              if (obj.filter_names[1] && filters.indexOf(obj.filter_names[1]) == -1)
                filters.push(obj.filter_names[1]);
                if (obj.filter_names[2] && filters.indexOf(obj.filter_names[2]) == -1)
                    filters.push(obj.filter_names[2]);
            } 

           showBottle({
              bottleData: result,
              filters: filters,
              filters_choose: filters
            });
       },
       error : function () {
          console.log ('error');
       }
   });
}

function getBottleRowText (obj) { 
  var text = "";

  if (device.mobile()) {
    text = "<table width=\"100%\" cellspacing=\"0\">" + 
                "<tr>" + 
                  "<td colspan=\"2\" valign=\"bottom\" style=\"padding-top:5px;padding-left:10px;\"><span style=\"font-size:14pt; line-height:0.5;font-weight:bold;\">" + obj.name + "</span></td>" + 
                "</tr>" + 
                "<tr>" + 
                  "<td><span class=\"draft-style\">  [" + obj.style + "]</span></td>" + 
                  "<td style=\"width:30%;font-size:14pt;\" valign=\"bottom\">"+ obj.cost +"</td>" +  
                "</tr>" + 
                "<tr>" + 
                  "<td style=\"padding-left:10px;\"><span class=\"draft-brewery\"  onclick=\"filterBottleByBrewery('"+ obj.brewery_name +"')\"  >"+ obj.brewery_name +"</span></td>" + 
                  "<td style=\"color:grey\">"+ obj.volume_text +"</td>" + 
                "</tr>" + 
                "<tr>" + 
                  "<td style=\"padding-left:15px;\">"+ (obj.abv.length > 0? "abv " + obj.abv + "%" : "") + 
                          (obj.abv.length > 0 && obj.ibu > 0? " | " : "") + 
                          (obj.ibu > 0? "ibu " + obj.ibu : "") + "</td>" +     
                  "<td></td>" +                                        
                "</tr>" + 
            "</table>";
  }
  else {
    text = "<table width=\"100%\">"+
              "<tr>"+
                  "<td colspan=\"2\" width=\"100%\"><span class=\"draft-name\">" + obj.name + "</span>" +
                    "<span class=\"draft-style\">[" + obj.style + "]</span>"+
                "</td>"+
              "</tr><tr>"+
                  "<td width=\"40%\">" + 
                      (obj.abv.length > 0? "abv " + obj.abv + "%" : "") + 
                      (obj.abv.length > 0 && obj.ibu > 0? " | " : "") + 
                      (obj.ibu > 0? "ibu " + obj.ibu : "") + 
                "</td>"+
                  "<td align=\"left\"><span class=\"draft-brewery\" onclick=\"filterBottleByBrewery('"+ obj.brewery_name +"')\" >"+ obj.brewery_name +"</span></td>"+
              "</tr>"
            "</table>";
  }
  return text;
}

function filterBottleByBrewery(brewery) {
  $("#btn-bottle-brewery").show();	
	$("#spn-bottle-brewery").html(brewery);
	document.getElementById("btn-bottle-brewery").style.display = "block";

  filterBottle();
}

function cancelFilterBottleByBrewery() {
  $("#btn-bottle-brewery").hide();	
  $("#spn-bottle-brewery").html("");
  document.getElementById("btn-bottle-brewery").style.display = "none";

  filterBottle(true);
}

function getFormatBottleRow (data) {
   
  var obj = {
                id: null,
                beer_id: null,
                brewery_name: data[0],
                id_brewery: null,
                name: data[1],
                name_text: null,
                style: data[2],
                abv: data[6],
                ibu: +data[7],
                filter_names: [data[3]],
                untuppd: null,
                cost_num: +data[10],
                cost: data[10] + " руб.",
                volume: data[9],
                volume_text: "<div class=\"tdVolume\">"+ (data[9] > 0? data[9]+" мл" : "")  + "</div>" 
              }
              if (!!data[4])
                obj.filter_names.push(data[4]);

                if (!!data[5])
                    obj.filter_names.push(data[5]);

              obj.name_text = getBottleRowText(obj);
    return obj;
}

function showBottleFilters (filters, filters_choose) { 
  if (!filters)
    return;

    setVisibleFilterBtn (filters, filters_choose, "APA/IPA/DIPA", "btn-bottle-ipa");
    setVisibleFilterBtn (filters, filters_choose, "стаут/портер", "btn-bottle-stout");
    setVisibleFilterBtn (filters, filters_choose, "крепче 10%", "btn-bottle-hard");
    setVisibleFilterBtn (filters, filters_choose, "фруктовое/ягодное", "btn-bottle-fruit");
    setVisibleFilterBtn (filters, filters_choose, "классика", "btn-bottle-classic");
    setVisibleFilterBtn (filters, filters_choose, "сидр", "btn-bottle-cider");
    setVisibleFilterBtn (filters, filters_choose, "особое", "btn-bottle-other");
    setVisibleFilterBtn (filters, filters_choose, "sour ale/gose", "btn-bottle-sour");
    setVisibleFilterBtn (filters, filters_choose, "пшеничное", "btn-bottle-weizen");
    setVisibleFilterBtn (filters, filters_choose, "томатное/суп", "btn-bottle-tomato");
    setVisibleFilterBtn (filters, filters_choose, "медовуха", "btn-bottle-mead");
    setVisibleFilterBtn (filters, filters_choose, "иностранное", "btn-bottle-inostr");
    setVisibleFilterBtn (filters, filters_choose, "смузи", "btn-bottle-smoothie");
    setVisibleFilterBtn (filters, filters_choose, "безалкогольное", "btn-bottle-notalko");
    setVisibleFilterBtn (filters, filters_choose, "бельгия", "btn-bottle-belgia");
    setVisibleFilterBtn (filters, filters_choose, "wild ale", "btn-bottle-wild");
    setVisibleFilterBtn (filters, filters_choose, "европейская классика", "btn-bottle-europa");
    setVisibleFilterBtn (filters, filters_choose, "исторические", "btn-bottle-history");
    setVisibleFilterBtn (filters, filters_choose, "лимонад", "btn-bottle-limonad");
}

function clickByFilterBottleBtn (btn) { 
  btn = $(btn);
  var text = btn[0].textContent;
  text = text.replace('✔', '').trim();

  if (btn.hasClass("btn-success")) {
    btn.removeClass("btn-success");
    btn.addClass("btn-default");
  }
  else {
    btn.removeClass("btn-default");
    btn.addClass("btn-success");
  }

  filterBottle()
}

function getFiltersChooseBottle () {
  var
    filters_choose = [];

    if ($("[name=btn-bottle-ipa]").is(':visible') & $("[name=btn-bottle-ipa]").hasClass("btn-success"))
        filters_choose.push("APA/IPA/DIPA");
    if ($("[name=btn-bottle-stout]").is(':visible') & $("[name=btn-bottle-stout]").hasClass("btn-success"))
        filters_choose.push("стаут/портер");
    if ($("[name=btn-bottle-hard]").is(':visible') & $("[name=btn-bottle-hard]").hasClass("btn-success"))
        filters_choose.push("крепче 10%");
    if ($("[name=btn-bottle-fruit]").is(':visible') & $("[name=btn-bottle-fruit]").hasClass("btn-success"))
        filters_choose.push("фруктовое/ягодное");
    if ($("[name=btn-bottle-classic]").is(':visible') & $("[name=btn-bottle-classic]").hasClass("btn-success"))
        filters_choose.push("классика");
    if ($("[name=btn-bottle-cider]").is(':visible') & $("[name=btn-bottle-cider]").hasClass("btn-success"))
        filters_choose.push("сидр");
    if ($("[name=btn-bottle-other]").is(':visible') & $("[name=btn-bottle-other]").hasClass("btn-success"))
        filters_choose.push("особое");
    if ($("[name=btn-bottle-sour]").is(':visible') & $("[name=btn-bottle-sour]").hasClass("btn-success"))
        filters_choose.push("sour ale/gose");
    if ($("[name=btn-bottle-weizen]").is(':visible') & $("[name=btn-bottle-weizen]").hasClass("btn-success"))
        filters_choose.push("пшеничное");
    if ($("[name=btn-bottle-tomato]").is(':visible') & $("[name=btn-bottle-tomato]").hasClass("btn-success"))
        filters_choose.push("томатное/суп");
    if ($("[name=btn-bottle-mead]").is(':visible') & $("[name=btn-bottle-mead]").hasClass("btn-success"))
        filters_choose.push("медовуха");
    if ($("[name=btn-bottle-inostr]").is(':visible') & $("[name=btn-bottle-inostr]").hasClass("btn-success"))
        filters_choose.push("иностранное");
    if ($("[name=btn-bottle-smoothie]").is(':visible') & $("[name=btn-bottle-smoothie]").hasClass("btn-success"))
        filters_choose.push("смузи");
    if ($("[name=btn-bottle-notalko]").is(':visible') & $("[name=btn-bottle-notalko]").hasClass("btn-success"))
        filters_choose.push("безалкогольное");
    if ($("[name=btn-bottle-belgia]").is(':visible') & $("[name=btn-bottle-belgia]").hasClass("btn-success"))
        filters_choose.push("бельгия");
    if ($("[name=btn-bottle-wild]").is(':visible') & $("[name=btn-bottle-wild]").hasClass("btn-success"))
        filters_choose.push("wild ale");
    if ($("[name=btn-bottle-europa]").is(':visible') & $("[name=btn-bottle-europa]").hasClass("btn-success"))
        filters_choose.push("европейская классика");
    if ($("[name=btn-bottle-history]").is(':visible') & $("[name=btn-bottle-history]").hasClass("btn-success"))
        filters_choose.push("исторические");
    if ($("[name=btn-bottle-limonad]").is(':visible') & $("[name=btn-bottle-limonad]").hasClass("btn-success"))
        filters_choose.push("лимонад");

    return filters_choose;
}

function filterBottle (isclearfilterbrewery) {
  var 
    bottleData = BottleDataAll,
    filters_choose = getFiltersChooseBottle(),
    filterData = [],
    brewery = isclearfilterbrewery? null : $("#spn-bottle-brewery").html();

   for (var i = 0; i < bottleData.length; i++) {

    if (filters_choose.indexOf(bottleData[i].filter_names[0]) > -1 || filters_choose.indexOf(bottleData[i].filter_names[1]) > -1 || filters_choose.indexOf(bottleData[i].filter_names[2]) > -1) {
    	if (brewery) {
    		if (brewery == bottleData[i].brewery_name) 
    			filterData.push(bottleData[i]);
    		}
    	else 
      		filterData.push(bottleData[i]);
    }   
    else 
    	if (filters_choose.length == 0 && brewery)  
    		if (brewery == bottleData[i].brewery_name) 
    			filterData.push(bottleData[i]);       
  }

  $("#bottleGrid").jsGrid({
    data: filterData.length > 0? filterData : bottleData
  })

  BottleDataFilter = filterData.length > 0? filterData : BottleDataAll;

  var valueInput = $("#inputSearchBottle").val();
  if (valueInput.length > 0) {
    searchBottle(valueInput, BottleDataFilter);
  }
  else {
    $("#bottleGrid").jsGrid({
      data: BottleDataFilter
    })
  }
}

function showBottle (data) {  
  if (!data) return;

  var 
    bottleData = data.bottleData,
    filters = data.filters,
    filters_choose = data.filters_choose;

  var fields = [
            { name: "name_text", title: "", type: "text", editing: false }            
    ];   

    if (!device.mobile()) {
      fields.push({ name: "volume_text", title: "объём", type: "text", width: 20, align: "right", editing: false });
      fields.push({ name: "cost", title: "цена", type: "text", width: 20, editing: false });
      fields.push({ name: "tobuy_text", title: "купить", type: "text", editing: false });
      fields.push({ name: "btns", title: "", type: "text", width: 30, editing: false });
    }

    showBottleFilters(filters, filters_choose);

    for (var i = 0; i < bottleData.length; i++) {
      var name_text = getBottleRowText(bottleData[i]);      
      bottleData[i].name_text = name_text;
      bottleData[i].btns = "";
      bottleData[i].tobuy = 0;    
      bottleData[i].id = i;   
    }

  $("#bottleGrid").jsGrid({
    width: "100%",
        sorting: true,
        noDataContent: "Нет данных",
        data: bottleData, 
        fields: fields,
        heading: false,
        editing: false,
        // rowClick: function( item, itemIndex, event) {
        //   if (currentClick.bottle)
        //     currentClick.bottle.item.btns = "";
        //   item.item.btns = 
        //     "<button type=\"button\" class=\"btn btn-success\" onclick=addbottletokorzina()><i class=\"fa fa-plus\" aria-hidden=\"true\"></i></button>  <button type=\"button\" onclick=delbottlefromkorzina() class=\"btn btn-danger\"><i class=\"fa fa-minus\" aria-hidden=\"true\"></i></button>";
        //   $("#bottleGrid").jsGrid("refresh");
        //   currentClick.bottle = item;
        // } 
    });

    BottleDataAll = bottleData;

}

function addbottletokorzina () {
  if (!currentClick.bottle)
    return;
  var 
    item = currentClick.bottle;
  currentClick.bottle.item.tobuy = currentClick.bottle.item.tobuy+1;
  currentClick.bottle.item.tobuy_text = "<font color=\"green\">[в корзине: "+currentClick.bottle.item.tobuy + " шт]</font>";
  $("#bottleGrid").jsGrid("refresh");
  korzina.bottle[currentClick.bottle.item.id] = currentClick.bottle.item;
  korzina.summa += currentClick.bottle.item.cost_num;
   $("#korzinaSum").html(": " + korzina.summa + " руб");
}

function delbottlefromkorzina () {
  if (!currentClick.bottle)
    return;
  var 
    item = currentClick.bottle;
  if (currentClick.bottle.item.tobuy == 0)
    return;
  currentClick.bottle.item.tobuy = currentClick.bottle.item.tobuy-1;
  if (currentClick.bottle.item.tobuy == 0)
     currentClick.bottle.item.tobuy_text = "";
  else
    currentClick.bottle.item.tobuy_text = "<font color=\"green\">[в корзине: "+currentClick.bottle.item.tobuy + " шт]</font>";
  $("#bottleGrid").jsGrid("refresh");

  delete korzina.bottle[currentClick.bottle.item.id];
  korzina.summa -= currentClick.bottle.item.cost_num;
  if (korzina.summa == 0)
    $("#korzinaSum").html("");
  else
    $("#korzinaSum").html(": " + korzina.summa + " руб");
}

function getBottleSearchData (currentData) {

  var 
    value = $("#inputSearchBottle").val(),
    searchBottleData = [];

  var words = value.split(" ");
  words = words.filter(function (el) {
    return el != '';
  });
  
    for (var i = 0; i < currentData.length; i++) {
    var k_words = words.length;

    for (var k = 0; k < words.length; k++) {
      var search_word = words[k].trim().toLowerCase();
      if (search_word.length == 0)
        break;

      for (var key in currentData[i]) {
        var curr = "" + currentData[i][key];
        curr = curr.toLowerCase();
        if (curr.indexOf(search_word) > -1) {
          k_words = k_words - 1;
          break;
        }
      }
    }

    if (k_words == 0)
     searchBottleData.push(currentData[i])  
  }

  return searchBottleData;
}

function searchBottle (value, sourcedata) {

  var 
    value = (value && value.length > 0)? value : $("#inputSearchBottle").val(),
    currentData,
    searchBottleData;

  if (value.length == 0) {
    $("#bottleGrid").jsGrid({
      data: (BottleDataFilter.length > 0)? BottleDataFilter : BottleDataAll
    })
    return;
  }

  currentData = BottleDataFilter.length > 0? BottleDataFilter : BottleDataAll;
  searchBottleData = getBottleSearchData(currentData);

  $("#bottleGrid").jsGrid({
    data: searchBottleData
  })      
}

function getFoodGoogle () {    
    var 
        result = [];

     $.ajax({
       url : "getgoogle.php",
       type : 'POST',
       data: { 
        query: "getFood"
      },
       success : function (res) {  

            var 
              data = JSON.parse(res),
              data_r = [];

            for (var i = 0; i < data.length; i++) {
              data[i]["id"] = i;
              var cost = data[i][2];
              if (cost.indexOf("рублей") > -1) {
                cost = cost.replace("рублей", "");
                cost = +(cost);
                data[i]["cost"] = cost;
                data[i]["name"] = data[i][0];                
              }
              if (data[i][4] == "есть в наличии") {
                data_r.push(data[i]); 
                Foods[data[i]["id"]] = data[i];
              }
            }

            showFood(data_r);   
         },
         error : function () {
            console.log ('error');
         }
     });
}

function addfoodtokorzina (id) {

  if (!korzina.food[id] || korzina.food[id] < 0)
    korzina.food[id] = 1;
  else
    korzina.food[id] = korzina.food[id] + 1;
  $("#food-in-korzina-"+id).html(" <font color=\"green\">[в корзине " + korzina.food[id] + " шт]");

  korzina.summa += Foods[id].cost;
   $("#korzinaSum").html(": " + korzina.summa + " руб");
}

function delfoodfromkorzina (id) {
  console.log(id);

  if (!korzina.food[id] || korzina.food[id] == 0)
    return;

  korzina.food[id] = korzina.food[id] - 1;
  if (korzina.food[id] == 0)
     $("#food-in-korzina-"+id).html("");
  else
    $("#food-in-korzina-"+id).html(" <font color=\"green\">[в корзине " + korzina.food[id] + " шт]");

  korzina.summa -= Foods[id].cost;
  if (korzina.summa == 0)
    $("#korzinaSum").html("");
  else
    $("#korzinaSum").html(": " + korzina.summa + " руб");
}

function showFood(data) { 
  var text = "";
  for (var i = 0; i < data.length; i++) {
    text += 
              "<div class=\"card col-md-3\" align=\"center\" style=\"min-height:300px;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px;\">" +
                "<div class=\"card-food\">" + 
                  "<img src=\""+ data[i][3] +"\" class=\"card-img-top\" style=\"height:190px;cursor: pointer;margin-top:10px;\">" +
                    "<div class=\"card-body\">" +
                      "<h5 class=\"card-title\" style=\"cursor: pointer;height:35px;\">"+ data[i][0] +"<span id=\"food-in-korzina-"+data[i]["id"]+"\"></span></h5>" +
                      "<h6 class=\"card-subtitle mb-2 text-muted\" style=\"cursor: pointer;\">"+data[i][1]+"/ <span style=\"font-size:14px\"><b>"+data[i][2]+"</b></font>   " +
                          // "<button type=\"button\" class=\"btn btn-success\" onclick=\"addfoodtokorzina("+data[i]["id"]+")\"><i class=\"fa fa-plus\" aria-hidden=\"true\"></i></button>  "+
                          // "<button type=\"button\" onclick=\"delfoodfromkorzina("+data[i]["id"]+")\" class=\"btn btn-danger\"><i class=\"fa fa-minus\" aria-hidden=\"true\"></i></button>" +                         
                       "</h6>" +
                      "</div>" + 
                  "</div>" +            
            "</div>";
  }
  $("#foodPanel").append(text);
}