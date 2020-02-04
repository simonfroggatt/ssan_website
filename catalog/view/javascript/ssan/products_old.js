/**
 * Created by simonfroggatt on 13/06/2017.
 */
$(document).ready(function() {

  initTableInterations();

  //updateProductDetails(true);

  initSizeChange();
  initMaterialChange();
  initDropQtyChange();

});

function initTableInterations() {
  initRowClick();
  initQtyIncrease();


}

function initRowClick() {
  $('#product_variant_table').on('click-row.bs.table', function (row, tr_element, tr_field ) {
     var productVariantID = tr_element._id;
     var productVariantSelectedInfo = findProductVariantInfoData(productVariantID);
     if (productVariantSelectedInfo !== null){
       setSelectedVariantPageInformation(productVariantSelectedInfo);
       setTableHighlight();
      }
});
}

function initDropQtyChange()
{
  $("#qtyDropdown").on('input', function() {
    updateProductDetails();
    setQtyCellHighlight();
  });
}


function initQtyIncrease() {
  $(".orderqty").on('input', function() {
    var productQtyVariantID = $(this).data('qty-variant-id');
    var newQtyAmmount = $(this).val();

    setCellColouring(productQtyVariantID, newQtyAmmount);
    $("#qtyDropdown").val(newQtyAmmount);
  /*  removeAllColoured(productQtyVariantIID);

    var bulkColumnIndex = getBulkBreakColumnIndex(newQtyAmmount);
    setBulkColumnColour(productQtyVariantIID, bulkColumnIndex);
  */});
}

function initSizeChange()
{
  $('#posize').change(function() {

    var sizeid_selected = $( this ).val();
    setSizeMaterials(sizeid_selected);
    $('#pomaterial').trigger('change');
  });
}

function initMaterialChange()
{
  $('#pomaterial').change(function() {
    //get the list of matching materials
    updateProductDetails(true);
    setTableHighlight();
    setQtyCellHighlight();
  });
}


function setCellColouring(productQtyVariantID, newQtyAmmount)
{
  removeAllColoured(productQtyVariantID);

  var bulkColumnIndex = getBulkBreakColumnIndex(newQtyAmmount);
  setBulkColumnColour(productQtyVariantID, bulkColumnIndex);
}

function setCurrentQtySelected()
{
  //step through all the rows now
  var $tmp = $('.orderqty');
  $.each($tmp, function(index, item){
      var productQtyVariantID = item.id;
      var newQtyAmmount = item.value;
      setCellColouring(productQtyVariantID, newQtyAmmount);
    });

}





function findProductVariantInfoData(productVariantIDSelected) {
  var rtnVariantInfo = [];
  $.each(productVariantInfomationArray, function(index, item) {
    if (item.id == productVariantIDSelected) {
      rtnVariantInfo = item;
    }
  });
  return rtnVariantInfo;
}


function setSelectedVariantPageInformation(productVariantSelectedInfo) {


  $('#posize').val(productVariantSelectedInfo['product_size_id']);
  setSizeMaterials();
  $('#pomaterial').val(productVariantSelectedInfo['product_material_id']);

  updateProductDetails(true);
}


function getBulkBreakColumnIndex(qtySelected) {
  var columnIndex = 0;
  $.each(bulkQtyBreaks, function(index, item) {
    if ((item.minqty <= qtySelected) & (qtySelected <= item.maxqty)) {
      columnIndex = index;
      return false;
    } else if ((item.minqty <= qtySelected) & (item.maxqty == -1)) {
      columnIndex = index;
      return false;
    } else if (qtySelected == 0) {
      columnIndex = -1;
      return false;
    }
  });
  return columnIndex;
}

function setBulkColumnColour(rowid, columnid) {
  if (rowid <= 0)
    return false;

  var sellIndex = rowid + "_" + columnid;

  var cellToColour = $('[data-variant-bulk-id="' + sellIndex + '"]');
  cellToColour.addClass("success");
}

function removeAllColoured(rowid) {
  var allCells = $(".bulkcell_" + rowid);
  allCells.removeClass("success");
}


/*********************TOGGLE VAT FUNCTIONALITY*************************/
function initToggle()
{

  var currentVatStatus = Cookies.get('vatstatus');
  if (typeof currentVatStatus === 'undefined')
  {
      Cookies.set('vatstatus', 0);
      currentVatStatus = 0;
  }

  if(currentVatStatus == 0){
    $toggleVat.bootstrapToggle('off');

    $('#vat-status-text').html('All prices <strong>exclude</strong> VAT at the current rate');
  }
  else {
    $toggleVat.bootstrapToggle('on');

    $('#vat-status-text').html('All prices <strong>include</strong> VAT at the current rate');
  }

}

function setToggling(){
$toggleVat.change(function() {
      if($(this).prop('checked'))
        {
          $('#vat-status-text').html('All prices <strong>include</strong> VAT at the current rate');
          Cookies.set('vatstatus', 1);
          changePricesReVAT(0);
          updateProductDetails(false);
        //  $toggleVatTop.bootstrapToggle('on');
        }
        else {
          $('#vat-status-text').html('All prices <strong>exclude</strong> VAT at the current rate');
          Cookies.set('vatstatus', 0);
          changePricesReVAT(1);
          updateProductDetails(false);
        //  $toggleVatTop.bootstrapToggle('off');
        }

    });

}

function changePricesReVAT(addVAT)
{
  var tableData = $table.bootstrapTable('getData');
  var prodVarID = 0;

  $.each(tableData, function(index, value){
    prodVarID = value._id;
    for (i = 0; i < bulkDiscountCount; i++) {

      var sellIndex = prodVarID + "_" + i;
      cellToRecalc = $('[data-variant-bulk-id="' + sellIndex + '"]');
      if(addVAT) {
        var newval = $.number(cellToRecalc.html() / tax_multiplier, 2);
      }
      else {
        var newval = $.number(cellToRecalc.html() * tax_multiplier,2);
      }
      cellToRecalc.html(newval);
    }
  });
}

function setSizeMaterials(size_id)
{
  var sizeid_selected = size_id;
  var listitems = '';
  $.each(prod_variants, function(sizekey,sizevalue){
    if(sizevalue.id == sizeid_selected)
    {
      $.each(sizevalue.materials, function(key, value){
            listitems += '<option value=' + value.id + '>' + value.name+'</option>';
       });

       var my_select = $('#pomaterial'); //$('#down');
       my_select.empty();
       my_select.append(listitems);
       return true;
    }
  });
}

function updateProductDetails(fullupdate = false)
{
  //   alert('update_details');
//get size and material combinations
  var size_id = $('#posize').val();
  var material_id = $('#pomaterial').val();
  var qty = $('#qtyDropdown').val();
  //productVariantInfomationArray


  var ssan_var_info = getVariantInfo(size_id,material_id);
  $('#product_var_id').val(ssan_var_info['id']);

  var new_price = getBulkPricingValue(ssan_var_info['discount_array'],qty);

  $('#priceDropDown').html(new_price);

  if(fullupdate){
    $('#pcodetitle').html(ssan_var_info.variant_code)
    var model_code = ssan_var_info.model +$('#product_id').val() + ' ' + ssan_var_info.size_code + ' ' + ssan_var_info.material_code;
    $('#pcode').html(model_code);
    $('#pcode_top').html(model_code);
    $('#product_material').html(ssan_var_info.material_name);
    $('#product_size').html(ssan_var_info.size_name);
    $('#product_size_or').html(ssan_var_info.size_orientation);
    $('#stock_days').html(makeNiceStockStatus(parseInt(ssan_var_info.stock_days)));
  }

}

function getVariantInfo(sizeID, materialID)
{
  var rtnVariantInfo = [];
  $.each(productVariantInfomationArray, function(index, item) {
    if ( (item['product_material_id'] == materialID) && (item['product_size_id'] == sizeID)) {
      rtnVariantInfo = item;
      return true;
    }
  });
  return rtnVariantInfo;
}

function getVariantID(sizeID, materialID)
{
  var rtnVariantInfo = [];
  $.each(productVariantInfomationArray, function(index, item) {
    if ( (item['product_material_id'] == materialID) && (item['product_size_id'] == sizeID)) {
      rtnVariantInfo = item;
      return true;
    }
  });
  return rtnVariantInfo['id'];
}

function getBulkPricingValue(bulkPricingArray, qtySelectec)
{
    var bulkIndex = getBulkBreakColumnIndex(qtySelectec);
    var price = bulkPricingArray[bulkIndex];

    var currentVatStatus = Cookies.get('vatstatus');


    if(currentVatStatus == 1) {
      var newval = $.number(price * tax_multiplier,2);
    }
    else {
      var newval = price;
    }

    return newval;
}

function setTableHighlight()
{
  var size_id = $('#posize').val();
  var material_id = $('#pomaterial').val();

  var variantInfo = getVariantInfo(size_id,material_id);

  var rowid = variantInfo['id'];

  var sel_row = $('#product_variant_table.table tbody tr#'+rowid);

  sel_row.parent().children().removeClass("row-selected");
  sel_row.addClass("row-selected");

  setCurrentQtySelected();

}

function setQtyCellHighlight()
{
  var size_id = $('#posize').val();
  var material_id = $('#pomaterial').val();
  var newQtyAmmount = $('#qtyDropdown').val();

  var productQtyVariantID = getVariantID(size_id, material_id);
  setCurrentQtySelected();
  setCellColouring(productQtyVariantID, newQtyAmmount);
}


function makeNiceStockStatus(stockDays)
{
  var prettyStockDays = "";
  var daySpan = 1;

  switch(stockDays){
  case 0: prettyStockDays = 'In Stock'; break;
  case 1: prettyStockDays = 'Tomorrow'; break;
  default:   prettyStockDays = eval(stockDays - daySpan) + '-' + eval(stockDays) + ' days';  break;
  }

  return prettyStockDays
}
