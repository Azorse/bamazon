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

displayItems();

function displayItems() {
	connection.query('SELECT * FROM products', function(err, res){
		console.log(`-----------------------------------------------------------------`)
		for(var i=0; i<res.length; i++){
			
			console.log(`Item ID: ${res[i].item_id} Product Name: ${res[i].product_name} Price: ${res[i].price} Quantity in stock: ${res[i].quantity}`)
			//console.log(`-----------------------------------------------------------------`);
		}
		console.log(`-----------------------------------------------------------------`)
		makeOrder();
	});

}


function makeOrder() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "ID",
        message: "Which product would you like to buy? Please provide Item ID.",
      },
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to purchase?",
      }
    ])
    .then(function(response) {
			var orderID = (response.ID);
			var quantityNeeded = response.quantity;
      return completeOrder1(orderID, quantityNeeded);
    });
} 



function completeOrder1(ID, amountOrdered) {
  amountOrdered = parseFloat(amountOrdered);
  //Number(amountOrdered)
  connection.query(`Select * FROM products WHERE ?`, [ID], function(err, res) {
    if (err) throw err;
		// console.log(`ID: ${ID}`);
		// console.log(`ID Name: ${res[ID].product_name}`)
    // console.log(`Amount Ordered: ${amountOrdered}`);
    // console.log(`Quantity of Item: ${res[ID].quantity}`);
    // console.log(res);
    var product= res[ID-1]

    if (amountOrdered <= product.quantity) {
			console.log(`New total quantity after order: ${product.quantity - amountOrdered}`);

			var total = product.price * amountOrdered;
			
      console.log(``);
			console.log(`Your total for ${amountOrdered} ${product.product_name} is $${total} dollars`);
			
			var sql = `UPDATE products SET quantity = ${product.quantity - amountOrdered} WHERE item_id = ${ID}`
			//var sql = `UPDATE products SET quantity = quantity - ? WHERE item_id = ?`

			connection.query(sql,[amountOrdered, ID], function(err, result){
				if (err) throw err;
				console.log(
					`${result.affectedRows} record(s) updated`);
				console.log(``);
				anotherOrder();
			});

      

    } else {
      console.log(
        `We're sorry! We have an insufficient quantity of ${product.product_name} to complete your order.`
			);
			
    }
    
  });
}

function anotherOrder() {
	inquirer
		.prompt([
			{
				type: "confirm",
				name: "newOrder",
				message: "Would you like to make another order",
			}
		])
		.then(function(response) {
			if(response.newOrder) {
				displayItems();
			} else {
				console.log(`Thanks! See you next time!`);
				connection.end();
			}
		});
};
