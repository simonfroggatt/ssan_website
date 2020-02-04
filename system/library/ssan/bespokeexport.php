<?php

namespace Ssan;

//require_once('../tcpdf/tcpdf.php');
//require_once(dirname(__FILE__,2).'/tcpdf/tcpdf.php');
require_once(dirname(__FILE__,2).'/tcpdf/svgtopdf.php');
//require_once(dirname(__FILE__,2).'/google-api/vendor/autoload.php');
require_once(dirname(__FILE__,2).'/google-api/googledrive.php');


//use Google\Client;
//use Tcpdf\TCPDF;

ini_set('memory_limit', '1024M');

class BespokeExport
{

    private $db;
    private $orderID;
    private $cartID;
    private $SVGData;
    private $PDFData;
    private $fileName;

    public function __construct($db) {
      $this->db = $db;
    }

    public function setSVGDetails($orderID, $cartID, $SVGData)
    {
        $this->orderID = $orderID;
        $this->cartID = $cartID;
        $this->SVGData = $SVGData;
        $this->fileName = '#'.$orderID.'-'.$cartID;
    }

    public function exportSVGToGDrive()
    {
      //doGdriveUpload();
      //$this->pushSVGtoGDrive();

        $this->pushSVGtoGDrive();

        $this->convertSVGToPDF();
        $this->pushPDFtoGDrive();

    }




    private function convertSVGToPDF()
    {
      //$fileinfo = file_get_contents(dirname(__FILE__) .'test.svg');
      $this->PDFData = ssanSvgtoPDF($this->SVGData);
    //  $this->pushPDFtoGDrive();
      //$this->PDFData = $PDFDataOut;

    }

    private function pushPDFtoGDrive()
    {
        $uploadFileName = $this->fileName. ".pdf";
        $fileData =   $this->PDFData;
        $folderID =  '17j8QvHVkdHHLcB23AUX8MarXD7RE6sRa';
        $filetype = 'application/pdf';
        doGdriveUpload($uploadFileName, $fileData, $folderID, $filetype);  //this is a bit of a hack and needs to be a proper wrapper class for the google API
    }

    private function pushSVGtoGDrive()
    {
      $uploadFileName = $this->fileName. ".svg";
      $fileData =   $this->SVGData;
      $folderID =  '17j8QvHVkdHHLcB23AUX8MarXD7RE6sRa';
      $filetype = 'image/svg+xml';
      doGdriveUpload($uploadFileName, $fileData, $folderID, $filetype);  //this is a bit of a hack and needs to be a proper wrapper class for the google API
    }

    private function getClient()
    {
        $client = new Google_Client();
        $client->setApplicationName('Google Drive API PHP Quickstart');
        $client->setScopes(Google_Service_Drive::DRIVE_METADATA_READONLY);
        $client->setScopes(Google_Service_Drive::DRIVE_FILE);
        $client->setAuthConfig('credentials.json');
        $client->setAccessType('offline');
        $client->setPrompt('select_account consent');

        // Load previously authorized token from a file, if it exists.
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        $tokenPath = 'token.json';
        if (file_exists($tokenPath)) {
            $accessToken = json_decode(file_get_contents($tokenPath), true);
            $client->setAccessToken($accessToken);
        }

        // If there is no previous token or it's expired.
        if ($client->isAccessTokenExpired()) {
            // Refresh the token if possible, else fetch a new one.
            if ($client->getRefreshToken()) {
                $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
            } else {
                // Request authorization from the user.
                $authUrl = $client->createAuthUrl();
                printf("Open the following link in your browser:\n%s\n", $authUrl);
                print 'Enter verification code: ';
                $authCode = trim(fgets(STDIN));

                // Exchange authorization code for an access token.
                $accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
                $client->setAccessToken($accessToken);

                // Check to see if there was an error.
                if (array_key_exists('error', $accessToken)) {
                    throw new Exception(join(', ', $accessToken));
                }
            }
            // Save the token to a file.
            if (!file_exists(dirname($tokenPath))) {
                mkdir(dirname($tokenPath), 0700, true);
            }
            file_put_contents($tokenPath, json_encode($client->getAccessToken()));
        }
        return $client;
    }


}
