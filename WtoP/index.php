<?php

    $filename = "data.txt";

	switch ($_POST["query"]) {

		case "saveData":
			saveData($filename, $_POST["steps"]);
			break;

		case "readData":
			readData($filename);
			break;
	}

	function saveData ($filename, $steps) {
        file_put_contents($filename, $steps);
	}

	function readData ($filename) {
        $current = file_get_contents($filename);
        print_r($current);
    }
?>