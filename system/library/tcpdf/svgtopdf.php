<?php


// Include the main TCPDF library (search for installation path).
//require_once('tcpdf_include.php');
require_once('tcpdf.php');
// create new PDF document


function ssanSvgtoPDF($SVGDataIn){
  $PDFDataOut = "";

  $pageLayout = array(200, 300);

  $pdf = new TCPDF('P', 'mm', $pageLayout, true, 'UTF-8', false);

  // set document information
  // /$pdf->SetCreator(PDF_CREATOR);
  $pdf->SetAuthor('Safetysigns and Notices');
  //$pdf->SetTitle('TCPDF Example 002');
//  $pdf->SetSubject('TCPDF Tutorial');
//  $pdf->SetKeywords('TCPDF, PDF, example, test, guide');

  // remove default header/footer
  $pdf->setPrintHeader(false);
  $pdf->setPrintFooter(false);

  // set default monospaced font
  //$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
  //$pdf->SetFont('arial','B');


  // set margins
  $pdf->SetMargins(0, 0, 0);

  // set auto page breaks
  //$pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

  // set image scale factor
  $pdf->setImageScale(1);

  // set some language-dependent strings (optional)
  if (@file_exists(dirname(__FILE__).'/lang/eng.php')) {
      require_once(dirname(__FILE__).'/lang/eng.php');
      $pdf->setLanguageArray($l);
  }

  // ---------------------------------------------------------

  // set font
  //$pdf->SetFont('times', 'BI', 20);

  // add a page
  $pdf->AddPage();

  $svgtestData = '';

  $pdf->ImageSVG('@'.$SVGDataIn, 0, 0, $w='', $h='', $link='', $align='', $palign='', $border=0, $fitonpage=true);

  //$pdf->ImageSVG($file='images/testsvg.svg', $x=15, $y=30, $w='', $h='', $link='http://www.tcpdf.org', $align='', $palign='', $border=1, $fitonpage=false);

  //$pdf->ImageSVG($file='images/tux.svg', $x=30, $y=100, $w='', $h=100, $link='', $align='', $palign='', $border=0, $fitonpage=false);

//  $pdf->ImageSVG('symbols/M008.svg', 0, 0, 100, 100, '','', '', 0, true); // 15,20 are co-ordinate to position graph in pdf

  $PDFreturn = "";

  $PDFreturn = $pdf->Output('test.pdf', 'S');
  return $PDFreturn;
}
