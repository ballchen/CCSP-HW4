var request = require('request');
var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var page = 1;
var appleurl = "http://www.appledaily.com.tw/realtimenews/section/new/";
var applejson = [];
var high_cate;
var high_number = 0;

http.createServer(function(req,res){
	res.writeHead(200, {"Content-Type": "application/json"});
	getnews(1);
	
}).listen(5000);	


function getnews(i){
	if(i < 6){


		request.get((appleurl+i),function(err,body,result){
			if (!err && body.statusCode == 200) {
			    var $ = cheerio.load(result);
			    $('li.rtddt').each(function(i, element){
		    	var type=$(this).find('h2').text();
		    	var title =$(this).find('h1').text();
		    	var url=$(this).find('a').attr('href');
		    	var time = $(this).find('time').text();
		    	var video = $(this).hasClass('hsv');
		    	//console.log(video + time + type + title + url);
		    	
		    	obj ={
                        "title": title,
                        "url": url,
                        "time": time,
                        "video": video,
                };

                classify(obj,type);
                
		    })
		    
		  	}
		 getnews(i+1);

		})
		}

	else{
		fs.writeFile('./applejson.json',JSON.stringify(applejson),function(err){
			console.log("!!!!!");
			gethigh(function(){
				D = new Date();
				console.log(D.getFullYear()+"/"+D.getMonth()+"/"+D.getDate()+" "+D.getHours()+":"+D.getMinutes()+" -新聞數量最多的分類為為 ["+high_cate+"] ，共有 "+high_number+" 則新聞")
				// date.getFullYear()+"/"+date.getMonth()+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+
			});
		

		});
	
	}

}

function classify(obj, type){
	fs.exists('applejson.json', function(exists){
		
		var cate_exist = false;
		
		if(applejson.length === 0){
			
			applejson.push({"category": type, "news_counts":1, news:[obj]});
						
		}
		else{

			for(var index in applejson){

				if(type === applejson[index].category){
					cate_exist = true;
					// console.log(applejson[index].category +" " + JSON.stringify(applejson[index].news));
					applejson[index].news_counts += 1;
					applejson[index].news.push(obj);
				}
			}

			if(cate_exist === false){
				applejson.push({"category": type, "news_counts":1, "news":[obj]});
			}
		}	
	})			
}

function gethigh(callback){
	for(var index in applejson){
		if(applejson[index].news_counts > high_number){
			high_cate = applejson[index].category;
			high_number = applejson[index].news_counts;
		}
	}
	callback();
}
