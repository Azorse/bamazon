var inquirer = require("inquirer");
var mysql = require("mysql");
var dotenv = require("dotenv");
dotenv.config();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "bamazon_DB"
});

connection.connect(function(err) {
    if (err) throw err;
		
});

manager();

function manager() {
  inquirer.prompt([{
    type: "list",
    name: "managerTask",
    message: "What would you like to do?",
    choices: ["View all Products", "View Low Inventory", "Add Items to Inventory", "Add New Product","Log Out"]
  }]).then(function(res) {
      if (res.managerTask === "View all Products") {
        displayProducts();
      } else if (res.managerTask === "View Low Inventory") {
        displayLowInventory();
      } else if (res.managerTask === "Add Items to Inventory") {
        restockProducts();
      } else if (res.managerTask === "Add New Product") {
        createNewProduct();
      } else {
        console.log('Logging out...');
        connection.end();
      }
  })
}

function displayProducts() {
	connection.query('SELECT * FROM products', function(err, res){
		console.log('')
    console.log(`-----------------------------------------------------------------`)
		for(var i=0; i<res.length; i++){
			
			console.log(`Item ID: ${res[i].item_id} Product Name: ${res[i].product_name} Price: ${res[i].price} Quantity in stock: ${res[i].quantity}`)
			//console.log(`-----------------------------------------------------------------`);
		}
		console.log(`-----------------------------------------------------------------`)
    manager();
	});

  
}

function displayLowInventory() {
	connection.query('SELECT * FROM products', function(err, res){
		console.log(`-----------------------------------------------------------------`)
		for(var i=0; i<res.length; i++){
      if ((res[i].quantity >5)) {
       console.log('Product not low')
      }else if (res[i].quantity <=5) {
			  console.log(`Item ID: ${res[i].item_id} Product Name: ${res[i].product_name} Price: ${res[i].price} Quantity in stock: ${res[i].quantity}`)
  		}
		console.log(`-----------------------------------------------------------------`)
	  };
  
    	
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "restockInventory",
          message: "Would you like to restock any products?",
        }
      ])
      .then(function(response) {
        if(response.restockInventory) {
          restockProducts();
        } else {
          manager();
        }
	  	});
  });
};

function restockProducts() {
  connection.query('SELECT * FROM products', function(err, res){
  console.log('')
  console.log(`-----------------------------------------------------------------`)
  for(var i=0; i<res.length; i++){
    
    console.log(`Item ID: ${res[i].item_id} Product Name: ${res[i].product_name} Price: ${res[i].price} Quantity in stock: ${res[i].quantity}`)
    //console.log(`-----------------------------------------------------------------`);
  }
  console.log(`-----------------------------------------------------------------`)
  });

  inquirer
    .prompt([
      {
        type: "input",
        name: "ID",
        message: "Which product would you like to restock? Please provide Item ID.",
      },
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to add?",
      }
    ])
    .then(function(response) {
			var orderID = (response.ID);
			var quantityAdded = response.quantity;
      return restockItems(orderID, quantityAdded);
    });
}

function restockItems(ID, amountOrdered) {
  amountAdded = parseFloat(amountOrdered);
  //Number(amountOrdered)
  connection.query(`Select * FROM products WHERE ?`, [ID], function(err, res) {
    if (err) throw err;

    var product= res[ID-1]

    console.log(`New total quantity after order: ${product.quantity + amountAdded}`);

    // var total = product.price * amountOrdered;
    
    // console.log(``);
    // console.log(`Your total for ${amountOrdered} ${product.product_name} is $${total} dollars`);
    
    var sql = `UPDATE products SET quantity = ${product.quantity + amountAdded} WHERE item_id = ${ID}`
    //var sql = `UPDATE products SET quantity = quantity - ? WHERE item_id = ?`

    connection.query(sql,[amountOrdered, ID], function(err, result){
      if (err) throw err;
      console.log(
        `${result.affectedRows} record(s) updated`);
      console.log(``);
      manager();
    });
  });
}

function createNewProduct() {
  console.log('Sorry ran out of time before work!')
  manager();
}

