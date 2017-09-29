/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*** GLOBAL VARIABLE ***/

/**
 * HTML object must be shown when AJAX error occured
 * the array contain list of object to show, in the form of html:value
 * for example: [{"html":"div>table#myTable","value":"my value"},{"html":"div>img","value":"your value"}]
 * @type Array
 */
var elemShowErrArr = []; 


/*** EVENT DRIVEN ***/

$(document).ready(function() {
  //
  var scope = $("div#div-content").scope(); //angular scope
  var enIndctr = "/en/"; //english version folder
  var currentUrl = window.location.href; //as mentioned, current accessed url
  var isEn = false; //verify user language
  var countFocus = 0;
    
  /**
   * Array of month short name
   * @type Array
   */
  var monthShortNameArr = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];
  
  /**
   * List of modul title
   * @type Object
   */
  var titleObj = {pln:"Listrik",pdam:"Air",multifinance:"Cicilan",bpjs:"Kesehatan"}; 
  
  //check user country
  startAnimation();
  $.get("https://ipinfo.io/json", function(response) {
    //bahasa in indonesia country only, otherwise english
    isEn = response.country !== "ID";  
    $("input#language").val(response.country);
  }).fail(function(status) {
    $("div#div-error").html("<span>"+(isEn ? "Currently offline, try again later." : "Sedang offline, coba beberapa saat lagi.")+"</span>");
  }).always(function(){
    //
    if(isEn) {
      monthShortNameArr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      titleObj = {pln:"Electricity",pdam:"Water Supply",multifinance:"Installment",bpjs:"Healthcare"};
    }                  
    //
    elemShowErrArr = [{html:"div#div-error",
                      value:(isEn ?
                                "<span>There is connection problems.<br/>Please reprocess again." :
                                "Ada masalah dengan koneksi.<br/>Silahkan diulang kembali.</span>")}];
  
    //assign header
    //$("div.header").load("../html/support/header.html" + " nav#top-navbar",function() {
      //true if currently in english version
      var hasEnIndctr = currentUrl.indexOf(enIndctr) > -1;
      //switch to user location if page is in different one
      if(isEn && !hasEnIndctr)
        window.location.replace(currentUrl.replace("/html/",enIndctr+"html/"));
      else if(!isEn && hasEnIndctr)
        window.location.replace(currentUrl.replace(enIndctr,"/"));
      //title
      $("span#span-title").text(titleObj[currentUrl.split("/").pop().replace(".html","")]);
      //assign previous url
      $("div#left-nav-button").children("a").attr("href",currentUrl);
      //input default padding
      $("input:not([type=radio])").css("padding-right","0");
    //});
    endAnimation();
  });
  
  //submit form (pay process)
  $("div.main-div form.form-input").submit(function(evt) {
    evt.preventDefault();
    
    //disable execute button to prevent it from multiple click
    toggleDisable(true,$(this).find(".btn-exec button"),"btn-disabled");
    
    //setup current date
    var dat = new Date();
    var dateStr = dat.getDate() + "  " + monthShortNameArr[dat.getMonth()] + "  " + dat.getFullYear();    
    
    //flush error message
    $("div#div-error").empty();
    
    //prepare payment section
    //post parameter to inquiry rest
    //redesign return view
    //var jsonSamp = {"billerid":"1", "productid":"MCF", "customerid":"5011001184", "customername":"SAPRI", "totalamount":"23000", "additionaldata":[ {"label":"No Kontrak","value":"5011001184","required":"mandatory","jumspasi":0}, {"label":"Nama Konsumen","value":"SAPRI","required":"mandatory","jumspasi":0}, {"label":"No Polisi","value":"BE3868DM","required":"optional","jumspasi":0}, {"label":"Angsuran Ke","value":"9","required":"optional","jumspasi":0}, {"label":"Tanggal Jatuh Tempo","value":"20101210","required":"optional","jumspasi":3}, {"label":"Total Tagihan","value":"23000","required":"mandatory","jumspasi":0}], "rc":"00", "rcdesc":"SUKSES", "mobileno":"081213121313","extendinfo":"", "checkouturl":"http://aphome.id.sandbox.dl.alipaydev.com/wallet/cashier/checkout?bizNo=20170615111212800110166839400003862", "signature":"7e47280fdc3a61ec3787e93bdc2e0d36"};
    scope.postAutoData("https://ids-fe1.com/PPMobileProject/webresources/inq",{},function(response) {      
      
      //initialize variable and object
      var jsonSamp = response.data; //json returndata
      $("div#div-paid table#add-data>tbody").empty();//flush view first
      $("button#btn-paid").data("paidUrl",jsonSamp["checkouturl"]);//assign url biller
      $("div#div-paid div#tagihan td:last-child").text(numberFormat(jsonSamp["totalamount"],".","Rp"));//(isEn ? "$" : "Rp")));//assign amount to pay
      
      //verify data is available
      if(jsonSamp["additionaldata"] === null || jsonSamp["rc"] !== "00") {
        $("div#div-error").html("<span>"+jsonSamp["rcdesc"]+"<span>");
      //if available, show inquiry, ready to pay
      } else {
        $("div#div-find, div#div-error").slideUp();
        $("div#div-paid, div#btn-flag-right, div#left-nav-button").slideDown();
        $("div#div-paid table#add-data>tbody").append("<tr><td>"+(isEn ? "Date" : "Tanggal")+"</td><td>"+dateStr+"</td></tr>");
        //iterate data
        $.each(JSON.parse(jsonSamp["additionaldata"]),function(idx,obj) {
        //$.each(jsonSamp["additionaldata"],function(idx,obj) {
          $("div#div-paid table#add-data>tbody").append(
                  "<tr"+(obj.required === "mandatory" ? "" : " class='hidden-tr'")+">" +
                    "<td>"+leftpad(obj.label,'&nbsp;',obj.jumspasi)+"</td><td>"+obj.value+"</td>" +
                  "</tr>"
          );
        });
      }
    });
  });
  
  //show/hide detail data
  $("img.show-detail").click(function() {
    if($("table#add-data tr.hidden-tr").length > 0) {
      $("table#add-data tr.hidden-tr").toggle("fade",200);
      $("div#show-hide").children().toggle();
    }
  });
  
  //forward to biller url
  $("button#btn-paid").click(function() {
    window.location.replace($(this).data("paidUrl"));
  });
  
  //assign product to selected option
  $("div#div-form ").on("click","tr>td>div#list-option li",function() {
    $("span#curr-option").text($(this).text());
    if($("span#curr-option").hasClass("option-passive"))
      $("span#curr-option").removeClass("option-passive").addClass("option-active");
    //$("div#list-option").slideToggle();
    if($("input#productid").length > 0)
      $("input#productid").val($(this).attr("id"));
    if($("input#extendinfo").length > 0)
      $("input#extendinfo").val($(this).attr("id"));
    $("div#current-fin>span").text($("span#curr-option").text().toUpperCase());
  });
  
  //show hide list options
  //$("div#div-form ").on("click","tr>td>span#curr-option, tr>td>img#right-option",function() {
  $("div#div-form ").on("click","tr>td#option",function() {
    $(this).children("div").slideToggle();
  });
  
  //show clear button on input focus
  $("input:not([type=radio])").focus(function() {
    if($(this).val().length > 0) {
      $(this).next("span").slideDown();
      $(this).css("padding-right","30px");
    }
    $("html,body").animate({scrollTop:1000},4000);
  });
  
  //hide clear button on leave input
  $("input:not([type=radio])").blur(function() {
    $(this).next("span").slideUp();
    $(this).css("padding-right","0");
    /*var scrollTimeOut = setTimeout(
                          function() {
                            $(window).scrollTop(0);
                            clearTimeout(scrollTimeOut);
                          },1000);*/
  });
  
  //show/hide clear button on typing
  $("input:not([type=radio])").keyup(function() {
    var len = $(this).val().length;
    if(len > 0) {
      $(this).next("span").slideDown();
      $(this).css("padding-right","30px");
    } else {
      $(this).next("span").slideUp();
      $(this).css("padding-right","0");
    }
  });
  
  //clear current input text on click clear button
  $("input:not([type=radio]) + span").click(function() {
    $(this).prev("input").val("");
    $(this).prev("input").focus();
  });
  
  //reposition clear button on radio button change
  $("input:radio").change(function() {
    reposElemFromSibling("input.form-control","span");
  });
  
  //execute some process on page loading
  $(window).load(function() {  
    //do it on load as resize do
    $(this).trigger("resize");
  });
  
  //dynamically resize execute button, reposition clear button, and reposition loading animation
  $(window).on("resize",function() {
    $("div.btn-exec").css("width",$("div#div-title").css("width"));
    reposElemFromSibling("input.form-control","span");
    $(".fore-cover>div").css("margin-top",($(window).height()/2)-48);
  });
});


/*********************************** S U P P O R T   F U N C T I O N ************************************/

/**
 * Reposition given element based on sibling element position
 * @param {String} sibling ,html element identifier which has position
 * @param {String} element ,html element sibling which will set the position
 * @returns {undefined}
 */
function reposElemFromSibling(sibling,element) {
  $(sibling).each(function() {
    var currOffset = $(this).offset();
    var currElem = $(this).next(element);
    if(currElem) {
      currElem.css("left",currOffset.left + Number($(this).css("width").replace("px","")) - 40); //40: left padding of input (15) + right margin of span (25)
      currElem.css("top",currOffset.top);
    }    
  });
}

/**
 * 
 * @param {boolean} disabled ,true:dusabled element, false:enabled element
 * @param {jQuery object} toggleElem ,element object to switch between enabled/disabled
 * @param {String} toggleClass ,class name which affected when enabled/disabled occurs
 * @returns {undefined}
 */
function toggleDisable(disabled,toggleElem,toggleClass) {
  if(disabled)
    toggleElem.addClass(toggleClass);
  else
    toggleElem.removeClass(toggleClass);
  toggleElem.prop("disabled",disabled);
}


/************************************ A N G U L A R   S E C T I O N ************************************/

/**
 * Angular application module
 * @type angular.module.angular-1_3_6_L1749.moduleInstance
 */
var angularApp = angular.module("angularApp",[]);

/**
 * Setup http/ajax service
 * @param {angular object} $http , ajax function accessor
 */
angularApp.service("paramserv", ["$http", function($http) {
  
  /**
   * Execution ajax call 
   * @param {String} method
   * @param {String} url
   * @param {Object} params , parameter pairs of name and value
   * @param {Object} data
   * @param {Object} headers
   * @param {Function} callback
   * @returns void
   */
  this.execajax = function (method, url, params, data, headers, callback) {
        
    //begin foreground animation
    startAnimation();
    
    //http property
    var prop = {method: method,
                url: url,
                params: params,
                data: data,
                headers: headers
              };
              
    //show message on post method and not in the download process
    var showMessage = (method.toLowerCase() === "post" && url.indexOf("download") === -1);
    
    /**
     * Ajax call
     * @param {Object} response , response object from ajax call
     */
    $http(prop).then(function success(response){
      
      //process response
      callback(response);
      
      //time to show the message if it was allowed
      if(showMessage) {
        if(response.data)
          showInfoMessage("Your change has been saved ..!");
        else
          showErrorMessage("Save got problem, your record may have relation ..!");
      }
      
    }, function error(response){   
      
      //define error message based on stack trace
      //show additional error
      if(elemShowErrArr.length > 0) {
        $.each(elemShowErrArr,function(idx,val) {
          $(val.html).slideDown();
          $(val.html).html(val.value);
        });
      }
    }).finally(function() {
      //enable execute button again after proceed
      toggleDisable(false,$(".btn-exec button"),"btn-disabled");
      //end foreground animation
      endAnimation();
    });
  };
  
  /**
   * Upload file
   * @param {String} url
   * @param {Object} formData , form object contain pair of name and value
   * @param {String} contentType
   * @param {Boolean} processData
   * @param {Boolean} cache
   * @param {Function} callback
   * @returns void
   */
  this.uploadfile = function(url,formData,contentType,processData,cache,callback) {
    
    //check user logged session
    checkCurrSessAndExec();
    
    //begin foreground animation
    startAnimation();
    
    /**
     * Ajax call
     * @param {Object} response , response object from ajax call
     */
    $.ajax({
      method: "POST",
      url: url,
      data: formData,
      contentType: contentType,
      processData: processData,
      cache: cache
    }).done(function(response) {
      
      //prompt success and proceed next process
      showInfoMessage("Your change has been saved ..!");
      callback(response);
      
    }).fail(function(response) {
      var showError = true;
      
      //show the default error if no error shown before
      if(showError)
        showErrorMessage("Oops something wrong with the uploaded file or the development ..!: " + response.status);
      
    }).always(function() {
      //end foreground animation
      endAnimation();
    });
  };
}]);

/**
 * Setup data access
 * @param {angular object} $http , ajax function accessor
 */
angularApp.service("dataserv", function(paramserv) {
  
  /**
   * Get json data from given url by specific params
   * @param {String} url
   * @param {Object} params , parameter pairs of name and value
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  this.getData = function(url,params,data,callback) {
    paramserv.execajax("GET",url,params,data,{"Content-Type": "application/json"},callback);
  };
  
  /**
   * Get json data from given url by specific params without defining contents-type
   * @param {String} url
   * @param {Object} params , in form of pairs of name and value
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  this.getDataNonJson = function(url,params,data,callback) {
    paramserv.execajax("GET",url,params,data,null,callback);
  };
  
  /**
   * Post data to specific url to be saved to database
   * @param {String} url
   * @param {Object} params
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  this.postData = function(url,params,data,callback) {
    paramserv.execajax("POST",url,params,data,{"Content-Type": "application/json"},callback);
  };
  
  /**
   * Post params to specific url to be saved to database
   * @param {String} url
   * @param {Object} params , in form of pairs of name and value
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  this.postDataNonJson = function(url,params,data,callback) {
    paramserv.execajax("POST",url,params,data,null,callback);
  };
  
  /**
   * Upload file to specific url by given params
   * @param {String} url
   * @param {Object} params , in form of pairs of name and value
   * @param {Function} callback
   * @returns void
   */
  this.uploadFile = function(url,params,callback) {
    var formData = new FormData();
    for(var key in params) {
      formData.append(key,params[key]);
    }
    paramserv.uploadfile(url,formData,false,false,false,callback);
  };
});

/**
 * Setup DOM manipulation
 * Access via angular service
 */
angularApp.service("domserv", function() {
  
  /**
   * Function sample to be replaced
   * @param {Object} data
   * @returns void
   */
  this.futureFunc = function(data) {
    //TODO code
  };
  
  /**
   * Show the given modal
   * @param {String} modalName
   * @returns void
   */
  this.showModal = function(modalName) {
    $(modalName).modal("show");
  };
  
  /**
   * Hide the givem modal
   * @param {String} modalName
   * @returns void
   */
  this.hideModal = function(modalName) {
    $(modalName).modal("hide");
  };
  
  /**
   * Assign data from form to be posted later
   * @returns data object, in form of name and value pair
   */
  this.assignData = function() {
    
    var objData = {};//data container
    var masterDetail = false;//form in master detail forming
    var fieldArr = [];//field array of master detail
    
    //on update detail of the master
    //assign detail id to the container
    if(masterDetail) {
      var dataIdList = [];
      $("table#tbl-data>tbody>tr").each(function() {
        if($(this).find("td>input#inputVerif").prop("checked") === true) {
          dataIdList.push($(this).data("id"));
        }
      });
      if(dataIdList.length > 0) {
        if(fieldArr[0])
          objData[fieldArr[1]] = $(fieldArr[2]).val();
        objData[fieldArr[1]] = dataIdList;
      }
    
    //normal assign
    //assign each field of the form into container
    } else {
      
      //loop through data
      $("form.form-input input, form.form-input select").each(function() {
        if($(this).is(":checkbox")) 
          objData[$(this).attr("id")] = $(this).prop("checked")+"";
        else if($(this).is(":radio") && $(this).is(":checked"))
          objData[$(this).attr("name")] = $(this).val();
        else
          objData[$(this).attr("id")] = $(this).val();
      });
      
      //signature
      var signStr = "";
      $.each(objData,function(name,val) {
        signStr = signStr + val;
      });
      objData["signature"] = md5(signStr);
    }
    //remove unidentified field
    delete objData.undefined;
    
    //alert(JSON.stringify(objData));
    return objData;
  };
});

/**
 * Setup controller 
 * @param {Object} $scope angular scope service
 * @param {Object} $compile angular compile service
 * @param {Object} dataserv custom angular data service
 * @param {Object} domserv custom angular DOM service
 */
angularApp.controller("angularCtrl", function($scope,$compile,dataserv,domserv) {
  
  //data object, contain list of objects
  $scope.data = {};
  
  /**
   * Assign scope data
   * @param {Object} data
   * @returns void
   */
  $scope.store = function(data) {
    $scope.data = data;
  };
  
  /**
   * Show/hide item by comparing its value and the default
   * @param {String} itemVal
   * @param {String} defVal default value
   * @returns {Boolean}
   */
  $scope.hideItem = function(itemVal,defVal) {
    if(itemVal === defVal)
      return true;
    return false;
  };
  
  /**
   * check given condition, set value if it is true/false
   * @param {Boolean} cond condition
   * @param {String} trueVal
   * @param {String} falseVal
   * @returns {String}
   */
  $scope.setCondVal = function(cond, trueVal, falseVal) {
    if(cond)
      return trueVal;
    return falseVal;
  };
  
  /**
   * Switch radio button based on given parameter value
   * @param {String} radioEnable verification of radio button 
   * @param {String} currentValue
   * @param {String} fieldValue
   * @returns {String}
   */
  $scope.radioButton = function(radioEnable,currentValue,fieldValue) {
    if(radioEnable === "true") {
      if(currentValue === fieldValue)
        return "on";
      else
        return "off";
    } else {
      return "disable";
    }
  };
  
  /**
   * Validated data value, if it verified then switch it to a new value, otherwise no action needed
   * @param {String} valToSwitch , value to be verified
   * @param {String} switchedVal , switched value
   * @param {String} checkedVal , verified value
   * @returns void
   */
  $scope.switchValTo = function(valToSwitch,switchedVal,checkedVal) {
    if(valToSwitch === checkedVal)
      return switchedVal;
    return valToSwitch;
  };
  
  /**
   * Get data via AJAX based on given url and parameter
   * @param {String} url
   * @param {Object} params , in form of pairs of name and value
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  $scope.getData = function(url,params,data,callback) {
    
    //execute AJAX call
    dataserv.getData(url,params,data,callback);    
  };
  
  /**
   * Get data via AJAX based on given url and parameter without defining contents-type
   * @param {String} url
   * @param {Object} params , in form of pairs of name and value
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  $scope.getDataNonJson = function(url,params,data,callback) {
    dataserv.getDataNonJson(url,params,data,callback);
  };
  
  /**
   * Post data to be saved to database
   * @param {String} url
   * @param {Object} params , parameter in form of name and value pair
   * @param {Object} data , must be in form of java object (see each correlation class)
   * @param {Function} callback
   * @returns void
   */
  $scope.postData = function(url,params,data,callback) {
    dataserv.postData(url,params,data,callback);
  };
  
  /**
   * Post data to be saved to database with existing data
   * @param {String} url
   * @param {Object} params , in form of pairs of name and value
   * @param {Function} callback
   * @returns void
   */
  $scope.postAutoData = function(url,params,callback) {
    $scope.$apply();
    
    //execute AJAX call
    //domserv.assignData();
    dataserv.postData(url,params,domserv.assignData(),callback);
  };
  
  /**
   * Upload specific file
   * @param {String} url
   * @param {Object} params , parameter in form of name and value pair
   * @param {Function} callback
   * @returns void
   */
  $scope.uploadFile = function(url,params,callback) {
    dataserv.uploadFile(url,params,callback);
  };
  
  /**
   * Show given modal
   * @param {String} modalName
   * @returns void
   */
  $scope.showModal = function(modalName) {
    domserv.showModal(modalName);
  };
  
  /**
   * When working with modal object we need recompiling angular object, so they could listen to the data change
   * @param {Object} obj , object to compile
   * @returns void
   */
  $scope.compileObject = function(obj) {
    $compile(obj)($scope);
  };
  
  $scope.assignData = function() {
    return domserv.assignData();
  };
});