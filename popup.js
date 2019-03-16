var savetype = "";

window.onload = function(){
  document.getElementById("btnhtml").onclick = function(){
    savetype = "html";
    $('#buttons').css("display", "none");
    $('#save').css("display", "block");
    chrome.tabs.executeScript(null, {file: "content_script.js"});

  };

  document.getElementById("btntxt").onclick = function(){
    savetype = "txt";
    $('#buttons').css("display", "none");
    $('#save').css("display", "block");
    chrome.tabs.executeScript(null, {file: "content_script.js"});
  };
};



chrome.runtime.onConnect.addListener(function(port) {
  var tab = port.sender.tab;
  port.onMessage.addListener(function(info) {

    var title = "";
    
    if (savetype == "html")
      $('#buf').html(info.selectionHTML.replace(/<!--[\s\S]*?-->/g, ""));
    else{
      var str = info.selectionTXT.replace(/\n/g,'<br>\n');
      $('#buf').html(str);
    }

    var i = 1;
    $('img').each(function(){
      i++;
      $(this).after("<br>");
      $(this).width("100%");
      $(this).height("auto");

      var proto = info.host.split(':')[0];
      var link = $(this).attr('src');
      if (typeof(link) === 'undefined')
	return;
      if ((link.charAt(0) != '/') && (link.indexOf('http') != 0)){
	link = (info.host + "/" + info.path + "/" + link).replace(/\/\//g,'/').replace(/\:\//g,'://');
      }
      if (link.indexOf('//') == 0)
	link = proto + ":" + link;
      if (link.indexOf('http') != 0)
	link = info.host + "/" + link;
      
      $(this).attr('src','');
      this.src=link;
      $(this).one('load', function() {
	var dataurl = getBase64Image(this);
	this.src = dataurl;
	console.log(this);
	
      }).each(function() {
	if(this.complete) $(this).load();
      });
      
    });
    
    $('h1').each(function(){
      if (title.length < 3){
	title = $(this).html();
	$(this).remove();
      }
    });
    $('h2').each(function(){
      if (title.length < 3){
	title = $(this).html();
	$(this).remove();
      }
    });
    $('h3').each(function(){
      if (title.length < 3){
	title = $(this).html();
	$(this).remove();
      }
    });
    $('strong').each(function(){
      if (title.length < 3){
	title = $(this).html();
	$(this).remove();
      }
    });
    $('b').each(function(){
      if (title.length < 3){
	title = $(this).html();
	$(this).remove();
      }
    });
//     $('p').each(function(){
//       if (title.length < 3){
// 	title = $(this).html().substring(0,100);
// 	$(this).remove();
//       }
//     });
    
    $('a').each(function(){
      var proto = info.host.split(':')[0];
      var link = $(this).attr('href');
      if (typeof(link) === 'undefined')
	return;
      if (link.charAt(0) != '/')
	link = (info.host + "/" + info.path + "/" + link).replace(/\/\//g,'/').replace(/\:\//g,'://');
      if (link.indexOf('//') == 0)
	link = proto + ":" + link;
      if (link.indexOf('http') != 0)
	link = info.host + "/" + link;
      
      this.target="_system";
      this.href = link;
    });
    
    setTimeout(function(){
      // Saving file
      
      if (title.length < 3)
      {
        console.log ($('#buf').html().indexOf("<"));
	      title = $('#buf').html().substring(0,$('#buf').html().indexOf("<"));
	      var replaced = $("#buf").html().replace(title,"");
	      $("#buf").html(replaced);
      }
      
      title = $(title).text();

      
      
      var data = "<html><head><meta charset='utf-8'>\
	<meta name='viewport' content='width=device-width, initial-scale=1'>\
	</head><body><div id='name'><h1>"+title+"</h1></div>\
	<div id='content'>"+$('#buf').html()+"</div></body>";

      var url = window.webkitURL || window.URL || window.mozURL || window.msURL;
      var a = document.createElement('a');
      a.download = 'page.html';
      var blob = new Blob([data], {type: "text/html;charset=UTF-8"});
      a.href = url.createObjectURL(blob);
      a.textContent = 'save';
      a.dataset.downloadurl = ['html', a.download, a.href].join(':');
      a.click();
      $('#buf').html();
      setTimeout(function(){window.close();},500);
    },i*1000);
    
  });
});


function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL;
}