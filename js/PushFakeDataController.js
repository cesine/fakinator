'use strict';
// NOTE: Make sure that temp.json is in the /data directory before running!
function PushFakeDataController($scope, $resource, LocalFakeData, CouchFakeData) {
    if (localStorage.getItem('Pivot88Preferences') == undefined) {
        window.alert("Pivot88Preferences are not defined. Setting defaults.");
        var Pivot88Preferences = {
          "stages" : [ {
            "_id" : "3d84f25a-54ed-4e34-96fb-5e086af74ba6",
            "label" : "Pre-production",
            "image_src" : "planning.jpg"
          }, {
            "_id" : "82da86d5-fca3-4fbc-b4d4-371f17b778a2",
            "label" : "During Production",
            "image_src" : "production.jpg"
          }, {
            "_id" : "b906b468-c9cb-4836-9a8e-6e0dc6969c9f",
            "label" : "Pre-Shipment",
            "image_src" : "shipping.jpg"
          }, {
            "_id" : "94bcad11-44e3-49e0-9a78-03b25fc0cee8",
            "label" : "Factory Audit",
            "image_src" : "shipped.jpg"
          }, {
            "_id" : "a6bbb2fc-a969-4372-93a3-199704bba73f",
            "label" : "",
            "image_src" : ""
          }, {
            "_id" : "ca077180-e398-4d29-866e-22e88648354d",
            "label" : "",
            "image_src" : ""
          }, {
            "_id" : "d40c5c17-f642-43f5-8f6a-47fce5329fc7",
            "label" : "",
            "image_src" : ""
          } ]
        };
        localStorage.setItem('Pivot88Preferences', JSON.stringify(Pivot88Preferences));
      } else {
        var Pivot88Preferences = jQuery.parseJSON(localStorage.getItem('Pivot88Preferences'));
        console.log("Pivot88Preferences: " + JSON.stringify(Pivot88Preferences));
      }

      var scopeStages = new Array;
      for (var i in Pivot88Preferences.stages) {
        if (Pivot88Preferences.stages[i].label != "") {
          scopeStages.push(Pivot88Preferences.stages[i]);
        }
      }
      $scope.stages = scopeStages;
	
	
	$scope.saveFakeData = function(fake) {
		// Change status to 'enabled' to enable this function, 'disabled' to
		// disable it
		var status = 'enabled';
		if (status == 'disabled') {
			window
					.alert("This feature is currently disabled. To enable, see PushFakeDataController.js.");
		} else {
			// Limit number of new records to 25
			if (fake.number > 25) {
				window
						.alert("You can create a maximum of 25 fake records at a time.");
				return;
			}
			// Confirm, then load old record (json with one record template) and
			// replace fields with data
			// from fakedata.html, write to remote CouchDB in
			// PushFakeDataServices (CouchFakeData)
			else {
				var r = confirm("Are you sure you want to create "
						+ fake.number + " fake records?");
				if (r == true) {
					var oldRecord = LocalFakeData.query(function() {
						var newRecord = oldRecord;
						/*Supplier and Buyer are static. Add code if more options are desired*/

						newRecord.header.date = fake.date;
						newRecord.header.forecasted_inspection_date = fake.forecasted_inspection_date;
						newRecord.header.inspectionStage = fake.inspectionStage;
						newRecord.header.location = fake.location;
						newRecord.header.sku._id = fake.sku.number;
						
						//Assign product name based on sku.number
						var productName;
						if (fake.sku.number == "345678") {
							productName = "Chocolate Chip Cookies";
						}
						else if (fake.sku.number == "987234") {
							productName = "Butter Pecan Cookies";
						}
						else if (fake.sku.number == "789234") {
							productName = "Oatmeal Raisin Cookies";
						} 
						else if (fake.sku.number == "907234") {
							productName = "Peanut Butter Cookies";
						} 
						else {
							productName = "Coconut Cookies";
						}
						newRecord.header.sku.name = productName;
						
						newRecord.header.purchaseOrder._id = fake.purchaseOrder.number;
						
						newRecord.quantity = fake.quantity;
						
						// Generate Work Order id
//						var workOrderDate = new Date(fake.date);
//						var workOrderDay = workOrderDate.getDate() + 1;
//						var workOrderMonth = workOrderDate.getMonth() + 1;
						var workOrderNumber = fake.sku.number + "-" + fake.purchaseOrder.number;
						$scope.fakeWordOrderNumber = workOrderNumber;
						newRecord.header.workOrder._id = workOrderNumber;
						
						newRecord.header.assignment._id = fake.assignment.number;
						newRecord.header.assignment.date_created = fake.assignment.date;
						newRecord.flagged = fake.flagged;
						newRecord.urgent = fake.urgent;
						newRecord.status = fake.status;
						newRecord.conclusion.result = fake.conclusion.result;
						newRecord.conclusion.date = fake.conclusion.date;
						
						console.log("Attempting to create new records.");


						for ( var i = 1; i <= fake.number; i++) {
							var fakeRecord = CouchFakeData.save(newRecord,
									function() {
										console.log(i - 1
												+ " fake records created.");
									});
						}
						;
					});
				}
				;
			}
			;
		}
		;
	};
};