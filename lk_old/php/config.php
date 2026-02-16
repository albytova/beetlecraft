<?php

 function get_extdirect_api() {

    $API = array(
        'QueryDatabase' => array(
            'methods' => array(
                'getUserCard' => array(
                    'len' => 1
                ),
                'getBrewery' => array(
                    'len' => 1
                ),
                'saveUser' => array(
                    'len' => 1
                ),
                'removeUser' => array(
                    'len' => 1
                )
            )
        )
    );

    return $API;
 }

 ?>