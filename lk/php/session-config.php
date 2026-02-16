    <?php

        $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetleadmin");
        if ($db->connect_error) {
            die('Connection Error: ' . $db->connect_error);
        }

    ?>