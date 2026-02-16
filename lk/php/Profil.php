<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getInfo":
    			getInfo($db, $_GET["id_shop"]);
    			break;

    		case "getUsers":
    			getUsers($db, $_GET["id_shop"]);
    			break;

    		case "getShops":
    			getShops($db);
    			break;

    		case "getRightUser":
    			getRightUser($db, $_GET["id_user"], $_GET["password"], $_GET["id_shop"]);
    			break;
    	}

        /* Получени информации о магазине */
        function getInfo($db, $id_shop) {
             $_result = $db->query("SELECT * FROM shop where id = ".$id_shop) or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
        }

        /* Получение списка магазинов */
        function getShops($db) {
             $_result = $db->query("SELECT id, name FROM shop") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
        }

        /* Получение списка пользователей магазина */
        function getUsers($db, $id_shop) {
             $_result = $db->query("SELECT id, name FROM user where id_shop = ".$id_shop) or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
        }

        /* Получение информации о правах пользователя */
        function getRightUser($db, $id_user, $password, $id_shop) {


             $password_hash = password_hash($password, PASSWORD_DEFAULT);
             $_result = $db->query("SELECT password, right_access FROM user where id_shop = ".$id_shop." and id = ".$id_user) or
                               die('Connection Error: ' . $db->connect_error);

             $row = $_result->fetch_assoc();
             if (password_verify ($password, $row["password"] ) != 1)
                die ("no login");

             setcookie('ID_SHOP', $id_shop, time() + (86400 * 30), "/");


             echo $row["right_access"] ;
        }

        /* Получение информации о пользователе */
        function getUserInfo($db, $id_user, $password, $id_shop) {


             $password_hash = password_hash($password, PASSWORD_DEFAULT);
             $_result = $db->query("SELECT password, right_access FROM user where id_shop = ".$id_shop." and id = ".$id_user) or
                               die('Connection Error: ' . $db->connect_error);

             $row = $_result->fetch_assoc();
             if (password_verify ($password, $row["password"] ) != 1)
                die ("no login");

             echo $row["right_access"] ;
        }
?>