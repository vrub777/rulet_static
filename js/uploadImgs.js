var Main;
if(Main == undefined) {
	Main = {};
}
Main.UploaderImg = {};

Main.UploaderImg.ImgParams = { count: 0, idCatalog: 0 };

Main.UploaderImg.Init = function(p) {
	// Область отображения файлов
	var imgDomain = p.ImgDomain;
	// Стандарный input для файлов
    var inputFile = p.InputFile;
	
	// Область для перетаскивания drag and drop
    var domainFiles = p.DomainFiles; //$("#domain-list-images");
	
	// Максимально возможное число загружаемых картинок
	var countImageLimite = p.CountImageLimite || 3;
	
	// Максимальный размер картинки в киллобайтах
	var maxSizeImgInKb = p.MaxSizeImgInKb || 5120;
	
	var pathServerLoad = p.PathServerLoad;
	
	var pathServerRemove = "listcategores/removeimgcategory"
	
	//Путь на сервере до статической картинки
	var pathStaticImg = p.PathStaticImg;
	
	var maxSizeImgInMb = (Math.round(maxSizeImgInKb / 1024));
	
	var errorUploadList = $("#upload-list-errors");
	
	var maxWidthImg = 20000;
	
	var maxHeightImg = 20000;
	
	var minWidthImg = 100;
	
	var minHeightImg = 100;
	
	// id Категории (привязки) сущности к которой будут относиться изображения
	var idCategory = 0;
	
	// Массив ошибок для отображения
	var errors = [];
	
	// Динамические параметры об изображениях
	imgParams = Main.UploaderImg.ImgParams; 
	
    var imgSize = 0;
	
	//Обновление текстовых параметров
	$("#countImgsUpload").html(countImageLimite.toString());
	$("#sizeImgUploadInMb").html(maxSizeImgInMb.toString());
	
	// Обновление progress bar'а
    updateProgress = function(bar, value) {
		if(value >= 100) {
			bar.removeClass("progress");
			bar.addClass("progress-sucess");
		}
		
        var width = bar.width();
        var bgrValue = -width + (value * (width / 100));
		var color = "#000";
		if(value > 60) {
			color = "#fff";	
		}
		bar.attr('rel', value).css({'background-position': bgrValue+'px center', 'color': color}).text(value+'%');
    }
	
	updateProgressIn0 = function(bar) {
		var width = bar.width();
		var color = "#000";
		bar.attr('rel', 0).css({'background-position': width+'px center', 'color': color}).text('0%');
    }
	
	deleteImg = function(obj, idNumImg) {
		$(obj).parent().remove();
		deleteImgInServer();
		imgParams.count--;
	}
	
	deleteImgInServer = function(){
		var request = $.ajax({
		        url: pathServerRemove + "/" + imgParams.idCatalog,
		        type: 'POST',
		        cache: false,
		        contentType: false,
		        processData: false,
		});
		//request.done(function( msg ) {
  		//	console.log( "123123 - " + msg.status );
		//});
	}
	
	// Отображение файлов в области загруженных файлов
	displayImgs = function(files, callback) {
		var num = 0
		
		console.log("Количество внутри " + imgParams.count );
        if((imgParams.count + files.length) > countImageLimite){
			errors.push("Вы попытались загрузить файлов: " + files.length + "");
			errors.push("Число максимально загружаемых файлов: " + countImageLimite);
			return;
		}
		
        $.each(files, function(i, file) {
			var sizeFile = Math.round(file.size / 1024);
			if(num >= countImageLimite) {
				imgParams.count = countImageLimite;
				errors.push("Число максимально загружаемых файлов: " + countImageLimite);
				return true;
			}
			
			if(!isImgFile(file)) {
				errors.push("Файл " + file.name + " не является изображением!");
				return true;
			}
			
			if(sizeFile > maxSizeImgInKb) {
				errors.push("Файл " + file.name + " слишком большого размера! \
					Максимально допустимый размер: " + maxSizeImgInMb + " Mb");
				return true;
			}
            
            num++;
            
            // Создаем элемент li и помещаем в него название, миниатюру и progress bar,
            // а также создаем ему свойство file, куда помещаем объект File (при загрузке понадобится)
            var li = $('<li/>').appendTo(imgDomain);
            var img = $('<img/>').appendTo(li);
            $('<div/>').addClass('progress').attr('rel', '0').text('0%').appendTo(li);
			$('<div/>').addClass('close-img').click(function(){ deleteImg(this, i); }).appendTo(li);
            li.get(0).file = file;
			
            // Создаем объект FileReader и по завершении чтения файла, отображаем миниатюру и обновляем
            // инфу обо всех файлах
            var reader = new FileReader();
			reader.onprogress = (function(aImg) {
				return function(e) {
                    aImg.attr('src', pathStaticImg + "/loading_min.gif");
                };
			})(img);
            reader.onload = (function(aImg) {
				return function(e) {
						aImg.attr('src', e.target.result);
						aImg.attr('width', 80);
						aImg.attr('height', 60);
	                    imgParams.count++;
	                    imgSize += file.size;
                	};
            })(img);
            reader.readAsDataURL(file);
        });
	}
	
	isImgFile = function(file) {
		var imageType = /image.*/;	
        if (!file.type.match(imageType)) {
            return false;
        }
		return true;
	}
	
	uploadToServerImgs = function() {
		var i = 0;
		idCategory = $("#idCat").val();
		
		imgDomain.find('li').each(function() {
			var data = new FormData();
			var uploadItem = this;
            var pBar = $(uploadItem).find('.progress');
			data.append('file-'+i, uploadItem.file);
			i++;
			
			$.ajax({
		        url: pathServerLoad + "/" + idCategory,
		        type: 'POST',
		        data: data,
		        cache: false,
		        contentType: false,
		        processData: false,
		
		        // Custom XMLHttpRequest
		        xhr: function() {
		            var myXhr = $.ajaxSettings.xhr();
		            if (myXhr.upload) {
		                // For handling the progress of the upload
		                myXhr.upload.addEventListener('progress', function(e) {
							var nowProgress = Math.round((e.loaded * 100) / e.total);
							if (e.lengthComputable) {
								updateProgress(pBar, nowProgress);
							}
		                } , false);
		            }
		            return myXhr;
		        },
			    success: function(dataServer){
					if(dataServer.status != "Ok") {
						var img = $(uploadItem).find('img');
						img.attr('src', '');
						img.attr('title', 'Большое разрешение');
						alert(dataServer.error);
						updateProgressIn0(pBar);
					} 
				}
		    });
		});
	}
	
	setErrorsToList = function() {
		errorUploadList.empty();
		$.each(errors, function(i, error) {
			var elementError = "<li>" + error +"</li>";
			var li = $(elementError).appendTo(errorUploadList);
		});
		errorsDataRemove();
	}
	
	errorsDataRemove = function() {
		errors = [];
	}
	
    inputFile.bind({
        change: function() {
            displayImgs(this.files, function(num) {	});
			uploadToServerImgs();
			setErrorsToList();
        }
    });
	
    domainFiles.bind({
        dragenter: function() {
            $(this).addClass('highlighted');
            return false;
        },
        dragover: function() {
            return false;
        },
        dragleave: function() {
			$(this).removeClass('highlighted');
            return false;
        },
        drop: function(e) {
			$(this).removeClass('highlighted');
            var dt = e.originalEvent.dataTransfer;
            displayImgs(dt.files, function(num) { });
			uploadToServerImgs();
			setErrorsToList();
            return false;
        }
    });	
}

// Отображение файлов в области загруженных файлов с сервера
Main.UploaderImg.DisplayImgsByUrl = function(p, url) {
	// Область отображения файлов
	var imgDomain = p.ImgDomain;
	
	var li = $('<li/>').appendTo(imgDomain);
    var img = $('<img src="' + url + '" width="80" height="60" />').appendTo(li);
    $('<div/>').addClass('progress-sucess').css({'background-position': '0px center', 'color': '#fff'}).attr('rel', '100').text('100%').appendTo(li);
	$('<div/>').addClass('close-img').click(function(){ deleteImg(this, 0); }).appendTo(li);
}

Main.UploaderImg.CleanImgDomain = function(imgDomain, errorList) {
	if(typeof imgDomain != "undefined") {
		imgDomain.empty();
	}
	if(typeof errorList != "undefined") {
		errorList.empty();
	}
}

/*
	p - параметры необходимые для отображения ранее загруженных изображений, где
	p.ImgDomain	- область отображения изображений
	p.UrlOneImg - Путь до изображения, если оно одно
	p.ErrorList - Список ошибок
*/
Main.UploaderImg.InitImgesInDomain = function(p) {
	// Область отображения файлов
	var imgDomain = p.ImgDomain;
	var urlOneImg = p.UrlOneImg;
	var errorList = p.ErrorList;
	
	Main.UploaderImg.ImgParams.count = 0;
	
	if (urlOneImg == "") {
		return;
	}
	
	Main.UploaderImg.CleanImgDomain(imgDomain);
	createStartImg(imgDomain, urlOneImg);
	Main.UploaderImg.ImgParams.count++;
}

createStartImg = function(imgDomain, url) {
	var li = $('<li/>').appendTo(imgDomain);
    var img = $('<img src="' + url + '" width="80" height="60" />').appendTo(li);
    $('<div/>').addClass('progress-sucess').css({'background-position': '0px center', 'color': '#fff'}).attr('rel', '100').text('100%').appendTo(li);
	$('<div/>').addClass('close-img').click(function(){ deleteImg(this, 0); }).appendTo(li);	
}