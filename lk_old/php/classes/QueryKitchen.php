<?php

         $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
                    if ($db->connect_error) {
                        die('Connection Error: ' . $db->connect_error);
                    }

        switch ($_GET["query"]) {

//    		case "getDraft":
//    			getDraft($db);
//    			break;
//
//    		case "getBottle":
//    			getBottle($db);
//    			break;
//
//    		case "deleteBeer":
//    			deleteBeer($db);
//    			break;
//
//    		case "deleteBottle":
//    			deleteBottle($db);
//    			break;
//
//    		case "setTap":
//    			setTap($db);
//    			break;
//
//    		case "deleteTap":
//    			deleteTap($db);
//    			break;

//    		case "setDateSMM":
//    		    setDateSMM($db);
//    		    break;
//
//    		case "addDraft":
//    			addDraft($db);
//    			break;
//
//    		case "editDraft":
//    			editDraft($db);
//    			break;


        }


//         function getDraft($db) {
//                    $_result = $db->query("select * from zmd_draft order by num asc;") or
//                                                       die('Connection Error: ' . $db->connect_error);
//
//                                     $set = array();
//                                     $total_records = mysqli_num_rows($_result);
//                                     if($total_records >= 1){
//
//                                       while ($link = mysqli_fetch_array($_result)){
//                                         $set[] = $link;
//                                       }
//                                     }
//                                     echo json_encode($set);
//        }
//
//        function setTap($db) {
//
//            //очистка номера крана если строка с таким номер уже есть
//            $str = "update zmd_draft set num='' where num=".$_GET["num"];
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            $tomorrow = new DateTime('tomorrow');
//            $str = "update zmd_draft set num='".$_GET["num"]."',date_smm='".$tomorrow->format('Y-m-d')."' where id=".$_GET["id"];
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            $str = "insert into task (NAME, beer_name, beer_brewery) VALUES ('Поменять кран: №".$_GET["num"]."','".$_GET["name"]."','".$_GET["brewery"]."');";
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//            echo $_result;
//        }
//
//        function setDateSMM($db) {
//
//            $str = "update zmd_draft set date_smm=".$_GET["date_smm"]." where id=".$_GET["id"];
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            echo $_result;
//        }
//
//        function deleteTap($db) {
//            $str = "delete from zmd_draft where id=".$_GET["id"];
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            $str = "insert into task (NAME, beer_name, beer_brewery) VALUES ('Удалить розлив','".$_GET["name"]."','".$_GET["brewery"]."');";
//                        $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            echo $_result;
//        }
//
//        function addDraft($db) {
//
//            $str = "insert into zmd_draft(num,name,brewery,dist,abv,ibu,coin_300,coin_500) values ('".$_GET["num"]."','".$_GET["name"]."','".$_GET["brewery"]."','".$_GET["dist"]."',".$_GET["abv"].",".$_GET["ibu"].",".$_GET["coin_300"].",".$_GET["coin_500"].")";
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            $str = "insert into task (NAME, beer_name, beer_brewery, draft_cost300, draft_cost500) VALUES ('Добавить в базу','".$_GET["name"]."','".$_GET["brewery"]."',".$_GET["coin_300"].",".$_GET["coin_500"].");";
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//            echo $_result;
//        }

//        function editDraft($db) {
//
//            $str = "update zmd_draft set name='".$_GET["name"]."',brewery='".$_GET["brewery"]."',dist='".$_GET["dist"]."',abv=".$_GET["abv"].",ibu=".$_GET["ibu"].",coin_300=".$_GET["coin_300"].",coin_500=".$_GET["coin_500"]." where id=".$_GET["id"];
////todo прикрутить таски на изменение крана и цены
//            $_result = $db->query($str) or die('Connection Error: ' . $str);
//
//            echo $_result;
//        }
//
//         function getBottle($db) {
//                    $_result = $db->query("select * from ZMD_BOTTLE_TEXT;") or
//                                                       die('Connection Error: ' . $db->connect_error);
//
//                                     $set = array();
//                                     $total_records = mysqli_num_rows($_result);
//                                     if($total_records >= 1){
//
//                                       while ($link = mysqli_fetch_array($_result)){
//                                         $set[] = $link;
//                                       }
//                                     }
//                                     echo json_encode($set);
//        }
//
//        function deleteBottle($db) {
//            $str = "delete from zmd_bottle where id=".$_GET["id"];
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//
//            $str = "insert into task (NAME, beer_name, beer_brewery) VALUES ('Удалить из базы стекла: ','".$_GET["beer_name"]."','".$_GET["beer_brewery"]."')";
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//            echo $_result;
//        }
//
//        function deleteBeer($db) {
//            $str = "call DeleteBeerFromAllBase(".$_GET["id"].")";
//            $_result = $db->query($str) or die('Connection Error: ' . $db->connect_error);
//            echo $_result;
//        }


?>