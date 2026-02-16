<?php

        include('service.php');

        switch ($_GET["query"]) {

    		case "getBaseBeer":
    			getBaseBeer($db);
    			break;

    		case "getBeerFromGoogle":
    			getBeerFromGoogle($db);
    			break;

    		case "addBeer":
    			addBeer($db, $_GET["name"], $_GET["brewery"], $_GET["dist"], $_GET["type_1"], $_GET["type_2"], $_GET["type_3"], $_GET["ABV"], $_GET["IBU"], $_GET["UID"]);
    			break;

    		case "deleteBeer":
    			deleteBeer($db, $_GET["beer_id"]);
    			break;

    		case "restoreBeer":
    			restoreBeer($db, $_GET["beer_id"]);
    			break;
    	}

        /* Загрузка пивоварен из базы */
        function getBaseBeer($db) {
             $_result = $db->query("SELECT * FROM get_basebeer") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r ($set);
        }

        /* Загрузка пивоварен из Google-таблицы Контент.База пива */
        function getBeerFromGoogle($db) {
            $data = _get_basebeer_from_google();
            $data = json_encode($data, JSON_UNESCAPED_UNICODE);
            print_r($data);
        }

        function addBeer ($db, $name, $brewery, $dist, $type_1, $type_2, $type_3, $ABV, $IBU, $UID) {

            $query = "SELECT add_beer('".$name."', '".$brewery."', '".$dist."', '".$type_1."', '".$type_2."', '".$type_3."', ".$ABV.", ".$IBU.", '".$UID."') as kk";
            $_result = $db->query($query) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }

        /* Удаление пивоварни */
        function deleteBeer ($db, $id) {

            $_result = $db->query("update beer set status=2 where id=". $id) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }

        /* Восстановление сорта */
        function restoreBeer ($db, $id) {

            $_result = $db->query("update beer set status=1 where id=". $id) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }
?>