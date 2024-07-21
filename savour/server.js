var express = require("express");
var mysql = require("mysql2");
var fileuploader = require("express-fileupload");
var app = express();
const nodemailer = require("nodemailer");

app.listen(2005, function () {
  console.log("Server Started");
});

app.get("/", function (req, resp) {
  resp.sendFile(process.cwd() + "/public/index.html");
});
app.use(express.static("public"));
app.use(fileuploader());

app.use(express.urlencoded(true));

//==========DataBase
var dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "cgg@65830",
  database: "products",
  dateStrings: true,
};

var dbCon = mysql.createConnection(dbConfig);
dbCon.connect(function (err) {
  if (err == null) console.log("Connected Successfully");
  else resp.send(err);
});

app.get("/chk-email", function (req, resp) {
  //saving data in table
  dbCon.query(
    "select * from products.signup where email=?",
    [req.query.kuchEmail],
    function (err, resultTable) {
      if (err == null) {
        if (resultTable.length == 1) resp.send("Already Taken...");
        else resp.send("Available....!!!!");
      } else resp.send(err);
    }
  );
});

//===============SIGN UP================================================================
app.get("/chk-submit", function (req, resp) {
  dbCon.query(
    "insert into products.signup(email,password,dos) values(?,?,current_date())",
    [req.query.kuchemail, req.query.kuchpwd],
    function (err) {
      if (err == null) {
        resp.send("Record Saved successfully");

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "savour.official2024@gmail.com",
            pass: "eoiz zgks biye oxqp",
          },
        });

        const options = {
          from: "savour.official2024@gmail.com", // sender address
          to: req.query.kuchemail, // list of receivers
          subject: "Sign Up", // Subject line
          text: "You have successfully signed up ", // plain text body
          html:
            "<h1>Congrats</h1><br><b>You have successfully signed up</b><br> Login Id =" +
            req.query.kuchemail +
            "<br>Password=" +
            req.query.kuchpwd,
        };

        transporter.sendMail(options, function (err, info) {
          if (err) {
            console.log(err);
            return;
          } else console.log("sent: " + info.response);
        });
      } else {
        resp.send(err);
      }
    }
  );
});

//============login======================
app.get("/chk-login-submit", function (req, resp) {
  dbCon.query(
    "select * from products.signup where email=? && password=?",
    [req.query.kuchemail, req.query.kuchpwd],
    function (err, resultJSONTable) {
      if (err == null) {
        resp.send("Done");
      } else {
        resp.send(err);
      }
    }
  );
});

app.get("/get-items", function (req, resp) {
  //fixed                             //same seq. as in table
  dbCon.query("select distinct Food_type from dataset_final", function (
    err,
    resultTableJSON
  ) {
    if (err == null) resp.send(resultTableJSON);
    else resp.send(err);
  });
});

app.get("/fetch-donors", function (req, resp) {
  //  console.log(req.query);

  var Food_type = req.query.itemskuch;

  var query =
    "select * from dataset_final   where  dataset_final.Food_type=? Order by Price ASC  ";
  // var query1 = "select * from swiggy_data  inner join zomato_data on swiggy_data.Food_type = zomato_data.Food_type where  swiggy_data.Food_type=? ";

  dbCon.query(query, [Food_type], function (err, resultTable) {
    //console.log(resultTable+"      "+err);
    if (err == null) resp.send(resultTable);
    else resp.send(err);
  });
});

//=====================
app.get("/submit", function (req, resp) {
  dbCon.query(
    "insert into cart(Food_type,Restaurant,Price,Avg_rating,Delivery_partner) values(?,?,?,?,?)",
    [
      req.query.kuchemail,
      req.query.kuchmed,
      req.query.kuchquantity,
      req.query.kuchpacking,
      req.query.kuchdoe,
    ],
    function (err) {
      if (err == null) {
        resp.send("Record Saved successfully");
      } else {
        resp.send(err);
      }
    }
  );
});

//====================
app.post("/submit-process", function (req, resp) {
  //  resp.send("Data Reached");
  var fileName = "nopic.jpg";
  if (req.files != null) {
    //console.log(process.cwd());
    fileName = req.files.ppic.name;
    var path = process.cwd() + "/public/upload/" + fileName;
    req.files.ppic.mv(path);
  }
  console.log(req.files);
  var emailid = req.body.txtEmail;
  var name = req.body.txtname;
  var contact = req.body.txtcontact;
  var address = req.body.txtaddress;
  var city = req.body.combocity;
  var id = req.body.idproof;
  console.log(req.body);
  dbCon.query(
    "insert into profile values(?,?,?,?,?,?,?)",
    [emailid, name, contact, address, city, id, fileName],
    function (err) {
      if (err == null) {
        resp.send("Record saved successfullyyyyyyy");
      } else {
        resp.send(err);
      }
    }
  );
  //resp.query("Welcome"+req.body.txtEmail +" "+"Name"+req.body.txtname+" "+" Contact"+req.body.txtcontact+" "+"Adress"+req.body.txtaddress+"City"+city+"dob"+dob+"Gender"+gender+"Id"+id+"Pic"+fileName);
});

//=============================
app.get("/chk-cart", function (req, resp) {
  dbCon.query("insert into cart values(?)", [req.query.kuchID], function (err) {
    if (err == null) {
      resp.send("Record Saved successfully");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "savour.official2024@gmail.com",
          pass: "eoiz zgks biye oxqp",
        },
      });

      const options = {
        from: "savour.official2024@gmail.com", // sender address
        to: "recipient@example.com", // replace with the actual recipient
        subject: "Product Added to Cart", // Subject line
        text: "A product has been added to your cart.", // plain text body
        html: "<b>A product has been added to your cart.</b>", // html body
      };

      transporter.sendMail(options, function (err, info) {
        if (err) {
          console.log(err);
          return;
        } else console.log("sent: " + info.response);
      });
    } else {
      resp.send(err);
    }
  });
});

//============================================================================
app.get("/get-angular-all-records", function (req, resp) {
  dbCon.query(
    "SELECT * FROM dataset_final INNER JOIN cart ON dataset_final.ID = cart.ID ORDER BY dataset_final.ID ASC",
    function (err, resultTableJSON) {
      if (err == null) resp.send(resultTableJSON);
      else resp.send(err);
    }
  );
});

//=======================
app.get("/do-angular-delete", function (req, resp) {
  //saving data in table
  var ID = req.query.IDkuch;

  //fixed                             //same seq. as in table
  dbCon.query("delete from cart where ID=?", [ID], function (err, result) {
    if (err == null) {
      if (result.affectedRows == 1)
        resp.send("Account Removed Successfully!!!!!!!!!");
      else resp.send("Invalid Email id");
    } else resp.send(err);
  });
});

//==================
app.post("/submit-process", function (req, resp) {
  // resp.send("Data Reached");
  var fileName = "nopic.jpg";
  if (req.files != null) {
    //console.log(process.cwd());
    fileName = req.files.ppic.name;
    var path = process.cwd() + "/public/upload/" + fileName;
    req.files.ppic.mv(path);
  }
  // console.log(req.files);
  var emailid = req.body.txtEmail;
  var name = req.body.txtname;
  var contact = req.body.txtcontact;
  var address = req.body.txtaddress;
  var city = req.body.combocity;
  var id = req.body.idproof;

  dbCon.query(
    "insert into profile values(?,?,?,?,?,?,?)",
    [emailid, name, contact, address, city, id, fileName],
    function (err) {
      if (err == null) {
        resp.send("Record saved successfullyyyyyyy");
      } else {
        resp.send(err);
      }
    }
  );
  //resp.query("Welcome"+req.body.txtEmail +" "+"Name"+req.body.txtname+" "+" Contact"+req.body.txtcontact+" "+"Adress"+req.body.txtaddress+"City"+city+"dob"+dob+"Gender"+gender+"Id"+id+"Pic"+fileName);
});

app.get("/json-record", function (req, resp) {
  //fixed                             //same seq. as in table
  dbCon.query(
    "select * from profile where emailid=?",
    [req.query.kuchemail],
    function (err, resultJSONKuch) {
      if (err == null) {
        resp.send(resultJSONKuch);
      } else resp.send(err);
    }
  );
});

//================================
app.get("/order-submit", function (req, resp) {
  dbCon.query(
    "insert into cart2(id,restaurant,price,rating,partner) values(?,?,?,?,?)",
    [
      req.query.kuchemail,
      req.query.kuchmed,
      req.query.kuchquantity,
      req.query.kuchpacking,
      req.query.kuchdoe,
    ],
    function (err) {
      if (err == null) {
        resp.send("Record Saved successfully");
      } else {
        resp.send(err);
      }
    }
  );
});
