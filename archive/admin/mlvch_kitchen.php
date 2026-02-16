<?php

//	$db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
//    if ($db->connect_error) {
//        die('Connection Error: ' . $db->connect_error);
//    }

	switch ($_GET["query"]) {

    	case "sendZakazNew":
    		sendZakazNew();
    		break;


    	case "loadZakazNew":
    		loadZakazNew($db);
    		break;


    	case "setExecZakazNew":
    		setExecZakazNew($db);
    		break;

    	case "getInfo":
    		getInfo($db);
    		break;

    	case "getInfoNew":
    		getInfoNew($db);
    		break;

    	case "getNames":
    		getNames();
    		break;

    	case "insertName":
    		insertName($db);
    		break;

    	case "deleteName":
    		deleteName($db);
    		break;

    	case "updateAvail":
    		updateAvail($db);
    		break;

    }

    function sendZakazNew() {

		$txt = strval($_GET["message"]);
		sendMessage($txt);
//		$query = "INSERT INTO kitchen_zakaz_mlvch (datetime_zakaz, id_name, number, count, is_off, comment) VALUES (CURRENT_TIMESTAMP(),".$_GET["id_name"].", '".$_GET["number"]."', ".$_GET["count"].",".$_GET["is_off"].", '".$_GET["comment"]."')";
//		 $_result = $db->query($query) or
//                                                   die('Connection Error: ' . $db->connect_error);
//
         echo 1;
    }


    function setExecZakazNew ($db) {

       $_result = $db->query("update kitchen_zakaz_mlvch set is_exec=1 where number = ".$_GET["number"]."") or
                                                                             die('Connection Error: ' . $db->connect_error);

        echo $db->connect_error;
     }

      function loadZakazNew($db) {

             $_result = $db->query("SELECT * FROM kitchen_zakaz_mlvch WHERE datetime_zakaz >= CURDATE() order BY id desc") or
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

          function getInfoNew($db) {

             $_result = $db->query("SELECT * FROM kitchen_zakaz_mlvch") or
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

     function getNames() {

            $spreadsheet_draft_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=2083851813&single=true&output=csv";

     		$handle = fopen($spreadsheet_draft_url, "r");
     		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
     		    $draft_data[] = $data;
     		}
     		fclose($handle);

     		print_r(json_encode($draft_data, JSON_UNESCAPED_UNICODE));


//        $_result = $db->query("SELECT * from kitchen_name_mlvch") or
//                                                       die('Connection Error: ' . $db->connect_error);
//
//         $set = array();
//                     $total_records = mysqli_num_rows($_result);
//                     if($total_records >= 1){
//
//                       while ($link = mysqli_fetch_array($_result)){
//                         $set[] = $link;
//                       }
//                     }
//         echo json_encode($set);
     }

    function insertName($db) {

		$query = "INSERT INTO kitchen_name_mlvch (name, is_avail) VALUES ('".$_GET["name"]."', '".$_GET["is_avail"]."')";
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error);

        echo $_result;
    }

    function deleteName($db) {

		$query = "delete from kitchen_name_mlvch where id=".$_GET["id"];
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error );

        echo $_result;
    }

    function updateAvail($db) {

		$query = "update kitchen_name_mlvch set is_avail='".$_GET["is_avail"]."' where id=".$_GET["id"];
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error );

        echo $_result;
    }

    function sendTelegram($method, $parameters, $headers = [])      {
              $token = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';
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

    /* Отправка простого текстого сообщения в Telegram */
    function sendMessage($message) {
              $parameters = array(
               'chat_id' => "-1002210226772",// "-1001799024183",
              'text' => $message
          );

          sendTelegram('sendMessage', $parameters);
    }
?>