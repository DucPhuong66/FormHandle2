function Validator(formSelector, options) {


    if (!options) {
        options = {};
    }

    var formRules = {};

    /*
        Rules for validate input
        - if have errors return 'error message'
        - if haven't errors return 'undefined'
    */
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function(min) {
             return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
             }
        },
        max: function(max) {
            return function(value) {
               return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`
            }
       }
    }



    var formElement = document.querySelector(formSelector); 
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rule]')
        for (var input of inputs) { 
            var rules = input.getAttribute('rule').split('|');
            for (var rule of rules) { 

                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            // lắng nghe sự kiện để validate (blur, change)
            input.onblur = handleValidate;
            input.oninput = handleClearError;

            function handleValidate(event) {
                var rules = formRules[event.target.name]
                var errorMessage;

                for (var rule of rules) { 
                    errorMessage = rule(event.target.name)
                    if (errorMessage) break;
                }

                var warningOn = event.target.closest('.form-group')
                // Nếu có lỗi thì báo lỗi tới UI
                if (errorMessage) {
                    warningOn.querySelector('.form-message').innerHTML = errorMessage;
                    warningOn.classList.add('invalid');
                    
                } 
                return !errorMessage;

            }

            // Clear error messages
            function handleClearError (event) {
                var warningOn = event.target.closest('.form-group')

                if (warningOn.classList.contains('invalid')) {
                    warningOn.classList.remove('invalid')
                    warningOn.querySelector('.form-message').innerHTML = ''

                }
            }


        }
        console.log(formRules);
    }

    // Xử lý hành vi form submit
    formElement.onsubmit = function (event) {
        event.preventDefault()
        var isValid = true;

        var inputs = formElement.querySelectorAll('[name][rule]')
        for (var input of inputs) { 
           if (!handleValidate({target: input})) {
             isValid = false
           }
    }


    // Khi không có lỗi thì submit form
    if (isValid) {

        if (typeof options.onSubmit === 'function') {
            
        var enableInputs = formElement.querySelectorAll('[name]')
        var formValues = Array.from(enableInputs).reduce(function(values, input) {
            switch(input.type) {
                case 'radio':
                    values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                    break;
                case 'checkbox':
                    if(!input.matches(':checked')) {
                        values[input.name] = "";
                        return values;
                    }

                    if(!Array.isArray(values[input.name])) {
                        values[input.name] = []
                    }
                    values[input.name].push(input.value);
                    break; 
                default:
                    values[input.name] = input.value

            }
            return values;
          }, {})

            // Gọi lại hàm onSubmit và trả về data
            options.onSubmit(formValues)
        } else {
            formElement.submit(formValues); 
        }
        
    }

    }
}