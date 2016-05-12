<?php 

$r = array();

foreach ($_POST as $key => $value) {
	$r[ $key ] = $value;
}

echo json_encode( $r );