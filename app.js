
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const dotenv = require("dotenv").config();

const app = express();

mongoose.connect(process.env.url).then(function(){
  console.log('connected')
}).catch(function(err){
  console.log(err)
});



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const itemSchema = {
  name: String
};

const Items = new mongoose.model("item", itemSchema);

const item1 = new Items ({name: "Welcome todoList!"});

const item2 = new Items ({name: "Hit + to add new item"});

const item3 = new Items ({name: "click on check box to underline"});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = new mongoose.model("List", listSchema);


app.get("/", function(req, res) {

Items.find({}).then(function(todos){

  if(todos.length === 0){
    Items.insertMany(defaultItem).then(function(){ console.log("Sucessfully Save default item data")}).catch(function(err){
      console.log(err)
    });
    res.redirect("/");
  }else {
    res.render("list", {
      listTittle: "Today", newListItems: todos
    });
  }
}).catch(function(err){
  console.log(err);
});
  
});

app.get("/:customListName", function(req, res){
 const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName}).then(function(foundList){
  
    if(!foundList){
      //create new
      const list = new List({
        name: customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customListName);
    }else {
      //show existing
res.render("list", {listTittle: foundList.name, newListItems: foundList.items});
    }
  }

);


 
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Items ({
      name: itemName
    });

if (listName === "Today"){

  item.save();
  res.redirect("/");
}else{
 List.findOne({name: listName}).then(function(foundList){
  foundList.items.push(item);
  foundList.save();
  res.redirect("/" + listName);
 });
}

});


app.post("/delete", function(req, res){
const checkedItemId =req.body.checkbox ;
const listName = req.body.listName;

if(listName === "Today"){
  Items.findByIdAndRemove(checkedItemId).then(function(){console.log("Sucessfully remove")}).catch(function(err){console.log(err)});

  res.redirect("/");

}else{

  List.findOneAndUpdate({name: listName},{$pull:{ items :{_id: checkedItemId}}}).then(function(foundList){
  
      res.redirect("/" + listName);
  
  }).catch(function(err){
    console.log(err);
  });
}


});


app.get("/about", function(req,res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("server is running on port 3000");
});
