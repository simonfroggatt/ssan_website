
<div class="container-fluid">



      <div class="form-group row">
      <label class="col-sm-2 col-md-2 col-form-label">Colour</label>
        <div class="col-sm-10 col-md-10 ">
          <div class="row">

            <?php foreach($text_only_cats as $colorIndex => $colorDefs) { ?>
              <div class="col-sd-3 col-md-3 color-thumb" id="bg-color-<?php echo $colorIndex; ?>" style="background-color: <?php echo $colorDefs['color']; ?>; color: <?php echo $colorDefs['textcolor']; ?>;" data-background-color="<?php echo $colorDefs['color']; ?>" data-text-color="<?php echo $colorDefs['textcolor']; ?>"></div>
            <?php } ?>
          </div>
        </div>
      </div>



      <div class="form-group row">
        <label class="col-sm-2 col-md-2 col-form-label">Border</label>
        <div class="col-sm-10 col-md-10 ">
          <div class="row">
            <div class="col-sd-4 col-md-4 color-border" id="border-color-none" style="background-color: white; color:black" data-color='none' data-hasborder='false'>NONE</div>
            <div class="col-sd-4 col-md-4 color-border" id="border-color-black" style="background-color: black; color:white" data-color='black' data-hasborder='true'>BLACK</div>
            <div class="col-sd-4 col-md-4 color-border" id="border-color-white" style="background-color: white; color:black" data-color='white' data-hasborder='true'>WHITE</div>
          </div>
        </div>
      </div>


</div>
