<?php

	$db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
    if ($db->connect_error) {
        die('Connection Error: ' . $db->connect_error);
    }

	switch ($_GET["query"]) {

    	case "sendZakaz":
    		sendZakaz($db);
    		break;

    	case "sendZakazNew":
    		sendZakazNew($db);
    		break;

    	case "loadZakaz":
    		loadZakaz($db);
    		break;

    	case "loadZakazNew":
    		loadZakazNew($db);
    		break;

    	case "setExecZakaz":
    		setExecZakaz($db);
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
    		getNames($db);
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

    function sendZakaz($db) {

		$query = "INSERT INTO kithen_zakaz (datetime_zakaz, sh1, sh2, sh3, sh4, sh5, kbns, rebra, is_off, comment) VALUES (CURRENT_TIMESTAMP(), ".$_GET["sh1"].", ".$_GET["sh2"].", ".$_GET["sh3"].", ".$_GET["sh4"].", ".$_GET["sh5"].", ".$_GET["kbns"].", ".$_GET["rebra"].", ".$_GET["is_off"].", '".$_GET["comment"]."')";
		 $_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error);

         echo $_result;
    }

    function sendZakazNew($db) {

		$query = "INSERT INTO kitchen_zakaz_new (datetime_zakaz, id_name, number, count, is_off, comment) VALUES (CURRENT_TIMESTAMP(),".$_GET["id_name"].", '".$_GET["number"]."', ".$_GET["count"].",".$_GET["is_off"].", '".$_GET["comment"]."')";
		 $_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error);

         echo $_result;
    }

    function setExecZakaz ($db) {

       $_result = $db->query("update kithen_zakaz set is_exec=1 where id = ".$_GET["id"]."") or
                                                                             die('Connection Error: ' . $db->connect_error);

        echo $db->connect_error;
     }

    function setExecZakazNew ($db) {

       $_result = $db->query("update kitchen_zakaz_new set is_exec=1 where number = ".$_GET["number"]."") or
                                                                             die('Connection Error: ' . $db->connect_error);

        echo $db->connect_error;
     }

 function loadZakaz($db) {

        $_result = $db->query("SELECT id, datetime_zakaz,sh1,sh2,sh3,sh4,sh5,kbns,rebra,is_exec,is_off,comment FROM kithen_zakaz WHERE datetime_zakaz >= CURDATE()") or
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

      function loadZakazNew($db) {

             $_result = $db->query("SELECT * FROM kitchen_zakaz_new WHERE datetime_zakaz >= CURDATE() order BY id desc") or
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

     function getInfo($db) {

        $_result = $db->query("SELECT datetime_zakaz, SUM(sh1), SUM(sh2), SUM(sh3), SUM(sh4), SUM(sh5), SUM(kbns), SUM(rebra) FROM kithen_zakaz GROUP BY YEAR(datetime_zakaz), MONTH(datetime_zakaz), DAY(datetime_zakaz)") or
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

             $_result = $db->query("SELECT * FROM kitchen_zakaz_new") or
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

     function getNames($db) {

        $_result = $db->query("SELECT * from kitchen_name") or
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

    function insertName($db) {

		$query = "INSERT INTO kitchen_name (name, is_avail) VALUES ('".$_GET["name"]."', '".$_GET["is_avail"]."')";
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error);

        echo $_result;
    }

    function deleteName($db) {

		$query = "delete from kitchen_name where id=".$_GET["id"];
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error );

        echo $_result;
    }

    function updateAvail($db) {

		$query = "update kitchen_name set is_avail='".$_GET["is_avail"]."' where id=".$_GET["id"];
		$_result = $db->query($query) or
                                                   die('Connection Error: ' . $db->connect_error );

        echo $_result;
    }
?>