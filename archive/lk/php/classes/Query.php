<?php

    $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
    if ($db->connect_error) {
        die('Connection Error: ' . $db->connect_error);
    }

        if (isset($_POST['functionname'])) {
            switch ($_POST['functionname']) {
                case 'removeUser':
                    removeUser($db);
                    break;
                case 'addUser':
                    addUser($db);
                    break;
                case 'editUser':
                    editUser($db);
                    break;
                case 'inputUser':
                    inputUser($db);
                    break;
                case 'regUser':
                    regUser($db);
                    break;
                case 'getUserInfo':
                    getUserInfo($db);
                    break;
                case 'getBrewery':
                    getBrewery($db);
                    break;
            }
        }

    function addUser($db) {
             $_result = $db->query("insert into cards (num, name, surname, phone, birthday) VALUES ("
                    .$_POST['numcard']
                    .",'".$_POST['nameuser']."'"
                    .",'".$_POST['surnameuser']."'"
                    .",'".$_POST['phone']."'"
                    .",'".$_POST['burn']."')") or
                               die('Connection Error: ' . $db->connect_error);
             echo $_result;
        }

    function editUser($db) {
                 $_result1 = $db->query("UPDATE cards SET "
                     ."NAME='".$_POST['nameuser']
                     ."',SURNAME='".$_POST['surnameuser']
                     ."',BIRTHDAY='".$_POST['burn']
                     ."',PHONE='".$_POST['phone']
                     ."' WHERE num=".$_POST['numcard']
                     ) or
                                   die('Connection Error: ' . $db->connect_error);

                 $_result2 = $db->query("UPDATE users SET "
                     ."UNTUPPD='".$_POST['untuppd']
                     ."' WHERE id_card=".$_POST['numcard']
                     ) or
                                   die('Connection Error Untuppd: ' . $db->connect_error);
                 echo $_result2;
            }


    function inputUser($db) {
        $password = $_POST['password'];

        $_result = $db->query("select password from users where id_card = ".$_POST['numCard']) or
                                           die(-1);
        $row = $_result->fetch_assoc();
        $db_password = $row["password"];
        if (password_verify($password, $db_password)) {
            echo $_POST['numCard'];
        }
        else
            echo -1;
    }

    function regUser($db) {

            $password = password_hash($_POST['regPassword'], PASSWORD_DEFAULT);
            $untappd = $_POST['regUntappd'];
            $numcard = $_POST['regNumCard'];

            if ($_POST['needcard'] == 1) {
                $_result = $db->query("SELECT num FROM cards WHERE NAME = -1 LIMIT 1;") or
                                                           die(-1);
                $row = $_result->fetch_assoc();
                $numcard = $row["num"];

                $_result = $db->query("update cards set ".
                                        "name='".$_POST['regName']."',".
                                        "surname='".$_POST['regSurname']."',".
                                        "phone='".$_POST['regPhone']."',".
                                        "birthday='".$_POST['regDateBurn']."' where num=".$numcard)
                           or die(-1);

                            $url = 'https://api.telegram.org/bot1775839031:AAFbmrtLUuly7hM581MC1AK9PXQWPun_Gk0/sendMessage';
                            $data = array('chat_id' => '464101746', 'text' => 'Заведите нового пользователя: Номер карты='.$numcard.', Имя='.$_POST['regName'].', Фамилия='.$_POST['regSurname'].', Телефон='.$_POST['regPhone'].', Дата рождения='.$_POST['regDateBurn']);
                            $options = array(
                                'http' => array(
                                    'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                                    'method'  => 'POST',
                                    'content' => http_build_query($data)
                                )
                            );
                            $context  = stream_context_create($options);
                            $result = file_get_contents($url, false, $context);
            }

            $_result = $db->query("INSERT INTO users (password, untuppd, id_card) VALUES ('".$password."', '".$untappd."', ".$numcard."); ") or
                                               die(-1);
            if ($_result != 1)
                echo -1;
            else
                echo $numcard;
    }

    function getUserInfo($db) {
        $_result = $db->query("SELECT "
                                ."users.id_card as num, "
                                ."users.is_admin as is_admin, "
                                ."users.rights as rights, "
                                ."users.untuppd as untuppd, "
                                ."cards.name as name, "
                                ."cards.surname as surname, "
                                ."cards.phone as phone, "
                                ."cards.in1c as in1c, "
                                ."cards.birthday as birthday "
                                ."from users LEFT JOIN cards ON users.id_card=cards.num WHERE users.id_card= ".$_POST['numcard']) or
                                                       die(-1);
        $row = $_result->fetch_assoc();
        echo
               '{'.
               '"num":'.$row["num"].
               ',"is_admin":'.$row["is_admin"].
               ',"rights":'.$row["rights"].
               ',"untuppd":"'.$row["untuppd"].'"'.
               ',"name":"'.$row["name"].'"'.
               ',"surname":"'.$row["surname"].'"'.
               ',"phone":"'.$row["phone"].'"'.
               ',"in1c":'.$row["in1c"].
               ',"birthday":"'.$row["birthday"].'"'.
               '}';
    }

    function getBrewery($db) {
            $_result = $db->query("SELECT "
                                    ."users.id_card as num, "
                                    ."users.is_admin as is_admin, "
                                    ."users.untuppd as untuppd, "
                                    ."cards.name as name, "
                                    ."cards.surname as surname, "
                                    ."cards.phone as phone, "
                                    ."cards.in1c as in1c, "
                                    ."cards.birthday as birthday "
                                    ."from users LEFT JOIN cards ON users.id_card=cards.num WHERE users.id_card= 1") or
                                                           die(-1); //todo !!!!!!!!!!!!!!!!
            $row = $_result->fetch_assoc();
            echo
                   '{'.
                   '"num":'.$row["num"].
                   ',"is_admin":'.$row["is_admin"].
                   ',"untuppd":"'.$row["untuppd"].'"'.
                   ',"name":"'.$row["name"].'"'.
                   ',"surname":"'.$row["surname"].'"'.
                   ',"phone":"'.$row["phone"].'"'.
                   ',"in1c":'.$row["in1c"].
                   ',"birthday":"'.$row["birthday"].'"'.
                   '}';
        }
?>