// (function() {
//   var form = document.getElementById("mad_mimi_signup_form"),
//       submit = document.getElementById("webform_submit_button"),
//       email = /.+@.+\..+/;
      
//   form.onsubmit = function(event) {
//     var isValid = validate();
//     if(!isValid) {
//       for(var i = 0; i < form.elements.length; ++i) {
//         var input = form.elements[i];
//         if(input.className.indexOf("required") >= 0) {
//           input.onchange = validate;
//         }
//       }
//       return false;
//     }
//     if(form.getAttribute("target") != "_blank") {
//       form.className = "mimi_submitting";
//       submit.value = submit.getAttribute("data-submitting-text");    
//       submit.disabled = true;
//       submit.className = "disabled";
//     }

//     setTimeout(function() {
//       for(var i = 0; i < form.getElementsByTagName("input").length; ++i) {
//         var input = form.getElementsByTagName("input")[i];
//         if(input.getAttribute("type") == "text") {
//           input.value = "";
//         }
//         if(input.id == "signup_email") {
//           input.placeholder = "you@example.com";
//         } else {
//           input.placeholder = "";
//         }
//       }
//     }, 3000);
//   };
  
//   function validate() {
//     var isValid = true;
    
//     for(var i = 0; i < form.elements.length; ++i) {
//       var input = form.elements[i],
//           allDivs = input.parentNode.getElementsByTagName("div");

//       if(input.className.indexOf("required") >= 0) {
//         if(input.id == "signup_email") {
//           if(!email.test(input.value)) {
//             emailErrorMessage(input, allDivs);
//             isValid = false;
//           } else {
//             removeErrorMessage(input, allDivs);
//           }
//         } else {
//           if((input.type == "checkbox" && !input.checked) || input.value == "" || input.value == "-1") {
//             fieldErrorMessage(input, allDivs);
//             isValid = false;
//           } else {
//             removeErrorMessage(input, allDivs);
//           }
//         }
//       }
//     }
    
//     form.className = isValid ? "" : "mimi_invalid";
//     submit.value = isValid ? submit.getAttribute("data-default-text") : submit.getAttribute("data-invalid-text");
//     submit.disabled = !isValid;
//     submit.className = isValid ? "submit" : "disabled";
    
//     return isValid;
//   }

//   function emailErrorMessage(input, allDivs) {
//     if(input.getAttribute("data-webform-type") == "iframe") {
//       input.className = "required invalid";
//       input.placeholder = input.getAttribute("data-required-message") || "This field is required";
//     } else {
//       allDivs[0].innerHTML = input.getAttribute("data-invalid-message") || "This field is invalid";
//     }
//   }

//   function fieldErrorMessage(input, allDivs) {
//     if(input.getAttribute("data-webform-type") == "iframe") {
//       input.className = "required invalid";
//       input.placeholder = input.getAttribute("data-required-message") || "This field is required";
//     } else {
//       for(var i = 0; i < allDivs.length; ++i) {
//         var element = allDivs[i];
//         if(element.className.indexOf("mimi_field_feedback") >= 0) {
//           return element.innerHTML = input.getAttribute("data-required-message") || "This field is required";
//         }
//       }
//     }
//   }

//   function removeErrorMessage(input, allDivs) {
//     if(input.getAttribute("data-webform-type") == "iframe") {
//       input.className = "required";
//     }

//     for(var i = 0; i < allDivs.length; ++i) {
//       var element = allDivs[i];
//       if(element.className.indexOf("mimi_field_feedback") >= 0) {
//         return element.innerHTML = "";
//       }
//     }
//   }
// })();