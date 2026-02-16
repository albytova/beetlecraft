<?php

        include('service.php');

        switch ($_GET["query"]) {

    		case "getTypeBeer":
    			getTypeBeer($db);
    			break;
    	}

        /* Получение списка пивоварен */
        function getTypeBeer($db) {
             $_result = $db->query("SELECT id, name FROM type_beer") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
        }


?>