'use strict';
​
//Configuration:
var awsRegion = 'eu-west-1';
var cognitoIdentityPoolId = 'eu-west-1:9b4ece38-0c50-4262-b107-2935fcaa2720';
​
//DynamoDB client...
AWS.config.region = awsRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
});
let dynamoClient = new AWS.DynamoDB();
​
//Keep track of counts per product...
/*lays,kinder,m&m,sticker,pen,coke,h2o*/
var Counts = [1000,1000,1000,1000,1000,1000,1000];
var Purch = [0,0,0,0,0,0,0];
var totalcost = 0;
var Price = [1,1,1,1,1,1,1]; //Update with your products prices
var srcImg = '';
var prevSrcImg = '';
​
function renderItems(items) {
    //Print timestamp in receipt...
    var today = new Date().toLocaleString();
    document.getElementById("time").innerHTML=today;
    var Receipt = document.getElementById("myReceipt");
​
    //console.log(items);
​
    //Add purchased items to receipt...
    for(var i=0, len = items.length; i<len; i++) {
        if (Counts[i] == 1000) {
            //First page load... update counts to inventory numbers...
            Counts[i] = items[i].count.N;
        }
        else if (items[i].count.N < Counts[i]) {
            //Item count is reducing (i.e. customer purchasing)...
            Purch[i]++;
            var subtotal = Purch[i]*Price[i];
            totalcost = totalcost + Price[i];
            if (Purch[i] == 1) {
                //First time this item is purchased...
                var row = Receipt.insertRow(1);
                row.className = "service";
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = items[i].ProductType.S;
                cell2.innerHTML = Purch[i];
                cell3.innerHTML = `€${subtotal.toFixed(2)}`;
                cell1.className = "itemtext";
                cell2.className = "itemtext";
                cell3.className = "itemtext";    
            }
            else {
                //Purchasing another item...
                for (var j=0; j<Receipt.rows.length; j++) {
                    if (Receipt.rows[j].cells[0].innerHTML == items[i].ProductType.S) {
                        Receipt.rows[j].cells[1].innerHTML = Purch[i];
                        Receipt.rows[j].cells[2].innerHTML = `€${subtotal.toFixed(2)}`;
                    }
                }
            }
            Counts[i] = items[i].count.N;
            //Personalization...
            prevSrcImg = srcImg;
​
            if (items[i].ProductType.S == 'lays') {
                srcImg = './media/favorite_walkers.png';
                document.getElementById("myFavorite").src=srcImg;
            }
            else if (items[i].ProductType.S == 'kinder' || items[i].ProductType.S == 'mm') {
                srcImg = './media/favorite_pistachio.png';
                document.getElementById("myFavorite").src=srcImg;
            }
            else if (items[i].ProductType.S == 'sticker' || items[i].ProductType.S == 'pen') {
                srcImg = './media/favorite_markers.png';
                document.getElementById("myFavorite").src=srcImg;
            }
            else if (items[i].ProductType.S == 'coke' || items[i].ProductType.S == 'h2o') {
                srcImg = './media/favorite_kombucha.png';
                document.getElementById("myFavorite").src=srcImg;
            }
        }
        else if (items[i].count.N > Counts[i]) {
            // Item count is increasing... (i.e. inventory replenishment, returned product)...
            Counts[i] = items[i].count.N;
​
            if (Purch[i] == 1) {
                //Only one item left, row needs to be removed...
                var row = Receipt.deleteRow(1);
                // Using prevSrcImg. Add check, if there is no row left, remove recomendation
                if (Receipt.rows.length != 0) {
                    document.getElementById("myFavorite").src=prevSrcImg;
                } 
                else {
                    // When no products are selected show default recommendation for the user
                    document.getElementById("myFavorite").src='./media/favorite_walkers.png';
                }
                totalcost = totalcost - Price[i];
​
            } 
            else if (Purch[i] > 1) {
                //Returning one of the items, still one or more in the ...
                Purch[i]--;
                var subtotal = Purch[i]*Price[i];
                totalcost = totalcost - Price[i];
​
                for (var j=0; j<Receipt.rows.length; j++) {
                    if (Receipt.rows[j].cells[0].innerHTML == items[i].ProductType.S) {
                        Receipt.rows[j].cells[1].innerHTML = Purch[i];
                        Receipt.rows[j].cells[2].innerHTML = `€${subtotal.toFixed(2)}`;
                    }
                }
                
            }
        }
    }
​
    //Add total cost to receipt...
    var lastrow = Receipt.lastElementChild.lastElementChild;
    lastrow.cells[2].innerHTML = `<td class="payment"><h2>€${totalcost.toFixed(2)}</h2></td>`;
 
}
​
function GetCount() {
    let labelsPromise = new Promise((resolve, reject) => {
        let getCountParams = {
            TableName: "shelfMonitor-56d4xwhshvhzpj2sqke3ccaud4-main"
        };
        dynamoClient.scan(getCountParams, function(err, data) {
            if (err) {
                reject(err);
            } else {
                renderItems(data.Items);
            }
        });
    });
​
}
​
window.onload = () => {
    setInterval(GetCount, 3000);
}
