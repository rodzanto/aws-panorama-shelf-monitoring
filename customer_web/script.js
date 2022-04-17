'use strict';

//Configuration:
var awsRegion = 'eu-west-1';
var cognitoIdentityPoolId = 'eu-west-1:9b4ece38-0c50-4262-b107-2935fcaa2720';

//DynamoDB client...
AWS.config.region = awsRegion;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
});
let dynamoClient = new AWS.DynamoDB();

//Keep track of counts per product...
var Counts = {
    "lays": 0,
    "kinder": 0,
    "m&m": 0,
    "sticker": 0,
    "pen": 0,
    "coke": 0,
    "h2o": 0
};

function renderItems(items) {
    //Print timestamp in receipt...
    var today = new Date().toLocaleString();
    document.getElementById("time").innerHTML=today;

    //Add header to receipt table...
    var Receipt = document.getElementById("myReceipt");
    Receipt.innerHTML = `
        <tr class="tabletitle">
        <td class="item"><h2>Item</h2></td>
        <td class="Hours"><h2>Qty</h2></td>
        <td class="Rate"><h2>Sub Total</h2></td>
        </tr>
    `

    //Add purchased items to receipt...
    for(var i=0, len = items.length; i<len; i++) {
        if (items[i].count.N >= 1) {
            /*console.log(JSON.stringify(items[i].ProductType.S));*/
            var row = Receipt.insertRow(1);
            row.className = "service";
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            cell1.innerHTML = items[i].ProductType.S;
            cell2.innerHTML = items[i].count.N;
            cell3.innerHTML = "€1.00";
            cell1.className = "itemtext";
            cell2.className = "itemtext";
            cell3.className = "itemtext";
        }
    }

    //Add total cost to receipt...
    var row = Receipt.insertRow(Receipt.rows.length);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = `<td></td>`;
    cell2.innerHTML = `<td class="Rate"><h2>Total</h2></td>`;
    var totalcost = (Receipt.rows.length - 2)*1;
    cell3.innerHTML = `<td class="payment"><h2>€${totalcost.toFixed(2)}</h2></td>`;
    row.className = "tabletitle";
 
}

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

}

window.onload = () => {
    setInterval(GetCount, 3000);
}
