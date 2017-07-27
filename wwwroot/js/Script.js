/***********************************/
/*      Global Variables           */
/***********************************/
var xmlStr;
var masterxml;
var mngrxml;
var bandxml;
var editedID;
var deleteID;
var loginFlag;
var managerType;
var loggedUser;
var mngrData;
var pivot3HoursTotal = [];
var pivot3CostTotal = [];
var monthRangeFlag;
var date;
var flag = 0;
/***********************************/
/*              Page Load          */
/***********************************/

$(document).ready(
    function () {
        LoadManagers();
        LoadMasterData();
		GetDate();
        
		$("#AddEditEmployee").hide();
        $("#Actions").hide();
        $("#Records").hide();
        $("#Signout").hide();
        $("#ReportTab").hide();
        $("#SelectPeriod").hide();
        $("#Busy").hide();
		$("#pass1").hide();
		$("#pass2").hide();
		$("#btnCancel").hide();
		
        if (window.location.hash.substr(1) != "") {
            $("#Login").hide();
            $("#Actions").show();
            $("#Records").show();
            $("#Signout").show();
            LoadEmployeeData();
        }

        $('ul.tabs li').click(function () {
            var tab_id = $(this).attr('data-tab');

            $('ul.tabs li').removeClass('current');
            $('.tab-content').removeClass('current');

            $(this).addClass('current');
            $("#" + tab_id).addClass('current');
        })
    }
);

function LoadMasterData() {
    $.ajax({
        type: "GET",
        url: "Data/MasterData.xml",
        dataType: "xml",
        success: function (data) {
            masterxml = data.xml ? data.xml : (new XMLSerializer()).serializeToString(data);

            $(masterxml).find('OutlookCategory').each(function () {
                $(this).find('Category').each(function () {
                    $("#drpOutlook").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('Billable').each(function () {
                $(this).find('Type').each(function () {
                    $("#drpBillable").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('ResourceType').each(function () {
                $(this).find('Type').each(function () {
                    $("#drpResourceType").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('LocationType').each(function () {
                $(this).find('Type').each(function () {
                    $("#drpLocation").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('IBMType').each(function () {
                $(this).find('Type').each(function () {
                    $("#drpIBMType").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('BudgetArea').each(function () {
                $(this).find('Type').each(function () {
                    $("#drpBudget").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('ProjectArea').each(function () {
                $(this).find('Project').each(function () {
                    $("#drpProject").append("<option>" + $(this).text() + "</option>");
                });
            });

            $(masterxml).find('EmployeeBand').each(function () {
                $(this).find('Band').each(function () {
                    for (var n = 1; n <= 12; n++) {
                        $("#drpBand" + n).append("<option>" + $(this).text() + "</option>");
                    }
                });
            });
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

function LoadManagers() {
    $("#drpManagerName").append("<option>ADMINISTRATOR</option>");

    $.ajax({
        type: "GET",
        url: "Data/ManagerInfo.xml",
        dataType: "xml",
        success: function (data) {
            mngrxml = data.xml ? data.xml : (new XMLSerializer()).serializeToString(data);

            $(mngrxml).find('OnshoreManager').each(function () {
                $(this).find('Manager').each(function () {
                    $("#drpOnshoreMngr").append("<option>" + $(this).attr('Name') + "</option>");
                    $("#drpManagerName").append("<option>" + $(this).attr('Name') + "</option>");
                });
            });

            $(mngrxml).find('OffshoreManager').each(function () {
                $(this).find('Manager').each(function () {
                    $("#drpOffshoreMngr").append("<option>" + $(this).attr('Name') + "</option>");
                    $("#drpManagerName").append("<option>" + $(this).attr('Name') + "</option>");
                });
            });
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

/***********************************/
/*      PopUp/Edit Screen          */
/***********************************/
function GetBandData(dropdown) {
    var dropdownid = dropdown.id;
    var bandFlag = false;
    var locationType;
    var location = $("#drpLocation option:selected").text()
    var ibmtype = $("#drpIBMType option:selected").text()
    var selectedBand = $("#" + dropdownid + " option:selected").text()
    var rateTD = "rate" + dropdownid.substr(7);

    if (location == "Offshore" && ibmtype == "IBM IN") {
        locationType = "IBM IN Offshore"
    }
    else if (location == "Onshore" && ibmtype == "IBM IN") {
        locationType = "IBM IN Onshore"
    }
    else {
        locationType = ibmtype;
    }

    $.ajax({
        type: "GET",
        url: "Data/BandRate.xml",
        dataType: "xml",
        success: function (data) {
            bandxml = data.xml ? data.xml : (new XMLSerializer()).serializeToString(data);

            $(bandxml).find('Location').each(function () {
                if ($(this).attr('Name') == locationType) {
                    $(this).find('Band').each(function () {
                        if ($(this).attr('ID') == selectedBand) {
                            $("#" + rateTD).html($(this).text());
                            bandFlag = true;
                        }
                    });
                }
            });

            if (bandFlag == false) {
                $("#" + rateTD).html("");
            }
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

function SetCost(textbox) {
    var textboxid = textbox.id;
    var rateTD = "rate" + textboxid.substr(8);
    var costTD = "cost" + textboxid.substr(8);
    var txt = $("#" + textboxid).val();
    var costVal = $("#" + textboxid).val() * $("#" + rateTD).html();
    $("#" + costTD).html(costVal.toFixed(2));

    if (costVal == "0") {
        $("#" + textboxid).val("");
        alert("!!! WARNING - DATA MISMTACH !!!\n\Probable Issues\n\u2022 A Band is not selected\n\u2022 The Selected IBM Type does not have a Band mapped\n\n\Corrective Action\n\Select the Location & IBM Type Correctly, Select the Band, Re-Type the Hours & Press Tab")
    }
}

/***********************************/
/*              Reports            */
/***********************************/

function GetPreviousMonth(from)
{
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var prevMonth = monthNames[($.inArray(from, monthNames) - 1 + monthNames.length) % monthNames.length];
    return prevMonth;
}

function GetMonthRange(from, to)
{
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthRange =  new Array();
    var startmonth = monthNames.indexOf(from);
    var tomonth = monthNames.indexOf(to);
	if(tomonth < startmonth)
	{
		alert("The End Month must be later than Start Month");
		return false;
	}
	else
	{
		for (var n = startmonth; n <= tomonth; n++) {
	        monthRange.push(monthNames[n]);
	    }
	    return monthRange;
	}
}

function getEmployeeDataPivot(name, monthRange, year) {
    var hours = 0;
    var cost = 0;
	var currentRate = 0;
	var previousRate = 0;
	var previousMonth = GetPreviousMonth(monthRange[0]);
	var highlow;
	var percent = 0;
	var currentBand = '';
	var previousBand = '';
	var rateChangeReason;
	
    var xmlData = $.parseXML(xmlStr);
    var infoArray = [];
    var dataArray = [];

    mngrData = $(xmlData).find("Employees Employee OnshoreManager").filter(function () {
        return $(this).text() == name;
    }).parent();

    if (mngrData.length > 0) {
        for (i = 0; i < mngrData.length; i++) {
            var EmpID       = $(mngrData[i]).find("EmpID").text();
            var Name        = $(mngrData[i]).find("Name").text();
            var Location    = $(mngrData[i]).find("Location").text();
			var Status	    = $(mngrData[i]).find("Status").text();

            infoArray.push([EmpID, Name, Location])

            $(mngrData[i]).find("Billing").each(function () {
                $(this).find("Year").each(function () {
                    if ($(this).attr("Val") == year) {
                        $(this).find("Month").each(function () {
							
							/* PENDING - Check if its not Dec, else it will give current years DEC record */
							if ($(this).attr("Val") == previousMonth) {
								previousRate = Number($(this).find("Rate").text());	
								previousBand = $(this).find("Band").text();
							}
                            
							for (var i = 0; i < monthRange.length; i++) {
                                if ($(this).attr("Val") == monthRange[i]) {
                                    hours 		= Number($(this).find("Hours").text());
                                    cost 		= Number($(this).find("Cost").text());
				    				currentRate = Number($(this).find("Rate").text());	
									currentBand = $(this).find("Band").text();
									
									//COMMENT : If No Rate Change
									if(previousRate == 0 || currentRate == 0 || previousRate == currentRate)
									{
										highlow = "None"
										percent = 0;
										rateChangeReason = "NC";
									}
									//COMMENT : If Rate has increased
									if(previousRate != 0  && currentRate != 0 && currentRate > previousRate)
									{
										highlow = "High"
										percent = ((currentRate - previousRate)/previousRate * 100).toFixed(2);
									}
									//COMMENT : If Rate has dipped
									if(previousRate != 0 && currentRate != 0 && currentRate < previousRate)
									{
										highlow = "Low"
										percent = ((previousRate - currentRate)/currentRate * 100).toFixed(2);
									}
									//COMMENT : If Band Progression i.e Current Band & Previous Band are different
									if(previousBand != '' && currentBand != '' && previousBand != currentBand)
									{
										rateChangeReason = "BP";
									}
									
									//COMMENT : If Inactive from current month i.e Current Rate = 0
									if(currentRate == 0  && Status == "InActive")
									{
										highlow = "Low"
										percent = 100;
										rateChangeReason = "LP";
									}
									//COMMENT : If Inactive for more than 1 month i.e Previous Rate = 0
									if(previousRate == 0  && Status == "InActive")
									{
										highlow = "None"
										percent = 0;
										rateChangeReason = "NC";
									}
									
									/* PENDING - TEST the BELOW 4 Conditions with data */
									
									//COMMENT : If Moved to Onshore
									if(Location == "Onshore" && previousBand != '' && currentBand != '' && previousBand == currentBand && currentRate > previousRate)
									{
										rateChangeReason = "ON";
									}
									//COMMENT : If Moved to Offshore
									if(Location == "Offshore" && previousBand != '' && currentBand != '' && previousBand == currentBand && currentRate < previousRate)
									{
										rateChangeReason = "OF";
									}
									
									//COMMENT : If Moved to Onshore & also had Band Progression
									if(Location == "Onshore" && previousBand != '' && currentBand != '' && previousBand != currentBand && currentRate > previousRate)
									{
										rateChangeReason = "BP/ON";
									}
									//COMMENT : If Moved to Offshore & also had Band Progression
									if(Location == "Offshore" && previousBand != '' && currentBand != '' && previousBand != currentBand && currentRate < previousRate)
									{
										rateChangeReason = "BP/OF";
									}
                                    dataArray.push([monthRange[i], hours, cost, highlow, percent, rateChangeReason])
									previousRate = currentRate
									previousBand = currentBand;
                                }
                            }
                        });
                    }
                });
            });
        }
    }
    return [
     infoArray,
     dataArray
    ];
}

function getManagerDataPivot(name, monthRange, year, reportType) {
    var hours = 0;
    var cost = 0;
	var previousHours = 0;
	var previousCost  = 0;
	var previousMonth = GetPreviousMonth(monthRange[0]);
	
	
    var xmlData = $.parseXML(xmlStr);
    var dataArrayGlobal = [];
    var dataArrayOffshoreOnshore = [];

    mngrData = $(xmlData).find("Employees Employee OnshoreManager").filter(function () {
        return $(this).text() == name;
    }).parent();

    if (mngrData.length > 0) {
        var hours = '';
        var cost = '';
        var location = '';

        for (i = 0; i < mngrData.length; i++) {
            location = $(mngrData[i]).find("Location").text();
            $(mngrData[i]).find("Billing").each(function () {
                $(this).find("Year").each(function () {
                    if ($(this).attr("Val") == year) {
                        $(this).find("Month").each(function () {
							
							if ($(this).attr("Val") == previousMonth) {
								previousHours 	= Number($(this).find("Hours").text());	
								previousCost 	= Number($(this).find("Cost").text());
							}
							
                            for (var i = 0; i < monthRange.length; i++) {
								
                                if ($(this).attr("Val") == monthRange[i]) {
									
                                    hours = Number($(this).find("Hours").text());
                                    cost = Number($(this).find("Cost").text());

                                    if (reportType == "Global") {
                                        dataArrayGlobal.push([monthRange[i], hours, cost, previousHours, previousCost])
                                    }
                                    if (reportType == "OffshoreOnshore") {
                                        dataArrayOffshoreOnshore.push([monthRange[i], hours, cost, location, previousHours, previousCost])
                                    }
									
									previousHours 	= hours;
									previousCost	= cost;
                                }
                            }
                        });
                    }
                });
            });
        }
    }
    if (reportType == "Global") {
        return dataArrayGlobal;
    }
    if (reportType == "OffshoreOnshore") {
        return dataArrayOffshoreOnshore;
    }
}

function Pivot1Report(year, from, to) {
    var monthRange = GetMonthRange(from, to);
    var body;
    var footer;
	var icon;
	var hoursDiff 		= 0;
	var costDiff 		= 0;
	var percent 		= 0;
	var grossHoursPrev 	= 0;
	var grossCostPrev 	= 0;
	
    pivot3HoursTotal 	= [];
    pivot3CostTotal 	= [];

    $("#tbPivot1 thead tr").empty();
    $("#tbPivot1 tbody").empty();
    $("#tbPivot1 tr:first").append("<th width=250px style='background-color:#fff;border-top:0px #fff;border-left:0px #fff;'></th>");
    for (var i = 0; i <= monthRange.length - 1; i++) {
        $("#tbPivot1 tr:first").append("<th colspan=2 width=75px style='background-color:#2F4F4F;color:#fff'>" + monthRange[i] + "</th>");
    }

    $(mngrxml).find('OnshoreManager').each(function () {
        $(this).find('Manager').each(function () {
            var name = $(this).attr('Name');
            var mngrInfo = [];
            mngrInfo = getManagerDataPivot(name, monthRange, year, "Global");
			
            sumHours 		= {}
            sumCost 		= {}
			sumHoursPrev 	= {}
            sumCostPrev 	= {}
			
            if (mngrInfo.length > 0) {
                $.each(mngrInfo, function (i, value) {
                    sumHours[value[0]] = (sumHours[value[0]] || 0) + value[1];
                    sumCost[value[0]] = (sumCost[value[0]] || 0) + value[2]
					sumHoursPrev[value[0]] = (sumHoursPrev[value[0]] || 0) + value[3];
                    sumCostPrev[value[0]] = (sumCostPrev[value[0]] || 0) + value[4];
                });
            }
			
            if (mngrInfo.length > 0) {
                var hoursTotal 		= [];
                var costTotal 		= [];
				var hoursTotalPrev 	= [];
                var costTotalPrev 	= [];
                if (!($.isEmptyObject(sumHours)) || !($.isEmptyObject(sumCost))) {
                    for (var k in monthRange) {
                        var month = monthRange[k];
                        hoursTotal.push(sumHours[month]);
                        costTotal.push(sumCost[month]);
						hoursTotalPrev.push(sumHoursPrev[month]);
                        costTotalPrev.push(sumCostPrev[month]);
                    }
                }
                body = "<tr><td rowspan=2><b>" + name + "</b></td>";
                if (hoursTotal.length > 0) {
                    for (var i = 0; i < hoursTotal.length; i++) {
                        if (hoursTotal[i] > 0) {
							body += "<td>" + hoursTotal[i] + "</td>";
							if(hoursTotalPrev[i] == 0 || hoursTotal[i] == hoursTotalPrev[i])
							{
								body += "<td><font color=Green><b>&ndash;</b></font></td>";
							}
							else
							{
								if(hoursTotal[i] > hoursTotalPrev[i])
								{
									hoursDiff 	= hoursTotal[i] - hoursTotalPrev[i];
									percent 	= (hoursDiff/hoursTotalPrev[i] * 100).toFixed(2) + " %";
									icon 		= "<font color=Red><b>&uarr;</b></font> ";
								}
								if(hoursTotal[i] < hoursTotalPrev[i])
								{
									hoursDiff 	= hoursTotalPrev[i] - hoursTotal[i];
									percent 	= (hoursDiff/hoursTotal[i] * 100).toFixed(2) + " %";
									icon 		= "<font color=Green><b>&darr;</b></font> ";
								}
								body += "<td>" + icon  + percent + " <b>[" + hoursDiff + "]</b></td>";
							}
                        }
                        else {
                            body += "<td></td>";
							body += "<td></td>";
                        }
                    }
					grossHoursPrev += hoursTotalPrev[0];
                }
                else {
                    for (var i = 0; i <= monthRange.length - 1; i++) {
                        body += "<td></td>";
						body += "<td></td>";
                    }
                }
                body += "</tr><tr>";
                if (costTotal.length > 0) {
                    for (var i = 0; i < costTotal.length; i++) {
                        if (costTotal[i] > 0) {
							body += "<td>$ " + costTotal[i].toFixed(2) + "</td>";
							if(costTotalPrev[i] == 0 || costTotal[i] == costTotalPrev[i])
							{
								body += "<td><font color=Green><b>&ndash;</b></font></td>";
							}
							else
							{
								if(costTotal[i] > costTotalPrev[i])
								{
									costDiff 	= costTotal[i] - costTotalPrev[i];
									percent 	= (costDiff/costTotalPrev[i] * 100).toFixed(2) + " %";
									icon 		= "<font color=Red><b>&uarr;</b></font> ";
								}
								if(costTotal[i] < costTotalPrev[i])
								{
									costDiff 	= costTotalPrev[i] - costTotal[i];
									percent 	= (costDiff/costTotal[i] * 100).toFixed(2) + " %";
									icon 		= "<font color=Green><b>&darr;</b></font> ";
								}
								body += "<td>" + icon  + percent + " <b>[$ " + costDiff.toFixed(2) + "]</b></td>";
							}
                        }
                        else {
                            body += "<td></td>"
							body += "<td></td>";
                        }
                    }
					grossCostPrev += costTotalPrev[0];
                }
                else {
                    for (var i = 0; i < monthRange.length; i++) {
                        body += "<td></td>";
						body += "<td></td>";
                    }
                }
                body += "</tr>";
                $("#tbPivot1").append(body);
            }
        });
		
    });
	
    var hTotal 				= 0;
    var cTotal 				= 0;
	var netHours 			= 0;
	var netCost 			= 0;
	
	var iconFooter;
	var nethoursDiff 		= 0;
	var netcostDiff 		= 0;
	var percentFooter 		= 0;
	
	var x = 0;
	var y = 0;
	
    footer = "<tr><td rowspan=2 style='border-bottom:0px #fff;border-left:0px #fff;'></td>";
    for (var i = 0; i < monthRange.length; i++) {
		if(i == 0)
		{
			x = i + 2;
		}
		else
		{
			x = x + 2;
		}
		$("#tbPivot1 tr:odd td:nth-child(" + x + ")").each(function () {
			if ($(this).html() != '') {
            	hTotal += Number($(this).html());
			}
        });
        footer += "<td style='background-color:#a2c3c3;border-top: 3px solid black;'><b>" + hTotal + "</b></td>";
		
		if(i == 0)
		{
			if(grossHoursPrev == 0)
			{
				footer += "<td style='background-color:#e0ebeb;border-top: 3px solid black;'><font color=Green><b>&ndash;</b></font></td>";
			}
			else
			{
				if(hTotal > grossHoursPrev)
				{
					nethoursDiff 	= hTotal - grossHoursPrev;
					percentFooter	= (nethoursDiff/grossHoursPrev * 100).toFixed(2) + " %";
					iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
				}
				if(hTotal < grossHoursPrev)
				{
					nethoursDiff	= grossHoursPrev - hTotal;
					percentFooter	= (nethoursDiff/hTotal * 100).toFixed(2) + " %";
					iconFooter		= "<font color=Green><b>&darr;</b></font> ";
				}
				footer += "<td style='background-color:#e0ebeb;border-top: 3px solid black;'><b>" + iconFooter  + percentFooter + " [" + nethoursDiff + "]</b></td>";
			}
		}
		else
		{
			if(hTotal > netHours)
			{
				nethoursDiff 	= hTotal - netHours;
				percentFooter 	= (nethoursDiff/netHours * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
			}
			if(hTotal < netHours)
			{
				nethoursDiff	= netHours - hTotal;
				percentFooter 	= (nethoursDiff/hTotal * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Green><b>&darr;</b></font> ";
			}
			footer += "<td style='background-color:#e0ebeb;border-top: 3px solid black;'><b>" + iconFooter  + percentFooter + " [" + nethoursDiff + "]</b></td>";
		}
        netHours = hTotal;
		pivot3HoursTotal.push(hTotal);
        hTotal = 0;
    }
    footer += "</tr><tr>";
    for (var j = 0; j < monthRange.length; j++) {
		if(j == 0)
		{
			y = j + 1;
		}
		else
		{
			y = y + 2;
		}
        $("#tbPivot1 tr:even td:nth-child(" + y + ")").each(function () {
            if ($(this).html() != '') {
                cTotal += Number($(this).html().substr(2));
            }
        });
        footer += "<td style='background-color:#a2c3c3;'><b>$ " + cTotal.toFixed(2) + "</b></td>";
		if(j == 0)
		{
			if(grossCostPrev == 0)
			{
				footer += "<td style='background-color:#e0ebeb;'><font color=Green><b>&ndash;</b></font></td>";
			}
			else
			{
				if(cTotal > grossCostPrev)
				{
					netcostDiff 	= cTotal - grossCostPrev;
					percentFooter 	= (netcostDiff/grossCostPrev * 100).toFixed(2) + " %";
					iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
				}
				if(cTotal < grossCostPrev)
				{
					netcostDiff		= grossCostPrev - cTotal;
					percentFooter 	= (netcostDiff/cTotal * 100).toFixed(2) + " %";
					iconFooter 		= "<font color=Green><b>&darr;</b></font> ";
				}
				footer += "<td style='background-color:#e0ebeb;'><b>" + iconFooter  + percentFooter + " [$ " + netcostDiff.toFixed(2) + "]</b></td>";
			}
		}
		else
		{
			if(cTotal > netCost)
			{
				netcostDiff 	= cTotal - netCost;
				percentFooter 	= (netcostDiff/netCost * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
			}
			if(cTotal < netCost)
			{
				netcostDiff		= netCost - cTotal;
				percentFooter 	= (netcostDiff/cTotal * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Green><b>&darr;</b></font> ";
			}
			footer += "<td style='background-color:#e0ebeb;'><b>" + iconFooter  + percentFooter + " [$ " + netcostDiff.toFixed(2) + "]</b></td>";
		}
        netCost = cTotal;
        pivot3CostTotal.push(cTotal);
        cTotal = 0;
    }
    footer += "</tr>";
    $("#tbPivot1").append(footer);
}

function Pivot2Report(year, from, to) {
    var monthRange = GetMonthRange(from, to);
    var body;
    var footer;
	var icon;
	var hoursDiffOffshore 		= 0;
	var costDiffOffshore 		= 0;
	var hoursDiffOnshore 		= 0;
	var costDiffOnshore 		= 0;
	var subhoursDiff		 	= 0;
	var subcostDiff			 	= 0;
	var percent 				= 0;
	var grossHoursOffshorePrev 	= 0;
	var grossHoursOnshorePrev 	= 0;
	var grossCostOffshorePrev 	= 0;
	var grossCostOnshorePrev 	= 0;
	var grossHoursPrev 	= 0;
	var grossCostPrev 	= 0;
	
    $("#tbPivot2 thead tr").empty();
    $("#tbPivot2 tbody").empty();
    $("#tbPivot2 tr:first").append("<th width=200px style='background-color:#fff;border-top:0px #fff;border-left:0px #fff;border-right:0px #fff;'></th><th style='background-color:#fff;border-top:0px #fff;border-left:0px #fff;'></th>");
    for (var i = 0; i <= monthRange.length - 1; i++) {
        $("#tbPivot2 tr:first").append("<th colspan=2 width=70px style='background-color:#2F4F4F;color:#fff'>" + monthRange[i] + "</th>");
    }

    $(mngrxml).find('OnshoreManager').each(function () {
        $(this).find('Manager').each(function () {
            var name = $(this).attr('Name');
            var mngrInfo = [];
            mngrInfo = getManagerDataPivot(name, monthRange, year, "OffshoreOnshore");

            sumHoursOffshore    = {}
            sumHoursOnshore     = {}
            sumCostOffshore     = {}
            sumCostOnshore      = {}
			sumHoursOffshorePrev    = {}
            sumHoursOnshorePrev     = {}
            sumCostOffshorePrev     = {}
            sumCostOnshorePrev      = {}
			
            if (mngrInfo.length > 0) {
                $.each(mngrInfo, function (i, value) {
                    if (value[3] == "Offshore")
                    {
                        sumHoursOffshore[value[0]] = (sumHoursOffshore[value[0]] || 0) + value[1];
                        sumCostOffshore[value[0]] = (sumCostOffshore[value[0]] || 0) + value[2];
						
						sumHoursOffshorePrev[value[0]] = (sumHoursOffshorePrev[value[0]] || 0) + value[4];
                        sumCostOffshorePrev[value[0]] = (sumCostOffshorePrev[value[0]] || 0) + value[5];
                    }
                    if (value[3] == "Onshore") {
                        sumHoursOnshore[value[0]] = (sumHoursOnshore[value[0]] || 0) + value[1];
                        sumCostOnshore[value[0]] = (sumCostOnshore[value[0]] || 0) + value[2];
						
						sumHoursOnshorePrev[value[0]] = (sumHoursOnshorePrev[value[0]] || 0) + value[4];
                        sumCostOnshorePrev[value[0]] = (sumCostOnshorePrev[value[0]] || 0) + value[5];
                    }
                });
            }

            if (mngrInfo.length > 0) {
                var hoursTotalOffshore 	= [];
                var hoursTotalOnshore 	= [];
                var costTotalOffshore 	= [];
                var costTotalOnshore 	= [];
				var hoursTotalOffshorePrev 	= [];
                var hoursTotalOnshorePrev 	= [];
                var costTotalOffshorePrev 	= [];
                var costTotalOnshorePrev 	= [];
				
                if (!($.isEmptyObject(sumHoursOffshore)) || !($.isEmptyObject(sumCostOffshore)) || !($.isEmptyObject(sumHoursOffshorePrev)) || !($.isEmptyObject(sumCostOffshorePrev))) {
                    for (var k in monthRange) {
                        var month = monthRange[k];
                        hoursTotalOffshore.push(sumHoursOffshore[month]);
                        costTotalOffshore.push(sumCostOffshore[month]);
						
						hoursTotalOffshorePrev.push(sumHoursOffshorePrev[month]);
                        costTotalOffshorePrev.push(sumCostOffshorePrev[month]);
                    }
                }
                if (!($.isEmptyObject(sumHoursOnshore)) || !($.isEmptyObject(sumCostOnshore)) || !($.isEmptyObject(sumHoursOnshorePrev)) || !($.isEmptyObject(sumCostOnshorePrev))) {
                    for (var k in monthRange) {
                        var month = monthRange[k];
                        hoursTotalOnshore.push(sumHoursOnshore[month]);
                        costTotalOnshore.push(sumCostOnshore[month]);
						
						hoursTotalOnshorePrev.push(sumHoursOnshorePrev[month]);
                        costTotalOnshorePrev.push(sumCostOnshorePrev[month]);
                    }
                }
                body = "<tr><td rowspan=6><b>" + name + "</b></td>";
                body += "<td>Offshore Hours</td>";
                if (hoursTotalOffshore.length > 0) {
                    for (var i = 0; i <= hoursTotalOffshore.length - 1; i++) {
                        if (hoursTotalOffshore[i] > 0) {
                            body += "<td>" + hoursTotalOffshore[i] + "</td>";
							
							if(hoursTotalOffshorePrev[i] == 0 || hoursTotalOffshore[i] == hoursTotalOffshorePrev[i])
							{
								body += "<td><font color=Green><b>&ndash;</b></font></td>";
							}
							else
							{
								if(hoursTotalOffshore[i] > hoursTotalOffshorePrev[i])
								{
									hoursDiffOffshore 	= hoursTotalOffshore[i] - hoursTotalOffshorePrev[i];
									percent 			= (hoursDiffOffshore/hoursTotalOffshorePrev[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Red><b>&uarr;</b></font> ";
								}
								if(hoursTotalOffshore[i] < hoursTotalOffshorePrev[i])
								{
									hoursDiffOffshore 	= hoursTotalOffshorePrev[i] - hoursTotalOffshore[i];
									percent 			= (hoursDiffOffshore/hoursTotalOffshore[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Green><b>&darr;</b></font> ";
								}
								body += "<td>" + icon  + percent + " <b>[" + hoursDiffOffshore + "]</b></td>";
							}
                        }
                        else {
                            body += "<td></td>";
							body += "<td></td>";
                        }
                    }
					grossHoursOffshorePrev += hoursTotalOffshorePrev[0];
                }
                else {
                    for (var i = 0; i <= monthRange.length - 1; i++) {
                        body += "<td></td>";
						body += "<td></td>";
                    }
                }
                body += "</tr><tr>";
                body += "<td>Onshore Hours</td>";
                if (hoursTotalOnshore.length > 0) {
                    for (var i = 0; i <= hoursTotalOnshore.length - 1; i++) {
                        if (hoursTotalOnshore[i] > 0) {
                            body += "<td>" + hoursTotalOnshore[i] + "</td>";
							
							if(hoursTotalOnshorePrev[i] == 0 || hoursTotalOnshore[i] == hoursTotalOnshorePrev[i])
							{
								body += "<td><font color=Green><b>&ndash;</b></font></td>";
							}
							else
							{
								if(hoursTotalOnshore[i] > hoursTotalOnshorePrev[i])
								{
									hoursDiffOnshore 	= hoursTotalOnshore[i] - hoursTotalOnshorePrev[i];
									percent 			= (hoursDiffOnshore/hoursTotalOnshorePrev[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Red><b>&uarr;</b></font> ";
								}
								if(hoursTotalOnshore[i] < hoursTotalOnshorePrev[i])
								{
									hoursDiffOnshore 	= hoursTotalOnshorePrev[i] - hoursTotalOnshore[i];
									percent 			= (hoursDiffOnshore/hoursTotalOnshore[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Green><b>&darr;</b></font> ";
								}
								body += "<td>" + icon  + percent + " <b>[" + hoursDiffOnshore + "]</b></td>";
							}
                        }
                        else {
                            body += "<td></td>";
							body += "<td></td>";
                        }
                    }
					grossHoursOnshorePrev += hoursTotalOnshorePrev[0];
                }
                else {
                    for (var i = 0; i <= monthRange.length - 1; i++) {
                        body += "<td></td>";
						body += "<td></td>";
                    }
                }

                var subTotalHours 		= [], i = -1;
				var subTotalHoursPrev 	= [], x = -1;
                
				if (hoursTotalOffshore.length > 0 && hoursTotalOnshore.length > 0) {
                    while (hoursTotalOffshore[++i]) {
                        subTotalHours.push([hoursTotalOffshore[i] + hoursTotalOnshore[i]]);
						subTotalHoursPrev.push([hoursTotalOffshorePrev[i] + hoursTotalOnshorePrev[i]]);
                    }
                }
                else if (hoursTotalOffshore.length > 0 && hoursTotalOnshore.length == 0) {
                    while (hoursTotalOffshore[++i]) {
                        subTotalHours.push([hoursTotalOffshore[i]]);
						subTotalHoursPrev.push([hoursTotalOffshorePrev[i]]);
                    }
                }
                else if (hoursTotalOnshore.length > 0 && hoursTotalOffshore.length == 0) {
                    while (hoursTotalOnshore[++i]) {
                        subTotalHours.push([hoursTotalOnshore[i]]);
						subTotalHoursPrev.push([hoursTotalOnshorePrev[i]]);
                    }
                }
				
                body += "</tr><tr>";
                body += "<td style='background-color: #cccccc;font-weight:bold;'>Total Hours</td>";
                for (var i = 0; i < monthRange.length; i++) {
                    if (subTotalHours[i] > 0) {
                        body += "<td style='background-color: #cccccc;font-weight:bold;' id=subHours" + monthRange[i] + ">" + Number(subTotalHours[i]) + "</td>";
						if(subTotalHoursPrev[i] == 0 || subTotalHours[i] == subTotalHoursPrev[i])
						{
							body += "<td style='background-color: #cccccc;font-weight:bold;'><font color=Green><b>&ndash;</b></font></td>";
						}
						else
						{
							if(subTotalHours[i] > subTotalHoursPrev[i])
							{
								subhoursDiff	= subTotalHours[i] - subTotalHoursPrev[i];
								percent 		= (subhoursDiff/subTotalHoursPrev[i] * 100).toFixed(2) + " %";
								icon 			= "<font color=Red><b>&uarr;</b></font> ";
							}
							if(subTotalHours[i] < subTotalHoursPrev[i])
							{
								subhoursDiff 	= subTotalHoursPrev[i] - subTotalHours[i];
								percent 		= (subhoursDiff/subTotalHours[i] * 100).toFixed(2) + " %";
								icon 			= "<font color=Green><b>&darr;</b></font> ";
							}
							body += "<td style='background-color: #cccccc;font-weight:bold;'>" + icon  + percent + " <b>[" + subhoursDiff + "]</b></td>";
						}
                    }
                    else {
                        body += "<td style='background-color: #cccccc'></td>";
						body += "<td style='background-color: #cccccc'></td>";
                    }
                }
                body += "</tr><tr>";
                body += "<td>Offshore Cost</td>";
                if (costTotalOffshore.length > 0) {
                    for (var i = 0; i < costTotalOffshore.length; i++) {
                        if (costTotalOffshore[i] > 0) {
                            body += "<td>$ " + costTotalOffshore[i] + "</td>";
							
							if(costTotalOffshorePrev[i] == 0 || costTotalOffshore[i] == costTotalOffshorePrev[i])
							{
								body += "<td><font color=Green><b>&ndash;</b></font></td>";
							}
							else
							{
								if(Number(costTotalOffshore[i]) > Number(costTotalOffshorePrev[i]))
								{
									costDiffOffshore 	= costTotalOffshore[i] - costTotalOffshorePrev[i];
									percent 			= (costDiffOffshore/costTotalOffshorePrev[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Red><b>&uarr;</b></font> ";
								}
								if(Number(costTotalOffshore[i]) < Number(costTotalOffshorePrev[i]))
								{
									costDiffOffshore 	= costTotalOffshorePrev[i] - costTotalOffshore[i];
									percent 			= (costDiffOffshore/costTotalOffshore[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Green><b>&darr;</b></font> ";
								}
								body += "<td>" + icon  + percent + " <b>[$ " + Number(costDiffOffshore).toFixed(2) + "]</b></td>";
							}
                        }
                        else {
                            body += "<td></td>"
							body += "<td></td>"
                        }
                    }
					grossCostOffshorePrev += costTotalOffshorePrev[0];
                }
                else {
                    for (var i = 0; i < monthRange.length; i++) {
                        body += "<td></td>";
						body += "<td></td>";
                    }
                }
                body += "</tr><tr>";
                body += "<td>Onshore Cost</td>";
                if (costTotalOnshore.length > 0) {
                    for (var i = 0; i < costTotalOnshore.length; i++) {
                        if (costTotalOnshore[i] > 0) {
                            body += "<td>$ " + costTotalOnshore[i] + "</td>";
							
							if(costTotalOnshorePrev[i] == 0 || costTotalOnshore[i] == costTotalOnshorePrev[i])
							{
								body += "<td><font color=Green><b>&ndash;</b></font></td>";
							}
							else
							{
								if(Number(costTotalOnshore[i]) > Number(costTotalOnshorePrev[i]))
								{
									costDiffOnshore 	= costTotalOnshore[i] - costTotalOnshorePrev[i];
									percent 			= (costDiffOnshore/costTotalOnshorePrev[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Red><b>&uarr;</b></font> ";
								}
								if(Number(costTotalOnshore[i]) < Number(costTotalOnshorePrev[i]))
								{
									costDiffOnshore 	= costTotalOnshorePrev[i] - costTotalOnshore[i];
									percent 			= (costDiffOnshore/costTotalOnshore[i] * 100).toFixed(2) + " %";
									icon 				= "<font color=Green><b>&darr;</b></font> ";
								}
								body += "<td>" + icon  + percent + " <b>[$ " + Number(costDiffOnshore).toFixed(2) + "]</b></td>";
							}
                        }
                        else {
                            body += "<td></td>"
							body += "<td></td>"
                        }
                    }
					grossCostOnshorePrev += costTotalOnshorePrev[0];
                }
                else {
                    for (var i = 0; i < monthRange.length; i++) {
                        body += "<td></td>";
                    }
                }
                body += "</tr><tr>";
                body += "<td style='background-color: #cccccc;font-weight:bold;'>Total Cost</td></td>";

                var subTotalCost = [], i = -1;
				var subTotalCostPrev = [], i = -1;
				
                if (costTotalOffshore.length > 0 && costTotalOnshore.length > 0) {
                    while (costTotalOffshore[++i]) {
                        subTotalCost.push([costTotalOffshore[i] + costTotalOnshore[i]]);
						subTotalCostPrev.push([costTotalOffshorePrev[i] + costTotalOnshorePrev[i]]);
                    }
                }
                else if (costTotalOffshore.length > 0 && costTotalOnshore.length == 0) {
                    while (costTotalOffshore[++i]) {
                        subTotalCost.push([costTotalOffshore[i]]);
						subTotalCostPrev.push([costTotalOffshorePrev[i]]);
                    }
                }
                else if (costTotalOnshore.length > 0 && costTotalOffshore.length == 0) {
                    while (costTotalOnshore[++i]) {
                        subTotalCost.push([costTotalOnshore[i]]);
						subTotalCostPrev.push([costTotalOnshorePrev[i]]);
                    }
                }
				
                for (var i = 0; i < monthRange.length; i++) {
                    if (subTotalCost[i] > 0) {
                        body += "<td style='background-color: #cccccc;font-weight:bold;' id=subCost" + monthRange[i] + ">$ " + Number(subTotalCost[i]).toFixed(2) + "</td>";
						
						if(subTotalCostPrev[i] == 0 || subTotalCost[i] == subTotalCostPrev[i])
						{
							body += "<td style='background-color: #cccccc;font-weight:bold;'><font color=Green><b>&ndash;</b></font></td>";
						}
						else
						{
							if(Number(subTotalCost[i]) > Number(subTotalCostPrev[i]))
							{
								subcostDiff		= subTotalCost[i] - subTotalCostPrev[i];
								percent 		= (subcostDiff/subTotalCostPrev[i] * 100).toFixed(2) + " %";
								icon 			= "<font color=Red><b>&uarr;</b></font> ";
							}
							if(Number(subTotalCost[i]) < Number(subTotalCostPrev[i]))
							{
								subcostDiff 	= subTotalCostPrev[i] - subTotalCost[i];
								percent 		= (subcostDiff/subTotalCost[i] * 100).toFixed(2) + " %";
								icon 			= "<font color=Green><b>&darr;</b></font> ";
							}
							body += "<td style='background-color: #cccccc;font-weight:bold;'>" + icon  + percent + " <b>[$ " + Number(subcostDiff).toFixed(2) + "]</b></td>";
						}
                    }
                    else {
                        body += "<td style='background-color: #cccccc'></td>";
						body += "<td style='background-color: #cccccc'></td>";
                    }
                }
                body += "</tr>";
                $("#tbPivot2").append(body);
            }
        });
    });
    
	grossHoursPrev 	= grossHoursOffshorePrev + grossHoursOnshorePrev;
	grossCostPrev 	= Number(grossCostOffshorePrev) + Number(grossCostOnshorePrev);
	
    var hTotal = 0;
    var cTotal = 0;
    var netHours 	= 0;
	var netCost 	= 0;
	
	var iconFooter;
	var nethoursDiff	= 0;
	var netcostDiff 	= 0;
	var percentFooter 	= 0;
	
    footer = "<tr><td rowspan=2 style='border-bottom:0px #fff;border-left:0px #fff;'></td>";
    footer += "<td style='border-top: 3px solid black;'><b>Gross Hours</b></td>";
    for (var i = 0; i < monthRange.length; i++) {
        $("#tbPivot2 tr td[id=subHours" + monthRange[i] + "]").each(function () {
            hTotal += Number($(this).html());
        });
        footer += "<td style='background-color:#a2c3c3;border-top: 3px solid black;'><b>" + hTotal + "</b></td>";
		
		if(i == 0)
		{
			if(grossHoursPrev == 0)
			{
				footer += "<td style='background-color:#e0ebeb;border-top: 3px solid black;'><font color=Green><b>&ndash;</b></font></td>";
			}
			else
			{
				if(hTotal > grossHoursPrev)
				{
					nethoursDiff 	= hTotal - grossHoursPrev;
					percentFooter	= (nethoursDiff/grossHoursPrev * 100).toFixed(2) + " %";
					iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
				}
				if(hTotal < grossHoursPrev)
				{
					nethoursDiff	= grossHoursPrev - hTotal;
					percentFooter	= (nethoursDiff/hTotal * 100).toFixed(2) + " %";
					iconFooter		= "<font color=Green><b>&darr;</b></font> ";
				}
				footer += "<td style='background-color:#e0ebeb;border-top: 3px solid black;'><b>" + iconFooter  + percentFooter + " [" + nethoursDiff + "]</b></td>";
			}
		}
		else
		{
			if(hTotal > netHours)
			{
				nethoursDiff 	= hTotal - netHours;
				percentFooter 	= (nethoursDiff/netHours * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
			}
			if(hTotal < netHours)
			{
				nethoursDiff	= netHours - hTotal;
				percentFooter 	= (nethoursDiff/hTotal * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Green><b>&darr;</b></font> ";
			}
			footer += "<td style='background-color:#e0ebeb;border-top: 3px solid black;'><b>" + iconFooter  + percentFooter + " [" + nethoursDiff + "]</b></td>";
		}
        netHours = hTotal;
        hTotal = 0;
    }
    footer += "</tr><tr>";
    footer += "<td><b>Gross Cost</b></td>";
    for (var j = 0; j < monthRange.length; j++) {
        $("#tbPivot2 tr td[id=subCost" + monthRange[j] + "]").each(function () {
            if ($(this).html() != '') {
                cTotal += Number($(this).html().substr(2));
            }
        });
        footer += "<td style=background-color:#a2c3c3;><b>$ " + cTotal.toFixed(2) + "</b></td>";
		if(j == 0)
		{
			if(grossCostPrev == 0)
			{
				footer += "<td style=background-color:#e0ebeb;><font color=Green><b>&ndash;</b></font></td>";
			}
			else
			{
				if(cTotal > grossCostPrev)
				{
					netcostDiff 	= cTotal - grossCostPrev;
					percentFooter 	= (netcostDiff/grossCostPrev * 100).toFixed(2) + " %";
					iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
				}
				if(cTotal < grossCostPrev)
				{
					netcostDiff		= grossCostPrev - cTotal;
					percentFooter 	= (netcostDiff/cTotal * 100).toFixed(2) + " %";
					iconFooter 		= "<font color=Green><b>&darr;</b></font> ";
				}
				footer += "<td style=background-color:#e0ebeb;><b>" + iconFooter  + percentFooter + " [$ " + netcostDiff.toFixed(2) + "]</b></td>";
			}
		}
		else
		{
			if(cTotal > netCost)
			{
				netcostDiff 	= cTotal - netCost;
				percentFooter 	= (netcostDiff/netCost * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Red><b>&uarr;</b></font> ";
			}
			if(cTotal < netCost)
			{
				netcostDiff		= netCost - cTotal;
				percentFooter 	= (netcostDiff/cTotal * 100).toFixed(2) + " %";
				iconFooter 		= "<font color=Green><b>&darr;</b></font> ";
			}
			footer += "<td style=background-color:#e0ebeb;><b>" + iconFooter  + percentFooter + " [$ " + netcostDiff.toFixed(2) + "]</b></td>";
		}
        netCost = cTotal;
        cTotal = 0;
    }
    footer += "</tr>"
    $("#tbPivot2").append(footer);
}

function Pivot3Report(year, from, to) {
    var monthRange = GetMonthRange(from, to);
    var body;
    var footer;
    var gTotalHours = 0;
    var gTotalCost  = 0;
    $("#tbPivot3 thead tr").empty();
    $("#tbPivot3 tbody").empty();

    $("#tbPivot3 tr:first").append("<th rowspan=2 width=200px style='background-color:#fff;border-top:0px #fff;border-left:0px #fff;border-right:0px #fff;'></th>");
    $("#tbPivot3 tr:first").append("<th rowspan=2 style='background-color:#2F4F4F;color:#fff'>Employee ID</th>");
    $("#tbPivot3 tr:first").append("<th rowspan=2 style='background-color:#2F4F4F;color:#fff'>Employee Name</th>");
    $("#tbPivot3 tr:first").append("<th rowspan=2 style='background-color:#2F4F4F;color:#fff'>Location</th>");
    for (var i = 0; i < monthRange.length; i++) {
        $("#tbPivot3 tr:first").append("<th colspan=3 width=70px style='background-color:#2F4F4F;color:#fff'>" + monthRange[i] + "</th>");
    }
    
    for (var i = 0; i < monthRange.length; i++) {
        $("#tbPivot3 tr:nth-child(2)").append("<th style='background-color:#cccccc;color:#000'>Hours</th><th style='background-color:#cccccc;color:#000'>Cost</th><th style='background-color:#fff;color:#000'>Rate &uarr; &darr;</th>");
    }
    $("#tbPivot3 tr:first").append("<th colspan=2 style='background-color:#2F4F4F;color:#fff'>Total</th>");
    $("#tbPivot3 tr:nth-child(2)").append("<th style='background-color: #cccccc;font-weight:bold;color:#000;'>Hours Total</th><th style='background-color: #cccccc;font-weight:bold;color:#000;'>Cost Total</th>");

    $(mngrxml).find('OnshoreManager').each(function () {
        $(this).find('Manager').each(function () {
            var name = $(this).attr('Name');
            var EmployeeInfo    = getEmployeeDataPivot(name, monthRange, year);
            var empBasic        = EmployeeInfo[0];
            var empBilling      = EmployeeInfo[1];
			var icon;
			var sign;
			var percent;
			
            if (empBasic.length > 0 && empBilling.length > 0)
            {
                body = "<tr><td rowspan=" + empBasic.length + "><b>" + name + "</b></td>";
                var x = 0;
                var len = monthRange.length;
                for (var i = 0; i < empBasic.length; i++) {
                    var hoursTotal 	= 0
                    var costTotal 	= 0;
                    var empInfo 	= empBasic[i].join(",");
                    body += "<td>" + empInfo.split(",")[0] + "</td>";
                    body += "<td>" + empInfo.split(",")[1] + "</td>";
                    body += "<td>" + empInfo.split(",")[2] + "</td>";

                    for (j = x; j < len; j++) {
                        var empBill = empBilling[j].join(",");
						
						if(empBill.split(",")[4] != 0)
						{
							percent = empBill.split(",")[4] + " %"; 
						}
						else
						{
							percent = "";
						}
							
						if(empBill.split(",")[5] != 'NC')
						{
							sign = "<span class=boxed><b>" + empBill.split(",")[5] + "</b></span> ";
                        }
						else
						{
							sign = "";
						}
						
						if (empBill.split(",")[1] > 0 && empBill.split(",")[2] > 0) {
                            body += "<td>" + empBill.split(",")[1] + "</td>";
                            body += "<td>$ " + empBill.split(",")[2] + "</td>";
                        }
                        else
                        {
                            body += "<td></td>";
                            body += "<td></td>";
                        }
						
						if(empBill.split(",")[3] == "None")
						{
							icon = "<font color=Green><b>&ndash;</b></font> "
						}
						if(empBill.split(",")[3] == "High")
						{
							icon = "<font color=Red><b>&uarr;</b></font> "
						}
						if(empBill.split(",")[3] == "Low")
						{
							icon = "<font color=Green><b>&darr;</b></font> "
						}
						body += "<td>" + sign + icon + percent + "</td>";	
                        
						hoursTotal	+= Number(empBill.split(",")[1]);
                        costTotal 	+= Number(empBill.split(",")[2]);
                    }


                    body += "<td style='font-weight:bold'>" + hoursTotal + "</td>";
                    body += "<td style='font-weight:bold'>$ " + Number(costTotal).toFixed(2) + "</td>";
                    body += "</tr>";
                    x = j;
                    len += monthRange.length;

                    gTotalHours += hoursTotal;
                    gTotalCost  += costTotal;
                }
            }
            $("#tbPivot3").append(body);
        });
    });

    footer = "<tr>";
    footer += "<td colspan=4 style='border-bottom:0px #fff;border-left:0px #fff;border-right:0px #fff;'></td>";
    for (var x = 0; x < pivot3HoursTotal.length; x++)
    {
        if (pivot3HoursTotal[x] != null && pivot3CostTotal[x] != null) {
	    
            footer += "<td style='font-weight:bold;background-color:#a2c3c3;border-top: 3px solid black;'>" + pivot3HoursTotal[x] + "</td>";
            footer += "<td style='font-weight:bold;background-color:#a2c3c3;border-top: 3px solid black;'>$ " + Number(pivot3CostTotal[x]).toFixed(2) + "</td>";
	    	footer += "<td style='border-bottom:0px #fff;border-left:0px #fff;border-top: 3px solid black;'></td>";
        }
        else
        {
            footer += "<td style='font-weight:bold;background-color:#a2c3c3;border-top: 3px solid black;'></td>";
        }
    }
    footer += "<td style='font-weight:bold;background-color:#cccccc;border-top: 3px solid black;'>" + gTotalHours + "</td>";
    footer += "<td style='font-weight:bold;background-color:#cccccc;border-top: 3px solid black;'>$ " + Number(gTotalCost).toFixed(2) + "</td>";
    footer += "</tr>";
    $("#tbPivot3").append(footer);
}



/***********************************/
/*          Button Events          */
/***********************************/

$(function () {
    $("[id*=btnAdd]").bind("click", function () {
        var xmlData = $.parseXML(xmlStr);
        
        var id   = $("[id*=txtEmpID]").val();
        var name = $("[id*=txtName]").val();
        
        var outlook     = $("#drpOutlook option:selected").text();
        var offMngr     = $("#drpOffshoreMngr option:selected").text();
        var onMngr      = $("#drpOnshoreMngr option:selected").text();
        var billable    = $("#drpBillable option:selected").text();
        var resourceType = $("#drpResourceType option:selected").text();
        var location    = $("#drpLocation option:selected").text();
        var ibmtype     = $("#drpIBMType option:selected").text();
        var budget      = $("#drpBudget option:selected").text();
        var projarea    = $("#drpProject option:selected").text();
        var year        = $("#drpYear option:selected").text();
        
        var bandStr = '';
        for (var n = 1; n <= 12; n++) {
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var mnth    = monthNames[n-1];
            
            var band    = $("#drpBand" + n + " option:selected").text();
            var rate    = $("#rate" + n).html();
            var hours   = $("#txtHours" + n).val();
            var cost    = $("#cost" + n).html();

            if (band != "Select Band") {
                bandStr = bandStr + "<Month Val='" + mnth + "'><Band>" + band + "</Band><Rate>" + rate + "</Rate><Hours>" + hours + "</Hours><Cost>" + cost + "</Cost></Month>";
            }
            else
            {
                bandStr = bandStr + "<Month Val='" + mnth + "'><Band></Band><Rate></Rate><Hours></Hours><Cost></Cost></Month>";
            }
        }
        $(xmlData).find('Employees').append($.parseXML("<Employee><EmpID>" + id + "</EmpID><Name>" + name + "</Name><OutlookCategory>" + outlook + "</OutlookCategory><Status>Active</Status><OffshoreManager>" + offMngr + "</OffshoreManager><OnshoreManager>" + onMngr + "</OnshoreManager><Billable>" + billable + "</Billable><ResourceType>" + resourceType + "</ResourceType><Location>" + location + "</Location><IBMType>" + ibmtype + "</IBMType><BudgetArea>" + budget + "</BudgetArea><ProjectArea>" + projarea + "</ProjectArea><Billing><Year Val='" + year + "'>" + bandStr + "</Year></Billing></Employee>").documentElement);
        var xmlString = (new XMLSerializer()).serializeToString(xmlData);
        UpdateEmployeeData(xmlString)
    });
});

$(function () {
    $("[id*=btnUpdate]").bind("click", function () {
        var year = $("#drpYear option:selected").text();
        var childNode;
        var xmlData = $.parseXML(xmlStr);
        $(xmlData).find("Employee").each(function () {
            if ($(this).find("EmpID").text() == editedID) {
                childNode = $(this).find("EmpID").text($("[id*=txtEmpID]").val());
                childNode = $(this).find("Name").text($("[id*=txtName]").val());
                childNode = $(this).find("OutlookCategory").text($("#drpOutlook option:selected").text());
                childNode = $(this).find("OffshoreManager").text($("#drpOffshoreMngr option:selected").text());
                childNode = $(this).find("OnshoreManager").text($("#drpOnshoreMngr option:selected").text());
                childNode = $(this).find("Billable").text($("#drpBillable option:selected").text());
                childNode = $(this).find("ResourceType").text($("#drpResourceType option:selected").text());
                childNode = $(this).find("Location").text($("#drpLocation option:selected").text());
                childNode = $(this).find("IBMType").text($("#drpIBMType option:selected").text());
                childNode = $(this).find("BudgetArea").text($("#drpBudget option:selected").text());
                childNode = $(this).find("ProjectArea").text($("#drpProject option:selected").text());
               
                $(this).find("Billing").each(function () {
                    $(this).find("Year").each(function () {
                        if ($(this).attr("Val") == year) {
                            for (var n = 1; n <= 12; n++) {
                                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                
                                $(this).find("Month").each(function () {
                                    var mnth = monthNames[n - 1];
                                    if ($(this).attr("Val") == mnth) {
                                        var band = $("#drpBand" + n + " option:selected").text();
                                        if (band != "Select Band") {
                                            childNode = $(this).find("Band").text($("#drpBand" + n + " option:selected").text());
                                            childNode = $(this).find("Rate").text($("#rate" + n).html());
                                            childNode = $(this).find("Hours").text($("#txtHours" + n).val());
                                            childNode = $(this).find("Cost").text($("#cost" + n).html());
                                        }
                                    }
                                    n = n + 1;
                                });
                            }
                        }
                    });
                });
                var xmlString = (new XMLSerializer()).serializeToString(xmlData);
                UpdateEmployeeData(xmlString);
            }
        });
    });
});

$(function () {
    $("[id*=btnNew]").bind("click", function () {
        ResetAllValues();
        $("#AddEditEmployee").show("slow");
        $("#btnUpdate").hide();
        $("#btnAdd").show();
    });
});

$(function () {
    $("[id*=btnClose]").bind("click", function () {
        ResetAllValues();
        $("#AddEditEmployee").hide("slow");
        $("#btnUpdate").hide();
        $("#btnAdd").hide();
    });
});

$(function () {
    $("[id*=btnPivot1]").bind("click", function () {
		var blobURL = ExportToExcel('tbPivot1', 'Global Report');
	    $(this).attr('download','GlobalReport-'+date+'.xls');
	    $(this).attr('href',blobURL);
    });
});

$(function () {
    $("[id*=btnPivot2]").bind("click", function () {
        var blobURL = ExportToExcel('tbPivot2', 'Onshore Offshore Report');
	    $(this).attr('download','OnshoreOffshoreReport-'+date+'.xls');
	    $(this).attr('href',blobURL);
    });
});

$(function () {
    $("[id*=btnPivot3]").bind("click", function () {
		var blobURL = ExportToExcel('tbPivot3', 'Employee Report');
	    $(this).attr('download','EmployeeReport-'+date+'.xls');
	    $(this).attr('href',blobURL);
    });
});

$(function () {
    $("[id*=btnShowReport]").bind("click", function () {

        $("#ReportTab").show();
        $("#SelectPeriod").hide();
        var year = $("#drpYear option:selected").text();
        var from = $("#drpMonthFrom option:selected").text();
        var to = $("#drpMonthTo option:selected").text();

        Pivot1Report(year, from, to);
        Pivot2Report(year, from, to);
        Pivot3Report(year, from, to);
    });
});

$(function () {
    $("[id*=btnLogin]").bind("click", function () {
        var selectedManager = $("#drpManagerName option:selected").text()
        var password = $("[id*=txtPass]").val();
		
		if(password != '')
		{
			ValidatePassword(password,selectedManager);
	        if (loginFlag == true) {
	            loggedUser = selectedManager;
	            $("#Login").hide();
	            $("#ReportsTab").hide();
	            $("#SelectPeriod").hide();
	            $("#Actions").show();
	            $("#Records").show();
	            $("#Signout").show();
	            LoadEmployeeData();
	            parent.location.hash = Encryption(loggedUser, "encode");
	        }
	        else {
	            alert("Password Do Not Match For Selected User");
	            return false;
	        }
		}
		else 
		{
            alert("Please type a password");
            return false;
	    }
    });
});

$(function () {
    $("[id*=btnChangePass]").bind("click", function () {

		var oldPass 	= $("[id*=txtPass]").val();
		var changePass 	= $("[id*=txtPassChange]").val();
		var retypePass 	= $("[id*=txtPassRetype]").val();
        var selectedManager = $("#drpManagerName option:selected").text()
        
		if(flag == 1)
        {
            var password = $("[id*=txtPass]").val();
            ValidatePassword(password, selectedManager);

            if (oldPass = '' || changePass == '' || retypePass == '') {
                alert("All Fields : Old Password, New Password & ReType New Password should be filled in. \n\Please contact your Administrator if you forgot your Old Password");
                return false;
            }
            else if (loginFlag == false) {
                alert("Old Password Do Not Match For Selected User");
                return false;
            }
            else if (changePass != retypePass) {
                alert("Changed password & retyped password do not match");
                return false;
            }
            else {
                /* PENDING - Server Side Code to Update Password XML File */
                UpdateManagerPassword(managerType, selectedManager, changePass)

                alert("Password Changed y !!! \n\Please login with your new password");
                flag = 0;
                Signout();
                $('#passLabel').html('Password');
            }
        }
		else
        {
            if (selectedManager != "ADMINISTRATOR") {
                $("#pass1").show();
                $("#pass2").show();
                $("#btnCancel").show();
                $("#btnLogin").hide();
                $('#passLabel').html('Old Password');
                $('#btnLabel').html('Update Password');
                flag = 1;
            }
            else {
                alert("Admin Password cannot be changed !!! \n\ Please contact Administrator of the Site");
                return false;
            }
		}
    });
});

$(function () {
    $("[id*=btnCancel]").bind("click", function () {
		flag = 0;
		$('#passLabel').html('Password');
        $("#pass1").hide();
        $("#pass2").hide();
       	$("#btnCancel").hide();
		$("#btnLogin").show();
		$('#btnLabel').html('Change Password');
    });
});
/***********************************/
/*      Transactional Events       */
/***********************************/
function ValidatePassword(password,selectedManager)
{
	loginFlag = false;
	
    $(mngrxml).find('OnshoreManager').each(function () {
        $(this).find('Manager').each(function () {
            if ($(this).attr('Name') == selectedManager && $(this).text() == password) {
                loginFlag = true;
                managerType = "OnshoreManager";
            }
        });
    });

    $(mngrxml).find('OffshoreManager').each(function () {
        $(this).find('Manager').each(function () {
            if ($(this).attr('Name') == selectedManager && $(this).text() == password) {
                loginFlag = true;
                managerType = "OffshoreManager";
            }
        });
    });

    $(mngrxml).find('Admin').each(function () {
        $(this).find('Manager').each(function () {
            if ($(this).attr('Name') == selectedManager && $(this).text() == password) {
                loginFlag = true;
                managerType = "Admin";
            }
        });
    });
}

function LoadEmployeeData() {
    $("#tbDetails").find("tr:gt(0)").remove();
    var selectedStatus = $("#drpStatus option:selected").text()

    if (window.location.hash.substr(1) != "") {
        loggedUser = Encryption(window.location.hash.substr(1), "decode");
    }

    $.ajax({
        type: "GET",
        url: "Data/Employees.xml",
        dataType: "xml",
        cache: false,
        success: function (data) {
            xmlStr = data.xml ? data.xml : (new XMLSerializer()).serializeToString(data);
            $(xmlStr).find('Employee').each(function () {
                if (loggedUser == "ADMINISTRATOR") {
                    if (selectedStatus == "All") {
                        if ($(this).find('Status').text() == 'Active' || $(this).find('Status').text() == 'InActive') {
                            BuildRecordsTable($(this));
                        }
                    }
                    else {
                        if ($(this).find('Status').text() == selectedStatus) {
                            BuildRecordsTable($(this));
                        }
                    }
                }
                else {
                    if (selectedStatus == "All") {
                        if (($(this).find('Status').text() == 'Active' || $(this).find('Status').text() == 'InActive') && ($(this).find('OffshoreManager').text() == loggedUser || $(this).find('OnshoreManager').text() == loggedUser)) {
                            BuildRecordsTable($(this));
                        }
                    }
                    else {
                        if (($(this).find('Status').text() == selectedStatus) && ($(this).find('OffshoreManager').text() == loggedUser || $(this).find('OnshoreManager').text() == loggedUser)) {
                            BuildRecordsTable($(this));
                        }
                    }
                }
            });
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }
    });
}

function BuildRecordsTable(xml) {
    var id = xml.find('EmpID').text();
    var name = xml.find('Name').text();
    var outlook = xml.find('OutlookCategory').text();
    var offMngr = xml.find('OffshoreManager').text();
    var onMngr = xml.find('OnshoreManager').text();
    var billable = xml.find('Billable').text();
    var resourceType = xml.find('ResourceType').text();
    var location = xml.find('Location').text();
    var ibmtype = xml.find('IBMType').text();
    var budget = xml.find('BudgetArea').text();
    var projarea = xml.find('ProjectArea').text();

    //$("#tbDetails").append("<tr><td><input type=checkbox onclick=UncheckOthers(this); id=" + id + "></td><td>" + id + "</td><td>" + name + "</td><td>" + outlook + "</td><td>" + offMngr + "</td><td>" + onMngr + "</td><td>" + billable + "</td><td>" + resourceType + "</td><td>" + location + "</td><td>" + ibmtype + "</td><td>" + budget + "</td><td>" + projarea + "</td></tr>");
    $("#tbDetails").append("<tr><td><img src=images/Edit.png title='Edit Record' width=17 height=17 style='cursor: pointer;' id=" + id + " onclick=EditEmployee(this)>&nbsp;&nbsp;<img src=images/Delete.png title='Delete Record' width=17 height=17 style='cursor: pointer;' id=" + id + " onclick=DeleteEmployee(this)></td><td>" + id + "</td><td>" + name + "</td><td>" + outlook + "</td><td>" + offMngr + "</td><td>" + onMngr + "</td><td>" + billable + "</td><td>" + resourceType + "</td><td>" + location + "</td><td>" + ibmtype + "</td><td>" + budget + "</td><td>" + projarea + "</td></tr>");
}

function EditEmployee(edit) {
    ResetAllValues();

    var year = $("#drpYear option:selected").text();
    editedID = edit.id;
    $("#AddEditEmployee").show("slow");
    $("#btnUpdate").show();
    $("#btnAdd").hide();

    var xmlData = $.parseXML(xmlStr);
    $(xmlData).find("Employee").each(function () {
        if ($(this).find("EmpID").text() == editedID) {
            $('#txtEmpID').val($(this).find("EmpID").text());
            $('#txtName').val($(this).find("Name").text());
            $("#drpOutlook option:contains('" + $(this).find("OutlookCategory").text() + "')").attr('selected', true);
            $("#drpOffshoreMngr option:contains('" + $(this).find("OffshoreManager").text() + "')").attr('selected', true);
            $("#drpOnshoreMngr option:contains('" + $(this).find("OnshoreManager").text() + "')").attr('selected', true);
            $("#drpBillable option:contains('" + $(this).find("Billable").text() + "')").attr('selected', true);
            $("#drpResourceType option:contains('" + $(this).find("ResourceType").text() + "')").attr('selected', true);
            $("#drpLocation option:contains('" + $(this).find("Location").text() + "')").attr('selected', true);
            $("#drpIBMType option:contains('" + $(this).find("IBMType").text() + "')").attr('selected', true);
            $("#drpBudget option:contains('" + $(this).find("BudgetArea").text() + "')").attr('selected', true);
            $("#drpProject option:contains('" + $(this).find("ProjectArea").text() + "')").attr('selected', true);

            $(this).find("Billing").each(function () {
                $(this).find("Year").each(function () {
                    if ($(this).attr("Val") == year) {
                        for (var n = 1; n <= 12; n++) {
                            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            $(this).find("Month").each(function () {
                                var mnth = monthNames[n - 1];
                                if ($(this).attr("Val") == mnth) {
                                    if ($(this).find("Band").text() != '') {
                                        $("#drpBand" + n + " option:contains('" + $(this).find("Band").text() + "')").attr('selected', true);
                                        $("#rate" + n).html($(this).find("Rate").text())
                                        $("#txtHours" + n).val($(this).find("Hours").text());
                                        $("#cost" + n).html($(this).find("Cost").text());
                                    }
                                }
                                n = n + 1;
                            });
                        }
                    }
                });
            });
        }
    });
}

function DeleteEmployee(del) {
    if (confirm("Are you sure to delete this record ?")) {

        deleteID = del.id;
        var xmlData = $.parseXML(xmlStr);
        $(xmlData).find("Employee").each(function () {
            if ($(this).find("EmpID").text() == deleteID) {
                
				/* Do not delete, instead make InActive 
                $(this).remove();*/
				
                var childNode = $(this).find("Status").text("InActive");
                var xmlString = (new XMLSerializer()).serializeToString(xmlData);
                UpdateEmployeeData(xmlString);
            }
        });
    }
    else { return false; }
}

/***********************************/
/*      Server Side Action         */
/***********************************/
function UpdateEmployeeData(xmlString) {
    $.ajax({
        
        //url: "WebService1.asmx/UpdateEmployeeFile",
        url: "/Home/UpdateEmployeeFile",
        type: "POST",
        //data: '{xmlString: ' + JSON.stringify(xmlString) + '}',
        data: { 'xmlString': xmlString },
        //contentType: "application/json; charset=utf-8",
        async: false,
        beforeSend: function () {
            $("#Busy").show();
        },
        success: function (data) {
            $("#tbDetails").find("tr:gt(0)").remove();
            LoadEmployeeData();
            $("#AddEditEmployee").hide("slow");
        },
        complete:function(){
            $("#Busy").hide();
        },
        error: function (xhr) {
            alert(xhr.responseText);
        }
    });
}

function UpdateManagerPassword(ManagerType, Name, Password) {
    var xmlString = ManagerType + "," + Name + "," + Password;
    $.ajax({
        url: "/Home/UpdateManagerPassword",
        type: "POST",
        data: { 'xmlString': xmlString },
        async: false,
        beforeSend: function () {
            $("#Busy").show();
        },
        success: function (data) {
            Signout();
        },
        complete: function () {
            $("#Busy").hide();
        },
        error: function (xhr) {
            alert(xhr.responseText);
        }
    });
}

/***********************************/
/*      Other Functions            */
/***********************************/
var ExportToExcel = (function() {
  var uri = 'data:application/vnd.ms-excel;base64,'
    , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta charset="utf-8"></head><body><table border=1>{table}</table></body></html>'
    , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
    , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
  	return function(table, name) {
    if (!table.nodeType) table = document.getElementById(table)
    var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
    var blob = new Blob([format(template, ctx)]);
  	var blobURL = window.URL.createObjectURL(blob);
    return blobURL;
  }
})()
	
function AddKeyPress(e) {
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('btnLogin').click();
        return false;
    }
    return true;
}

function Search() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("txtSearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("tbDetails");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function Encryption(name, action) {
    var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
    if (action == "encode") {
        return Base64.encode(name);
    }
    if (action == "decode") {
        return Base64.decode(name);
    }
}

document.onkeydown = function (evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
        $("#AddEditEmployee").hide("slow");
    }
};

function Signout() {
    loggedUser = null;
    location.href = window.location.pathname;
}

function ResetAllValues() {
    $("#AddEditEmployee").find('input:text').val('');

    for (var n = 1; n <= 12; n++) {
        $("#drpBand" + n).val(0);
        $("#rate" + n).html('');
        $("#txtHours" + n).val('');
        $("#cost" + n).html('');
    }
}

function ShowReportTab(control) {
    if (control.id == "Report") {
        $("#Records").hide();
        $("#ReportTab").hide();
        $("#SelectPeriod").show();
    }
    if (control.id == "People") {
        $("#Records").show();
        $("#ReportTab").hide();
        $("#SelectPeriod").hide();
    }
}

function GetDate()
{
	var nowDate = new Date(); 
	date = (nowDate.getMonth()+1)+'/'+nowDate.getDate()+'/'+nowDate.getFullYear(); 
	var objDate = new Date(date),
    locale = "en-us",
    month = objDate.toLocaleString(locale, { month: "short" });
	date = nowDate.getDate()+month+nowDate.getFullYear();
}

/***********************************/
/*     Commented Codes             */
/***********************************/
/*
function PrintToPDF(tblToPrint) {
    var toPrint = document.getElementById(tblToPrint);
    newWin = window.open();
    newWin.document.write('<html><head><title></title><link rel="stylesheet" type="text/css" href="Scripts/Styles.css"></head><body>');
    newWin.document.write(toPrint.outerHTML);
    newWin.document.write('</body></html>');
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
}

function UncheckOthers(chkbox) {
    var chkList = chkbox.parentNode.parentNode.parentNode;
    var chkboxControls = chkList.getElementsByTagName("input");
    for (var i = 0; i < chkboxControls.length; i++) {
        if (chkboxControls[i] != chkbox && chkbox.checked) {
            chkID = chkbox.id;
            chkboxControls[i].checked = false;
        }
    }
}

$(function () {
    $("[id*=btnDelete]").bind("click", function () {
        if (chkID != null) {
            if (confirm("Are you sure to delete this record ?")) {
                var xmlData = $.parseXML(xmlStr);
                $(xmlData).find("Employee").each(function () {
                    if ($(this).find("EmpID").text() == chkID) {
                        //Do not delete, instead make InActive
                        //$(this).remove();
                        var childNode = $(this).find("Status").text("InActive");
                        var xmlString = (new XMLSerializer()).serializeToString(xmlData);
                        UpdateEmployeeData(xmlString);
                    }
                });
            }
            else
                {return false;}
        }
        else
        { alert("Please Select An Employee Record") }
    });
});

$(function () {
    $("[id*=btnEdit]").bind("click", function () {
        
        if (chkID != null) {
            $("#AddEditEmployee").show("slow");
            $("#btnUpdate").show();
            $("#btnAdd").hide();
            var xmlData = $.parseXML(xmlStr);
            $(xmlData).find("Employee").each(function () {
                if ($(this).find("EmpID").text() == chkID) {
                    $('#txtEmpID').val($(this).find("EmpID").text());
                    $('#txtName').val($(this).find("Name").text());
                    $("#drpOutlook option:contains('" + $(this).find("OutlookCategory").text() + "')").attr('selected', true);
                    $("#drpOffshoreMngr option:contains('" + $(this).find("OffshoreManager").text() + "')").attr('selected', true);
                    $("#drpOnshoreMngr option:contains('" + $(this).find("OnshoreManager").text() + "')").attr('selected', true);
                    $("#drpBillable option:contains('" + $(this).find("Billable").text() + "')").attr('selected', true);
                    $("#drpResourceType option:contains('" + $(this).find("ResourceType").text() + "')").attr('selected', true);
                    $("#drpLocation option:contains('" + $(this).find("Location").text() + "')").attr('selected', true);
                    $("#drpIBMType option:contains('" + $(this).find("IBMType").text() + "')").attr('selected', true);
                    $("#drpBudget option:contains('" + $(this).find("BudgetArea").text() + "')").attr('selected', true);
                    $("#drpProject option:contains('" + $(this).find("Project").text() + "')").attr('selected', true);
                }
            });
        }
        else
            {alert ("Please Select An Employee Record")}
    });
});
*/