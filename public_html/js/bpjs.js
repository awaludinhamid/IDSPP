/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
  //
  /*var $parentSelect = $("select#extendinfo");
  $parentSelect.css("color","#5f5f5f");
  $("select#extendinfo>option").each(function() {
    if($(this).hasClass("option-title")) {
      $(this).css("color","#bfbfcf");
      if($(this).prop("selected"))
        $parentSelect.css("color","#bfbfcf");
    } else {
      $(this).css("color","#5f5f5f");
    }
  });
  
  $parentSelect.change(function() {
    $(this).children("option").each(function() {
      if($(this).prop("selected")) {
        if($(this).hasClass("option-title"))
          $parentSelect.css("color","#bfbfcf");
        else
          $parentSelect.css("color","#5f5f5f");     
        return false;
      }
    });
  });*/
  $("input#extendinfo").keyup(function() {
    var currVal = $(this).val();
    if(currVal.length > 0) {
      if(Number(currVal) < this.min)
        $(this).val("1");
      else if(Number(currVal) > this.max)
        $(this).val("12");
    }
  });
});
