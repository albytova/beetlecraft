var id_discounts = null;


function createMenu() {

        $('#alert-danger').hide();
        $('#cnt-wantcoffee').hide();

        $.ajax({
          url: "db/wantcoffee.php",
          type: 'POST',
          data: { 
            "query": "getDiscounts"
          },
          success : function (result) {       
            var data = JSON.parse(result);
            if (data.length == 0) {
              $('#alert-danger').show();
              return;
            } 
            var num = getRandom(0, data.length - 1);
            $('#cnt-alertsuccess').show();
            $('#discont_name').html(data[num]["name"]);
            id_discounts = data[num]["id"];
          },
          error : function (err) {
            console.log(err);
            $('#alert-danger').show();
          }
        })
} 


function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
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