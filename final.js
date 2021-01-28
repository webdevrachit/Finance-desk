//controls UI 
var UIController = (function(){
    var DOMStrings = {
        type:'#options',
        amount: '#amount',
        desc: '#description',
        addButton: '#addBtn',
        balanceAmt: '#balance',
        incomeAmt: '#income',
        expenseAmt: '#expense',
        incomeDisplay: '.display-income-list',
        expenseDisplay: '.display-expense-list',
        container: '.container',
        date: '.date'
    };
    return{
        getInputValues:function(){
            return{
                type: document.querySelector(DOMStrings.type).value,
                value: parseInt(document.querySelector(DOMStrings.amount).value),
                desc: document.querySelector(DOMStrings.desc).value
            }
        },

        displayItem: function(newItem , type){
            var html , newHtml, displayElement;

            if(type === 'inc'){
                displayElement = DOMStrings.incomeDisplay;
                html = '<li class="income-list" id="inc-%id%"><h3 id="income-name">%desc%</h3><p>₹%value%</p><button class="btn"><i class="fas fa-trash-alt"></i></button>';
            }  
            else if(type === 'exp'){
                displayElement = DOMStrings.expenseDisplay;
                html = '<li class="expense-list" id="exp-%id%"><h3 id="expense-name">%desc%</h3><p>₹%value%</p><button class="btn"><i class="fas fa-trash-alt"></i></button>';
            }

            newHtml = html.replace('%id%' ,newItem.id);
            newHtml = newHtml.replace('%desc%' , newItem.description);
            newHtml = newHtml.replace('%value%', newItem.amount);

            document.querySelector(displayElement).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields:function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.amount +','+ DOMStrings.desc);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current){
                return current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget:function(totals){

            document.querySelector(DOMStrings.incomeAmt).textContent = '₹ ' + totals.income_total;
            document.querySelector(DOMStrings.expenseAmt).textContent = '₹ ' + totals.expense_total;
            document.querySelector(DOMStrings.balanceAmt).textContent = '₹ ' + totals.balance_total;
        },
        deleteListItem: function(selectionID){
            var element;
            element = document.getElementById(selectionID);
            element.parentNode.removeChild(element);
        },

        displayDate: function(){
            var today , final_date;
            today = new Date();
            final_date = today.toLocaleDateString('en-us',{
                year:'numeric',
                month:'long',
                day: 'numeric'
            });

            return document.querySelector(DOMStrings.date).textContent = final_date;
        },
        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();

//controls Budget and Data
var budgetController = (function(){
    var Income = function(id , amount , description){
        this.id = id;
        this.amount = amount;
        this.description = description;
    };

    var Expense = function(id , amount , description){
        this.id = id;
        this.amount = amount;
        this.description = description;
    };

    var dataStructure = {
        allItems:{
            inc:[],
            exp:[]
        },
        totals:{
            inc:0,
            exp:0
        },
        balance:0
    };

    var calculateTotal = function(type){

        var sum = 0;

        dataStructure.allItems[type].map(function(current){
            sum += current.amount;
        });
        dataStructure.totals[type] = sum;

    };

    return{
        addItem: function(type , val , desc){
            var ID, newItem;

            if(dataStructure.allItems[type].length > 0){
                ID = dataStructure.allItems[type][dataStructure.allItems[type].length - 1].id + 1
            }
            else{
                ID = 0;
            }

            if(type === 'inc'){
                newItem = new Income(ID , val , desc);
            }
            else if(type === 'exp'){
                newItem = new Expense(ID , val , desc);
            }

            dataStructure.allItems[type].push(newItem);
            return newItem;
        },

        calculateBudget:function(){

            calculateTotal('inc');
            calculateTotal('exp');

            dataStructure.balance = dataStructure.totals['inc'] - dataStructure.totals['exp'];
        },

        deleteItem: function(type , id){
            var allIds , index;

            allIds = dataStructure.allItems[type].map(function(current){
                return current.id;
            });

            index = allIds.indexOf(id);

            if(index !== -1){
                dataStructure.allItems[type].splice(index , 1);
            }
        },

        getTotals: function(){
            return{
                income_total:dataStructure.totals['inc'],
                expense_total:dataStructure.totals['exp'],
                balance_total: dataStructure.balance
            }
        },
        
        testing:function(){
            console.log(dataStructure);
        }
    }
})();

//controls UI and Budget
var globalAppController = (function(budget , UI){

    var eventListeners = function(){

        var DOM = UI.getDOMStrings();

        document.querySelector(DOM.balanceAmt).textContent = '₹0';
        document.querySelector(DOM.incomeAmt).textContent = '₹0';
        document.querySelector(DOM.expenseAmt).textContent = '₹0';

        document.querySelector(DOM.addButton).addEventListener('click' , ctrlAddItem);
        document.addEventListener('keypress' , function(e){
            if(e.keyCode === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click' , ctrlDeleteItem);
    };

    var updateData = function(){
        var totals;

        budget.calculateBudget();

        totals = budget.getTotals();

        UI.displayBudget(totals);

    };

    var ctrlAddItem = function(){
        var input;

        //get inputs
        input = UI.getInputValues();

        if(input.desc !== "" && !isNaN(input.value) && input.value > 0){

            //create a function object using function constructor
            var newItem = budget.addItem(input.type, input.value, input.desc);

            UI.displayItem(newItem , input.type);

            UI.clearFields();

            updateData();

        }
    };

    var ctrlDeleteItem = function(event){
        var itemID , splitID , type , id;

        itemID = event.target.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }

        budget.deleteItem(type , id);

        UI.deleteListItem(itemID);

        updateData();
    };

    return{
        init: function(){
            eventListeners();
            UI.displayDate();
        }
    }
})(budgetController , UIController);

globalAppController.init();
