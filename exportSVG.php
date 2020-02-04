<?php
//ini_set('display_errors', 1);

$svgData = $_POST['svgExport'];

$myfile = fopen("test.svg", "w");
fwrite($myfile, $svgData);
fclose($myfile);


 ?>
