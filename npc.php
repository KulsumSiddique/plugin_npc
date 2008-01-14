<?php

chdir('../../');

require_once("include/auth.php");


global $config;

$params['config'] = $config;

// Set the default module and action
if (isset($_REQUEST['module'])) {
    $module = $_REQUEST['module'];
} else {
    $module = 'layout';
}

if (isset($_REQUEST['action'])) {
    $action = $_REQUEST['action'];
} else {
    $action = 'drawFrame';
}

// Include the requested module
require_once("plugins/npc/modules/$module.php");

$class = 'NPC_' . $module;
$obj = new $class;
if (is_array($_REQUEST)) {
    foreach($_REQUEST as $key => $value) {
        $params[$key] = $value;
        if (preg_match("/p_/", $key) || $key == "start" || $key == "limit") {
            $parm = preg_replace("/p_/", '', $key);
            $obj->$parm = $value;
        }
    }
}


// Display any results in JSON format
if ($module == 'layout') {
    $obj->$action($params);
} else {

    list ($count, $results) = $obj->$action($params);

    if (!is_array($results[0])) {
        $results = array($results);
    }

    if (!isset($count)) {
        $count = 1;
    }

    // Setup the output array:
    $output = array('totalCount' => $count, 'data' => $results);

    // Print the JSON encoded output array:
    print json_encode($output);
}

?>

