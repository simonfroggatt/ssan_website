<div class="container-fluid">
	<div class="row">
		<div class="col-md-6">
      <div class="form-group row">
      <label class="col-sm-3 col-md-3 col-form-label" for="posize"><?php echo $text_productsize ?></label>
        <div class="col-sm-9 col-md-9 "><select name="posize" id="posize" class="form-control selectpicker">
                <?php foreach ($variant_sizes as $sizeval) { ?>
                <option value="<?php echo $sizeval['id']; ?>"><?php echo $sizeval['size_name']; ?>
                  <?php } ?>
              </select>
        </div>
      </div>
		</div>
		<div class="col-md-6">
      <div class="form-group row">
        <label class="col-sm-3 col-md-3 col-form-label" for="pomaterial"><?php echo $text_productmaterial ?></label>
        <div class="col-sm-9 col-md-9 "><select name="pomaterial" id="pomaterial" class="form-control selectpicker">
                <?php foreach ($variant_materials as $materialval) { ?>
                <option value="<?php echo $materialval['id']; ?>"><?php echo $materialval['material_name']; ?>
                  <?php } ?>
              </select>
        </div>
      </div>
		</div>
	</div>
	<input type="hidden" name="product_id" id="product_id" value="<?php echo $product_id; ?>" />
	<input type="hidden" name="product_var_id" id="product_var_id" value="" />
	<input type="hidden" name="qtysource" id="qtysource" value="dropdown" />
	<input type="hidden" name="svg_json" id="svg_json" value="" />
	<input type="hidden" name="svg_raw" id="svg_raw" value="" />
	<input type="hidden" name="svg_bespoke_image" id="svg_bespoke_image" value="" />
	<input type="hidden" name="svg_bespoke_texts" id="svg_bespoke_texts" value="" />
	<input type="hidden" name="is_bespoke" id="is_bespoke" value="1" />
	<input type="hidden" name="bespokeid" id="bespokeid" value="<?php echo $bespokeid; ?>" />

</div>




<script>
var prod_variants = <?php echo json_encode($variant_size_materials); ?>;

</script>
