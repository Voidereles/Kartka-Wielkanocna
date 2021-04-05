document.querySelectorAll('input').forEach(element => {
    element.addEventListener('focus', () => {
        element.parentElement.classList.add('focused');
    })
});

let inputValue;
document.querySelectorAll('input').forEach(element => {
    element.addEventListener('focusout', () => {
        inputValue = element.value;
        if (inputValue == "") {
            element.parentElement.classList.remove('focused');
        }
    })
});