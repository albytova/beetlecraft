<?php

 class QueryDatabase {

    private $_db;
    protected $_result;
    public $results;


    public function __construct() {

        $this->_db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");

                $_db = $this->_db;

                if ($_db->connect_error) {
                    die('Connection Error: ' . $_db->connect_error);
                }

                return $_db;
    }

    public function getUserCard($params) {
        $_db = $this->_db;

        $_result = $_db->query("SELECT * FROM UserCard") or
                   die('Connection Error: ' . $_db->connect_error);

        $results = array();

        while ($row = $_result->fetch_assoc()) {
            array_push($results, $row);
        }

        $this->_db->close();

        return $results;
    }

    public function getBrewery($params) {
            $_db = $this->_db;

            $_result = $_db->query("SELECT * FROM brewery") or
                       die('Connection Error: ' . $_db->connect_error);

            $results = array();

            while ($row = $_result->fetch_assoc()) {
                array_push($results, $row);
            }

            $this->_db->close();

            return $results;
        }

 }

 ?>