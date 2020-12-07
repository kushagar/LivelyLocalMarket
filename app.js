var express=require('express'),
bodyParser=require('body-parser'),
 bycrypt=require('bcrypt'),
app=express(),
uniqid=require('uniqid');
var session=require("express-session");
var lat=" ";
var longi=" ";
const { query } = require('express');
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database:'UserDB'
});
app.use(session({
  secret:"randomgibberish",
  saveUninitialized:false,
  resave:false
}))
db.connect(err => {
  if(err) {
    console.log(err);
  } else {
    console.log('DB connected');
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
//signup page
app.get("/signup",function(req,res){
  res.render("signup");
})
app.post("/location",function(req,res){
  key=Object.keys(req.body);
  lat=req.body[key[0]];
  longi=req.body[key[1]];
  console.log(lat,longi);
})
app.post("/deletecomment/:commentid",function(req,res){
     let query="SELECT * FROM comments WHERE id=?";
     db.query(query,req.params.commentid,function(err,data){
       if(!err){
         
         console.log(data);
         let query1="DELETE FROM comments where id=?";
         db.query(query1,req.params.commentid,function(err){
           if(!err){
             res.redirect("/dealers/".concat(email));
           }
         })
       }

     })
    

})
//edit an existing comment
app.get("/editcomment/:commentid",function(req,res){
  let query="SELECT * FROM comments WHERE id=?";
  db.query(query,req.params.commentid,function(err,data){
      if(!err){
        res.render("editcomment.ejs",{comment:data[0]});
      }else{
        console.log(err);
      }
  });
})
app.post("/editcomment/:commentid",function(req,res){
    let query="UPDATE comments SET comment=?, rating=? WHERE id=?";
    db.query(query,[req.body.comment,req.body.rating,req.params.commentid],function(err){
      if(!err){
        console.log("comment updated");
        let query1="SELECT * FROM comments WHERE id=?";
        db.query(query1,req.params.commentid,function(err,result){
          res.redirect("/dealers/".concat(result[0].fromemail));
        })
        
      }else{
        console.log(err)
      }
    })
});
//create a new comment
app.get("/createcomment/:toemail/:fromemail",function(req,res){
  res.render("createcomment.ejs",{email:req.params.toemail,fromemail:req.params.fromemail,user:req.session.user_id});
})
app.post("/createcomment/:email/:fromemail",function(req,res){
  let query="INSERT INTO comments VALUES(?,?,?,?,?)";
  var id=uniqid();
  db.query(query,[req.params.email,req.body.comment,parseInt(req.body.rating),id,req.params.fromemail],function(err){
    if(!err){
      console.log("Comment added");
      res.redirect("/dealers/".concat(req.params.fromemail));
     
    }else{
      console.log(err);
    }
  })

})
//default for students
app.get("/home",function(req,res){
  console.log(req.session.user_id);
  res.render("index.ejs",{user:req.session.user_id});
})
app.post("/logout",function(req,res){
  req.session.user_id=undefined;
  res.redirect("/home");
});
//populate cobblers
app.get("/cobblers",function(req,res){
   let query="SELECT * FROM cobbler";
   db.query(query,function(error,result){
     console.log(result);
     res.render("cobbler",{cobblers:result,user:req.session.user_id});

   });
});
//populate Barbers
app.get("/barbers",function(req,res){
  let query="SELECT * FROM barber";
  db.query(query,function(error,result){
    if(error){
      console.log(error);
    }
    
    res.render("barbers",{barbers:result,user:req.session.user_id});

  });
});
//populate fruitvendors
app.get("/fruitvendors",function(req,res){
  let query="SELECT * FROM fruitvendor";
  db.query(query,function(error,result){
    res.render("fruitvendors",{fruitvendors:result,user:req.session.user_id});

  });
});
//populate groceries
app.get("/groceries",function(req,res){
  let query="SELECT * FROM groceries";
  db.query(query,function(error,result){
    if(!error){
    res.render("groceries",{groceries:result,user:req.session.user_id});
    }else{
      console.log(error);
    }

  });
});
//create description
app.get("/createDescription/:email/:occupation",function(req,res){
  
       res.render("createdescription.ejs",{email:req.params.email,occupation:req.params.occupation,user:req.session.user_id});

})
app.post("/createDescription/:email/:occupation",function(req,res){
      let query="INSERT INTO descript VALUES(?,?,?)";
      db.query(query,[req.params.email,req.body.description,req.params.occupation],(err)=>{
        if(!err){
          
          console.log("Description added");
          res.redirect("/dealers/".concat(req.params.email));
        }else{
          console.log(err);
        }
      })
});

//edit Description display page
app.get("/description/:email",function(req,res){
  console.log(req.params.email);
  let query=`SELECT * FROM descript WHERE email=?`;
  db.query(query,req.params.email,function(err,descript){
    if(err){
      console.log(err);
    }else{
      console.log(descript[0]);
    res.render("editdescription.ejs",{descript:descript[0],user:req.session.user_id});
    }
  })
})
//edit description actual work
app.post("/description/:email",function(req,res){
  let query=`UPDATE descript SET description=? WHERE email=?`;
  db.query(query,[req.body.description,req.params.email],function(err){
    if(!err){
      //res.redirect(`/dashboard/'${req.params.email}'`);
      console.log("comment updated");
      res.redirect("/dealers/".concat(req.params.email));
    }else{
      console.log(err);
    } 
  })
})
//show description and comments
app.get("/dealers/:email",isloggedinstudent,function(req,res){
  let query=`SELECT * FROM descript WHERE email='${req.params.email}'`;
  db.query(query,function(error,result){
    if(!error){;
    let query1=`SELECT * FROM comments where email=?`;
    db.query(query1,req.params.email,function(err,comments){
      if(!err){
        
        let query3=`SELECT * FROM ${result[0].occupation} where email=?`;
        console.log(result[0]);
        db.query(query3,[req.params.email],function(err,dealer){
          if(!err){
            res.render("showdealer",{comments:comments,descript:result[0],user:req.session.user_id,dealer:dealer[0]});
          }else{
            console.log(err);
          }    
       })
     
      
      }
    })

  }else{
    console.log(error);
  }
});
});
//login page
app.get("/login",function(req,res){
  res.render("login");
})
//login route
app.post("/login",function(req,res){
  if(req.body.occupation==="Student"){
  let query=`SELECT * FROM students WHERE email='${req.body.Email}'`;
  console.log(query);
  db.query(query,function(err,result){
    if(err){
      console.log(err);

    }if (result[0]){
      console.log(result[0])
      bycrypt.compare(req.body.password,result[0].password ,function(err,same){
        console.log(same);
        if(same){
          console.log("passwords match");
          
          req.session.user_id={email:req.body.Email,occupation:"student"};
          res.redirect("/home");

        }else{
          console.log("password don't match");
          res.redirect("/login");
        }
      })
    }else{
      console.log("No such account");
      res.redirect("/login");
    }
    
  })}else if(req.body.occupation==="Groceries"){
    let query=`SELECT * FROM groceries WHERE email='${req.body.Email}'`;
    console.log(query);
    db.query(query,function(err,result){
      if(err){
        console.log(err);
  
      }if (result[0]){
        console.log(result[0])
        bycrypt.compare(req.body.password,result[0].password ,function(err,same){
          console.log(same);
          if(same){
            console.log("passwords match");
            req.session.user_id={email:req.body.Email,occupation:"groceries"};
            res.redirect("home");
  
          }else{
            console.log("password don't match");
            res.redirect("/login");
          }
        })
      }else{
        console.log("No such account");
        res.redirect("/login");
      }
      
    })
  }else if(req.body.occupation==="Fruit Vendor"){
    let query=`SELECT * FROM fruitvendor WHERE email='${req.body.Email}'`;
    console.log(query);
    db.query(query,function(err,result){
      if(err){
        console.log(err);
  
      }if (result[0]){
        console.log(result[0])
        bycrypt.compare(req.body.password,result[0].password ,function(err,same){
          console.log(same);
          if(same){
            console.log("passwords match");
            req.session.user_id={email:req.body.Email,occupation:"fruitvendor"};
            res.redirect("home");
  
          }else{
            console.log("password don't match");
            res.redirect("/login");
          }
        })
      }else{
        console.log("No such account");
        res.redirect("/login");
      }
      
    })
  }else if(req.body.occupation==="Cobbler"){
    let query=`SELECT * FROM cobbler WHERE email='${req.body.Email}'`;
    console.log(query);
    db.query(query,function(err,result){
      if(err){
        console.log(err);
  
      }if (result[0]){
        console.log(result[0])
        bycrypt.compare(req.body.password,result[0].password ,function(err,same){
          console.log(same);
          if(same){
            console.log("passwords match");
            req.session.user_id={email:req.body.Email,occupation:"cobbler"};
            res.redirect("home");
  
          }else{
            console.log("password don't match");
            res.redirect("/login");
          }
        })
      }else{
        console.log("No such account");
        res.redirect("/login");
      }
      
    })
  }else if(req.body.occupation==="Barber"){
    let query=`SELECT * FROM barber WHERE email='${req.body.Email}'`;
    console.log(query);
    db.query(query,function(err,result){
      if(err){
        console.log(err);
  
      }if (result[0]){
        console.log(result[0])
        bycrypt.compare(req.body.password,result[0].password ,function(err,same){
          console.log(same);
          if(same){
            console.log("passwords match");
            req.session.user_id={email:req.body.Email,occupation:"barber"};
            res.redirect("home");
  
          }else{
            console.log("password don't match");
            res.redirect("/login");
          }
        })
      }else{
        res.redirect("/login");
      }
      
    })
  }

})
//returning coordinates
app.get("/returncoordinates/:email",function(req,res){
  email=req.params.email;
  console.log(email);
  let query="SELECT * FROM descript WHERE email=?";
  db.query(query,email,function(err,result){
    if(!err){
      occupation=result[0].occupation;
      
    let query1=`SELECT * FROM ${occupation} WHERE email='${email}'`;
    console.log(query1);
    db.query(query1,function(error,result1){
      if(!error){
        res.send(result1);
      }else{
        console.log(error);
        res.status(404);
      }
  })}else{
       console.log(err);
       res.status(404);
  }})
})

//Signup route
app.post("/signup",function(req,res){

  if(req.body.password===req.body.confirmpassword){
  if(req.body.occupation == 'Student'){
    var query='';
    bycrypt.hash(req.body.password,10,(err,hash)=>{
      if(!err){
        var pass=hash;
        console.log(typeof(pass))
       query = `INSERT INTO students VALUES ('${req.body.name}','${pass}', '${req.body.email}')`;
       console.log(query);
       db.query(query,function(err){
         if(!err){
           console.log("data saved");
           res.redirect("/login");
         }else
         {
           res.redirect("/signup");
         }
       });

      }else{
        console.log("can't save password");
        res.redirect("/signup");
      }})
   }else if(req.body.occupation=="Cobbler"){
    var query='';
    bycrypt.hash(req.body.password,10,(err,hash)=>{
      if(!err){
        var pass=hash;
       query = `INSERT INTO cobbler VALUES ('${req.body.name}','${pass}', '${req.body.email}','${parseFloat(lat)}','${parseFloat(longi)}')`;
       db.query(query,function(err){
         if(!err){
           console.log("data saved");
           console.log('/createDescription/'.concat(req.body.email).concat("/cobbler"));
           res.redirect('/createDescription/'.concat(req.body.email).concat("/cobbler"));
         }else
         {
           console.log(err);
           res.redirect("/signup");
         }
       });

      }else{
        console.log("can't save password");
        res.redirect("/signup");
      }})}else if(req.body.occupation=="Barber"){
        var query='';
        bycrypt.hash(req.body.password,10,(err,hash)=>{
          if(!err){
            var pass=hash;
           query = `INSERT INTO barber VALUES (?,?,?,?,?)`;
           values=[req.body.name,pass, req.body.email,parseFloat(lat),parseFloat(longi)]
           db.query(query,values,function(err){
             if(!err){
               console.log("data saved");
               res.redirect('/createDescription/'.concat(req.body.email).concat("/barber"));
             }else
             {
               console.log(err);
               res.redirect("/signup");
             }
           });
    
          }else{
            console.log("can't save password");
            res.redirect("/signup");
          }})}else if(req.body.occupation=="Fruit Vendor"){
            var query='';
            bycrypt.hash(req.body.password,10,(err,hash)=>{
              if(!err){
                var pass=hash;
                var deliveryflag=0;
                if(req.body.delivery="Yes"){
                  deliveryflag=1;
                }
               query = `INSERT INTO fruitvendor VALUES (?,?,?,?,?,?)`;
               values=[req.body.name,pass, req.body.email,parseFloat(lat),parseFloat(longi),deliveryflag];
               db.query(query,values,function(err){
                 if(!err){
                   console.log("data saved");
                   res.redirect('/createDescription/'.concat(req.body.email).concat("/fruitvendor"));
                 }else
                 {
                   console.log(err);
                   res.redirect("/signup");
                 }
               });
        
              }else{
                console.log("can't save password");
                res.redirect("/signup");
              }})}else if(req.body.occupation=="Groceries"){
                var query='';
                bycrypt.hash(req.body.password,10,(err,hash)=>{
                  if(!err){
                    var pass=hash;
                    var deliveryflag=0;
                    if(req.body.delivery="Yes"){
                      deliveryflag=1;
                    }
                   query = `INSERT INTO groceries VALUES (?,?,?,?,?,?)`;
                   values=[req.body.name,pass, req.body.email,parseFloat(lat),parseFloat(longi),deliveryflag];
                   db.query(query,values,function(err){
                     if(!err){
                       console.log("data saved");
                       res.redirect('/createDescription/'.concat(req.body.email).concat("/grocery"));
                     }else
                     {
                       console.log(err);
                       res.redirect("/signup");
                     }
                   });
            
                  }else{
                    console.log("can't save password");
                    res.redirect("/signup");
                  }})}


                
  }else {
    console.log("passwords are not same");
  }
                })

function isloggedinstudent(req,res,next){
  console.log(req.session.user_id);
  if(req.session.user_id){
    console.log(req.session.user_id);
    return next();
  }
  res.redirect("/login");
}
//app lintening                
app.listen(3000,function(){
  console.log("server is running");
})
