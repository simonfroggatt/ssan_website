<?php

echo dirname(".") . PHP_EOL;
$command = escapeshellcmd('/usr/bin/python3.6 /var/www/vhosts/safetysignsandnotices.co.uk/httpdocs/system/scripts/testpath.py');
$output = passthru($command);
  //$output =   exec('/usr/bin/python3.6 testgdrive.py');
    echo $output;
?>
