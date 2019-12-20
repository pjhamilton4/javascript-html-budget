var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems:{
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
            var newItem;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else{
                ID = 0;
            }

            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            //data.totals[type] += val;
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            //data.allItems[type][id];
            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
            
    }
})();

var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(number, type){
        // + or - before number
        // two decimal places
        //comma on thousands

        var numSplit, int, dec;

        number = Math.abs(number);
        number = number.toFixed(2);
        numSplit = number.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3) ;
        }

        dec = numSplit[1];

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;
    }

    var nodeListForeach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value, //Will be "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            // CREATE HTML element with STRING
            if( type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // REPLACE TEXT WITH ACTUAL DATA
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // INSERT HTML INTO THE DOM
            var expneses = document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteItem: function(selectorID){
            var element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj){

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, type);

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            var fields;
            fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForeach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
                
            });
        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();

            months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];

            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' + 
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputValue);

            nodeListForeach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();

var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e){
            if(e.keyCode === 13 || e.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        budgetCtrl.calculateBudget();

        var budget = budgetCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // CALC PERCENTS
        budgetCtrl.calculatePercentages();

        // READ PERCENTS FROM CONTROLLER
        var percs = budgetCtrl.getPercentages();
        
        // UPDATE USER INTERFACE WITH NEW %
        UICtrl.displayPercentages(percs);
    }

    var ctrlAddItem = function(){
        var input, newItem;

        // GET FILED INPUT
        input = UICtrl.getInput();
        // ADD ITEM TO BUDGET CONTROLLER

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // ADD ITEM TO THE UI
            UICtrl.addListItem(newItem, input.type);

            // CLEAR FIELDS
            UICtrl.clearFields();

            // CALC THE BUDGET
            updateBudget();

            // UPDATE PERCENTS
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event){
        var itemID, type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            console.log(splitID);
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //remote item from datascruct
            budgetCtrl.deleteItem(type, ID);
            //delete items from UI
            UICtrl.deleteItem(itemID);

            //update totals
            updateBudget();

            // UPDATE PERCENTS
            updatePercentages();
        }
        
    };

    return {
        init: function(){
            console.log('Application has started.');
            setupEventListeners();
            UICtrl.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0});
            UICtrl.displayMonth();
        }
    }
})(budgetController, UIController);

controller.init();