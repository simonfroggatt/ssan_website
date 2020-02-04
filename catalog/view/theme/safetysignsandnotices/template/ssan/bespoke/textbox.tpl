<?php $panelboxName = "";  $panelboxName .= $panel."-".$box; ?>

<div class="row" id="textblock-<?php echo $panelboxName; ?>">
  <div class="col-md-12">
    <div class="form-group row bespokeTextRow">

      <div class="col-sm-12 col-md-12 ">
        <div class="btn-toolbar textpanelbuttons" role="toolbar">
          <div class="btn-group btn-group-sm"  data-toggle="buttons">
            <label class="btn btn-default" data-toggle="tooltip" data-placement="left" title="Align Left" for="align-start-<?php echo $panelboxName; ?>"><input type="radio" id="align-start-<?php echo $panelboxName; ?>" name="textalign" class="textalignment" ><i class="icon-align-left"></i></label>
            <label class="btn btn-default active" data-toggle="tooltip" data-placement="top" title="Align Middle" for="align-middle-<?php echo $panelboxName; ?>"><input type="radio" id="align-middle-<?php echo $panelboxName; ?>" name="textalign" class="textalignment"><i class="icon-align-center"></i></label>
            <label class="btn btn-default" data-toggle="tooltip" data-placement="right" title="Align Right"for="align-end-<?php echo $panelboxName; ?>"><input type="radio" id="align-end-<?php echo $panelboxName; ?>" name="textalign" class="textalignment"><i class="icon-align-right"></i></label>
          </div>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-default" type="button" id="size-up-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Increase Text Size"><i class="icon-font-increase"></i></button>
            <button class="btn btn-default" type="button" id="size-down-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Decrease Text Size"><i class="icon-font-decrease"></i></button>
            <button class="btn btn-default" type="button" id="move-up-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Move Text Up"><i class="icon-text-move-up"></i></button>
            <button class="btn btn-default" type="button" id="move-down-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Move Text Down"><i class="icon-text-move-down"></i></button>
            <button class="btn btn-default" type="button" id="line-up-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Increase Line Spacing"><i class="icon-line_spacing_increase"></i></button>
            <button class="btn btn-default" type="button" id="line-down-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Decrease Line Spacing"><i class="icon-line_spacing_decrease"></i></button>
          </div>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-default" type="button" id="delete-textbox-<?php echo $panelboxName; ?>" data-toggle="tooltip" data-placement="top" title="Delete Text Block"><i class="icon-trash-empty"></i></button>
          </div>
        </div>

      <textarea class="form-control textAreaBespokeresize" id="textarea-<?php echo $panelboxName; ?>" rows="3" placeholder="Type your custom text in here..."></textarea>
    </div>
    </div>
  </div>
</div>
