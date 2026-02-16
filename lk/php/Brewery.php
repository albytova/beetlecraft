<?php

        include('service.php');

        switch ($_GET["query"]) {

    		case "getBrewery":
    			getBrewery($db);
    			break;

    		case "getBreweryFromGoogle":
    			getBreweryFromGoogle($db);
    			break;

    		case "addBrewery":
    			addBrewery($db, $_GET["name"]);
    			break;

    		case "editBrewery":
    			editBrewery($db, $_GET["id"], $_GET["name"]);
    			break;

    		case "deleteBrewery":
    			deleteBrewery($db, $_GET["id"]);
    			break;

    		case "restoreBrewery":
    			restoreBrewery($db, $_GET["id"]);
    			break;
    	}

        /* Получение списка пивоварен */
        function getBrewery($db) {
             $_result = $db->query("SELECT id, name, UID, status FROM brewery order by name") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r ($set);
        }

        /* Получение списка пивоварен из Google-таблицы (уникальные, неиспользуемые) */
        function getBreweryFromGoogle ($db) {

            $data = _get_basebeer_from_google();
            $data2 = array();

            for ($i = 1; $i < count($data); $i++) {

                     if (array_search ($data[$i][0], $data2) === false) {
                        array_push( $data2, $data[$i][0] );
                     }
            }

            $data2 = json_encode($data2, JSON_UNESCAPED_UNICODE);
            print_r($data2);
        }

        /* Добавление пивоварни */
        function addBrewery ($db, $name) {

            $_result = $db->query("SELECT add_brewery_byname('". $name . "')") or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }

        /* Редактирование пивоварни */
        function editBrewery ($db, $id, $name) {

            $_result = $db->query("update brewery set name ='". $name . "' where id = ".$id) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }

        /* Удаление пивоварни */
        function deleteBrewery ($db, $id) {

            $_result = $db->query("update brewery set status=2 where id=". $id) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }

        /* Восстановление пивоварни */
        function restoreBrewery ($db, $id) {

            $_result = $db->query("update brewery set status=1 where id=". $id) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }
?>