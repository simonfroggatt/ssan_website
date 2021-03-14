
    <table id="product_material_table"
    data-toggle="table"
    data-classes="table table-condensed table-no-bordered table-hover product-material"
    data-filter-control="false"
    data-filter-show-clear="false"
    data-row-style="rowStyle"
    >
<!--    <colgroup span="3"></colgroup>
    <colgroup span="<?php echo $bulk_discount_price_count;?>"></colgroup>
    <col class=""> -->

      <tbody>

        <?php foreach ($material_specs as $product_material_data) { ?>
          <tr id="<?php echo $product_material_data['id']; ?>" data-uniqueid="<?php echo $product_material_data['id']; ?>">
            <td class="product-material">
              <!--material_specs-->
              <?php echo $product_material_data['code']; ?>
            </td>
            <td class="product-material">
              <?php echo $product_material_data['material_name']; ?>
            </td>
            <td class="product-material">
              <?php echo $product_material_data['material_desc']; ?>
            </td>
            <td class="product-material">
              <?php echo $product_material_data['mounting_desc']; ?>
            </td>
            <td class="product-material">
              <?php echo $product_material_data['image']; ?>
            </td>
            <td class="product-material">
              <i class="fa fa-info"></i>
            </td>
          </tr>
        <?php } ?>
      </tbody>

      <thead>



        <tr>
          <th data-field="id" data-sortable="false" data-halign="center" data-align="center" >Code</th>
          <th data-field="name" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center" >Name</th>
          <th data-field="description" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center">Description</th>
          <th data-field="mounting" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center">Mounting</th>
          <th data-field="image" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center">Image</th>
          <th data-field="moreinfo" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center">&nbsp;</th>

        </tr>
      </thead>
    </table>

    <script>

      var $tableMaterial = $('#product_material_table').bootstrapTable({
       striped: true,
     /* onPostBody: function(data){
        setCurrentQtySelected();
      } */
    });

    </script>