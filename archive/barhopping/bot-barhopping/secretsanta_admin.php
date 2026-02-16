<?php

	$db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
    if ($db->connect_error) {
        die('Connection Error: ' . $db->connect_error);
    }

	switch ($_GET["query"]) {

    	case "getNames":
    		getNames($db);
    		break;

    	case "updateAvail":
    		updateAvail($db);
    		break;

    	case "sendSanta":
    		sendSanta($db);
    		break;

    }

     function getNames($db) {

        $_result = $db->query("SELECT * from secretsanta") or
                                                       die('Connection Error: ' . $db->connect_error);

         $set = array();
                     $total_records = mysqli_num_rows($_result);
                     if($total_records >= 1){

                       while ($link = mysqli_fetch_array($_result)){
                         $set[] = $link;
                       }
                     }
                     echo json_encode($set);
     }

     function sendSanta($db) {

		 $parameters = array(
                'text' => "test test",
                'chat_id' => "@albytova"
            );
            sendTelegram("6887269825:AAEKd-xuZ5q3cRE302xEX-MH4PKhQCrJmis", 'sendMessage', $parameters);

     }

     /* Отправка сообщения в Telegram */
     function sendTelegram($token, $method, $parameters, $headers = [])
     {
         $url = "https://api.telegram.org/bot" .$token. "/".$method;

         $options = array(
             'http' => array(
                 'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                 'method' => 'POST',
                 'content' => http_build_query($parameters)
             )
         );

         $context = stream_context_create($options);
         file_get_contents($url, false, $context);
     }

    function updateAvail($db) {

		$query = "update kitchen_name set is_avail='".$_GET["is_avail"]."' where id=".$_GET["id"];
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error );

        echo $_result;
    }
?>