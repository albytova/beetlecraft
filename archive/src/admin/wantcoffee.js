var ALLDATA = [];

function init() {


    loadTiks();
 
    $("#grid-tiks").jsGrid({
        width: "100%",
        height: "100%",
 
        inserting: false,
        editing: false,
        sorting: true,
        paging: true,   


        fields: [
            { 
              name: "name", 
              type: "text", 
              width: 150, 
              title: "Имя",  
              itemTemplate: function(value, item) {
                  if (item.is_finish)
                    return "<font color='lightgrey'>"+value+"</font>";
                  return value;
              }
            },
            { 
              name: "discount_name", 
              type: "text", 
              width: 200, 
              title: "Скидка",  
              itemTemplate: function(value, item) {
                  if (item.is_finish)
                    return "<font color='lightgrey'>"+value+"</font>";
                  return value;
              }
            },
            { 
              name: "date_create", 
              type: "text", 
              width: 70, 
              title: "Создано", 
              align: "center",  
              itemTemplate: function(value, item) {
                  if (item.is_finish)
                    return "<font color='lightgrey'>"+value+"</font>";
                  return value;
              }
            },
            { 
              name: "date_finish", 
              type: "text", 
              width: 70, 
              title: "Закончится", 
              align: "center",  
              itemTemplate: function(value, item) {
                  if (item.is_finish)
                    return "<font color='lightgrey'>"+value+"</font>";
                  return value;
              }
            },
            { 
              name: "is_close", 
              type: "checkbox", 
              title: "Погашено" 
            },
            { 
              type: "control", 
              editButton: false, 
              deleteButton: false,
              width: 70,
              itemTemplate: function(value, item) {
                  if (item.is_close == true || item.is_finish)
                    return;
                  var button = $("<input>")
                            .attr("type", "button")
                            .attr("value", "Погасить")
                            .on("click", function () {
                                clickClose(item);
                            });

                  return button;
              }
            }     
        ]
    });
} 


function clickClose (data) {
  bootbox.confirm({
      message: "Вы действительно хотите погасить скидку:<br>"+data.discount_name+"<br>"+data.name, 
      buttons: {
        confirm: {
            label: 'Да',
            className: 'btn-success'
        },
        cancel: {
            label: 'Нет',
            className: 'btn-danger'
        }
      },
      callback: function(result) { 
        if (result)
          closeTik(data);
      }
  });
}

function closeTik(data) {
  console.log(data);
    $.ajax({
          url: "../db/wantcoffee.php",
          type: 'POST',
          data: { 
            "query": "closeTik",
            "date_create": moment().format("YYYY-MM-DD HH:mm:ss"),
            "id_tik": data.id
          },
          success : function (result) {       
            loadTiks();
          },
          error : function (err) {
            console.log(err);
            $('#alert-danger').show();
          }
    })  
}


function loadTiks () {
        $.ajax({
          url: "../db/wantcoffee.php",
          type: 'POST',
          data: { 
            "query": "getTiks"
          },
          success : function (result) {       
            var data = JSON.parse(result);
            if (data.length == 0) {
              $('#alert-danger').show();
              return;
            } 

            for (var i = 0; i < data.length; i++) {
              data[i]["is_close"] = data[i]["is_close"] == "-1"? false : true;
              data[i]["is_finish"] = new Date(data[i]["date_finish"]) < new Date;
            }

            $("#grid-tiks").jsGrid({
              data: data
            })
            ALLDATA = data;
          },
          error : function (err) {
            console.log(err);
            $('#alert-danger').show();
          }
    })
}


function searchByName() {
  var 
      name = $("#input-name").val(),
      name = name.toLowerCase(),      
      data = ALLDATA, 
      newdata = [];

      for (var i = 0; i < data.length; i++) {
          if (data[i]["name"].toLowerCase().indexOf(name) >= 0)
            newdata.push(data[i]);
      }

      $("#grid-tiks").jsGrid("clearFilter");
      $("#grid-tiks").jsGrid({
          data: newdata
      })
}


function cancelSearch() {
  loadTiks();
}


function clickSendName() {
  var name = $('#input-name').val();
  var surname = $('#input-surname').val();
  if (name.length == 0 && surname.length == 0) {
    alert("Введите Имя и Фамилию");
    $('#input-name').focus();
    return;
  }
  if (name.length == 0) {
    alert("Введите имя");
    $('#input-name').focus();
    return;
  }
  if (surname.length == 0) {
    alert("Введите фамилию");
    $('#input-name').focus();
    return;
  }

  var 
    date_create = moment(),
    date_finish = moment().add(3, 'day'),
    date_create_str = date_create.format("YYYY-MM-DD HH:mm:ss"),
    date_finish_str = date_finish.format("YYYY-MM-DD HH:mm:ss"), //todo добавить pm am
    date_finish_forvisual = date_finish.format("DD.MM.YYYY HH:mm"); 


   $.ajax({
    url: "db/wantcoffee.php",
    type: 'POST',
    data: { 
      query: "saveTik",
      name: name,
      surname: surname,
      date_create: date_create_str,
      date_finish: date_finish_str,
      id_discounts: id_discounts
    },
    success : function (result) {
         var arr_result = result.split("<br />");
          for (var i = 0; i < arr_result.length; i++) {
            if (arr_result[i].indexOf("#") > -1) {
              result = arr_result[i];
              break;
            }
          }
          result = result.replace("#", '');
          result = +result;
          if (result > 0) {
            $('#btn-getcoffee').hide();
            $('#block-success').show();
            $('#block-name').hide();
            $('#dt-finish-tik').html(date_finish_forvisual);
            return;
          }
    }
  })
}