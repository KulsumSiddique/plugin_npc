<?php
/**
 * Base controller class
 *
 * @filesource
 * @author              Billy Gunn <billy@gunn.org>
 * @copyright           Copyright (c) 2007
 * @link                http://trac2.assembla.com/npc
 * @package             npc
 * @subpackage          npc.controllers
 * @since               NPC 2.0
 * @version             $Id: $
 */

/**
 * Base controller class
 *
 * @package     npc
 * @subpackage  npc.controllers
 */
class Controller {

    var $conn = null;

    /**
     * The default state to query
     *
     * @var string
     * @access public
     */
    var $state = 'any';

    /**
     * String to state mapping
     *
     * @var array
     * @access public
     */
    var $stringToState = array(
        'ok'          => '0',
        'up'          => '0',
        'warning'     => '1',
        'down'        => '1',
        'critical'    => '2',
        'unreachable' => '2',
        'unkown'      => '3',
        'pending'     => '-1',
        'any'         => '0,1,2,3,-1',
        'not_ok'      => '1,2,3'
    );

    /**
     * The starting row for fetching results
     *
     * @var integer
     * @access public
     */
    var $start = 0;

    /**
     * The number of rows to fetch
     *
     * @var integer
     * @access public
     */
    var $limit = 25;

    /**
     * The current page to fetch results for
     *
     * @var integer
     * @access public
     */
    var $currentPage = 1;

    /**
     * The total number of records from
     * the last query.
     *
     * @var integer
     * @access public
     */
    var $numRecords = 1;

    /**
     * The ID of the requested record
     *
     * @var integer
     * @access public
     */
    var $id = null;

    /**
     * The search string passed in from the client
     *
     * @var string
     * @access public
     */
    var $searchString = null;

    /**
     * json encoded list of fields to search
     *
     * @var string
     * @access public
     */
    var $searchFields = null;

    /**
     * Maps a hosts current_state
     *
     * @var array
     * @access public
     */
    var $hostState = array(
        '0'  => 'up',
        '1'  => 'down',
        '2'  => 'unreachable',
        '-1' => 'pending'
    );

    /**
     * Maps a services current_state
     *
     * @var array
     * @access public
     */
    var $serviceState = array(
        '0'  => 'ok',
        '1'  => 'warning',
        '2'  => 'critical',
        '3'  => 'unknown',
        '-1' => 'pending'
    );

    /**
     * Holds all params passed and named.
     *
     * @var mixed
     * @access public
     */
    var $passedArgs = array();

    /**
     * Column aliases
     *
     * @var array
     * @access public
     */
    var $columnAlias = array(
        'instance_id'                   => 'Instance Id',
        'instance_name'                 => 'Instance Name',
        'host_object_id'                => 'Host Object Id',
        'host_name'                     => 'Host Name',
        'service_id'                    => 'Service Id',
        'host_id'                       => 'Host Id',
        'service_description'           => 'Service Description',
        'servicestatus_id'              => 'Servicestatus Id',
        'service_object_id'             => 'Service Object Id',
        'status_update_time'            => 'Status Update Time',
        'output'                        => 'Output',
        'perfdata'                      => 'Perfdata',
        'current_state'                 => 'Current State',
        'has_been_checked'              => 'Has Been Checked',
        'should_be_scheduled'           => 'Should Be Scheduled',
        'current_check_attempt'         => 'Current Check Attempt',
        'max_check_attempts'            => 'Max Check Attempts',
        'last_check'                    => 'Last Check',
        'next_check'                    => 'Next Check',
        'check_type'                    => 'Check Type',
        'last_state_change'             => 'Last State Change',
        'last_hard_state_change'        => 'Last Hard State Change',
        'last_hard_state'               => 'Last Hard State',
        'last_time_ok'                  => 'Last Time Ok',
        'last_time_warning'             => 'Last Time Warning',
        'last_time_unknown'             => 'Last Time Unknown',
        'last_time_critical'            => 'Last Time Critical',
        'state_type'                    => 'State Type',
        'last_notification'             => 'Last Notification',
        'next_notification'             => 'Next Notification',
        'no_more_notifications'         => 'No More Notifications',
        'notifications_enabled'         => 'Notifications Enabled',
        'problem_has_been_acknowledged' => 'Problem Has Been Acknowledged',
        'acknowledgement_type'          => 'Acknowledgement Type',
        'current_notification_number'   => 'Current Notification Number',
        'passive_checks_enabled'        => 'Passive Checks Enabled',
        'active_checks_enabled'         => 'Active Checks Enabled',
        'event_handler_enabled'         => 'Event Handler Enabled',
        'flap_detection_enabled'        => 'Flap Detection Enabled',
        'is_flapping'                   => 'Flapping',
        'percent_state_change'          => 'Percent State Change',
        'latency'                       => 'Latency',
        'execution_time'                => 'Execution Time',
        'scheduled_downtime_depth'      => 'In Scheduled Downtime',
        'failure_prediction_enabled'    => 'Failure Prediction Enabled', 
        'process_performance_data'      => 'Process Performance Data', 
        'obsess_over_service'           => 'Obsess Over Service', 
        'obsess_over_host'              => 'Obsess Over Host', 
        'modified_service_attributes'   => 'Modified Service Attributes', 
        'event_handler'                 => 'Event Handler', 
        'check_command'                 => 'Check Command', 
        'normal_check_interval'         => 'Normal Check Interval', 
        'retry_check_interval'          => 'Retry Check Interval', 
        'check_timeperiod_object_id'    => 'Check Timeperiod Object Id'); 


    /**
     * Constructor.
     *
     */
    function __construct() {

    }

    function jsonOutput($results=array()) {

        if (count($results) && !isset($results[0])) {
            $results = array($results);
        }

        // Setup the output array:
        $output = array('totalCount' => $this->numRecords, 'data' => $results);

        return(json_encode($output));
    }

    /**
     * flattenArray
     * 
     * Flattens the 1st level of nesting
     *
     * @return array  list of all services with status
     */
    function flattenArray($array=array()) {

        $newArray = array();

        for ($i = 0; $i < count($array); $i++) {
            foreach ($array[$i] as $key => $val) {
                if (is_array($val)) {
                    foreach ($val as $k => $v) {
                        $newArray[$i][$k] = $v;
                    }
                } else {
                    $newArray[$i][$key] = $val; 
                }
            }
        }

        return($newArray);
    }

    /**
     * searchClause
     * 
     * Appends search parameters to the passed in where clause
     * @param string $where  An existing where clause
     * @param array $fieldMap  Maps passed in field names
     * @return string  The appended where clasue
     */
    function searchClause($where, $fieldMap) {

        if (!$where) {
            $where = " ( ";
        } else {
            $where .= " AND ( ";
        }

        $fields = json_decode($this->searchFields);
        $count = count($fields);

        $x = 1;
        foreach ($fields as $field) {
            $where .= $fieldMap[$field] . " LIKE '%" . $this->searchString . "%' ";
            if ($x < $count) {
                $where .= " OR ";
            }
            $x++;
        }

        $where .= " ) ";

        return($where);
    }

    function flattenNestedArray($array) {

        $results = array();

        $x = 0;
        for ($i = 0; $i < count($array); $i++) {
            foreach ($array[$i] as $key => $val) {
                if (is_array($val)) {
                    $t[0] = $val;
                    $v = $this->flattenArray($t); 
                    unset($array[$i][$key]);
                    foreach ($array[$i] as $key => $val) {
                        if (!is_array($val)) {
                            $a[$key] = $val;
                        }
                    }
                    $results[$x] = array_merge($a, $v[0]);    
                    $x++;
                }
            }
        }

        return($results);
    }

}

