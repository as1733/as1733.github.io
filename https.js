{
    var https = require('https');
    var fs = require('fs');
    var WebSocket = require('ws').Server;

    var options = {
        key: fs.readFileSync('vedochat.key'),
        cert: fs.readFileSync('vedochat.cert')
    };
    var site = "Hello WORLD";
    fs.readFile('WorkPage.html', function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            site = data;
        }


    });

    var a = https.createServer(options, function (req, res) {


        res.writeHead(200);
        res.write(site.toString());
        res.end();
    });
    a.listen(1310, "localhost");
    var wss = new WebSocket({server: a});
    var users={};
   // var userset1={aditya:"connection",vikram:"connection2"};
    //var userset2={maa:"connection3",dadu:"connection4",somaya:"connection5"};
    //var rooms={first:userset1,second:userset2};
var rooms={};
}

wss.on("connection",function(link){console.log("Connected new user");
      var get={action:"listofactive",roomnames:[],noofusers:[]};
    for(var r in rooms)
        {if(Object.keys(rooms[r]).length>0) {
            get.roomnames.push(r);
            get.noofusers.push(Object.keys(rooms[r]).length);
            console.log("Room name "+r);
        }
        }
        var replas={action:"listofactive",roomsa:get};
    link.send(JSON.stringify(get));



    console.log(link._socket.remoteAddress);
link.on("close",function(connection){

    for(var x in rooms)
    {console.log("User in room "+x);
        var seta={};
        for (var y in rooms[x])
        {console.log(""+y);
            if(   rooms[x][y]!=link)
            {seta[y]=rooms[x][y];

            }
            else{
                console.log("XXXXXXXXXXXXXXXXXXX USER DISSCONECTED XXXXXXXXXXXXXXXXXXXXXXX--"+y);
            }
        }console.log("NEW ROOMS LIST ");
        if(rooms[x]!=seta) {
        rooms[x]=seta;
            console.log(rooms[x]);
        }
    }


});
link.on("error",function(err){console.log("Error Occured"+err);});
link.on("message",function(data){
data=JSON.parse(data);
if(data.action==="Create"){createRoom(data,link);
}
if(data.action==="joining"){joinroom(data,link)

}
if(data.action==="Offer"){
    console.log("Relaying offer from "+data.rootuser+" to "+data.remoteuser)
    rooms[data.rmid][data.remoteuser].send(JSON.stringify(data));
}
if(data.action==="answer"){
    rooms[data.rid][data.to].send(JSON.stringify(data));
}
if(data.action==="ice"){
    console.log("Relaying the ICE candidate from "+data.origin+" to "+data.destination);
    rooms[data.rid][data.destination].send(JSON.stringify(data));
}
if (data.action==="listofactive"){
    var get={action:"listofactive",roomnames:[],noofusers:[]};
    for(var r in rooms)
    {if(Object.keys(rooms[r]).length>0) {
        get.roomnames.push(r);
        get.noofusers.push(Object.keys(rooms[r]).length);
        console.log("Room name "+r);
    }
    }
    var replas={action:"listofactive",roomsa:get};
    link.send(JSON.stringify(get));
}




});/*  message wala cope*/



});


function createRoom(data,connection) {
    var status = 0;

    for (var x in rooms) {
        if (data.roomid === x  && Object.keys(rooms[x]).length>0) {
            status=-1;

            console.log("Already existing room");
            console.log("Status Y="+status);
        }

    };
    if(status!=-1){var temp={};

    temp[""+data.username]=connection;


        rooms[""+data.roomid]=temp;
         status=1;
        console.log("Success in room creation Status Y="+status);
         };
         console.log("Sending REply for room creation request "+data.roomid+"statust = "+status);
    reply={action:"Create",execution:status};
   /* for(var x in rooms){
        console.log(x);
    };  room names*/
    connection.send(JSON.stringify(reply));

}
function joinroom(data,connection){
    var roomstate=1;//0 is neutral .1 means roomid wrong 2.means username already exists
    var usernamestate=0;//0 is neutral .1 means roomid wrong 2.means username already exists
    var userlist=new Array();
    console.log("Executed joining the room query for room"+data.rid);
    for(var x in rooms){
        if(x===data.rid)
        {roomstate=0;
            console.log("we found the room"+data.rid);
            for(var y in rooms[x])
            {userlist.push(y);
                if (y===data.username){usernamestate=2;

               }

            }
        }
    }
   if(roomstate===0&& usernamestate===0){

       console.log("adding user "+data.username+"to the room "+data.rid);
       userlist.push(data.username);
       rooms[data.rid][data.username]=connection;
          // var userlist2send={action:"updateUserList",listOfUser:userlist}
           /* for(var test in rooms[data.rid])
            {rooms[data.rid][test].send(JSON.stringify(userlist2send));

            }
*/
   }
   else if (roomstate===1){console.log("room od was wrong");}
    else if (usernamestate===2){console.log("Nick in the room was taken");}
 console.log("These are connected "+JSON.stringify(userlist));
    var reply={action:"joining",userstate:usernamestate,roomidstate:roomstate,listOfUser:userlist};
console.log("Server Sending reply for joing request to user "+data.username);
connection.send(JSON.stringify(reply));
}