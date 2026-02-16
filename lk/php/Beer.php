<?php

        include('service.php');

        switch ($_GET["query"]) {

    		case "addBeer":
    			addBeer($db, $_GET["name"], $_GET["brewery"], $_GET["dist"], $_GET["type_1"], $_GET["type_2"], $_GET["type_3"], $_GET["ABV"], $_GET["IBU"], $_GET["UID"]);
    			break;

    		case "editBeer":
    			editBeer($db, $_GET["id_beer"], $_GET["name"], $_GET["brewery"], $_GET["dist"], $_GET["type_1"], $_GET["type_2"], $_GET["type_3"], $_GET["ABV"], $_GET["IBU"], $_GET["UID"]);
    			break;
    	}

        /* Редактирование сорта */
        function editBeer ($db, $id_beer, $name, $brewery, $dist, $type_1, $type_2, $type_3, $ABV, $IBU, $UID) {

            $query = "update beer set id_brewery=".$brewery.",name='".$name."',dist='".$dist."',id_type_1=".$type_1.",id_type_2=".$type_2.",id_type_3=".$type_3.",ABV=".$ABV.",IBU=".$IBU.",UID=".$UID." where ID=".$id_beer;
            $_result = $db->query($query) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }

        /* Добавление сорта todo переписать на value, вместо raw */
        function addBeer($db, $name, $brewery, $dist, $type_1, $type_2, $type_3, $ABV, $IBU, $UID) {

            $query = "insert into beer (name, id_brewery, dist, id_type_1, id_type_2, id_type_3, ABV, IBU, UID) values ('".$name."', ".$brewery.", '".$dist."', ".$type_1.", ".$type_2.", ".$type_3.", ".$ABV.", ".$IBU.", ".$UID.")";
            $_result = $db->query($query) or
                    die('Connection Error: ' . $db->connect_error);

            print_r($_result);
        }
?>