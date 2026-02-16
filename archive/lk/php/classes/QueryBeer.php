<?php

    $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
    if ($db->connect_error) {
        die('Connection Error: ' . $db->connect_error);
    }

        switch ($_GET["query"]) {

    		case "getBrewery":
    			getBrewery($db);
    			break;

    	    case "addBrewery":
    	        addBrewery($db);
    	        break;

    	    case "updateBrewery":
    	        updateBrewery($db);
    	        break;

    	    case "removeBrewery":
    	        removeBrewery($db);
    	        break;

    		case "getBeer":
    			getBeer($db);
    			break;

    		case "getTypeBeer":
    			getTypeBeer($db);
    			break;

    	    case "addTypeBeer":
    	        addTypeBeer($db);
    	        break;

    	    case "updateTypeBeer":
    	        updateTypeBeer($db);
    	        break;

    	    case "removeTypeBeer":
    	        removeTypeBeer($db);
    	        break;
    	}

        /* Получение списка пивоварен */
        function getBrewery($db) {
             $_result = $db->query("select * from brewery order by name asc;") or
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

         /* Добавление пивоварни */
         function addBrewery($db) {

                 $_result = $db->query("insert into brewery (name) values ('".$_GET["name"]."')") or
                                           die('Connection Error: ' . $db->connect_error);

                 echo $db->connect_error;
         }

         /* Изменение пивоварни */
         function updateBrewery($db) {

                 $_result = $db->query("update brewery set name='".$_GET["name"]."', untuppd='".$_GET["untuppd"]."' where id=".$_GET["id"]) or
                                           die('Connection Error: ' . $db->connect_error);

                 echo $db->connect_error;
         }

         /* Удаление пивоварни */
         function removeBrewery($db) {
//todo проверить как будет работать есть есть связанные елементы в других таблицах
                 $_result = $db->query("delete from brewery where id=".$_GET["id"]) or
                                           die('Connection Error: ' . $db->connect_error);

                 echo $db->connect_error;
         }

        /* Получение списка типов пива */
        function getTypeBeer($db) {
                 $_result = $db->query("select * from typebeer") or
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

         /* Добавление типа пива */
         function addTypeBeer($db) {

                 $_result = $db->query("insert into typebeer (name) values ('".$_GET["name"]."')") or
                                           die('Connection Error: ' . $db->connect_error);

                 echo $db->connect_error;
         }

         /* Изменение названия типа пива */
         function updateTypeBeer($db) {

                 $_result = $db->query("update typebeer set name='".$_GET["name"]."' where id=".$_GET["id"]) or
                                           die('Connection Error: ' . $db->connect_error);

                 echo $db->connect_error;
         }

         /* Удаление типа пива */
         function removeTypeBeer($db) {
//todo проверить как будет работать есть есть связанные елементы в других таблицах
                 $_result = $db->query("delete from typebeer where id=".$_GET["id"]) or
                                           die('Connection Error: ' . $db->connect_error);

                 echo $db->connect_error;
         }

        function getBeer($db) {
                         $_result = $db->query("select * from BeerView") or
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
?>