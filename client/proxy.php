<?php

header("Content-Type: application/json");

$qs = $_SERVER['QUERY_STRING'];
if (strlen($qs) <= 4) {
  exit;
}
$url = urldecode(substr($qs, 4));
$url = str_replace(" ","+",$url);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	$postdata = file_get_contents("php://input");
	print curl_post($url, $postdata);
}
else {
	print file_get_contents($url);
}


/**
 * Send a POST requst using cURL
 * @param string $url to request
 * @param $post data to send
 * @param array $options for cURL
 * @return string
 */
function curl_post($url, $post = NULL, array $options = array())
{
    $defaults = array(
        CURLOPT_POST => 1,
        CURLOPT_HTTPHEADER => array("Content-Type: application/json; charset=utf-8"),
        CURLOPT_URL => $url,
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_FORBID_REUSE => 1,
        CURLOPT_TIMEOUT => 4,
        CURLOPT_POSTFIELDS => $post
    );

    $ch = curl_init();
    curl_setopt_array($ch, ($options + $defaults));
    if( ! $result = curl_exec($ch))
    {
        trigger_error(curl_error($ch));
    }
    curl_close($ch);
    return $result;
} 