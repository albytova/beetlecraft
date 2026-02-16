<?php

/* ЧТО НУЖНО СОЗДАТЬ В БД
BEER_VIEW
isBeerExist
*/

//        $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
//            if ($db->connect_error) {
//                die('Connection Error: ' . $db->connect_error);
//            }

        switch ($_GET["query"]) {

            case "addBrew":
                addBrew($db);
                break;

            case "addManyBeer":
                addManyBeer($db);
                break;

            case "editBrew":
                editBrew($db);
                break;

            case "insertBeer":
                insertBeer($db);
                break;

            case "changeBeer":
                changeBeer($db);
                break;

            case "removeBeer":
                removeBeer($db);
                break;

    		case "getData":
    			getData();
    			break;

    		case "getBeerFromGoogleTable":
    			getBeerFromGoogleTable();
    			break;

//    		case "loadTasks":
//    			loadTasks($db);
//    			break;
//
//    		case "checkTask":
//    		    checkTask($db);
//    		    break;

//    		case "loadDraftZmd":
//    		    loadDraftZmd($db);
//    		    break;

    		case "loadBaseBeerFromDB":
    		    loadBaseBeerFromDB($db);
    		    break;

    		case "loadBaseBeerFromGoogleDoc":
    		    loadBaseBeerFromGoogleDoc($db);
    		    break;

    		case "loadBrew":
    		    loadBrew($db);
    		    break;

    		case "deleteBrew":
    		    deleteBrew($db);
    		    break;

    		case "loadTypeStyle":
    		    loadTypeStyle($db);
    		    break;

    		case "findBrewery":
                findBrewery($db);
                break;
        }

        function getData() {
            $spreadsheet_products_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvRJHysaqAifHn5Gl30RrnKurB8fd_WN-2bEIZFItFoF9rMUIj2WCm4M6zXvB8hoiXMjOOdneFuJAo/pub?gid=900035671&single=true&output=csv";

    		$handle = fopen($spreadsheet_products_url, "r");
    		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    		    $products[] = $data;
    		}
    		fclose($handle);

    		$products = json_encode($products, JSON_UNESCAPED_UNICODE);

    		print_r($products);
        }

        function getBeerFromGoogleTable() {
            $spreadsheet_products_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTNEooG0w-owgbqnO4uDZSc01WwuxKxJt_MRZjebLgaRTqEpL5lDiOPPaqDKwsgK0j7cwLHSY7ZxCF/pub?gid=0&single=true&output=csv";

    		$handle = fopen($spreadsheet_products_url, "r");
    		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    		    $products[] = $data;
    		}
    		fclose($handle);

    		$products = json_encode($products, JSON_UNESCAPED_UNICODE);

    		print_r($products);
        }

//        function loadDraftZmd($db) {
//            $str = "insert into zmd_draft(name,brewery,coin_300,coin_500,dist,abv,ibu) values ('".$_GET["name"]."','".$_GET["brewery"]."',".$_GET["coin_300"].",".$_GET["coin_500"].",'".$_GET["dist"]."',".$_GET["abv"].",".$_GET["ibu"].")";
//            $_result = $db->query($str) or die('Connection Error');
//
//            $str = "insert into task (NAME, beer_name, beer_brewery, draft_cost300, draft_cost500) VALUES ('Добавить в базу','".$_GET["name"]."','".$_GET["brewery"]."',".$_GET["coin_300"].",".$_GET["coin_500"].");";
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//            echo $_result;
//        }

//        function loadTasks($db) {
//             $_result = $db->query("select * from task") or
//                                                           die('Connection Error: ' . $db->connect_error);
//
//                                         $set = array();
//                                         $total_records = mysqli_num_rows($_result);
//                                         if($total_records >= 1){
//
//                                           while ($link = mysqli_fetch_array($_result)){
//                                             $set[] = $link;
//                                           }
//                                         }
//                                         echo json_encode($set);
//        }

        function loadBrew($db) {
                     $_result = $db->query("select * from brewery ORDER BY NAME ASC") or
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

        function loadTypeStyle($db) {
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

        function loadBaseBeerFromGoogleDoc($db) {
                    $basebeer_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvRJHysaqAifHn5Gl30RrnKurB8fd_WN-2bEIZFItFoF9rMUIj2WCm4M6zXvB8hoiXMjOOdneFuJAo/pub?gid=46544836&single=true&output=csv";

            		$handle = fopen($basebeer_url, "r");
            		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            		    $basebeer[] = $data;
            		}
            		fclose($handle);

            		echo json_encode($basebeer, JSON_UNESCAPED_UNICODE);
        }

        function loadBaseBeerFromDB($db) {
          $_result = $db->query("select * from beer_0 order by brewery") or
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

//         function checkTask($db) {
//                    $str = "delete from task where id=".$_GET["id"];
//                    $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//                    echo $_result;
//                }

         function deleteBrew($db) {
                    $str = "delete from brewery where id=".$_GET["id"];
                    $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);

                    echo $_result;
                }


        function addBrew($db) {
            $_result = $db->query("insert into brewery (name, untuppd) VALUES ("
                            ."'".$_GET['name']."'"
                            .",'".$_GET['untuppd']."')") or
                                       die('Connection Error: ' . $db->connect_error);
            echo $_result;
        }

        function editBrew($db) {
             $_result = $db->query("UPDATE brewery SET "
                             ."NAME='".$_GET['name']
                             ."',UNTUPPD='".$_GET['untuppd']."' WHERE id=".$_GET['idBrew']) or
                                           die('Connection Error: ' . $db->connect_error);
             echo $_result;
        }

		// Добавление списка пива в общую базу
		function addManyBeer($db) {

			$_result = $db->query("SELECT isBeerExist('".$_GET['beer_name']."','".$_GET['beer_name']."') as rez") or die('Connection Error: ' . $db->connect_error);
			$row = mysql_fetch_array($_result);// Заносим в массив
            $mk = $row['rez']; //Присвоили переменной
            echo $row['rez'];


         //   $_result = $db->query($_GET['query_text']) or die('Connection Error: ' . $db->connect_error);
            //echo $set[0];
        }

		// Добавление пива в общую базу
		function insertBeer($db) {
			$query = "insert into beer_0 (brewery, name, style, type_1, type_2, type_3, abv, ibu, untappd_bid) VALUES ("
                                                 ."'".$_GET['brewery']."'"
                                                 .",'".$_GET['name']."'"
                                                 .",'".$_GET['style']."'"
                                                 .",'".$_GET['type_1']."'"
                                                 .",'".$_GET['type_2']."'"
                                                 .",'".$_GET['type_3']."'"
                                                 .",'".$_GET['abv']."'"
                                                 .",'".$_GET['ibu']."'"
                                                 .",'".$_GET['untappd_bid']."')";
            $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
            echo $_result;
        }

		// Редактирование пива в общей базе
		function changeBeer($db) {
        			$query = "update beer_0 set brewery = '".$_GET['brewery']."'"
        			                         .", name = '".$_GET['name']."'"
        			                         .", style = '".$_GET['style']."'"
        			                         .", type_1 = '".$_GET['type_1']."'"
        			                         .", type_2 = '".$_GET['type_2']."'"
        			                         .", type_3 = '".$_GET['type_3']."'"
        			                         .", abv = '".$_GET['abv']."'"
        			                         .", ibu = '".$_GET['ibu']."'"
        			                         ." where untappd_bid = ".$_GET['untappd_bid'];
                    $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
                    echo $_result;
                }

		// Удаление пива из базы
		function removeBeer($db) {
        			$query = "delete from beer_0 where untappd_bid = '".$_GET['untappd_bid']."'";
                    $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
                    echo $_result;
                }

        // Проверка наличия пивоварни в базе
        function findBrewery($db) {
            $query = "select IsBreweryExist('".$_GET['brewery_name']."') as rez";
            $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

            $set = array();
            		$total_records = mysqli_num_rows($_result);
            		if ($total_records >= 1) {
            			while ($link = mysqli_fetch_array($_result)) {
            				$set[] = $link;
            			}
            		} else return -1;
            echo $set[0]["rez"];
        }
?>