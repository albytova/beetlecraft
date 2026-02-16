/*
https://oauth.vk.com/blank.html#access_token=1041e59e86bc7f3d5d7e99f151ed4f18999d78c4aec7f6079978da437e30d73b5ff6219a811577e06f4d7&expires_in=0&user_id=17377782&email=corba88@mail.ru
*/

function sendText(text) {
        $.ajax({
           url : "https://api.telegram.org/bot937652919:AAGG1LlOZHLiQxB9fYwGV_2rsxfFJjy3JLQ/sendMessage",
           type : 'POST',
           data: { 
            //chat_id: "-1001342473464", //test
            chat_id: "-1001282751011",
            text: text
           },
           success : function (result) {             
            console.log (result);  
          },
           error : function (err) {
            console.log (err);
              console.log ('error');
           }
         });  
}

function sendPhotos(photos) {
  for (var i = 0; i<photos.length; i++) {
        $.ajax({
           url : "https://api.telegram.org/bot937652919:AAGG1LlOZHLiQxB9fYwGV_2rsxfFJjy3JLQ/sendPhoto",
           type : 'POST',
           data: { 
            chat_id: "-1001282751011",
            photo: photos[i]
           },
           success : function (result) {             
            console.log (result);  
          },
           error : function (err) {
            console.log (err);
              console.log ('error');
           }
         });  
  }
}

function getVk(is_onlytext) {

  $.ajax({
     url : "../db/getwall.php",
     type : 'POST',
     success : function (result) {
      var 
        res = JSON.parse(result),
        photos = []; 
      res = res.response["items"];
      res = res[0];
      var 
        attachments = res["attachments"];

      sendText(res["text"]);

      if (is_onlytext != 1 ) {
        for (var i = 0; i<attachments.length; i++) {
          var attach = attachments[i];
          if (attach["type"] == "photo") {
              for (var j = 8; j <= 8; j--) {
                if (attach["photo"]["sizes"][j]) {
                  photo = attach["photo"]["sizes"][j]["url"];
                  if (photo)
                    photos.push(photo);
                  break;
                } 
              }
          } 
        }

        sendPhotos(photos);
      }
    },
     error : function () {
        console.log ('error');
     }
   });

}