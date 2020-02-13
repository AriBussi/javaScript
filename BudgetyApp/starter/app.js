//-------------------------------------------//
//                  BUDGETY                  //
//-------------------------------------------//


//------------ Module BudgetController (DATA) ------------//
//--------------------------------------------------------//
var BudgetController = (function() {
    var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome){
      if (totalIncome > 0 ){
      this.percentage = Math.round(this.value / totalIncome * 100);
      } else {
        this.percentage = -1;
      }
    };

    Expense.prototype.getPercentage = function(){
      return this.percentage;
    }
  
    var Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function(type){
      var sum = 0;
      data.allItems[type].forEach(function(cur){ sum += cur.value; });
      data.totals[type]= sum;
    };
  
    var data = {
      allItems: {
        exp: [],
        inc: []
      },
      totals: {
        exp: 0,
        inc: 0
      },
      budget: 0,
      percentage: -1     
    };
  
    return {
      addItem: function(type, des, val) {
        var newItem, ID;
        // create new ID
        if (data.allItems[type].length > 0){
          ID = data.allItems[type][data.allItems[type].length - 1 ].id + 1;
        } else {
          ID = 0;
        }
        
        // create new item based on "inc" or "exp" type
        if (type === "exp") {
          newItem = new Expense(ID, des, val);
        } else if (type === "inc") {
          newItem = new Income(ID, des, val);
        }
        // push new item into data structure array
        data.allItems[type].push(newItem);
        // return new element
        return newItem;
      },

      deleteItem: function(type, id){
        var ids, index;
        // creates an array with the id numbers of the inc or exp elements [1 2 4 6 8 14] 
        ids = data.allItems[type].map(function(current){
          return current.id;
        });
        // finds the current id and returns its index number (if id is 6, index number is 3)
        index = ids.indexOf(id);
        // if index is not -1 delete the element
        if (index !== -1){
          data.allItems[type].splice(index, 1);
        }
      },

      calculateBudget: function(){
        // calculate total inc and exp
        calculateTotal('exp');
        calculateTotal('inc');
        // calculate the budget (inc - exp)
        data.budget = data.totals.inc - data.totals.exp;

        // calculate the percentage of income spent
        if (data.totals.inc > 0){
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
        } else {
          data.percentage = -1;
        }
      },

      calculatePercentages: function(){
        data.allItems.exp.forEach(function(current){
          current.calculatePercentage(data.totals.inc);
        });
      },

      getPercentages: function(){
        var allPercentages = data.allItems.exp.map(function(current){
          return current.getPercentage();  
        });
        return allPercentages;
      },
      
      getBudget: function(){
        return {
          budget: data.budget,
          totalInc: data.totals.inc,
          totalExp: data.totals.exp,
          percentage: data.percentage,
        };

      },
    };
  })();
  
  //------------ Module UI (USER INTERFACE) ------------//
  //----------------------------------------------------//
  var uiController = (function() {
    var DOMStrings = {
      inputType: ".add__type",
      inputDescription: ".add__description",
      inputValue: ".add__value",
      inputBtn: ".add__btn",
      incomeContainer: ".income__list",
      expensesContainer: ".expenses__list",
      budgetLabel: ".budget__value",
      budgetIncomeLabel: ".budget__income--value",
      budgetExpensesLabel: ".budget__expenses--value",
      budgetPercentageLabel: ".budget__expenses--percentage",
      container: ".container",
      expensesPercentageLabel: ".item__percentage",
      dateLabel: ".budget__title--month"
    };

    var formatNumber = function (num, type){
      var numSplit, int, dec;
      num = Math.abs(num); //removes the sign of the number ( + or -)
      num = num.toFixed(2); //adds TWO decimal numbers to num (200 = 200.00)
      numSplit = num.split('.'); //split the number, integer and decimals
      int = numSplit[0]; 
      dec = numSplit[1];
      //add a "," simbol for thousands (2,000)
      if (int.length > 3){
        int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      }
      ; // ternary operator, - for exp or + for inc
      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
      for (var i = 0; i < list.length; i++){
        callback(list[i], i);
      };
    };
  
    return {
      getInput: function() {
        return {
          type: document.querySelector(DOMStrings.inputType).value,
          description: document.querySelector(DOMStrings.inputDescription).value,
          value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
        };
      },

      addListItem: function(object, type){
        var html, newHtml, element;
        // create html string with placeholder text
        if (type === 'inc'){
          element = DOMStrings.incomeContainer;
          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else if (type === 'exp'){
          element = DOMStrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        // replace placeholder with real data
        newHtml = html.replace('%id%', object.id);
        newHtml = newHtml.replace('%description%', object.description);
        newHtml = newHtml.replace('%value%', formatNumber(object.value, type));

        // insert HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },

      deleteListItem: function(selectorID){
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
      },

      clearFields: function(){
        var fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
        var fieldsArray = Array.prototype.slice.call(fields);
        fieldsArray.forEach(function(current, index, array){
          current.value = "";
        });
        fieldsArray[0].focus();
        },
        
      displayBudget: function(obj){
        var type;
        obj.budget > 0 ? type = "inc" : type = "exp";
        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.budgetIncomeLabel).textContent = formatNumber(obj.totalInc, "inc");
        document.querySelector(DOMStrings.budgetExpensesLabel).textContent = formatNumber(obj.totalExp, "exp");
       

        if (obj.percentage > 0) {
          document.querySelector(DOMStrings.budgetPercentageLabel).textContent = obj.percentage + "%";
        } else {
          document.querySelector(DOMStrings.budgetPercentageLabel).textContent = "--";
        };
      },
      
      displayPercentages: function(percentages){
        var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
       
        nodeListForEach(fields, function(current, index){
          if (percentages[index] > 0){
          current.textContent = percentages[index] + " %";
          } else {
            current.textContent = "--";
          } 
        });
      },

      displayDate: function(){
        var now, year, month, allMonths;
        now = new Date(); // date object constructor, gives today's date
        month = now.getMonth();
        allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        year = now.getFullYear();
        document.querySelector(DOMStrings.dateLabel).textContent = allMonths[month] + " " + year;
      },
      
      changeColor: function(){
        var fields = document.querySelectorAll(DOMStrings.inputType + "," + DOMStrings.inputDescription + "," + DOMStrings.inputValue);
        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });
        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
      },

      getDOMStrings: function() {
        return DOMStrings;
      }
    };
  })();
  
  //------------ Module Global Controller (INTERACTION BETWEEN MODULES)------------//
  //-------------------------------------------------------------------------------//
  var controller = (function(budgetCtrl, uiCtrl) {
    var setupEventListeners = function() {
      var DOM = uiCtrl.getDOMStrings();
  
      document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
  
      document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
        }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
      document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeColor);
    };

    var updateBudget = function(){        
      // Calculate budget
      budgetCtrl.calculateBudget();
      // Return the budget
      var budget = budgetCtrl.getBudget();  
      // Display the budget on the general UI 
      uiCtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
      // calculate percentages
      budgetCtrl.calculatePercentages();
      // read percentages from budget controller
      var percentages = budgetCtrl.getPercentages();
      // update percentages in the UI
      uiCtrl.displayPercentages(percentages);
    };
  
    var ctrlAddItem = function() {
      var input, newItem;
      //  Get inuput values
      input = uiCtrl.getInput(); 
      if (input.description !== "" && !isNaN(input.value) && input.value > 0){
      // Add the new item to the data structure
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);  
      // Add the new item to the UI
      uiCtrl.addListItem(newItem, input.type);
      // Clear the fields
      uiCtrl.clearFields();
      // Calculate and update budget
      updateBudget();
      // calculate and update percentages
      updatePercentages();
      }
    };

    var ctrlDeleteItem = function (event) {
      var itemId, splitId, type, ID;
       itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
      if (itemId){
       splitId = itemId.split('-');
       type = splitId[0];
       ID = parseInt(splitId[1]);
       // delete item from data structure
       budgetCtrl.deleteItem(type, ID);
       // delete item from UI
       uiCtrl.deleteListItem(itemId);
       // update the budget
       updateBudget();
       // update the percentages
       updatePercentages();
      }

    };
  
    return {
      init: function() {
        setupEventListeners();
        uiCtrl.displayDate();
        uiCtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage: -1,
        });
      }
    };
  })(BudgetController, uiController);
  
  controller.init();