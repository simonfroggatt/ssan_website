<?php

$query = (!empty($_GET['q'])) ? strtolower($_GET['q']) : null;

if (!isset($query)) {
    die('Invalid query.');
}

$status = true;
$databaseUsers = array(
    array(
        "id"        => 4152589,
        "username"  => "TheTechnoMan",
        "avatar"    => "https://avatars2.githubusercontent.com/u/4152589"
    ),
    array(
        "id"        => 7377382,
        "username"  => "running-coder",
        "avatar"    => "https://avatars3.githubusercontent.com/u/7377382"
    ),
    array(
        "id"        => 748137,
        "username"  => "juliocastrop",
        "avatar"    => "https://avatars3.githubusercontent.com/u/748137"
    ),
    array(
        "id"        => 619726,
        "username"  => "cfreear",
        "avatar"    => "https://avatars0.githubusercontent.com/u/619726"
    ),
    array(
        "id"        => 5741776,
        "username"  => "solevy",
        "avatar"    => "https://avatars3.githubusercontent.com/u/5741776"
    ),
    array(
        "id"        => 906237,
        "username"  => "nilovna",
        "avatar"    => "https://avatars2.githubusercontent.com/u/906237"
    ),
    array(
        "id"        => 612578,
        "username"  => "Thiago Talma",
        "avatar"    => "https://avatars2.githubusercontent.com/u/612578"
    ),
    array(
        "id"        => 2051941,
        "username"  => "webcredo",
        "avatar"    => "https://avatars2.githubusercontent.com/u/2051941"
    ),
    array(
        "id"        => 985837,
        "username"  => "ldrrp",
        "avatar"    => "https://avatars2.githubusercontent.com/u/985837"
    ),
    array(
        "id"        => 1723363,
        "username"  => "dennisgaudenzi",
        "avatar"    => "https://avatars2.githubusercontent.com/u/1723363"
    ),
    array(
        "id"        => 2649000,
        "username"  => "i7nvd",
        "avatar"    => "https://avatars2.githubusercontent.com/u/2649000"
    ),
    array(
        "id"        => 2757851,
        "username"  => "pradeshc",
        "avatar"    => "https://avatars2.githubusercontent.com/u/2757851"
    )
);

$resultUsers = [];
foreach ($databaseUsers as $key => $oneUser) {
    if (strpos(strtolower($oneUser["username"]), $query) !== false ||
        strpos(str_replace('-', '', strtolower($oneUser["username"])), $query) !== false ||
        strpos(strtolower($oneUser["id"]), $query) !== false) {
        $resultUsers[] = $oneUser;
    }
}

$databaseProjects = array(
    array(
        "id"        => 1,
        "project"   => "jQuery Typeahead",
        "image"     => "http://www.runningcoder.org/assets/jquerytypeahead/img/jquerytypeahead-preview.jpg",
        "version"   => "1.7.0",
        "demo"      => 10,
        "option"    => 23,
        "callback"  => 6,
    ),
    array(
        "id"        => 2,
        "project"   => "jQuery Validation",
        "image"     => "http://www.runningcoder.org/assets/jqueryvalidation/img/jqueryvalidation-preview.jpg",
        "version"   => "1.4.0",
        "demo"      => 11,
        "option"    => 14,
        "callback"  => 8,
    )
);

$resultProjects = [];
foreach ($databaseProjects as $key => $oneProject) {
    if (strpos(strtolower($oneProject["project"]), $query) !== false) {
        $resultProjects[] = $oneProject;
    }
}

// Means no result were found
if (empty($resultUsers) && empty($resultProjects)) {
    $status = false;
}

header('Content-Type: application/json');

echo json_encode(array(
    "status" => $status,
    "error"  => null,
    "data"   => array(
        "user"      => $resultUsers,
        "project"   => $resultProjects
    )
));
 ?>
